import { Module } from '@nestjs/common';
import { ReviewsService } from './services/reviews.service.js';
import { ReviewsController } from './controllers/reviews.controller.js';
import { AdminReviewsController } from './controllers/admin-reviews.controller.js';
import { ProductReviewsController } from './controllers/product-reviews.controller.js';
import { AuthModule } from '../auth/auth.module.js';
import { ProductsModule } from '../products/products.module.js';

@Module({
  imports: [AuthModule, ProductsModule],
  controllers: [ReviewsController, ProductReviewsController, AdminReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}
