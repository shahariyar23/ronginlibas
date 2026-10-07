import { Module } from '@nestjs/common';
import { CategoriesService } from './services/categories.service.js';
import { CategoriesController } from './controllers/categories.controller.js';
import { AdminCategoriesController } from './controllers/admin-categories.controller.js';
import { ProductsModule } from '../products/products.module.js';

@Module({
  imports: [ProductsModule],
  controllers: [CategoriesController, AdminCategoriesController],
  providers: [CategoriesService],
  exports: [CategoriesService],
})
export class CategoriesModule {}
