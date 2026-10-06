import { Module } from '@nestjs/common';
import { ShippingService } from './services/shipping.service.js';
import { ShippingController } from './controllers/shipping.controller.js';

@Module({
  controllers: [ShippingController],
  providers: [ShippingService],
  exports: [ShippingService],
})
export class ShippingModule {}
