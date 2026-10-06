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
import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReviewsService } from '../services/reviews.service.js';
import { CreateReviewDto } from '../dto/create-review.dto.js';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
let ReviewsController = class ReviewsController {
    reviewsService;
    constructor(reviewsService) {
        this.reviewsService = reviewsService;
    }
    async create(dto, customerId) {
        const data = await this.reviewsService.create(dto, customerId);
        return {
            message: 'Review submitted for atelier curation',
            data,
        };
    }
};
__decorate([
    Post(),
    ApiOperation({ summary: 'Submit verified customer feedback and review for a garment' }),
    __param(0, Body()),
    __param(1, CurrentUser('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateReviewDto, String]),
    __metadata("design:returntype", Promise)
], ReviewsController.prototype, "create", null);
ReviewsController = __decorate([
    ApiTags('Storefront - Reviews'),
    ApiBearerAuth(),
    UseGuards(JwtAuthGuard),
    Controller('reviews'),
    __metadata("design:paramtypes", [ReviewsService])
], ReviewsController);
export { ReviewsController };
//# sourceMappingURL=reviews.controller.js.map