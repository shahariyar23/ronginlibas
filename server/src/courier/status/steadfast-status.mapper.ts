import { ShipmentStatus } from '@prisma/client';

/**
 * Steadfast Courier Status Mapping Documentation
 *
 * Steadfast returns delivery status strings across its API endpoints:
 * - /status_by_cid/{id}
 * - /status_by_invoice/{invoice}
 * - /status_by_trackingcode/{tracking_code}
 * - Webhook delivery notifications
 *
 * MAPPING TABLE:
 * -------------------------------------------------------------------------------------------------
 * Raw Provider Status           Normalized Internal Status    Description & Lifecycle Stage
 * -------------------------------------------------------------------------------------------------
 * 'in_review'                   ShipmentStatus.IN_REVIEW      Consignment created; awaiting verification/hub intake.
 * 'pending'                     ShipmentStatus.PENDING        Pickup queued or waiting for courier pickup officer.
 * 'in_transit' / 'transit'      ShipmentStatus.IN_TRANSIT     Parcel dispatched, moving between hubs.
 * 'out_for_delivery'            ShipmentStatus.OUT_FOR_DELIVERY Dispatched with rider for doorstep delivery.
 * 'delivered'                   ShipmentStatus.DELIVERED      Successfully delivered to customer; COD collectable.
 * 'partial_delivered'           ShipmentStatus.PARTIAL_DELIVERED Partial items delivered; partial return.
 * 'cancelled' / 'canceled'      ShipmentStatus.CANCELLED      Order booking cancelled by merchant or courier.
 * 'hold' / 'on_hold'            ShipmentStatus.ON_HOLD        Held at hub (unreachable customer/rescheduled).
 * 'return' / 'returned'         ShipmentStatus.RETURNED       Parcel returned or return journey initiated.
 * Any other unknown string      ShipmentStatus.UNKNOWN        Safeguard: unmapped status. Never triggers auto-actions.
 * -------------------------------------------------------------------------------------------------
 */

export function normalizeSteadfastStatus(rawStatus?: string | null): ShipmentStatus {
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

/**
 * Gate: Checks if internal shipment status represents confirmed final delivery.
 */
export function isDeliveryConfirmed(status: ShipmentStatus | string): boolean {
  return status === ShipmentStatus.DELIVERED;
}

/**
 * Gate: Checks if status represents a return or terminal cancellation.
 */
export function isReturnOrCancelled(status: ShipmentStatus | string): boolean {
  return (
    status === ShipmentStatus.CANCELLED ||
    status === ShipmentStatus.RETURNED
  );
}

/**
 * Customer-safe status description:
 * Ensures customers never see raw internal error codes, confusing codes, or system details.
 */
export function getCustomerSafeShipmentStatus(status: ShipmentStatus | string): string {
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
