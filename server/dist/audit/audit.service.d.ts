import { Prisma } from '@prisma/client';
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
    record(entry: AdminAuditEntry): Promise<{
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
        before: Prisma.JsonValue | null;
        after: Prisma.JsonValue | null;
    }>;
    findAll(query: AuditQueryDto): Promise<{
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
            before: Prisma.JsonValue | null;
            after: Prisma.JsonValue | null;
        }[];
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    }>;
}
