var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Module } from '@nestjs/common';
import { PaymentsService } from './services/payments.service.js';
import { PaymentsController } from './controllers/payments.controller.js';
import { ConfigModule } from '@nestjs/config';
import { OrdersModule } from '../orders/orders.module.js';
import { AuthModule } from '../auth/auth.module.js';
let PaymentsModule = class PaymentsModule {
};
PaymentsModule = __decorate([
    Module({
        imports: [ConfigModule, OrdersModule, AuthModule],
        controllers: [PaymentsController],
        providers: [PaymentsService],
        exports: [PaymentsService],
    })
], PaymentsModule);
export { PaymentsModule };
//# sourceMappingURL=payments.module.js.map