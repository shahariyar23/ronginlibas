import { vi } from 'vitest';
import { PrismaService } from '../../prisma/prisma.service.js';
import { ProductsService } from './products.service.js';

describe('ProductsService storefront catalogue', () => {
  it('orders best sellers by order-item count and excludes inactive variants', async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    const count = vi.fn().mockResolvedValue(0);
    const prisma = { product: { findMany, count } } as unknown as PrismaService;
    const service = new ProductsService(prisma);

    await service.findAll({ page: 1, limit: 8, sort: 'best-selling' });

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { isActive: true },
        orderBy: [{ orderItems: { _count: 'desc' } }, { createdAt: 'desc' }],
        include: expect.objectContaining({
          variants: expect.objectContaining({ where: { isActive: true } }),
        }),
      }),
    );
  });

  it('does not return inactive products from public detail lookup', async () => {
    const findFirst = vi.fn().mockResolvedValue({ id: 'product-id' });
    const prisma = { product: { findFirst } } as unknown as PrismaService;
    const service = new ProductsService(prisma);

    await service.findBySlug('hidden-product');

    expect(findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { OR: [{ slug: 'hidden-product' }, { id: 'hidden-product' }], isActive: true },
      }),
    );
  });
});
