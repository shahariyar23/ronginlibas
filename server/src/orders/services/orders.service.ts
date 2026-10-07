import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { OrderStatus, PaymentMethod, Prisma } from '@prisma/client';
import PDFDocument from 'pdfkit';
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { PrismaService } from '../../prisma/prisma.service.js';
import { SettingsService } from '../../settings/services/settings.service.js';
import { CreateOrderDto } from '../dto/create-order.dto.js';
import { UpdateOrderStatusDto } from '../dto/update-order-status.dto.js';
import { OrderQueryDto } from '../dto/order-query.dto.js';
import { PaginatedResult } from '../../common/dto/pagination-query.dto.js';

const orderItemCustomerSelect = {
  id: true,
  productId: true,
  variantId: true,
  productName: true,
  variantName: true,
  sku: true,
  unitPrice: true,
  quantity: true,
  subtotal: true,
  size: true,
  color: true,
  discountAmount: true,
  createdAt: true,
} satisfies Prisma.OrderItemSelect;

const customerOrderSelect = {
  id: true,
  orderNumber: true,
  status: true,
  paymentStatus: true,
  paymentMethod: true,
  subtotal: true,
  discountAmount: true,
  deliveryCharge: true,
  totalAmount: true,
  shippingAddress: true,
  customerNotes: true,
  courierName: true,
  trackingNumber: true,
  trackingUrl: true,
  estimatedDelivery: true,
  createdAt: true,
  updatedAt: true,
  items: { select: orderItemCustomerSelect },
} satisfies Prisma.OrderSelect;

const customerOrderDetailSelect = {
  ...customerOrderSelect,
  trackingEvents: {
    where: { customerVisible: true },
    select: { status: true, description: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  },
} satisfies Prisma.OrderSelect;

const orderAccessSelect = {
  ...customerOrderDetailSelect,
  customerId: true,
  guestPhone: true,
  trackingTokenHash: true,
} satisfies Prisma.OrderSelect;

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly settingsService: SettingsService,
  ) {}

  async findAll(query: OrderQueryDto): Promise<PaginatedResult<any>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.OrderWhereInput = {};
    if (query.status && query.status !== 'ALL') where.status = query.status;
    if (query.paymentMethod && query.paymentMethod !== 'ALL') {
      where.paymentMethod = query.paymentMethod;
    }
    if (query.search) {
      where.OR = [
        { orderNumber: { contains: query.search, mode: 'insensitive' } },
        { guestName: { contains: query.search, mode: 'insensitive' } },
        { guestPhone: { contains: query.search } },
        { customer: { is: { firstName: { contains: query.search, mode: 'insensitive' } } } },
      ];
    }
    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          orderNumber: true,
          customerId: true,
          guestName: true,
          guestPhone: true,
          status: true,
          paymentStatus: true,
          paymentMethod: true,
          subtotal: true,
          discountAmount: true,
          deliveryCharge: true,
          totalAmount: true,
          createdAt: true,
          updatedAt: true,
          customer: { select: { firstName: true, lastName: true, phone: true } },
          items: {
            select: {
              id: true,
              productName: true,
              variantName: true,
              quantity: true,
              unitPrice: true,
              subtotal: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where }),
    ]);
    return { items, page, limit, total, totalPages: Math.ceil(total / limit) || 1 };
  }

  async findById(id: string) {
    const order = await this.prisma.order.findFirst({
      where: { OR: [{ id }, { orderNumber: id }, { orderNumber: `#${id.replace(/^#/, '')}` }] },
      include: {
        customer: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
        items: { include: { product: true, variant: true } },
      },
    });
    if (!order) throw new NotFoundException(`Order not found: ${id}`);
    const { trackingTokenHash: _trackingTokenHash, ...safeOrder } = order;
    return safeOrder;
  }

  async findCustomerOrders(customerId: string, query: OrderQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.OrderWhereInput = { customerId };
    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        select: customerOrderSelect,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where }),
    ]);
    return { items, page, limit, total, totalPages: Math.ceil(total / limit) || 1 };
  }

  async findCustomerOrder(customerId: string, orderNumber: string) {
    const order = await this.prisma.order.findFirst({
      where: { customerId, orderNumber: this.normalizeOrderNumber(orderNumber) },
      select: customerOrderDetailSelect,
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto) {
    return this.prisma.$transaction(async (transaction) => {
      const order = await transaction.order.findFirst({
        where: { OR: [{ id }, { orderNumber: id }, { orderNumber: this.normalizeOrderNumber(id) }] },
        include: { items: { select: { variantId: true, quantity: true } } },
      });
      if (!order) throw new NotFoundException(`Order not found: ${id}`);
      if (order.status === 'CANCELLED' && dto.status !== 'CANCELLED') {
        throw new BadRequestException('A cancelled order cannot be reopened');
      }
      if (
        dto.status === 'CANCELLED' &&
        ['SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.status)
      ) {
        throw new BadRequestException('An order cannot be cancelled after shipment');
      }

      if (order.status !== 'CANCELLED' && dto.status === 'CANCELLED') {
        for (const item of order.items) {
          const variant = await transaction.productVariant.findUnique({
            where: { id: item.variantId },
            select: { id: true, stock: true },
          });
          if (!variant) {
            throw new NotFoundException(`Order variant not found: ${item.variantId}`);
          }
          const newStock = variant.stock + item.quantity;
          const restored = await transaction.productVariant.updateMany({
            where: { id: variant.id, stock: variant.stock },
            data: { stock: newStock },
          });
          if (!restored.count) {
            throw new BadRequestException('Inventory changed while cancelling; retry the status update');
          }
          await transaction.inventoryTransaction.create({
            data: {
              variantId: variant.id,
              quantityChange: item.quantity,
              previousStock: variant.stock,
              newStock,
              type: 'RETURN',
              note: `Order cancellation ${order.orderNumber}`,
            },
          });
        }
      }

      const updated = await transaction.order.update({
        where: { id: order.id },
        data: { status: dto.status as OrderStatus, adminNotes: dto.adminNotes },
      });
      await transaction.orderTrackingEvent.create({
        data: {
          orderId: order.id,
          status: updated.status,
          description: dto.adminNotes,
        },
      });
      return updated;
    });
  }

  async create(dto: CreateOrderDto, customerId?: string) {
    if (!dto.items.length) throw new BadRequestException('Order must contain at least one item');
    if (!customerId && (!dto.guestName?.trim() || !dto.shippingAddress.phone)) {
      throw new BadRequestException('Guest checkout requires a name and contact phone');
    }
    const paymentMethod = dto.paymentMethod ?? 'COD';
    if (paymentMethod !== 'COD') {
      throw new ServiceUnavailableException('Online payment methods are not currently available');
    }
    const variantIds = dto.items.map((item) => item.variantId);
    if (new Set(variantIds).size !== variantIds.length) {
      throw new BadRequestException('Each product variant must appear only once in an order');
    }

    const settings = await this.settingsService.getPublicSettings();
    const freeDeliveryThreshold = Number(settings.freeDeliveryThreshold);
    const dhakaDeliveryCharge = Number(settings.dhakaDeliveryCharge);
    const outsideDhakaDeliveryCharge = Number(settings.outsideDhakaDeliveryCharge);
    const trackingToken = customerId ? undefined : randomBytes(32).toString('base64url');
    const orderNumber = `#RL${Date.now().toString().slice(-8)}${randomBytes(2).toString('hex').toUpperCase()}`;
    const createdOrder = await this.prisma.$transaction(async (transaction) => {
      const orderItems = [];
      let subtotal = 0;
      for (const item of dto.items) {
        const variant = await transaction.productVariant.findFirst({
          where: {
            id: item.variantId,
            isActive: true,
            product: { isActive: true },
          },
          include: { product: true },
        });
        if (!variant) throw new BadRequestException('A selected product variant is unavailable');
        if (item.productId !== variant.productId) {
          throw new BadRequestException('The selected variant does not belong to the supplied product');
        }
        if (variant.stock < item.quantity) {
          throw new BadRequestException(`${variant.product.name} no longer has enough stock`);
        }
        const price = variant.priceOverride
          ? Number(variant.priceOverride)
          : Number(variant.product.price);
        const lineTotal = price * item.quantity;
        subtotal += lineTotal;
        const reserved = await transaction.productVariant.updateMany({
          where: { id: variant.id, isActive: true, stock: variant.stock },
          data: { stock: { decrement: item.quantity } },
        });
        if (!reserved.count) {
          throw new BadRequestException(`${variant.product.name} no longer has enough stock`);
        }
        await transaction.inventoryTransaction.create({
          data: {
            variantId: variant.id,
            quantityChange: -item.quantity,
            previousStock: variant.stock,
            newStock: variant.stock - item.quantity,
            type: 'SALE',
            note: `Customer order ${orderNumber}`,
          },
        });
        orderItems.push({
          productId: variant.productId,
          variantId: variant.id,
          productName: variant.product.name,
          variantName: `${variant.color} - Size ${variant.sizeLabel || variant.size}`,
          sku: variant.sku,
          unitPrice: price,
          quantity: item.quantity,
          subtotal: lineTotal,
          size: variant.sizeLabel || variant.size,
          color: variant.color,
        });
      }

      let discountAmount = 0;
      let couponId: string | undefined;
      if (dto.couponCode) {
        const coupon = await transaction.coupon.findUnique({
          where: { code: dto.couponCode.trim().toUpperCase() },
        });
        const now = new Date();
        if (
          !coupon ||
          !coupon.isActive ||
          now < coupon.startDate ||
          now > coupon.expiryDate ||
          (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) ||
          subtotal < Number(coupon.minimumOrderAmount)
        ) {
          throw new BadRequestException('Coupon is invalid or does not apply to this order');
        }
        discountAmount =
          coupon.type === 'PERCENTAGE'
            ? (subtotal * Number(coupon.value)) / 100
            : Number(coupon.value);
        if (coupon.maximumDiscount !== null) {
          discountAmount = Math.min(discountAmount, Number(coupon.maximumDiscount));
        }
        discountAmount = Math.min(discountAmount, subtotal);
        couponId = coupon.id;
        const update = await transaction.coupon.updateMany({
          where: {
            id: coupon.id,
            isActive: true,
            ...(coupon.usageLimit !== null ? { usageCount: { lt: coupon.usageLimit } } : {}),
          },
          data: { usageCount: { increment: 1 } },
        });
        if (!update.count) throw new BadRequestException('Coupon redemption limit has been reached');
      }

      const isDhaka = dto.shippingAddress.division.toLowerCase().includes('dhaka');
      const deliveryCharge =
        subtotal - discountAmount >= freeDeliveryThreshold
          ? 0
          : isDhaka
            ? dhakaDeliveryCharge
            : outsideDhakaDeliveryCharge;
      const order = await transaction.order.create({
        data: {
          orderNumber,
          customerId: customerId ?? null,
          guestName: customerId ? null : dto.guestName?.trim(),
          guestEmail: customerId ? null : dto.guestEmail?.toLowerCase(),
          guestPhone: customerId ? null : dto.shippingAddress.phone,
          trackingTokenHash: trackingToken ? hashToken(trackingToken) : null,
          status: 'PENDING',
          paymentStatus: 'PENDING',
          paymentMethod: paymentMethod as PaymentMethod,
          subtotal,
          discountAmount,
          deliveryCharge,
          totalAmount: subtotal - discountAmount + deliveryCharge,
          shippingAddress: {
            addressLine1: dto.shippingAddress.addressLine1,
            city: dto.shippingAddress.city,
            division: dto.shippingAddress.division,
            phone: dto.shippingAddress.phone,
            ...(dto.shippingAddress.addressLine2 !== undefined
              ? { addressLine2: dto.shippingAddress.addressLine2 }
              : {}),
            ...(dto.shippingAddress.fullName !== undefined
              ? { fullName: dto.shippingAddress.fullName }
              : {}),
            ...(dto.shippingAddress.email !== undefined
              ? { email: dto.shippingAddress.email }
              : {}),
            ...(dto.shippingAddress.area !== undefined
              ? { area: dto.shippingAddress.area }
              : {}),
            ...(dto.shippingAddress.postalCode !== undefined
              ? { postalCode: dto.shippingAddress.postalCode }
              : {}),
            ...(dto.shippingAddress.deliveryInstructions !== undefined
              ? { deliveryInstructions: dto.shippingAddress.deliveryInstructions }
              : {}),
          } satisfies Prisma.InputJsonObject,
          customerNotes: dto.customerNotes,
          items: { create: orderItems },
          trackingEvents: {
            create: { status: 'PENDING', description: 'Order received' },
          },
        },
        select: customerOrderDetailSelect,
      });
      return { order, couponId };
    });
    return {
      id: createdOrder.order.id,
      orderNumber: createdOrder.order.orderNumber,
      status: createdOrder.order.status,
      paymentStatus: createdOrder.order.paymentStatus,
      paymentMethod: createdOrder.order.paymentMethod,
      subtotal: createdOrder.order.subtotal,
      discountAmount: createdOrder.order.discountAmount,
      deliveryCharge: createdOrder.order.deliveryCharge,
      totalAmount: createdOrder.order.totalAmount,
      shippingAddress: createdOrder.order.shippingAddress,
      customerNotes: createdOrder.order.customerNotes,
      courierName: createdOrder.order.courierName,
      trackingNumber: createdOrder.order.trackingNumber,
      trackingUrl: createdOrder.order.trackingUrl,
      estimatedDelivery: createdOrder.order.estimatedDelivery,
      createdAt: createdOrder.order.createdAt,
      updatedAt: createdOrder.order.updatedAt,
      items: createdOrder.order.items,
      trackingEvents: createdOrder.order.trackingEvents,
      ...(trackingToken ? { guestTrackingToken: trackingToken } : {}),
    };
  }

  async findOrderForAccess(
    orderNumber: string,
    customerId?: string,
    phone?: string,
    trackingToken?: string,
  ) {
    const order = await this.prisma.order.findUnique({
      where: { orderNumber: this.normalizeOrderNumber(orderNumber) },
      select: orderAccessSelect,
    });
    if (!order) throw new NotFoundException('Order not found');
    if (customerId && order.customerId === customerId) return order;
    if (order.customerId !== null || !phone || !trackingToken) {
      throw new ForbiddenException('Order access could not be verified');
    }
    const phoneMatches = normalizePhone(order.guestPhone) === normalizePhone(phone);
    const tokenMatches = safeHashMatch(order.trackingTokenHash, trackingToken);
    if (!phoneMatches || !tokenMatches) throw new ForbiddenException('Order access could not be verified');
    return order;
  }

  async getOrderForCustomerAccess(
    orderNumber: string,
    customerId?: string,
    phone?: string,
    trackingToken?: string,
  ) {
    const order = await this.findOrderForAccess(orderNumber, customerId, phone, trackingToken);
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      subtotal: order.subtotal,
      discountAmount: order.discountAmount,
      deliveryCharge: order.deliveryCharge,
      totalAmount: order.totalAmount,
      shippingAddress: order.shippingAddress,
      customerNotes: order.customerNotes,
      courierName: order.courierName,
      trackingNumber: order.trackingNumber,
      trackingUrl: order.trackingUrl,
      estimatedDelivery: order.estimatedDelivery,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      items: order.items,
      trackingEvents: order.trackingEvents,
    };
  }

  async getTracking(
    orderNumber: string,
    customerId?: string,
    phone?: string,
    trackingToken?: string,
  ) {
    const order = await this.findOrderForAccess(orderNumber, customerId, phone, trackingToken);
    return {
      orderNumber: order.orderNumber,
      status: order.status,
      courierName: order.courierName,
      trackingNumber: order.trackingNumber,
      trackingUrl: order.trackingUrl,
      estimatedDelivery: order.estimatedDelivery,
      trackingEvents: order.trackingEvents,
    };
  }

  async generateInvoice(
    orderNumber: string,
    customerId?: string,
    phone?: string,
    trackingToken?: string,
  ): Promise<Buffer> {
    const order = await this.findOrderForAccess(orderNumber, customerId, phone, trackingToken);
    return new Promise<Buffer>((resolve, reject) => {
      const document = new PDFDocument({ margin: 48 });
      const chunks: Buffer[] = [];
      document.on('data', (chunk: Buffer) => chunks.push(chunk));
      document.on('end', () => resolve(Buffer.concat(chunks)));
      document.on('error', reject);
      document.fontSize(20).text('Rongin Libas', { align: 'center' });
      document.moveDown().fontSize(14).text(`Invoice ${order.orderNumber}`);
      document.fontSize(10).text(`Date: ${order.createdAt.toLocaleDateString()}`);
      document.moveDown().text(`Status: ${order.status}`);
      for (const item of order.items) {
        document.text(
          `${item.productName} | ${item.variantName} | Qty ${item.quantity} | BDT ${Number(item.subtotal)}`,
        );
      }
      document.moveDown().text(`Subtotal: BDT ${Number(order.subtotal)}`);
      document.text(`Delivery: BDT ${Number(order.deliveryCharge)}`);
      document.text(`Total: BDT ${Number(order.totalAmount)}`);
      document.end();
    });
  }

  private normalizeOrderNumber(orderNumber: string) {
    const normalized = orderNumber.trim().toUpperCase();
    return normalized.startsWith('#') ? normalized : `#${normalized}`;
  }
}

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

function safeHashMatch(storedHash: string | null, token: string) {
  if (!storedHash) return false;
  const provided = Buffer.from(hashToken(token), 'hex');
  const stored = Buffer.from(storedHash, 'hex');
  return provided.length === stored.length && timingSafeEqual(provided, stored);
}

function normalizePhone(phone: string | null) {
  return phone?.replace(/\D/g, '').replace(/^880/, '0') ?? '';
}
