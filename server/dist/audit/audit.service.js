var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
let AuditService = class AuditService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async record(entry) {
        const actorName = [entry.actor.firstName, entry.actor.lastName]
            .filter(Boolean)
            .join(' ')
            .trim();
        return this.prisma.adminAuditLog.create({
            data: {
                actorId: entry.actor.id,
                actorName: actorName || entry.actor.email,
                actorEmail: entry.actor.email,
                actorRole: entry.actor.role,
                module: entry.module,
                action: entry.action,
                entityType: entry.entityType,
                entityId: entry.entityId ?? null,
                entityLabel: entry.entityLabel?.slice(0, 300) ?? null,
                summary: entry.summary.slice(0, 1000),
                before: toAuditJson(entry.before),
                after: toAuditJson(entry.after),
            },
        });
    }
    async findAll(query) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        const where = {};
        const andFilters = [];
        if (query.module)
            where.module = query.module;
        if (query.action)
            where.action = query.action;
        if (query.actorId)
            where.actorId = query.actorId;
        if (query.actor) {
            andFilters.push({
                OR: [
                    { actorName: { contains: query.actor, mode: 'insensitive' } },
                    { actorEmail: { contains: query.actor, mode: 'insensitive' } },
                ],
            });
        }
        if (query.from || query.to) {
            const toDate = query.to ? new Date(query.to) : undefined;
            if (toDate && query.to && /^\d{4}-\d{2}-\d{2}$/.test(query.to)) {
                toDate.setUTCHours(23, 59, 59, 999);
            }
            where.createdAt = {
                ...(query.from ? { gte: new Date(query.from) } : {}),
                ...(toDate ? { lte: toDate } : {}),
            };
        }
        if (query.search) {
            andFilters.push({
                OR: [
                    { entityType: { contains: query.search, mode: 'insensitive' } },
                    { entityId: { contains: query.search, mode: 'insensitive' } },
                    { entityLabel: { contains: query.search, mode: 'insensitive' } },
                    { summary: { contains: query.search, mode: 'insensitive' } },
                ],
            });
        }
        if (andFilters.length)
            where.AND = andFilters;
        const [items, total] = await Promise.all([
            this.prisma.adminAuditLog.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.adminAuditLog.count({ where }),
        ]);
        return { items, page, limit, total, totalPages: Math.ceil(total / limit) || 1 };
    }
};
AuditService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService])
], AuditService);
export { AuditService };
const sensitiveKey = /password|token|secret|authorization|credential|api.?key|private.?key|merchant.?key|app.?key|client.?id|signature|salt/i;
function toAuditJson(value) {
    if (value === undefined)
        return undefined;
    if (value === null)
        return Prisma.JsonNull;
    return sanitizeAuditValue(value, 0);
}
function sanitizeAuditValue(value, depth) {
    if (depth >= 6)
        return '[truncated]';
    if (value === null || typeof value === 'boolean' || typeof value === 'number')
        return value;
    if (typeof value === 'string')
        return value.slice(0, 2000);
    if (typeof value === 'bigint')
        return value.toString();
    if (value instanceof Date)
        return value.toISOString();
    if (Array.isArray(value)) {
        return value.slice(0, 100).map((item) => sanitizeAuditValue(item, depth + 1));
    }
    if (typeof value === 'object') {
        const toJSON = value.toJSON;
        if (typeof toJSON === 'function') {
            return sanitizeAuditValue(toJSON.call(value), depth + 1);
        }
        const object = value;
        const result = {};
        for (const [key, item] of Object.entries(object).slice(0, 100)) {
            if (sensitiveKey.test(key) || item === undefined)
                continue;
            result[key] = sanitizeAuditValue(item, depth + 1);
        }
        return result;
    }
    if (typeof value === 'symbol')
        return value.description ?? '[symbol]';
    return '[unsupported value]';
}
//# sourceMappingURL=audit.service.js.map