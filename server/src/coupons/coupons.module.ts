import { Module } from '@nestjs/common';
import { CouponsService } from './services/coupons.service.js';
import { CouponsController } from './controllers/coupons.controller.js';
import { AdminCouponsController } from './controllers/admin-coupons.controller.js';

@Module({
  controllers: [CouponsController, AdminCouponsController],
  providers: [CouponsService],
  exports: [CouponsService],
})
export class CouponsModule {}
