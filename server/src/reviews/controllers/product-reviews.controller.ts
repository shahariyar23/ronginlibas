import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CustomerAuthGuard } from '../../auth/guards/customer-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { Public } from '../../common/decorators/public.decorator.js';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
import { CreateProductReviewDto } from '../dto/create-product-review.dto.js';
import { ReviewsService } from '../services/reviews.service.js';

@ApiTags('Reviews')
@Controller('products/:productId/reviews')
export class ProductReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'List approved product reviews and rating summary' })
  async findForProduct(
    @Param('productId') productId: string,
    @Query() query: PaginationQueryDto,
  ) {
    return {
      message: 'Product reviews retrieved successfully',
      data: await this.reviewsService.findProductReviews(productId, query),
    };
  }

  @Get('eligibility')
  @UseGuards(CustomerAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check if authenticated customer can review this product' })
  async checkEligibility(
    @Param('productId') productId: string,
    @CurrentUser('id') customerId: string,
  ) {
    return {
      message: 'Review eligibility checked',
      data: await this.reviewsService.checkEligibility(productId, customerId),
    };
  }

  @Post()
  @UseGuards(CustomerAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit a review after a delivered product purchase' })
  async create(
    @Param('productId') productId: string,
    @CurrentUser('id') customerId: string,
    @Body() dto: CreateProductReviewDto,
  ) {
    return {
      message: 'Review submitted for moderation',
      data: await this.reviewsService.createForProduct(productId, dto, customerId),
    };
  }
}
