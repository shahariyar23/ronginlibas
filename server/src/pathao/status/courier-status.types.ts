/**
 * Pathao Courier Status Normalization & Business Rules
 *
 * Core architectural principle:
 * External Pathao status is open-ended and typed strictly as open strings.
 * Internal status is a controlled, finite CourierStatus enum/union.
 * Unknown or future statuses must NEVER crash the system, and must NEVER
 * trigger sensitive automated business actions (Delivered, Returned, Refund,
 * Payment Settlement, Stock Release, or Order Completion).
 */

// ==================================================
// 1. RAW PROVIDER TYPES
// ==================================================

/**
 * Open-ended contract for external Pathao status responses.
 * order_status and order_status_slug remain open strings or undefined.
 * Strict union typing is explicitly forbidden for raw provider payloads.
 */
export interface PathaoOrderStatusResponse {
  consignment_id: string;
  merchant_order_id?: string;
  order_status?: string;
  order_status_slug?: string;
  updated_at?: string;
  [key: string]: unknown;
}

// ==================================================
// 2. INTERNAL CONTROLLED COURIER STATUS
// ==================================================

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
} as const;

export type CourierStatus = (typeof CourierStatus)[keyof typeof CourierStatus];

// ==================================================
// 3. STATUS WHITELISTS / SAFETY SETS
// ==================================================

export const FINAL_DELIVERY_STATUSES = new Set<CourierStatus>([
  CourierStatus.DELIVERED,
]);

export const RETURN_STATUSES = new Set<CourierStatus>([
  CourierStatus.RETURNED,
  CourierStatus.RETURN_IN_TRANSIT,
  CourierStatus.RETURNED_TO_MERCHANT,
]);

export const TERMINAL_RETURN_STATUSES = new Set<CourierStatus>([
  CourierStatus.RETURNED,
  CourierStatus.RETURNED_TO_MERCHANT,
]);

export const ACTIVE_DELIVERY_STATUSES = new Set<CourierStatus>([
  CourierStatus.PENDING,
  CourierStatus.PICKUP_REQUESTED,
  CourierStatus.PICKED_UP,
  CourierStatus.IN_TRANSIT,
  CourierStatus.OUT_FOR_DELIVERY,
]);

export const FAILED_DELIVERY_STATUSES = new Set<CourierStatus>([
  CourierStatus.DELIVERY_FAILED,
]);

export const CANCELLED_STATUSES = new Set<CourierStatus>([
  CourierStatus.CANCELLED,
]);

// ==================================================
// 4. CENTRALIZED NORMALIZER
// ==================================================

/**
 * Normalizes an external Pathao status string to internal CourierStatus.
 * 
 * Rules:
 * - Trims whitespace.
 * - Converts to lowercase.
 * - Matches canonical slugs and common human-readable phrases.
 * - Maps known provider statuses to internal CourierStatus.
 * - Unknown or missing values safely return CourierStatus.UNKNOWN.
 * - Never throws an exception.
 */
export function normalizePathaoStatus(rawStatus?: string | null): CourierStatus {
  if (!rawStatus || typeof rawStatus !== 'string') {
    return CourierStatus.UNKNOWN;
  }

  const cleaned = rawStatus.trim().toLowerCase();
  if (!cleaned) {
    return CourierStatus.UNKNOWN;
  }

  // Normalize delimiters (replace multiple spaces/underscores with hyphens)
  const normalizedKey = cleaned
    .replace(/[_\s]+/g, '-')
    .replace(/-+/g, '-');

  switch (normalizedKey) {
    // Pending / Order Created
    case 'pending':
    case 'order-created':
    case 'created':
    case 'unassigned':
      return CourierStatus.PENDING;

    // Pickup Requested
    case 'pickup-requested':
    case 'pickup-assigned':
    case 'requested':
      return CourierStatus.PICKUP_REQUESTED;

    // Picked Up / Collected
    case 'picked-up':
    case 'pickedup':
    case 'pickup':
    case 'collected':
      return CourierStatus.PICKED_UP;

    // In Transit
    case 'in-transit':
    case 'transit':
    case 'moving':
    case 'at-sorting-hub':
      return CourierStatus.IN_TRANSIT;

    // Out for Delivery
    case 'out-for-delivery':
    case 'outfordelivery':
    case 'dispatched-to-rider':
      return CourierStatus.OUT_FOR_DELIVERY;

    // Delivered
    case 'delivered':
    case 'successful':
      return CourierStatus.DELIVERED;

    // Delivery Failed
    case 'delivery-failed':
    case 'deliveryfailed':
    case 'failed-delivery':
    case 'failed':
      return CourierStatus.DELIVERY_FAILED;

    // Returned
    case 'returned':
    case 'return':
      return CourierStatus.RETURNED;

    // Return in Transit
    case 'return-in-transit':
    case 'return-transit':
      return CourierStatus.RETURN_IN_TRANSIT;

    // Returned to Merchant
    case 'returned-to-merchant':
    case 'returned-to-hub':
    case 'return-received':
      return CourierStatus.RETURNED_TO_MERCHANT;

    // On Hold
    case 'on-hold':
    case 'hold':
    case 'delayed':
      return CourierStatus.ON_HOLD;

    // Cancelled
    case 'cancelled':
    case 'canceled':
    case 'order-cancelled':
      return CourierStatus.CANCELLED;

    default:
      return CourierStatus.UNKNOWN;
  }
}

// ==================================================
// 5. SAFE STATUS EXTRACTION STRATEGY
// ==================================================

export interface ExtractedPathaoStatus {
  rawStatus: string;
  normalizedStatus: CourierStatus;
  discrepancyDetected: boolean;
}

/**
 * Extracts and normalizes status supporting both order_status and order_status_slug.
 * 
 * Priority:
 * 1. order_status_slug (machine canonical slug)
 * 2. order_status (display label)
 * 3. Fallback to UNKNOWN
 * 
 * Deterministic resolution:
 * - If both are provided and normalize to different statuses, logs warning and
 *   determines the safest unambiguous status.
 * - If slug is UNKNOWN but order_status is known, falls back to order_status.
 * - If slug is known, slug takes precedence.
 */
export function extractPathaoStatus(
  response?: PathaoOrderStatusResponse | Record<string, unknown> | null,
  logger?: { warn: (msg: string) => void },
): ExtractedPathaoStatus {
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

  // Case 1: Both provided
  if (slugRaw && statusRaw) {
    if (slugNormalized === statusNormalized) {
      return {
        rawStatus: slugRaw,
        normalizedStatus: slugNormalized,
        discrepancyDetected: false,
      };
    }

    // Discrepancy detected between slug and order_status
    logger?.warn(
      `[Pathao Status Discrepancy] slug="${slugRaw}" (${slugNormalized}) vs order_status="${statusRaw}" (${statusNormalized}). Resolving deterministically.`,
    );

    // If slug resolves to a known status, slug takes deterministic precedence
    if (slugNormalized !== CourierStatus.UNKNOWN) {
      return {
        rawStatus: slugRaw,
        normalizedStatus: slugNormalized,
        discrepancyDetected: true,
      };
    }

    // If slug is UNKNOWN but status is known, fall back to known status
    if (statusNormalized !== CourierStatus.UNKNOWN) {
      return {
        rawStatus: statusRaw,
        normalizedStatus: statusNormalized,
        discrepancyDetected: true,
      };
    }

    // Both unknown
    return {
      rawStatus: slugRaw,
      normalizedStatus: CourierStatus.UNKNOWN,
      discrepancyDetected: true,
    };
  }

  // Case 2: Only slug provided
  if (slugRaw) {
    return {
      rawStatus: slugRaw,
      normalizedStatus: slugNormalized,
      discrepancyDetected: false,
    };
  }

  // Case 3: Only order_status provided
  if (statusRaw) {
    return {
      rawStatus: statusRaw,
      normalizedStatus: statusNormalized,
      discrepancyDetected: false,
    };
  }

  // Case 4: Neither provided
  return {
    rawStatus: '',
    normalizedStatus: CourierStatus.UNKNOWN,
    discrepancyDetected: false,
  };
}

// ==================================================
// 6. BUSINESS RULES & SENSITIVE ACTION GATES
// ==================================================

/**
 * Gate for marking order as DELIVERED.
 * Only exact DELIVERED status returns true.
 * UNKNOWN and all other statuses strictly return false.
 */
export function canMarkOrderDelivered(status: CourierStatus): boolean {
  return FINAL_DELIVERY_STATUSES.has(status);
}

/**
 * Gate for processing returns.
 * Only explicit return states return true.
 * UNKNOWN strictly returns false.
 */
export function canProcessReturn(status: CourierStatus): boolean {
  return RETURN_STATUSES.has(status);
}

/**
 * Gate for triggering customer refund.
 * Only terminal verified return statuses return true.
 * UNKNOWN strictly returns false.
 */
export function canTriggerRefund(status: CourierStatus): boolean {
  return TERMINAL_RETURN_STATUSES.has(status);
}

/**
 * Gate for releasing reserved inventory back to stock.
 * Only approved terminal statuses (Cancelled or Returned to Merchant) return true.
 * UNKNOWN strictly returns false.
 */
export function canReleaseInventory(status: CourierStatus): boolean {
  return CANCELLED_STATUSES.has(status) || TERMINAL_RETURN_STATUSES.has(status);
}

/**
 * Gate for settling COD or courier payment.
 * Only the explicitly confirmed DELIVERED status returns true.
 * UNKNOWN strictly returns false.
 */
export function canSettlePayment(status: CourierStatus): boolean {
  return FINAL_DELIVERY_STATUSES.has(status);
}

/**
 * Gate for marking an entire order as completed.
 * Only explicitly delivered shipments return true.
 * UNKNOWN strictly returns false.
 */
export function canCompleteOrder(status: CourierStatus): boolean {
  return FINAL_DELIVERY_STATUSES.has(status);
}

/**
 * Checks if status belongs to any automated actionable set.
 * UNKNOWN returns false.
 */
export function isActionableStatus(status: CourierStatus): boolean {
  return status !== CourierStatus.UNKNOWN;
}

/**
 * Provides customer-safe courier status representation.
 * For UNKNOWN, returns 'UPDATING' rather than confusing internal values.
 * Never exposes credentials, secrets, or raw internal logs.
 */
export function getCustomerSafeCourierStatus(status: CourierStatus): string {
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
