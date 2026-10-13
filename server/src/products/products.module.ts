import { Module } from '@nestjs/common';
import { ProductsService } from './services/products.service.js';
import { ProductsController } from './controllers/products.controller.js';
import { AdminProductsController } from './controllers/admin-products.controller.js';
import { ProductSearchController } from './controllers/product-search.controller.js';
import { AdminProductImagesController } from './controllers/admin-product-images.controller.js';
import { CloudinaryService } from './services/cloudinary.service.js';
import { WishlistModule } from '../wishlist/wishlist.module.js';

@Module({
  imports: [WishlistModule],
  controllers: [
    ProductsController,
    ProductSearchController,
    AdminProductsController,
    AdminProductImagesController,
  ],
  providers: [ProductsService, CloudinaryService],
  exports: [ProductsService, CloudinaryService],
})
export class ProductsModule {}
