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
import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Res, UseGuards, } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AnalyticsService } from '../services/analytics.service.js';
import { TrackEventsBatchDto, UpdateConsentDto, } from '../dto/track-event.dto.js';
import { OptionalCustomerAuthGuard } from '../../auth/guards/optional-customer-auth.guard.js';
let AnalyticsController = class AnalyticsController {
    analyticsService;
    constructor(analyticsService) {
        this.analyticsService = analyticsService;
    }
    async trackEvents(dto, req, res) {
        const customerId = req.user?.type === 'customer' ? req.user.id : undefined;
        return this.analyticsService.trackEvents(dto, req, res, customerId);
    }
    async updateConsent(dto, req, res) {
        const customerId = req.user?.type === 'customer' ? req.user.id : undefined;
        return this.analyticsService.updateConsent(dto, req, res, customerId);
    }
    async identify(req, res) {
        const customerId = req.user?.type === 'customer' ? req.user.id : undefined;
        return this.analyticsService.identify(req, res, customerId);
    }
    async getVisitorStatus(req, res) {
        const customerId = req.user?.type === 'customer' ? req.user.id : undefined;
        return this.analyticsService.getVisitorStatus(req, res, customerId);
    }
};
__decorate([
    Post('events'),
    HttpCode(HttpStatus.OK),
    UseGuards(OptionalCustomerAuthGuard),
    ApiOperation({ summary: 'Ingest client-side e-commerce behavior tracking events' }),
    ApiResponse({ status: 200, description: 'Events accepted or processed according to consent' }),
    __param(0, Body()),
    __param(1, Req()),
    __param(2, Res({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [TrackEventsBatchDto, Object, Object]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "trackEvents", null);
__decorate([
    Post('consent'),
    HttpCode(HttpStatus.OK),
    UseGuards(OptionalCustomerAuthGuard),
    ApiOperation({ summary: 'Update visitor analytics and marketing consent preferences' }),
    ApiResponse({ status: 200, description: 'Consent recorded successfully' }),
    __param(0, Body()),
    __param(1, Req()),
    __param(2, Res({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [UpdateConsentDto, Object, Object]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "updateConsent", null);
__decorate([
    Post('identify'),
    HttpCode(HttpStatus.OK),
    UseGuards(OptionalCustomerAuthGuard),
    ApiOperation({ summary: 'Associate anonymous visitor profile with authenticated customer account' }),
    ApiResponse({ status: 200, description: 'Visitor linked successfully' }),
    __param(0, Req()),
    __param(1, Res({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "identify", null);
__decorate([
    Get('visitor'),
    UseGuards(OptionalCustomerAuthGuard),
    ApiOperation({ summary: 'Resolve current visitor identity token and consent status' }),
    ApiResponse({ status: 200, description: 'Visitor context details' }),
    __param(0, Req()),
    __param(1, Res({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getVisitorStatus", null);
AnalyticsController = __decorate([
    ApiTags('Analytics'),
    Controller('analytics'),
    __metadata("design:paramtypes", [AnalyticsService])
], AnalyticsController);
export { AnalyticsController };
//# sourceMappingURL=analytics.controller.js.map