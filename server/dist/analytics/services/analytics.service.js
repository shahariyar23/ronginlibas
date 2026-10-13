var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AnalyticsService_1;
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { VisitorSessionService, } from './visitor-session.service.js';
let AnalyticsService = AnalyticsService_1 = class AnalyticsService {
    prisma;
    visitorSessionService;
    logger = new Logger(AnalyticsService_1.name);
    constructor(prisma, visitorSessionService) {
        this.prisma = prisma;
        this.visitorSessionService = visitorSessionService;
    }
    sanitizeProperties(properties) {
        if (!properties || typeof properties !== 'object')
            return undefined;
        const SENSITIVE_KEYS = [
            'password',
            'secret',
            'token',
            'authorization',
            'card',
            'cvv',
            'cvc',
            'credit',
            'pin',
            'ssn',
            'nid',
            'hash',
        ];
        const clean = {};
        for (const [key, value] of Object.entries(properties)) {
            const lower = key.toLowerCase();
            if (SENSITIVE_KEYS.some((s) => lower.includes(s))) {
                continue;
            }
            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                clean[key] = this.sanitizeProperties(value);
            }
            else {
                clean[key] = value;
            }
        }
        return clean;
    }
    getDateRange(query) {
        const now = new Date();
        let startDate;
        let endDate = query.to ? new Date(query.to) : new Date(now.getTime());
        if (query.from) {
            startDate = new Date(query.from);
        }
        else {
            switch (query.period) {
                case 'today':
                    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    break;
                case '7d':
                    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    break;
                case '90d':
                    startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                    break;
                case 'year':
                    startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                    break;
                case 'all':
                    startDate = new Date(0);
                    break;
                case '30d':
                default:
                    startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    break;
            }
        }
        return { startDate, endDate };
    }
    async trackEvents(batchDto, req, res, authenticatedCustomerId) {
        const firstEvent = batchDto.events[0];
        const landingPage = firstEvent?.pagePath || '/';
        const visitorContext = await this.visitorSessionService.resolveVisitorAndSession(req, res, landingPage, batchDto.referrer, batchDto.deviceType, authenticatedCustomerId);
        if (!visitorContext.analyticsConsent) {
            return {
                success: true,
                processed: 0,
                consented: false,
                visitorToken: visitorContext.visitorToken,
            };
        }
        if (!batchDto.events || batchDto.events.length === 0) {
            return {
                success: true,
                processed: 0,
                consented: true,
                visitorToken: visitorContext.visitorToken,
            };
        }
        const records = batchDto.events.map((e) => ({
            visitorId: visitorContext.visitorId,
            sessionId: visitorContext.sessionId,
            eventType: e.eventType,
            pagePath: e.pagePath.substring(0, 500),
            productId: e.productId || null,
            engagementDuration: e.engagementDuration ?? null,
            campaignSource: e.campaignSource?.substring(0, 100) || null,
            campaignMedium: e.campaignMedium?.substring(0, 100) || null,
            campaignName: e.campaignName?.substring(0, 100) || null,
            properties: (this.sanitizeProperties(e.properties) || null),
        }));
        const result = await this.prisma.analyticsEvent.createMany({
            data: records,
        });
        return {
            success: true,
            processed: result.count,
            consented: true,
            visitorToken: visitorContext.visitorToken,
        };
    }
    async updateConsent(dto, req, res, authenticatedCustomerId) {
        const visitorContext = await this.visitorSessionService.resolveVisitorAndSession(req, res, '/', undefined, undefined, authenticatedCustomerId);
        await this.visitorSessionService.recordConsent(visitorContext.visitorId, dto, req.ip);
        return {
            success: true,
            visitorToken: visitorContext.visitorToken,
            analyticsConsent: dto.analyticsConsent,
            marketingConsent: dto.marketingConsent,
        };
    }
    async getVisitorStatus(req, res, authenticatedCustomerId) {
        const visitorContext = await this.visitorSessionService.resolveVisitorAndSession(req, res, '/', undefined, undefined, authenticatedCustomerId);
        return {
            visitorToken: visitorContext.visitorToken,
            customerId: visitorContext.customerId,
            analyticsConsent: visitorContext.analyticsConsent,
            marketingConsent: visitorContext.marketingConsent,
        };
    }
    async getOverview(query) {
        const { startDate, endDate } = this.getDateRange(query);
        const [totalSessions, pageViews, productViews, cartAdditions, checkoutInitiations, uniqueVisitorsResult, ordersResult,] = await Promise.all([
            this.prisma.analyticsSession.count({
                where: { startedAt: { gte: startDate, lte: endDate } },
            }),
            this.prisma.analyticsEvent.count({
                where: {
                    eventType: 'page_view',
                    timestamp: { gte: startDate, lte: endDate },
                },
            }),
            this.prisma.analyticsEvent.count({
                where: {
                    eventType: 'view_item',
                    timestamp: { gte: startDate, lte: endDate },
                },
            }),
            this.prisma.analyticsEvent.count({
                where: {
                    eventType: 'add_to_cart',
                    timestamp: { gte: startDate, lte: endDate },
                },
            }),
            this.prisma.analyticsEvent.count({
                where: {
                    eventType: 'begin_checkout',
                    timestamp: { gte: startDate, lte: endDate },
                },
            }),
            this.prisma.analyticsVisitor.count({
                where: { lastSeenAt: { gte: startDate, lte: endDate } },
            }),
            this.prisma.order.findMany({
                where: {
                    createdAt: { gte: startDate, lte: endDate },
                    status: { not: 'CANCELLED' },
                },
                select: {
                    id: true,
                    totalAmount: true,
                },
            }),
        ]);
        const activeThreshold = new Date(Date.now() - 30 * 60 * 1000);
        const activeSessions = await this.prisma.analyticsSession.count({
            where: { lastActiveAt: { gte: activeThreshold } },
        });
        const confirmedPurchases = ordersResult.length;
        const revenue = ordersResult.reduce((sum, o) => sum + Number(o.totalAmount), 0);
        const uniqueVisitors = Math.max(uniqueVisitorsResult, 1);
        const conversionRate = Number(((confirmedPurchases / uniqueVisitors) * 100).toFixed(2));
        const cartAbandonment = cartAdditions > 0
            ? Number((((cartAdditions - confirmedPurchases) / cartAdditions) *
                100).toFixed(2))
            : 0;
        const dailyEvents = await this.prisma.analyticsEvent.findMany({
            where: {
                timestamp: { gte: startDate, lte: endDate },
                eventType: { in: ['page_view', 'view_item', 'add_to_cart', 'begin_checkout'] },
            },
            select: {
                eventType: true,
                timestamp: true,
            },
        });
        const dailyMap = {};
        for (const event of dailyEvents) {
            const dateKey = event.timestamp.toISOString().split('T')[0];
            if (!dailyMap[dateKey]) {
                dailyMap[dateKey] = { date: dateKey, pageViews: 0, productViews: 0, cartAdditions: 0 };
            }
            if (event.eventType === 'page_view')
                dailyMap[dateKey].pageViews++;
            if (event.eventType === 'view_item')
                dailyMap[dateKey].productViews++;
            if (event.eventType === 'add_to_cart')
                dailyMap[dateKey].cartAdditions++;
        }
        const trends = Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));
        return {
            period: query.period || '30d',
            dateRange: { startDate, endDate },
            metrics: {
                uniqueVisitors,
                totalSessions,
                activeSessions,
                pageViews,
                productViews,
                cartAdditions,
                checkoutInitiations,
                confirmedPurchases,
                revenue: Math.round(revenue),
                conversionRate,
                cartAbandonment: Math.max(cartAbandonment, 0),
            },
            trends,
        };
    }
    async getRealtime() {
        const activeCutoff = new Date(Date.now() - 30 * 60 * 1000);
        const sessions = await this.prisma.analyticsSession.findMany({
            where: { lastActiveAt: { gte: activeCutoff } },
            orderBy: { lastActiveAt: 'desc' },
            take: 50,
            include: {
                visitor: {
                    include: {
                        customer: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true,
                            },
                        },
                    },
                },
                events: {
                    orderBy: { timestamp: 'desc' },
                    take: 5,
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                                slug: true,
                            },
                        },
                    },
                },
            },
        });
        const activeVisitors = sessions.map((s) => {
            const durationSeconds = Math.round((new Date(s.lastActiveAt).getTime() - new Date(s.startedAt).getTime()) / 1000);
            const latestEvent = s.events[0];
            const productEvent = s.events.find((e) => e.product);
            return {
                sessionId: s.id,
                visitorId: s.visitor.id,
                visitorToken: s.visitor.visitorToken.substring(0, 8) + '...',
                isCustomer: Boolean(s.visitor.customer),
                customerName: s.visitor.customer
                    ? `${s.visitor.customer.firstName} ${s.visitor.customer.lastName || ''}`.trim()
                    : null,
                customerEmail: s.visitor.customer?.email || null,
                customerId: s.visitor.customer?.id || null,
                startedAt: s.startedAt,
                lastActiveAt: s.lastActiveAt,
                durationSeconds,
                landingPage: s.landingPage,
                currentPage: latestEvent?.pagePath || s.landingPage || '/',
                lastEventType: latestEvent?.eventType || 'page_view',
                deviceType: s.deviceType || 'Desktop',
                referrer: s.referrer || 'Direct',
                recentProduct: productEvent?.product
                    ? {
                        id: productEvent.product.id,
                        name: productEvent.product.name,
                        slug: productEvent.product.slug,
                    }
                    : null,
            };
        });
        return {
            activeCount: activeVisitors.length,
            activeVisitors,
        };
    }
    async getProductAnalytics(query) {
        const { startDate, endDate } = this.getDateRange(query);
        const productEvents = await this.prisma.analyticsEvent.findMany({
            where: {
                timestamp: { gte: startDate, lte: endDate },
                productId: { not: null },
            },
            select: {
                productId: true,
                eventType: true,
                properties: true,
            },
        });
        const productStats = {};
        for (const ev of productEvents) {
            if (!ev.productId)
                continue;
            if (!productStats[ev.productId]) {
                productStats[ev.productId] = {
                    views: 0,
                    cartAdds: 0,
                    sizes: {},
                    colors: {},
                };
            }
            if (ev.eventType === 'view_item') {
                productStats[ev.productId].views++;
            }
            else if (ev.eventType === 'add_to_cart') {
                productStats[ev.productId].cartAdds++;
            }
            const props = ev.properties;
            if (props?.size && typeof props.size === 'string') {
                const sz = props.size;
                productStats[ev.productId].sizes[sz] =
                    (productStats[ev.productId].sizes[sz] || 0) + 1;
            }
            if (props?.color && typeof props.color === 'string') {
                const col = props.color;
                productStats[ev.productId].colors[col] =
                    (productStats[ev.productId].colors[col] || 0) + 1;
            }
        }
        const orderItems = await this.prisma.orderItem.findMany({
            where: {
                order: {
                    createdAt: { gte: startDate, lte: endDate },
                    status: { not: 'CANCELLED' },
                },
            },
            select: {
                productId: true,
                quantity: true,
                subtotal: true,
            },
        });
        const purchasesMap = {};
        for (const item of orderItems) {
            if (!item.productId)
                continue;
            if (!purchasesMap[item.productId]) {
                purchasesMap[item.productId] = { count: 0, revenue: 0 };
            }
            purchasesMap[item.productId].count += item.quantity;
            purchasesMap[item.productId].revenue += Number(item.subtotal);
        }
        const allProductIds = Array.from(new Set([...Object.keys(productStats), ...Object.keys(purchasesMap)]));
        const products = await this.prisma.product.findMany({
            where: { id: { in: allProductIds } },
            select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                category: { select: { name: true } },
                images: {
                    where: { isPrimary: true },
                    take: 1,
                    select: { url: true },
                },
            },
        });
        const detailedProducts = products.map((p) => {
            const stats = productStats[p.id] || {
                views: 0,
                cartAdds: 0,
                sizes: {},
                colors: {},
            };
            const purchaseStats = purchasesMap[p.id] || { count: 0, revenue: 0 };
            const viewToCartRate = stats.views > 0
                ? Number(((stats.cartAdds / stats.views) * 100).toFixed(1))
                : 0;
            const cartToPurchaseRate = stats.cartAdds > 0
                ? Number(((purchaseStats.count / stats.cartAdds) * 100).toFixed(1))
                : 0;
            const topSizes = Object.entries(stats.sizes)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3)
                .map(([size, count]) => ({ size, count }));
            const topColors = Object.entries(stats.colors)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3)
                .map(([color, count]) => ({ color, count }));
            return {
                id: p.id,
                name: p.name,
                slug: p.slug,
                price: Number(p.price),
                category: p.category?.name || 'Garments',
                image: p.images[0]?.url || null,
                views: stats.views,
                cartAdditions: stats.cartAdds,
                purchases: purchaseStats.count,
                revenue: Math.round(purchaseStats.revenue),
                viewToCartRate,
                cartToPurchaseRate,
                topSizes,
                topColors,
                isHighInterestLowConversion: stats.views >= 10 && purchaseStats.count === 0,
            };
        });
        detailedProducts.sort((a, b) => b.views - a.views);
        return {
            totalAnalyzed: detailedProducts.length,
            products: detailedProducts,
        };
    }
    async getFunnel(query) {
        const { startDate, endDate } = this.getDateRange(query);
        const [pageViews, productViews, cartAdds, checkouts, purchases,] = await Promise.all([
            this.prisma.analyticsEvent.groupBy({
                by: ['visitorId'],
                where: {
                    eventType: 'page_view',
                    timestamp: { gte: startDate, lte: endDate },
                },
            }),
            this.prisma.analyticsEvent.groupBy({
                by: ['visitorId'],
                where: {
                    eventType: 'view_item',
                    timestamp: { gte: startDate, lte: endDate },
                },
            }),
            this.prisma.analyticsEvent.groupBy({
                by: ['visitorId'],
                where: {
                    eventType: 'add_to_cart',
                    timestamp: { gte: startDate, lte: endDate },
                },
            }),
            this.prisma.analyticsEvent.groupBy({
                by: ['visitorId'],
                where: {
                    eventType: 'begin_checkout',
                    timestamp: { gte: startDate, lte: endDate },
                },
            }),
            this.prisma.order.count({
                where: {
                    createdAt: { gte: startDate, lte: endDate },
                    status: { not: 'CANCELLED' },
                },
            }),
        ]);
        const step1 = Math.max(pageViews.length, 1);
        const step2 = productViews.length;
        const step3 = cartAdds.length;
        const step4 = checkouts.length;
        const step5 = purchases;
        return {
            steps: [
                {
                    name: 'Storefront Visitors',
                    count: step1,
                    conversionRate: 100,
                    dropoffRate: 0,
                },
                {
                    name: 'Product Page Views',
                    count: step2,
                    conversionRate: Number(((step2 / step1) * 100).toFixed(1)),
                    dropoffRate: Number((((step1 - step2) / step1) * 100).toFixed(1)),
                },
                {
                    name: 'Added to Cart',
                    count: step3,
                    conversionRate: Number(((step3 / Math.max(step2, 1)) * 100).toFixed(1)),
                    dropoffRate: Number((((Math.max(step2, 1) - step3) / Math.max(step2, 1)) * 100).toFixed(1)),
                },
                {
                    name: 'Began Checkout',
                    count: step4,
                    conversionRate: Number(((step4 / Math.max(step3, 1)) * 100).toFixed(1)),
                    dropoffRate: Number((((Math.max(step3, 1) - step4) / Math.max(step3, 1)) * 100).toFixed(1)),
                },
                {
                    name: 'Completed Purchase',
                    count: step5,
                    conversionRate: Number(((step5 / Math.max(step4, 1)) * 100).toFixed(1)),
                    dropoffRate: Number((((Math.max(step4, 1) - step5) / Math.max(step4, 1)) * 100).toFixed(1)),
                },
            ],
            overallConversionRate: Number(((step5 / step1) * 100).toFixed(2)),
        };
    }
    async getCustomerActivity(customerId, query) {
        const customer = await this.prisma.customer.findUnique({
            where: { id: customerId },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                createdAt: true,
            },
        });
        if (!customer) {
            throw new NotFoundException(`Customer ${customerId} not found`);
        }
        const visitors = await this.prisma.analyticsVisitor.findMany({
            where: { customerId },
            select: { id: true },
        });
        const visitorIds = visitors.map((v) => v.id);
        const page = query.page || 1;
        const limit = query.limit || 30;
        const skip = (page - 1) * limit;
        const [events, totalEvents, orders] = await Promise.all([
            this.prisma.analyticsEvent.findMany({
                where: { visitorId: { in: visitorIds } },
                orderBy: { timestamp: 'desc' },
                skip,
                take: limit,
                include: {
                    product: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                        },
                    },
                },
            }),
            this.prisma.analyticsEvent.count({
                where: { visitorId: { in: visitorIds } },
            }),
            this.prisma.order.findMany({
                where: { customerId },
                orderBy: { createdAt: 'desc' },
                take: 10,
                select: {
                    id: true,
                    orderNumber: true,
                    totalAmount: true,
                    status: true,
                    createdAt: true,
                    items: {
                        select: {
                            productName: true,
                            quantity: true,
                        },
                    },
                },
            }),
        ]);
        return {
            customer,
            totalEvents,
            page,
            limit,
            orders,
            timeline: events.map((e) => ({
                id: e.id,
                eventType: e.eventType,
                pagePath: e.pagePath,
                timestamp: e.timestamp,
                engagementDuration: e.engagementDuration,
                product: e.product,
                properties: e.properties,
            })),
        };
    }
    async identify(req, res, authenticatedCustomerId) {
        if (!authenticatedCustomerId) {
            return { success: false, message: 'Unauthenticated' };
        }
        const visitorContext = await this.visitorSessionService.resolveVisitorAndSession(req, res, '/', undefined, undefined, authenticatedCustomerId);
        return {
            success: true,
            visitorToken: visitorContext.visitorToken,
            customerId: authenticatedCustomerId,
        };
    }
    async getTraffic(query) {
        const { startDate, endDate } = this.getDateRange(query);
        const [sessions, totalVisitors, uniqueSessionCount] = await Promise.all([
            this.prisma.analyticsSession.findMany({
                where: { startedAt: { gte: startDate, lte: endDate } },
                select: {
                    startedAt: true,
                    referrer: true,
                    landingPage: true,
                    deviceType: true,
                },
            }),
            this.prisma.analyticsVisitor.count({
                where: { lastSeenAt: { gte: startDate, lte: endDate } },
            }),
            this.prisma.analyticsSession.count({
                where: { startedAt: { gte: startDate, lte: endDate } },
            }),
        ]);
        const dailyMap = {};
        const referrerMap = {};
        const landingMap = {};
        for (const s of sessions) {
            const dateKey = s.startedAt.toISOString().split('T')[0];
            if (!dailyMap[dateKey]) {
                dailyMap[dateKey] = { date: dateKey, sessions: 0 };
            }
            dailyMap[dateKey].sessions++;
            const ref = s.referrer || 'Direct / Organic';
            referrerMap[ref] = (referrerMap[ref] || 0) + 1;
            const page = s.landingPage || '/';
            landingMap[page] = (landingMap[page] || 0) + 1;
        }
        const timeline = Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));
        const topReferrers = Object.entries(referrerMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([referrer, count]) => ({
            referrer,
            count,
            percentage: Number(((count / Math.max(uniqueSessionCount, 1)) * 100).toFixed(1)),
        }));
        const topLandingPages = Object.entries(landingMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([path, count]) => ({
            path,
            count,
            percentage: Number(((count / Math.max(uniqueSessionCount, 1)) * 100).toFixed(1)),
        }));
        return {
            period: query.period || '30d',
            dateRange: { startDate, endDate },
            totalSessions: uniqueSessionCount,
            totalVisitors,
            timeline,
            topReferrers,
            topLandingPages,
        };
    }
    async getEvents(query) {
        const { startDate, endDate } = this.getDateRange(query);
        const page = query.page || 1;
        const limit = query.limit || 20;
        const skip = (page - 1) * limit;
        const where = {
            timestamp: { gte: startDate, lte: endDate },
        };
        if (query.search) {
            where.OR = [
                { eventType: { contains: query.search, mode: 'insensitive' } },
                { pagePath: { contains: query.search, mode: 'insensitive' } },
            ];
        }
        const [total, events] = await Promise.all([
            this.prisma.analyticsEvent.count({ where }),
            this.prisma.analyticsEvent.findMany({
                where,
                orderBy: { timestamp: 'desc' },
                skip,
                take: limit,
                include: {
                    product: {
                        select: { id: true, name: true, slug: true },
                    },
                    visitor: {
                        select: { visitorToken: true, customerId: true },
                    },
                },
            }),
        ]);
        return {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            events: events.map((e) => ({
                id: e.id,
                eventType: e.eventType,
                pagePath: e.pagePath,
                timestamp: e.timestamp,
                engagementDuration: e.engagementDuration,
                visitorToken: e.visitor?.visitorToken ? e.visitor.visitorToken.substring(0, 8) + '...' : null,
                customerId: e.visitor?.customerId || null,
                product: e.product,
                properties: e.properties,
            })),
        };
    }
    async getCarts(query) {
        const { startDate, endDate } = this.getDateRange(query);
        const [cartAdditions, cartRemovals, uniqueCartVisitors, checkoutInitiations, orders, cartEventsWithProducts,] = await Promise.all([
            this.prisma.analyticsEvent.count({
                where: {
                    eventType: 'add_to_cart',
                    timestamp: { gte: startDate, lte: endDate },
                },
            }),
            this.prisma.analyticsEvent.count({
                where: {
                    eventType: 'remove_from_cart',
                    timestamp: { gte: startDate, lte: endDate },
                },
            }),
            this.prisma.analyticsEvent.groupBy({
                by: ['visitorId'],
                where: {
                    eventType: 'add_to_cart',
                    timestamp: { gte: startDate, lte: endDate },
                },
            }),
            this.prisma.analyticsEvent.count({
                where: {
                    eventType: 'begin_checkout',
                    timestamp: { gte: startDate, lte: endDate },
                },
            }),
            this.prisma.order.count({
                where: {
                    createdAt: { gte: startDate, lte: endDate },
                    status: { not: 'CANCELLED' },
                },
            }),
            this.prisma.analyticsEvent.groupBy({
                by: ['productId'],
                where: {
                    eventType: 'add_to_cart',
                    productId: { not: null },
                    timestamp: { gte: startDate, lte: endDate },
                },
                _count: { id: true },
                orderBy: { _count: { id: 'desc' } },
                take: 10,
            }),
        ]);
        const productIds = cartEventsWithProducts
            .map((c) => c.productId)
            .filter((id) => Boolean(id));
        const products = await this.prisma.product.findMany({
            where: { id: { in: productIds } },
            select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                images: {
                    where: { isPrimary: true },
                    take: 1,
                    select: { url: true },
                },
            },
        });
        const productMap = new Map(products.map((p) => [p.id, p]));
        const topCartProducts = cartEventsWithProducts.map((item) => {
            const prod = item.productId ? productMap.get(item.productId) : null;
            return {
                productId: item.productId,
                name: prod?.name || 'Unknown Product',
                slug: prod?.slug || '',
                price: prod ? Number(prod.price) : 0,
                image: prod?.images[0]?.url || null,
                additionsCount: item._count.id,
            };
        });
        const cartAbandonmentRate = cartAdditions > 0
            ? Number((((cartAdditions - orders) / cartAdditions) * 100).toFixed(1))
            : 0;
        const checkoutAbandonmentRate = checkoutInitiations > 0
            ? Number((((checkoutInitiations - orders) / checkoutInitiations) * 100).toFixed(1))
            : 0;
        return {
            period: query.period || '30d',
            dateRange: { startDate, endDate },
            metrics: {
                cartAdditions,
                cartRemovals,
                uniqueCartVisitors: uniqueCartVisitors.length,
                checkoutInitiations,
                confirmedPurchases: orders,
                cartAbandonmentRate: Math.max(cartAbandonmentRate, 0),
                checkoutAbandonmentRate: Math.max(checkoutAbandonmentRate, 0),
            },
            topCartProducts,
        };
    }
    async getSessions(query) {
        const { startDate, endDate } = this.getDateRange(query);
        const page = query.page || 1;
        const limit = query.limit || 20;
        const skip = (page - 1) * limit;
        const where = { startedAt: { gte: startDate, lte: endDate } };
        const [total, sessions] = await Promise.all([
            this.prisma.analyticsSession.count({ where }),
            this.prisma.analyticsSession.findMany({
                where,
                orderBy: { startedAt: 'desc' },
                skip,
                take: limit,
                include: {
                    visitor: {
                        select: {
                            visitorToken: true,
                            customerId: true,
                            customer: {
                                select: {
                                    id: true,
                                    firstName: true,
                                    lastName: true,
                                    email: true,
                                },
                            },
                        },
                    },
                    _count: {
                        select: { events: true },
                    },
                },
            }),
        ]);
        const formattedSessions = sessions.map((s) => {
            const durationSeconds = Math.round((new Date(s.lastActiveAt).getTime() - new Date(s.startedAt).getTime()) / 1000);
            return {
                id: s.id,
                visitorToken: s.visitor?.visitorToken
                    ? s.visitor.visitorToken.substring(0, 8) + '...'
                    : 'anonymous',
                customerName: s.visitor?.customer
                    ? `${s.visitor.customer.firstName} ${s.visitor.customer.lastName || ''}`.trim()
                    : null,
                startedAt: s.startedAt,
                lastActiveAt: s.lastActiveAt,
                durationSeconds,
                landingPage: s.landingPage || '/',
                referrer: s.referrer || 'Direct',
                deviceType: s.deviceType || 'Desktop',
                eventsCount: s._count.events,
            };
        });
        return {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            sessions: formattedSessions,
        };
    }
    async getTopPages(query) {
        const { startDate, endDate } = this.getDateRange(query);
        const pages = await this.prisma.analyticsEvent.groupBy({
            by: ['pagePath'],
            where: {
                eventType: 'page_view',
                timestamp: { gte: startDate, lte: endDate },
            },
            _count: { id: true },
            _avg: { engagementDuration: true },
            orderBy: { _count: { id: 'desc' } },
            take: 25,
        });
        const totalViews = pages.reduce((sum, p) => sum + p._count.id, 0);
        return {
            period: query.period || '30d',
            totalPageViews: totalViews,
            pages: pages.map((p) => ({
                pagePath: p.pagePath,
                views: p._count.id,
                percentage: Number(((p._count.id / Math.max(totalViews, 1)) * 100).toFixed(1)),
                avgDurationSeconds: Math.round(p._avg.engagementDuration || 0),
            })),
        };
    }
    async getSearches(query) {
        const { startDate, endDate } = this.getDateRange(query);
        const searchEvents = await this.prisma.analyticsEvent.findMany({
            where: {
                eventType: 'search',
                timestamp: { gte: startDate, lte: endDate },
            },
            select: {
                properties: true,
                timestamp: true,
            },
            orderBy: { timestamp: 'desc' },
            take: 500,
        });
        const termMap = {};
        for (const ev of searchEvents) {
            const props = ev.properties;
            const term = (typeof props?.query === 'string' && props.query.trim()) ||
                (typeof props?.search_term === 'string' && props.search_term.trim()) ||
                (typeof props?.term === 'string' && props.term.trim()) ||
                null;
            if (!term)
                continue;
            const cleanTerm = term.toLowerCase().substring(0, 80);
            if (!termMap[cleanTerm]) {
                termMap[cleanTerm] = { count: 0, lastSearchedAt: ev.timestamp };
            }
            termMap[cleanTerm].count++;
            if (ev.timestamp > termMap[cleanTerm].lastSearchedAt) {
                termMap[cleanTerm].lastSearchedAt = ev.timestamp;
            }
        }
        const topSearches = Object.entries(termMap)
            .sort((a, b) => b[1].count - a[1].count)
            .slice(0, 20)
            .map(([term, data]) => ({
            term,
            count: data.count,
            lastSearchedAt: data.lastSearchedAt,
        }));
        return {
            period: query.period || '30d',
            totalSearchesTracked: searchEvents.length,
            searches: topSearches,
        };
    }
    async getDevices(query) {
        const { startDate, endDate } = this.getDateRange(query);
        const deviceGroups = await this.prisma.analyticsSession.groupBy({
            by: ['deviceType'],
            where: { startedAt: { gte: startDate, lte: endDate } },
            _count: { id: true },
        });
        const totalSessions = deviceGroups.reduce((sum, g) => sum + g._count.id, 0);
        const breakdown = deviceGroups.map((g) => ({
            deviceType: g.deviceType || 'Desktop',
            sessions: g._count.id,
            percentage: Number(((g._count.id / Math.max(totalSessions, 1)) * 100).toFixed(1)),
        }));
        breakdown.sort((a, b) => b.sessions - a.sessions);
        return {
            period: query.period || '30d',
            totalSessions,
            breakdown,
        };
    }
    async cleanupRetention(days = 180) {
        const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        const deletedEvents = await this.prisma.analyticsEvent.deleteMany({
            where: { timestamp: { lt: cutoff } },
        });
        const deletedSessions = await this.prisma.analyticsSession.deleteMany({
            where: {
                lastActiveAt: { lt: cutoff },
                visitor: { customerId: null },
            },
        });
        this.logger.log(`[Retention Cleanup] Purged ${deletedEvents.count} events and ${deletedSessions.count} anonymous sessions older than ${days} days`);
        return {
            purgedEvents: deletedEvents.count,
            purgedSessions: deletedSessions.count,
            cutoffDate: cutoff,
        };
    }
};
AnalyticsService = AnalyticsService_1 = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService,
        VisitorSessionService])
], AnalyticsService);
export { AnalyticsService };
//# sourceMappingURL=analytics.service.js.map