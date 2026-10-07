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
        };
    }>;
    create(productId: string, customerId: string, dto: CreateProductReviewDto): Promise<{
        message: string;
        data: {
            id: string;
            createdAt: Date;
            status: import("@prisma/client").$Enums.ReviewStatus;
            productId: string;
            rating: number;
            comment: string;
        };
    }>;
}
