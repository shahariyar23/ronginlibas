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
import { Controller, Get, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReviewsService } from '../services/reviews.service.js';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Permissions } from '../../common/decorators/permissions.decorator.js';
import { UserRole } from '../../common/constants/roles.constant.js';
import { AdminReviewFeedbackDto } from '../dto/admin-review-feedback.dto.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { AuditService } from '../../audit/audit.service.js';
let AdminReviewsController = class AdminReviewsController {
    reviewsService;
    auditService;
    constructor(reviewsService, auditService) {
        this.reviewsService = reviewsService;
        this.auditService = auditService;
    }
    async findAll(query, status) {
        const data = await this.reviewsService.findAll(query, status);
        return {
            message: 'Reviews retrieved successfully',
            data,
        };
    }
    async updateStatus(id, status, actor) {
        const before = await this.reviewsService.getAdminAuditState(id);
        const data = await this.reviewsService.updateStatus(id, status);
        await this.auditService.record({
            actor,
            module: 'reviews',
            action: 'REVIEW_STATUS_CHANGED',
            entityType: 'review',
            entityId: data.id,
            summary: `Changed review status from ${before.status} to ${data.status}`,
            before: { status: before.status },
            after: { status: data.status },
        });
        return {
            message: `Review status updated to ${status}`,
            data,
        };
    }
    async updateFeedback(id, dto, actor) {
        const before = await this.reviewsService.getAdminAuditState(id);
        const data = await this.reviewsService.updateAdminFeedback(id, dto.feedback);
        await this.auditService.record({
            actor,
            module: 'reviews',
            action: 'REVIEW_FEEDBACK_UPDATED',
            entityType: 'review',
            entityId: data.id,
            summary: 'Updated admin feedback for a customer review',
            before: { adminFeedback: before.adminFeedback },
            after: { adminFeedback: data.adminFeedback },
        });
        return {
            message: 'Review feedback sent successfully',
            data,
        };
    }
};
__decorate([
    Get(),
    ApiOperation({ summary: 'List customer testimonials for moderation' }),
    __param(0, Query()),
    __param(1, Query('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [PaginationQueryDto, String]),
    __metadata("design:returntype", Promise)
], AdminReviewsController.prototype, "findAll", null);
__decorate([
    Patch(':id/status'),
    ApiOperation({ summary: 'Approve, reject, or hide customer review' }),
    __param(0, Param('id')),
    __param(1, Body('status')),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], AdminReviewsController.prototype, "updateStatus", null);
__decorate([
    Patch(':id/feedback'),
    ApiOperation({ summary: 'Send feedback on a customer review' }),
    __param(0, Param('id')),
    __param(1, Body()),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, AdminReviewFeedbackDto, Object]),
    __metadata("design:returntype", Promise)
], AdminReviewsController.prototype, "updateFeedback", null);
AdminReviewsController = __decorate([
    ApiTags('Admin - Reviews'),
    ApiBearerAuth(),
    UseGuards(JwtAuthGuard, RolesGuard),
    Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
    Permissions('reviews'),
    Controller('admin/reviews'),
    __metadata("design:paramtypes", [ReviewsService,
        AuditService])
], AdminReviewsController);
export { AdminReviewsController };
//# sourceMappingURL=admin-reviews.controller.js.map