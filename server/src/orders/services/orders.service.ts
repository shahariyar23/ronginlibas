import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  Optional,
  ServiceUnavailableException,
} from '@nestjs/common';
import { OrderStatus, PaymentMethod, PaymentStatus, Prisma } from '@prisma/client';
import PDFDocument from 'pdfkit';
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaService } from '../../prisma/prisma.service.js';
import { SettingsService } from '../../settings/services/settings.service.js';
import { MailService } from '../../mail/mail.service.js';
import { Ga4MeasurementProtocolService } from '../../analytics/services/ga4-measurement-protocol.service.js';
import { CreateOrderDto, ShippingAddressDto } from '../dto/create-order.dto.js';
import { CreateAdminOrderDto } from '../dto/create-admin-order.dto.js';
import { UpdateOrderStatusDto } from '../dto/update-order-status.dto.js';
import { OrderQueryDto } from '../dto/order-query.dto.js';
import { PaginatedResult } from '../../common/dto/pagination-query.dto.js';
import type { AdminAuditActor } from '../../audit/audit.service.js';
import {
  canMarkOrderDelivered,
  canProcessReturn,
  normalizePathaoStatus,
  getCustomerSafeCourierStatus,
} from '../../pathao/status/courier-status.types.js';

function roundCurrency(val: number): number {
  return Math.round((val + Number.EPSILON) * 100) / 100;
}

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
  productImage: true,
  createdAt: true,
  product: {
    select: {
      id: true,
      name: true,
      slug: true,
      images: {
        take: 1,
        orderBy: { sortOrder: 'asc' },
        select: { url: true },
      },
    },
  },
} satisfies Prisma.OrderItemSelect;

const customerOrderSelect = {
  id: true,
  orderNumber: true,
  status: true,
  paymentStatus: true,
  paymentMethod: true,
  subtotal: true,
  discountAmount: true,
  manualDiscountAmount: true,
  deliveryCharge: true,
  totalAmount: true,
  paidAmount: true,
  paymentReference: true,
  shippingAddress: true,
  customerNotes: true,
  courierName: true,
  courierProvider: true,
  courierStatus: true,
  courierLastSyncedAt: true,
  trackingNumber: true,
  trackingUrl: true,
  estimatedDelivery: true,
  createdAt: true,
  updatedAt: true,
  items: { select: orderItemCustomerSelect },
  trackingEvents: {
    where: { customerVisible: true },
    select: { status: true, description: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  },
} satisfies Prisma.OrderSelect;

const customerOrderDetailSelect = {
  ...customerOrderSelect,
} satisfies Prisma.OrderSelect;

const orderAccessSelect = {
  ...customerOrderDetailSelect,
  adminNotes: true,
  customerId: true,
  guestName: true,
  guestEmail: true,
  guestPhone: true,
  trackingTokenHash: true,
  customer: {
    select: {
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
    },
  },
} satisfies Prisma.OrderSelect;

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly settingsService: SettingsService,
    @Optional() private readonly mailService?: MailService,
    @Optional() private readonly ga4Service?: Ga4MeasurementProtocolService,
  ) {}

  async findAll(query: OrderQueryDto): Promise<PaginatedResult<any>> {
    try {
      await this.cancelExpiredUnpaidOrders(2);
    } catch (e: any) {
      this.logger.warn(`Failed to auto-clean expired unpaid orders: ${e?.message}`);
    }
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
          guestEmail: true,
          guestPhone: true,
          status: true,
          paymentStatus: true,
          paymentMethod: true,
          subtotal: true,
          discountAmount: true,
          deliveryCharge: true,
          totalAmount: true,
          shippingAddress: true,
          customerNotes: true,
          adminNotes: true,
          courierName: true,
          courierProvider: true,
          courierConsignmentId: true,
          courierStatus: true,
          courierTrackingUrl: true,
          trackingNumber: true,
          trackingUrl: true,
          estimatedDelivery: true,
          source: true,
          createdById: true,
          createdByName: true,
          paymentReference: true,
          paidAmount: true,
          manualDiscountAmount: true,
          createdAt: true,
          updatedAt: true,
          customer: { select: { firstName: true, lastName: true, email: true, phone: true } },
          payments: {
            select: {
              id: true,
              provider: true,
              providerOrderId: true,
              providerTransactionId: true,
              amount: true,
              currency: true,
              status: true,
              failureReason: true,
              paidAt: true,
              createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
          },
          items: {
            select: {
              id: true,
              productId: true,
              variantId: true,
              productName: true,
              variantName: true,
              sku: true,
              size: true,
              color: true,
              quantity: true,
              unitPrice: true,
              subtotal: true,
              productImage: true,
              product: {
                select: {
                  id: true,
                  name: true,
                  images: {
                    select: { url: true, isPrimary: true },
                    orderBy: { sortOrder: 'asc' },
                  },
                },
              },
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
        items: {
          include: {
            product: {
              include: {
                images: { orderBy: { sortOrder: 'asc' } },
              },
            },
            variant: true,
          },
        },
        payments: {
          orderBy: { createdAt: 'desc' },
        },
        trackingEvents: { orderBy: { createdAt: 'asc' } },
      },
    });
    if (!order) throw new NotFoundException(`Order not found: ${id}`);
    const { trackingTokenHash: _trackingTokenHash, ...safeOrder } = order;
    return safeOrder;
  }

  async findCustomerOrders(customerId: string, query: OrderQueryDto) {
    try {
      // Auto-clean any uncompleted online payment orders for this customer so they never linger as pending orders
      const uncompletedOrders = await this.prisma.order.findMany({
        where: {
          customerId,
          paymentMethod: { in: [PaymentMethod.WAITMARK_PAY, PaymentMethod.UDDOKTAPAY] },
          paymentStatus: { in: [PaymentStatus.PENDING, PaymentStatus.FAILED] },
          status: { not: OrderStatus.CANCELLED },
        },
        include: { items: true },
      });

      for (const uncompleted of uncompletedOrders) {
        try {
          await this.prisma.$transaction(async (tx) => {
            await this.releaseOrderStockInTx(
              tx,
              uncompleted,
              'Customer checked orders without completed online payment - stock released:',
            );
            await tx.order.delete({ where: { id: uncompleted.id } });
          });
          this.logger.log(
            `[Orders] Auto-cleaned abandoned online payment order ${uncompleted.orderNumber} for customer ${customerId}`,
          );
        } catch (cleanErr: any) {
          this.logger.warn(
            `Failed to auto-clean uncompleted order ${uncompleted.orderNumber}: ${cleanErr?.message}`,
          );
        }
      }

      await this.cancelExpiredUnpaidOrders(2);
    } catch (e: any) {
      this.logger.warn(`Failed to auto-clean expired unpaid orders: ${e?.message}`);
    }
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.OrderWhereInput = {
      customerId,
      NOT: {
        AND: [
          { paymentMethod: { in: [PaymentMethod.WAITMARK_PAY, PaymentMethod.UDDOKTAPAY] } },
          { paymentStatus: { in: [PaymentStatus.PENDING, PaymentStatus.FAILED] } },
        ],
      },
    };
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

  /**
   * Restores reserved inventory stock within a Prisma transaction client.
   */
  public async releaseOrderStockInTx(
    transaction: any,
    order: { orderNumber: string; items: Array<{ variantId?: string | null; quantity: number }> },
    reason: string = 'Order cancellation',
  ) {
    for (const item of order.items) {
      if (!item.variantId) continue;
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
        throw new BadRequestException('Inventory changed while releasing reserved stock; retry the status update');
      }
      await transaction.inventoryTransaction.create({
        data: {
          variantId: variant.id,
          quantityChange: item.quantity,
          previousStock: variant.stock,
          newStock,
          type: 'RETURN',
          note: `${reason} ${order.orderNumber}`,
        },
      });
    }
  }

  /**
   * Releases reserved stock and deletes unpaid online orders exceeding the timeout window.
   */
  async cancelExpiredUnpaidOrders(timeoutMinutes = 2): Promise<number> {
    const cutoff = new Date(Date.now() - timeoutMinutes * 60 * 1000);
    const expiredOrders = await this.prisma.order.findMany({
      where: {
        paymentMethod: { in: [PaymentMethod.WAITMARK_PAY, PaymentMethod.UDDOKTAPAY] },
        status: { not: OrderStatus.CANCELLED },
        paymentStatus: { in: [PaymentStatus.PENDING, PaymentStatus.FAILED] },
        createdAt: { lt: cutoff },
      },
      include: {
        items: true,
      },
    });

    let cancelledCount = 0;
    for (const order of expiredOrders) {
      try {
        await this.prisma.$transaction(async (tx) => {
          await this.releaseOrderStockInTx(
            tx,
            order,
            `Payment timeout (${timeoutMinutes}m) stock release:`,
          );

          await tx.order.delete({
            where: { id: order.id },
          });
        });
        cancelledCount++;
        this.logger.log(
          `[Inventory] Released reserved stock and deleted expired unpaid order ${order.orderNumber}`,
        );
      } catch (err: any) {
        this.logger.error(
          `Failed to release expired order ${order.orderNumber}: ${err.message}`,
        );
      }
    }
    return cancelledCount;
  }

  /**
   * Deletes an unpaid or payment-failed order and releases its reserved inventory stock.
   */
  async deleteUnpaidOrFailedOrder(orderId: string, reason: string = 'Payment failed / cancelled') {
    const order = await this.prisma.order.findFirst({
      where: {
        OR: [
          { id: orderId },
          { orderNumber: orderId },
          { orderNumber: this.normalizeOrderNumber(orderId) },
        ],
      },
      include: {
        items: true,
      },
    });

    if (!order) {
      return { success: true, message: 'Order not found or already deleted' };
    }

    if (order.paymentStatus === PaymentStatus.PAID) {
      throw new BadRequestException('Cannot delete an already paid order.');
    }

    if (['SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.status)) {
      throw new BadRequestException('Cannot delete an order that has already been shipped.');
    }

    await this.prisma.$transaction(async (tx) => {
      // 1. Release reserved stock back to product variants and record inventory transaction
      await this.releaseOrderStockInTx(tx, order, reason);

      // 2. Cascade delete order (removes items, tracking events, and payment attempts)
      await tx.order.delete({
        where: { id: order.id },
      });
    });

    this.logger.log(
      `[Orders] Unpaid/failed order ${order.orderNumber} deleted and stock released (${reason})`,
    );

    return {
      success: true,
      orderNumber: order.orderNumber,
      message: `Order ${order.orderNumber} deleted and inventory stock restored`,
    };
  }

  /**
   * Explicitly cancel an order by customer within limited conditions:
   * 1. Must not be already PAID online (paid orders require concierge review for gateway refund).
   * 2. Must be in PENDING status (not confirmed, processing, or dispatched).
   * 3. Must be within 6 hours of placement.
   * Updates order status to CANCELLED, restores inventory, creates tracking event,
   * and dispatches email notifications to both Customer and Store Administration.
   */
  async cancelCustomerOrder(
    orderId: string,
    customerId?: string,
    phone?: string,
    trackingToken?: string,
  ) {
    const order = await this.findOrderForAccess(orderId, customerId, phone, trackingToken);

    if (order.status === OrderStatus.CANCELLED) {
      return order;
    }

    if (order.paymentStatus === PaymentStatus.PAID) {
      throw new BadRequestException(
        'Cannot cancel an already paid order online. Please contact our atelier concierge for refund assistance.',
      );
    }

    // Condition 1: Must be in PENDING status
    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException(
        `Only orders with PENDING status can be cancelled. Order #${order.orderNumber} is currently ${order.status}. Once confirmed, packed, or dispatched, please contact our atelier concierge.`,
      );
    }

    // Condition 2: Limited time - Must be within 6 hours of placement
    const CANCELLATION_WINDOW_HOURS = 6;
    const orderAgeMs = Date.now() - new Date(order.createdAt).getTime();
    const maxAllowedMs = CANCELLATION_WINDOW_HOURS * 60 * 60 * 1000;
    const elapsedMinutes = Math.floor(orderAgeMs / (60 * 1000));
    const elapsedHours = (orderAgeMs / (60 * 60 * 1000)).toFixed(1);

    if (orderAgeMs > maxAllowedMs) {
      throw new BadRequestException(
        `The 6-hour cancellation window for Order #${order.orderNumber} has expired (placed ${elapsedHours} hours ago). Orders can only be self-cancelled within 6 hours of placement while in PENDING status. Please contact our concierge team for assistance.`,
      );
    }

    const orderAgeText =
      elapsedMinutes < 60
        ? `${elapsedMinutes}m after placement`
        : `${elapsedHours}h after placement`;

    const cancellationNote = `Cancelled by patron within 6-hour window (${orderAgeText}) on ${new Date().toISOString()}`;

    const updatedOrder = await this.prisma.$transaction(async (tx) => {
      // 1. Release reserved stock back to active inventory and record transaction
      await this.releaseOrderStockInTx(
        tx,
        order as any,
        `Customer cancellation within 6h: #${order.orderNumber}`,
      );

      // 2. Update order to CANCELLED (preserve order record, do not delete!)
      const updated = await tx.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.CANCELLED,
          adminNotes: [order.adminNotes, cancellationNote].filter(Boolean).join(' | '),
        },
        include: {
          items: true,
          customer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
        },
      });

      // 3. Log OrderTrackingEvent
      await tx.orderTrackingEvent.create({
        data: {
          orderId: order.id,
          status: OrderStatus.CANCELLED,
          description: `Order cancelled by patron within the 6-hour policy window. Reserved artisan inventory has been restored.`,
        },
      });

      return updated;
    });

    // 4. Dispatch Email to Customer
    this.dispatchOrderStatusOrEditNotification(
      updatedOrder,
      OrderStatus.PENDING,
      true,
      ['Order cancelled by patron within 6-hour policy window'],
    ).catch((err) => {
      this.logger.warn(
        `Failed to dispatch customer cancellation email for ${order.orderNumber}: ${err.message}`,
      );
    });

    // 5. Dispatch Email to Store Administration
    if (this.mailService) {
      const shipping = (order.shippingAddress as any) || {};
      const customerName =
        order.customer
          ? `${order.customer.firstName} ${order.customer.lastName || ''}`.trim()
          : order.guestName || shipping.fullName || 'Patron';
      const customerPhone =
        order.customer?.phone || order.guestPhone || shipping.phone || null;
      const customerEmail =
        order.customer?.email || order.guestEmail || shipping.email || null;

      this.mailService
        .sendAdminOrderCancellationAlertEmail({
          orderNumber: order.orderNumber,
          customerName,
          customerPhone,
          customerEmail,
          createdAt: order.createdAt,
          cancelledAt: new Date(),
          orderAgeText,
          paymentMethod: order.paymentMethod,
          paymentStatus: order.paymentStatus,
          totalAmount: Number(order.totalAmount),
          items: (order.items || []).map((item: any) => ({
            productName: item.productName,
            variantName: item.variantName,
            size: item.size,
            color: item.color,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.subtotal,
          })),
          adminNotes: cancellationNote,
        })
        .catch((err) => {
          this.logger.warn(
            `Failed to dispatch admin cancellation alert for ${order.orderNumber}: ${err.message}`,
          );
        });
    }

    return updatedOrder;
  }

  async cancelUnpaidOrder(
    orderId: string,
    customerId?: string,
    phone?: string,
    trackingToken?: string,
  ) {
    return this.cancelCustomerOrder(orderId, customerId, phone, trackingToken);
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto) {
    const { updated, previousStatus, statusChanged, changes } = await this.prisma.$transaction(
      async (transaction) => {
        const order = await transaction.order.findFirst({
          where: { OR: [{ id }, { orderNumber: id }, { orderNumber: this.normalizeOrderNumber(id) }] },
          include: {
            items: {
              select: {
                variantId: true,
                quantity: true,
                productName: true,
                variantName: true,
                sku: true,
                size: true,
                color: true,
                unitPrice: true,
                subtotal: true,
              },
            },
            customer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            },
          },
        });
        if (!order) throw new NotFoundException(`Order not found: ${id}`);
        if (dto.status && order.status === 'CANCELLED' && dto.status !== 'CANCELLED') {
          throw new BadRequestException('A cancelled order cannot be reopened');
        }
        if (
          dto.status === 'CANCELLED' &&
          ['SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.status)
        ) {
          throw new BadRequestException('An order cannot be cancelled after shipment');
        }

        // Sensitive courier status action validation (Requirements 27 & 28)
        if (dto.status === 'DELIVERED' && order.courierConsignmentId && !dto.overrideCourierStatus) {
          const courierNormalized = normalizePathaoStatus(order.courierStatus);
          if (!canMarkOrderDelivered(courierNormalized)) {
            throw new BadRequestException(
              `Cannot transition order to DELIVERED: Courier shipment is not in a confirmed DELIVERED state (Current courier status: "${order.courierStatus || 'PENDING'}").`,
            );
          }
        }

        if (
          (dto.status === 'RETURNED' || dto.status === 'REFUNDED') &&
          order.courierConsignmentId &&
          !dto.overrideCourierStatus
        ) {
          const courierNormalized = normalizePathaoStatus(order.courierStatus);
          if (!canProcessReturn(courierNormalized)) {
            throw new BadRequestException(
              `Cannot transition order to ${dto.status}: Courier shipment has not reached a verified return state (Current status: "${order.courierStatus || 'PENDING'}").`,
            );
          }
        }

        if (dto.status && order.status !== 'CANCELLED' && dto.status === 'CANCELLED') {
          await this.releaseOrderStockInTx(transaction, order, 'Order cancellation');
        }

        const previousStatus = order.status;
        const statusChanged = dto.status !== undefined && dto.status !== previousStatus;
        const changes: string[] = [];

        if (statusChanged) {
          changes.push(`Order status transitioned from ${previousStatus} to ${dto.status}`);
        }
        if (dto.courierName && dto.courierName !== order.courierName) {
          changes.push(`Courier set to ${dto.courierName}`);
        }
        if (dto.trackingNumber && dto.trackingNumber !== order.trackingNumber) {
          changes.push(`Consignment/Tracking Number assigned: ${dto.trackingNumber}`);
        }
        if (dto.estimatedDelivery) {
          changes.push(`Estimated Delivery Date updated`);
        }
        if (dto.shippingAddress) {
          changes.push(`Delivery Address specifications updated`);
        }
        if (dto.adminNotes && dto.adminNotes !== order.adminNotes) {
          changes.push(`Concierge note updated`);
        }

        const updateData: Prisma.OrderUpdateInput = {
          ...(dto.status ? { status: dto.status as OrderStatus } : {}),
          ...(dto.adminNotes !== undefined ? { adminNotes: dto.adminNotes } : {}),
          ...(dto.courierName !== undefined ? { courierName: dto.courierName } : {}),
          ...(dto.trackingNumber !== undefined ? { trackingNumber: dto.trackingNumber } : {}),
          ...(dto.trackingUrl !== undefined ? { trackingUrl: dto.trackingUrl } : {}),
          ...(dto.estimatedDelivery !== undefined
            ? { estimatedDelivery: dto.estimatedDelivery ? new Date(dto.estimatedDelivery) : null }
            : {}),
          ...(dto.shippingAddress ? { shippingAddress: dto.shippingAddress as any } : {}),
        };

        const updated = await transaction.order.update({
          where: { id: order.id },
          data: updateData,
          include: {
            items: true,
            customer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            },
          },
        });

        if (statusChanged || dto.adminNotes) {
          await transaction.orderTrackingEvent.create({
            data: {
              orderId: order.id,
              status: updated.status,
              description: dto.adminNotes || `Order transitioned to ${updated.status}`,
            },
          });
        }

        return { updated, previousStatus, statusChanged, changes };
      },
      { maxWait: 10000, timeout: 30000 }
    );

    // Asynchronously dispatch notification via orders@ronginlibas.com
    this.dispatchOrderStatusOrEditNotification(updated, previousStatus, statusChanged, changes).catch((err) => {
      this.logger.warn(`Failed to dispatch order notification for ${updated.orderNumber}: ${err.message}`);
    });

    if (this.ga4Service && ['CONFIRMED', 'PROCESSING'].includes(updated.status)) {
      this.ga4Service
        .sendPurchaseEvent({
          id: updated.id,
          orderNumber: updated.orderNumber,
          totalAmount: updated.totalAmount,
          customerId: (updated as any).customerId,
          items: (updated as any).items,
        })
        .catch((e) => this.logger.warn(`GA4 MP error on order status update: ${e?.message}`));
    }

    return updated;
  }

  async create(dto: CreateOrderDto, customerId?: string) {
    if (!dto.items.length) throw new BadRequestException('Order must contain at least one item');
    const guestName = customerId
      ? null
      : (dto.guestName?.trim() || dto.shippingAddress.fullName?.trim() || null);
    const guestPhone = customerId
      ? null
      : (dto.shippingAddress.phone?.trim() || null);
    const guestEmail = customerId
      ? null
      : (dto.guestEmail?.toLowerCase().trim() || dto.shippingAddress.email?.toLowerCase().trim() || null);

    let customerEmail: string | undefined = dto.shippingAddress.email?.toLowerCase().trim();
    if (customerId && !customerEmail) {
      const customer = await this.prisma.customer.findUnique({
        where: { id: customerId },
        select: { email: true },
      });
      if (customer?.email) {
        customerEmail = customer.email.toLowerCase().trim();
      }
    }

    if (!customerId && (!guestName || !guestPhone)) {
      throw new BadRequestException('Guest checkout requires a name and contact phone');
    }
    const paymentMethod = dto.paymentMethod ?? 'COD';
    if (paymentMethod !== 'COD' && paymentMethod !== 'WAITMARK_PAY' && paymentMethod !== 'UDDOKTAPAY') {
      throw new ServiceUnavailableException(`Online payment method ${paymentMethod} is not currently available`);
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
    const createdOrder = await this.prisma.$transaction(
      async (transaction) => {
        const orderItems = [];
      let subtotal = 0;
      for (const item of dto.items) {
        const variant = await transaction.productVariant.findFirst({
          where: {
            id: item.variantId,
            isActive: true,
            product: { isActive: true, deletedAt: null },
          },
          include: {
            product: {
              include: {
                images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }] },
              },
            },
          },
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
        const primaryImage =
          variant.product.images?.find((img) => img.isPrimary)?.url ||
          variant.product.images?.[0]?.url ||
          undefined;

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
          productImage: primaryImage,
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

      const cityLower = (dto.shippingAddress.city || '').trim().toLowerCase();
      const divisionLower = (dto.shippingAddress.division || '').trim().toLowerCase();
      const areaLower = (dto.shippingAddress.area || '').trim().toLowerCase();

      // Non-Dhaka districts that belong to Dhaka Division
      const outsideDhakaDistricts = [
        'gazipur', 'narayanganj', 'tangail', 'kishoreganj', 'manikganj',
        'munshiganj', 'narsingdi', 'faridpur', 'gopalganj', 'madaripur',
        'rajbari', 'shariatpur'
      ];
      const isOutsideDhakaDistrict = outsideDhakaDistricts.includes(cityLower);

      // Dhaka metro areas & thanas
      const dhakaMetroAreas = [
        'dhaka', 'dhanmondi', 'gulshan', 'banani', 'uttara', 'mirpur', 'mohammadpur',
        'motijheel', 'tejgaon', 'badda', 'khilgaon', 'paltan', 'ramna',
        'shahbagh', 'lalbagh', 'sutrapur', 'kotwali', 'wari', 'jatrabari',
        'demra', 'kadamtali', 'shyampur', 'kamrangirchar', 'hazaribagh',
        'new market', 'kalabagan', 'cantonment', 'kafrul', 'pallabi',
        'rupnagar', 'darus salam', 'shah ali', 'vashantek', 'bhatara',
        'khilkhet', 'dakshinkhan', 'uttarkhan', 'turag', 'airport',
        'rampura', 'sabujbagh', 'mugda', 'gandaria', 'chawkbazar',
        'bangshal', 'keraniganj', 'savar', 'dhamrai', 'dohar', 'nawabganj'
      ];

      const isDhaka =
        !isOutsideDhakaDistrict &&
        (cityLower === 'dhaka' ||
          dhakaMetroAreas.some((a) => cityLower.includes(a) || areaLower.includes(a)) ||
          (divisionLower.includes('dhaka') && (!cityLower || cityLower === 'dhaka')));
      const deliveryCharge =
        settings.freeShippingEnabled !== false &&
        subtotal - discountAmount >= freeDeliveryThreshold
          ? 0
          : isDhaka
            ? dhakaDeliveryCharge
            : outsideDhakaDeliveryCharge;
      const order = await transaction.order.create({
        data: {
          orderNumber,
          customerId: customerId ?? null,
          guestName,
          guestEmail,
          guestPhone,
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
            ...((dto.shippingAddress.email || customerEmail || guestEmail)
              ? { email: (dto.shippingAddress.email || customerEmail || guestEmail)?.toLowerCase().trim() }
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
    }, { maxWait: 10000, timeout: 30000 });

    // Auto-save address for customer if eligible (max 5 addresses)
    if (customerId) {
      this.saveAddressForCustomerIfEligible(customerId, dto.shippingAddress, customerEmail).catch((err) => {
        this.logger.warn(`Failed to auto-save address for customer ${customerId}: ${err.message}`);
      });
    }

    // Asynchronously dispatch Order Confirmation email to customer via orders@ronginlibas.com
    // Only dispatch immediately for COD (since COD is confirmed on placement).
    // For online gateways (WAITMARK_PAY), confirmation email is dispatched after successful payment verification.
    if (dto.paymentMethod === 'COD') {
      this.dispatchOrderConfirmationNotification(createdOrder.order, trackingToken, customerId).catch((err) => {
        this.logger.warn(`Failed to dispatch order confirmation email for ${createdOrder.order.orderNumber}: ${err.message}`);
      });
    }

    const responseOrder = {
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

    if (this.ga4Service && createdOrder.order.paymentMethod === 'COD') {
      this.ga4Service
        .sendPurchaseEvent({
          id: createdOrder.order.id,
          orderNumber: createdOrder.order.orderNumber,
          totalAmount: createdOrder.order.totalAmount,
          customerId: (createdOrder.order as any).customerId,
          guestTrackingToken: trackingToken,
          items: createdOrder.order.items,
        })
        .catch((err) => this.logger.warn(`GA4 MP error on COD order: ${err?.message}`));
    }

    return responseOrder;
  }

  async createByAdmin(dto: CreateAdminOrderDto, actor: AdminAuditActor) {
    if (!dto.items?.length) {
      throw new BadRequestException('Order must contain at least one item');
    }

    const variantIds = dto.items.map((item) => (item as any).productVariantId || item.variantId);
    if (new Set(variantIds).size !== variantIds.length) {
      throw new BadRequestException('Each product variant must appear only once in an order');
    }

    // 1. Resolve or prepare address
    let resolvedAddress: {
      addressLine1: string;
      addressLine2?: string;
      city: string;
      division: string;
      area?: string;
      postalCode?: string;
      phone: string;
      fullName?: string;
      email?: string;
      deliveryInstructions?: string;
    } | null = null;

    if (dto.addressId) {
      const savedAddress = await (this.prisma as any).address?.findUnique?.({
        where: { id: dto.addressId },
      });
      if (savedAddress) {
        resolvedAddress = {
          addressLine1: savedAddress.addressLine1 || savedAddress.streetAddress || '',
          addressLine2: savedAddress.addressLine2 || undefined,
          city: savedAddress.city || savedAddress.district || '',
          division: savedAddress.division || '',
          area: savedAddress.area || savedAddress.thana || undefined,
          postalCode: savedAddress.postalCode || undefined,
          phone: savedAddress.phone || '',
          fullName: savedAddress.fullName || savedAddress.name || undefined,
          email: savedAddress.email || undefined,
          deliveryInstructions: savedAddress.deliveryInstructions || savedAddress.notes || undefined,
        };
      }
    }

    if (!resolvedAddress && dto.shippingAddress) {
      const rawAddr = dto.shippingAddress as any;
      const street = rawAddr.addressLine1 || rawAddr.streetAddress;
      const city = rawAddr.city || rawAddr.district || rawAddr.thana;
      const div = rawAddr.division;
      const ph = rawAddr.phone || rawAddr.receiverPhone;

      if (!street || !city || !div || !ph) {
        throw new BadRequestException('Delivery address requires street address, city, division, and contact phone');
      }
      resolvedAddress = {
        addressLine1: String(street).trim(),
        addressLine2: rawAddr.addressLine2 ? String(rawAddr.addressLine2).trim() : undefined,
        city: String(city).trim(),
        division: String(div).trim(),
        area: rawAddr.area || rawAddr.thana ? String(rawAddr.area || rawAddr.thana).trim() : undefined,
        postalCode: rawAddr.postalCode ? String(rawAddr.postalCode).trim() : undefined,
        phone: String(ph).trim(),
        fullName: rawAddr.fullName || rawAddr.receiverName ? String(rawAddr.fullName || rawAddr.receiverName).trim() : undefined,
        email: rawAddr.email ? String(rawAddr.email).toLowerCase().trim() : undefined,
        deliveryInstructions: rawAddr.deliveryInstructions || rawAddr.notes ? String(rawAddr.deliveryInstructions || rawAddr.notes).trim() : undefined,
      };
    }

    if (!resolvedAddress) {
      throw new BadRequestException('A valid delivery address is required');
    }

    const settings = await this.settingsService.getPublicSettings();
    const freeDeliveryThreshold = Number(settings.freeDeliveryThreshold);
    const dhakaDeliveryCharge = Number(settings.dhakaDeliveryCharge);
    const outsideDhakaDeliveryCharge = Number(settings.outsideDhakaDeliveryCharge);

    const orderNumber = `#RL${Date.now().toString().slice(-8)}${randomBytes(2).toString('hex').toUpperCase()}`;

    const createdOrder = await this.prisma.$transaction(
      async (transaction) => {
        let customerId = dto.customerId?.trim() || null;
        let customerFirstName: string | null = null;
        let customerLastName: string | null = null;
        let customerEmail: string | null = null;
        let customerPhone: string | null = null;

        const custInput = dto.newCustomer || (dto as any).customer;
        if (customerId) {
          const existingCustomer = await transaction.customer.findUnique({
            where: { id: customerId },
          });
          if (!existingCustomer || existingCustomer.deletedAt) {
            throw new BadRequestException('Selected customer is invalid or archived');
          }
          customerFirstName = existingCustomer.firstName;
          customerLastName = existingCustomer.lastName;
          customerEmail = existingCustomer.email;
          customerPhone = existingCustomer.phone;
        } else if (custInput) {
          const rawPhone = (custInput.phone || custInput.phoneNumber || '').trim();
          const rawEmail = custInput.email?.toLowerCase().trim() || null;

          // Check if phone or email already belongs to an existing customer
          let matched = await transaction.customer.findFirst({
            where: { phone: rawPhone, deletedAt: null },
          });
          if (!matched && rawEmail) {
            matched = await transaction.customer.findFirst({
              where: { email: rawEmail, deletedAt: null },
            });
          }

          if (matched) {
            customerId = matched.id;
            customerFirstName = matched.firstName;
            customerLastName = matched.lastName;
            customerEmail = matched.email;
            customerPhone = matched.phone;
          } else {
            const rawFullName =
              custInput.fullName ||
              [custInput.firstName, custInput.lastName].filter(Boolean).join(' ') ||
              'Customer';
            const parts = rawFullName.trim().split(/\s+/);
            const firstName = parts[0] || 'Customer';
            const lastName = parts.slice(1).join(' ') || null;
            const newCust = await transaction.customer.create({
              data: {
                firstName,
                lastName,
                phone: rawPhone,
                email: rawEmail,
                isActive: true,
              },
            });
            customerId = newCust.id;
            customerFirstName = newCust.firstName;
            customerLastName = newCust.lastName;
            customerEmail = newCust.email;
            customerPhone = newCust.phone;
          }
        }

        const guestName =
          resolvedAddress!.fullName ||
          (customerFirstName ? [customerFirstName, customerLastName].filter(Boolean).join(' ') : null);
        const guestPhone = resolvedAddress!.phone || customerPhone;
        const guestEmail = resolvedAddress!.email || customerEmail;

        const orderItems = [];
        let subtotal = 0;

        for (const item of dto.items) {
          const variantId = (item as any).productVariantId || item.variantId;
          const quantity = item.quantity;
          if (!quantity || quantity <= 0) {
            throw new BadRequestException('Item quantity must be at least 1');
          }

          const variant = await transaction.productVariant.findFirst({
            where: {
              id: variantId,
              isActive: true,
              product: { isActive: true, deletedAt: null },
            },
            include: {
              product: {
                include: {
                  images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }] },
                },
              },
            },
          });

          if (!variant) {
            throw new BadRequestException(`A selected product variant (${variantId}) is currently unavailable or inactive`);
          }
          if (item.productId && item.productId !== variant.productId) {
            throw new BadRequestException('The selected variant does not belong to the specified product');
          }
          if (variant.stock < quantity) {
            throw new BadRequestException(
              `Insufficient stock: "${variant.product.name}" (${variant.color} - ${variant.sizeLabel || variant.size}) only has ${variant.stock} units in stock`,
            );
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
            throw new BadRequestException(`Stock for "${variant.product.name}" has changed. Please retry.`);
          }

          await transaction.inventoryTransaction.create({
            data: {
              variantId: variant.id,
              quantityChange: -item.quantity,
              previousStock: variant.stock,
              newStock: variant.stock - item.quantity,
              type: 'SALE',
              note: `Admin order ${orderNumber} created by ${[actor?.firstName, actor?.lastName].filter(Boolean).join(' ') || actor?.email || 'Admin'}`,
            },
          });

          const primaryImage =
            variant.product.images?.find((img) => img.isPrimary)?.url ||
            variant.product.images?.[0]?.url ||
            undefined;

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
            productImage: primaryImage,
          });
        }

        // Coupon calculation
        let couponDiscount = 0;
        let couponId: string | undefined;
        if (dto.couponCode?.trim()) {
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

          couponDiscount =
            coupon.type === 'PERCENTAGE'
              ? (subtotal * Number(coupon.value)) / 100
              : Number(coupon.value);

          if (coupon.maximumDiscount !== null && coupon.maximumDiscount !== undefined) {
            couponDiscount = Math.min(couponDiscount, Number(coupon.maximumDiscount));
          }
          couponDiscount = Math.min(couponDiscount, subtotal);
          couponId = coupon.id;

          const update = await transaction.coupon.updateMany({
            where: {
              id: coupon.id,
              isActive: true,
              ...(coupon.usageLimit !== null ? { usageCount: { lt: coupon.usageLimit } } : {}),
            },
            data: { usageCount: { increment: 1 } },
          });
          if (!update.count) {
            throw new BadRequestException('Coupon redemption limit has been reached');
          }
        }

        // Manual discount calculation
        let manualDiscountAmount = 0;
        if (dto.manualDiscountType && dto.manualDiscountValue && dto.manualDiscountValue > 0) {
          if (dto.manualDiscountType === 'PERCENTAGE') {
            const pct = Math.min(100, Math.max(0, dto.manualDiscountValue));
            manualDiscountAmount = roundCurrency((subtotal * pct) / 100);
          } else {
            manualDiscountAmount = roundCurrency(Math.min(subtotal, dto.manualDiscountValue));
          }
        }

        const totalDiscount = Math.min(subtotal, roundCurrency(couponDiscount + manualDiscountAmount));

        // Delivery Charge calculation
        let deliveryCharge: number;
        if (dto.deliveryCharge !== undefined && dto.deliveryCharge !== null) {
          deliveryCharge = Math.max(0, Number(dto.deliveryCharge));
        } else {
          const cityLower = (resolvedAddress!.city || '').trim().toLowerCase();
          const divisionLower = (resolvedAddress!.division || '').trim().toLowerCase();
          const areaLower = (resolvedAddress!.area || '').trim().toLowerCase();

          const outsideDhakaDistricts = [
            'gazipur', 'narayanganj', 'tangail', 'kishoreganj', 'manikganj',
            'munshiganj', 'narsingdi', 'faridpur', 'gopalganj', 'madaripur',
            'rajbari', 'shariatpur'
          ];
          const isOutsideDhakaDistrict = outsideDhakaDistricts.includes(cityLower);

          const dhakaMetroAreas = [
            'dhaka', 'dhanmondi', 'gulshan', 'banani', 'uttara', 'mirpur', 'mohammadpur',
            'motijheel', 'tejgaon', 'badda', 'khilgaon', 'paltan', 'ramna',
            'shahbagh', 'lalbagh', 'sutrapur', 'kotwali', 'wari', 'jatrabari',
            'demra', 'kadamtali', 'shyampur', 'kamrangirchar', 'hazaribagh',
            'new market', 'kalabagan', 'cantonment', 'kafrul', 'pallabi',
            'rupnagar', 'darus salam', 'shah ali', 'vashantek', 'bhatara',
            'khilkhet', 'dakshinkhan', 'uttarkhan', 'turag', 'airport',
            'rampura', 'sabujbagh', 'mugda', 'gandaria', 'chawkbazar',
            'bangshal', 'keraniganj', 'savar', 'dhamrai', 'dohar', 'nawabganj'
          ];

          const isDhaka =
            !isOutsideDhakaDistrict &&
            (cityLower === 'dhaka' ||
              dhakaMetroAreas.some((a) => cityLower.includes(a) || areaLower.includes(a)) ||
              (divisionLower.includes('dhaka') && (!cityLower || cityLower === 'dhaka')));

          deliveryCharge =
            settings.freeShippingEnabled !== false &&
            subtotal - totalDiscount >= freeDeliveryThreshold
              ? 0
              : isDhaka
                ? dhakaDeliveryCharge
                : outsideDhakaDeliveryCharge;
        }

        const grandTotal = Math.max(0, roundCurrency(subtotal - totalDiscount + deliveryCharge));

        const rawStatus = dto.paymentStatus || 'PENDING';
        const paymentStatus = (rawStatus === 'UNPAID' ? 'PENDING' : rawStatus) as PaymentStatus;
        let paidAmount: number | null = null;
        if (paymentStatus === 'PAID') {
          paidAmount = dto.paidAmount !== undefined ? dto.paidAmount : grandTotal;
        } else if (paymentStatus === 'PARTIALLY_PAID') {
          paidAmount = dto.paidAmount !== undefined ? dto.paidAmount : 0;
        }

        const creatorName =
          [actor?.firstName, actor?.lastName].filter(Boolean).join(' ') ||
          actor?.email ||
          'Admin';

        const order = await transaction.order.create({
          data: {
            orderNumber,
            customerId: customerId ?? null,
            guestName,
            guestEmail,
            guestPhone,
            status: dto.orderStatus || 'PENDING',
            paymentStatus,
            paymentMethod: (dto.paymentMethod || 'COD') as PaymentMethod,
            paymentReference: dto.paymentReference?.trim() || null,
            paidAmount: paidAmount !== null ? new Prisma.Decimal(paidAmount) : null,
            subtotal: new Prisma.Decimal(subtotal),
            discountAmount: new Prisma.Decimal(totalDiscount),
            manualDiscountAmount: new Prisma.Decimal(manualDiscountAmount),
            deliveryCharge: new Prisma.Decimal(deliveryCharge),
            totalAmount: new Prisma.Decimal(grandTotal),
            courierName: dto.courierName?.trim() || dto.courierProvider?.trim() || null,
            source: dto.source?.trim() || 'ADMIN',
            createdById: actor?.id || null,
            createdByName: creatorName,
            shippingAddress: {
              addressLine1: resolvedAddress!.addressLine1,
              city: resolvedAddress!.city,
              division: resolvedAddress!.division,
              phone: resolvedAddress!.phone,
              ...(resolvedAddress!.addressLine2 ? { addressLine2: resolvedAddress!.addressLine2 } : {}),
              ...(resolvedAddress!.fullName ? { fullName: resolvedAddress!.fullName } : {}),
              ...(resolvedAddress!.email ? { email: resolvedAddress!.email } : {}),
              ...(resolvedAddress!.area ? { area: resolvedAddress!.area } : {}),
              ...(resolvedAddress!.postalCode ? { postalCode: resolvedAddress!.postalCode } : {}),
              ...(resolvedAddress!.deliveryInstructions
                ? { deliveryInstructions: resolvedAddress!.deliveryInstructions }
                : {}),
            } satisfies Prisma.InputJsonObject,
            customerNotes: dto.customerNotes?.trim() || null,
            adminNotes: dto.adminNotes?.trim() || null,
            items: { create: orderItems },
            trackingEvents: {
              create: {
                status: dto.orderStatus || 'PENDING',
                description: `Order created manually by admin ${creatorName} (${dto.source || 'ADMIN'})`,
              },
            },
          },
          include: {
            customer: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
            items: {
              include: {
                product: {
                  include: {
                    images: { orderBy: { sortOrder: 'asc' } },
                  },
                },
                variant: true,
              },
            },
            trackingEvents: { orderBy: { createdAt: 'asc' } },
          },
        });

        return { order, couponId };
      },
      { maxWait: 10000, timeout: 30000 },
    );

    // Auto-save address for customer if eligible and new address was supplied
    if (createdOrder.order.customerId && !dto.addressId && resolvedAddress) {
      this.saveAddressForCustomerIfEligible(
        createdOrder.order.customerId,
        resolvedAddress as any,
        resolvedAddress.email,
      ).catch((err) => {
        this.logger.warn(`Failed to auto-save address for customer ${createdOrder.order.customerId}: ${err.message}`);
      });
    }

    // Async email notification if customer email exists
    if (createdOrder.order.customer?.email || resolvedAddress.email) {
      this.dispatchOrderConfirmationNotification(createdOrder.order, undefined, createdOrder.order.customerId || undefined).catch((err) => {
        this.logger.warn(`Failed to dispatch order confirmation for admin order ${createdOrder.order.orderNumber}: ${err.message}`);
      });
    }

    return createdOrder.order;
  }

  /**
   * Dispatches order confirmation email after an online payment clears.
   */
  public async dispatchConfirmationNotificationForPaidOrder(orderId: string) {
    if (!this.mailService) return;
    try {
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
        include: {
          items: true,
          customer: true,
        },
      });
      if (!order) return;
      await this.dispatchOrderConfirmationNotification(order, undefined, order.customerId || undefined);
    } catch (err: any) {
      this.logger.warn(`Failed to dispatch confirmation email for verified order ${orderId}: ${err?.message}`);
    }
  }

  private async dispatchOrderConfirmationNotification(
    order: any,
    trackingToken?: string,
    customerId?: string,
  ) {
    if (!this.mailService) return;

    let customerEmail: string | undefined;
    let customerName: string | undefined;

    const shipping = (order.shippingAddress as any) || {};
    if (shipping.email && typeof shipping.email === 'string') customerEmail = shipping.email.trim();
    if (shipping.fullName && typeof shipping.fullName === 'string') customerName = shipping.fullName.trim();

    if (!customerEmail && order.guestEmail) customerEmail = order.guestEmail.trim();
    if (!customerName && order.guestName) customerName = order.guestName.trim();

    if (!customerEmail && customerId) {
      const customer = await this.prisma.customer.findUnique({
        where: { id: customerId },
        select: { email: true, firstName: true, lastName: true },
      });
      if (customer) {
        if (!customerEmail && customer.email) customerEmail = customer.email;
        if (!customerName) {
          customerName = `${customer.firstName} ${customer.lastName || ''}`.trim();
        }
      }
    }

    if (!customerEmail) {
      this.logger.debug(`No recipient email address found for order ${order.orderNumber}. Skipping confirmation email.`);
      return;
    }

    const items = (order.items || []).map((item: any) => ({
      productName: item.productName,
      variantName: item.variantName,
      sku: item.sku,
      size: item.size,
      color: item.color,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
      subtotal: Number(item.subtotal),
      productImage: item.productImage || item.product?.images?.[0]?.url,
    }));

    let invoiceBuffer: Buffer | undefined;
    try {
      const orderForInvoice = {
        ...order,
        guestName: customerName,
        guestPhone: shipping.phone || order.guestPhone,
        guestEmail: customerEmail,
      };
      invoiceBuffer = await this.generateInvoiceBuffer(orderForInvoice);
      if (invoiceBuffer) {
        this.logger.log(
          `Official PDF invoice generated for order confirmation: ${order.orderNumber} (${invoiceBuffer.length} bytes)`
        );
      }
    } catch (err) {
      this.logger.warn(
        `Could not generate PDF invoice attachment for ${order.orderNumber}: ${(err as Error).message}`
      );
    }

    await this.mailService.sendOrderConfirmationEmail({
      email: customerEmail,
      orderNumber: order.orderNumber,
      customerName,
      items,
      subtotal: Number(order.subtotal),
      deliveryCharge: Number(order.deliveryCharge),
      discountAmount: Number(order.discountAmount || 0),
      totalAmount: Number(order.totalAmount),
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      shippingAddress: shipping,
      customerNotes: order.customerNotes,
      trackingToken,
      invoiceBuffer,
    });
  }

  private async saveAddressForCustomerIfEligible(
    customerId: string,
    shippingAddress: ShippingAddressDto,
    fallbackEmail?: string,
  ) {
    try {
      const count = await this.prisma.address.count({ where: { customerId } });
      if (count >= 5) {
        return; // Max 5 addresses limit reached
      }

      const line1 = shippingAddress.addressLine1.trim();
      const city = shippingAddress.city.trim();
      const division = shippingAddress.division.trim();

      const existing = await this.prisma.address.findFirst({
        where: {
          customerId,
          addressLine1: { equals: line1, mode: 'insensitive' },
          city: { equals: city, mode: 'insensitive' },
          division: { equals: division, mode: 'insensitive' },
        },
      });

      if (existing) {
        return;
      }

      const email = (shippingAddress.email?.toLowerCase().trim() || fallbackEmail)?.toLowerCase().trim();
      await this.prisma.address.create({
        data: {
          customerId,
          fullName: shippingAddress.fullName?.trim() || undefined,
          email: email || undefined,
          phone: normalizeBangladeshPhone(shippingAddress.phone),
          addressLine1: line1,
          addressLine2: shippingAddress.addressLine2?.trim() || undefined,
          city,
          division,
          area: shippingAddress.area?.trim() || undefined,
          postalCode: shippingAddress.postalCode?.trim() || undefined,
          deliveryInstructions: shippingAddress.deliveryInstructions?.trim() || undefined,
          isDefault: count === 0,
        },
      });
      this.logger.log(`Auto-saved delivery address for customer ${customerId} (address count: ${count + 1}/5)`);
    } catch (error: any) {
      this.logger.warn(`Failed to auto-save address for customer ${customerId}: ${error.message}`);
    }
  }

  private async dispatchOrderStatusOrEditNotification(
    order: any,
    previousStatus: string,
    statusChanged: boolean,
    changes: string[],
  ) {
    if (!this.mailService) return;

    let customerEmail: string | undefined;
    let customerName: string | undefined;

    const shipping = (order.shippingAddress as any) || {};
    if (shipping.email && typeof shipping.email === 'string') customerEmail = shipping.email.trim();
    if (shipping.fullName && typeof shipping.fullName === 'string') customerName = shipping.fullName.trim();

    if (!customerEmail && order.guestEmail) customerEmail = order.guestEmail.trim();
    if (!customerName && order.guestName) customerName = order.guestName.trim();

    if (!customerEmail && order.customer?.email) customerEmail = order.customer.email.trim();
    if (!customerName && order.customer) {
      customerName = `${order.customer.firstName} ${order.customer.lastName || ''}`.trim();
    }

    if (!customerEmail && order.customerId) {
      const customer = await this.prisma.customer.findUnique({
        where: { id: order.customerId },
        select: { email: true, firstName: true, lastName: true },
      });
      if (customer) {
        if (!customerEmail && customer.email) customerEmail = customer.email;
        if (!customerName) {
          customerName = `${customer.firstName} ${customer.lastName || ''}`.trim();
        }
      }
    }

    // Phone lookup fallback if customer email is not directly on order
    if (!customerEmail && (shipping.phone || order.guestPhone)) {
      const rawPhone = (shipping.phone || order.guestPhone || '').trim();
      const normalized = normalizeBangladeshPhone(rawPhone);
      const digitsOnly = rawPhone.replace(/\D/g, '');
      const customer = await this.prisma.customer.findFirst({
        where: {
          OR: [
            { phone: normalized },
            { phone: rawPhone },
            ...(digitsOnly ? [{ phone: { contains: digitsOnly } }] : []),
          ],
        },
        select: { email: true, firstName: true, lastName: true },
      });
      if (customer?.email) {
        customerEmail = customer.email.trim();
        if (!customerName) {
          customerName = `${customer.firstName} ${customer.lastName || ''}`.trim();
        }
      }
    }

    if (!customerEmail) {
      this.logger.warn(`No recipient email address found for order ${order.orderNumber}. Skipping notification.`);
      return;
    }

    this.logger.log(
      `Dispatching order status update email for ${order.orderNumber} to ${customerEmail} (new status: ${order.status}, changed: ${statusChanged})`,
    );

    if (statusChanged) {
      await this.mailService.sendOrderStatusUpdateEmail({
        email: customerEmail,
        orderNumber: order.orderNumber,
        customerName,
        newStatus: order.status,
        previousStatus,
        courierName: order.courierName,
        trackingNumber: order.trackingNumber,
        trackingUrl: order.trackingUrl,
        estimatedDelivery: order.estimatedDelivery,
        adminNotes: order.adminNotes,
        totalAmount: Number(order.totalAmount),
        shippingAddress: shipping,
      });
    } else if (changes.length > 0) {
      await this.mailService.sendOrderEditEmail({
        email: customerEmail,
        orderNumber: order.orderNumber,
        customerName,
        status: order.status,
        totalAmount: Number(order.totalAmount),
        changeSummary: changes,
        shippingAddress: shipping,
        courierName: order.courierName,
        trackingNumber: order.trackingNumber,
        trackingUrl: order.trackingUrl,
        adminNotes: order.adminNotes,
      });
    }
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
    const normalizedCourier = normalizePathaoStatus(order.courierStatus);
    const safeCourierStatus = getCustomerSafeCourierStatus(normalizedCourier);

    return {
      orderNumber: order.orderNumber,
      status: order.status,
      courier: order.courierProvider || order.courierName || 'PATHAO',
      courierName: order.courierName,
      courierStatus: safeCourierStatus,
      trackingNumber: order.trackingNumber,
      trackingUrl: order.trackingUrl,
      estimatedDelivery: order.estimatedDelivery,
      lastUpdatedAt: (order as any).courierLastSyncedAt || order.updatedAt,
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
    return this.generateInvoiceBuffer(order);
  }

  async generateInvoiceBuffer(order: any): Promise<Buffer> {
    // Preload item images in parallel (Cloudinary JPEG or remote images)
    const itemThumbnails = await Promise.all(
      (order.items || []).map((item: any) => {
        const imgUrl = item.productImage || item.product?.images?.[0]?.url;
        return fetchThumbnailBuffer(imgUrl);
      }),
    );

    const logoBuffer = getLogoBuffer();

    return new Promise<Buffer>((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margin: 36,
          autoFirstPage: true,
          info: {
            Title: `Invoice ${order.orderNumber} - Rongin Libas`,
            Author: 'Rongin Libas Haute Couture Menswear',
            Subject: `Official Tax Invoice & Consignment Bill for ${order.orderNumber}`,
          },
        });

        const chunks: Buffer[] = [];
        doc.on('data', (chunk: Buffer) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        const margin = 36;
        const pageWidth = 595.28;
        const contentWidth = pageWidth - margin * 2; // 523.28

        // ==========================================
        // 1. BRAND HEADER (Deep Forest Green Banner)
        // ==========================================
        const headerHeight = 78;
        doc.roundedRect(margin, margin, contentWidth, headerHeight, 4).fill('#073A2D');

        // Logo Crest Medallion (Warm Ivory with Atelier Gold Border for exact color logo fidelity)
        doc.roundedRect(margin + 12, margin + 11, 62, 56, 3).fill('#FBF9F2');
        doc.lineWidth(1).strokeColor('#C79A45').roundedRect(margin + 12, margin + 11, 62, 56, 3).stroke();
        if (logoBuffer) {
          try {
            doc.image(logoBuffer, margin + 16, margin + 14, {
              width: 54,
              height: 50,
              fit: [54, 50],
              align: 'center',
              valign: 'center',
            });
          } catch {
            // fallback gracefully
          }
        }

        // Brand Info
        const brandTextX = margin + 82;
        doc.fillColor('#FFFFFF').fontSize(15).font('Helvetica-Bold').text('RONGIN LIBAS', brandTextX, margin + 12);
        doc
          .fillColor('#D4AF37')
          .fontSize(7)
          .font('Helvetica-Bold')
          .text('CLOTH YOUR IDENTITY  •  HAUTE COUTURE MENSWEAR', brandTextX, margin + 30);
        doc
          .fillColor('#D1D5DB')
          .fontSize(6.8)
          .font('Helvetica')
          .text('Flagship Atelier: House 12, Road 4, Sector 3, Uttara, Dhaka-1230', brandTextX, margin + 43);
        doc
          .fillColor('#9CA3AF')
          .fontSize(6.8)
          .font('Helvetica')
          .text('Hotline: +880 1700-000000  •  orders@ronginlibas.com  •  BIN: RL-VAT-7829104', brandTextX, margin + 55);

        // Header Right - Invoice Badge Card
        const badgeW = 152;
        const badgeH = 58;
        const badgeX = margin + contentWidth - badgeW - 10;
        const badgeY = margin + 10;
        doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 3).fill('#0A4D3C');
        doc.lineWidth(0.5).strokeColor('#B88E3F').roundedRect(badgeX, badgeY, badgeW, badgeH, 3).stroke();

        doc
          .fillColor('#FFFFFF')
          .fontSize(7.5)
          .font('Helvetica-Bold')
          .text('OFFICIAL TAX INVOICE', badgeX, badgeY + 6, { width: badgeW, align: 'center' });
        doc
          .fillColor('#D4AF37')
          .fontSize(11)
          .font('Helvetica-Bold')
          .text(order.orderNumber, badgeX, badgeY + 18, { width: badgeW, align: 'center' });
        doc
          .fillColor('#E5E7EB')
          .fontSize(6.5)
          .font('Helvetica')
          .text(`TX ID: ${order.id.slice(0, 18).toUpperCase()}`, badgeX, badgeY + 33, { width: badgeW, align: 'center' });
        doc
          .fillColor('#D1D5DB')
          .fontSize(6.5)
          .font('Helvetica')
          .text(`Issued: ${formatInvoiceDate(order.createdAt)}`, badgeX, badgeY + 44, { width: badgeW, align: 'center' });

        // ==========================================
        // 2. TWO-COLUMN CARDS: CONSIGNEE & DISPATCH
        // ==========================================
        const cardsY = margin + headerHeight + 10; // 124
        const cardH = 76;
        const cardW = (contentWidth - 10) / 2; // 256.64

        // Extract Customer / Shipping Details
        const addr = (order.shippingAddress as Record<string, any>) || {};
        const recipientName =
          addr.fullName ||
          addr.recipient ||
          addr.name ||
          ((order as any).customer ? [(order as any).customer.firstName, (order as any).customer.lastName].filter(Boolean).join(' ') : (order as any).guestName) ||
          'Valued Patron';
        const contactPhone = addr.phone || (order as any).guestPhone || (order as any).customer?.phone || 'N/A';
        const contactEmail = addr.email || (order as any).guestEmail || (order as any).customer?.email || 'N/A';
        const destAddress =
          [addr.addressLine1 || addr.address, addr.addressLine2, addr.city, addr.division, addr.postalCode]
            .filter(Boolean)
            .join(', ') || 'Doorstep Delivery Location on file';

        // Left Card: Consignee
        doc.roundedRect(margin, cardsY, cardW, cardH, 4).fill('#F8FAFC');
        doc.lineWidth(0.5).strokeColor('#E2E8F0').roundedRect(margin, cardsY, cardW, cardH, 4).stroke();
        doc.roundedRect(margin, cardsY, cardW, 17, 3).fill('#EEF2F6');
        doc
          .fillColor('#073A2D')
          .fontSize(7)
          .font('Helvetica-Bold')
          .text('CONSIGNEE / BILLED TO', margin + 8, cardsY + 5);

        doc.fillColor('#111827').fontSize(8.5).font('Helvetica-Bold').text(recipientName, margin + 8, cardsY + 22, {
          width: cardW - 16,
          ellipsis: true,
        });
        doc
          .fillColor('#4B5563')
          .fontSize(7)
          .font('Helvetica')
          .text(`Phone: ${contactPhone}  •  Email: ${contactEmail}`, margin + 8, cardsY + 35, {
            width: cardW - 16,
            ellipsis: true,
          });
        doc
          .fillColor('#4B5563')
          .fontSize(6.8)
          .font('Helvetica')
          .text(`Destination: ${destAddress}`, margin + 8, cardsY + 47, {
            width: cardW - 16,
            height: 24,
            ellipsis: true,
          });

        // Right Card: Consignment & Logistics
        const rightCardX = margin + cardW + 10;
        doc.roundedRect(rightCardX, cardsY, cardW, cardH, 4).fill('#F8FAFC');
        doc.lineWidth(0.5).strokeColor('#E2E8F0').roundedRect(rightCardX, cardsY, cardW, cardH, 4).stroke();
        doc.roundedRect(rightCardX, cardsY, cardW, 17, 3).fill('#EEF2F6');
        doc
          .fillColor('#073A2D')
          .fontSize(7)
          .font('Helvetica-Bold')
          .text('CONSIGNMENT & PAYMENT SPEC', rightCardX + 8, cardsY + 5);

        // Status Badge Pill
        const statusColors: Record<string, { bg: string; text: string }> = {
          DELIVERED: { bg: '#DCFCE7', text: '#15803D' },
          CONFIRMED: { bg: '#E0F2FE', text: '#0369A1' },
          PROCESSING: { bg: '#FEF3C7', text: '#B45309' },
          SHIPPED: { bg: '#EDE9FE', text: '#6D28D9' },
          CANCELLED: { bg: '#FEE2E2', text: '#B91C1C' },
          PENDING: { bg: '#FEF9C3', text: '#854D0E' },
        };
        const statusPill = statusColors[order.status] || { bg: '#E5E7EB', text: '#374151' };
        const pillW = 60;
        const pillH = 13;
        const pillX = rightCardX + cardW - pillW - 6;
        const pillY = cardsY + 2;
        doc.roundedRect(pillX, pillY, pillW, pillH, 2).fill(statusPill.bg);
        doc
          .fillColor(statusPill.text)
          .fontSize(6)
          .font('Helvetica-Bold')
          .text(order.status, pillX, pillY + 3, { width: pillW, align: 'center' });

        const courier = order.courierName || 'Nationwide Express (Dhaka Doorstep)';
        const trackingWaybill = order.trackingNumber || `RL-EXP-${order.orderNumber.replace(/[^A-Z0-9]/g, '')}`;
        const payMethodStr =
          order.paymentMethod === 'COD'
            ? 'Cash on Delivery (COD)'
            : `${order.paymentMethod} (Digital Gateway)`;

        doc
          .fillColor('#111827')
          .fontSize(7.5)
          .font('Helvetica-Bold')
          .text(`Payment: ${payMethodStr} [${order.paymentStatus}]`, rightCardX + 8, cardsY + 22, {
            width: cardW - 16,
            ellipsis: true,
          });
        doc
          .fillColor('#4B5563')
          .fontSize(7)
          .font('Helvetica')
          .text(`Carrier: ${courier}`, rightCardX + 8, cardsY + 35, {
            width: cardW - 16,
            ellipsis: true,
          });
        doc
          .fillColor('#4B5563')
          .fontSize(7)
          .font('Helvetica')
          .text(`Waybill / Airway Ref: ${trackingWaybill}`, rightCardX + 8, cardsY + 47, {
            width: cardW - 16,
            ellipsis: true,
          });
        doc
          .fillColor('#059669')
          .fontSize(6.5)
          .font('Helvetica-Bold')
          .text('Express Handover: 24–48 Hours Doorstep TAT', rightCardX + 8, cardsY + 59, {
            width: cardW - 16,
            ellipsis: true,
          });

        // ==========================================
        // 3. ITEMS TABLE
        // ==========================================
        const tableY = cardsY + cardH + 10;
        const tableHdrHeight = 22;

        // Table Header Bar
        doc.roundedRect(margin, tableY, contentWidth, tableHdrHeight, 3).fill('#073A2D');

        doc.fillColor('#FFFFFF').fontSize(7).font('Helvetica-Bold');
        doc.text('#', margin + 6, tableY + 7, { width: 38, align: 'center' });
        doc.text('ITEM & SARTORIAL SPECIFICATION', margin + 48, tableY + 7, { width: 236 });
        doc.text('UNIT PRICE', margin + 288, tableY + 7, { width: 70, align: 'right' });
        doc.text('QTY / ITEMS', margin + 364, tableY + 7, { width: 56, align: 'center' });
        doc.text('TOTAL AMOUNT', margin + 424, tableY + 7, { width: 90, align: 'right' });

        const rowHeight = 48;
        let currentY = tableY + tableHdrHeight;

        if (order.items && order.items.length > 0) {
          (order.items as any[]).forEach((item: any, index: number) => {
            const isAlt = index % 2 === 1;
            if (isAlt) {
              doc.rect(margin, currentY, contentWidth, rowHeight).fill('#FBFBFA');
            }

            // Bottom border
            doc
              .lineWidth(0.5)
              .strokeColor('#E5E7EB')
              .moveTo(margin, currentY + rowHeight)
              .lineTo(margin + contentWidth, currentY + rowHeight)
              .stroke();

            // Thumbnail Image / Monogram
            const imgW = 28;
            const imgH = 36;
            const imgX = margin + 12;
            const imgY = currentY + 6;
            const imgBuf = itemThumbnails[index];

            doc.roundedRect(imgX, imgY, imgW, imgH, 2).fill('#F3F4F6');
            doc.lineWidth(0.5).strokeColor('#D1D5DB').roundedRect(imgX, imgY, imgW, imgH, 2).stroke();

            let drawnImg = false;
            if (imgBuf) {
              try {
                doc.image(imgBuf, imgX, imgY, {
                  width: imgW,
                  height: imgH,
                  fit: [imgW, imgH],
                  align: 'center',
                  valign: 'center',
                });
                drawnImg = true;
              } catch {
                drawnImg = false;
              }
            }
            if (!drawnImg) {
              doc
                .fillColor('#9CA3AF')
                .fontSize(8)
                .font('Helvetica-Bold')
                .text('RL', imgX, imgY + 12, { width: imgW, align: 'center' });
            }

            // Product Name
            doc
              .fillColor('#111827')
              .fontSize(8)
              .font('Helvetica-Bold')
              .text(item.productName, margin + 48, currentY + 9, {
                width: 236,
                ellipsis: true,
              });

            // Spec Meta (Size, Color, SKU)
            const specs = [
              item.size ? `Size: ${item.size}` : null,
              item.color ? `Color: ${item.color}` : null,
              item.sku ? `SKU: ${item.sku}` : null,
            ]
              .filter(Boolean)
              .join('  |  ') || item.variantName || 'Atelier Standard';

            doc
              .fillColor('#6B7280')
              .fontSize(6.8)
              .font('Helvetica')
              .text(specs, margin + 48, currentY + 24, {
                width: 236,
                ellipsis: true,
              });

            // Unit Price
            doc
              .fillColor('#374151')
              .fontSize(8)
              .font('Helvetica')
              .text(`BDT ${Number(item.unitPrice).toLocaleString()}`, margin + 288, currentY + 18, {
                width: 70,
                align: 'right',
              });

            // Quantity / Carton
            doc
              .fillColor('#111827')
              .fontSize(8)
              .font('Helvetica-Bold')
              .text(`${item.quantity} pc${item.quantity > 1 ? 's' : ''}`, margin + 364, currentY + 18, {
                width: 56,
                align: 'center',
              });

            // Subtotal
            doc
              .fillColor('#073A2D')
              .fontSize(8.5)
              .font('Helvetica-Bold')
              .text(`BDT ${Number(item.subtotal).toLocaleString()}`, margin + 424, currentY + 18, {
                width: 90,
                align: 'right',
              });

            currentY += rowHeight;
          });
        } else {
          // Fallback row for legacy packages
          doc.rect(margin, currentY, contentWidth, rowHeight).fill('#FBFBFA');
          doc
            .lineWidth(0.5)
            .strokeColor('#E5E7EB')
            .moveTo(margin, currentY + rowHeight)
            .lineTo(margin + contentWidth, currentY + rowHeight)
            .stroke();

          doc
            .fillColor('#111827')
            .fontSize(8)
            .font('Helvetica-Bold')
            .text('Standard Atelier Apparel Package / Consignment Package', margin + 48, currentY + 12);
          doc
            .fillColor('#6B7280')
            .fontSize(6.8)
            .font('Helvetica')
            .text('Bespoke handcrafted collection from Rongin Libas atelier', margin + 48, currentY + 25);
          doc
            .fillColor('#073A2D')
            .fontSize(8.5)
            .font('Helvetica-Bold')
            .text(`BDT ${Number(order.subtotal).toLocaleString()}`, margin + 424, currentY + 18, {
              width: 90,
              align: 'right',
            });

          currentY += rowHeight;
        }

        // Outer border for table
        doc
          .lineWidth(0.5)
          .strokeColor('#E5E7EB')
          .roundedRect(margin, tableY, contentWidth, currentY - tableY, 3)
          .stroke();

        // ==========================================
        // 4. SUMMARY & BARCODE SECTION
        // ==========================================
        const summarySecY = currentY + 12;

        // Left Side: Airway Barcode & Concierge Note
        drawBarcode(doc, order.orderNumber, margin + 8, summarySecY + 4, 180, 22);
        doc
          .fillColor('#374151')
          .fontSize(7)
          .font('Helvetica-Bold')
          .text(`* ${order.orderNumber} *`, margin + 8, summarySecY + 28, { width: 180, align: 'center' });

        doc
          .fillColor('#073A2D')
          .fontSize(7)
          .font('Helvetica-Bold')
          .text('OFFICIAL DISPATCH CERTIFICATE & CONSIGNMENT BILL', margin + 8, summarySecY + 42);
        doc
          .fillColor('#6B7280')
          .fontSize(6.5)
          .font('Helvetica')
          .text('This computer-generated tax invoice is officially valid without physical signature.', margin + 8, summarySecY + 53);
        doc
          .fillColor('#6B7280')
          .fontSize(6.5)
          .font('Helvetica')
          .text('For fitting adjustments or concierge support, call +880 1700-000000.', margin + 8, summarySecY + 63);

        // Right Side: Financial Breakdown Box
        const summaryBoxW = 236;
        const summaryBoxX = margin + contentWidth - summaryBoxW;
        const summaryBoxH = Number(order.discountAmount) > 0 ? 94 : 80;

        doc.roundedRect(summaryBoxX, summarySecY, summaryBoxW, summaryBoxH, 4).fill('#F8FAFC');
        doc.lineWidth(0.5).strokeColor('#E2E8F0').roundedRect(summaryBoxX, summarySecY, summaryBoxW, summaryBoxH, 4).stroke();

        let sY = summarySecY + 8;
        doc
          .fillColor('#4B5563')
          .fontSize(7.5)
          .font('Helvetica')
          .text('Items Subtotal:', summaryBoxX + 12, sY);
        doc
          .fillColor('#111827')
          .fontSize(7.5)
          .font('Helvetica-Bold')
          .text(`BDT ${Number(order.subtotal).toLocaleString()}`, summaryBoxX + 100, sY, {
            width: summaryBoxW - 112,
            align: 'right',
          });

        sY += 15;
        const deliveryStr =
          Number(order.deliveryCharge) === 0 ? 'FREE' : `BDT ${Number(order.deliveryCharge).toLocaleString()}`;
        doc
          .fillColor('#4B5563')
          .fontSize(7.5)
          .font('Helvetica')
          .text('Packaging & Delivery:', summaryBoxX + 12, sY);
        doc
          .fillColor(Number(order.deliveryCharge) === 0 ? '#059669' : '#111827')
          .fontSize(7.5)
          .font('Helvetica-Bold')
          .text(deliveryStr, summaryBoxX + 100, sY, {
            width: summaryBoxW - 112,
            align: 'right',
          });

        if (Number(order.discountAmount) > 0) {
          sY += 15;
          doc
            .fillColor('#059669')
            .fontSize(7.5)
            .font('Helvetica')
            .text('Promotional Voucher:', summaryBoxX + 12, sY);
          doc
            .fillColor('#059669')
            .fontSize(7.5)
            .font('Helvetica-Bold')
            .text(`- BDT ${Number(order.discountAmount).toLocaleString()}`, summaryBoxX + 100, sY, {
              width: summaryBoxW - 112,
              align: 'right',
            });
        }

        sY += 16;
        // Total Payable Highlight Banner
        const totalBannerH = 24;
        doc.roundedRect(summaryBoxX + 6, sY, summaryBoxW - 12, totalBannerH, 3).fill('#073A2D');
        doc
          .fillColor('#FFFFFF')
          .fontSize(8)
          .font('Helvetica-Bold')
          .text('TOTAL AMOUNT:', summaryBoxX + 14, sY + 7);
        doc
          .fillColor('#D4AF37')
          .fontSize(9.5)
          .font('Helvetica-Bold')
          .text(`BDT ${Number(order.totalAmount).toLocaleString()}`, summaryBoxX + 100, sY + 6, {
            width: summaryBoxW - 122,
            align: 'right',
          });

        // ==========================================
        // 5. ATELIER FOOTER & RETURN POLICY
        // ==========================================
        const footerY = 746;
        doc.lineWidth(0.5).strokeColor('#E2E8F0').moveTo(margin, footerY).lineTo(margin + contentWidth, footerY).stroke();

        const colW = contentWidth / 3;
        doc
          .fillColor('#073A2D')
          .fontSize(7)
          .font('Helvetica-Bold')
          .text('AUTHENTICITY GUARANTEE', margin, footerY + 8);
        doc
          .fillColor('#6B7280')
          .fontSize(6.5)
          .font('Helvetica')
          .text('Handcrafted garments curated with premium fabrics and artisanal finish.', margin, footerY + 18, {
            width: colW - 14,
          });

        doc
          .fillColor('#073A2D')
          .fontSize(7)
          .font('Helvetica-Bold')
          .text('7-DAY HASSLE-FREE EXCHANGE', margin + colW, footerY + 8);
        doc
          .fillColor('#6B7280')
          .fontSize(6.5)
          .font('Helvetica')
          .text('Unworn apparel with tags intact is eligible for exchange within 7 days.', margin + colW, footerY + 18, {
            width: colW - 14,
          });

        doc
          .fillColor('#073A2D')
          .fontSize(7)
          .font('Helvetica-Bold')
          .text('ATELIER DEDICATION', margin + colW * 2, footerY + 8);
        doc
          .fillColor('#6B7280')
          .fontSize(6.5)
          .font('Helvetica')
          .text('Thank you for patronizing Rongin Libas. Cloth Your Identity.', margin + colW * 2, footerY + 18, {
            width: colW - 14,
          });

        doc
          .fillColor('#9CA3AF')
          .fontSize(6)
          .font('Helvetica')
          .text(
            '© 2026 Rongin Libas. Registered in Bangladesh. Uttara Hub, Dhaka. All rights reserved. www.ronginlibas.com',
            margin,
            footerY + 44,
            { width: contentWidth, align: 'center' },
          );

        doc.end();
      } catch (err) {
        reject(err);
      }
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

const __moduleFilename = fileURLToPath(import.meta.url);
const __moduleDirname = path.dirname(__moduleFilename);

let cachedLogoBuffer: Buffer | null = null;

function getLogoBuffer(): Buffer | null {
  if (cachedLogoBuffer) return cachedLogoBuffer;
  const candidates = [
    path.resolve(__moduleDirname, '../../assets/logo.png'),
    path.resolve(__moduleDirname, '../../../src/assets/logo.png'),
    path.resolve(process.cwd(), 'src/assets/logo.png'),
    path.resolve(process.cwd(), 'dist/assets/logo.png'),
    path.resolve(process.cwd(), 'server/src/assets/logo.png'),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) {
      try {
        cachedLogoBuffer = fs.readFileSync(p);
        return cachedLogoBuffer;
      } catch {
        // continue
      }
    }
  }
  return null;
}

async function fetchThumbnailBuffer(rawUrl?: string | null): Promise<Buffer | null> {
  if (!rawUrl) return null;
  try {
    let url = rawUrl;
    if (url.includes('/image/upload/')) {
      url = url.replace('/image/upload/', '/image/upload/f_jpg,w_100,h_120,c_fill/');
    }
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const arrayBuffer = await res.arrayBuffer();
    const buf = Buffer.from(arrayBuffer);
    if (
      (buf[0] === 0xff && buf[1] === 0xd8) ||
      (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47)
    ) {
      return buf;
    }
    return null;
  } catch {
    return null;
  }
}

function formatInvoiceDate(date: Date): string {
  try {
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  } catch {
    return date.toISOString().slice(0, 10);
  }
}

function drawBarcode(
  doc: any,
  value: string,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const clean = (value || 'RL001').toUpperCase().replace(/[^A-Z0-9]/g, '');
  const pattern = [2, 1, 3, 1, 1, 2, 3, 2];
  for (let i = 0; i < clean.length; i++) {
    const code = clean.charCodeAt(i);
    pattern.push((code % 3) + 1.2);
    pattern.push(((code * 3) % 2) + 1);
    pattern.push(((code * 7) % 3) + 1.2);
    pattern.push(1);
  }
  pattern.push(3, 1, 2, 1, 3);
  const totalUnits = pattern.reduce((acc, val) => acc + val, 0);
  const scale = width / totalUnits;
  let currX = x;
  doc.save();
  pattern.forEach((w, idx) => {
    const barW = w * scale;
    if (idx % 2 === 0) {
      doc.rect(currX, y, barW, height).fill('#111827');
    }
    currX += barW;
  });
  doc.restore();
}

function normalizeBangladeshPhone(phone: string): string {
  const cleaned = phone.replace(/[^\d+]/g, '');
  if (cleaned.startsWith('+880')) return cleaned;
  if (cleaned.startsWith('880')) return `+${cleaned}`;
  if (cleaned.startsWith('0')) return `+88${cleaned}`;
  return cleaned;
}

