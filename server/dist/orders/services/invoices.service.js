var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var InvoicesService_1;
import { Injectable, Logger, NotFoundException, } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { InvoiceStatus } from '@prisma/client';
let InvoicesService = InvoicesService_1 = class InvoicesService {
    prisma;
    logger = new Logger(InvoicesService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async generateNextInvoiceNumber(tx, year) {
        const client = tx || this.prisma;
        const currentYear = year ?? new Date().getFullYear();
        const result = await client.$queryRaw `
      INSERT INTO "invoice_sequences" ("year", "currentVal")
      VALUES (${currentYear}, 1)
      ON CONFLICT ("year")
      DO UPDATE SET "currentVal" = "invoice_sequences"."currentVal" + 1
      RETURNING "currentVal";
    `;
        const rawVal = result[0]?.currentVal;
        const counter = Number(rawVal) || 1;
        const padded = String(counter).padStart(6, '0');
        return `RL-INV-${currentYear}-${padded}`;
    }
    async createInvoiceForOrderInTx(tx, orderId, paymentId) {
        const existing = await tx.invoice.findUnique({
            where: { orderId },
            include: {
                items: true,
                payments: {
                    select: {
                        id: true,
                        provider: true,
                        providerOrderId: true,
                        providerInvoiceId: true,
                        providerTransactionId: true,
                        amount: true,
                        status: true,
                        paidAt: true,
                    },
                    orderBy: { createdAt: 'desc' },
                },
                order: {
                    select: {
                        id: true,
                        orderNumber: true,
                        status: true,
                        paymentStatus: true,
                        paymentMethod: true,
                        createdAt: true,
                    },
                },
            },
        });
        if (existing) {
            if (paymentId) {
                await tx.payment.update({
                    where: { id: paymentId },
                    data: { invoiceId: existing.id },
                });
            }
            return existing;
        }
        const order = await tx.order.findUnique({
            where: { id: orderId },
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
        if (!order) {
            throw new NotFoundException(`Order ${orderId} not found for invoice creation.`);
        }
        const shipping = order.shippingAddress || {};
        const customerName = (typeof shipping.fullName === 'string' && shipping.fullName.trim()) ||
            (typeof shipping.recipient === 'string' && shipping.recipient.trim()) ||
            (typeof shipping.name === 'string' && shipping.name.trim()) ||
            order.guestName ||
            (order.customer
                ? `${order.customer.firstName} ${order.customer.lastName || ''}`.trim()
                : 'Valued Patron');
        const customerEmail = (typeof shipping.email === 'string' && shipping.email.trim()) ||
            order.guestEmail ||
            order.customer?.email ||
            null;
        const customerPhone = (typeof shipping.phone === 'string' && shipping.phone.trim()) ||
            order.guestPhone ||
            order.customer?.phone ||
            null;
        const invoiceNumber = await this.generateNextInvoiceNumber(tx);
        const itemsData = (order.items || []).map((item) => ({
            productId: item.productId ?? null,
            productVariantId: item.variantId ?? null,
            productName: item.productName,
            sku: item.sku,
            quantity: Number(item.quantity),
            unitPrice: item.unitPrice,
            lineTotal: item.subtotal,
            variantLabel: item.variantName ||
                item.variantLabel ||
                [item.size ? `Size: ${item.size}` : '', item.color ? `Color: ${item.color}` : '']
                    .filter(Boolean)
                    .join(', ') ||
                null,
            size: item.size || null,
            color: item.color || null,
        }));
        const createdInvoice = await tx.invoice.create({
            data: {
                invoiceNumber,
                orderId: order.id,
                status: InvoiceStatus.ISSUED,
                subtotal: order.subtotal,
                discountAmount: order.discountAmount || 0,
                deliveryCharge: order.deliveryCharge || 0,
                totalAmount: order.totalAmount,
                currency: 'BDT',
                customerName,
                customerEmail,
                customerPhone,
                shippingAddress: order.shippingAddress,
                issuedAt: new Date(),
                items: {
                    create: itemsData,
                },
            },
            include: {
                items: true,
                payments: {
                    select: {
                        id: true,
                        provider: true,
                        providerOrderId: true,
                        providerInvoiceId: true,
                        providerTransactionId: true,
                        amount: true,
                        status: true,
                        paidAt: true,
                    },
                },
                order: {
                    select: {
                        id: true,
                        orderNumber: true,
                        status: true,
                        paymentStatus: true,
                        paymentMethod: true,
                        createdAt: true,
                    },
                },
            },
        });
        if (paymentId) {
            await tx.payment.update({
                where: { id: paymentId },
                data: { invoiceId: createdInvoice.id },
            });
        }
        this.logger.log(`[Invoice] Issued customer invoice ${createdInvoice.invoiceNumber} for order ${order.orderNumber} (Total: ৳${Number(createdInvoice.totalAmount).toLocaleString()})`);
        return createdInvoice;
    }
    async getOrCreateInvoiceForOrder(orderId, paymentId) {
        return this.prisma.$transaction(async (tx) => this.createInvoiceForOrderInTx(tx, orderId, paymentId), { maxWait: 10000, timeout: 30000 });
    }
    async findByOrderIdOrNumber(idOrNumber) {
        const invoice = await this.prisma.invoice.findFirst({
            where: {
                OR: [
                    { orderId: idOrNumber },
                    { order: { orderNumber: idOrNumber } },
                    { order: { orderNumber: `#${idOrNumber.replace(/^#/, '')}` } },
                ],
            },
            include: {
                items: true,
                payments: {
                    select: {
                        id: true,
                        provider: true,
                        providerOrderId: true,
                        providerInvoiceId: true,
                        providerTransactionId: true,
                        amount: true,
                        status: true,
                        paidAt: true,
                    },
                    orderBy: { createdAt: 'desc' },
                },
                order: {
                    select: {
                        id: true,
                        orderNumber: true,
                        status: true,
                        paymentStatus: true,
                        paymentMethod: true,
                        createdAt: true,
                    },
                },
            },
        });
        return invoice;
    }
    async findByInvoiceNumber(invoiceNumber) {
        const invoice = await this.prisma.invoice.findUnique({
            where: { invoiceNumber },
            include: {
                items: true,
                payments: {
                    select: {
                        id: true,
                        provider: true,
                        providerOrderId: true,
                        providerInvoiceId: true,
                        providerTransactionId: true,
                        amount: true,
                        status: true,
                        paidAt: true,
                    },
                    orderBy: { createdAt: 'desc' },
                },
                order: {
                    select: {
                        id: true,
                        orderNumber: true,
                        status: true,
                        paymentStatus: true,
                        paymentMethod: true,
                        createdAt: true,
                    },
                },
            },
        });
        return invoice;
    }
};
InvoicesService = InvoicesService_1 = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService])
], InvoicesService);
export { InvoicesService };
//# sourceMappingURL=invoices.service.js.map