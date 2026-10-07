import { Module } from '@nestjs/common';
import { ProductsService } from './services/products.service.js';
import { ProductsController } from './controllers/products.controller.js';
import { AdminProductsController } from './controllers/admin-products.controller.js';
import { ProductSearchController } from './controllers/product-search.controller.js';

@Module({
  controllers: [ProductsController, ProductSearchController, AdminProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
