import { AuditQueryDto } from '../dto/audit-query.dto.js';
import { AuditService } from '../audit.service.js';
export declare class AdminAuditController {
    private readonly auditService;
    constructor(auditService: AuditService);
    findAll(query: AuditQueryDto): Promise<{
        message: string;
        data: {
            items: {
                createdAt: Date;
                id: string;
                summary: string;
                module: string;
                action: string;
                actorId: string;
                actorName: string;
                actorEmail: string;
                actorRole: string;
                entityType: string;
                entityId: string | null;
                entityLabel: string | null;
                before: import("@prisma/client/runtime/library").JsonValue | null;
                after: import("@prisma/client/runtime/library").JsonValue | null;
            }[];
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
}
