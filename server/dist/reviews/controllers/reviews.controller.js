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
import { Body, Controller, Delete, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { CustomerAuthGuard } from '../../auth/guards/customer-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { ReviewVoteDto } from '../dto/review-vote.dto.js';
import { UpdateReviewDto } from '../dto/update-review.dto.js';
import { ReviewsService } from '../services/reviews.service.js';
let ReviewsController = class ReviewsController {
    reviewsService;
    constructor(reviewsService) {
        this.reviewsService = reviewsService;
    }
    async update(reviewId, customerId, dto) {
        return {
            message: 'Review updated and returned to moderation',
            data: await this.reviewsService.updateOwned(reviewId, customerId, dto),
        };
    }
    async remove(reviewId, customerId) {
        return {
            message: 'Review deleted successfully',
            data: await this.reviewsService.deleteOwned(reviewId, customerId),
        };
    }
    async vote(reviewId, customerId, dto) {
        return {
            message: 'Review feedback recorded successfully',
            data: await this.reviewsService.vote(reviewId, customerId, dto.helpful),
        };
    }
};
__decorate([
    Patch(':reviewId'),
    ApiOperation({ summary: 'Edit an owned review and return it to moderation' }),
    __param(0, Param('reviewId')),
    __param(1, CurrentUser('id')),
    __param(2, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, UpdateReviewDto]),
    __metadata("design:returntype", Promise)
], ReviewsController.prototype, "update", null);
__decorate([
    Delete(':reviewId'),
    ApiOperation({ summary: 'Delete an owned review' }),
    __param(0, Param('reviewId')),
    __param(1, CurrentUser('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ReviewsController.prototype, "remove", null);
__decorate([
    Post(':reviewId/helpful'),
    Throttle({ default: { limit: 20, ttl: 60_000 } }),
    ApiOperation({ summary: 'Record an authenticated helpful or not-helpful vote' }),
    __param(0, Param('reviewId')),
    __param(1, CurrentUser('id')),
    __param(2, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, ReviewVoteDto]),
    __metadata("design:returntype", Promise)
], ReviewsController.prototype, "vote", null);
ReviewsController = __decorate([
    ApiTags('Reviews'),
    ApiBearerAuth(),
    UseGuards(CustomerAuthGuard),
    Controller('reviews'),
    __metadata("design:paramtypes", [ReviewsService])
], ReviewsController);
export { ReviewsController };
//# sourceMappingURL=reviews.controller.js.map