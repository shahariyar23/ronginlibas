var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException, } from '@nestjs/common';
import { Prisma, ReviewStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
let ReviewsService = class ReviewsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(query, status) {
        const page = query.page || 1;
        const limit = query.limit || 20;
        const skip = (page - 1) * limit;
        const where = {};
        if (status && status !== 'ALL') {
            if (!Object.values(ReviewStatus).includes(status)) {
                throw new BadRequestException('Review status is invalid');
            }
            where.status = status;
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
    async create(dto, customerId) {
        return this.createForProduct(dto.productId, dto, customerId);
    }
    async findProductReviews(productId, query) {
        const product = await this.prisma.product.findFirst({
            where: { id: productId, isActive: true },
            select: { id: true },
        });
        if (!product)
            throw new NotFoundException('Product not found');
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        const where = { productId, status: 'APPROVED' };
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
        const verifiedCustomerIds = new Set(verifiedOrders.map((item) => item.order.customerId).filter((id) => Boolean(id)));
        return {
            items: reviews.map((review) => ({
                id: review.id,
                rating: review.rating,
                comment: review.comment,
                createdAt: review.createdAt,
                customerName: `${review.customer.firstName} ${review.customer.lastName ?? ''}`.trim(),
                verifiedPurchase: verifiedCustomerIds.has(review.customerId),
                helpfulYes: votes.find((vote) => vote.reviewId === review.id && vote.helpful)?._count._all ?? 0,
                helpfulNo: votes.find((vote) => vote.reviewId === review.id && !vote.helpful)?._count._all ?? 0,
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
    async createForProduct(productId, dto, customerId) {
        const product = await this.prisma.product.findFirst({
            where: { id: productId, isActive: true },
            select: { id: true },
        });
        if (!product)
            throw new NotFoundException('Product not found');
        try {
            return await this.prisma.$transaction(async (transaction) => {
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
            }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
        }
        catch (error) {
            if (isUniqueConstraintError(error) || isTransactionConflict(error)) {
                throw new ConflictException('A review for this product has already been submitted');
            }
            throw error;
        }
    }
    async updateOwned(reviewId, customerId, dto) {
        const review = await this.prisma.review.findFirst({
            where: { id: reviewId, customerId },
            select: { id: true },
        });
        if (!review)
            throw new NotFoundException('Review not found');
        return this.prisma.review.update({
            where: { id: review.id },
            data: { rating: dto.rating, comment: dto.comment, status: 'PENDING' },
            select: { id: true, productId: true, rating: true, comment: true, status: true, updatedAt: true },
        });
    }
    async deleteOwned(reviewId, customerId) {
        const result = await this.prisma.review.deleteMany({ where: { id: reviewId, customerId } });
        if (result.count === 0)
            throw new NotFoundException('Review not found');
        return { deleted: true };
    }
    async vote(reviewId, customerId, helpful) {
        const review = await this.prisma.review.findFirst({
            where: { id: reviewId, status: 'APPROVED' },
            select: { id: true },
        });
        if (!review)
            throw new NotFoundException('Review not found');
        try {
            await this.prisma.reviewVote.create({ data: { reviewId, customerId, helpful } });
        }
        catch (error) {
            if (isUniqueConstraintError(error)) {
                throw new ConflictException('Feedback has already been recorded for this review');
            }
            throw error;
        }
        return { recorded: true };
    }
    async updateStatus(id, status) {
        return this.prisma.review.update({
            where: { id },
            data: { status },
        });
    }
};
ReviewsService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService])
], ReviewsService);
export { ReviewsService };
function isUniqueConstraintError(error) {
    return (typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'P2002');
}
function isTransactionConflict(error) {
    return (error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2034');
}
//# sourceMappingURL=reviews.service.js.map