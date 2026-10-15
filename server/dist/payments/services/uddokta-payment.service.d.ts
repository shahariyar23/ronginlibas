import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service.js';
import { OrdersService } from '../../orders/services/orders.service.js';
import { Ga4MeasurementProtocolService } from '../../analytics/services/ga4-measurement-protocol.service.js';
import { PaymentStatus } from '@prisma/client';
import type { InitiateUddoktaPaymentDto } from '../dto/initiate-uddokta-payment.dto.js';
import type { UddoktaWebhookPayloadDto } from '../dto/payment-webhook.dto.js';
export interface UddoktaInitiateResponse {
    checkoutUrl: string;
    paymentAttemptId: string;
    orderId: string;
    orderNumber: string;
    amount: number;
    currency: string;
}
export interface UddoktaVerifyResponse {
    success: boolean;
    message: string;
    isPaid: boolean;
    orderId: string;
    orderNumber: string;
    paymentStatus: PaymentStatus;
    amount: number;
    transactionId?: string | null;
    invoiceId?: string | null;
    paymentMethod?: string | null;
}
export declare class UddoktaPaymentService {
    private readonly prisma;
    private readonly configService;
    private readonly ordersService?;
    private readonly ga4Service?;
    private readonly logger;
    constructor(prisma: PrismaService, configService: ConfigService, ordersService?: OrdersService | undefined, ga4Service?: Ga4MeasurementProtocolService | undefined);
    getApiKey(): string | undefined;
    getBaseUrl(): string;
    getApiEndpoint(subPath: string): string;
    isConfigured(): boolean;
    getFrontendUrl(): string;
    getBackendPublicUrl(): string;
    initiatePayment(dto: InitiateUddoktaPaymentDto, requester?: {
        id?: string;
        role?: string;
        type?: string;
    } | string): Promise<UddoktaInitiateResponse>;
    verifyPayment(invoiceId: string, orderIdHint?: string): Promise<UddoktaVerifyResponse>;
    processWebhook(headers: Record<string, any>, payload: UddoktaWebhookPayloadDto): Promise<{
        success: boolean;
        message: string;
        idempotent?: boolean;
    }>;
    private applySuccessfulPayment;
    handleFailedPayment(orderId: string, reason?: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
