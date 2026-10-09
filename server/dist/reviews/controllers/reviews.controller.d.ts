import { ReviewVoteDto } from '../dto/review-vote.dto.js';
import { UpdateReviewDto } from '../dto/update-review.dto.js';
import { ReviewsService } from '../services/reviews.service.js';
import { CloudinaryService } from '../../products/services/cloudinary.service.js';
export declare class ReviewsController {
    private readonly reviewsService;
    private readonly cloudinary;
    constructor(reviewsService: ReviewsService, cloudinary: CloudinaryService);
    uploadPhoto(file: {
        buffer: Buffer;
        mimetype: string;
    } | undefined): Promise<{
        message: string;
        data: {
            url: string;
            publicId: string;
        };
    }>;
    findMine(customerId: string): Promise<{
        message: string;
        data: {
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
        }[];
    }>;
    findEligible(customerId: string): Promise<{
        message: string;
        data: {
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
        }[];
    }>;
    update(reviewId: string, customerId: string, dto: UpdateReviewDto): Promise<{
        message: string;
        data: {
            id: string;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.ReviewStatus;
            images: string[];
            productId: string;
            rating: number;
            comment: string;
        };
    }>;
    remove(reviewId: string, customerId: string): Promise<{
        message: string;
        data: {
            deleted: boolean;
        };
    }>;
    vote(reviewId: string, customerId: string, dto: ReviewVoteDto): Promise<{
        message: string;
        data: {
            id: string;
            createdAt: Date;
            customerId: string;
            reviewId: string;
            helpful: boolean;
        };
    }>;
}
