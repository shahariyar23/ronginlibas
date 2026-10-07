var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Module } from '@nestjs/common';
import { CategoriesModule } from '../categories/categories.module.js';
import { ProductsModule } from '../products/products.module.js';
import { SettingsModule } from '../settings/settings.module.js';
import { StorefrontController } from './storefront.controller.js';
import { StorefrontService } from './storefront.service.js';
let StorefrontModule = class StorefrontModule {
};
StorefrontModule = __decorate([
    Module({
        imports: [CategoriesModule, ProductsModule, SettingsModule],
        controllers: [StorefrontController],
        providers: [StorefrontService],
    })
], StorefrontModule);
export { StorefrontModule };
//# sourceMappingURL=storefront.module.js.map