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
import { Body, Controller, Get, Headers, Param, Post, Query, Req, Res, UseGuards, } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { PaymentsService } from '../services/payments.service.js';
import { WaitmarkPaymentService } from '../services/waitmark-payment.service.js';
import { Public } from '../../common/decorators/public.decorator.js';
import { CreatePaymentDto, VerifyPaymentDto } from '../dto/payment-request.dto.js';
import { InitiateWaitmarkPaymentDto } from '../dto/initiate-waitmark-payment.dto.js';
import { OptionalCustomerAuthGuard } from '../../auth/guards/optional-customer-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
let PaymentsController = class PaymentsController {
    paymentsService;
    waitmarkService;
    configService;
    constructor(paymentsService, waitmarkService, configService) {
        this.paymentsService = paymentsService;
        this.waitmarkService = waitmarkService;
        this.configService = configService;
    }
    async getMethods() {
        const data = await this.paymentsService.getAvailableMethods();
        return {
            message: 'Payment methods retrieved successfully',
            data,
        };
    }
    async initiateWaitmark(dto, requester) {
        const data = await this.waitmarkService.initiatePayment(dto, requester);
        return {
            success: true,
            message: 'Waitmark Pay checkout session created successfully',
            data,
        };
    }
    async waitmarkWebhook(req, sigHeader, sigHeaderUpper, body) {
        const signature = sigHeader || sigHeaderUpper;
        const rawBody = req.rawBody ||
            (typeof body === 'string' ? Buffer.from(body) : Buffer.from(JSON.stringify(body || '')));
        const result = await this.waitmarkService.processWebhook(rawBody, signature);
        return {
            success: true,
            message: result.message,
            idempotent: result.idempotent,
        };
    }
    async waitmarkRedirect(orderId, trxId, status, res) {
        const frontendUrl = this.configService.get('WEB_FRONTEND_URL') || 'http://localhost:3000';
        const cleanStatus = status?.trim().toLowerCase();
        const isExplicitFailure = cleanStatus &&
            ['failed', 'cancelled', 'cancel', 'declined', 'rejected', 'expired', 'error'].includes(cleanStatus);
        if (orderId && isExplicitFailure) {
            try {
                await this.waitmarkService.handleFailedPayment(orderId, `Gateway browser redirect reported status: ${status}`);
            }
            catch (err) {
            }
        }
        const redirectUrl = `${frontendUrl.replace(/\/+$/, '')}/payment/result?orderId=${encodeURIComponent(orderId || '')}${trxId ? `&trx_id=${encodeURIComponent(trxId)}` : ''}${cleanStatus ? `&status=${encodeURIComponent(cleanStatus)}` : ''}`;
        return res ? res.redirect(redirectUrl) : { redirectUrl };
    }
    async cancelWaitmarkPayment(orderId, _requester) {
        if (!orderId) {
            return { success: false, message: 'orderId is required' };
        }
        const result = await this.waitmarkService.handleFailedPayment(orderId, 'Payment cancelled by customer at checkout / result page');
        return {
            success: true,
            message: result.message,
        };
    }
    async getPaymentStatus(orderId, requester, phone, trackingToken) {
        const data = await this.waitmarkService.getPaymentStatus(orderId, requester, phone, trackingToken);
        return {
            success: true,
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
    Post('waitmark/initiate'),
    UseGuards(OptionalCustomerAuthGuard),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Initiate Waitmark Pay online payment session for an order' }),
    __param(0, Body()),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [InitiateWaitmarkPaymentDto, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "initiateWaitmark", null);
__decorate([
    Post('waitmark/webhook'),
    ApiOperation({ summary: 'Receive and verify official Waitmark Pay HMAC webhook' }),
    __param(0, Req()),
    __param(1, Headers('x-waitmark-signature')),
    __param(2, Headers('X-Waitmark-Signature')),
    __param(3, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "waitmarkWebhook", null);
__decorate([
    Get('waitmark/webhook'),
    ApiOperation({ summary: 'Handle potential browser redirect from Waitmark Pay' }),
    __param(0, Query('order_id')),
    __param(1, Query('trx_id')),
    __param(2, Query('status')),
    __param(3, Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "waitmarkRedirect", null);
__decorate([
    Post('waitmark/cancel'),
    UseGuards(OptionalCustomerAuthGuard),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Cancel/Delete an unpaid Waitmark Pay order and restore inventory stock' }),
    __param(0, Body('orderId')),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "cancelWaitmarkPayment", null);
__decorate([
    Get('status/:orderId'),
    UseGuards(OptionalCustomerAuthGuard),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Retrieve verified payment status and transaction history' }),
    __param(0, Param('orderId')),
    __param(1, CurrentUser()),
    __param(2, Query('phone')),
    __param(3, Query('trackingToken')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String, String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getPaymentStatus", null);
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
    __metadata("design:paramtypes", [PaymentsService,
        WaitmarkPaymentService,
        ConfigService])
], PaymentsController);
export { PaymentsController };
//# sourceMappingURL=payments.controller.js.map