var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Body, Controller, Get, Param, Post, Query, UseGuards, } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Permissions } from '../../common/decorators/permissions.decorator.js';
import { UserRole } from '../../common/constants/roles.constant.js';
import { AnalyticsService } from '../services/analytics.service.js';
import { AnalyticsQueryDto } from '../dto/track-event.dto.js';
let AdminAnalyticsController = class AdminAnalyticsController {
    analyticsService;
    constructor(analyticsService) {
        this.analyticsService = analyticsService;
    }
    async getOverview(query) {
        return this.analyticsService.getOverview(query);
    }
    async getTraffic(query) {
        return this.analyticsService.getTraffic(query);
    }
    async getEvents(query) {
        return this.analyticsService.getEvents(query);
    }
    async getProductAnalytics(query) {
        return this.analyticsService.getProductAnalytics(query);
    }
    async getConversions(query) {
        return this.analyticsService.getFunnel(query);
    }
    async getFunnel(query) {
        return this.analyticsService.getFunnel(query);
    }
    async getCarts(query) {
        return this.analyticsService.getCarts(query);
    }
    async getSessions(query) {
        return this.analyticsService.getSessions(query);
    }
    async getTopPages(query) {
        return this.analyticsService.getTopPages(query);
    }
    async getSearches(query) {
        return this.analyticsService.getSearches(query);
    }
    async getDevices(query) {
        return this.analyticsService.getDevices(query);
    }
    async getCustomerActivity(customerId, query) {
        return this.analyticsService.getCustomerActivity(customerId, query);
    }
    async cleanupRetention(days) {
        return this.analyticsService.cleanupRetention(days ? Number(days) : 180);
    }
};
__decorate([
    Get('overview'),
    Permissions('reports'),
    ApiOperation({ summary: 'Get overview metrics, KPIs, and trend time series' }),
    ApiResponse({ status: 200, description: 'Overview metrics successfully calculated' }),
    __param(0, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [AnalyticsQueryDto]),
    __metadata("design:returntype", Promise)
], AdminAnalyticsController.prototype, "getOverview", null);
__decorate([
    Get('traffic'),
    Permissions('reports'),
    ApiOperation({ summary: 'Get traffic acquisition timeline, top referrers, and landing pages' }),
    ApiResponse({ status: 200, description: 'Traffic breakdown retrieved' }),
    __param(0, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [AnalyticsQueryDto]),
    __metadata("design:returntype", Promise)
], AdminAnalyticsController.prototype, "getTraffic", null);
__decorate([
    Get('events'),
    Permissions('reports'),
    ApiOperation({ summary: 'Get paginated raw e-commerce events' }),
    ApiResponse({ status: 200, description: 'Event stream retrieved' }),
    __param(0, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [AnalyticsQueryDto]),
    __metadata("design:returntype", Promise)
], AdminAnalyticsController.prototype, "getEvents", null);
__decorate([
    Get('products'),
    Permissions('reports'),
    ApiOperation({ summary: 'Get product views, conversions, sizes, colors, and low-converting interest' }),
    ApiResponse({ status: 200, description: 'Product analytics retrieved' }),
    __param(0, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [AnalyticsQueryDto]),
    __metadata("design:returntype", Promise)
], AdminAnalyticsController.prototype, "getProductAnalytics", null);
__decorate([
    Get('conversions'),
    Permissions('reports'),
    ApiOperation({ summary: 'Get e-commerce conversion funnel progression and drop-offs' }),
    ApiResponse({ status: 200, description: 'Conversion funnel retrieved' }),
    __param(0, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [AnalyticsQueryDto]),
    __metadata("design:returntype", Promise)
], AdminAnalyticsController.prototype, "getConversions", null);
__decorate([
    Get('funnel'),
    Permissions('reports'),
    ApiOperation({ summary: 'Get e-commerce conversion funnel progression and drop-offs' }),
    ApiResponse({ status: 200, description: 'Funnel analytics retrieved' }),
    __param(0, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [AnalyticsQueryDto]),
    __metadata("design:returntype", Promise)
], AdminAnalyticsController.prototype, "getFunnel", null);
__decorate([
    Get('carts'),
    Permissions('reports'),
    ApiOperation({ summary: 'Get cart addition vs removal metrics and cart abandonment rates' }),
    ApiResponse({ status: 200, description: 'Cart analytics retrieved' }),
    __param(0, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [AnalyticsQueryDto]),
    __metadata("design:returntype", Promise)
], AdminAnalyticsController.prototype, "getCarts", null);
__decorate([
    Get('sessions'),
    Permissions('reports'),
    ApiOperation({ summary: 'Get paginated visitor sessions with duration and referral sources' }),
    ApiResponse({ status: 200, description: 'Visitor sessions retrieved' }),
    __param(0, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [AnalyticsQueryDto]),
    __metadata("design:returntype", Promise)
], AdminAnalyticsController.prototype, "getSessions", null);
__decorate([
    Get('top-pages'),
    Permissions('reports'),
    ApiOperation({ summary: 'Get most visited storefront pages and average engagement duration' }),
    ApiResponse({ status: 200, description: 'Top page paths retrieved' }),
    __param(0, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [AnalyticsQueryDto]),
    __metadata("design:returntype", Promise)
], AdminAnalyticsController.prototype, "getTopPages", null);
__decorate([
    Get('searches'),
    Permissions('reports'),
    ApiOperation({ summary: 'Get customer product search queries and frequencies' }),
    ApiResponse({ status: 200, description: 'Search term analytics retrieved' }),
    __param(0, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [AnalyticsQueryDto]),
    __metadata("design:returntype", Promise)
], AdminAnalyticsController.prototype, "getSearches", null);
__decorate([
    Get('devices'),
    Permissions('reports'),
    ApiOperation({ summary: 'Get device category breakdown (Mobile, Desktop, Tablet)' }),
    ApiResponse({ status: 200, description: 'Device metrics retrieved' }),
    __param(0, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [AnalyticsQueryDto]),
    __metadata("design:returntype", Promise)
], AdminAnalyticsController.prototype, "getDevices", null);
__decorate([
    Get('customers/:customerId/activity'),
    Permissions('customers'),
    ApiOperation({ summary: 'Get authorized browsing and purchase activity timeline for a customer' }),
    ApiResponse({ status: 200, description: 'Customer activity timeline retrieved' }),
    __param(0, Param('customerId')),
    __param(1, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, AnalyticsQueryDto]),
    __metadata("design:returntype", Promise)
], AdminAnalyticsController.prototype, "getCustomerActivity", null);
__decorate([
    Post('retention/cleanup'),
    Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN),
    ApiOperation({ summary: 'Execute data retention purge for raw events and inactive sessions' }),
    ApiResponse({ status: 200, description: 'Retention purge executed' }),
    __param(0, Body('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AdminAnalyticsController.prototype, "cleanupRetention", null);
AdminAnalyticsController = __decorate([
    ApiTags('Admin Analytics'),
    ApiBearerAuth('bearer'),
    Controller(['admin/analytics', 'analytics/admin']),
    UseGuards(JwtAuthGuard, RolesGuard),
    Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
    __metadata("design:paramtypes", [AnalyticsService])
], AdminAnalyticsController);
export { AdminAnalyticsController };
//# sourceMappingURL=admin-analytics.controller.js.map