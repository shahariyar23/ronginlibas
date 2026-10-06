export interface CourierProvider {
    createShipment(orderId: string, details: any): Promise<any>;
    trackShipment(consignmentId: string): Promise<any>;
}
export declare class ShippingService {
    getDeliveryZones(): Promise<{
        id: string;
        name: string;
        charge: number;
        tat: string;
    }[]>;
}
