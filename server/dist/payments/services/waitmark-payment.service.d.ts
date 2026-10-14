import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service.js';
import { OrdersService } from '../../orders/services/orders.service.js';
import { Ga4MeasurementProtocolService } from '../../analytics/services/ga4-measurement-protocol.service.js';
import { OrderStatus, PaymentStatus, PaymentMethod } from '@prisma/client';
import type { InitiateWaitmarkPaymentDto } from '../dto/initiate-waitmark-payment.dto.js';
export interface WaitmarkInitiateResponse {
    checkoutUrl: string;
    paymentAttemptId: string;
    orderId: string;
    orderNumber: string;
    amount: number;
    currency: string;
}
export interface WaitmarkStatusResponse {
    orderId: string;
    orderNumber: string;
    paymentStatus: PaymentStatus;
    orderStatus: OrderStatus;
    totalAmount: number;
    paidAmount: number;
    paymentReference: string | null;
    paymentMethod: PaymentMethod;
    payments: Array<{
        id: string;
        provider: string;
        providerOrderId: string;
        providerTransactionId: string | null;
        amount: number;
        currency: string;
        status: PaymentStatus;
        failureReason: string | null;
        paidAt: Date | null;
        createdAt: Date;
    }>;
}
export declare class WaitmarkPaymentService {
    private readonly prisma;
    private readonly configService;
    private readonly ordersService?;
    private readonly ga4Service?;
    private readonly logger;
    constructor(prisma: PrismaService, configService: ConfigService, ordersService?: OrdersService | undefined, ga4Service?: Ga4MeasurementProtocolService | undefined);
    getPublicKey(): string | undefined;
    getSecretKey(): string | undefined;
    getCheckoutUrl(): string;
    getSuccessUrl(): string;
    isConfigured(): boolean;
    initiatePayment(dto: InitiateWaitmarkPaymentDto, requester?: {
        id?: string;
        role?: string;
        type?: string;
    } | string): Promise<WaitmarkInitiateResponse>;
    handleFailedPayment(orderId: string, reason?: string, existingOrder?: any): Promise<{
        success: boolean;
        message: string;
    }>;
    processWebhook(rawBody: Buffer | string, signatureHeader?: string): Promise<{
        success: boolean;
        message: string;
        idempotent?: boolean;
    }>;
    getPaymentStatus(orderId: string, requester?: {
        id?: string;
        role?: string;
        type?: string;
    } | string, phone?: string, trackingToken?: string): Promise<WaitmarkStatusResponse>;
}
