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
import { AuditService, AdminAuditActor } from '../../audit/audit.service.js';

@ApiTags('Admin - Reviews')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
@Permissions('reviews')
@Controller('admin/reviews')
export class AdminReviewsController {
  constructor(
    private readonly reviewsService: ReviewsService,
    private readonly auditService: AuditService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List customer testimonials for moderation' })
  async findAll(@Query() query: PaginationQueryDto, @Query('status') status?: string) {
    const data = await this.reviewsService.findAll(query, status);
    return {
      message: 'Reviews retrieved successfully',
      data,
    };
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Approve, reject, or hide customer review' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'HIDDEN',
    @CurrentUser() actor: AdminAuditActor,
  ) {
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

  @Patch(':id/feedback')
  @ApiOperation({ summary: 'Send feedback on a customer review' })
  async updateFeedback(
    @Param('id') id: string,
    @Body() dto: AdminReviewFeedbackDto,
    @CurrentUser() actor: AdminAuditActor,
  ) {
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
}
