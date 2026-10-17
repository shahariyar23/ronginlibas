import { ShipmentService } from '../services/shipment.service.js';
import { CreateShipmentDto } from '../dto/create-shipment.dto.js';
import { CreateReturnRequestDto } from '../dto/create-return-request.dto.js';
import { AuditService, type AdminAuditActor } from '../../audit/audit.service.js';
export declare class AdminCourierController {
    private readonly shipmentService;
    private readonly auditService;
    constructor(shipmentService: ShipmentService, auditService: AuditService);
    healthCheck(): Promise<{
        success: boolean;
        data: import("../interfaces/courier-provider.interface.js").CourierHealthResult;
    }>;
    getBalance(): Promise<{
        success: boolean;
        data: import("../interfaces/courier-provider.interface.js").CourierBalanceResult;
    }>;
    createShipment(orderId: string, dto: CreateShipmentDto, actor: AdminAuditActor): Promise<{
        success: boolean;
        message: string;
        data: import("../services/shipment.service.js").NormalizedShipmentDetails;
    }>;
    getShipment(orderId: string): Promise<{
        success: boolean;
        data: import("../services/shipment.service.js").NormalizedShipmentDetails | null;
    }>;
    refreshStatus(orderId: string, actor: AdminAuditActor): Promise<{
        success: boolean;
        message: string;
        data: import("../services/shipment.service.js").NormalizedShipmentDetails;
    }>;
    createReturnRequest(orderId: string, dto: CreateReturnRequestDto, actor: AdminAuditActor): Promise<{
        success: boolean;
        message: string;
        data: import("../interfaces/courier-provider.interface.js").CourierReturnResult;
    }>;
    getStatusByCid(consignmentId: string): Promise<{
        success: boolean;
        data: import("../interfaces/courier-provider.interface.js").ShipmentStatusResult;
    }>;
    getStatusByInvoice(invoice: string): Promise<{
        success: boolean;
        data: import("../interfaces/courier-provider.interface.js").ShipmentStatusResult;
    }>;
    getStatusByTrackingCode(trackingCode: string): Promise<{
        success: boolean;
        data: import("../interfaces/courier-provider.interface.js").ShipmentStatusResult;
    }>;
}
