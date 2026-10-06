import { ReviewsService } from '../services/reviews.service.js';
import { CreateReviewDto } from '../dto/create-review.dto.js';
export declare class ReviewsController {
    private readonly reviewsService;
    constructor(reviewsService: ReviewsService);
    create(dto: CreateReviewDto, customerId: string): Promise<{
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
            customerId: string;
            status: string;
            id: string;
        };
    }>;
}
