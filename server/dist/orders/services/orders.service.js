var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var OrdersService_1;
import { BadRequestException, ForbiddenException, Injectable, Logger, NotFoundException, Optional, ServiceUnavailableException, } from '@nestjs/common';
import { OrderStatus, PaymentMethod, PaymentStatus, Prisma } from '@prisma/client';
import { generateInvoicePdf } from './invoice-generator.js';
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { PrismaService } from '../../prisma/prisma.service.js';
import { SettingsService } from '../../settings/services/settings.service.js';
import { MailService } from '../../mail/mail.service.js';
import { Ga4MeasurementProtocolService } from '../../analytics/services/ga4-measurement-protocol.service.js';
import { InvoicesService } from './invoices.service.js';
import { canMarkOrderDelivered, canProcessReturn, normalizePathaoStatus, getCustomerSafeCourierStatus, } from '../../pathao/status/courier-status.types.js';
import { getCustomerSafeShipmentStatus } from '../../courier/status/steadfast-status.mapper.js';
function roundCurrency(val) {
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
};
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
    invoice: {
        select: {
            id: true,
            invoiceNumber: true,
            status: true,
            issuedAt: true,
            totalAmount: true,
        },
    },
    trackingEvents: {
        where: { customerVisible: true },
        select: { status: true, description: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
    },
};
const customerOrderDetailSelect = {
    ...customerOrderSelect,
};
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
};
let OrdersService = OrdersService_1 = class OrdersService {
    prisma;
    settingsService;
    mailService;
    ga4Service;
    invoicesService;
    logger = new Logger(OrdersService_1.name);
    constructor(prisma, settingsService, mailService, ga4Service, invoicesService) {
        this.prisma = prisma;
        this.settingsService = settingsService;
        this.mailService = mailService;
        this.ga4Service = ga4Service;
        this.invoicesService = invoicesService;
    }
    async findAll(query) {
        try {
            await this.cancelExpiredUnpaidOrders(120);
        }
        catch (e) {
            this.logger.warn(`Failed to auto-clean expired unpaid orders: ${e?.message}`);
        }
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        const where = {};
        if (query.status && query.status !== 'ALL')
            where.status = query.status;
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
                    invoice: {
                        select: {
                            id: true,
                            invoiceNumber: true,
                            status: true,
                            issuedAt: true,
                            totalAmount: true,
                        },
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
    async findById(id) {
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
                invoice: {
                    include: {
                        items: true,
                        payments: {
                            orderBy: { createdAt: 'desc' },
                        },
                    },
                },
                trackingEvents: { orderBy: { createdAt: 'asc' } },
            },
        });
        if (!order)
            throw new NotFoundException(`Order not found: ${id}`);
        const { trackingTokenHash: _trackingTokenHash, ...safeOrder } = order;
        return safeOrder;
    }
    async findCustomerOrders(customerId, query) {
        try {
            await this.cancelExpiredUnpaidOrders(120);
        }
        catch (e) {
            this.logger.warn(`Failed to auto-clean expired unpaid orders: ${e?.message}`);
        }
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        const where = {
            customerId,
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
    async findCustomerOrder(customerId, orderNumber) {
        const order = await this.prisma.order.findFirst({
            where: { customerId, orderNumber: this.normalizeOrderNumber(orderNumber) },
            select: customerOrderDetailSelect,
        });
        if (!order)
            throw new NotFoundException('Order not found');
        return order;
    }
    async releaseOrderStockInTx(transaction, order, reason = 'Order cancellation') {
        for (const item of order.items) {
            if (!item.variantId)
                continue;
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
    async cancelExpiredUnpaidOrders(timeoutMinutes = 120) {
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
                    await this.releaseOrderStockInTx(tx, order, `Payment timeout (${timeoutMinutes}m) stock release:`);
                    await tx.order.delete({
                        where: { id: order.id },
                    });
                });
                cancelledCount++;
                this.logger.log(`[Inventory] Released reserved stock and deleted expired unpaid order ${order.orderNumber}`);
            }
            catch (err) {
                this.logger.error(`Failed to release expired order ${order.orderNumber}: ${err.message}`);
            }
        }
        return cancelledCount;
    }
    async deleteUnpaidOrFailedOrder(orderId, reason = 'Payment failed / cancelled') {
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
            await this.releaseOrderStockInTx(tx, order, reason);
            await tx.order.delete({
                where: { id: order.id },
            });
        });
        this.logger.log(`[Orders] Unpaid/failed order ${order.orderNumber} deleted and stock released (${reason})`);
        return {
            success: true,
            orderNumber: order.orderNumber,
            message: `Order ${order.orderNumber} deleted and inventory stock restored`,
        };
    }
    async cancelCustomerOrder(orderId, customerId, phone, trackingToken) {
        const order = await this.findOrderForAccess(orderId, customerId, phone, trackingToken);
        if (order.status === OrderStatus.CANCELLED) {
            return order;
        }
        if (order.paymentStatus === PaymentStatus.PAID) {
            throw new BadRequestException('Cannot cancel an already paid order online. Please contact our atelier concierge for refund assistance.');
        }
        if (order.status !== OrderStatus.PENDING && order.status !== OrderStatus.CONFIRMED) {
            throw new BadRequestException(`Only unfulfilled orders can be cancelled online. Order #${order.orderNumber} is currently ${order.status}. Once packed or dispatched, please contact our atelier concierge.`);
        }
        const CANCELLATION_WINDOW_HOURS = 6;
        const orderAgeMs = Date.now() - new Date(order.createdAt).getTime();
        const maxAllowedMs = CANCELLATION_WINDOW_HOURS * 60 * 60 * 1000;
        const elapsedMinutes = Math.floor(orderAgeMs / (60 * 1000));
        const elapsedHours = (orderAgeMs / (60 * 60 * 1000)).toFixed(1);
        if (orderAgeMs > maxAllowedMs) {
            throw new BadRequestException(`The 6-hour cancellation window for Order #${order.orderNumber} has expired (placed ${elapsedHours} hours ago). Orders can only be self-cancelled within 6 hours of placement while in PENDING status. Please contact our concierge team for assistance.`);
        }
        const orderAgeText = elapsedMinutes < 60
            ? `${elapsedMinutes}m after placement`
            : `${elapsedHours}h after placement`;
        const cancellationNote = `Cancelled by patron within 6-hour window (${orderAgeText}) on ${new Date().toISOString()}`;
        const updatedOrder = await this.prisma.$transaction(async (tx) => {
            await this.releaseOrderStockInTx(tx, order, `Customer cancellation within 6h: #${order.orderNumber}`);
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
            await tx.orderTrackingEvent.create({
                data: {
                    orderId: order.id,
                    status: OrderStatus.CANCELLED,
                    description: `Order cancelled by patron within the 6-hour policy window. Reserved artisan inventory has been restored.`,
                },
            });
            return updated;
        });
        this.dispatchOrderStatusOrEditNotification(updatedOrder, OrderStatus.PENDING, true, ['Order cancelled by patron within 6-hour policy window']).catch((err) => {
            this.logger.warn(`Failed to dispatch customer cancellation email for ${order.orderNumber}: ${err.message}`);
        });
        if (this.mailService) {
            const shipping = order.shippingAddress || {};
            const customerName = order.customer
                ? `${order.customer.firstName} ${order.customer.lastName || ''}`.trim()
                : order.guestName || shipping.fullName || 'Patron';
            const customerPhone = order.customer?.phone || order.guestPhone || shipping.phone || null;
            const customerEmail = order.customer?.email || order.guestEmail || shipping.email || null;
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
                items: (order.items || []).map((item) => ({
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
                this.logger.warn(`Failed to dispatch admin cancellation alert for ${order.orderNumber}: ${err.message}`);
            });
        }
        return updatedOrder;
    }
    async cancelUnpaidOrder(orderId, customerId, phone, trackingToken) {
        return this.cancelCustomerOrder(orderId, customerId, phone, trackingToken);
    }
    async updateStatus(id, dto) {
        const { updated, previousStatus, statusChanged, changes } = await this.prisma.$transaction(async (transaction) => {
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
            if (!order)
                throw new NotFoundException(`Order not found: ${id}`);
            if (dto.status && order.status === 'CANCELLED' && dto.status !== 'CANCELLED') {
                throw new BadRequestException('A cancelled order cannot be reopened');
            }
            if (dto.status === 'CANCELLED' &&
                ['SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.status)) {
                throw new BadRequestException('An order cannot be cancelled after shipment');
            }
            if (dto.status === 'DELIVERED' && order.courierConsignmentId && !dto.overrideCourierStatus) {
                const courierNormalized = normalizePathaoStatus(order.courierStatus);
                if (!canMarkOrderDelivered(courierNormalized)) {
                    throw new BadRequestException(`Cannot transition order to DELIVERED: Courier shipment is not in a confirmed DELIVERED state (Current courier status: "${order.courierStatus || 'PENDING'}").`);
                }
            }
            if ((dto.status === 'RETURNED' || dto.status === 'REFUNDED') &&
                order.courierConsignmentId &&
                !dto.overrideCourierStatus) {
                const courierNormalized = normalizePathaoStatus(order.courierStatus);
                if (!canProcessReturn(courierNormalized)) {
                    throw new BadRequestException(`Cannot transition order to ${dto.status}: Courier shipment has not reached a verified return state (Current status: "${order.courierStatus || 'PENDING'}").`);
                }
            }
            if (dto.status && order.status !== 'CANCELLED' && dto.status === 'CANCELLED') {
                await this.releaseOrderStockInTx(transaction, order, 'Order cancellation');
            }
            const previousStatus = order.status;
            const statusChanged = dto.status !== undefined && dto.status !== previousStatus;
            const changes = [];
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
            const updateData = {
                ...(dto.status ? { status: dto.status } : {}),
                ...(dto.adminNotes !== undefined ? { adminNotes: dto.adminNotes } : {}),
                ...(dto.courierName !== undefined ? { courierName: dto.courierName } : {}),
                ...(dto.trackingNumber !== undefined ? { trackingNumber: dto.trackingNumber } : {}),
                ...(dto.trackingUrl !== undefined ? { trackingUrl: dto.trackingUrl } : {}),
                ...(dto.estimatedDelivery !== undefined
                    ? { estimatedDelivery: dto.estimatedDelivery ? new Date(dto.estimatedDelivery) : null }
                    : {}),
                ...(dto.shippingAddress ? { shippingAddress: dto.shippingAddress } : {}),
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
        }, { maxWait: 10000, timeout: 30000 });
        this.dispatchOrderStatusOrEditNotification(updated, previousStatus, statusChanged, changes).catch((err) => {
            this.logger.warn(`Failed to dispatch order notification for ${updated.orderNumber}: ${err.message}`);
        });
        if (this.ga4Service && ['CONFIRMED', 'PROCESSING'].includes(updated.status)) {
            this.ga4Service
                .sendPurchaseEvent({
                id: updated.id,
                orderNumber: updated.orderNumber,
                totalAmount: updated.totalAmount,
                customerId: updated.customerId,
                items: updated.items,
            })
                .catch((e) => this.logger.warn(`GA4 MP error on order status update: ${e?.message}`));
        }
        return updated;
    }
    async create(dto, customerId) {
        if (!dto.items.length)
            throw new BadRequestException('Order must contain at least one item');
        const guestName = customerId
            ? null
            : (dto.guestName?.trim() || dto.shippingAddress.fullName?.trim() || null);
        const guestPhone = customerId
            ? null
            : (dto.shippingAddress.phone?.trim() || null);
        const guestEmail = customerId
            ? null
            : (dto.guestEmail?.toLowerCase().trim() || dto.shippingAddress.email?.toLowerCase().trim() || null);
        let customerEmail = dto.shippingAddress.email?.toLowerCase().trim();
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
        if (paymentMethod !== 'COD' && paymentMethod !== 'UDDOKTAPAY') {
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
        const createdOrder = await this.prisma.$transaction(async (transaction) => {
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
                if (!variant)
                    throw new BadRequestException('A selected product variant is unavailable');
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
                const primaryImage = variant.product.images?.find((img) => img.isPrimary)?.url ||
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
            let couponId;
            if (dto.couponCode) {
                const coupon = await transaction.coupon.findUnique({
                    where: { code: dto.couponCode.trim().toUpperCase() },
                });
                const now = new Date();
                if (!coupon ||
                    !coupon.isActive ||
                    now < coupon.startDate ||
                    now > coupon.expiryDate ||
                    (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) ||
                    subtotal < Number(coupon.minimumOrderAmount)) {
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
                if (!update.count)
                    throw new BadRequestException('Coupon redemption limit has been reached');
            }
            const cityLower = (dto.shippingAddress.city || '').trim().toLowerCase();
            const divisionLower = (dto.shippingAddress.division || '').trim().toLowerCase();
            const areaLower = (dto.shippingAddress.area || '').trim().toLowerCase();
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
            const isDhaka = !isOutsideDhakaDistrict &&
                (cityLower === 'dhaka' ||
                    dhakaMetroAreas.some((a) => cityLower.includes(a) || areaLower.includes(a)) ||
                    (divisionLower.includes('dhaka') && (!cityLower || cityLower === 'dhaka')));
            const deliveryCharge = settings.freeShippingEnabled !== false &&
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
                    status: paymentMethod === 'COD' ? 'CONFIRMED' : 'PENDING',
                    paymentStatus: 'PENDING',
                    paymentMethod: paymentMethod,
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
                    },
                    customerNotes: dto.customerNotes,
                    items: { create: orderItems },
                    trackingEvents: {
                        create: {
                            status: paymentMethod === 'COD' ? 'CONFIRMED' : 'PENDING',
                            description: paymentMethod === 'COD' ? 'Order placed and confirmed' : 'Order received',
                        },
                    },
                },
                select: customerOrderDetailSelect,
            });
            return { order, couponId };
        }, { maxWait: 10000, timeout: 30000 });
        if (customerId) {
            this.saveAddressForCustomerIfEligible(customerId, dto.shippingAddress, customerEmail).catch((err) => {
                this.logger.warn(`Failed to auto-save address for customer ${customerId}: ${err.message}`);
            });
        }
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
                customerId: createdOrder.order.customerId,
                guestTrackingToken: trackingToken,
                items: createdOrder.order.items,
            })
                .catch((err) => this.logger.warn(`GA4 MP error on COD order: ${err?.message}`));
        }
        return responseOrder;
    }
    async createByAdmin(dto, actor) {
        if (!dto.items?.length) {
            throw new BadRequestException('Order must contain at least one item');
        }
        const variantIds = dto.items.map((item) => item.productVariantId || item.variantId);
        if (new Set(variantIds).size !== variantIds.length) {
            throw new BadRequestException('Each product variant must appear only once in an order');
        }
        let resolvedAddress = null;
        if (dto.addressId) {
            const savedAddress = await this.prisma.address?.findUnique?.({
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
            const rawAddr = dto.shippingAddress;
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
        const createdOrder = await this.prisma.$transaction(async (transaction) => {
            let customerId = dto.customerId?.trim() || null;
            let customerFirstName = null;
            let customerLastName = null;
            let customerEmail = null;
            let customerPhone = null;
            const custInput = dto.newCustomer || dto.customer;
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
            }
            else if (custInput) {
                const rawPhone = (custInput.phone || custInput.phoneNumber || '').trim();
                const rawEmail = custInput.email?.toLowerCase().trim() || null;
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
                }
                else {
                    const rawFullName = custInput.fullName ||
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
            const guestName = resolvedAddress.fullName ||
                (customerFirstName ? [customerFirstName, customerLastName].filter(Boolean).join(' ') : null);
            const guestPhone = resolvedAddress.phone || customerPhone;
            const guestEmail = resolvedAddress.email || customerEmail;
            const orderItems = [];
            let subtotal = 0;
            for (const item of dto.items) {
                const variantId = item.productVariantId || item.variantId;
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
                    throw new BadRequestException(`Insufficient stock: "${variant.product.name}" (${variant.color} - ${variant.sizeLabel || variant.size}) only has ${variant.stock} units in stock`);
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
                const primaryImage = variant.product.images?.find((img) => img.isPrimary)?.url ||
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
            let couponDiscount = 0;
            let couponId;
            if (dto.couponCode?.trim()) {
                const coupon = await transaction.coupon.findUnique({
                    where: { code: dto.couponCode.trim().toUpperCase() },
                });
                const now = new Date();
                if (!coupon ||
                    !coupon.isActive ||
                    now < coupon.startDate ||
                    now > coupon.expiryDate ||
                    (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) ||
                    subtotal < Number(coupon.minimumOrderAmount)) {
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
            let manualDiscountAmount = 0;
            if (dto.manualDiscountType && dto.manualDiscountValue && dto.manualDiscountValue > 0) {
                if (dto.manualDiscountType === 'PERCENTAGE') {
                    const pct = Math.min(100, Math.max(0, dto.manualDiscountValue));
                    manualDiscountAmount = roundCurrency((subtotal * pct) / 100);
                }
                else {
                    manualDiscountAmount = roundCurrency(Math.min(subtotal, dto.manualDiscountValue));
                }
            }
            const totalDiscount = Math.min(subtotal, roundCurrency(couponDiscount + manualDiscountAmount));
            let deliveryCharge;
            if (dto.deliveryCharge !== undefined && dto.deliveryCharge !== null) {
                deliveryCharge = Math.max(0, Number(dto.deliveryCharge));
            }
            else {
                const cityLower = (resolvedAddress.city || '').trim().toLowerCase();
                const divisionLower = (resolvedAddress.division || '').trim().toLowerCase();
                const areaLower = (resolvedAddress.area || '').trim().toLowerCase();
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
                const isDhaka = !isOutsideDhakaDistrict &&
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
            const paymentStatus = (rawStatus === 'UNPAID' ? 'PENDING' : rawStatus);
            let paidAmount = null;
            if (paymentStatus === 'PAID') {
                paidAmount = dto.paidAmount !== undefined ? dto.paidAmount : grandTotal;
            }
            else if (paymentStatus === 'PARTIALLY_PAID') {
                paidAmount = dto.paidAmount !== undefined ? dto.paidAmount : 0;
            }
            const creatorName = [actor?.firstName, actor?.lastName].filter(Boolean).join(' ') ||
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
                    paymentMethod: (dto.paymentMethod || 'COD'),
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
                        addressLine1: resolvedAddress.addressLine1,
                        city: resolvedAddress.city,
                        division: resolvedAddress.division,
                        phone: resolvedAddress.phone,
                        ...(resolvedAddress.addressLine2 ? { addressLine2: resolvedAddress.addressLine2 } : {}),
                        ...(resolvedAddress.fullName ? { fullName: resolvedAddress.fullName } : {}),
                        ...(resolvedAddress.email ? { email: resolvedAddress.email } : {}),
                        ...(resolvedAddress.area ? { area: resolvedAddress.area } : {}),
                        ...(resolvedAddress.postalCode ? { postalCode: resolvedAddress.postalCode } : {}),
                        ...(resolvedAddress.deliveryInstructions
                            ? { deliveryInstructions: resolvedAddress.deliveryInstructions }
                            : {}),
                    },
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
        }, { maxWait: 10000, timeout: 30000 });
        if (createdOrder.order.customerId && !dto.addressId && resolvedAddress) {
            this.saveAddressForCustomerIfEligible(createdOrder.order.customerId, resolvedAddress, resolvedAddress.email).catch((err) => {
                this.logger.warn(`Failed to auto-save address for customer ${createdOrder.order.customerId}: ${err.message}`);
            });
        }
        if (createdOrder.order.customer?.email || resolvedAddress.email) {
            this.dispatchOrderConfirmationNotification(createdOrder.order, undefined, createdOrder.order.customerId || undefined).catch((err) => {
                this.logger.warn(`Failed to dispatch order confirmation for admin order ${createdOrder.order.orderNumber}: ${err.message}`);
            });
        }
        return createdOrder.order;
    }
    async dispatchConfirmationNotificationForPaidOrder(orderId) {
        if (!this.mailService)
            return;
        try {
            const order = await this.prisma.order.findUnique({
                where: { id: orderId },
                include: {
                    items: true,
                    customer: true,
                },
            });
            if (!order)
                return;
            await this.dispatchOrderConfirmationNotification(order, undefined, order.customerId || undefined);
        }
        catch (err) {
            this.logger.warn(`Failed to dispatch confirmation email for verified order ${orderId}: ${err?.message}`);
        }
    }
    async dispatchOrderConfirmationNotification(order, trackingToken, customerId) {
        if (!this.mailService)
            return;
        let customerEmail;
        let customerName;
        const shipping = order.shippingAddress || {};
        if (shipping.email && typeof shipping.email === 'string')
            customerEmail = shipping.email.trim();
        if (shipping.fullName && typeof shipping.fullName === 'string')
            customerName = shipping.fullName.trim();
        if (!customerEmail && order.guestEmail)
            customerEmail = order.guestEmail.trim();
        if (!customerName && order.guestName)
            customerName = order.guestName.trim();
        if (!customerEmail && customerId) {
            const customer = await this.prisma.customer.findUnique({
                where: { id: customerId },
                select: { email: true, firstName: true, lastName: true },
            });
            if (customer) {
                if (!customerEmail && customer.email)
                    customerEmail = customer.email;
                if (!customerName) {
                    customerName = `${customer.firstName} ${customer.lastName || ''}`.trim();
                }
            }
        }
        if (!customerEmail) {
            this.logger.debug(`No recipient email address found for order ${order.orderNumber}. Skipping confirmation email.`);
            return;
        }
        const items = (order.items || []).map((item) => ({
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
        let invoiceBuffer;
        let customerInvoiceNumber;
        try {
            let invoice = await this.invoicesService?.findByOrderIdOrNumber(order.id);
            if (!invoice && order.paymentMethod === 'COD' && order.status !== 'CANCELLED') {
                if (this.invoicesService) {
                    invoice = await this.invoicesService.getOrCreateInvoiceForOrder(order.id);
                }
            }
            if (invoice) {
                customerInvoiceNumber = invoice.invoiceNumber;
                const orderForInvoice = {
                    ...order,
                    guestName: customerName,
                    guestPhone: shipping.phone || order.guestPhone,
                    guestEmail: customerEmail,
                };
                invoiceBuffer = await this.generateInvoiceBuffer(orderForInvoice, invoice);
                if (invoiceBuffer) {
                    this.logger.log(`Official PDF invoice generated for order confirmation: ${order.orderNumber} [${invoice.invoiceNumber}] (${invoiceBuffer.length} bytes)`);
                }
            }
        }
        catch (err) {
            this.logger.warn(`Could not generate PDF invoice attachment for ${order.orderNumber}: ${err.message}`);
        }
        await this.mailService.sendOrderConfirmationEmail({
            email: customerEmail,
            orderNumber: order.orderNumber,
            orderStatus: order.status,
            invoiceNumber: customerInvoiceNumber,
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
    async saveAddressForCustomerIfEligible(customerId, shippingAddress, fallbackEmail) {
        try {
            const count = await this.prisma.address.count({ where: { customerId } });
            if (count >= 5) {
                return;
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
        }
        catch (error) {
            this.logger.warn(`Failed to auto-save address for customer ${customerId}: ${error.message}`);
        }
    }
    async dispatchOrderStatusOrEditNotification(order, previousStatus, statusChanged, changes) {
        if (!this.mailService)
            return;
        let customerEmail;
        let customerName;
        const shipping = order.shippingAddress || {};
        if (shipping.email && typeof shipping.email === 'string')
            customerEmail = shipping.email.trim();
        if (shipping.fullName && typeof shipping.fullName === 'string')
            customerName = shipping.fullName.trim();
        if (!customerEmail && order.guestEmail)
            customerEmail = order.guestEmail.trim();
        if (!customerName && order.guestName)
            customerName = order.guestName.trim();
        if (!customerEmail && order.customer?.email)
            customerEmail = order.customer.email.trim();
        if (!customerName && order.customer) {
            customerName = `${order.customer.firstName} ${order.customer.lastName || ''}`.trim();
        }
        if (!customerEmail && order.customerId) {
            const customer = await this.prisma.customer.findUnique({
                where: { id: order.customerId },
                select: { email: true, firstName: true, lastName: true },
            });
            if (customer) {
                if (!customerEmail && customer.email)
                    customerEmail = customer.email;
                if (!customerName) {
                    customerName = `${customer.firstName} ${customer.lastName || ''}`.trim();
                }
            }
        }
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
        this.logger.log(`Dispatching order status update email for ${order.orderNumber} to ${customerEmail} (new status: ${order.status}, changed: ${statusChanged})`);
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
        }
        else if (changes.length > 0) {
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
    async findOrderForAccess(orderNumber, customerId, phone, trackingToken) {
        const order = await this.prisma.order.findUnique({
            where: { orderNumber: this.normalizeOrderNumber(orderNumber) },
            select: orderAccessSelect,
        });
        if (!order)
            throw new NotFoundException('Order not found');
        if (customerId && order.customerId === customerId)
            return order;
        if (order.customerId !== null || !phone || !trackingToken) {
            throw new ForbiddenException('Order access could not be verified');
        }
        const phoneMatches = normalizePhone(order.guestPhone) === normalizePhone(phone);
        const tokenMatches = safeHashMatch(order.trackingTokenHash, trackingToken);
        if (!phoneMatches || !tokenMatches)
            throw new ForbiddenException('Order access could not be verified');
        return order;
    }
    async getOrderForCustomerAccess(orderNumber, customerId, phone, trackingToken) {
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
    async getTracking(orderNumber, customerId, phone, trackingToken) {
        const order = await this.findOrderForAccess(orderNumber, customerId, phone, trackingToken);
        const providerUpper = (order.courierProvider || '').toUpperCase();
        const isSteadfast = providerUpper === 'STEADFAST' || (order.courierName || '').toLowerCase().includes('steadfast');
        const safeCourierStatus = isSteadfast
            ? getCustomerSafeShipmentStatus(order.courierStatus || '')
            : getCustomerSafeCourierStatus(normalizePathaoStatus(order.courierStatus));
        return {
            orderNumber: order.orderNumber,
            status: order.status,
            courier: order.courierProvider || order.courierName || 'STEADFAST',
            courierName: order.courierName || (isSteadfast ? 'Steadfast Courier' : 'Pathao Courier'),
            courierStatus: safeCourierStatus,
            trackingNumber: order.trackingNumber,
            trackingUrl: order.trackingUrl,
            estimatedDelivery: order.estimatedDelivery,
            lastUpdatedAt: order.courierLastSyncedAt || order.updatedAt,
            trackingEvents: order.trackingEvents,
        };
    }
    async generateInvoice(orderNumber, customerId, phone, trackingToken) {
        const order = await this.findOrderForAccess(orderNumber, customerId, phone, trackingToken);
        let invoice = await this.invoicesService?.findByOrderIdOrNumber(order.id);
        if (!invoice) {
            if (order.paymentStatus === PaymentStatus.PAID ||
                (order.paymentMethod === 'COD' && order.status !== OrderStatus.CANCELLED)) {
                if (this.invoicesService) {
                    invoice = await this.invoicesService.getOrCreateInvoiceForOrder(order.id);
                }
            }
            else {
                throw new BadRequestException(`Customer invoice has not been issued yet. Invoices for online payments are issued after payment verification. Current payment status: ${order.paymentStatus}`);
            }
        }
        const buffer = await this.generateInvoiceBuffer(order, invoice);
        return {
            buffer,
            invoiceNumber: invoice?.invoiceNumber || order.orderNumber,
        };
    }
    async generateInvoiceForAdmin(id) {
        const order = await this.findById(id);
        let invoice = await this.invoicesService?.findByOrderIdOrNumber(order.id);
        if (!invoice) {
            if (order.paymentStatus === PaymentStatus.PAID ||
                (order.paymentMethod === 'COD' && order.status !== OrderStatus.CANCELLED)) {
                if (this.invoicesService) {
                    invoice = await this.invoicesService.getOrCreateInvoiceForOrder(order.id);
                }
            }
            else {
                throw new BadRequestException(`Customer invoice has not been issued yet for order ${order.orderNumber}. Online orders require payment verification before an invoice is issued.`);
            }
        }
        const buffer = await this.generateInvoiceBuffer(order, invoice);
        return {
            buffer,
            invoiceNumber: invoice?.invoiceNumber || order.orderNumber,
        };
    }
    async generateInvoiceBuffer(order, invoice) {
        return generateInvoicePdf(order, invoice);
    }
    normalizeOrderNumber(orderNumber) {
        const normalized = orderNumber.trim().toUpperCase();
        return normalized.startsWith('#') ? normalized : `#${normalized}`;
    }
};
OrdersService = OrdersService_1 = __decorate([
    Injectable(),
    __param(2, Optional()),
    __param(3, Optional()),
    __param(4, Optional()),
    __metadata("design:paramtypes", [PrismaService,
        SettingsService,
        MailService,
        Ga4MeasurementProtocolService,
        InvoicesService])
], OrdersService);
export { OrdersService };
function hashToken(token) {
    return createHash('sha256').update(token).digest('hex');
}
function safeHashMatch(storedHash, token) {
    if (!storedHash)
        return false;
    const provided = Buffer.from(hashToken(token), 'hex');
    const stored = Buffer.from(storedHash, 'hex');
    return provided.length === stored.length && timingSafeEqual(provided, stored);
}
function normalizePhone(phone) {
    return phone?.replace(/\D/g, '').replace(/^880/, '0') ?? '';
}
function normalizeBangladeshPhone(phone) {
    const cleaned = phone.replace(/[^\d+]/g, '');
    if (cleaned.startsWith('+880'))
        return cleaned;
    if (cleaned.startsWith('880'))
        return `+${cleaned}`;
    if (cleaned.startsWith('0'))
        return `+88${cleaned}`;
    return cleaned;
}
//# sourceMappingURL=orders.service.js.map