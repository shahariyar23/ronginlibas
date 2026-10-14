import { ReviewsService } from '../services/reviews.service.js';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
import { AdminReviewFeedbackDto } from '../dto/admin-review-feedback.dto.js';
import { AuditService, type AdminAuditActor } from '../../audit/audit.service.js';
export declare class AdminReviewsController {
    private readonly reviewsService;
    private readonly auditService;
    constructor(reviewsService: ReviewsService, auditService: AuditService);
    findAll(query: PaginationQueryDto, status?: string): Promise<{
        message: string;
        data: import("../../common/dto/pagination-query.dto.js").PaginatedResult<any> & {
            hasNext: boolean;
            hasPrevious: boolean;
        };
    }>;
    updateStatus(id: string, status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'HIDDEN', actor: AdminAuditActor): Promise<{
        message: string;
        data: {
            status: import("@prisma/client").$Enums.ReviewStatus;
            createdAt: Date;
            id: string;
            updatedAt: Date;
            customerId: string;
            images: string[];
            productId: string;
            rating: number;
            comment: string;
            adminFeedback: string | null;
            adminFeedbackAt: Date | null;
        };
    }>;
    updateFeedback(id: string, dto: AdminReviewFeedbackDto, actor: AdminAuditActor): Promise<{
        message: string;
        data: {
            id: string;
            adminFeedback: string | null;
            adminFeedbackAt: Date | null;
        };
    }>;
}
