import { Injectable } from '@nestjs/common';
import { CategoriesService } from '../categories/services/categories.service.js';
import { ProductsService } from '../products/services/products.service.js';
import { SettingsService } from '../settings/services/settings.service.js';

@Injectable()
export class StorefrontService {
  constructor(
    private readonly productsService: ProductsService,
    private readonly categoriesService: CategoriesService,
    private readonly settingsService: SettingsService,
  ) {}

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
}
