import type { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { PaymentsService } from '../services/payments.service.js';
import { WaitmarkPaymentService } from '../services/waitmark-payment.service.js';
import { CreatePaymentDto, VerifyPaymentDto } from '../dto/payment-request.dto.js';
import { InitiateWaitmarkPaymentDto } from '../dto/initiate-waitmark-payment.dto.js';
export declare class PaymentsController {
    private readonly paymentsService;
    private readonly waitmarkService;
    private readonly configService;
    constructor(paymentsService: PaymentsService, waitmarkService: WaitmarkPaymentService, configService: ConfigService);
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
    waitmarkRedirect(orderId?: string, trxId?: string, res?: Response): Promise<void | {
        redirectUrl: string;
    }>;
    getPaymentStatus(orderId: string, requester?: any, phone?: string, trackingToken?: string): Promise<{
        success: boolean;
        data: import("../services/waitmark-payment.service.js").WaitmarkStatusResponse;
    }>;
    create(dto: CreatePaymentDto, customerId?: string): Promise<{
        message: string;
        data: void;
    }>;
    verify(_dto: VerifyPaymentDto): Promise<{
        message: string;
        data: void;
    }>;
    webhook(_provider: string, _body: unknown): Promise<{
        message: string;
        data: void;
    }>;
}
