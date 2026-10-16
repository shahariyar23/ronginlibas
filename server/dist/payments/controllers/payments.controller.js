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
import { Body, Controller, Get, Param, Post, Query, Req, Res, UseGuards, } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { PaymentsService } from '../services/payments.service.js';
import { UddoktaPaymentService } from '../services/uddokta-payment.service.js';
import { Public } from '../../common/decorators/public.decorator.js';
import { CreatePaymentDto } from '../dto/payment-request.dto.js';
import { VerifyPaymentDto, VerifyUddoktaPaymentDto } from '../dto/verify-payment.dto.js';
import { InitiateUddoktaPaymentDto } from '../dto/initiate-uddokta-payment.dto.js';
import { UddoktaWebhookPayloadDto } from '../dto/payment-webhook.dto.js';
import { OptionalCustomerAuthGuard } from '../../auth/guards/optional-customer-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
let PaymentsController = class PaymentsController {
    paymentsService;
    uddoktaService;
    configService;
    constructor(paymentsService, uddoktaService, configService) {
        this.paymentsService = paymentsService;
        this.uddoktaService = uddoktaService;
        this.configService = configService;
    }
    async getMethods() {
        const data = await this.paymentsService.getAvailableMethods();
        return {
            message: 'Payment methods retrieved successfully',
            data,
        };
    }
    async initiateUddokta(dto, requester) {
        const data = await this.uddoktaService.initiatePayment(dto, requester);
        return {
            success: true,
            message: 'UddoktaPay checkout session created successfully',
            data,
        };
    }
    async verifyUddokta(dto) {
        const data = await this.uddoktaService.verifyPayment(dto.invoiceId, dto.orderId);
        return {
            success: true,
            message: data.message,
            data,
        };
    }
    async uddoktaWebhook(req, body) {
        const result = await this.uddoktaService.processWebhook(req.headers, body);
        return {
            success: true,
            message: result.message,
            idempotent: result.idempotent,
        };
    }
    async uddoktaRedirect(queryInvoiceId, queryOrderId, bodyInvoiceId, bodyOrderId, res) {
        const invoiceId = queryInvoiceId || bodyInvoiceId;
        const orderId = queryOrderId || bodyOrderId;
        const frontendUrl = this.configService.get('FRONTEND_URL') ||
            this.configService.get('WEB_FRONTEND_URL') ||
            'http://localhost:3000';
        let resolvedOrderId = orderId;
        if (invoiceId && orderId) {
            try {
                await this.uddoktaService.recordInvoiceIdIfPending(orderId, invoiceId);
            }
            catch {
            }
        }
        if (invoiceId) {
            try {
                const verifyRes = await this.uddoktaService.verifyPayment(invoiceId, orderId);
                if (verifyRes.orderNumber) {
                    resolvedOrderId = verifyRes.orderNumber;
                }
            }
            catch {
            }
        }
        const redirectUrl = `${frontendUrl.replace(/\/+$/, '')}/payment/result?orderId=${encodeURIComponent(resolvedOrderId || orderId || '')}${invoiceId ? `&invoice_id=${encodeURIComponent(invoiceId)}` : ''}`;
        return res ? res.redirect(redirectUrl) : { redirectUrl };
    }
    async triggerReconciliation() {
        const result = await this.uddoktaService.reconcilePendingPayments();
        return {
            success: true,
            message: `Reconciliation sweep finished: ${result.checked} checked, ${result.settled} settled, ${result.failed} failed.`,
            data: result,
        };
    }
    async refundUddokta(invoiceId, amount, reason) {
        const result = await this.uddoktaService.refundPayment(invoiceId, amount, reason);
        return {
            success: true,
            message: result.message,
            data: result.data,
        };
    }
    async uddoktaCancelRedirect(orderId, res) {
        const frontendUrl = this.configService.get('FRONTEND_URL') ||
            this.configService.get('WEB_FRONTEND_URL') ||
            'http://localhost:3000';
        if (orderId) {
            try {
                await this.uddoktaService.handleFailedPayment(orderId, 'Payment cancelled by customer at UddoktaPay checkout');
            }
            catch {
            }
        }
        const redirectUrl = `${frontendUrl.replace(/\/+$/, '')}/payment/result?orderId=${encodeURIComponent(orderId || '')}&status=cancelled`;
        return res ? res.redirect(redirectUrl) : { redirectUrl };
    }
    async cancelUddoktaPayment(orderId, _requester) {
        if (!orderId) {
            return { success: false, message: 'orderId is required' };
        }
        const result = await this.uddoktaService.handleFailedPayment(orderId, 'Payment cancelled by customer at checkout / result page');
        return {
            success: true,
            message: result.message,
        };
    }
    async getPaymentStatus(orderId, requester, phone, trackingToken) {
        const data = await this.paymentsService.getPaymentStatus(orderId, requester, phone, trackingToken);
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
    async verify(dto) {
        if (dto.invoiceId) {
            const data = await this.uddoktaService.verifyPayment(dto.invoiceId, dto.orderId);
            return {
                message: data.message,
                data,
            };
        }
        return {
            message: 'Payment verification requested',
            data: await this.paymentsService.verifyPayment(),
        };
    }
    async webhook(provider, req, body) {
        const cleanProvider = (provider || '').trim().toLowerCase();
        if (cleanProvider === 'uddoktapay') {
            const result = await this.uddoktaService.processWebhook(req.headers, body);
            return {
                success: true,
                message: result.message,
                idempotent: result.idempotent,
            };
        }
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
    Post('uddoktapay/initiate'),
    UseGuards(OptionalCustomerAuthGuard),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Initiate UddoktaPay hosted payment session for an order' }),
    __param(0, Body()),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [InitiateUddoktaPaymentDto, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "initiateUddokta", null);
__decorate([
    Post('uddoktapay/verify'),
    ApiOperation({ summary: 'Verify UddoktaPay payment server-side via invoice ID' }),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [VerifyUddoktaPaymentDto]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "verifyUddokta", null);
__decorate([
    Post('uddoktapay/webhook'),
    ApiOperation({ summary: 'Receive and verify official UddoktaPay IPN webhook' }),
    __param(0, Req()),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, UddoktaWebhookPayloadDto]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "uddoktaWebhook", null);
__decorate([
    Get('uddoktapay/redirect'),
    Post('uddoktapay/redirect'),
    ApiOperation({ summary: 'Handle customer return redirect from UddoktaPay hosted checkout (GET or POST)' }),
    __param(0, Query('invoice_id')),
    __param(1, Query('order_id')),
    __param(2, Body('invoice_id')),
    __param(3, Body('order_id')),
    __param(4, Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "uddoktaRedirect", null);
__decorate([
    Post('uddoktapay/reconcile'),
    ApiOperation({ summary: 'Trigger background auto-reconciliation of pending UddoktaPay payments' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "triggerReconciliation", null);
__decorate([
    Post('uddoktapay/refund'),
    UseGuards(OptionalCustomerAuthGuard),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Process full or partial refund via UddoktaPay gateway' }),
    __param(0, Body('invoiceId')),
    __param(1, Body('amount')),
    __param(2, Body('reason')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "refundUddokta", null);
__decorate([
    Get('uddoktapay/cancel'),
    ApiOperation({ summary: 'Handle customer cancellation redirect from UddoktaPay checkout' }),
    __param(0, Query('order_id')),
    __param(1, Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "uddoktaCancelRedirect", null);
__decorate([
    Post('uddoktapay/cancel'),
    UseGuards(OptionalCustomerAuthGuard),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Cancel/Delete an unpaid UddoktaPay order and restore inventory stock' }),
    __param(0, Body('orderId')),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "cancelUddoktaPayment", null);
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
    __param(1, Req()),
    __param(2, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "webhook", null);
PaymentsController = __decorate([
    ApiTags('Payments'),
    Public(),
    Controller('payments'),
    __metadata("design:paramtypes", [PaymentsService,
        UddoktaPaymentService,
        ConfigService])
], PaymentsController);
export { PaymentsController };
//# sourceMappingURL=payments.controller.js.map