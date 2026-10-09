var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { BadRequestException, ForbiddenException, Injectable, NotFoundException, ServiceUnavailableException, } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaService } from '../../prisma/prisma.service.js';
import { SettingsService } from '../../settings/services/settings.service.js';
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
};
const customerOrderDetailSelect = {
    ...customerOrderSelect,
    trackingEvents: {
        where: { customerVisible: true },
        select: { status: true, description: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
    },
};
const orderAccessSelect = {
    ...customerOrderDetailSelect,
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
let OrdersService = class OrdersService {
    prisma;
    settingsService;
    constructor(prisma, settingsService) {
        this.prisma = prisma;
        this.settingsService = settingsService;
    }
    async findAll(query) {
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
                    trackingNumber: true,
                    trackingUrl: true,
                    estimatedDelivery: true,
                    createdAt: true,
                    updatedAt: true,
                    customer: { select: { firstName: true, lastName: true, email: true, phone: true } },
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
                trackingEvents: { orderBy: { createdAt: 'asc' } },
            },
        });
        if (!order)
            throw new NotFoundException(`Order not found: ${id}`);
        const { trackingTokenHash: _trackingTokenHash, ...safeOrder } = order;
        return safeOrder;
    }
    async findCustomerOrders(customerId, query) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        const where = { customerId };
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
    async updateStatus(id, dto) {
        return this.prisma.$transaction(async (transaction) => {
            const order = await transaction.order.findFirst({
                where: { OR: [{ id }, { orderNumber: id }, { orderNumber: this.normalizeOrderNumber(id) }] },
                include: { items: { select: { variantId: true, quantity: true } } },
            });
            if (!order)
                throw new NotFoundException(`Order not found: ${id}`);
            if (order.status === 'CANCELLED' && dto.status !== 'CANCELLED') {
                throw new BadRequestException('A cancelled order cannot be reopened');
            }
            if (dto.status === 'CANCELLED' &&
                ['SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.status)) {
                throw new BadRequestException('An order cannot be cancelled after shipment');
            }
            if (order.status !== 'CANCELLED' && dto.status === 'CANCELLED') {
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
                data: { status: dto.status, adminNotes: dto.adminNotes },
            });
            await transaction.orderTrackingEvent.create({
                data: {
                    orderId: order.id,
                    status: updated.status,
                    description: dto.adminNotes,
                },
            });
            return updated;
        }, { maxWait: 10000, timeout: 30000 });
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
        if (!customerId && (!guestName || !guestPhone)) {
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
            const isDhaka = dto.shippingAddress.division.toLowerCase().includes('dhaka');
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
                    status: 'PENDING',
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
                    },
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
    async generateInvoice(orderNumber, customerId, phone, trackingToken) {
        const order = await this.findOrderForAccess(orderNumber, customerId, phone, trackingToken);
        const itemThumbnails = await Promise.all(order.items.map((item) => {
            const imgUrl = item.productImage || item.product?.images?.[0]?.url;
            return fetchThumbnailBuffer(imgUrl);
        }));
        const logoBuffer = getLogoBuffer();
        return new Promise((resolve, reject) => {
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
                const chunks = [];
                doc.on('data', (chunk) => chunks.push(chunk));
                doc.on('end', () => resolve(Buffer.concat(chunks)));
                doc.on('error', reject);
                const margin = 36;
                const pageWidth = 595.28;
                const contentWidth = pageWidth - margin * 2;
                const headerHeight = 78;
                doc.roundedRect(margin, margin, contentWidth, headerHeight, 4).fill('#073A2D');
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
                    }
                    catch {
                    }
                }
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
                const cardsY = margin + headerHeight + 10;
                const cardH = 76;
                const cardW = (contentWidth - 10) / 2;
                const addr = order.shippingAddress || {};
                const recipientName = addr.fullName ||
                    addr.recipient ||
                    addr.name ||
                    (order.customer ? [order.customer.firstName, order.customer.lastName].filter(Boolean).join(' ') : order.guestName) ||
                    'Valued Patron';
                const contactPhone = addr.phone || order.guestPhone || order.customer?.phone || 'N/A';
                const contactEmail = addr.email || order.guestEmail || order.customer?.email || 'N/A';
                const destAddress = [addr.addressLine1 || addr.address, addr.addressLine2, addr.city, addr.division, addr.postalCode]
                    .filter(Boolean)
                    .join(', ') || 'Doorstep Delivery Location on file';
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
                const rightCardX = margin + cardW + 10;
                doc.roundedRect(rightCardX, cardsY, cardW, cardH, 4).fill('#F8FAFC');
                doc.lineWidth(0.5).strokeColor('#E2E8F0').roundedRect(rightCardX, cardsY, cardW, cardH, 4).stroke();
                doc.roundedRect(rightCardX, cardsY, cardW, 17, 3).fill('#EEF2F6');
                doc
                    .fillColor('#073A2D')
                    .fontSize(7)
                    .font('Helvetica-Bold')
                    .text('CONSIGNMENT & PAYMENT SPEC', rightCardX + 8, cardsY + 5);
                const statusColors = {
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
                const payMethodStr = order.paymentMethod === 'COD'
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
                const tableY = cardsY + cardH + 10;
                const tableHdrHeight = 22;
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
                    order.items.forEach((item, index) => {
                        const isAlt = index % 2 === 1;
                        if (isAlt) {
                            doc.rect(margin, currentY, contentWidth, rowHeight).fill('#FBFBFA');
                        }
                        doc
                            .lineWidth(0.5)
                            .strokeColor('#E5E7EB')
                            .moveTo(margin, currentY + rowHeight)
                            .lineTo(margin + contentWidth, currentY + rowHeight)
                            .stroke();
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
                            }
                            catch {
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
                        doc
                            .fillColor('#111827')
                            .fontSize(8)
                            .font('Helvetica-Bold')
                            .text(item.productName, margin + 48, currentY + 9, {
                            width: 236,
                            ellipsis: true,
                        });
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
                        doc
                            .fillColor('#374151')
                            .fontSize(8)
                            .font('Helvetica')
                            .text(`BDT ${Number(item.unitPrice).toLocaleString()}`, margin + 288, currentY + 18, {
                            width: 70,
                            align: 'right',
                        });
                        doc
                            .fillColor('#111827')
                            .fontSize(8)
                            .font('Helvetica-Bold')
                            .text(`${item.quantity} pc${item.quantity > 1 ? 's' : ''}`, margin + 364, currentY + 18, {
                            width: 56,
                            align: 'center',
                        });
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
                }
                else {
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
                doc
                    .lineWidth(0.5)
                    .strokeColor('#E5E7EB')
                    .roundedRect(margin, tableY, contentWidth, currentY - tableY, 3)
                    .stroke();
                const summarySecY = currentY + 12;
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
                const deliveryStr = Number(order.deliveryCharge) === 0 ? 'FREE' : `BDT ${Number(order.deliveryCharge).toLocaleString()}`;
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
                    .text('© 2026 Rongin Libas. Registered in Bangladesh. Uttara Hub, Dhaka. All rights reserved. www.ronginlibas.com', margin, footerY + 44, { width: contentWidth, align: 'center' });
                doc.end();
            }
            catch (err) {
                reject(err);
            }
        });
    }
    normalizeOrderNumber(orderNumber) {
        const normalized = orderNumber.trim().toUpperCase();
        return normalized.startsWith('#') ? normalized : `#${normalized}`;
    }
};
OrdersService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService,
        SettingsService])
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
const __moduleFilename = fileURLToPath(import.meta.url);
const __moduleDirname = path.dirname(__moduleFilename);
let cachedLogoBuffer = null;
function getLogoBuffer() {
    if (cachedLogoBuffer)
        return cachedLogoBuffer;
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
            }
            catch {
            }
        }
    }
    return null;
}
async function fetchThumbnailBuffer(rawUrl) {
    if (!rawUrl)
        return null;
    try {
        let url = rawUrl;
        if (url.includes('/image/upload/')) {
            url = url.replace('/image/upload/', '/image/upload/f_jpg,w_100,h_120,c_fill/');
        }
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 2500);
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeout);
        if (!res.ok)
            return null;
        const arrayBuffer = await res.arrayBuffer();
        const buf = Buffer.from(arrayBuffer);
        if ((buf[0] === 0xff && buf[1] === 0xd8) ||
            (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47)) {
            return buf;
        }
        return null;
    }
    catch {
        return null;
    }
}
function formatInvoiceDate(date) {
    try {
        return new Intl.DateTimeFormat('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        }).format(date);
    }
    catch {
        return date.toISOString().slice(0, 10);
    }
}
function drawBarcode(doc, value, x, y, width, height) {
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
//# sourceMappingURL=orders.service.js.map