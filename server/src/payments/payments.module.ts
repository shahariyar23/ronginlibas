import { Module } from '@nestjs/common';
import { PaymentsService } from './services/payments.service.js';
import { PaymentsController } from './controllers/payments.controller.js';
import { ConfigModule } from '@nestjs/config';
import { OrdersModule } from '../orders/orders.module.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [ConfigModule, OrdersModule, AuthModule],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
