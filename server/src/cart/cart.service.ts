import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ProductVariant } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { SettingsService } from '../settings/services/settings.service.js';
import { MailService } from '../mail/mail.service.js';
import { AuditService, type AdminAuditActor } from '../audit/audit.service.js';
import { AdminCartQueryDto } from './dto/cart-item.dto.js';

@Injectable()
export class CartService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly settingsService: SettingsService,
    private readonly mailService: MailService,
    private readonly auditService: AuditService,
  ) {}

  async openCart(customerId?: string, cartId?: string) {
    if (customerId) {
      const cart = await this.prisma.cart.upsert({
        where: { customerId },
        update: {},
        create: { customerId },
        select: { id: true },
      });
      return this.getCart(customerId, cart.id);
    }
    const guestId = cartId || randomUUID();
    await this.prisma.cart.upsert({
      where: { guestId },
      update: {},
      create: { guestId },
      select: { id: true },
    });
    return this.getCart(undefined, guestId);
  }

  async getCart(customerId?: string, cartId?: string) {
    const cart = await this.findCart(customerId, cartId);
    if (!cart) return { cartId: cartId ?? null, items: [], subtotal: 0, deliveryCharge: 0, total: 0, currency: 'BDT' };
    const cartWithItems = await this.prisma.cart.findUniqueOrThrow({
      where: { id: cart.id },
      select: {
        id: true,
        guestId: true,
        items: {
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            quantity: true,
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                compareAtPrice: true,
                isActive: true,
                images: {
                  select: { url: true, altText: true, isPrimary: true },
                  orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
                },
              },
            },
            variant: {
              select: {
                id: true,
                size: true,
                sizeLabel: true,
                color: true,
                priceOverride: true,
                stock: true,
                isActive: true,
              },
            },
          },
        },
      },
    });
    const items = cartWithItems.items.map((item) => {
      const unitPrice = item.variant.priceOverride
        ? Number(item.variant.priceOverride)
        : Number(item.product.price);
      return {
        id: item.id,
        product: {
          id: item.product.id,
          name: item.product.name,
          slug: item.product.slug,
          image: item.product.images[0] ?? null,
        },
        variant: {
          id: item.variant.id,
          size: item.variant.size,
          sizeLabel: item.variant.sizeLabel,
          color: item.variant.color,
          availability:
            item.product.isActive && item.variant.isActive && item.variant.stock > 0
              ? 'IN_STOCK'
              : 'OUT_OF_STOCK',
        },
        quantity: item.quantity,
        unitPrice,
        lineTotal: unitPrice * item.quantity,
      };
    });
    const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
    const settings = await this.settingsService.getPublicSettings();
    const isFree =
      settings.freeShippingEnabled !== false &&
      subtotal >= Number(settings.freeDeliveryThreshold);
    // In shopping cart before checkout, address is not chosen yet, so delivery is 0 until address is selected
    const deliveryCharge = 0;
    return {
      cartId: cartWithItems.guestId ?? cartWithItems.id,
      items,
      subtotal,
      discountAmount: 0,
      deliveryCharge,
      total: subtotal,
      currency: 'BDT',
    };
  }

  async addItem(customerId: string | undefined, cartId: string | undefined, variantId: string, quantity: number) {
    const cart = await this.requireCart(customerId, cartId);
    await this.prisma.$transaction(async (transaction) => {
      const variant = await transaction.productVariant.findUnique({
        where: { id: variantId },
        include: { product: { select: { isActive: true } } },
      });
      this.assertAvailable(variant, cart.id, quantity);
      const existing = await transaction.cartItem.findUnique({
        where: { cartId_variantId: { cartId: cart.id, variantId } },
        select: { quantity: true },
      });
      const nextQuantity = (existing?.quantity ?? 0) + quantity;
      this.assertStock(variant, nextQuantity);
      await transaction.cartItem.upsert({
        where: { cartId_variantId: { cartId: cart.id, variantId } },
        update: { quantity: nextQuantity },
        create: {
          cartId: cart.id,
          productId: variant.productId,
          variantId,
          quantity,
        },
      });
    });
    return this.getCart(customerId, cart.guestId ?? cart.id);
  }

  async updateItem(
    customerId: string | undefined,
    cartId: string | undefined,
    itemId: string,
    quantity: number,
  ) {
    const cart = await this.requireCart(customerId, cartId);
    const item = await this.prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
      select: { id: true, variantId: true },
    });
    if (!item) throw new NotFoundException('Cart item not found');
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: item.variantId },
      include: { product: { select: { isActive: true } } },
    });
    this.assertAvailable(variant, cart.id, quantity);
    this.assertStock(variant, quantity);
    await this.prisma.cartItem.update({
      where: { id: item.id },
      data: { quantity },
    });
    return this.getCart(customerId, cart.guestId ?? cart.id);
  }

  async removeItem(customerId: string | undefined, cartId: string | undefined, itemId: string) {
    const cart = await this.requireCart(customerId, cartId);
    const result = await this.prisma.cartItem.deleteMany({
      where: { id: itemId, cartId: cart.id },
    });
    if (result.count === 0) throw new NotFoundException('Cart item not found');
    return this.getCart(customerId, cart.guestId ?? cart.id);
  }

  async clearCart(customerId: string | undefined, cartId: string | undefined) {
    const cart = await this.requireCart(customerId, cartId);
    await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    return this.getCart(customerId, cart.guestId ?? cart.id);
  }

  async mergeGuestCart(customerId: string, guestId: string) {
    if (!guestId) throw new BadRequestException('A guest cart identifier is required');
    const customerCartId = await this.prisma.$transaction(async (transaction) => {
      const guestCart = await transaction.cart.findUnique({
        where: { guestId },
        include: { items: true },
      });
      if (!guestCart) {
        const cart = await transaction.cart.upsert({
          where: { customerId },
          update: {},
          create: { customerId },
          select: { id: true },
        });
        return cart.id;
      }
      const customerCart = await transaction.cart.upsert({
        where: { customerId },
        update: {},
        create: { customerId },
      });
      for (const item of guestCart.items) {
        const variant = await transaction.productVariant.findUnique({
          where: { id: item.variantId },
          include: { product: { select: { isActive: true } } },
        });
        this.assertAvailable(variant, customerCart.id, item.quantity);
        const existing = await transaction.cartItem.findUnique({
          where: {
            cartId_variantId: { cartId: customerCart.id, variantId: item.variantId },
          },
          select: { quantity: true },
        });
        const quantity = (existing?.quantity ?? 0) + item.quantity;
        this.assertStock(variant, quantity);
        await transaction.cartItem.upsert({
          where: {
            cartId_variantId: { cartId: customerCart.id, variantId: item.variantId },
          },
          update: { quantity },
          create: {
            cartId: customerCart.id,
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
          },
        });
      }
      await transaction.cart.delete({ where: { id: guestCart.id } });
      return customerCart.id;
    });
    return this.getCart(customerId, customerCartId);
  }

  async saveContact(
    customerId: string | undefined,
    cartId: string | undefined,
    contact: { email?: string; phone?: string; name?: string },
  ) {
    const cart = await this.findCart(customerId, cartId);
    if (!cart) return null;
    return this.prisma.cart.update({
      where: { id: cart.id },
      data: {
        guestEmail: contact.email?.trim() || undefined,
        guestPhone: contact.phone?.trim() || undefined,
        guestName: contact.name?.trim() || undefined,
      },
    });
  }

  /**
   * Restore items from an unpaid or failed order back to customer/guest cart without duplicating.
   * If the order is still PENDING, cancels it and releases the reserved stock so it can be re-purchased.
   */
  async restoreOrderToCart(
    customerId: string | undefined,
    cartId: string | undefined,
    orderId: string,
    phone?: string,
    trackingToken?: string,
  ) {
    if (!orderId) {
      throw new BadRequestException('An order reference is required to restore items');
    }

    const order = await this.prisma.order.findFirst({
      where: {
        OR: [
          { id: orderId },
          { orderNumber: orderId },
          { orderNumber: orderId.startsWith('#') ? orderId : `#${orderId}` },
        ],
      },
      include: {
        items: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order "${orderId}" not found`);
    }

    // Ownership verification
    if (order.customerId) {
      if (customerId && customerId !== order.customerId) {
        throw new ForbiddenException('You do not have permission to restore this order');
      }
    } else {
      const shippingAddress: any = order.shippingAddress || {};
      const expectedPhone = (
        order.guestPhone ||
        shippingAddress.phone ||
        shippingAddress.receiverPhone ||
        ''
      )
        .replace(/\D/g, '')
        .slice(-11);

      const suppliedPhone = (phone || '').replace(/\D/g, '').slice(-11);
      const phoneMatches = Boolean(expectedPhone && suppliedPhone && expectedPhone === suppliedPhone);
      const tokenMatches = Boolean(trackingToken && order.trackingTokenHash);

      if (!customerId && !phoneMatches && !tokenMatches) {
        throw new ForbiddenException('Guest order access could not be verified');
      }
    }

    // Status guard: Never restore items after a successful payment
    if (order.paymentStatus === 'PAID') {
      throw new BadRequestException('Cannot restore items from an already paid order');
    }

    const cart = await this.requireCart(customerId, cartId);

    // If order was still PENDING, release stock and cancel it so items can be checked out again
    if (order.status === 'PENDING') {
      await this.prisma.$transaction(async (tx) => {
        for (const item of order.items) {
          if (!item.variantId) continue;
          const variant = await tx.productVariant.findUnique({
            where: { id: item.variantId },
            select: { id: true, stock: true },
          });
          if (!variant) continue;
          await tx.productVariant.updateMany({
            where: { id: variant.id, stock: variant.stock },
            data: { stock: variant.stock + item.quantity },
          });
          await tx.inventoryTransaction.create({
            data: {
              variantId: variant.id,
              quantityChange: item.quantity,
              previousStock: variant.stock,
              newStock: variant.stock + item.quantity,
              type: 'RETURN',
              note: `Cart restoration from unpaid order ${order.orderNumber}`,
            },
          });
        }

        await tx.order.update({
          where: { id: order.id },
          data: {
            status: 'CANCELLED',
            paymentStatus: 'FAILED',
          },
        });

        await tx.orderTrackingEvent.create({
          data: {
            orderId: order.id,
            status: 'CANCELLED',
            description: 'Order cancelled and items restored to cart for checkout.',
            customerVisible: true,
          },
        });
      });
    }

    // Restore items to cart without duplicating existing items
    for (const item of order.items) {
      if (!item.variantId) continue;
      const variant = await this.prisma.productVariant.findUnique({
        where: { id: item.variantId },
        include: { product: { select: { isActive: true } } },
      });

      if (!variant || !variant.isActive || !variant.product.isActive) {
        continue;
      }

      const existingCartItem = await this.prisma.cartItem.findUnique({
        where: {
          cartId_variantId: {
            cartId: cart.id,
            variantId: item.variantId,
          },
        },
      });

      if (!existingCartItem) {
        const eligibleQty = Math.max(1, Math.min(item.quantity, variant.stock));
        if (eligibleQty > 0) {
          await this.prisma.cartItem.create({
            data: {
              cartId: cart.id,
              productId: variant.productId,
              variantId: variant.id,
              quantity: eligibleQty,
            },
          });
        }
      }
    }

    return this.getCart(customerId, cart.guestId ?? cart.id);
  }

  async getAdminCarts(query: AdminCartQueryDto) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const where: any = {};

    if (query.filter === 'WITH_ITEMS') {
      where.items = { some: {} };
    } else if (query.filter === 'ABANDONED') {
      where.items = { some: {} };
      where.updatedAt = { lt: oneHourAgo };
    } else if (query.filter === 'REMINDED') {
      where.reminderCount = { gt: 0 };
    } else if (query.filter === 'HAS_EMAIL') {
      where.items = { some: {} };
      where.OR = [
        { guestEmail: { not: null } },
        { customer: { email: { not: null } } },
      ];
    }

    if (query.search?.trim()) {
      const s = query.search.trim();
      where.OR = [
        { guestEmail: { contains: s, mode: 'insensitive' } },
        { guestName: { contains: s, mode: 'insensitive' } },
        { guestPhone: { contains: s } },
        { customer: { firstName: { contains: s, mode: 'insensitive' } } },
        { customer: { lastName: { contains: s, mode: 'insensitive' } } },
        { customer: { email: { contains: s, mode: 'insensitive' } } },
        { customer: { phone: { contains: s } } },
        { id: { contains: s } },
      ];
    }

    const [total, carts, allCartsWithItems] = await Promise.all([
      this.prisma.cart.count({ where }),
      this.prisma.cart.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          customer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
          items: {
            orderBy: { createdAt: 'desc' },
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  price: true,
                  images: {
                    select: { url: true },
                    orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
                    take: 1,
                  },
                },
              },
              variant: {
                select: {
                  id: true,
                  size: true,
                  color: true,
                  stock: true,
                  priceOverride: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.cart.findMany({
        where: { items: { some: {} } },
        select: {
          id: true,
          updatedAt: true,
          reminderCount: true,
          items: {
            select: {
              quantity: true,
              product: { select: { price: true } },
              variant: { select: { priceOverride: true } },
            },
          },
        },
      }),
    ]);

    let totalPotentialRevenue = 0;
    let totalAbandonedCount = 0;
    let totalRemindersSent = 0;

    for (const c of allCartsWithItems) {
      if (c.updatedAt < oneHourAgo) totalAbandonedCount++;
      if (c.reminderCount > 0) totalRemindersSent += c.reminderCount;
      for (const it of c.items) {
        const p = it.variant.priceOverride ? Number(it.variant.priceOverride) : Number(it.product.price);
        totalPotentialRevenue += p * it.quantity;
      }
    }

    const formattedCarts = carts.map((cart) => {
      let subtotal = 0;
      let totalQuantity = 0;

      const items = cart.items.map((item) => {
        const unitPrice = item.variant.priceOverride
          ? Number(item.variant.priceOverride)
          : Number(item.product.price);
        const lineTotal = unitPrice * item.quantity;
        subtotal += lineTotal;
        totalQuantity += item.quantity;

        return {
          id: item.id,
          productId: item.productId,
          productName: item.product.name,
          slug: item.product.slug,
          image: item.product.images[0]?.url || null,
          variantId: item.variantId,
          size: item.variant.size,
          color: item.variant.color,
          stock: item.variant.stock,
          unitPrice,
          quantity: item.quantity,
          lineTotal,
        };
      });

      const customerName =
        cart.customer
          ? `${cart.customer.firstName} ${cart.customer.lastName || ''}`.trim()
          : cart.guestName || null;
      const email = cart.customer?.email || cart.guestEmail || null;
      const phone = cart.customer?.phone || cart.guestPhone || null;

      const isAbandoned = cart.items.length > 0 && cart.updatedAt < oneHourAgo;

      return {
        id: cart.id,
        guestId: cart.guestId,
        customerId: cart.customerId,
        isRegistered: Boolean(cart.customerId),
        customerName: customerName || 'Anonymous Guest',
        email,
        phone,
        hasEmail: Boolean(email),
        itemsCount: cart.items.length,
        totalQuantity,
        subtotal,
        isAbandoned,
        lastReminderSentAt: cart.lastReminderSentAt,
        reminderCount: cart.reminderCount,
        createdAt: cart.createdAt,
        updatedAt: cart.updatedAt,
        items,
      };
    });

    return {
      carts: formattedCarts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        totalCartsWithItems: allCartsWithItems.length,
        totalAbandonedCount,
        totalPotentialRevenue,
        totalRemindersSent,
      },
    };
  }

  async getAdminCartById(id: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        items: {
          orderBy: { createdAt: 'asc' },
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                images: {
                  select: { url: true },
                  orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
                  take: 1,
                },
              },
            },
            variant: {
              select: {
                id: true,
                size: true,
                color: true,
                stock: true,
                priceOverride: true,
              },
            },
          },
        },
      },
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    let subtotal = 0;
    const items = cart.items.map((item) => {
      const unitPrice = item.variant.priceOverride
        ? Number(item.variant.priceOverride)
        : Number(item.product.price);
      const lineTotal = unitPrice * item.quantity;
      subtotal += lineTotal;

      return {
        id: item.id,
        productId: item.productId,
        productName: item.product.name,
        slug: item.product.slug,
        image: item.product.images[0]?.url || null,
        variantId: item.variantId,
        size: item.variant.size,
        color: item.variant.color,
        stock: item.variant.stock,
        unitPrice,
        quantity: item.quantity,
        lineTotal,
      };
    });

    const customerName =
      cart.customer
        ? `${cart.customer.firstName} ${cart.customer.lastName || ''}`.trim()
        : cart.guestName || null;
    const email = cart.customer?.email || cart.guestEmail || null;
    const phone = cart.customer?.phone || cart.guestPhone || null;

    return {
      id: cart.id,
      guestId: cart.guestId,
      customerId: cart.customerId,
      isRegistered: Boolean(cart.customerId),
      customerName: customerName || 'Anonymous Guest',
      email,
      phone,
      hasEmail: Boolean(email),
      itemsCount: cart.items.length,
      subtotal,
      lastReminderSentAt: cart.lastReminderSentAt,
      reminderCount: cart.reminderCount,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
      items,
    };
  }

  async sendCartReminder(cartId: string, customMessage?: string, actor?: AdminAuditActor) {
    const cart = await this.prisma.cart.findUnique({
      where: { id: cartId },
      include: {
        customer: true,
        items: {
          include: {
            product: {
              include: {
                images: {
                  orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
                  take: 1,
                },
              },
            },
            variant: true,
          },
        },
      },
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    if (cart.items.length === 0) {
      throw new BadRequestException('Cannot send reminder for an empty cart');
    }

    const email = cart.customer?.email || cart.guestEmail;
    if (!email) {
      throw new BadRequestException('No email address associated with this cart');
    }

    const customerName = cart.customer
      ? `${cart.customer.firstName} ${cart.customer.lastName || ''}`.trim()
      : cart.guestName || 'Valued Patron';

    let subtotal = 0;
    const reminderItems = cart.items.map((item) => {
      const unitPrice = item.variant.priceOverride
        ? Number(item.variant.priceOverride)
        : Number(item.product.price);
      const lineTotal = unitPrice * item.quantity;
      subtotal += lineTotal;

      return {
        productName: item.product.name,
        variantName: item.variant.color ? `${item.variant.size} - ${item.variant.color}` : item.variant.size,
        size: item.variant.size,
        color: item.variant.color,
        quantity: item.quantity,
        unitPrice,
        subtotal: lineTotal,
        productImage: item.product.images[0]?.url || null,
      };
    });

    const settings = await this.settingsService.getPublicSettings();
    const deliveryCharge =
      settings.freeShippingEnabled !== false && subtotal >= Number(settings.freeDeliveryThreshold)
        ? 0
        : Number(settings.outsideDhakaDeliveryCharge);
    const totalAmount = subtotal + deliveryCharge;

    const emailSent = await this.mailService.sendAbandonedCartReminderEmail({
      email,
      customerName,
      items: reminderItems,
      subtotal,
      totalAmount,
      cartId: cart.guestId || cart.id,
      customMessage: customMessage || undefined,
    });

    if (!emailSent) {
      throw new BadRequestException('Failed to dispatch reminder email via mail server');
    }

    const updated = await this.prisma.cart.update({
      where: { id: cart.id },
      data: {
        lastReminderSentAt: new Date(),
        reminderCount: { increment: 1 },
      },
    });

    if (actor) {
      await this.auditService.record({
        actor,
        module: 'CARTS',
        action: 'SEND_REMINDER',
        entityType: 'Cart',
        entityId: cart.id,
        entityLabel: `${customerName} (${email})`,
        summary: `Dispatched abandoned cart recovery awareness email to ${email} (${reminderItems.length} items, ৳${totalAmount})`,
      });
    }

    return {
      success: true,
      email,
      reminderCount: updated.reminderCount,
      lastReminderSentAt: updated.lastReminderSentAt,
    };
  }

  private async findCart(customerId?: string, cartId?: string) {
    if (customerId) return this.prisma.cart.findUnique({ where: { customerId } });
    if (!cartId) return null;
    return this.prisma.cart.findUnique({ where: { guestId: cartId } });
  }

  private async requireCart(customerId?: string, cartId?: string) {
    const cart = await this.findCart(customerId, cartId);
    if (cart) return cart;
    if (customerId) {
      return this.prisma.cart.upsert({
        where: { customerId },
        update: {},
        create: { customerId },
      });
    }
    if (!cartId) throw new BadRequestException('A guest cart identifier is required');
    throw new NotFoundException('Cart not found');
  }

  private assertAvailable(
    variant: (ProductVariant & { product: { isActive: boolean } }) | null,
    _cartId: string,
    quantity: number,
  ): asserts variant is ProductVariant & { product: { isActive: boolean } } {
    if (!variant || !variant.isActive || !variant.product.isActive) {
      throw new NotFoundException('Product variant is unavailable');
    }
    this.assertStock(variant, quantity);
  }

  private assertStock(variant: ProductVariant | null, quantity: number): asserts variant is ProductVariant {
    if (!variant || variant.stock < quantity) {
      throw new BadRequestException('Requested quantity exceeds available stock');
    }
  }
}
