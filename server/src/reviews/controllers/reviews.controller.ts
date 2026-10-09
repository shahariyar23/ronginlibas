import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { CustomerAuthGuard } from '../../auth/guards/customer-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { ReviewVoteDto } from '../dto/review-vote.dto.js';
import { UpdateReviewDto } from '../dto/update-review.dto.js';
import { ReviewsService } from '../services/reviews.service.js';
import { CloudinaryService } from '../../products/services/cloudinary.service.js';

@ApiTags('Reviews')
@ApiBearerAuth()
@UseGuards(CustomerAuthGuard)
@Controller('reviews')
export class ReviewsController {
  constructor(
    private readonly reviewsService: ReviewsService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @ApiOperation({ summary: 'Upload a customer review photo to Cloudinary' })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: (_request, file, callback) => {
        if (!['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(file.mimetype)) {
          callback(new BadRequestException('Only JPEG, PNG, WEBP, and AVIF images are allowed'), false);
          return;
        }
        callback(null, true);
      },
    }),
  )
  async uploadPhoto(
    @UploadedFile() file: { buffer: Buffer; mimetype: string } | undefined,
  ) {
    if (!file) throw new BadRequestException('An image file is required');
    const uploaded = await this.cloudinary.uploadReviewImage(file.buffer);
    return {
      message: 'Review photo uploaded successfully',
      data: { url: uploaded.secure_url, publicId: uploaded.public_id },
    };
  }

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
