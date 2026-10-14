import type { Request, Response } from 'express';
import { PrismaService } from '../../prisma/prisma.service.js';
import { AnalyticsQueryDto, TrackEventsBatchDto, UpdateConsentDto } from '../dto/track-event.dto.js';
import { VisitorSessionService } from './visitor-session.service.js';
export declare class AnalyticsService {
    private readonly prisma;
    private readonly visitorSessionService;
    private readonly logger;
    constructor(prisma: PrismaService, visitorSessionService: VisitorSessionService);
    private sanitizeProperties;
    private getDateRange;
    trackEvents(batchDto: TrackEventsBatchDto, req: Request, res?: Response, authenticatedCustomerId?: string): Promise<{
        success: boolean;
        processed: number;
        consented: boolean;
        visitorToken: string;
    }>;
    updateConsent(dto: UpdateConsentDto, req: Request, res?: Response, authenticatedCustomerId?: string): Promise<{
        success: boolean;
        visitorToken: string;
        analyticsConsent: boolean;
        marketingConsent: boolean;
    }>;
    getVisitorStatus(req: Request, res?: Response, authenticatedCustomerId?: string): Promise<{
        visitorToken: string;
        customerId: string | null;
        analyticsConsent: boolean;
        marketingConsent: boolean;
    }>;
    getOverview(query: AnalyticsQueryDto): Promise<{
        period: "7d" | "year" | "all" | "today" | "30d" | "90d";
        dateRange: {
            startDate: Date;
            endDate: Date;
        };
        metrics: {
            uniqueVisitors: number;
            totalSessions: number;
            activeSessions: number;
            pageViews: number;
            productViews: number;
            cartAdditions: number;
            checkoutInitiations: number;
            confirmedPurchases: number;
            revenue: number;
            conversionRate: number;
            cartAbandonment: number;
        };
        trends: {
            date: string;
            pageViews: number;
            productViews: number;
            cartAdditions: number;
        }[];
    }>;
    getRealtime(): Promise<{
        activeCount: number;
        activeVisitors: {
            sessionId: string;
            visitorId: string;
            visitorToken: string;
            isCustomer: boolean;
            customerName: string | null;
            customerEmail: string | null;
            customerId: string | null;
            startedAt: Date;
            lastActiveAt: Date;
            durationSeconds: number;
            landingPage: string | null;
            currentPage: string;
            lastEventType: string;
            deviceType: string;
            referrer: string;
            recentProduct: {
                id: string;
                name: string;
                slug: string;
            } | null;
        }[];
    }>;
    getProductAnalytics(query: AnalyticsQueryDto): Promise<{
        totalAnalyzed: number;
        products: {
            id: string;
            name: string;
            slug: string;
            price: number;
            category: string;
            image: string | null;
            views: number;
            cartAdditions: number;
            purchases: number;
            revenue: number;
            viewToCartRate: number;
            cartToPurchaseRate: number;
            topSizes: {
                size: string;
                count: number;
            }[];
            topColors: {
                color: string;
                count: number;
            }[];
            isHighInterestLowConversion: boolean;
        }[];
    }>;
    getFunnel(query: AnalyticsQueryDto): Promise<{
        steps: {
            name: string;
            count: number;
            conversionRate: number;
            dropoffRate: number;
        }[];
        overallConversionRate: number;
    }>;
    getCustomerActivity(customerId: string, query: AnalyticsQueryDto): Promise<{
        customer: {
            email: string | null;
            phone: string | null;
            firstName: string;
            lastName: string | null;
            createdAt: Date;
            id: string;
        };
        totalEvents: number;
        page: number;
        limit: number;
        orders: {
            items: {
                productName: string;
                quantity: number;
            }[];
            orderNumber: string;
            totalAmount: import("@prisma/client/runtime/library").Decimal;
            status: import("@prisma/client").$Enums.OrderStatus;
            createdAt: Date;
            id: string;
        }[];
        timeline: {
            id: string;
            eventType: string;
            pagePath: string;
            timestamp: Date;
            engagementDuration: number | null;
            product: {
                name: string;
                id: string;
                slug: string;
            } | null;
            properties: import("@prisma/client/runtime/library").JsonValue;
        }[];
    }>;
    identify(req: Request, res?: Response, authenticatedCustomerId?: string): Promise<{
        success: boolean;
        message: string;
        visitorToken?: undefined;
        customerId?: undefined;
    } | {
        success: boolean;
        visitorToken: string;
        customerId: string;
        message?: undefined;
    }>;
    getTraffic(query: AnalyticsQueryDto): Promise<{
        period: "7d" | "year" | "all" | "today" | "30d" | "90d";
        dateRange: {
            startDate: Date;
            endDate: Date;
        };
        totalSessions: number;
        totalVisitors: number;
        timeline: {
            date: string;
            sessions: number;
        }[];
        topReferrers: {
            referrer: string;
            count: number;
            percentage: number;
        }[];
        topLandingPages: {
            path: string;
            count: number;
            percentage: number;
        }[];
    }>;
    getEvents(query: AnalyticsQueryDto): Promise<{
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        events: {
            id: string;
            eventType: string;
            pagePath: string;
            timestamp: Date;
            engagementDuration: number | null;
            visitorToken: string | null;
            customerId: string | null;
            product: {
                name: string;
                id: string;
                slug: string;
            } | null;
            properties: import("@prisma/client/runtime/library").JsonValue;
        }[];
    }>;
    getCarts(query: AnalyticsQueryDto): Promise<{
        period: "7d" | "year" | "all" | "today" | "30d" | "90d";
        dateRange: {
            startDate: Date;
            endDate: Date;
        };
        metrics: {
            cartAdditions: number;
            cartRemovals: number;
            uniqueCartVisitors: number;
            checkoutInitiations: number;
            confirmedPurchases: number;
            cartAbandonmentRate: number;
            checkoutAbandonmentRate: number;
        };
        topCartProducts: {
            productId: string | null;
            name: string;
            slug: string;
            price: number;
            image: string | null;
            additionsCount: number;
        }[];
    }>;
    getSessions(query: AnalyticsQueryDto): Promise<{
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        sessions: {
            id: string;
            visitorToken: string;
            customerName: string | null;
            startedAt: Date;
            lastActiveAt: Date;
            durationSeconds: number;
            landingPage: string;
            referrer: string;
            deviceType: string;
            eventsCount: number;
        }[];
    }>;
    getTopPages(query: AnalyticsQueryDto): Promise<{
        period: "7d" | "year" | "all" | "today" | "30d" | "90d";
        totalPageViews: number;
        pages: {
            pagePath: string;
            views: number;
            percentage: number;
            avgDurationSeconds: number;
        }[];
    }>;
    getSearches(query: AnalyticsQueryDto): Promise<{
        period: "7d" | "year" | "all" | "today" | "30d" | "90d";
        totalSearchesTracked: number;
        searches: {
            term: string;
            count: number;
            lastSearchedAt: Date;
        }[];
    }>;
    getDevices(query: AnalyticsQueryDto): Promise<{
        period: "7d" | "year" | "all" | "today" | "30d" | "90d";
        totalSessions: number;
        breakdown: {
            deviceType: string;
            sessions: number;
            percentage: number;
        }[];
    }>;
    cleanupRetention(days?: number): Promise<{
        purgedEvents: number;
        purgedSessions: number;
        cutoffDate: Date;
    }>;
}
