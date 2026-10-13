import { PathaoService } from '../services/pathao.service.js';
import { CalculatePriceDto } from '../dto/calculate-price.dto.js';
import { CreateSandboxOrderDto } from '../dto/create-sandbox-order.dto.js';
import { CreateParcelDto } from '../dto/create-parcel.dto.js';
import { AuditService, type AdminAuditActor } from '../../audit/audit.service.js';
export declare class AdminPathaoController {
    private readonly pathaoService;
    private readonly auditService;
    constructor(pathaoService: PathaoService, auditService: AuditService);
    testConnection(actor: AdminAuditActor): Promise<import("../pathao.types.js").PathaoConnectionTestResult>;
    getStatus(): Promise<{
        success: boolean;
        data: import("../pathao.types.js").PathaoStatusResponse;
    }>;
    getCities(): Promise<{
        success: boolean;
        data: import("../pathao.types.js").PathaoCity[];
    }>;
    getZones(cityId: number): Promise<{
        success: boolean;
        data: import("../pathao.types.js").PathaoZone[];
    }>;
    getAreas(zoneId: number): Promise<{
        success: boolean;
        data: import("../pathao.types.js").PathaoArea[];
    }>;
    getStores(): Promise<{
        success: boolean;
        data: import("../pathao.types.js").PathaoStore[];
    }>;
    calculatePrice(dto: CalculatePriceDto): Promise<{
        success: boolean;
        data: import("../pathao.types.js").PathaoPricePlanResponse;
    }>;
    createTestOrder(dto: CreateSandboxOrderDto, actor: AdminAuditActor): Promise<{
        success: boolean;
        message: string;
        data: import("../pathao.types.js").PathaoCreateOrderResponse;
    }>;
    createParcelFromOrder(orderId: string, options: CreateParcelDto, actor: AdminAuditActor): Promise<{
        success: boolean;
        message: string;
        data: {
            order: any;
            parcel: import("../pathao.types.js").PathaoCreateOrderResponse;
        };
    }>;
    trackOrder(orderId: string): Promise<{
        success: boolean;
        data: {
            orderId: string;
            orderNumber: string;
            courierConsignmentId: string;
            courierStatus: import("../pathao.types.js").CourierStatus;
            courierStatusRaw: string;
            lastSyncedAt: string;
            trackingInfo: import("../pathao.types.js").PathaoOrderInfoResponse;
        };
    }>;
    refreshOrderStatus(orderId: string, actor: AdminAuditActor): Promise<{
        success: boolean;
        message: string;
        data: {
            orderId: string;
            orderNumber: string;
            courierConsignmentId: string;
            courierStatus: import("../pathao.types.js").CourierStatus;
            courierStatusRaw: string;
            lastSyncedAt: string;
            trackingInfo: import("../pathao.types.js").PathaoOrderInfoResponse;
        };
    }>;
}
