import { Module } from '@nestjs/common';
import { ReviewsService } from './services/reviews.service.js';
import { ReviewsController } from './controllers/reviews.controller.js';
import { AdminReviewsController } from './controllers/admin-reviews.controller.js';

@Module({
  controllers: [ReviewsController, AdminReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}
