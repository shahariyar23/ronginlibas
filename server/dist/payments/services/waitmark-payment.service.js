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
var WaitmarkPaymentService_1;
import { Injectable, Logger, Optional, BadRequestException, ForbiddenException, NotFoundException, ServiceUnavailableException, } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service.js';
import { OrdersService } from '../../orders/services/orders.service.js';
import { Ga4MeasurementProtocolService } from '../../analytics/services/ga4-measurement-protocol.service.js';
import { OrderStatus, PaymentStatus, PaymentMethod } from '@prisma/client';
import { createHmac, timingSafeEqual } from 'node:crypto';
let WaitmarkPaymentService = WaitmarkPaymentService_1 = class WaitmarkPaymentService {
    prisma;
    configService;
    ordersService;
    ga4Service;
    logger = new Logger(WaitmarkPaymentService_1.name);
    constructor(prisma, configService, ordersService, ga4Service) {
        this.prisma = prisma;
        this.configService = configService;
        this.ordersService = ordersService;
        this.ga4Service = ga4Service;
    }
    getPublicKey() {
        return this.configService.get('WAITMARK_PUBLIC_KEY')?.trim();
    }
    getSecretKey() {
        return this.configService.get('WAITMARK_SECRET_KEY')?.trim();
    }
    getCheckoutUrl() {
        return (this.configService.get('WAITMARK_CHECKOUT_URL')?.trim() ||
            'https://pay.waitmark.com/checkout');
    }
    getSuccessUrl() {
        const configured = this.configService.get('WAITMARK_SUCCESS_URL')?.trim();
        if (configured) {
            return configured;
        }
        const backendUrl = this.configService.get('BACKEND_URL')?.trim() ||
            `http://localhost:${this.configService.get('PORT') || 4000}`;
        return `${backendUrl.replace(/\/+$/, '')}/api/v1/payments/waitmark/webhook`;
    }
    isConfigured() {
        return Boolean(this.getPublicKey() && this.getSecretKey());
    }
    async initiatePayment(dto, requester) {
        const publicKey = this.getPublicKey();
        if (!publicKey) {
            this.logger.error('Waitmark Pay initiation rejected: WAITMARK_PUBLIC_KEY is not configured');
            throw new ServiceUnavailableException('Online payment gateway is temporarily unconfigured. Please select Cash on Delivery or contact concierge support.');
        }
        const requesterId = typeof requester === 'string' ? requester : requester?.id;
        const isAdmin = typeof requester === 'object' &&
            (requester?.type === 'admin' ||
                requester?.role === 'ADMIN' ||
                requester?.role === 'SUPER_ADMIN' ||
                requester?.role === 'MANAGER');
        const order = await this.prisma.order.findFirst({
            where: {
                OR: [
                    { id: dto.orderId },
                    { orderNumber: dto.orderId },
                    { payments: { some: { providerOrderId: dto.orderId } } },
                ],
            },
            include: {
                customer: true,
                payments: {
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
        if (!order) {
            throw new NotFoundException(`Order "${dto.orderId}" not found`);
        }
        if (!isAdmin) {
            if (order.customerId) {
                if (requesterId && requesterId !== order.customerId) {
                    throw new ForbiddenException('You do not have permission to pay for this order.');
                }
            }
            else {
                const shippingAddress = order.shippingAddress || {};
                const expectedPhone = (order.guestPhone ||
                    shippingAddress.phone ||
                    shippingAddress.receiverPhone ||
                    '')
                    .replace(/\D/g, '')
                    .slice(-11);
                const suppliedPhone = (dto.phone || '').replace(/\D/g, '').slice(-11);
                const phoneMatches = Boolean(expectedPhone && suppliedPhone && expectedPhone === suppliedPhone);
                const tokenMatches = Boolean(dto.trackingToken && order.trackingTokenHash);
                if (!requesterId && !phoneMatches && !tokenMatches) {
                    throw new ForbiddenException('Guest payment verification requires the contact mobile number associated with the order.');
                }
            }
        }
        if (order.status === OrderStatus.CANCELLED) {
            throw new BadRequestException('Cannot initiate payment for a cancelled order.');
        }
        if (order.status === OrderStatus.RETURNED || order.status === OrderStatus.REFUNDED) {
            throw new BadRequestException('Cannot initiate payment for a returned or refunded order.');
        }
        if (order.paymentStatus === PaymentStatus.PAID) {
            throw new BadRequestException('This order has already been paid in full.');
        }
        const totalAmount = Number(order.totalAmount);
        const alreadyPaid = Number(order.paidAmount || 0);
        const payableAmount = Math.max(0, Math.round((totalAmount - alreadyPaid) * 100) / 100);
        if (payableAmount <= 0) {
            throw new BadRequestException('Payable amount for this order is zero.');
        }
        const sanitizedOrderRef = order.orderNumber.replace(/[^A-Za-z0-9]/g, '');
        const existingPending = await this.prisma.payment.findFirst({
            where: {
                orderId: order.id,
                status: PaymentStatus.PENDING,
            },
            orderBy: { createdAt: 'desc' },
        });
        let paymentAttemptId;
        if (existingPending) {
            if (existingPending.providerOrderId.startsWith('WMPAY-')) {
                const conflict = await this.prisma.payment.findFirst({
                    where: {
                        providerOrderId: sanitizedOrderRef,
                        id: { not: existingPending.id },
                    },
                });
                paymentAttemptId = conflict
                    ? `${sanitizedOrderRef}-${Date.now().toString().slice(-4)}`
                    : sanitizedOrderRef;
                await this.prisma.payment.update({
                    where: { id: existingPending.id },
                    data: {
                        providerOrderId: paymentAttemptId,
                        amount: payableAmount,
                    },
                });
            }
            else {
                paymentAttemptId = existingPending.providerOrderId;
                await this.prisma.payment.update({
                    where: { id: existingPending.id },
                    data: {
                        amount: payableAmount,
                    },
                });
            }
        }
        else {
            const conflict = await this.prisma.payment.findUnique({
                where: { providerOrderId: sanitizedOrderRef },
            });
            paymentAttemptId = conflict
                ? `${sanitizedOrderRef}-${Date.now().toString().slice(-4)}`
                : sanitizedOrderRef;
            await this.prisma.payment.create({
                data: {
                    orderId: order.id,
                    provider: 'WAITMARK_PAY',
                    providerOrderId: paymentAttemptId,
                    amount: payableAmount,
                    currency: 'BDT',
                    status: PaymentStatus.PENDING,
                },
            });
        }
        if (order.paymentStatus === PaymentStatus.FAILED) {
            await this.prisma.order.update({
                where: { id: order.id },
                data: { paymentStatus: PaymentStatus.PENDING },
            });
        }
        this.logger.log(`[Waitmark Pay] Prepared payment attempt ${paymentAttemptId} for order ${order.orderNumber} (Amount: ৳${payableAmount})`);
        const gatewayBaseUrl = this.getCheckoutUrl();
        const successUrl = this.getSuccessUrl();
        const backendUrl = this.configService.get('BACKEND_URL')?.trim() ||
            `http://localhost:${this.configService.get('PORT') || 4000}`;
        const cleanBackendUrl = backendUrl.replace(/\/+$/, '');
        const cancelUrl = `${cleanBackendUrl}/api/v1/payments/waitmark/webhook?status=cancelled&order_id=${encodeURIComponent(paymentAttemptId)}`;
        const failUrl = `${cleanBackendUrl}/api/v1/payments/waitmark/webhook?status=failed&order_id=${encodeURIComponent(paymentAttemptId)}`;
        const checkoutUrl = `${gatewayBaseUrl}?public_key=${encodeURIComponent(publicKey)}&amount=${encodeURIComponent(payableAmount.toFixed(2))}&order_id=${encodeURIComponent(paymentAttemptId)}&success_url=${encodeURIComponent(successUrl)}&cancel_url=${encodeURIComponent(cancelUrl)}&fail_url=${encodeURIComponent(failUrl)}`;
        return {
            checkoutUrl,
            paymentAttemptId,
            orderId: order.id,
            orderNumber: order.orderNumber,
            amount: payableAmount,
            currency: 'BDT',
        };
    }
    async handleFailedPayment(orderId, reason = 'Payment failed / cancelled', existingOrder) {
        if (this.ordersService && typeof this.ordersService.deleteUnpaidOrFailedOrder === 'function') {
            const res = await this.ordersService.deleteUnpaidOrFailedOrder(orderId, reason);
            return { success: true, message: res.message };
        }
        const order = existingOrder ||
            (await this.prisma.order.findFirst({
                where: {
                    OR: [
                        { id: orderId },
                        { orderNumber: orderId },
                        { payments: { some: { providerOrderId: orderId } } },
                    ],
                },
                include: { items: true },
            }));
        if (!order)
            return { success: true, message: 'Order not found or already deleted' };
        if (order.paymentStatus === PaymentStatus.PAID) {
            return { success: false, message: 'Cannot delete already paid order' };
        }
        await this.prisma.$transaction(async (tx) => {
            if (Array.isArray(order.items)) {
                for (const item of order.items) {
                    if (!item.variantId)
                        continue;
                    const variant = await tx.productVariant?.findUnique?.({
                        where: { id: item.variantId },
                        select: { id: true, stock: true },
                    });
                    if (variant) {
                        await tx.productVariant?.updateMany?.({
                            where: { id: variant.id, stock: variant.stock },
                            data: { stock: variant.stock + item.quantity },
                        });
                        await tx.inventoryTransaction?.create?.({
                            data: {
                                variantId: variant.id,
                                quantityChange: item.quantity,
                                previousStock: variant.stock,
                                newStock: variant.stock + item.quantity,
                                type: 'RETURN',
                                note: `Restored stock from failed payment order ${order.orderNumber}`,
                            },
                        });
                    }
                }
            }
            if (typeof tx.order?.delete === 'function') {
                await tx.order.delete({
                    where: { id: order.id },
                });
            }
            else if (typeof tx.order?.update === 'function') {
                await tx.order.update({
                    where: { id: order.id },
                    data: { status: OrderStatus.CANCELLED, paymentStatus: PaymentStatus.FAILED },
                });
            }
        });
        this.logger.log(`[Waitmark Pay] Order ${order.orderNumber} deleted and reserved stock released (${reason})`);
        return {
            success: true,
            message: `Order ${order.orderNumber} deleted and inventory stock restored`,
        };
    }
    async processWebhook(rawBody, signatureHeader) {
        const secretKey = this.getSecretKey();
        if (!secretKey) {
            this.logger.error('Waitmark webhook rejected: WAITMARK_SECRET_KEY is not configured on server');
            throw new ServiceUnavailableException('Payment webhook secret key is not configured.');
        }
        if (!signatureHeader || !signatureHeader.trim()) {
            this.logger.warn('Waitmark webhook rejected: Missing X-Waitmark-Signature header');
            throw new ForbiddenException('Missing X-Waitmark-Signature header');
        }
        const payloadBuffer = Buffer.isBuffer(rawBody) ? rawBody : Buffer.from(rawBody, 'utf8');
        const expectedSignature = createHmac('sha256', secretKey)
            .update(payloadBuffer)
            .digest('hex');
        const cleanReceived = signatureHeader.trim().toLowerCase();
        const cleanExpected = expectedSignature.toLowerCase();
        let isSignatureValid = false;
        try {
            const receivedBuf = Buffer.from(cleanReceived, 'hex');
            const expectedBuf = Buffer.from(cleanExpected, 'hex');
            if (receivedBuf.length === expectedBuf.length && timingSafeEqual(receivedBuf, expectedBuf)) {
                isSignatureValid = true;
            }
        }
        catch {
            isSignatureValid = false;
        }
        if (!isSignatureValid) {
            this.logger.error(`Waitmark webhook signature verification failed. Expected: ${cleanExpected}, Received: ${cleanReceived}`);
            throw new ForbiddenException('Invalid signature: HMAC-SHA256 verification failed');
        }
        let payload;
        try {
            payload = JSON.parse(payloadBuffer.toString('utf8'));
        }
        catch (parseErr) {
            this.logger.error(`Waitmark webhook payload JSON parse error: ${parseErr?.message}`);
            throw new BadRequestException('Malformed JSON payload');
        }
        const { order_id: providerOrderId, trx_id, amount, status, currency } = payload;
        if (!providerOrderId || !trx_id || amount === undefined || !status) {
            this.logger.error('Waitmark webhook missing required fields: ' + JSON.stringify(payload));
            throw new BadRequestException('Incomplete webhook payload fields');
        }
        this.logger.log(`[Waitmark Webhook] Received verified IPN for order_id: ${providerOrderId}, trx_id: ${trx_id}, status: ${status}, amount: ${amount}`);
        let payment = await this.prisma.payment.findUnique({
            where: { providerOrderId },
            include: {
                order: {
                    include: {
                        customer: true,
                        items: true,
                    },
                },
            },
        });
        if (!payment) {
            payment = await this.prisma.payment.findFirst({
                where: {
                    OR: [
                        { order: { orderNumber: providerOrderId } },
                        { order: { orderNumber: `#${providerOrderId}` } },
                        { order: { orderNumber: { contains: providerOrderId } } },
                        { orderId: providerOrderId },
                    ],
                },
                orderBy: { createdAt: 'desc' },
                include: {
                    order: {
                        include: {
                            customer: true,
                            items: true,
                        },
                    },
                },
            });
        }
        if (!payment) {
            this.logger.error(`Waitmark webhook payment attempt not found for order_id: ${providerOrderId}`);
            throw new NotFoundException(`Payment record not found for provider order ID: ${providerOrderId}`);
        }
        if (payment.status === PaymentStatus.PAID) {
            this.logger.log(`[Waitmark Webhook] Idempotent delivery: Payment ${providerOrderId} already confirmed as PAID.`);
            return {
                success: true,
                message: 'Payment was already verified and processed previously.',
                idempotent: true,
            };
        }
        const duplicatePayment = typeof this.prisma.payment.findFirst === 'function'
            ? await this.prisma.payment.findFirst({
                where: {
                    providerTransactionId: trx_id,
                    id: { not: payment.id },
                    status: PaymentStatus.PAID,
                },
            })
            : null;
        if (duplicatePayment) {
            this.logger.error(`[Waitmark Webhook] Duplicate transaction ID rejected: ${trx_id} has already been credited to payment ${duplicatePayment.id}`);
            throw new BadRequestException('Transaction ID has already been utilized for another payment');
        }
        const duplicateOrder = typeof this.prisma.order.findFirst === 'function'
            ? await this.prisma.order.findFirst({
                where: {
                    paymentReference: trx_id,
                    id: { not: payment.orderId },
                    paymentStatus: PaymentStatus.PAID,
                },
            })
            : null;
        if (duplicateOrder) {
            this.logger.error(`[Waitmark Webhook] Duplicate transaction ID rejected: ${trx_id} has already been credited to order ${duplicateOrder.orderNumber}`);
            throw new BadRequestException('Transaction ID has already been utilized for another order');
        }
        const expectedCurrency = (payment.currency || 'BDT').toUpperCase();
        if (currency && currency.trim().toUpperCase() !== expectedCurrency) {
            this.logger.error(`Waitmark webhook currency mismatch: Expected ${expectedCurrency}, received ${currency} for ${providerOrderId}`);
            await this.prisma.payment.update({
                where: { id: payment.id },
                data: {
                    status: PaymentStatus.FAILED,
                    failureReason: `Currency mismatch: expected ${payment.currency}, received ${currency}`,
                    providerTransactionId: trx_id,
                    rawWebhookPayload: payload,
                },
            });
            await this.handleFailedPayment(payment.orderId, `Currency mismatch: expected ${payment.currency}, received ${currency}`, payment.order);
            throw new BadRequestException('Payment currency mismatch');
        }
        const webhookAmount = Number(amount);
        const expectedAmount = Number(payment.amount);
        if (Math.abs(webhookAmount - expectedAmount) > 0.01) {
            this.logger.error(`Waitmark webhook amount mismatch: Expected ৳${expectedAmount}, received ৳${webhookAmount} for ${providerOrderId}`);
            await this.prisma.payment.update({
                where: { id: payment.id },
                data: {
                    status: PaymentStatus.FAILED,
                    failureReason: `Amount mismatch: expected ${expectedAmount}, received ${webhookAmount}`,
                    providerTransactionId: trx_id,
                    rawWebhookPayload: payload,
                },
            });
            await this.handleFailedPayment(payment.orderId, `Amount mismatch: expected ${expectedAmount}, received ${webhookAmount}`, payment.order);
            throw new BadRequestException('Payment amount mismatch between order and gateway');
        }
        if (status.toLowerCase() !== 'completed') {
            const isExplicitFailure = ['failed', 'cancelled', 'declined', 'rejected', 'expired'].includes(status.toLowerCase());
            this.logger.warn(`Waitmark webhook reported non-completed status: "${status}" for ${providerOrderId}`);
            if (isExplicitFailure) {
                await this.handleFailedPayment(payment.orderId, `Gateway reported status: ${status}`, payment.order);
                return {
                    success: false,
                    message: `Payment failed (${status}). Order deleted and inventory stock restored.`,
                };
            }
            await this.prisma.payment.update({
                where: { id: payment.id },
                data: {
                    status: PaymentStatus.PENDING,
                    failureReason: `Gateway reported status: ${status}`,
                    providerTransactionId: trx_id,
                    rawWebhookPayload: payload,
                },
            });
            return {
                success: false,
                message: `Payment status received as ${status}`,
            };
        }
        await this.prisma.$transaction(async (tx) => {
            await tx.payment.update({
                where: { id: payment.id },
                data: {
                    status: PaymentStatus.PAID,
                    providerTransactionId: trx_id,
                    paidAt: payload.paid_at ? new Date(payload.paid_at) : new Date(),
                    rawWebhookPayload: payload,
                },
            });
            const order = await tx.order.findUnique({
                where: { id: payment.orderId },
            });
            if (!order)
                return;
            if (order.status === OrderStatus.CANCELLED) {
                this.logger.warn(`[Waitmark Webhook] Alert: Order ${order.orderNumber} was CANCELLED before payment confirmation! Setting paidAmount and flagging for review.`);
                await tx.order.update({
                    where: { id: order.id },
                    data: {
                        paymentStatus: PaymentStatus.PAID,
                        paymentMethod: PaymentMethod.WAITMARK_PAY,
                        paymentReference: trx_id,
                        paidAmount: payment.amount,
                        adminNotes: [
                            order.adminNotes,
                            `[RECONCILIATION NEEDED] Order was cancelled prior to receiving confirmed Waitmark payment of ৳${payment.amount} (Trx: ${trx_id}).`,
                        ]
                            .filter(Boolean)
                            .join('\n'),
                    },
                });
                return;
            }
            const nextOrderStatus = order.status === OrderStatus.PENDING ? OrderStatus.CONFIRMED : order.status;
            await tx.order.update({
                where: { id: order.id },
                data: {
                    status: nextOrderStatus,
                    paymentStatus: PaymentStatus.PAID,
                    paymentMethod: PaymentMethod.WAITMARK_PAY,
                    paymentReference: trx_id,
                    paidAmount: payment.amount,
                },
            });
            await tx.orderTrackingEvent.create({
                data: {
                    orderId: order.id,
                    status: nextOrderStatus,
                    description: `Online payment received via Waitmark Pay (Transaction ID: ${trx_id})`,
                    customerVisible: true,
                },
            });
        });
        this.logger.log(`[Waitmark Webhook] Successfully verified and marked order ${payment.order.orderNumber} as PAID (Trx: ${trx_id})`);
        if (this.ordersService) {
            this.ordersService.dispatchConfirmationNotificationForPaidOrder(payment.order.id).catch((err) => {
                this.logger.warn(`Failed to dispatch confirmation email after Waitmark payment for ${payment.order.orderNumber}: ${err.message}`);
            });
        }
        if (this.ga4Service) {
            this.ga4Service
                .sendPurchaseEvent({
                id: payment.order.id,
                orderNumber: payment.order.orderNumber,
                totalAmount: payment.order.totalAmount,
                customerId: payment.order.customerId,
                items: payment.order.items,
            })
                .catch((err) => {
                this.logger.warn(`Failed to report GA4 MP purchase after online payment for ${payment.order.orderNumber}: ${err.message}`);
            });
        }
        return {
            success: true,
            message: 'Payment verified and order updated successfully',
        };
    }
    async getPaymentStatus(orderId, requester, phone, trackingToken) {
        const requesterId = typeof requester === 'string' ? requester : requester?.id;
        const isAdmin = typeof requester === 'object' &&
            (requester?.type === 'admin' ||
                requester?.role === 'ADMIN' ||
                requester?.role === 'SUPER_ADMIN' ||
                requester?.role === 'MANAGER');
        const order = await this.prisma.order.findFirst({
            where: {
                OR: [
                    { id: orderId },
                    { orderNumber: orderId },
                    { payments: { some: { providerOrderId: orderId } } },
                    { payments: { some: { providerInvoiceId: orderId } } },
                ],
            },
            include: {
                payments: {
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
        if (!order) {
            return {
                orderId,
                orderNumber: orderId,
                paymentStatus: PaymentStatus.FAILED,
                orderStatus: OrderStatus.CANCELLED,
                totalAmount: 0,
                paidAmount: 0,
                paymentReference: null,
                paymentMethod: PaymentMethod.WAITMARK_PAY,
                payments: [],
            };
        }
        if (!isAdmin) {
            if (order.customerId) {
                if (requesterId && requesterId !== order.customerId) {
                    throw new ForbiddenException('You do not have permission to view payment status for this order.');
                }
            }
            else {
                const shippingAddress = order.shippingAddress || {};
                const expectedPhone = (order.guestPhone ||
                    shippingAddress.phone ||
                    shippingAddress.receiverPhone ||
                    '')
                    .replace(/\D/g, '')
                    .slice(-11);
                const suppliedPhone = (phone || '').replace(/\D/g, '').slice(-11);
                const phoneMatches = Boolean(expectedPhone && suppliedPhone && expectedPhone === suppliedPhone);
                const tokenMatches = Boolean(trackingToken && order.trackingTokenHash);
                if (!requesterId && !phoneMatches && !tokenMatches) {
                    throw new ForbiddenException('Access denied. Please provide contact phone or tracking token.');
                }
            }
        }
        return {
            orderId: order.id,
            orderNumber: order.orderNumber,
            paymentStatus: order.paymentStatus,
            orderStatus: order.status,
            totalAmount: Number(order.totalAmount),
            paidAmount: Number(order.paidAmount || 0),
            paymentReference: order.paymentReference,
            paymentMethod: order.paymentMethod,
            payments: order.payments.map((p) => ({
                id: p.id,
                provider: p.provider,
                providerOrderId: p.providerOrderId,
                providerTransactionId: p.providerTransactionId,
                amount: Number(p.amount),
                currency: p.currency,
                status: p.status,
                failureReason: p.failureReason,
                paidAt: p.paidAt,
                createdAt: p.createdAt,
            })),
        };
    }
};
WaitmarkPaymentService = WaitmarkPaymentService_1 = __decorate([
    Injectable(),
    __param(2, Optional()),
    __param(3, Optional()),
    __metadata("design:paramtypes", [PrismaService,
        ConfigService,
        OrdersService,
        Ga4MeasurementProtocolService])
], WaitmarkPaymentService);
export { WaitmarkPaymentService };
//# sourceMappingURL=waitmark-payment.service.js.map