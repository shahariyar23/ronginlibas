import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, ReviewStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateReviewDto } from '../dto/create-review.dto.js';
import { PaginationQueryDto, PaginatedResult } from '../../common/dto/pagination-query.dto.js';
import { UpdateReviewDto } from '../dto/update-review.dto.js';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    query: PaginationQueryDto,
    status?: string,
  ): Promise<PaginatedResult<any> & { hasNext: boolean; hasPrevious: boolean }> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.ReviewWhereInput = {};
    if (status && status !== 'ALL') {
      if (!Object.values(ReviewStatus).includes(status as ReviewStatus)) {
        throw new BadRequestException('Review status is invalid');
      }
      where.status = status as ReviewStatus;
    }

    const [items, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        skip,
        take: limit,
        include: {
          customer: { select: { firstName: true, lastName: true } },
          product: { select: { name: true, sku: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.review.count({ where }),
    ]);

    return {
      items,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: skip + items.length < total,
      hasPrevious: page > 1,
    };
  }

  async create(dto: CreateReviewDto, customerId: string) {
    return this.createForProduct(dto.productId, dto, customerId);
  }

  async findProductReviews(productId: string, query: PaginationQueryDto) {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, isActive: true },
      select: { id: true },
    });
    if (!product) throw new NotFoundException('Product not found');

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where = { productId, status: 'APPROVED' as const };
    const [reviews, total, ratingSummary] = await Promise.all([
      this.prisma.review.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
          customerId: true,
          customer: { select: { firstName: true, lastName: true } },
        },
      }),
      this.prisma.review.count({ where }),
      this.prisma.review.aggregate({ where, _avg: { rating: true } }),
    ]);
    const reviewIds = reviews.map((review) => review.id);
    const [verifiedOrders, votes] = await Promise.all([
      this.prisma.orderItem.findMany({
        where: {
          productId,
          order: {
            status: 'DELIVERED',
            customerId: { in: [...new Set(reviews.map((review) => review.customerId))] },
          },
        },
        select: { order: { select: { customerId: true } } },
        distinct: ['orderId'],
      }),
      reviewIds.length
        ? this.prisma.reviewVote.groupBy({
            by: ['reviewId', 'helpful'],
            where: { reviewId: { in: reviewIds } },
            _count: { _all: true },
          })
        : Promise.resolve([]),
    ]);
    const verifiedCustomerIds = new Set(
      verifiedOrders.map((item) => item.order.customerId).filter((id): id is string => Boolean(id)),
    );
    return {
      items: reviews.map((review) => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
        customerName: `${review.customer.firstName} ${review.customer.lastName ?? ''}`.trim(),
        verifiedPurchase: verifiedCustomerIds.has(review.customerId),
        helpfulYes:
          votes.find((vote) => vote.reviewId === review.id && vote.helpful)?._count._all ?? 0,
        helpfulNo:
          votes.find((vote) => vote.reviewId === review.id && !vote.helpful)?._count._all ?? 0,
      })),
      averageRating: ratingSummary._avg.rating ?? 0,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: (page - 1) * limit + reviews.length < total,
      hasPrevious: page > 1,
    };
  }

  async createForProduct(
    productId: string,
    dto: Pick<CreateReviewDto, 'rating' | 'comment'>,
    customerId: string,
  ) {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, isActive: true },
      select: { id: true },
    });
    if (!product) throw new NotFoundException('Product not found');
    try {
      return await this.prisma.$transaction(
        async (transaction) => {
          const purchase = await transaction.orderItem.findFirst({
            where: {
              productId,
              order: { customerId, status: 'DELIVERED' },
            },
            select: { id: true },
          });
          if (!purchase) {
            throw new ForbiddenException('A delivered purchase is required to review this product');
          }
          const previous = await transaction.review.findFirst({
            where: { productId, customerId },
            select: { id: true },
          });
          if (previous) {
            throw new ConflictException('A review for this product has already been submitted');
          }
          return transaction.review.create({
            data: {
              productId,
              customerId,
              rating: dto.rating,
              comment: dto.comment,
              status: 'PENDING',
            },
            select: {
              id: true,
              productId: true,
              rating: true,
              comment: true,
              status: true,
              createdAt: true,
            },
          });
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
    } catch (error) {
      if (isUniqueConstraintError(error) || isTransactionConflict(error)) {
        throw new ConflictException('A review for this product has already been submitted');
      }
      throw error;
    }
  }

  async updateOwned(reviewId: string, customerId: string, dto: UpdateReviewDto) {
    const review = await this.prisma.review.findFirst({
      where: { id: reviewId, customerId },
      select: { id: true },
    });
    if (!review) throw new NotFoundException('Review not found');
    return this.prisma.review.update({
      where: { id: review.id },
      data: { rating: dto.rating, comment: dto.comment, status: 'PENDING' },
      select: { id: true, productId: true, rating: true, comment: true, status: true, updatedAt: true },
    });
  }

  async deleteOwned(reviewId: string, customerId: string) {
    const result = await this.prisma.review.deleteMany({ where: { id: reviewId, customerId } });
    if (result.count === 0) throw new NotFoundException('Review not found');
    return { deleted: true };
  }

  async vote(reviewId: string, customerId: string, helpful: boolean) {
    const review = await this.prisma.review.findFirst({
      where: { id: reviewId, status: 'APPROVED' },
      select: { id: true },
    });
    if (!review) throw new NotFoundException('Review not found');
    try {
      await this.prisma.reviewVote.create({ data: { reviewId, customerId, helpful } });
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new ConflictException('Feedback has already been recorded for this review');
      }
      throw error;
    }
    return { recorded: true };
  }

  async updateStatus(id: string, status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'HIDDEN') {
    return this.prisma.review.update({
      where: { id },
      data: { status },
    });
  }
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 'P2002'
  );
}

function isTransactionConflict(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2034'
  );
}
