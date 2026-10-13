var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OrdersService } from '../../orders/services/orders.service.js';
import { WaitmarkPaymentService } from './waitmark-payment.service.js';
let PaymentsService = class PaymentsService {
    configService;
    ordersService;
    waitmarkService;
    constructor(configService, ordersService, waitmarkService) {
        this.configService = configService;
        this.ordersService = ordersService;
        this.waitmarkService = waitmarkService;
    }
    async getAvailableMethods() {
        const waitmarkConfigured = this.waitmarkService.isConfigured();
        const bkashConfigured = Boolean(this.configService.get('BKASH_APP_KEY') &&
            this.configService.get('BKASH_APP_SECRET'));
        const nagadConfigured = Boolean(this.configService.get('NAGAD_MERCHANT_ID') &&
            this.configService.get('NAGAD_MERCHANT_PRIVATE_KEY'));
        const sslCommerzConfigured = Boolean(this.configService.get('SSLCOMMERZ_STORE_ID') &&
            this.configService.get('SSLCOMMERZ_STORE_PASSWORD'));
        return [
            { id: 'COD', name: 'Cash on Delivery', isEnabled: true },
            {
                id: 'WAITMARK_PAY',
                name: 'Waitmark Pay (Cards, Mobile Banking & Wallets)',
                isEnabled: waitmarkConfigured,
                credentialsConfigured: waitmarkConfigured,
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
};
PaymentsService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [ConfigService,
        OrdersService,
        WaitmarkPaymentService])
], PaymentsService);
export { PaymentsService };
//# sourceMappingURL=payments.service.js.map