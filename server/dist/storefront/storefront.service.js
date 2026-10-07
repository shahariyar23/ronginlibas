var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from '@nestjs/common';
import { CategoriesService } from '../categories/services/categories.service.js';
import { ProductsService } from '../products/services/products.service.js';
import { SettingsService } from '../settings/services/settings.service.js';
let StorefrontService = class StorefrontService {
    productsService;
    categoriesService;
    settingsService;
    constructor(productsService, categoriesService, settingsService) {
        this.productsService = productsService;
        this.categoriesService = categoriesService;
        this.settingsService = settingsService;
    }
    async getHome() {
        const [featured, newArrivals, bestSellers, categories, storeSettings] = await Promise.all([
            this.productsService.findAll({ page: 1, limit: 8, featured: true, sort: 'featured' }),
            this.productsService.findAll({ page: 1, limit: 8, newArrival: true, sort: 'newest' }),
            this.productsService.findAll({ page: 1, limit: 8, bestSeller: true, sort: 'best-selling' }),
            this.categoriesService.findAll(),
            this.settingsService.getPublicSettings(),
        ]);
        return {
            featuredProducts: featured.items,
            newArrivals: newArrivals.items,
            bestSellers: bestSellers.items,
            categories,
            promotionalBanner: storeSettings.promotionalAnnouncement ?? null,
            storeSettings,
        };
    }
};
StorefrontService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [ProductsService,
        CategoriesService,
        SettingsService])
], StorefrontService);
export { StorefrontService };
//# sourceMappingURL=storefront.service.js.map