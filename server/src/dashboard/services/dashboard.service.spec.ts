import { PrismaService } from '../../prisma/prisma.service.js';
import { DashboardService } from './dashboard.service.js';
import { vi } from 'vitest';

describe('DashboardService', () => {
  const now = new Date('2026-05-20T12:00:00.000Z');

  function makeService({
    periodOrders = [],
    dailyOrders = [],
    recentOrders = [],
    variants = [],
    topSellingGroups = [],
  }: {
    periodOrders?: unknown[];
    dailyOrders?: unknown[];
    recentOrders?: unknown[];
    variants?: unknown[];
    topSellingGroups?: unknown[];
  } = {}) {
    const findMany = vi
      .fn()
      .mockResolvedValueOnce(periodOrders)
      .mockResolvedValueOnce(dailyOrders)
      .mockResolvedValueOnce(recentOrders);
    const productVariantFindMany = vi.fn().mockResolvedValue(variants);
    const groupBy = vi.fn().mockResolvedValue(topSellingGroups);
    const prisma = {
      order: {
        findMany,
        count: vi.fn(({ where }: { where: { status?: string; paymentStatus?: string } }) =>
          Promise.resolve(where.status === 'PENDING' ? 3 : 2),
        ),
      },
      product: {
        count: vi.fn().mockResolvedValue(8),
        findMany: vi
          .fn()
          .mockResolvedValue([{ id: 'product-id', name: 'Panjabi', sku: 'RL-PRODUCT-001' }]),
      },
      customer: { count: vi.fn().mockResolvedValue(12) },
      productVariant: { findMany: productVariantFindMany },
      review: { count: vi.fn().mockResolvedValue(4) },
      orderItem: { groupBy },
    } as unknown as PrismaService;
    return {
      service: new DashboardService(prisma),
      findMany,
      groupBy,
    };
  }

  it('calculates period metrics, daily revenue, delivery and fulfillment from persisted records', async () => {
    const createdAt = new Date('2026-05-20T07:00:00.000Z');
    const deliveredAt = new Date('2026-05-20T12:00:00.000Z');
    const { service, findMany, groupBy } = makeService({
      periodOrders: [
        {
          status: 'DELIVERED',
          totalAmount: 200,
          createdAt,
          shippingAddress: { division: 'Dhaka', city: 'Dhaka' },
          trackingEvents: [{ createdAt: deliveredAt }],
        },
        {
          status: 'PENDING',
          totalAmount: 400,
          createdAt,
          shippingAddress: {},
          trackingEvents: [],
        },
      ],
      recentOrders: [
        {
          id: 'order-id',
          orderNumber: '#RL0001',
          guestName: null,
          totalAmount: 200,
          status: 'DELIVERED',
          paymentMethod: 'COD',
          createdAt,
          shippingAddress: { division: 'Dhaka' },
          customer: { firstName: 'Rongin', lastName: 'Customer' },
        },
      ],
      variants: [
        {
          id: 'low-variant',
          sku: 'LOW-1',
          stock: 2,
          product: { name: 'Low stock item', alertThreshold: 3, images: [] },
        },
        {
          id: 'empty-variant',
          sku: 'EMPTY-1',
          stock: 0,
          product: { name: 'Out of stock item', alertThreshold: 3, images: [] },
        },
      ],
      topSellingGroups: [
        {
          productId: 'product-id',
          _sum: { quantity: 2, subtotal: 500, discountAmount: 50 },
        },
      ],
    });

    const result = await service.getAdminDashboardMetrics('7', now);

    expect(result.metrics).toEqual({
      totalSales: 600,
      totalOrders: 2,
      activeProducts: 8,
      totalCustomers: 12,
    });
    expect(result.salesOverview.kpis).toEqual({
      averageOrderValue: 300,
      deliveryRate: 50,
      conversionRate: null,
      fulfillmentVelocityHours: 5,
    });
    expect(result.salesOverview.chartData).toHaveLength(7);
    expect(result.salesOverview.chartData.at(-1)).toMatchObject({
      date: '2026-05-20',
      dhakaSales: 200,
      nationalSales: 0,
      unclassifiedSales: 400,
    });
    expect(result.needsAttention).toEqual({
      pendingOrders: 3,
      lowStockVariants: 1,
      outOfStockVariants: 1,
      pendingReviews: 4,
      failedPayments: 2,
    });
    expect(result.recentOrders[0]).toMatchObject({
      id: 'order-id',
      orderNumber: '#RL0001',
      customerName: 'Rongin Customer',
    });
    expect(result.topSellingProducts[0]).toMatchObject({
      productId: 'product-id',
      name: 'Panjabi',
      sku: 'RL-PRODUCT-001',
      unitsSold: 2,
      revenue: 450,
    });
    expect(findMany.mock.calls[0][0].where).toMatchObject({
      status: { not: 'CANCELLED' },
      createdAt: {
        gte: new Date('2026-05-14T00:00:00.000Z'),
        lte: now,
      },
    });
    expect(groupBy.mock.calls[0][0].where.order.status).toEqual({ not: 'CANCELLED' });
  });

  it('uses the current month window and represents missing metrics as unavailable', async () => {
    const { service, findMany } = makeService();

    const result = await service.getAdminDashboardMetrics('month', now);

    expect(findMany.mock.calls[0][0].where.createdAt).toEqual({
      gte: new Date('2026-05-01T00:00:00.000Z'),
      lte: now,
    });
    expect(result.salesOverview.chartData).toHaveLength(20);
    expect(result.metrics.totalSales).toBe(0);
    expect(result.salesOverview.kpis.averageOrderValue).toBeNull();
    expect(result.salesOverview.kpis.deliveryRate).toBeNull();
    expect(result.salesOverview.kpis.fulfillmentVelocityHours).toBeNull();
    expect(result.salesOverview.kpis.conversionRate).toBeNull();
    expect(result.salesOverview.peakPoint).toBeNull();
    expect(result.dailySales.today.total).toBe(0);
    expect(result.dailySales.yesterday.total).toBe(0);
    expect(result.dailySales.lastSevenDays).toHaveLength(7);
    expect(result.dailySales.lastSevenDays.every((day) => day.total === 0)).toBe(true);
    expect(result.recentOrders).toEqual([]);
    expect(result.topSellingProducts).toEqual([]);
  });

  it('uses a rolling 30-day window for the 30-day selection', async () => {
    const { service, findMany } = makeService();

    const result = await service.getAdminDashboardMetrics('30', now);

    expect(findMany.mock.calls[0][0].where.createdAt).toEqual({
      gte: new Date('2026-04-21T00:00:00.000Z'),
      lte: now,
    });
    expect(result.salesOverview.chartData).toHaveLength(30);
  });

  it('reports today, yesterday, and seven daily totals in Dhaka business time', async () => {
    const { service, findMany } = makeService({
      dailyOrders: [
        { createdAt: new Date('2026-05-19T17:30:00.000Z'), totalAmount: 1250 },
        { createdAt: new Date('2026-05-20T00:15:00.000Z'), totalAmount: 2500 },
        { createdAt: new Date('2026-05-20T00:15:00.000Z'), totalAmount: 500 },
      ],
    });

    const result = await service.getAdminDashboardMetrics('7', now);

    expect(findMany.mock.calls[1][0].where.createdAt.gte).toEqual(
      new Date('2026-05-13T18:00:00.000Z'),
    );
    expect(result.dailySales).toEqual({
      today: { date: '2026-05-20', total: 3000, orderCount: 2 },
      yesterday: { date: '2026-05-19', total: 1250, orderCount: 1 },
      lastSevenDays: expect.arrayContaining([
        { date: '2026-05-19', day: 'Tue', total: 1250, orderCount: 1 },
        { date: '2026-05-20', day: 'Wed', total: 3000, orderCount: 2 },
      ]),
    });
    expect(result.dailySales.lastSevenDays).toHaveLength(7);
  });
});
