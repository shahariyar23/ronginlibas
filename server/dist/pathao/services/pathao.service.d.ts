import { PrismaService } from '../../prisma/prisma.service.js';
import { PathaoAuthService } from './pathao-auth.service.js';
import type { PathaoCity, PathaoZone, PathaoArea, PathaoStore, PathaoPricePlanResponse, PathaoCreateOrderResponse, PathaoOrderInfoResponse, PathaoConnectionTestResult, PathaoStatusResponse } from '../pathao.types.js';
import { CourierStatus } from '../status/courier-status.types.js';
import type { CalculatePriceDto } from '../dto/calculate-price.dto.js';
import type { CreateSandboxOrderDto } from '../dto/create-sandbox-order.dto.js';
import type { CreateParcelDto } from '../dto/create-parcel.dto.js';
import type { AdminAuditActor } from '../../audit/audit.service.js';
export declare class PathaoService {
    private readonly prisma;
    private readonly authService;
    private readonly logger;
    private cachedCities;
    private cachedCitiesExpiry;
    private readonly cachedZones;
    private readonly cachedAreas;
    constructor(prisma: PrismaService, authService: PathaoAuthService);
    private request;
    private getSimulatedResponse;
    testConnection(): Promise<PathaoConnectionTestResult>;
    getStatus(): Promise<PathaoStatusResponse>;
    getCities(): Promise<PathaoCity[]>;
    getZones(cityId: number): Promise<PathaoZone[]>;
    getAreas(zoneId: number): Promise<PathaoArea[]>;
    getStores(): Promise<PathaoStore[]>;
    calculatePrice(dto: CalculatePriceDto): Promise<PathaoPricePlanResponse>;
    createSandboxOrder(dto: CreateSandboxOrderDto): Promise<PathaoCreateOrderResponse>;
    createParcelFromOrder(orderId: string, options?: CreateParcelDto, actor?: AdminAuditActor): Promise<{
        order: any;
        parcel: PathaoCreateOrderResponse;
    }>;
    trackOrder(consignmentId: string): Promise<PathaoOrderInfoResponse>;
    refreshOrderStatus(orderId: string): Promise<{
        orderId: string;
        orderNumber: string;
        courierConsignmentId: string;
        courierStatus: CourierStatus;
        courierStatusRaw: string;
        lastSyncedAt: string;
        trackingInfo: PathaoOrderInfoResponse;
    }>;
    processWebhook(payload: Record<string, unknown>): Promise<{
        success: boolean;
        message: string;
        orderId?: string;
        orderNumber?: string;
        consignmentId?: string;
        courierStatus?: CourierStatus;
        courierStatusRaw?: string;
    }>;
}
