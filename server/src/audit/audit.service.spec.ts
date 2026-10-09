import { Prisma } from '@prisma/client';
import { vi } from 'vitest';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuditQueryDto } from './dto/audit-query.dto.js';
import { AuditService } from './audit.service.js';

describe('AuditService', () => {
  it('stores an actor and redacts credential-like values from snapshots', async () => {
    const create = vi.fn().mockResolvedValue({ id: 'audit-id' });
    const prisma = { adminAuditLog: { create } } as unknown as PrismaService;
    const service = new AuditService(prisma);

    await service.record({
      actor: {
        id: 'staff-id',
        email: 'admin@example.com',
        role: 'ADMIN',
        firstName: 'Ari',
        lastName: 'Admin',
      },
      module: 'staff',
      action: 'STAFF_UPDATED',
      entityType: 'staff',
      entityId: 'target-id',
      summary: 'Updated account permissions',
      before: { role: 'MANAGER', passwordHash: 'not-stored' },
      after: {
        role: 'ADMIN',
        permissions: ['orders'],
        nested: {
          refreshTokenHash: 'not-stored',
          merchantKey: 'not-stored',
          privateKey: 'not-stored',
          name: 'Rin',
        },
        price: new Prisma.Decimal('10.25'),
      },
    });

    const data = create.mock.calls[0][0].data;
    expect(data).toMatchObject({
      actorId: 'staff-id',
      actorName: 'Ari Admin',
      actorEmail: 'admin@example.com',
      actorRole: 'ADMIN',
      before: { role: 'MANAGER' },
      after: {
        role: 'ADMIN',
        permissions: ['orders'],
        nested: { name: 'Rin' },
        price: '10.25',
      },
    });
    expect(JSON.stringify(data)).not.toContain('not-stored');
  });

  it('combines actor, record, module, and date filters without overwriting search groups', async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    const count = vi.fn().mockResolvedValue(0);
    const prisma = { adminAuditLog: { findMany, count } } as unknown as PrismaService;
    const service = new AuditService(prisma);
    const query: AuditQueryDto = {
      page: 2,
      limit: 10,
      module: 'orders',
      actor: 'admin',
      search: '#RL1001',
      from: '2026-10-01',
      to: '2026-10-10',
    };

    await service.findAll(query);

    const args = findMany.mock.calls[0][0];
    expect(args).toMatchObject({
      skip: 10,
      take: 10,
      where: {
        module: 'orders',
        createdAt: {
          gte: new Date('2026-10-01'),
          lte: new Date('2026-10-10T23:59:59.999Z'),
        },
      },
    });
    expect(args.where.AND).toHaveLength(2);
  });
});
