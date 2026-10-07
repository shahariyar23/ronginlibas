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
import { Body, Controller, Delete, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Public } from '../common/decorators/public.decorator.js';
import { NewsletterEmailDto } from './dto/newsletter-email.dto.js';
import { NewsletterService } from './newsletter.service.js';
let NewsletterController = class NewsletterController {
    newsletterService;
    constructor(newsletterService) {
        this.newsletterService = newsletterService;
    }
    async subscribe(dto) {
        return {
            message: 'Subscription saved successfully',
            data: await this.newsletterService.subscribe(dto.email),
        };
    }
    async unsubscribe(dto) {
        return {
            message: 'Unsubscribe request processed successfully',
            data: await this.newsletterService.unsubscribe(dto.email),
        };
    }
};
__decorate([
    Post('subscribe'),
    Throttle({ default: { limit: 5, ttl: 60_000 } }),
    ApiOperation({ summary: 'Subscribe an email address to store announcements' }),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [NewsletterEmailDto]),
    __metadata("design:returntype", Promise)
], NewsletterController.prototype, "subscribe", null);
__decorate([
    Delete('unsubscribe'),
    Throttle({ default: { limit: 5, ttl: 60_000 } }),
    ApiOperation({ summary: 'Unsubscribe an email address from store announcements' }),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [NewsletterEmailDto]),
    __metadata("design:returntype", Promise)
], NewsletterController.prototype, "unsubscribe", null);
NewsletterController = __decorate([
    ApiTags('Newsletter'),
    Public(),
    Controller('newsletter'),
    __metadata("design:paramtypes", [NewsletterService])
], NewsletterController);
export { NewsletterController };
//# sourceMappingURL=newsletter.controller.js.map