var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var PaymentReconciliationService_1;
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UddoktaPaymentService } from './uddokta-payment.service.js';
import { OrdersService } from '../../orders/services/orders.service.js';
let PaymentReconciliationService = PaymentReconciliationService_1 = class PaymentReconciliationService {
    uddoktaPaymentService;
    ordersService;
    logger = new Logger(PaymentReconciliationService_1.name);
    isRunning = false;
    constructor(uddoktaPaymentService, ordersService) {
        this.uddoktaPaymentService = uddoktaPaymentService;
        this.ordersService = ordersService;
    }
    async handlePaymentReconciliation() {
        if (this.isRunning) {
            this.logger.debug('Reconciliation job already in progress, skipping concurrent run.');
            return;
        }
        this.isRunning = true;
        try {
            this.logger.log('[PaymentReconciliation] Running automated UddoktaPay verification sweep...');
            const result = await this.uddoktaPaymentService.reconcilePendingPayments();
            if (result.checked > 0) {
                this.logger.log(`[PaymentReconciliation] UddoktaPay sweep finished: ${result.checked} pending checked, ${result.settled} settled, ${result.failed} marked failed.`);
            }
            const expiredCount = await this.ordersService.cancelExpiredUnpaidOrders(120);
            if (expiredCount > 0) {
                this.logger.log(`[PaymentReconciliation] Released stock and expired ${expiredCount} order(s) exceeding 2-hour unpaid window.`);
            }
        }
        catch (err) {
            this.logger.error(`[PaymentReconciliation] Error during reconciliation sweep: ${err?.message || err}`);
        }
        finally {
            this.isRunning = false;
        }
    }
};
__decorate([
    Cron(CronExpression.EVERY_5_MINUTES),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PaymentReconciliationService.prototype, "handlePaymentReconciliation", null);
PaymentReconciliationService = PaymentReconciliationService_1 = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [UddoktaPaymentService,
        OrdersService])
], PaymentReconciliationService);
export { PaymentReconciliationService };
//# sourceMappingURL=payment-reconciliation.service.js.map