var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { SettingsModule } from '../settings/settings.module.js';
import { MailModule } from '../mail/mail.module.js';
import { CartController, CartMergeController } from './cart.controller.js';
import { AdminCartsController } from './admin-carts.controller.js';
import { CartService } from './cart.service.js';
let CartModule = class CartModule {
};
CartModule = __decorate([
    Module({
        imports: [AuthModule, SettingsModule, MailModule],
        controllers: [CartController, CartMergeController, AdminCartsController],
        providers: [CartService],
        exports: [CartService],
    })
], CartModule);
export { CartModule };
//# sourceMappingURL=cart.module.js.map