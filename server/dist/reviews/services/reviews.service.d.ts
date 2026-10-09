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
        ratingDistribution: {
            5: number;
            4: number;
            3: number;
            2: number;
            1: number;
        };
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrevious: boolean;
    }>;
    checkEligibility(productId: string, customerId: string): Promise<{
        canReview: boolean;
        reason: string;
        existingReview: {
            id: string;
            createdAt: Date;
            status: import("@prisma/client").$Enums.ReviewStatus;
            rating: number;
        };
        orderNumber?: undefined;
    } | {
        canReview: boolean;
        reason: string;
        existingReview?: undefined;
        orderNumber?: undefined;
    } | {
        canReview: boolean;
        reason: string;
        orderNumber: string;
        existingReview?: undefined;
    }>;
    findCustomerReviews(customerId: string): Promise<{
        id: string;
        productId: string;
        productName: string;
        productSlug: string;
        productImage: string;
        rating: number;
        comment: string;
        status: import("@prisma/client").$Enums.ReviewStatus;
        adminFeedback: string | null;
        adminFeedbackAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findEligibleProducts(customerId: string): Promise<{
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
    }[]>;
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
        id: string;
        createdAt: Date;
        customerId: string;
        reviewId: string;
        helpful: boolean;
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
        adminFeedback: string | null;
        adminFeedbackAt: Date | null;
    }>;
    getAdminAuditState(id: string): Promise<{
        id: string;
        status: import("@prisma/client").$Enums.ReviewStatus;
        adminFeedback: string | null;
    }>;
    updateAdminFeedback(id: string, feedback: string): Promise<{
        id: string;
        adminFeedback: string | null;
        adminFeedbackAt: Date | null;
    }>;
}
