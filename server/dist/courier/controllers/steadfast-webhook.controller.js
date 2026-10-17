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
var SteadfastWebhookController_1;
import { Controller, Post, Body, Headers, HttpCode, HttpStatus, Logger, } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ShipmentService } from '../services/shipment.service.js';
import { SteadfastWebhookDto } from '../dto/steadfast-webhook.dto.js';
let SteadfastWebhookController = SteadfastWebhookController_1 = class SteadfastWebhookController {
    shipmentService;
    logger = new Logger(SteadfastWebhookController_1.name);
    constructor(shipmentService) {
        this.shipmentService = shipmentService;
    }
    async handleWebhook(payload, headers) {
        this.logger.log('[Steadfast Webhook Endpoint] Delivery status webhook received');
        return this.shipmentService.processWebhook(payload, headers);
    }
};
__decorate([
    Post(),
    HttpCode(HttpStatus.OK),
    ApiOperation({ summary: 'Receive asynchronous delivery status webhooks from Steadfast Courier' }),
    ApiResponse({ status: 200, description: 'Webhook acknowledged and processed successfully' }),
    __param(0, Body()),
    __param(1, Headers()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [SteadfastWebhookDto, Object]),
    __metadata("design:returntype", Promise)
], SteadfastWebhookController.prototype, "handleWebhook", null);
SteadfastWebhookController = SteadfastWebhookController_1 = __decorate([
    ApiTags('Webhooks - Steadfast Courier'),
    Controller('webhooks/steadfast'),
    __metadata("design:paramtypes", [ShipmentService])
], SteadfastWebhookController);
export { SteadfastWebhookController };
//# sourceMappingURL=steadfast-webhook.controller.js.map