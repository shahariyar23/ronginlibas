import { PrismaService } from '../prisma/prisma.service.js';
import { AuditQueryDto } from './dto/audit-query.dto.js';
export interface AdminAuditActor {
    id: string;
    email: string;
    role: string;
    firstName?: string;
    lastName?: string;
}
export interface AdminAuditEntry {
    actor: AdminAuditActor;
    module: string;
    action: string;
    entityType: string;
    entityId?: string | null;
    entityLabel?: string | null;
    summary: string;
    before?: unknown;
    after?: unknown;
}
export declare class AuditService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    record(entry: AdminAuditEntry): Promise<any>;
    findAll(query: AuditQueryDto): Promise<{
        items: any;
        page: number;
        limit: number;
        total: any;
        totalPages: number;
    }>;
}
