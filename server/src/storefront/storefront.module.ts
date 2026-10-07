import { Module } from '@nestjs/common';
import { CategoriesModule } from '../categories/categories.module.js';
import { ProductsModule } from '../products/products.module.js';
import { SettingsModule } from '../settings/settings.module.js';
import { StorefrontController } from './storefront.controller.js';
import { StorefrontService } from './storefront.service.js';

@Module({
  imports: [CategoriesModule, ProductsModule, SettingsModule],
  controllers: [StorefrontController],
  providers: [StorefrontService],
})
export class StorefrontModule {}
