import { ShipmentStatus } from '@prisma/client';
export function normalizeSteadfastStatus(rawStatus) {
    if (!rawStatus || typeof rawStatus !== 'string') {
        return ShipmentStatus.UNKNOWN;
    }
    const cleaned = rawStatus.trim().toLowerCase().replace(/[\s-]+/g, '_');
    switch (cleaned) {
        case 'in_review':
        case 'review':
            return ShipmentStatus.IN_REVIEW;
        case 'pending':
        case 'pickup_pending':
        case 'ready_for_pickup':
            return ShipmentStatus.PENDING;
        case 'in_transit':
        case 'transit':
        case 'received_at_hub':
        case 'sorting_hub':
            return ShipmentStatus.IN_TRANSIT;
        case 'out_for_delivery':
        case 'outfordelivery':
        case 'with_rider':
            return ShipmentStatus.OUT_FOR_DELIVERY;
        case 'delivered':
        case 'completed':
        case 'success':
            return ShipmentStatus.DELIVERED;
        case 'partial_delivered':
        case 'partial':
            return ShipmentStatus.PARTIAL_DELIVERED;
        case 'cancelled':
        case 'canceled':
            return ShipmentStatus.CANCELLED;
        case 'hold':
        case 'on_hold':
        case 'delayed':
            return ShipmentStatus.ON_HOLD;
        case 'return':
        case 'returned':
        case 'returned_to_merchant':
        case 'return_in_transit':
            return ShipmentStatus.RETURNED;
        default:
            return ShipmentStatus.UNKNOWN;
    }
}
export function isDeliveryConfirmed(status) {
    return status === ShipmentStatus.DELIVERED;
}
export function isReturnOrCancelled(status) {
    return (status === ShipmentStatus.CANCELLED ||
        status === ShipmentStatus.RETURNED);
}
export function getCustomerSafeShipmentStatus(status) {
    switch (status) {
        case ShipmentStatus.DELIVERED:
            return 'Delivered';
        case ShipmentStatus.OUT_FOR_DELIVERY:
            return 'Out for Delivery';
        case ShipmentStatus.IN_TRANSIT:
            return 'In Transit';
        case ShipmentStatus.IN_REVIEW:
        case ShipmentStatus.PENDING:
            return 'Consignment Registered';
        case ShipmentStatus.ON_HOLD:
            return 'Delivery Scheduled / On Hold';
        case ShipmentStatus.PARTIAL_DELIVERED:
            return 'Partially Delivered';
        case ShipmentStatus.RETURNED:
            return 'Returned to Origin';
        case ShipmentStatus.CANCELLED:
            return 'Cancelled';
        case ShipmentStatus.UNKNOWN:
        default:
            return 'Processing';
    }
}
//# sourceMappingURL=steadfast-status.mapper.js.map