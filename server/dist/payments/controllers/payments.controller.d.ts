import type { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { PaymentsService } from '../services/payments.service.js';
import { UddoktaPaymentService } from '../services/uddokta-payment.service.js';
import { CreatePaymentDto } from '../dto/payment-request.dto.js';
import { VerifyPaymentDto, VerifyUddoktaPaymentDto } from '../dto/verify-payment.dto.js';
import { InitiateUddoktaPaymentDto } from '../dto/initiate-uddokta-payment.dto.js';
import { UddoktaWebhookPayloadDto } from '../dto/payment-webhook.dto.js';
export declare class PaymentsController {
    private readonly paymentsService;
    private readonly uddoktaService;
    private readonly configService;
    constructor(paymentsService: PaymentsService, uddoktaService: UddoktaPaymentService, configService: ConfigService);
    getMethods(): Promise<{
        message: string;
        data: ({
            id: string;
            name: string;
            isEnabled: boolean;
            credentialsConfigured?: undefined;
        } | {
            id: string;
            name: string;
            isEnabled: boolean;
            credentialsConfigured: boolean;
        })[];
    }>;
    initiateUddokta(dto: InitiateUddoktaPaymentDto, requester?: any): Promise<{
        success: boolean;
        message: string;
        data: import("../services/uddokta-payment.service.js").UddoktaInitiateResponse;
    }>;
    verifyUddokta(dto: VerifyUddoktaPaymentDto): Promise<{
        success: boolean;
        message: string;
        data: import("../services/uddokta-payment.service.js").UddoktaVerifyResponse;
    }>;
    uddoktaWebhook(req: Request, body: UddoktaWebhookPayloadDto): Promise<{
        success: boolean;
        message: string;
        idempotent: boolean | undefined;
    }>;
    uddoktaRedirect(queryInvoiceId?: string, queryOrderId?: string, bodyInvoiceId?: string, bodyOrderId?: string, res?: Response): Promise<void | {
        redirectUrl: string;
    }>;
    triggerReconciliation(): Promise<{
        success: boolean;
        message: string;
        data: {
            checked: number;
            settled: number;
            failed: number;
        };
    }>;
    refundUddokta(invoiceId: string, amount?: number, reason?: string): Promise<{
        success: boolean;
        message: string;
        data: any;
    }>;
    uddoktaCancelRedirect(orderId?: string, res?: Response): Promise<void | {
        redirectUrl: string;
    }>;
    cancelUddoktaPayment(orderId: string, _requester?: any): Promise<{
        success: boolean;
        message: string;
    }>;
    getPaymentStatus(orderId: string, requester?: any, phone?: string, trackingToken?: string): Promise<{
        success: boolean;
        data: import("../services/payments.service.js").PaymentStatusResponse;
    }>;
    create(dto: CreatePaymentDto, customerId?: string): Promise<{
        message: string;
        data: void;
    }>;
    verify(dto: VerifyPaymentDto): Promise<{
        message: string;
        data: import("../services/uddokta-payment.service.js").UddoktaVerifyResponse;
    } | {
        message: string;
        data: void;
    }>;
    webhook(provider: string, req: Request, body: any): Promise<{
        success: boolean;
        message: string;
        idempotent: boolean | undefined;
        data?: undefined;
    } | {
        message: string;
        data: void;
        success?: undefined;
        idempotent?: undefined;
    }>;
}
