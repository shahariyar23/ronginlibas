import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';

export type DashboardPeriod = '7' | '30' | 'month';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getAdminDashboardMetrics(period: DashboardPeriod = '7', now = new Date()) {
    const range = getPeriodRange(period, now);
    const [
      periodOrders,
      dailyOrders,
      recentOrders,
      activeProducts,
      totalCustomers,
      pendingOrders,
      failedPayments,
      variants,
      pendingReviews,
      topSellingGroups,
      activeCartsCount,
    ] = await Promise.all([
      this.prisma.order.findMany({
        where: {
          status: { not: 'CANCELLED' },
          createdAt: { gte: range.start, lte: range.end },
        },
        select: {
          status: true,
          totalAmount: true,
          createdAt: true,
          shippingAddress: true,
          trackingEvents: {
            where: { status: 'DELIVERED' },
            orderBy: { createdAt: 'asc' },
            take: 1,
            select: { createdAt: true },
          },
        },
      }),
      this.prisma.order.findMany({
        where: {
          status: { not: 'CANCELLED' },
          createdAt: { gte: startOfDhakaDay(now, 6), lte: now },
        },
        select: {
          createdAt: true,
          totalAmount: true,
        },
      }),
      this.prisma.order.findMany({
        where: { createdAt: { gte: range.start, lte: range.end } },
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          orderNumber: true,
          guestName: true,
          totalAmount: true,
          status: true,
          paymentMethod: true,
          createdAt: true,
          shippingAddress: true,
          customer: { select: { firstName: true, lastName: true } },
        },
      }),
      this.prisma.product.count({ where: { isActive: true } }),
      this.prisma.customer.count(),
      this.prisma.order.count({ where: { status: 'PENDING' } }),
      this.prisma.order.count({ where: { paymentStatus: 'FAILED' } }),
      this.prisma.productVariant.findMany({
        where: { isActive: true, product: { isActive: true } },
        orderBy: { stock: 'asc' },
        select: {
          id: true,
          sku: true,
          stock: true,
          product: {
            select: {
              name: true,
              alertThreshold: true,
              images: { take: 1, orderBy: { sortOrder: 'asc' } },
            },
          },
        },
      }),
      this.prisma.review.count({ where: { status: 'PENDING' } }),
      this.prisma.orderItem.groupBy({
        by: ['productId'],
        where: {
          order: {
            status: { not: 'CANCELLED' },
            createdAt: { gte: range.start, lte: range.end },
          },
        },
        _sum: { quantity: true, subtotal: true, discountAmount: true },
      }),
      this.prisma.cart.count({
        where: {
          OR: [
            { createdAt: { gte: range.start, lte: range.end } },
            { updatedAt: { gte: range.start, lte: range.end } },
          ],
        },
      }),
    ]);

    const chartData = makePeriodChart(periodOrders, range, period);
    const dailySales = makeDailySales(dailyOrders, now);
    const peakDay = chartData.reduce(
      (peak, day) => {
        const amount = day.dhakaSales + day.nationalSales + day.unclassifiedSales;
        return amount > peak.amount ? { day: day.date, amount } : peak;
      },
      { day: '', amount: 0 },
    );
    const totalSales = roundCurrency(
      periodOrders.reduce((sum, order) => sum + Number(order.totalAmount), 0),
    );
    const deliveredOrders = periodOrders.filter((order) => order.status === 'DELIVERED');
    const fulfillmentDurations = deliveredOrders.flatMap((order) => {
      const deliveredAt = order.trackingEvents[0]?.createdAt;
      if (!deliveredAt) return [];
      const hours = (deliveredAt.getTime() - order.createdAt.getTime()) / (60 * 60 * 1000);
      return hours >= 0 ? [hours] : [];
    });
    const stockoutCount = variants.filter((variant) => variant.stock <= 0).length;
    const lowStockVariants = variants.filter(
      (variant) => variant.stock > 0 && variant.stock <= variant.product.alertThreshold,
    );
    const rankedSellingGroups = topSellingGroups
      .flatMap((group) =>
        group.productId
          ? [
              {
                productId: group.productId as string,
                unitsSold: group._sum.quantity ?? 0,
                revenue: roundCurrency(
                  Number(group._sum.subtotal ?? 0) - Number(group._sum.discountAmount ?? 0),
                ),
              },
            ]
          : [],
      )
      .sort((a, b) => b.unitsSold - a.unitsSold || b.revenue - a.revenue)
      .slice(0, 5);
    const rankedProducts = rankedSellingGroups.length
      ? await this.prisma.product.findMany({
          where: { id: { in: rankedSellingGroups.map((group) => group.productId) } },
          select: { id: true, name: true, sku: true },
        })
      : [];
    const productById = new Map(rankedProducts.map((product) => [product.id, product]));
    const topSellingProducts = rankedSellingGroups.flatMap((group) => {
      const product = productById.get(group.productId);
      return product ? [{ ...group, name: product.name, sku: product.sku }] : [];
    });

    return {
      period,
      metrics: {
        totalSales,
        totalOrders: periodOrders.length,
        activeProducts,
        totalCustomers,
      },
      salesOverview: {
        chartData,
        peakPoint: peakDay.amount
          ? {
              label: `Peak: BDT ${peakDay.amount.toLocaleString()} on ${peakDay.day}`,
              amount: peakDay.amount,
              day: peakDay.day,
            }
          : null,
        kpis: {
          averageOrderValue: periodOrders.length
            ? roundCurrency(totalSales / periodOrders.length)
            : null,
          deliveryRate: periodOrders.length
            ? Number(((deliveredOrders.length / periodOrders.length) * 100).toFixed(1))
            : null,
          conversionRate: (() => {
            const totalSessions = Math.max(activeCartsCount, periodOrders.length);
            return totalSessions > 0
              ? Number(((periodOrders.length / totalSessions) * 100).toFixed(1))
              : null;
          })(),
          fulfillmentVelocityHours: fulfillmentDurations.length
            ? Number(
                (
                  fulfillmentDurations.reduce((sum, hours) => sum + hours, 0) /
                  fulfillmentDurations.length
                ).toFixed(1),
              )
            : null,
        },
      },
      dailySales,
      needsAttention: {
        pendingOrders,
        lowStockVariants: lowStockVariants.length,
        outOfStockVariants: stockoutCount,
        pendingReviews,
        failedPayments,
      },
      recentOrders: recentOrders.map((order) => {
        const address = asAddress(order.shippingAddress);
        return {
          id: order.id,
          orderNumber: order.orderNumber,
          customerName:
            [order.customer?.firstName, order.customer?.lastName].filter(Boolean).join(' ') ||
            order.guestName ||
            'Guest',
          customerLocation: [address.city, address.division].filter(Boolean).join(', '),
          amount: Number(order.totalAmount),
          status: order.status,
          paymentMethod: order.paymentMethod,
          createdAt: order.createdAt,
        };
      }),
      topSellingProducts,
      lowStockProducts: lowStockVariants.slice(0, 4).map((variant) => ({
        id: variant.id,
        variantId: variant.id,
        name: variant.product.name,
        sku: variant.sku,
        stock: variant.stock,
        status: 'Low Stock',
        image: variant.product.images[0]?.url ?? '',
      })),
    };
  }
}

function getPeriodRange(period: DashboardPeriod, now: Date) {
  const end = new Date(now);
  const start = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()));

  if (period === 'month') {
    start.setUTCDate(1);
  } else {
    start.setUTCDate(start.getUTCDate() - (Number(period) - 1));
  }

  return { start, end };
}

function makePeriodChart(
  orders: Array<{
    createdAt: Date;
    totalAmount: Prisma.Decimal;
    shippingAddress: Prisma.JsonValue;
  }>,
  range: { start: Date; end: Date },
  period: DashboardPeriod,
) {
  const dayCount = Math.floor((range.end.getTime() - range.start.getTime()) / 86_400_000) + 1;
  const days = Array.from({ length: dayCount }, (_, index) => {
    const date = new Date(range.start);
    date.setUTCDate(date.getUTCDate() + index);
    const key = date.toISOString().slice(0, 10);
    return {
      date: key,
      day:
        period === '7'
          ? date.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' })
          : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }),
      dhakaSales: 0,
      nationalSales: 0,
      unclassifiedSales: 0,
    };
  });
  const dayByKey = new Map(days.map((day) => [day.date, day]));

  for (const order of orders) {
    const day = dayByKey.get(order.createdAt.toISOString().slice(0, 10));
    if (!day) continue;

    const division = asAddress(order.shippingAddress).division?.toLowerCase();
    const amount = Number(order.totalAmount);
    if (!division) {
      day.unclassifiedSales += amount;
    } else if (division.includes('dhaka')) {
      day.dhakaSales += amount;
    } else {
      day.nationalSales += amount;
    }
  }

  return days.map((day) => ({
    ...day,
    dhakaSales: roundCurrency(day.dhakaSales),
    nationalSales: roundCurrency(day.nationalSales),
    unclassifiedSales: roundCurrency(day.unclassifiedSales),
  }));
}

function asAddress(value: Prisma.JsonValue): { city?: string; division?: string } {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const address = value as Prisma.JsonObject;
  return {
    city: typeof address.city === 'string' ? address.city : undefined,
    division: typeof address.division === 'string' ? address.division : undefined,
  };
}

function roundCurrency(amount: number) {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

const DHAKA_OFFSET_HOURS = 6;

function startOfDhakaDay(date: Date, daysAgo = 0) {
  const dhakaDate = new Date(date.getTime() + DHAKA_OFFSET_HOURS * 60 * 60 * 1000);
  const midnightUtc = Date.UTC(
    dhakaDate.getUTCFullYear(),
    dhakaDate.getUTCMonth(),
    dhakaDate.getUTCDate() - daysAgo,
  );
  return new Date(midnightUtc - DHAKA_OFFSET_HOURS * 60 * 60 * 1000);
}

function makeDailySales(
  orders: Array<{ createdAt: Date; totalAmount: Prisma.Decimal }>,
  now: Date,
) {
  const todayStart = startOfDhakaDay(now);
  const days = Array.from({ length: 7 }, (_, index) => {
    const start = startOfDhakaDay(now, 6 - index);
    const dhakaDate = new Date(start.getTime() + DHAKA_OFFSET_HOURS * 60 * 60 * 1000);
    return {
      date: dhakaDate.toISOString().slice(0, 10),
      day: dhakaDate.toLocaleDateString('en-US', {
        weekday: 'short',
        timeZone: 'UTC',
      }),
      total: 0,
      orderCount: 0,
    };
  });
  const dayByKey = new Map(days.map((day) => [day.date, day]));

  for (const order of orders) {
    const dhakaDate = new Date(order.createdAt.getTime() + DHAKA_OFFSET_HOURS * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);
    const day = dayByKey.get(dhakaDate);
    if (!day) continue;
    day.total += Number(order.totalAmount);
    day.orderCount += 1;
  }

  const yesterdayDate = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000 + DHAKA_OFFSET_HOURS * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  const todayDate = new Date(todayStart.getTime() + DHAKA_OFFSET_HOURS * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  const today = dayByKey.get(todayDate)!;
  const yesterday = dayByKey.get(yesterdayDate)!;

  return {
    today: { date: today.date, total: roundCurrency(today.total), orderCount: today.orderCount },
    yesterday: {
      date: yesterday.date,
      total: roundCurrency(yesterday.total),
      orderCount: yesterday.orderCount,
    },
    lastSevenDays: days.map((day) => ({ ...day, total: roundCurrency(day.total) })),
  };
}
