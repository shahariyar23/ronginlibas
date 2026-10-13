export interface Ga4ServerPurchaseItem {
    item_id: string;
    item_name: string;
    price: number;
    quantity: number;
    item_category?: string;
    item_variant?: string;
}
export interface Ga4ServerPurchaseOrder {
    id: string;
    orderNumber: string;
    totalAmount: number | string | any;
    shippingFee?: number | string | any;
    paymentMethod?: string;
    customerId?: string | null;
    guestTrackingToken?: string | null;
    items?: any[];
}
export declare class Ga4MeasurementProtocolService {
    private readonly logger;
    private readonly sentOrderNumbers;
    private get measurementId();
    private get apiSecret();
    sendPurchaseEvent(order: Ga4ServerPurchaseOrder, visitorToken?: string): Promise<{
        success: boolean;
        reason?: string;
    }>;
}
