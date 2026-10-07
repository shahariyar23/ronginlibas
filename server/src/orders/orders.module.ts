import { Module } from '@nestjs/common';
import { OrdersService } from './services/orders.service.js';
import { OrdersController } from './controllers/orders.controller.js';
import { AdminOrdersController } from './controllers/admin-orders.controller.js';
import { SettingsModule } from '../settings/settings.module.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [SettingsModule, AuthModule],
  controllers: [OrdersController, AdminOrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
