import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getAdminDashboardMetrics() {
    const [
      totalOrders,
      pendingOrders,
      cancelledOrders,
      deliveredOrders,
      totalProducts,
      totalCustomers,
      salesSum,
      salesOrderCount,
      lowStockCount,
      stockoutCount,
      recentOrders,
      lowStockItems,
      recentSales,
    ] = await Promise.all([
      this.prisma.order.count(),
      this.prisma.order.count({ where: { status: 'PENDING' } }),
      this.prisma.order.count({ where: { status: 'CANCELLED' } }),
      this.prisma.order.count({ where: { status: 'DELIVERED' } }),
      this.prisma.product.count({ where: { isActive: true } }),
      this.prisma.customer.count({ where: { isActive: true } }),
      this.prisma.order.aggregate({
        where: { status: { not: 'CANCELLED' } },
        _sum: { totalAmount: true },
      }),
      this.prisma.order.count({ where: { status: { not: 'CANCELLED' } } }),
      this.prisma.productVariant.count({
        where: { isActive: true, product: { isActive: true }, stock: { lte: 5 } },
      }),
      this.prisma.productVariant.count({
        where: { isActive: true, product: { isActive: true }, stock: 0 },
      }),
      this.prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          orderNumber: true,
          guestName: true,
          guestPhone: true,
          totalAmount: true,
          status: true,
          paymentMethod: true,
          createdAt: true,
          customer: { select: { firstName: true, phone: true } },
        },
      }),
      this.prisma.productVariant.findMany({
        where: { isActive: true, product: { isActive: true }, stock: { lte: 5 } },
        take: 4,
        orderBy: { stock: 'asc' },
        select: {
          id: true,
          sku: true,
          stock: true,
          product: { select: { name: true, images: { take: 1, orderBy: { sortOrder: 'asc' } } } },
        },
      }),
      this.prisma.order.findMany({
        where: {
          status: { not: 'CANCELLED' },
          createdAt: { gte: sevenDaysAgoStart() },
        },
        select: { createdAt: true, totalAmount: true, shippingAddress: true },
      }),
    ]);

    const totalSales = Number(salesSum._sum.totalAmount ?? 0);
    const chartData = makeSevenDayChart(recentSales);
    const peakDay = chartData.reduce(
      (peak, day) => (day.dhakaSales + day.nationalSales > peak.amount
        ? { day: day.day, amount: day.dhakaSales + day.nationalSales }
        : peak),
      { day: '', amount: 0 },
    );
    const nonCancelledOrders = Math.max(totalOrders - cancelledOrders, 0);

    return {
      metrics: {
        totalSales,
        salesGrowth: '—',
        totalOrders,
        pendingOrders,
        deliveryRate: nonCancelledOrders
          ? `${((deliveredOrders / nonCancelledOrders) * 100).toFixed(1)}%`
          : '0.0%',
        totalProducts,
        activeCatalog: totalProducts,
        totalCustomers,
        vipMembersCount: null,
        lowStockCount,
        stockoutCount,
      },
      salesOverview: {
        peakPoint: peakDay.amount
          ? {
              label: `Peak: BDT ${peakDay.amount.toLocaleString()} on ${peakDay.day}`,
              amount: peakDay.amount,
              day: peakDay.day,
            }
          : null,
        chartData,
        kpis: {
          averageOrderValue: salesOrderCount ? totalSales / salesOrderCount : 0,
          conversionRate: '—',
          conversionGrowth: '—',
          fulfillmentVelocity: '—',
        },
      },
      recentOrders: recentOrders.map((order) => ({
        id: order.orderNumber,
        customerName: order.customer?.firstName ?? order.guestName ?? 'Guest',
        phone: order.customer?.phone ?? order.guestPhone ?? '',
        amount: Number(order.totalAmount),
        status: order.status,
        paymentMethod: order.paymentMethod,
        createdAt: order.createdAt,
      })),
      lowStockProducts: lowStockItems.map((item) => ({
        variantId: item.id,
        name: item.product.name,
        sku: item.sku,
        stock: item.stock,
        status: item.stock === 0 ? 'Out of Stock' : 'Low Stock',
        image: item.product.images[0]?.url ?? '',
      })),
    };
  }
}

function sevenDaysAgoStart() {
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  start.setUTCDate(start.getUTCDate() - 6);
  return start;
}

function makeSevenDayChart(
  orders: Array<{ createdAt: Date; totalAmount: Prisma.Decimal; shippingAddress: Prisma.JsonValue }>,
) {
  const start = sevenDaysAgoStart();
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setUTCDate(start.getUTCDate() + index);
    return {
      key: date.toISOString().slice(0, 10),
      day: date.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' }),
      dhakaSales: 0,
      nationalSales: 0,
    };
  });
  const dayByKey = new Map(days.map((day) => [day.key, day]));

  for (const order of orders) {
    const day = dayByKey.get(order.createdAt.toISOString().slice(0, 10));
    if (!day) continue;
    const address = order.shippingAddress;
    const division =
      address && typeof address === 'object' && 'division' in address
        ? address.division
        : undefined;
    const amount = Number(order.totalAmount);
    if (typeof division === 'string' && division.toLowerCase().includes('dhaka')) {
      day.dhakaSales += amount;
    } else {
      day.nationalSales += amount;
    }
  }

  return days.map(({ key: _key, ...day }) => day);
}
