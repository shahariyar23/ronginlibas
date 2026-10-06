export declare const API_VERSION = "v1";
export declare const API_PREFIX = "/api/v1";
export declare const ORDER_STATUS: {
    readonly PENDING: "PENDING";
    readonly CONFIRMED: "CONFIRMED";
    readonly PROCESSING: "PROCESSING";
    readonly PACKED: "PACKED";
    readonly SHIPPED: "SHIPPED";
    readonly OUT_FOR_DELIVERY: "OUT_FOR_DELIVERY";
    readonly DELIVERED: "DELIVERED";
    readonly CANCELLED: "CANCELLED";
    readonly RETURN_REQUESTED: "RETURN_REQUESTED";
    readonly RETURNED: "RETURNED";
    readonly REFUNDED: "REFUNDED";
};
export declare const PAYMENT_STATUS: {
    readonly PENDING: "PENDING";
    readonly PAID: "PAID";
    readonly FAILED: "FAILED";
    readonly REFUNDED: "REFUNDED";
};
