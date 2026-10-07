var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Module } from '@nestjs/common';
import { ReviewsService } from './services/reviews.service.js';
import { ReviewsController } from './controllers/reviews.controller.js';
import { AdminReviewsController } from './controllers/admin-reviews.controller.js';
import { ProductReviewsController } from './controllers/product-reviews.controller.js';
import { AuthModule } from '../auth/auth.module.js';
let ReviewsModule = class ReviewsModule {
};
ReviewsModule = __decorate([
    Module({
        imports: [AuthModule],
        controllers: [ReviewsController, ProductReviewsController, AdminReviewsController],
        providers: [ReviewsService],
        exports: [ReviewsService],
    })
], ReviewsModule);
export { ReviewsModule };
//# sourceMappingURL=reviews.module.js.map