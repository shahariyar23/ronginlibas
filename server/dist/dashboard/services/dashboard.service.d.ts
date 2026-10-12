import { PrismaService } from '../../prisma/prisma.service.js';
export type DashboardPeriod = '7' | '30' | 'month';
export declare class DashboardService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getAdminDashboardMetrics(period?: DashboardPeriod, now?: Date): Promise<{
        period: DashboardPeriod;
        metrics: {
            totalSales: number;
            totalOrders: number;
            activeProducts: number;
            totalCustomers: number;
        };
        salesOverview: {
            chartData: {
                dhakaSales: number;
                nationalSales: number;
                unclassifiedSales: number;
                date: string;
                day: string;
            }[];
            peakPoint: {
                label: string;
                amount: number;
                day: string;
            } | null;
            kpis: {
                averageOrderValue: number | null;
                deliveryRate: number | null;
                conversionRate: number | null;
                fulfillmentVelocityHours: number | null;
            };
        };
        dailySales: {
            today: {
                date: string;
                total: number;
                orderCount: number;
            };
            yesterday: {
                date: string;
                total: number;
                orderCount: number;
            };
            lastSevenDays: {
                total: number;
                date: string;
                day: string;
                orderCount: number;
            }[];
        };
        needsAttention: {
            pendingOrders: number;
            lowStockVariants: number;
            outOfStockVariants: number;
            pendingReviews: number;
            failedPayments: number;
        };
        recentOrders: {
            id: string;
            orderNumber: string;
            customerName: string;
            customerLocation: string;
            amount: number;
            status: import("@prisma/client").$Enums.OrderStatus;
            paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
            createdAt: Date;
        }[];
        topSellingProducts: {
            name: string;
            sku: string;
            productId: string;
            unitsSold: number;
            revenue: number;
        }[];
        lowStockProducts: {
            id: string;
            variantId: string;
            name: string;
            sku: string;
            stock: number;
            status: string;
            image: string;
        }[];
    }>;
}
