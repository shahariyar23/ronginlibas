var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Module } from '@nestjs/common';
import { ProductsService } from './services/products.service.js';
import { ProductsController } from './controllers/products.controller.js';
import { AdminProductsController } from './controllers/admin-products.controller.js';
import { ProductSearchController } from './controllers/product-search.controller.js';
import { AdminProductImagesController } from './controllers/admin-product-images.controller.js';
import { CloudinaryService } from './services/cloudinary.service.js';
let ProductsModule = class ProductsModule {
};
ProductsModule = __decorate([
    Module({
        controllers: [
            ProductsController,
            ProductSearchController,
            AdminProductsController,
            AdminProductImagesController,
        ],
        providers: [ProductsService, CloudinaryService],
        exports: [ProductsService],
    })
], ProductsModule);
export { ProductsModule };
//# sourceMappingURL=products.module.js.map