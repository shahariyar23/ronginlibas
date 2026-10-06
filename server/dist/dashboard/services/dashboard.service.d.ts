import { PrismaService } from '../../prisma/prisma.service.js';
export declare class DashboardService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getAdminDashboardMetrics(): Promise<{
        metrics: {
            totalSales: number;
            salesGrowth: string;
            totalOrders: number;
            pendingOrders: number;
            deliveryRate: string;
            totalProducts: number;
            activeCatalog: number;
            totalCustomers: number;
            vipMembersCount: number;
            lowStockCount: number;
            stockoutCount: number;
        };
        salesOverview: {
            peakPoint: {
                label: string;
                amount: number;
                day: string;
            };
            chartData: {
                day: string;
                dhakaSales: number;
                nationalSales: number;
            }[];
            kpis: {
                averageOrderValue: number;
                conversionRate: string;
                conversionGrowth: string;
                fulfillmentVelocity: string;
            };
        };
        recentOrders: {
            id: string;
            customerName: string;
            phone: string;
            amount: number;
            status: import("@prisma/client").$Enums.OrderStatus;
            paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
            createdAt: Date;
        }[];
        lowStockProducts: {
            variantId: string;
            name: string;
            sku: string;
            stock: number;
            status: string;
            image: string;
        }[];
    } | {
        metrics: {
            totalSales: number;
            salesGrowth: string;
            totalOrders: number;
            pendingOrders: number;
            deliveryRate: string;
            totalProducts: number;
            activeCatalog: number;
            totalCustomers: number;
            vipMembersCount: number;
            lowStockCount: number;
            stockoutCount: number;
        };
        salesOverview: {
            peakPoint: {
                label: string;
                amount: number;
                day: string;
            };
            chartData: {
                day: string;
                dhakaSales: number;
                nationalSales: number;
            }[];
            kpis: {
                averageOrderValue: number;
                conversionRate: string;
                conversionGrowth: string;
                fulfillmentVelocity: string;
            };
        };
        recentOrders: {
            id: string;
            customerName: string;
            customerLocation: string;
            amount: number;
            status: string;
            paymentMethod: string;
        }[];
        lowStockProducts: {
            name: string;
            sku: string;
            stock: number;
            status: string;
        }[];
    }>;
}
