import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UddoktaPaymentService } from './uddokta-payment.service.js';
import { OrdersService } from '../../orders/services/orders.service.js';

@Injectable()
export class PaymentReconciliationService {
  private readonly logger = new Logger(PaymentReconciliationService.name);
  private isRunning = false;

  constructor(
    private readonly uddoktaPaymentService: UddoktaPaymentService,
    private readonly ordersService: OrdersService,
  ) {}

  /**
   * Periodic reconciliation job:
   * 1. Automatically polls UddoktaPay every 5 minutes to verify any pending orders created within 2 hours.
   * 2. Confirms any orders where payment cleared and sends confirmation email + official PDF invoice.
   * 3. Expires and releases inventory for orders that remained unpaid after 2 hours (120 minutes).
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
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
        this.logger.log(
          `[PaymentReconciliation] UddoktaPay sweep finished: ${result.checked} pending checked, ${result.settled} settled, ${result.failed} marked failed.`,
        );
      }

      // Expire orders older than 120 minutes (2 hours)
      const expiredCount = await this.ordersService.cancelExpiredUnpaidOrders(120);
      if (expiredCount > 0) {
        this.logger.log(
          `[PaymentReconciliation] Released stock and expired ${expiredCount} order(s) exceeding 2-hour unpaid window.`,
        );
      }
    } catch (err: any) {
      this.logger.error(`[PaymentReconciliation] Error during reconciliation sweep: ${err?.message || err}`);
    } finally {
      this.isRunning = false;
    }
  }
}
