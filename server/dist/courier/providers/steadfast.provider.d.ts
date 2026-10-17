import { CourierBalanceResult, CourierHealthResult, CourierProvider, CourierReturnResult, CreateShipmentInput, CreateShipmentResult, ShipmentStatusResult } from '../interfaces/courier-provider.interface.js';
import { SteadfastApiClient } from '../client/steadfast-api.client.js';
export declare class SteadfastCourierProvider implements CourierProvider {
    private readonly client;
    readonly name = "STEADFAST";
    private readonly logger;
    constructor(client: SteadfastApiClient);
    createShipment(input: CreateShipmentInput): Promise<CreateShipmentResult>;
    getStatusByConsignmentId(consignmentId: string | number): Promise<ShipmentStatusResult>;
    getStatusByInvoice(invoice: string): Promise<ShipmentStatusResult>;
    getStatusByTrackingCode(trackingCode: string): Promise<ShipmentStatusResult>;
    getBalance(): Promise<CourierBalanceResult>;
    createReturnRequest(consignmentId: string | number, reason?: string): Promise<CourierReturnResult>;
    healthCheck(): Promise<CourierHealthResult>;
}
