import type { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { PaymentsService } from '../services/payments.service.js';
import { WaitmarkPaymentService } from '../services/waitmark-payment.service.js';
import { UddoktaPaymentService } from '../services/uddokta-payment.service.js';
import { CreatePaymentDto } from '../dto/payment-request.dto.js';
import { VerifyPaymentDto, VerifyUddoktaPaymentDto } from '../dto/verify-payment.dto.js';
import { InitiateWaitmarkPaymentDto } from '../dto/initiate-waitmark-payment.dto.js';
import { InitiateUddoktaPaymentDto } from '../dto/initiate-uddokta-payment.dto.js';
import { UddoktaWebhookPayloadDto } from '../dto/payment-webhook.dto.js';
export declare class PaymentsController {
    private readonly paymentsService;
    private readonly waitmarkService;
    private readonly uddoktaService;
    private readonly configService;
    constructor(paymentsService: PaymentsService, waitmarkService: WaitmarkPaymentService, uddoktaService: UddoktaPaymentService, configService: ConfigService);
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
    uddoktaRedirect(invoiceId?: string, orderId?: string, res?: Response): Promise<void | {
        redirectUrl: string;
    }>;
    uddoktaCancelRedirect(orderId?: string, res?: Response): Promise<void | {
        redirectUrl: string;
    }>;
    cancelUddoktaPayment(orderId: string, _requester?: any): Promise<{
        success: boolean;
        message: string;
    }>;
    initiateWaitmark(dto: InitiateWaitmarkPaymentDto, requester?: any): Promise<{
        success: boolean;
        message: string;
        data: import("../services/waitmark-payment.service.js").WaitmarkInitiateResponse;
    }>;
    waitmarkWebhook(req: Request, sigHeader?: string, sigHeaderUpper?: string, body?: unknown): Promise<{
        success: boolean;
        message: string;
        idempotent: boolean | undefined;
    }>;
    waitmarkRedirect(orderId?: string, trxId?: string, status?: string, res?: Response): Promise<void | {
        redirectUrl: string;
    }>;
    cancelWaitmarkPayment(orderId: string, _requester?: any): Promise<{
        success: boolean;
        message: string;
    }>;
    getPaymentStatus(orderId: string, requester?: any, phone?: string, trackingToken?: string): Promise<{
        success: boolean;
        data: import("../services/waitmark-payment.service.js").WaitmarkStatusResponse;
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
