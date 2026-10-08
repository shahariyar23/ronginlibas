import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { CustomerAuthGuard } from '../../auth/guards/customer-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { ReviewVoteDto } from '../dto/review-vote.dto.js';
import { UpdateReviewDto } from '../dto/update-review.dto.js';
import { ReviewsService } from '../services/reviews.service.js';

@ApiTags('Reviews')
@ApiBearerAuth()
@UseGuards(CustomerAuthGuard)
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get('mine')
  @ApiOperation({ summary: 'Retrieve reviews submitted by the authenticated customer' })
  async findMine(@CurrentUser('id') customerId: string) {
    return {
      message: 'My reviews retrieved successfully',
      data: await this.reviewsService.findCustomerReviews(customerId),
    };
  }

  @Get('eligible')
  @ApiOperation({ summary: 'List delivered products eligible for review by the customer' })
  async findEligible(@CurrentUser('id') customerId: string) {
    return {
      message: 'Eligible review products retrieved successfully',
      data: await this.reviewsService.findEligibleProducts(customerId),
    };
  }

  @Patch(':reviewId')
  @ApiOperation({ summary: 'Edit an owned review and return it to moderation' })
  async update(
    @Param('reviewId') reviewId: string,
    @CurrentUser('id') customerId: string,
    @Body() dto: UpdateReviewDto,
  ) {
    return {
      message: 'Review updated and returned to moderation',
      data: await this.reviewsService.updateOwned(reviewId, customerId, dto),
    };
  }

  @Delete(':reviewId')
  @ApiOperation({ summary: 'Delete an owned review' })
  async remove(@Param('reviewId') reviewId: string, @CurrentUser('id') customerId: string) {
    return {
      message: 'Review deleted successfully',
      data: await this.reviewsService.deleteOwned(reviewId, customerId),
    };
  }

  @Post(':reviewId/helpful')
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @ApiOperation({ summary: 'Record an authenticated helpful or not-helpful vote' })
  async vote(
    @Param('reviewId') reviewId: string,
    @CurrentUser('id') customerId: string,
    @Body() dto: ReviewVoteDto,
  ) {
    return {
      message: 'Review feedback recorded successfully',
      data: await this.reviewsService.vote(reviewId, customerId, dto.helpful),
    };
  }
}
