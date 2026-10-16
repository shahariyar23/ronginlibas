var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { ForbiddenException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OrderStatus, PaymentMethod, PaymentStatus } from '@prisma/client';
import { OrdersService } from '../../orders/services/orders.service.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { UddoktaPaymentService } from './uddokta-payment.service.js';
let PaymentsService = class PaymentsService {
    configService;
    ordersService;
    prisma;
    uddoktaService;
    constructor(configService, ordersService, prisma, uddoktaService) {
        this.configService = configService;
        this.ordersService = ordersService;
        this.prisma = prisma;
        this.uddoktaService = uddoktaService;
    }
    async getAvailableMethods() {
        const uddoktaConfigured = this.uddoktaService.isConfigured();
        const bkashConfigured = Boolean(this.configService.get('BKASH_APP_KEY') &&
            this.configService.get('BKASH_APP_SECRET'));
        const nagadConfigured = Boolean(this.configService.get('NAGAD_MERCHANT_ID') &&
            this.configService.get('NAGAD_MERCHANT_PRIVATE_KEY'));
        const sslCommerzConfigured = Boolean(this.configService.get('SSLCOMMERZ_STORE_ID') &&
            this.configService.get('SSLCOMMERZ_STORE_PASSWORD'));
        return [
            { id: 'COD', name: 'Cash on Delivery', isEnabled: true },
            {
                id: 'UDDOKTAPAY',
                name: 'UddoktaPay (Cards, Mobile Banking & Net Banking)',
                isEnabled: uddoktaConfigured,
                credentialsConfigured: uddoktaConfigured,
            },
            {
                id: 'BKASH',
                name: 'bKash Direct',
                isEnabled: false,
                credentialsConfigured: bkashConfigured,
            },
            {
                id: 'NAGAD',
                name: 'Nagad Direct',
                isEnabled: false,
                credentialsConfigured: nagadConfigured,
            },
            {
                id: 'CARD',
                name: 'Debit/Credit Card',
                isEnabled: false,
                credentialsConfigured: sslCommerzConfigured,
            },
        ];
    }
    async createPayment(orderNumber, provider, customerId, phone, trackingToken) {
        const order = await this.ordersService.findOrderForAccess(orderNumber, customerId, phone, trackingToken);
        if (order.paymentMethod !== provider) {
            throw new ServiceUnavailableException('Payment method cannot be changed after order placement');
        }
        const methods = await this.getAvailableMethods();
        if (!methods.find((method) => method.id === provider)?.isEnabled) {
            throw new ServiceUnavailableException(`${provider} payment initiation is unavailable until a verified provider adapter is installed`);
        }
        throw new ServiceUnavailableException(`${provider} payment provider adapter is not installed; no payment was initiated`);
    }
    async verifyPayment() {
        throw new ServiceUnavailableException('Payment verification is unavailable until a gateway provider is configured');
    }
    async handleWebhook() {
        throw new ServiceUnavailableException('Payment webhooks are unavailable until a signed gateway provider is configured');
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
                paymentMethod: PaymentMethod.COD,
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
PaymentsService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [ConfigService,
        OrdersService,
        PrismaService,
        UddoktaPaymentService])
], PaymentsService);
export { PaymentsService };
//# sourceMappingURL=payments.service.js.map