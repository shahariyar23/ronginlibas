import { describe, it, expect } from 'vitest';
import { ShipmentStatus } from '@prisma/client';
import {
  normalizeSteadfastStatus,
  isDeliveryConfirmed,
  isReturnOrCancelled,
  getCustomerSafeShipmentStatus,
} from './steadfast-status.mapper.js';

describe('Steadfast Status Mapper & Normalization', () => {
  describe('normalizeSteadfastStatus', () => {
    it('maps in_review and review to ShipmentStatus.IN_REVIEW', () => {
      expect(normalizeSteadfastStatus('in_review')).toBe(ShipmentStatus.IN_REVIEW);
      expect(normalizeSteadfastStatus('IN_REVIEW')).toBe(ShipmentStatus.IN_REVIEW);
      expect(normalizeSteadfastStatus('In Review')).toBe(ShipmentStatus.IN_REVIEW);
      expect(normalizeSteadfastStatus('review')).toBe(ShipmentStatus.IN_REVIEW);
    });

    it('maps pending and pickup variants to ShipmentStatus.PENDING', () => {
      expect(normalizeSteadfastStatus('pending')).toBe(ShipmentStatus.PENDING);
      expect(normalizeSteadfastStatus('PENDING')).toBe(ShipmentStatus.PENDING);
      expect(normalizeSteadfastStatus('pickup_pending')).toBe(ShipmentStatus.PENDING);
      expect(normalizeSteadfastStatus('ready_for_pickup')).toBe(ShipmentStatus.PENDING);
    });

    it('maps in_transit variants to ShipmentStatus.IN_TRANSIT', () => {
      expect(normalizeSteadfastStatus('in_transit')).toBe(ShipmentStatus.IN_TRANSIT);
      expect(normalizeSteadfastStatus('IN_TRANSIT')).toBe(ShipmentStatus.IN_TRANSIT);
      expect(normalizeSteadfastStatus('In-Transit')).toBe(ShipmentStatus.IN_TRANSIT);
      expect(normalizeSteadfastStatus('transit')).toBe(ShipmentStatus.IN_TRANSIT);
      expect(normalizeSteadfastStatus('sorting_hub')).toBe(ShipmentStatus.IN_TRANSIT);
    });

    it('maps out_for_delivery variants to ShipmentStatus.OUT_FOR_DELIVERY', () => {
      expect(normalizeSteadfastStatus('out_for_delivery')).toBe(ShipmentStatus.OUT_FOR_DELIVERY);
      expect(normalizeSteadfastStatus('outfordelivery')).toBe(ShipmentStatus.OUT_FOR_DELIVERY);
      expect(normalizeSteadfastStatus('with_rider')).toBe(ShipmentStatus.OUT_FOR_DELIVERY);
    });

    it('maps delivered and success to ShipmentStatus.DELIVERED', () => {
      expect(normalizeSteadfastStatus('delivered')).toBe(ShipmentStatus.DELIVERED);
      expect(normalizeSteadfastStatus('DELIVERED')).toBe(ShipmentStatus.DELIVERED);
      expect(normalizeSteadfastStatus('completed')).toBe(ShipmentStatus.DELIVERED);
      expect(normalizeSteadfastStatus('success')).toBe(ShipmentStatus.DELIVERED);
    });

    it('maps partial_delivered to ShipmentStatus.PARTIAL_DELIVERED', () => {
      expect(normalizeSteadfastStatus('partial_delivered')).toBe(ShipmentStatus.PARTIAL_DELIVERED);
      expect(normalizeSteadfastStatus('partial')).toBe(ShipmentStatus.PARTIAL_DELIVERED);
    });

    it('maps cancelled and canceled to ShipmentStatus.CANCELLED', () => {
      expect(normalizeSteadfastStatus('cancelled')).toBe(ShipmentStatus.CANCELLED);
      expect(normalizeSteadfastStatus('canceled')).toBe(ShipmentStatus.CANCELLED);
    });

    it('maps hold and on_hold to ShipmentStatus.ON_HOLD', () => {
      expect(normalizeSteadfastStatus('hold')).toBe(ShipmentStatus.ON_HOLD);
      expect(normalizeSteadfastStatus('on_hold')).toBe(ShipmentStatus.ON_HOLD);
      expect(normalizeSteadfastStatus('delayed')).toBe(ShipmentStatus.ON_HOLD);
    });

    it('maps return variants to ShipmentStatus.RETURNED', () => {
      expect(normalizeSteadfastStatus('return')).toBe(ShipmentStatus.RETURNED);
      expect(normalizeSteadfastStatus('returned')).toBe(ShipmentStatus.RETURNED);
      expect(normalizeSteadfastStatus('returned_to_merchant')).toBe(ShipmentStatus.RETURNED);
      expect(normalizeSteadfastStatus('return_in_transit')).toBe(ShipmentStatus.RETURNED);
    });

    it('safely falls back to UNKNOWN for unmapped, empty, or invalid input without throwing', () => {
      expect(normalizeSteadfastStatus(null)).toBe(ShipmentStatus.UNKNOWN);
      expect(normalizeSteadfastStatus(undefined)).toBe(ShipmentStatus.UNKNOWN);
      expect(normalizeSteadfastStatus('')).toBe(ShipmentStatus.UNKNOWN);
      expect(normalizeSteadfastStatus('   ')).toBe(ShipmentStatus.UNKNOWN);
      expect(normalizeSteadfastStatus('custom_unmapped_event_2026')).toBe(ShipmentStatus.UNKNOWN);
    });
  });

  describe('isDeliveryConfirmed Gate', () => {
    it('returns true ONLY for DELIVERED status', () => {
      expect(isDeliveryConfirmed(ShipmentStatus.DELIVERED)).toBe(true);
      expect(isDeliveryConfirmed(ShipmentStatus.IN_TRANSIT)).toBe(false);
      expect(isDeliveryConfirmed(ShipmentStatus.PENDING)).toBe(false);
      expect(isDeliveryConfirmed(ShipmentStatus.PARTIAL_DELIVERED)).toBe(false);
      expect(isDeliveryConfirmed(ShipmentStatus.UNKNOWN)).toBe(false);
    });
  });

  describe('isReturnOrCancelled Gate', () => {
    it('returns true for RETURNED or CANCELLED', () => {
      expect(isReturnOrCancelled(ShipmentStatus.RETURNED)).toBe(true);
      expect(isReturnOrCancelled(ShipmentStatus.CANCELLED)).toBe(true);
      expect(isReturnOrCancelled(ShipmentStatus.DELIVERED)).toBe(false);
      expect(isReturnOrCancelled(ShipmentStatus.IN_TRANSIT)).toBe(false);
    });
  });

  describe('getCustomerSafeShipmentStatus', () => {
    it('returns patron-friendly labels without exposing raw internal error strings', () => {
      expect(getCustomerSafeShipmentStatus(ShipmentStatus.DELIVERED)).toBe('Delivered');
      expect(getCustomerSafeShipmentStatus(ShipmentStatus.OUT_FOR_DELIVERY)).toBe('Out for Delivery');
      expect(getCustomerSafeShipmentStatus(ShipmentStatus.IN_TRANSIT)).toBe('In Transit');
      expect(getCustomerSafeShipmentStatus(ShipmentStatus.IN_REVIEW)).toBe('Consignment Registered');
      expect(getCustomerSafeShipmentStatus(ShipmentStatus.PENDING)).toBe('Consignment Registered');
      expect(getCustomerSafeShipmentStatus(ShipmentStatus.ON_HOLD)).toBe('Delivery Scheduled / On Hold');
      expect(getCustomerSafeShipmentStatus(ShipmentStatus.PARTIAL_DELIVERED)).toBe('Partially Delivered');
      expect(getCustomerSafeShipmentStatus(ShipmentStatus.RETURNED)).toBe('Returned to Origin');
      expect(getCustomerSafeShipmentStatus(ShipmentStatus.CANCELLED)).toBe('Cancelled');
      expect(getCustomerSafeShipmentStatus(ShipmentStatus.UNKNOWN)).toBe('Processing');
    });
  });
});
