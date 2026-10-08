var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CustomerAuthGuard } from '../../auth/guards/customer-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { Public } from '../../common/decorators/public.decorator.js';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
import { CreateProductReviewDto } from '../dto/create-product-review.dto.js';
import { ReviewsService } from '../services/reviews.service.js';
let ProductReviewsController = class ProductReviewsController {
    reviewsService;
    constructor(reviewsService) {
        this.reviewsService = reviewsService;
    }
    async findForProduct(productId, query) {
        return {
            message: 'Product reviews retrieved successfully',
            data: await this.reviewsService.findProductReviews(productId, query),
        };
    }
    async checkEligibility(productId, customerId) {
        return {
            message: 'Review eligibility checked',
            data: await this.reviewsService.checkEligibility(productId, customerId),
        };
    }
    async create(productId, customerId, dto) {
        return {
            message: 'Review submitted for moderation',
            data: await this.reviewsService.createForProduct(productId, dto, customerId),
        };
    }
};
__decorate([
    Get(),
    Public(),
    ApiOperation({ summary: 'List approved product reviews and rating summary' }),
    __param(0, Param('productId')),
    __param(1, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, PaginationQueryDto]),
    __metadata("design:returntype", Promise)
], ProductReviewsController.prototype, "findForProduct", null);
__decorate([
    Get('eligibility'),
    UseGuards(CustomerAuthGuard),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Check if authenticated customer can review this product' }),
    __param(0, Param('productId')),
    __param(1, CurrentUser('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ProductReviewsController.prototype, "checkEligibility", null);
__decorate([
    Post(),
    UseGuards(CustomerAuthGuard),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Submit a review after a delivered product purchase' }),
    __param(0, Param('productId')),
    __param(1, CurrentUser('id')),
    __param(2, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, CreateProductReviewDto]),
    __metadata("design:returntype", Promise)
], ProductReviewsController.prototype, "create", null);
ProductReviewsController = __decorate([
    ApiTags('Reviews'),
    Controller('products/:productId/reviews'),
    __metadata("design:paramtypes", [ReviewsService])
], ProductReviewsController);
export { ProductReviewsController };
//# sourceMappingURL=product-reviews.controller.js.map