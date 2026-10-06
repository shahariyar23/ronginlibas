import { ReviewsService } from '../services/reviews.service.js';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
export declare class AdminReviewsController {
    private readonly reviewsService;
    constructor(reviewsService: ReviewsService);
    findAll(query: PaginationQueryDto, status?: string): Promise<{
        message: string;
        data: import("../../common/dto/pagination-query.dto.js").PaginatedResult<any>;
    }>;
    updateStatus(id: string, status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'HIDDEN'): Promise<{
        message: string;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            customerId: string;
            status: import("@prisma/client").$Enums.ReviewStatus;
            productId: string;
            rating: number;
            comment: string;
        } | {
            id: string;
            status: "PENDING" | "APPROVED" | "REJECTED" | "HIDDEN";
            updatedAt: Date;
        };
    }>;
}
