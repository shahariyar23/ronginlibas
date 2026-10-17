import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module.js';
import { AuditModule } from '../audit/audit.module.js';
import { OrdersModule } from '../orders/orders.module.js';
import { COURIER_PROVIDER } from './constants/courier.constants.js';
import { SteadfastApiClient } from './client/steadfast-api.client.js';
import { SteadfastCourierProvider } from './providers/steadfast.provider.js';
import { MockSteadfastCourierProvider } from './providers/mock-steadfast.provider.js';
import { courierProviderFactory } from './providers/courier-provider.factory.js';
import { ShipmentService } from './services/shipment.service.js';
import { AdminCourierController } from './controllers/admin-courier.controller.js';
import { SteadfastWebhookController } from './controllers/steadfast-webhook.controller.js';

@Module({
  imports: [ConfigModule, PrismaModule, AuditModule, OrdersModule],
  controllers: [AdminCourierController, SteadfastWebhookController],
  providers: [
    SteadfastApiClient,
    SteadfastCourierProvider,
    MockSteadfastCourierProvider,
    {
      provide: COURIER_PROVIDER,
      useFactory: courierProviderFactory,
      inject: [ConfigService, SteadfastCourierProvider, MockSteadfastCourierProvider],
    },
    ShipmentService,
  ],
  exports: [ShipmentService, COURIER_PROVIDER],
})
export class CourierModule {}
