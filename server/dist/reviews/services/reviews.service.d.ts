import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateReviewDto } from '../dto/create-review.dto.js';
import { PaginationQueryDto, PaginatedResult } from '../../common/dto/pagination-query.dto.js';
export declare class ReviewsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(query: PaginationQueryDto, status?: string): Promise<PaginatedResult<any>>;
    create(dto: CreateReviewDto, customerId: string): Promise<{
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
    } | {
        id: string;
        status: "PENDING" | "APPROVED" | "REJECTED" | "HIDDEN";
        updatedAt: Date;
    }>;
}
