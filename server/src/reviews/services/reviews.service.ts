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
          customer: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              addresses: {
                where: { isDefault: true },
                select: { city: true, division: true },
                take: 1,
              },
            },
          },
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
      where: { OR: [{ id: productId }, { slug: productId }], isActive: true },
      select: { id: true },
    });
    if (!product) throw new NotFoundException('Product not found');
    const resolvedProductId = product.id;

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where = { productId: resolvedProductId, status: 'APPROVED' as const };
    const [reviews, total, ratingSummary, distribution] = await Promise.all([
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
      this.prisma.review.groupBy({
        by: ['rating'],
        where,
        _count: { _all: true },
      }),
    ]);
    const reviewIds = reviews.map((review) => review.id);
    const [verifiedOrders, votes] = await Promise.all([
      this.prisma.orderItem.findMany({
        where: {
          productId: resolvedProductId,
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

    const ratingDistribution = {
      5: distribution.find((d) => d.rating === 5)?._count._all ?? 0,
      4: distribution.find((d) => d.rating === 4)?._count._all ?? 0,
      3: distribution.find((d) => d.rating === 3)?._count._all ?? 0,
      2: distribution.find((d) => d.rating === 2)?._count._all ?? 0,
      1: distribution.find((d) => d.rating === 1)?._count._all ?? 0,
    };

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
      averageRating: ratingSummary._avg.rating ? Number(ratingSummary._avg.rating.toFixed(1)) : 0,
      ratingDistribution,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
      hasNext: (page - 1) * limit + reviews.length < total,
      hasPrevious: page > 1,
    };
  }

  async checkEligibility(productId: string, customerId: string) {
    const product = await this.prisma.product.findFirst({
      where: { OR: [{ id: productId }, { slug: productId }], isActive: true },
      select: { id: true },
    });
    if (!product) throw new NotFoundException('Product not found');
    const resolvedProductId = product.id;

    const previous = await this.prisma.review.findFirst({
      where: { productId: resolvedProductId, customerId },
      select: { id: true, status: true, rating: true, createdAt: true },
    });
    if (previous) {
      return {
        canReview: false,
        reason: 'ALREADY_REVIEWED',
        existingReview: previous,
      };
    }

    const purchase = await this.prisma.orderItem.findFirst({
      where: {
        productId: resolvedProductId,
        order: { customerId, status: 'DELIVERED' },
      },
      select: {
        id: true,
        order: { select: { id: true, orderNumber: true, updatedAt: true } },
      },
    });

    if (!purchase) {
      return {
        canReview: false,
        reason: 'NO_DELIVERED_PURCHASE',
      };
    }

    return {
      canReview: true,
      reason: 'ELIGIBLE',
      orderNumber: purchase.order.orderNumber,
    };
  }

  async findCustomerReviews(customerId: string) {
    const reviews = await this.prisma.review.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            images: {
              where: { isPrimary: true },
              select: { url: true, altText: true },
              take: 1,
            },
          },
        },
      },
    });
    return reviews.map((r) => ({
      id: r.id,
      productId: r.productId,
      productName: r.product.name,
      productSlug: r.product.slug,
      productImage: r.product.images[0]?.url ?? null,
      rating: r.rating,
      comment: r.comment,
      status: r.status,
      adminFeedback: r.adminFeedback,
      adminFeedbackAt: r.adminFeedbackAt,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));
  }

  async findEligibleProducts(customerId: string) {
    const deliveredItems = await this.prisma.orderItem.findMany({
      where: {
        order: {
          customerId,
          status: 'DELIVERED',
        },
      },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            updatedAt: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            images: {
              where: { isPrimary: true },
              select: { url: true, altText: true },
              take: 1,
            },
          },
        },
      },
      orderBy: { order: { createdAt: 'desc' } },
    });

    const customerReviews = await this.prisma.review.findMany({
      where: { customerId },
      select: { productId: true },
    });
    const reviewedProductIds = new Set(customerReviews.map((r) => r.productId));

    const eligibleList: Array<{
      orderId: string;
      orderNumber: string;
      deliveredAt: Date;
      product: {
        id: string;
        name: string;
        slug: string;
        image: string | null;
      };
      size: string;
      color: string;
    }> = [];

    const seenProducts = new Set<string>();

    for (const item of deliveredItems) {
      if (!item.productId || !item.product) continue;
      if (reviewedProductIds.has(item.productId)) continue;
      if (seenProducts.has(item.productId)) continue;
      seenProducts.add(item.productId);

      eligibleList.push({
        orderId: item.order.id,
        orderNumber: item.order.orderNumber,
        deliveredAt: item.order.updatedAt,
        product: {
          id: item.product.id,
          name: item.product.name,
          slug: item.product.slug,
          image: item.product.images[0]?.url ?? null,
        },
        size: item.size ?? '',
        color: item.color ?? '',
      });
    }

    return eligibleList;
  }

  async createForProduct(
    productId: string,
    dto: Pick<CreateReviewDto, 'rating' | 'comment'>,
    customerId: string,
  ) {
    const product = await this.prisma.product.findFirst({
      where: { OR: [{ id: productId }, { slug: productId }], isActive: true },
      select: { id: true },
    });
    if (!product) throw new NotFoundException('Product not found');
    const resolvedProductId = product.id;

    try {
      return await this.prisma.$transaction(
        async (transaction) => {
          const purchase = await transaction.orderItem.findFirst({
            where: {
              productId: resolvedProductId,
              order: { customerId, status: 'DELIVERED' },
            },
            select: { id: true },
          });
          if (!purchase) {
            throw new ForbiddenException('A delivered purchase is required to review this product');
          }
          const previous = await transaction.review.findFirst({
            where: { productId: resolvedProductId, customerId },
            select: { id: true },
          });
          if (previous) {
            throw new ConflictException('A review for this product has already been submitted');
          }
          return transaction.review.create({
            data: {
              productId: resolvedProductId,
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
      data: {
        rating: dto.rating,
        comment: dto.comment,
        status: 'PENDING',
        adminFeedback: null,
        adminFeedbackAt: null,
      },
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
    return this.prisma.reviewVote.upsert({
      where: { reviewId_customerId: { reviewId, customerId } },
      create: { reviewId, customerId, helpful },
      update: { helpful },
    });
  }

  async updateStatus(id: string, status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'HIDDEN') {
    return this.prisma.review.update({
      where: { id },
      data: { status },
    });
  }

  async updateAdminFeedback(id: string, feedback: string) {
    const trimmedFeedback = feedback.trim();
    if (!trimmedFeedback) throw new BadRequestException('Review feedback cannot be empty');

    return this.prisma.review.update({
      where: { id },
      data: { adminFeedback: trimmedFeedback, adminFeedbackAt: new Date() },
      select: { id: true, adminFeedback: true, adminFeedbackAt: true },
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
