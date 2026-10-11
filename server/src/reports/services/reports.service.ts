import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import { ReportsPeriod } from '../dto/reports-query.dto.js';

function roundCurrency(val: number): number {
  return Math.round((val + Number.EPSILON) * 100) / 100;
}

const DHAKA_OFFSET_MS = 6 * 60 * 60 * 1000;

function getStartDateForPeriod(period: ReportsPeriod, now = new Date()): Date {
  const t = new Date(now.getTime());
  switch (period) {
    case ReportsPeriod.SEVEN_DAYS:
      t.setDate(t.getDate() - 7);
      return t;
    case ReportsPeriod.THIRTY_DAYS:
      t.setDate(t.getDate() - 30);
      return t;
    case ReportsPeriod.NINETY_DAYS:
      t.setDate(t.getDate() - 90);
      return t;
    case ReportsPeriod.ONE_YEAR:
      t.setFullYear(t.getFullYear() - 1);
      return t;
    case ReportsPeriod.ALL:
      return new Date(0);
    default:
      t.setDate(t.getDate() - 30);
      return t;
  }
}

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async generateReport(period: ReportsPeriod = ReportsPeriod.THIRTY_DAYS) {
    const now = new Date();
    const startDate = getStartDateForPeriod(period, now);

    const [
      ordersInPeriod,
      orderItemsInPeriod,
      totalCustomersCount,
      newCustomersInPeriod,
      activeVariants,
      activeCoupons,
      offers,
    ] = await Promise.all([
      // 1. All Orders in period
      this.prisma.order.findMany({
        where: {
          createdAt: { gte: startDate, lte: now },
        },
        select: {
          id: true,
          orderNumber: true,
          status: true,
          paymentStatus: true,
          paymentMethod: true,
          subtotal: true,
          discountAmount: true,
          deliveryCharge: true,
          totalAmount: true,
          createdAt: true,
          customerId: true,
        },
      }),

      // 2. Order Items in period for products/sizes/colors aggregation
      this.prisma.orderItem.findMany({
        where: {
          order: {
            createdAt: { gte: startDate, lte: now },
            status: { not: 'CANCELLED' },
          },
        },
        select: {
          quantity: true,
          unitPrice: true,
          subtotal: true,
          discountAmount: true,
          productId: true,
          variantId: true,
          productName: true,
          sku: true,
          size: true,
          color: true,
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
              categoryId: true,
              category: { select: { name: true } },
            },
          },
        },
      }),

      // 3. Customer metrics
      this.prisma.customer.count(),
      this.prisma.customer.count({
        where: { createdAt: { gte: startDate, lte: now } },
      }),

      // 4. Product Variant stock overview
      this.prisma.productVariant.findMany({
        where: { isActive: true, product: { isActive: true, deletedAt: null } },
        select: {
          id: true,
          stock: true,
          sku: true,
          size: true,
          color: true,
          productId: true,
        },
      }),

      // 5. Coupons
      this.prisma.coupon.findMany({
        select: {
          id: true,
          code: true,
          type: true,
          value: true,
          usageCount: true,
          usageLimit: true,
          isActive: true,
        },
      }),

      // 6. Offers
      this.prisma.offer.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
          offerType: true,
          discountType: true,
          discountValue: true,
          startDate: true,
          expiryDate: true,
          isActive: true,
          badgeText: true,
          _count: {
            select: { products: true, categories: true, collections: true },
          },
        },
      }),
    ]);

    // -------------------------------------------------------------
    // SECTION 1: SALES METRICS
    // -------------------------------------------------------------
    const nonCancelledOrders = ordersInPeriod.filter((o) => o.status !== 'CANCELLED');
    const completedOrders = ordersInPeriod.filter(
      (o) => o.status === 'DELIVERED' || o.paymentStatus === 'PAID',
    );
    const cancelledOrders = ordersInPeriod.filter((o) => o.status === 'CANCELLED');
    const refundedOrders = ordersInPeriod.filter(
      (o) => o.status === 'REFUNDED' || o.paymentStatus === 'REFUNDED',
    );

    const totalGrossSales = roundCurrency(
      nonCancelledOrders.reduce((sum, o) => sum + Number(o.subtotal), 0),
    );
    const totalNetSales = roundCurrency(
      nonCancelledOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0),
    );
    const totalDiscounts = roundCurrency(
      nonCancelledOrders.reduce((sum, o) => sum + Number(o.discountAmount), 0),
    );
    const totalShipping = roundCurrency(
      nonCancelledOrders.reduce((sum, o) => sum + Number(o.deliveryCharge), 0),
    );
    const averageOrderValue =
      nonCancelledOrders.length > 0
        ? roundCurrency(totalNetSales / nonCancelledOrders.length)
        : 0;

    // Daily revenue ledger
    const revenueByDateMap = new Map<
      string,
      { date: string; revenue: number; orderCount: number; gross: number }
    >();

    for (const order of nonCancelledOrders) {
      const dhakaDate = new Date(order.createdAt.getTime() + DHAKA_OFFSET_MS)
        .toISOString()
        .slice(0, 10);
      const curr = revenueByDateMap.get(dhakaDate) || {
        date: dhakaDate,
        revenue: 0,
        orderCount: 0,
        gross: 0,
      };
      curr.revenue = roundCurrency(curr.revenue + Number(order.totalAmount));
      curr.gross = roundCurrency(curr.gross + Number(order.subtotal));
      curr.orderCount += 1;
      revenueByDateMap.set(dhakaDate, curr);
    }

    const revenueByDate = Array.from(revenueByDateMap.values()).sort((a, b) =>
      a.date.localeCompare(b.date),
    );

    const salesSummary = {
      totalGrossSales,
      totalNetSales,
      totalDiscounts,
      totalShipping,
      averageOrderValue,
      completedOrdersTotal: roundCurrency(
        completedOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0),
      ),
      completedOrdersCount: completedOrders.length,
      cancelledOrdersTotal: roundCurrency(
        cancelledOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0),
      ),
      cancelledOrdersCount: cancelledOrders.length,
      refundedOrdersTotal: roundCurrency(
        refundedOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0),
      ),
      refundedOrdersCount: refundedOrders.length,
      revenueByDate,
    };

    // -------------------------------------------------------------
    // SECTION 2: ORDERS METRICS
    // -------------------------------------------------------------
    const ordersByStatus: Record<string, number> = {
      PENDING: 0,
      PROCESSING: 0,
      CONFIRMED: 0,
      PACKED: 0,
      SHIPPED: 0,
      OUT_FOR_DELIVERY: 0,
      DELIVERED: 0,
      CANCELLED: 0,
      RETURN_REQUESTED: 0,
      RETURNED: 0,
      REFUNDED: 0,
    };

    const ordersByPaymentStatus: Record<string, number> = {
      PENDING: 0,
      PAID: 0,
      FAILED: 0,
      REFUNDED: 0,
    };

    const ordersByPaymentMethod: Record<string, number> = {
      COD: 0,
      BKASH: 0,
      NAGAD: 0,
      CARD: 0,
    };

    for (const ord of ordersInPeriod) {
      if (ordersByStatus[ord.status] !== undefined) {
        ordersByStatus[ord.status] += 1;
      }
      if (ordersByPaymentStatus[ord.paymentStatus] !== undefined) {
        ordersByPaymentStatus[ord.paymentStatus] += 1;
      }
      if (ordersByPaymentMethod[ord.paymentMethod] !== undefined) {
        ordersByPaymentMethod[ord.paymentMethod] += 1;
      }
    }

    const ordersSummary = {
      totalOrders: ordersInPeriod.length,
      statusBreakdown: ordersByStatus,
      paymentStatusBreakdown: ordersByPaymentStatus,
      paymentMethodBreakdown: ordersByPaymentMethod,
    };

    // -------------------------------------------------------------
    // SECTION 3: PRODUCTS & INVENTORY PERFORMANCE
    // -------------------------------------------------------------
    const productAggMap = new Map<
      string,
      {
        id: string;
        name: string;
        sku: string;
        categoryName: string;
        unitsSold: number;
        revenue: number;
      }
    >();

    const categoryRevenueMap = new Map<
      string,
      { categoryName: string; unitsSold: number; revenue: number }
    >();

    const sizeMap = new Map<string, number>();
    const colorMap = new Map<string, number>();

    for (const item of orderItemsInPeriod) {
      const pId = item.productId || item.sku || 'general-item';
      const pName = item.product?.name || item.productName || 'Garment Item';
      const pSku = item.product?.sku || item.sku || 'N/A';
      const catName = item.product?.category?.name || 'Uncategorized';

      const pEntry = productAggMap.get(pId) || {
        id: pId,
        name: pName,
        sku: pSku,
        categoryName: catName,
        unitsSold: 0,
        revenue: 0,
      };
      pEntry.unitsSold += item.quantity;
      pEntry.revenue = roundCurrency(pEntry.revenue + Number(item.subtotal));
      productAggMap.set(pId, pEntry);

      // Category level
      const catEntry = categoryRevenueMap.get(catName) || {
        categoryName: catName,
        unitsSold: 0,
        revenue: 0,
      };
      catEntry.unitsSold += item.quantity;
      catEntry.revenue = roundCurrency(catEntry.revenue + Number(item.subtotal));
      categoryRevenueMap.set(catName, catEntry);

      // Size level
      if (item.size) {
        sizeMap.set(item.size, (sizeMap.get(item.size) || 0) + item.quantity);
      }

      // Color level
      if (item.color) {
        colorMap.set(item.color, (colorMap.get(item.color) || 0) + item.quantity);
      }
    }

    const productList = Array.from(productAggMap.values());
    const topSellingProducts = [...productList]
      .sort((a, b) => b.unitsSold - a.unitsSold)
      .slice(0, 5);

    const lowestSellingProducts = [...productList]
      .sort((a, b) => a.unitsSold - b.unitsSold)
      .slice(0, 5);

    const categoryPerformance = Array.from(categoryRevenueMap.values()).sort(
      (a, b) => b.revenue - a.revenue,
    );

    const bestSellingSizes = Array.from(sizeMap.entries())
      .map(([size, units]) => ({ size, units }))
      .sort((a, b) => b.units - a.units)
      .slice(0, 8);

    const bestSellingColors = Array.from(colorMap.entries())
      .map(([color, units]) => ({ color, units }))
      .sort((a, b) => b.units - a.units)
      .slice(0, 8);

    const outOfStockCount = activeVariants.filter((v) => v.stock === 0).length;
    const lowStockCount = activeVariants.filter((v) => v.stock > 0 && v.stock <= 5).length;

    const productsSummary = {
      topSellingProducts,
      lowestSellingProducts,
      categoryPerformance,
      bestSellingSizes,
      bestSellingColors,
      outOfStockCount,
      lowStockCount,
      totalActiveVariants: activeVariants.length,
    };

    // -------------------------------------------------------------
    // SECTION 4: CUSTOMERS PERFORMANCE
    // -------------------------------------------------------------
    const customerOrderCounts = new Map<string, number>();
    for (const ord of ordersInPeriod) {
      if (ord.customerId) {
        customerOrderCounts.set(
          ord.customerId,
          (customerOrderCounts.get(ord.customerId) || 0) + 1,
        );
      }
    }

    const uniquePatronsInPeriod = customerOrderCounts.size;
    let returningPatronsInPeriod = 0;
    for (const count of customerOrderCounts.values()) {
      if (count > 1) {
        returningPatronsInPeriod += 1;
      }
    }

    const orderFrequencyBuckets = {
      singleOrder: 0,
      twoToThreeOrders: 0,
      fourOrMoreOrders: 0,
    };

    for (const count of customerOrderCounts.values()) {
      if (count === 1) orderFrequencyBuckets.singleOrder += 1;
      else if (count <= 3) orderFrequencyBuckets.twoToThreeOrders += 1;
      else orderFrequencyBuckets.fourOrMoreOrders += 1;
    }

    const customersSummary = {
      totalCustomers: totalCustomersCount,
      newCustomersInPeriod,
      activePatronsInPeriod: uniquePatronsInPeriod,
      returningPatronsInPeriod,
      orderFrequencyBuckets,
    };

    // -------------------------------------------------------------
    // SECTION 5: COUPONS & DISCOUNTS PERFORMANCE
    // -------------------------------------------------------------
    const ordersWithDiscounts = ordersInPeriod.filter((o) => Number(o.discountAmount) > 0);
    const totalDiscountDelivered = roundCurrency(
      ordersWithDiscounts.reduce((sum, o) => sum + Number(o.discountAmount), 0),
    );

    const topCoupons = activeCoupons
      .map((c) => ({
        id: c.id,
        code: c.code,
        discountType: c.type,
        discountValue: Number(c.value),
        usedCount: c.usageCount,
        usageLimit: c.usageLimit,
      }))
      .sort((a, b) => b.usedCount - a.usedCount)
      .slice(0, 5);

    const couponsSummary = {
      activeCouponsCount: activeCoupons.filter((c) => c.isActive).length,
      ordersWithDiscounts: ordersWithDiscounts.length,
      totalDiscountDelivered,
      topCoupons,
    };

    // -------------------------------------------------------------
    // SECTION 6: PROMOTIONAL OFFERS PERFORMANCE
    // -------------------------------------------------------------
    const activeOffersCount = offers.filter(
      (o) => o.isActive && o.startDate <= now && o.expiryDate >= now,
    ).length;
    const scheduledOffersCount = offers.filter(
      (o) => o.isActive && o.startDate > now,
    ).length;
    const expiredOffersCount = offers.filter((o) => o.expiryDate < now).length;

    const offersSummary = {
      totalOffers: offers.length,
      activeOffersCount,
      scheduledOffersCount,
      expiredOffersCount,
      activeCampaigns: offers.map((o) => ({
        id: o.id,
        name: o.name,
        slug: o.slug,
        offerType: o.offerType,
        discountType: o.discountType,
        discountValue: Number(o.discountValue),
        startDate: o.startDate.toISOString(),
        expiryDate: o.expiryDate.toISOString(),
        isActive: o.isActive,
        badgeText: o.badgeText,
        productsAttached: o._count.products,
        categoriesAttached: o._count.categories,
        collectionsAttached: o._count.collections,
      })),
      trackingNote:
        'Promotional markdowns are computed and audited dynamically per line item across order checkouts.',
    };

    return {
      period,
      generatedAt: now.toISOString(),
      sales: salesSummary,
      orders: ordersSummary,
      products: productsSummary,
      customers: customersSummary,
      coupons: couponsSummary,
      offers: offersSummary,
    };
  }
}
