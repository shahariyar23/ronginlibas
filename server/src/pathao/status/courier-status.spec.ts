import { describe, it, expect, vi } from 'vitest';
import {
  CourierStatus,
  normalizePathaoStatus,
  extractPathaoStatus,
  canMarkOrderDelivered,
  canProcessReturn,
  canTriggerRefund,
  canReleaseInventory,
  canSettlePayment,
  canCompleteOrder,
  isActionableStatus,
  getCustomerSafeCourierStatus,
} from './courier-status.types.js';

describe('Pathao Courier Status System', () => {
  describe('Requirement 4 & 21: Status Normalizer Unit Tests', () => {
    it('normalizes "pending" to PENDING', () => {
      expect(normalizePathaoStatus('pending')).toBe(CourierStatus.PENDING);
      expect(normalizePathaoStatus('order-created')).toBe(CourierStatus.PENDING);
    });

    it('normalizes "in-transit" and "in transit" to IN_TRANSIT', () => {
      expect(normalizePathaoStatus('in-transit')).toBe(CourierStatus.IN_TRANSIT);
      expect(normalizePathaoStatus('in transit')).toBe(CourierStatus.IN_TRANSIT);
      expect(normalizePathaoStatus('in_transit')).toBe(CourierStatus.IN_TRANSIT);
      expect(normalizePathaoStatus('moving')).toBe(CourierStatus.IN_TRANSIT);
    });

    it('normalizes "delivered" to DELIVERED', () => {
      expect(normalizePathaoStatus('delivered')).toBe(CourierStatus.DELIVERED);
      expect(normalizePathaoStatus('successful')).toBe(CourierStatus.DELIVERED);
    });

    it('normalizes "delivery-failed" to DELIVERY_FAILED', () => {
      expect(normalizePathaoStatus('delivery-failed')).toBe(CourierStatus.DELIVERY_FAILED);
      expect(normalizePathaoStatus('delivery failed')).toBe(CourierStatus.DELIVERY_FAILED);
      expect(normalizePathaoStatus('failed-delivery')).toBe(CourierStatus.DELIVERY_FAILED);
      expect(normalizePathaoStatus('failed')).toBe(CourierStatus.DELIVERY_FAILED);
    });

    it('normalizes "returned" to RETURNED', () => {
      expect(normalizePathaoStatus('returned')).toBe(CourierStatus.RETURNED);
      expect(normalizePathaoStatus('return')).toBe(CourierStatus.RETURNED);
    });

    it('normalizes "return-in-transit" to RETURN_IN_TRANSIT', () => {
      expect(normalizePathaoStatus('return-in-transit')).toBe(CourierStatus.RETURN_IN_TRANSIT);
      expect(normalizePathaoStatus('return in transit')).toBe(CourierStatus.RETURN_IN_TRANSIT);
      expect(normalizePathaoStatus('return_in_transit')).toBe(CourierStatus.RETURN_IN_TRANSIT);
    });

    it('normalizes "returned-to-merchant" to RETURNED_TO_MERCHANT', () => {
      expect(normalizePathaoStatus('returned-to-merchant')).toBe(CourierStatus.RETURNED_TO_MERCHANT);
      expect(normalizePathaoStatus('returned to merchant')).toBe(CourierStatus.RETURNED_TO_MERCHANT);
      expect(normalizePathaoStatus('returned-to-hub')).toBe(CourierStatus.RETURNED_TO_MERCHANT);
    });

    it('normalizes "on-hold" to ON_HOLD', () => {
      expect(normalizePathaoStatus('on-hold')).toBe(CourierStatus.ON_HOLD);
      expect(normalizePathaoStatus('on hold')).toBe(CourierStatus.ON_HOLD);
      expect(normalizePathaoStatus('hold')).toBe(CourierStatus.ON_HOLD);
    });

    it('normalizes "cancelled" to CANCELLED', () => {
      expect(normalizePathaoStatus('cancelled')).toBe(CourierStatus.CANCELLED);
      expect(normalizePathaoStatus('canceled')).toBe(CourierStatus.CANCELLED);
      expect(normalizePathaoStatus('order-cancelled')).toBe(CourierStatus.CANCELLED);
    });

    it('normalizes unknown or future statuses to UNKNOWN', () => {
      expect(normalizePathaoStatus('future-status')).toBe(CourierStatus.UNKNOWN);
      expect(normalizePathaoStatus('partial-delivery')).toBe(CourierStatus.UNKNOWN);
      expect(normalizePathaoStatus('sorting-hub-customs')).toBe(CourierStatus.UNKNOWN);
      expect(normalizePathaoStatus('warehouse-inspection')).toBe(CourierStatus.UNKNOWN);
    });

    it('normalizes empty, null, and undefined values to UNKNOWN', () => {
      expect(normalizePathaoStatus('')).toBe(CourierStatus.UNKNOWN);
      expect(normalizePathaoStatus('   ')).toBe(CourierStatus.UNKNOWN);
      expect(normalizePathaoStatus(null)).toBe(CourierStatus.UNKNOWN);
      expect(normalizePathaoStatus(undefined)).toBe(CourierStatus.UNKNOWN);
    });

    it('handles whitespace around valid statuses', () => {
      expect(normalizePathaoStatus('  delivered  ')).toBe(CourierStatus.DELIVERED);
      expect(normalizePathaoStatus('   in transit   ')).toBe(CourierStatus.IN_TRANSIT);
    });

    it('handles case variations correctly', () => {
      expect(normalizePathaoStatus('Delivered')).toBe(CourierStatus.DELIVERED);
      expect(normalizePathaoStatus('DELIVERED')).toBe(CourierStatus.DELIVERED);
      expect(normalizePathaoStatus('Delivered ')).toBe(CourierStatus.DELIVERED);
      expect(normalizePathaoStatus('In-Transit')).toBe(CourierStatus.IN_TRANSIT);
      expect(normalizePathaoStatus('IN TRANSIT')).toBe(CourierStatus.IN_TRANSIT);
    });
  });

  describe('Requirement 5: Extraction Strategy (order_status vs order_status_slug)', () => {
    it('prioritizes order_status_slug when both match', () => {
      const res = extractPathaoStatus({
        consignment_id: 'CSG-1',
        order_status_slug: 'in-transit',
        order_status: 'In Transit',
      });
      expect(res.rawStatus).toBe('in-transit');
      expect(res.normalizedStatus).toBe(CourierStatus.IN_TRANSIT);
      expect(res.discrepancyDetected).toBe(false);
    });

    it('detects discrepancy and deterministically chooses slug if slug is known', () => {
      const warnMock = vi.fn();
      const res = extractPathaoStatus(
        {
          consignment_id: 'CSG-2',
          order_status_slug: 'in-transit',
          order_status: 'Delivered',
        },
        { warn: warnMock },
      );
      expect(res.discrepancyDetected).toBe(true);
      expect(res.rawStatus).toBe('in-transit');
      expect(res.normalizedStatus).toBe(CourierStatus.IN_TRANSIT);
      expect(warnMock).toHaveBeenCalled();
    });

    it('falls back to order_status if slug is unknown but order_status is known', () => {
      const warnMock = vi.fn();
      const res = extractPathaoStatus(
        {
          consignment_id: 'CSG-3',
          order_status_slug: 'custom-internal-code-42',
          order_status: 'Delivered',
        },
        { warn: warnMock },
      );
      expect(res.discrepancyDetected).toBe(true);
      expect(res.rawStatus).toBe('Delivered');
      expect(res.normalizedStatus).toBe(CourierStatus.DELIVERED);
    });

    it('falls back to UNKNOWN if both are unknown', () => {
      const res = extractPathaoStatus({
        consignment_id: 'CSG-4',
        order_status_slug: 'brand-new-slug-2027',
        order_status: 'Brand New Slug 2027',
      });
      expect(res.normalizedStatus).toBe(CourierStatus.UNKNOWN);
      expect(res.rawStatus).toBe('brand-new-slug-2027');
    });

    it('handles payloads with only order_status', () => {
      const res = extractPathaoStatus({
        consignment_id: 'CSG-5',
        order_status: 'Delivered',
      });
      expect(res.rawStatus).toBe('Delivered');
      expect(res.normalizedStatus).toBe(CourierStatus.DELIVERED);
    });

    it('handles payloads with only order_status_slug', () => {
      const res = extractPathaoStatus({
        consignment_id: 'CSG-6',
        order_status_slug: 'delivered',
      });
      expect(res.rawStatus).toBe('delivered');
      expect(res.normalizedStatus).toBe(CourierStatus.DELIVERED);
    });

    it('handles missing status gracefully without throwing', () => {
      const res = extractPathaoStatus({
        consignment_id: 'CSG-7',
      });
      expect(res.rawStatus).toBe('');
      expect(res.normalizedStatus).toBe(CourierStatus.UNKNOWN);
    });
  });

  describe('Requirement 9, 10 & 22: Business Rule Tests & Action Gates', () => {
    it('canMarkOrderDelivered only returns true for DELIVERED', () => {
      expect(canMarkOrderDelivered(CourierStatus.DELIVERED)).toBe(true);
      expect(canMarkOrderDelivered(CourierStatus.IN_TRANSIT)).toBe(false);
      expect(canMarkOrderDelivered(CourierStatus.UNKNOWN)).toBe(false);
      expect(canMarkOrderDelivered(CourierStatus.RETURNED)).toBe(false);
      expect(canMarkOrderDelivered(CourierStatus.PENDING)).toBe(false);
    });

    it('canProcessReturn only returns true for return states', () => {
      expect(canProcessReturn(CourierStatus.RETURNED)).toBe(true);
      expect(canProcessReturn(CourierStatus.RETURN_IN_TRANSIT)).toBe(true);
      expect(canProcessReturn(CourierStatus.RETURNED_TO_MERCHANT)).toBe(true);
      expect(canProcessReturn(CourierStatus.DELIVERED)).toBe(false);
      expect(canProcessReturn(CourierStatus.UNKNOWN)).toBe(false);
    });

    it('UNKNOWN cannot trigger refund (canTriggerRefund = false)', () => {
      expect(canTriggerRefund(CourierStatus.UNKNOWN)).toBe(false);
      expect(canTriggerRefund(CourierStatus.IN_TRANSIT)).toBe(false);
      expect(canTriggerRefund(CourierStatus.DELIVERED)).toBe(false);
      expect(canTriggerRefund(CourierStatus.RETURNED)).toBe(true);
      expect(canTriggerRefund(CourierStatus.RETURNED_TO_MERCHANT)).toBe(true);
    });

    it('UNKNOWN cannot trigger inventory release (canReleaseInventory = false)', () => {
      expect(canReleaseInventory(CourierStatus.UNKNOWN)).toBe(false);
      expect(canReleaseInventory(CourierStatus.IN_TRANSIT)).toBe(false);
      expect(canReleaseInventory(CourierStatus.DELIVERED)).toBe(false);
      expect(canReleaseInventory(CourierStatus.CANCELLED)).toBe(true);
      expect(canReleaseInventory(CourierStatus.RETURNED_TO_MERCHANT)).toBe(true);
    });

    it('UNKNOWN cannot trigger payment settlement (canSettlePayment = false)', () => {
      expect(canSettlePayment(CourierStatus.UNKNOWN)).toBe(false);
      expect(canSettlePayment(CourierStatus.IN_TRANSIT)).toBe(false);
      expect(canSettlePayment(CourierStatus.DELIVERED)).toBe(true);
    });

    it('UNKNOWN cannot trigger order completion (canCompleteOrder = false)', () => {
      expect(canCompleteOrder(CourierStatus.UNKNOWN)).toBe(false);
      expect(canCompleteOrder(CourierStatus.IN_TRANSIT)).toBe(false);
      expect(canCompleteOrder(CourierStatus.DELIVERED)).toBe(true);
    });

    it('isActionableStatus returns false for UNKNOWN', () => {
      expect(isActionableStatus(CourierStatus.UNKNOWN)).toBe(false);
      expect(isActionableStatus(CourierStatus.DELIVERED)).toBe(true);
      expect(isActionableStatus(CourierStatus.IN_TRANSIT)).toBe(true);
    });

    it('getCustomerSafeCourierStatus maps UNKNOWN to UPDATING without exposing internal details', () => {
      expect(getCustomerSafeCourierStatus(CourierStatus.UNKNOWN)).toBe('UPDATING');
      expect(getCustomerSafeCourierStatus(CourierStatus.DELIVERED)).toBe('DELIVERED');
      expect(getCustomerSafeCourierStatus(CourierStatus.IN_TRANSIT)).toBe('IN_TRANSIT');
      expect(getCustomerSafeCourierStatus(CourierStatus.RETURNED)).toBe('RETURNED');
    });
  });
});
