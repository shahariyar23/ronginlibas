export interface PathaoOrderStatusResponse {
    consignment_id: string;
    merchant_order_id?: string;
    order_status?: string;
    order_status_slug?: string;
    updated_at?: string;
    [key: string]: unknown;
}
export declare const CourierStatus: {
    readonly PENDING: "PENDING";
    readonly PICKUP_REQUESTED: "PICKUP_REQUESTED";
    readonly PICKED_UP: "PICKED_UP";
    readonly IN_TRANSIT: "IN_TRANSIT";
    readonly OUT_FOR_DELIVERY: "OUT_FOR_DELIVERY";
    readonly DELIVERED: "DELIVERED";
    readonly DELIVERY_FAILED: "DELIVERY_FAILED";
    readonly RETURNED: "RETURNED";
    readonly RETURN_IN_TRANSIT: "RETURN_IN_TRANSIT";
    readonly RETURNED_TO_MERCHANT: "RETURNED_TO_MERCHANT";
    readonly ON_HOLD: "ON_HOLD";
    readonly CANCELLED: "CANCELLED";
    readonly UNKNOWN: "UNKNOWN";
};
export type CourierStatus = (typeof CourierStatus)[keyof typeof CourierStatus];
export declare const FINAL_DELIVERY_STATUSES: Set<CourierStatus>;
export declare const RETURN_STATUSES: Set<CourierStatus>;
export declare const TERMINAL_RETURN_STATUSES: Set<CourierStatus>;
export declare const ACTIVE_DELIVERY_STATUSES: Set<CourierStatus>;
export declare const FAILED_DELIVERY_STATUSES: Set<CourierStatus>;
export declare const CANCELLED_STATUSES: Set<CourierStatus>;
export declare function normalizePathaoStatus(rawStatus?: string | null): CourierStatus;
export interface ExtractedPathaoStatus {
    rawStatus: string;
    normalizedStatus: CourierStatus;
    discrepancyDetected: boolean;
}
export declare function extractPathaoStatus(response?: PathaoOrderStatusResponse | Record<string, unknown> | null, logger?: {
    warn: (msg: string) => void;
}): ExtractedPathaoStatus;
export declare function canMarkOrderDelivered(status: CourierStatus): boolean;
export declare function canProcessReturn(status: CourierStatus): boolean;
export declare function canTriggerRefund(status: CourierStatus): boolean;
export declare function canReleaseInventory(status: CourierStatus): boolean;
export declare function canSettlePayment(status: CourierStatus): boolean;
export declare function canCompleteOrder(status: CourierStatus): boolean;
export declare function isActionableStatus(status: CourierStatus): boolean;
export declare function getCustomerSafeCourierStatus(status: CourierStatus): string;
