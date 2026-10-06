import { Module } from '@nestjs/common';
import { PaymentsService } from './services/payments.service.js';
import { PaymentsController } from './controllers/payments.controller.js';

@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
