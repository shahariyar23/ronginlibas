import { AuditQueryDto } from '../dto/audit-query.dto.js';
import { AuditService } from '../audit.service.js';
export declare class AdminAuditController {
    private readonly auditService;
    constructor(auditService: AuditService);
    findAll(query: AuditQueryDto): Promise<{
        message: string;
        data: {
            items: any;
            page: number;
            limit: number;
            total: any;
            totalPages: number;
        };
    }>;
}
