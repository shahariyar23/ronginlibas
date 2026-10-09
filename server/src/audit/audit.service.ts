import { Injectable } from '@nestjs/common';
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

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async record(entry: AdminAuditEntry) {
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

  async findAll(query: AuditQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.AdminAuditLogWhereInput = {};

    if (query.module) where.module = query.module;
    if (query.action) where.action = query.action;
    if (query.actorId) where.actorId = query.actorId;
    if (query.actor) {
      where.OR = [
        { actorName: { contains: query.actor, mode: 'insensitive' } },
        { actorEmail: { contains: query.actor, mode: 'insensitive' } },
      ];
    }
    if (query.from || query.to) {
      const toDate = query.to ? new Date(query.to) : undefined;
      if (toDate && /^\d{4}-\d{2}-\d{2}$/.test(query.to!)) {
        toDate.setUTCHours(23, 59, 59, 999);
      }
      where.createdAt = {
        ...(query.from ? { gte: new Date(query.from) } : {}),
        ...(toDate ? { lte: toDate } : {}),
      };
    }
    if (query.search) {
      where.OR = [
        { actorName: { contains: query.search, mode: 'insensitive' } },
        { actorEmail: { contains: query.search, mode: 'insensitive' } },
        { entityType: { contains: query.search, mode: 'insensitive' } },
        { entityId: { contains: query.search, mode: 'insensitive' } },
        { entityLabel: { contains: query.search, mode: 'insensitive' } },
        { summary: { contains: query.search, mode: 'insensitive' } },
      ];
    }

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
}

const sensitiveKey = /password|token|secret|authorization|credential|api.?key/i;

function toAuditJson(value: unknown): Prisma.InputJsonValue | typeof Prisma.JsonNull | undefined {
  if (value === undefined) return undefined;
  if (value === null) return Prisma.JsonNull;
  return sanitizeAuditValue(value, 0) as Prisma.InputJsonValue;
}

function sanitizeAuditValue(value: unknown, depth: number): unknown {
  if (depth >= 6) return '[truncated]';
  if (value === null || typeof value === 'boolean' || typeof value === 'number') return value;
  if (typeof value === 'string') return value.slice(0, 2000);
  if (typeof value === 'bigint') return value.toString();
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) {
    return value.slice(0, 100).map((item) => sanitizeAuditValue(item, depth + 1));
  }
  if (typeof value === 'object') {
    const object = value as Record<string, unknown>;
    const result: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(object).slice(0, 100)) {
      if (sensitiveKey.test(key) || item === undefined) continue;
      result[key] = sanitizeAuditValue(item, depth + 1);
    }
    return result;
  }
  return String(value).slice(0, 2000);
}
