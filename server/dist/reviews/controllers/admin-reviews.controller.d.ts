import { ReviewsService } from '../services/reviews.service.js';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
import { AdminReviewFeedbackDto } from '../dto/admin-review-feedback.dto.js';
export declare class AdminReviewsController {
    private readonly reviewsService;
    constructor(reviewsService: ReviewsService);
    findAll(query: PaginationQueryDto, status?: string): Promise<{
        message: string;
        data: import("../../common/dto/pagination-query.dto.js").PaginatedResult<any> & {
            hasNext: boolean;
            hasPrevious: boolean;
        };
    }>;
    updateStatus(id: string, status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'HIDDEN'): Promise<{
        message: string;
        data: {
            rating: number;
            comment: string;
            id: string;
            customerId: string;
            productId: string;
            status: import("@prisma/client").$Enums.ReviewStatus;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    updateFeedback(id: string, dto: AdminReviewFeedbackDto): Promise<{
        message: string;
        data: {
            rating: number;
            comment: string;
            id: string;
            customerId: string;
            productId: string;
            status: import("@prisma/client").$Enums.ReviewStatus;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
}
