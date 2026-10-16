var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Module } from '@nestjs/common';
import { OrdersService } from './services/orders.service.js';
import { OrdersController } from './controllers/orders.controller.js';
import { AdminOrdersController } from './controllers/admin-orders.controller.js';
import { SettingsModule } from '../settings/settings.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { MailModule } from '../mail/mail.module.js';
import { AnalyticsModule } from '../analytics/analytics.module.js';
import { InvoicesService } from './services/invoices.service.js';
let OrdersModule = class OrdersModule {
};
OrdersModule = __decorate([
    Module({
        imports: [SettingsModule, AuthModule, MailModule, AnalyticsModule],
        controllers: [OrdersController, AdminOrdersController],
        providers: [OrdersService, InvoicesService],
        exports: [OrdersService, InvoicesService],
    })
], OrdersModule);
export { OrdersModule };
//# sourceMappingURL=orders.module.js.map