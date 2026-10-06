import { Controller, Get, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReviewsService } from '../services/reviews.service.js';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { UserRole } from '../../common/constants/roles.constant.js';

@ApiTags('Admin - Reviews')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
@Controller('admin/reviews')
export class AdminReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

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
  ) {
    const data = await this.reviewsService.updateStatus(id, status);
    return {
      message: `Review status updated to ${status}`,
      data,
    };
  }
}
