import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateReviewDto } from '../dto/create-review.dto.js';
import { PaginationQueryDto, PaginatedResult } from '../../common/dto/pagination-query.dto.js';
import { UpdateReviewDto } from '../dto/update-review.dto.js';
export declare class ReviewsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(query: PaginationQueryDto, status?: string): Promise<PaginatedResult<any> & {
        hasNext: boolean;
        hasPrevious: boolean;
    }>;
    create(dto: CreateReviewDto, customerId: string): Promise<{
        id: string;
        createdAt: Date;
        status: import("@prisma/client").$Enums.ReviewStatus;
        productId: string;
        rating: number;
        comment: string;
    }>;
    findProductReviews(productId: string, query: PaginationQueryDto): Promise<{
        items: {
            id: string;
            rating: number;
            comment: string;
            createdAt: Date;
            customerName: string;
            verifiedPurchase: boolean;
            helpfulYes: number;
            helpfulNo: number;
        }[];
        averageRating: number;
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrevious: boolean;
    }>;
    createForProduct(productId: string, dto: Pick<CreateReviewDto, 'rating' | 'comment'>, customerId: string): Promise<{
        id: string;
        createdAt: Date;
        status: import("@prisma/client").$Enums.ReviewStatus;
        productId: string;
        rating: number;
        comment: string;
    }>;
    updateOwned(reviewId: string, customerId: string, dto: UpdateReviewDto): Promise<{
        id: string;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.ReviewStatus;
        productId: string;
        rating: number;
        comment: string;
    }>;
    deleteOwned(reviewId: string, customerId: string): Promise<{
        deleted: boolean;
    }>;
    vote(reviewId: string, customerId: string, helpful: boolean): Promise<{
        recorded: boolean;
    }>;
    updateStatus(id: string, status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'HIDDEN'): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        customerId: string;
        status: import("@prisma/client").$Enums.ReviewStatus;
        productId: string;
        rating: number;
        comment: string;
    }>;
}
