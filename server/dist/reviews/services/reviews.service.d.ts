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
        status: import("@prisma/client").$Enums.ReviewStatus;
        id: string;
        createdAt: Date;
        images: string[];
        productId: string;
        rating: number;
        comment: string;
    }>;
    findProductReviews(productId: string, query: PaginationQueryDto): Promise<{
        items: {
            id: string;
            rating: number;
            comment: string;
            images: string[];
            adminFeedback: string | null;
            adminFeedbackAt: Date | null;
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
            status: import("@prisma/client").$Enums.ReviewStatus;
            id: string;
            createdAt: Date;
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
        images: string[];
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
    createForProduct(productId: string, dto: Pick<CreateReviewDto, 'rating' | 'comment' | 'images'>, customerId: string): Promise<{
        status: import("@prisma/client").$Enums.ReviewStatus;
        id: string;
        createdAt: Date;
        images: string[];
        productId: string;
        rating: number;
        comment: string;
    }>;
    updateOwned(reviewId: string, customerId: string, dto: UpdateReviewDto): Promise<{
        status: import("@prisma/client").$Enums.ReviewStatus;
        id: string;
        updatedAt: Date;
        images: string[];
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
        status: import("@prisma/client").$Enums.ReviewStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        customerId: string;
        images: string[];
        productId: string;
        rating: number;
        comment: string;
        adminFeedback: string | null;
        adminFeedbackAt: Date | null;
    }>;
    getAdminAuditState(id: string): Promise<{
        status: import("@prisma/client").$Enums.ReviewStatus;
        id: string;
        adminFeedback: string | null;
    }>;
    updateAdminFeedback(id: string, feedback: string): Promise<{
        id: string;
        adminFeedback: string | null;
        adminFeedbackAt: Date | null;
    }>;
}
