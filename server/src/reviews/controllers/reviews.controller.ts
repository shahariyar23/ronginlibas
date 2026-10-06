import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReviewsService } from '../services/reviews.service.js';
import { CreateReviewDto } from '../dto/create-review.dto.js';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';

@ApiTags('Storefront - Reviews')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @ApiOperation({ summary: 'Submit verified customer feedback and review for a garment' })
  async create(@Body() dto: CreateReviewDto, @CurrentUser('id') customerId: string) {
    const data = await this.reviewsService.create(dto, customerId);
    return {
      message: 'Review submitted for atelier curation',
      data,
    };
  }
}
