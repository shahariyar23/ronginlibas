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
var PathaoWebhookController_1;
import { Controller, Post, Get, Body, HttpCode, HttpStatus, Logger, } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PathaoService } from '../services/pathao.service.js';
let PathaoWebhookController = PathaoWebhookController_1 = class PathaoWebhookController {
    pathaoService;
    logger = new Logger(PathaoWebhookController_1.name);
    constructor(pathaoService) {
        this.pathaoService = pathaoService;
    }
    healthCheck() {
        return {
            success: true,
            provider: 'Pathao',
            service: 'Rongin Libas Webhook Receiver',
            timestamp: new Date().toISOString(),
        };
    }
    async handleWebhook(payload) {
        this.logger.log(`[Pathao Webhook Inbound] Received payload for consignment: ${payload?.consignment_id || 'N/A'}, status: ${payload?.order_status || payload?.order_status_slug || 'N/A'}`);
        const result = await this.pathaoService.processWebhook(payload);
        return result;
    }
};
__decorate([
    Get(),
    ApiOperation({ summary: 'Pathao Webhook health / ping endpoint' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PathaoWebhookController.prototype, "healthCheck", null);
__decorate([
    Post(),
    HttpCode(HttpStatus.OK),
    ApiOperation({ summary: 'Receive live consignment status updates from Pathao Webhooks' }),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PathaoWebhookController.prototype, "handleWebhook", null);
PathaoWebhookController = PathaoWebhookController_1 = __decorate([
    ApiTags('Pathao Webhook'),
    Controller('pathao/webhook'),
    __metadata("design:paramtypes", [PathaoService])
], PathaoWebhookController);
export { PathaoWebhookController };
//# sourceMappingURL=pathao-webhook.controller.js.map