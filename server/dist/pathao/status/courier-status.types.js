export const CourierStatus = {
    PENDING: 'PENDING',
    PICKUP_REQUESTED: 'PICKUP_REQUESTED',
    PICKED_UP: 'PICKED_UP',
    IN_TRANSIT: 'IN_TRANSIT',
    OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
    DELIVERED: 'DELIVERED',
    DELIVERY_FAILED: 'DELIVERY_FAILED',
    RETURNED: 'RETURNED',
    RETURN_IN_TRANSIT: 'RETURN_IN_TRANSIT',
    RETURNED_TO_MERCHANT: 'RETURNED_TO_MERCHANT',
    ON_HOLD: 'ON_HOLD',
    CANCELLED: 'CANCELLED',
    UNKNOWN: 'UNKNOWN',
};
export const FINAL_DELIVERY_STATUSES = new Set([
    CourierStatus.DELIVERED,
]);
export const RETURN_STATUSES = new Set([
    CourierStatus.RETURNED,
    CourierStatus.RETURN_IN_TRANSIT,
    CourierStatus.RETURNED_TO_MERCHANT,
]);
export const TERMINAL_RETURN_STATUSES = new Set([
    CourierStatus.RETURNED,
    CourierStatus.RETURNED_TO_MERCHANT,
]);
export const ACTIVE_DELIVERY_STATUSES = new Set([
    CourierStatus.PENDING,
    CourierStatus.PICKUP_REQUESTED,
    CourierStatus.PICKED_UP,
    CourierStatus.IN_TRANSIT,
    CourierStatus.OUT_FOR_DELIVERY,
]);
export const FAILED_DELIVERY_STATUSES = new Set([
    CourierStatus.DELIVERY_FAILED,
]);
export const CANCELLED_STATUSES = new Set([
    CourierStatus.CANCELLED,
]);
export function normalizePathaoStatus(rawStatus) {
    if (!rawStatus || typeof rawStatus !== 'string') {
        return CourierStatus.UNKNOWN;
    }
    const cleaned = rawStatus.trim().toLowerCase();
    if (!cleaned) {
        return CourierStatus.UNKNOWN;
    }
    const normalizedKey = cleaned
        .replace(/[_\s]+/g, '-')
        .replace(/-+/g, '-');
    switch (normalizedKey) {
        case 'pending':
        case 'order-created':
        case 'created':
        case 'unassigned':
            return CourierStatus.PENDING;
        case 'pickup-requested':
        case 'pickup-assigned':
        case 'requested':
            return CourierStatus.PICKUP_REQUESTED;
        case 'picked-up':
        case 'pickedup':
        case 'pickup':
        case 'collected':
            return CourierStatus.PICKED_UP;
        case 'in-transit':
        case 'transit':
        case 'moving':
        case 'at-sorting-hub':
            return CourierStatus.IN_TRANSIT;
        case 'out-for-delivery':
        case 'outfordelivery':
        case 'dispatched-to-rider':
            return CourierStatus.OUT_FOR_DELIVERY;
        case 'delivered':
        case 'successful':
            return CourierStatus.DELIVERED;
        case 'delivery-failed':
        case 'deliveryfailed':
        case 'failed-delivery':
        case 'failed':
            return CourierStatus.DELIVERY_FAILED;
        case 'returned':
        case 'return':
            return CourierStatus.RETURNED;
        case 'return-in-transit':
        case 'return-transit':
            return CourierStatus.RETURN_IN_TRANSIT;
        case 'returned-to-merchant':
        case 'returned-to-hub':
        case 'return-received':
            return CourierStatus.RETURNED_TO_MERCHANT;
        case 'on-hold':
        case 'hold':
        case 'delayed':
            return CourierStatus.ON_HOLD;
        case 'cancelled':
        case 'canceled':
        case 'order-cancelled':
            return CourierStatus.CANCELLED;
        default:
            return CourierStatus.UNKNOWN;
    }
}
export function extractPathaoStatus(response, logger) {
    if (!response || typeof response !== 'object') {
        return {
            rawStatus: '',
            normalizedStatus: CourierStatus.UNKNOWN,
            discrepancyDetected: false,
        };
    }
    const slugRaw = typeof response.order_status_slug === 'string'
        ? response.order_status_slug.trim()
        : '';
    const statusRaw = typeof response.order_status === 'string'
        ? response.order_status.trim()
        : '';
    const slugNormalized = slugRaw ? normalizePathaoStatus(slugRaw) : CourierStatus.UNKNOWN;
    const statusNormalized = statusRaw ? normalizePathaoStatus(statusRaw) : CourierStatus.UNKNOWN;
    if (slugRaw && statusRaw) {
        if (slugNormalized === statusNormalized) {
            return {
                rawStatus: slugRaw,
                normalizedStatus: slugNormalized,
                discrepancyDetected: false,
            };
        }
        logger?.warn(`[Pathao Status Discrepancy] slug="${slugRaw}" (${slugNormalized}) vs order_status="${statusRaw}" (${statusNormalized}). Resolving deterministically.`);
        if (slugNormalized !== CourierStatus.UNKNOWN) {
            return {
                rawStatus: slugRaw,
                normalizedStatus: slugNormalized,
                discrepancyDetected: true,
            };
        }
        if (statusNormalized !== CourierStatus.UNKNOWN) {
            return {
                rawStatus: statusRaw,
                normalizedStatus: statusNormalized,
                discrepancyDetected: true,
            };
        }
        return {
            rawStatus: slugRaw,
            normalizedStatus: CourierStatus.UNKNOWN,
            discrepancyDetected: true,
        };
    }
    if (slugRaw) {
        return {
            rawStatus: slugRaw,
            normalizedStatus: slugNormalized,
            discrepancyDetected: false,
        };
    }
    if (statusRaw) {
        return {
            rawStatus: statusRaw,
            normalizedStatus: statusNormalized,
            discrepancyDetected: false,
        };
    }
    return {
        rawStatus: '',
        normalizedStatus: CourierStatus.UNKNOWN,
        discrepancyDetected: false,
    };
}
export function canMarkOrderDelivered(status) {
    return FINAL_DELIVERY_STATUSES.has(status);
}
export function canProcessReturn(status) {
    return RETURN_STATUSES.has(status);
}
export function canTriggerRefund(status) {
    return TERMINAL_RETURN_STATUSES.has(status);
}
export function canReleaseInventory(status) {
    return CANCELLED_STATUSES.has(status) || TERMINAL_RETURN_STATUSES.has(status);
}
export function canSettlePayment(status) {
    return FINAL_DELIVERY_STATUSES.has(status);
}
export function canCompleteOrder(status) {
    return FINAL_DELIVERY_STATUSES.has(status);
}
export function isActionableStatus(status) {
    return status !== CourierStatus.UNKNOWN;
}
export function getCustomerSafeCourierStatus(status) {
    switch (status) {
        case CourierStatus.DELIVERED:
            return 'DELIVERED';
        case CourierStatus.OUT_FOR_DELIVERY:
            return 'OUT_FOR_DELIVERY';
        case CourierStatus.IN_TRANSIT:
            return 'IN_TRANSIT';
        case CourierStatus.PICKED_UP:
            return 'PICKED_UP';
        case CourierStatus.PICKUP_REQUESTED:
            return 'PICKUP_REQUESTED';
        case CourierStatus.PENDING:
            return 'PENDING';
        case CourierStatus.ON_HOLD:
            return 'ON_HOLD';
        case CourierStatus.DELIVERY_FAILED:
            return 'DELIVERY_FAILED';
        case CourierStatus.RETURN_IN_TRANSIT:
        case CourierStatus.RETURNED_TO_MERCHANT:
        case CourierStatus.RETURNED:
            return 'RETURNED';
        case CourierStatus.CANCELLED:
            return 'CANCELLED';
        case CourierStatus.UNKNOWN:
        default:
            return 'UPDATING';
    }
}
//# sourceMappingURL=courier-status.types.js.map