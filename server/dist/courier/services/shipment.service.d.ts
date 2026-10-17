import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service.js';
import { InvoicesService } from '../../orders/services/invoices.service.js';
import type { CourierBalanceResult, CourierHealthResult, CourierProvider, CourierReturnResult, ShipmentStatusResult } from '../interfaces/courier-provider.interface.js';
import { CreateShipmentDto } from '../dto/create-shipment.dto.js';
import { CreateReturnRequestDto } from '../dto/create-return-request.dto.js';
import { SteadfastWebhookDto } from '../dto/steadfast-webhook.dto.js';
import { ShipmentEvent, ShipmentStatus } from '@prisma/client';
import type { AdminAuditActor } from '../../audit/audit.service.js';
export interface NormalizedShipmentDetails {
    id: string;
    orderId: string;
    orderNumber: string;
    provider: string;
    consignmentId: string | null;
    trackingCode: string | null;
    providerInvoice: string | null;
    status: ShipmentStatus;
    providerStatus: string | null;
    customerSafeStatus: string;
    codAmount: number;
    deliveryCharge: number;
    trackingUrl: string | null;
    recipientName: string | null;
    recipientPhone: string | null;
    recipientAddress: string | null;
    note: string | null;
    lastSyncedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    events?: ShipmentEvent[];
}
export declare class ShipmentService {
    private readonly prisma;
    private readonly configService;
    private readonly invoicesService;
    private readonly courierProvider;
    private readonly logger;
    constructor(prisma: PrismaService, configService: ConfigService, invoicesService: InvoicesService, courierProvider: CourierProvider);
    getProviderInfo(): {
        provider: string;
        mode: string;
    };
    healthCheck(): Promise<CourierHealthResult>;
    getBalance(): Promise<CourierBalanceResult>;
    createShipmentForOrder(orderId: string, dto?: CreateShipmentDto, actor?: AdminAuditActor): Promise<NormalizedShipmentDetails>;
    getShipmentByOrderId(orderId: string): Promise<NormalizedShipmentDetails | null>;
    refreshShipmentStatus(orderId: string, actor?: AdminAuditActor): Promise<NormalizedShipmentDetails>;
    getStatusByConsignmentId(cid: string): Promise<ShipmentStatusResult>;
    getStatusByInvoice(invoice: string): Promise<ShipmentStatusResult>;
    getStatusByTrackingCode(trackingCode: string): Promise<ShipmentStatusResult>;
    createReturnRequest(orderId: string, dto?: CreateReturnRequestDto, actor?: AdminAuditActor): Promise<CourierReturnResult>;
    processWebhook(payload: SteadfastWebhookDto, headers: Record<string, string | string[] | undefined>): Promise<{
        success: boolean;
        message: string;
    }>;
    private mapToNormalizedDetails;
}
