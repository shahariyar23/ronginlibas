import { ConfigService } from '@nestjs/config';
import { OrderStatus, PaymentMethod, PaymentStatus } from '@prisma/client';
import { OrdersService } from '../../orders/services/orders.service.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { UddoktaPaymentService } from './uddokta-payment.service.js';
export interface PaymentGatewayProvider {
    initiatePayment(orderNumber: string, amount: number): Promise<{
        redirectUrl: string;
    }>;
    verifyPayment(transactionId: string): Promise<{
        verified: boolean;
    }>;
}
export interface PaymentStatusResponse {
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
export declare class PaymentsService {
    private readonly configService;
    private readonly ordersService;
    private readonly prisma;
    private readonly uddoktaService;
    constructor(configService: ConfigService, ordersService: OrdersService, prisma: PrismaService, uddoktaService: UddoktaPaymentService);
    getAvailableMethods(): Promise<({
        id: string;
        name: string;
        isEnabled: boolean;
        credentialsConfigured?: undefined;
    } | {
        id: string;
        name: string;
        isEnabled: boolean;
        credentialsConfigured: boolean;
    })[]>;
    createPayment(orderNumber: string, provider: 'BKASH' | 'NAGAD' | 'CARD', customerId?: string, phone?: string, trackingToken?: string): Promise<void>;
    verifyPayment(): Promise<void>;
    handleWebhook(): Promise<void>;
    getPaymentStatus(orderId: string, requester?: {
        id?: string;
        role?: string;
        type?: string;
    } | string, phone?: string, trackingToken?: string): Promise<PaymentStatusResponse>;
}
