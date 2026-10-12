import { DashboardService } from '../services/dashboard.service.js';
import { DashboardQueryDto } from '../dto/dashboard-query.dto.js';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getMetrics(query: DashboardQueryDto): Promise<{
        message: string;
        data: {
            period: import("../services/dashboard.service.js").DashboardPeriod;
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
        };
    }>;
}
