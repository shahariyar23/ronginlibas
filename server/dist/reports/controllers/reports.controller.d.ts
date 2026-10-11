import { ReportsService } from '../services/reports.service.js';
import { ReportsQueryDto, ReportsPeriod } from '../dto/reports-query.dto.js';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    getReports(query: ReportsQueryDto): Promise<{
        message: string;
        data: {
            period: ReportsPeriod;
            generatedAt: string;
            sales: {
                totalGrossSales: number;
                totalNetSales: number;
                totalDiscounts: number;
                totalShipping: number;
                averageOrderValue: number;
                completedOrdersTotal: number;
                completedOrdersCount: number;
                cancelledOrdersTotal: number;
                cancelledOrdersCount: number;
                refundedOrdersTotal: number;
                refundedOrdersCount: number;
                revenueByDate: {
                    date: string;
                    revenue: number;
                    orderCount: number;
                    gross: number;
                }[];
            };
            orders: {
                totalOrders: number;
                statusBreakdown: Record<string, number>;
                paymentStatusBreakdown: Record<string, number>;
                paymentMethodBreakdown: Record<string, number>;
            };
            products: {
                topSellingProducts: {
                    id: string;
                    name: string;
                    sku: string;
                    categoryName: string;
                    unitsSold: number;
                    revenue: number;
                }[];
                lowestSellingProducts: {
                    id: string;
                    name: string;
                    sku: string;
                    categoryName: string;
                    unitsSold: number;
                    revenue: number;
                }[];
                categoryPerformance: {
                    categoryName: string;
                    unitsSold: number;
                    revenue: number;
                }[];
                bestSellingSizes: {
                    size: string;
                    units: number;
                }[];
                bestSellingColors: {
                    color: string;
                    units: number;
                }[];
                outOfStockCount: number;
                lowStockCount: number;
                totalActiveVariants: number;
            };
            customers: {
                totalCustomers: number;
                newCustomersInPeriod: number;
                activePatronsInPeriod: number;
                returningPatronsInPeriod: number;
                orderFrequencyBuckets: {
                    singleOrder: number;
                    twoToThreeOrders: number;
                    fourOrMoreOrders: number;
                };
            };
            coupons: {
                activeCouponsCount: number;
                ordersWithDiscounts: number;
                totalDiscountDelivered: number;
                topCoupons: {
                    id: string;
                    code: string;
                    discountType: import("@prisma/client").$Enums.CouponType;
                    discountValue: number;
                    usedCount: number;
                    usageLimit: number | null;
                }[];
            };
            offers: {
                totalOffers: number;
                activeOffersCount: number;
                scheduledOffersCount: number;
                expiredOffersCount: number;
                activeCampaigns: {
                    id: string;
                    name: string;
                    slug: string;
                    offerType: import("@prisma/client").$Enums.OfferType;
                    discountType: import("@prisma/client").$Enums.OfferDiscountType;
                    discountValue: number;
                    startDate: string;
                    expiryDate: string;
                    isActive: boolean;
                    badgeText: string | null;
                    productsAttached: number;
                    categoriesAttached: number;
                    collectionsAttached: number;
                }[];
                trackingNote: string;
            };
        };
    }>;
}
