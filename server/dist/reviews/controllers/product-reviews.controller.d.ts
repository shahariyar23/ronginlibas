import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
import { CreateProductReviewDto } from '../dto/create-product-review.dto.js';
import { ReviewsService } from '../services/reviews.service.js';
export declare class ProductReviewsController {
    private readonly reviewsService;
    constructor(reviewsService: ReviewsService);
    findForProduct(productId: string, query: PaginationQueryDto): Promise<{
        message: string;
        data: {
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
        };
    }>;
    checkEligibility(productId: string, customerId: string): Promise<{
        message: string;
        data: {
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
        };
    }>;
    create(productId: string, customerId: string, dto: CreateProductReviewDto): Promise<{
        message: string;
        data: {
            status: import("@prisma/client").$Enums.ReviewStatus;
            id: string;
            createdAt: Date;
            images: string[];
            productId: string;
            rating: number;
            comment: string;
        };
    }>;
}
