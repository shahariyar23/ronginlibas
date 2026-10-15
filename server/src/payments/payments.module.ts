import { Module } from '@nestjs/common';
import { PaymentsService } from './services/payments.service.js';
import { PaymentsController } from './controllers/payments.controller.js';
import { ConfigModule } from '@nestjs/config';
import { OrdersModule } from '../orders/orders.module.js';
import { AuthModule } from '../auth/auth.module.js';

import { WaitmarkPaymentService } from './services/waitmark-payment.service.js';
import { UddoktaPaymentService } from './services/uddokta-payment.service.js';
import { AnalyticsModule } from '../analytics/analytics.module.js';

@Module({
  imports: [ConfigModule, OrdersModule, AuthModule, AnalyticsModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, WaitmarkPaymentService, UddoktaPaymentService],
  exports: [PaymentsService, WaitmarkPaymentService, UddoktaPaymentService],
})
export class PaymentsModule {}
