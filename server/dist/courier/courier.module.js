var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
let CourierModule = class CourierModule {
};
CourierModule = __decorate([
    Module({
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
], CourierModule);
export { CourierModule };
//# sourceMappingURL=courier.module.js.map