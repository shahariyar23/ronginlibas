import { CourierBalanceResult, CourierHealthResult, CourierProvider, CourierReturnResult, CreateShipmentInput, CreateShipmentResult, ShipmentStatusResult } from '../interfaces/courier-provider.interface.js';
export declare class MockSteadfastCourierProvider implements CourierProvider {
    readonly name = "STEADFAST";
    private readonly logger;
    private readonly store;
    private readonly invoiceIndex;
    private readonly trackingIndex;
    private mockCounter;
    private mockBalance;
    constructor();
    private seedFixtures;
    createShipment(input: CreateShipmentInput): Promise<CreateShipmentResult>;
    getStatusByConsignmentId(consignmentId: string | number): Promise<ShipmentStatusResult>;
    getStatusByInvoice(invoice: string): Promise<ShipmentStatusResult>;
    getStatusByTrackingCode(trackingCode: string): Promise<ShipmentStatusResult>;
    getBalance(): Promise<CourierBalanceResult>;
    createReturnRequest(consignmentId: string | number, reason?: string): Promise<CourierReturnResult>;
    healthCheck(): Promise<CourierHealthResult>;
    setMockStatus(consignmentId: string, status: string): void;
}
