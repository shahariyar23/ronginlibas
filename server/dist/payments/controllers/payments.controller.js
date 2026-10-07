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
import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from '../services/payments.service.js';
import { Public } from '../../common/decorators/public.decorator.js';
import { CreatePaymentDto, VerifyPaymentDto } from '../dto/payment-request.dto.js';
import { OptionalCustomerAuthGuard } from '../../auth/guards/optional-customer-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
let PaymentsController = class PaymentsController {
    paymentsService;
    constructor(paymentsService) {
        this.paymentsService = paymentsService;
    }
    async getMethods() {
        const data = await this.paymentsService.getAvailableMethods();
        return {
            message: 'Payment methods retrieved successfully',
            data,
        };
    }
    async create(dto, customerId) {
        return {
            message: 'Payment session requested',
            data: await this.paymentsService.createPayment(dto.orderNumber, dto.provider, customerId, dto.phone, dto.trackingToken),
        };
    }
    async verify(_dto) {
        return {
            message: 'Payment verification requested',
            data: await this.paymentsService.verifyPayment(),
        };
    }
    async webhook(_provider, _body) {
        return {
            message: 'Payment webhook received',
            data: await this.paymentsService.handleWebhook(),
        };
    }
};
__decorate([
    Get('methods'),
    ApiOperation({ summary: 'List available regional payment gateways' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getMethods", null);
__decorate([
    Post('create'),
    UseGuards(OptionalCustomerAuthGuard),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Request an online payment session for an owned order' }),
    __param(0, Body()),
    __param(1, CurrentUser('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreatePaymentDto, String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "create", null);
__decorate([
    Post('verify'),
    ApiOperation({ summary: 'Verify a payment through its configured gateway provider' }),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [VerifyPaymentDto]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "verify", null);
__decorate([
    Post('webhook/:provider'),
    ApiOperation({ summary: 'Receive a signed gateway payment webhook' }),
    __param(0, Param('provider')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "webhook", null);
PaymentsController = __decorate([
    ApiTags('Payments'),
    Public(),
    Controller('payments'),
    __metadata("design:paramtypes", [PaymentsService])
], PaymentsController);
export { PaymentsController };
//# sourceMappingURL=payments.controller.js.map