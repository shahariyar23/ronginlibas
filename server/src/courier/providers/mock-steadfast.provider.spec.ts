import { describe, it, expect, beforeEach } from 'vitest';
import { MockSteadfastCourierProvider } from './mock-steadfast.provider.js';
import { ShipmentStatus } from '@prisma/client';
import { BadRequestException, GatewayTimeoutException } from '@nestjs/common';

describe('MockSteadfastCourierProvider', () => {
  let provider: MockSteadfastCourierProvider;

  beforeEach(() => {
    provider = new MockSteadfastCourierProvider();
  });

  it('correctly creates a new mock consignment with deterministic IDs', async () => {
    const input = {
      orderId: 'ord-test-1',
      orderNumber: '#RL10099',
      invoiceNumber: 'RL-INV-2026-000100',
      recipientName: 'Kazi Nazrul',
      recipientPhone: '01711223344',
      recipientAddress: 'Dhanmondi 27, Dhaka',
      codAmount: 2500,
      note: 'Deliver before 5pm',
    };

    const res = await provider.createShipment(input);

    expect(res).toBeDefined();
    expect(res.consignmentId).toBeDefined();
    expect(res.trackingCode).toBe(`ST${res.consignmentId}`);
    expect(res.providerInvoice).toBe(input.invoiceNumber);
    expect(res.status).toBe(ShipmentStatus.IN_REVIEW);
    expect(res.codAmount).toBe(2500);
    expect(res.trackingUrl).toContain(res.trackingCode);
  });

  it('returns existing consignment idempotently if same invoice is provided', async () => {
    const input = {
      orderId: 'ord-test-2',
      orderNumber: '#RL10100',
      invoiceNumber: 'RL-INV-2026-000101',
      recipientName: 'Begum Rokeya',
      recipientPhone: '01811223344',
      recipientAddress: 'Gulshan 1, Dhaka',
      codAmount: 1800,
    };

    const res1 = await provider.createShipment(input);
    const res2 = await provider.createShipment(input);

    expect(res2.consignmentId).toBe(res1.consignmentId);
    expect(res2.trackingCode).toBe(res1.trackingCode);
  });

  it('simulates failure when invoice contains FAIL keyword', async () => {
    const input = {
      orderId: 'ord-fail',
      orderNumber: '#RL-FAIL',
      invoiceNumber: 'RL-INV-FAIL-001',
      recipientName: 'Test',
      recipientPhone: '01700000000',
      recipientAddress: 'Test Address',
      codAmount: 1000,
    };

    await expect(provider.createShipment(input)).rejects.toThrow(BadRequestException);
  });

  it('simulates timeout when invoice contains TIMEOUT keyword', async () => {
    const input = {
      orderId: 'ord-timeout',
      orderNumber: '#RL-TIMEOUT',
      invoiceNumber: 'RL-INV-TIMEOUT-001',
      recipientName: 'Test',
      recipientPhone: '01700000000',
      recipientAddress: 'Test Address',
      codAmount: 1000,
    };

    await expect(provider.createShipment(input)).rejects.toThrow(GatewayTimeoutException);
  });

  it('looks up status by Consignment ID (CID)', async () => {
    // CID 1005 is seeded as delivered
    const res = await provider.getStatusByConsignmentId('1005');
    expect(res.consignmentId).toBe('1005');
    expect(res.status).toBe(ShipmentStatus.DELIVERED);
    expect(res.providerStatus).toBe('delivered');
  });

  it('looks up status by Invoice', async () => {
    // Seeded fixture RL-INV-2026-000003 is in_transit
    const res = await provider.getStatusByInvoice('RL-INV-2026-000003');
    expect(res.status).toBe(ShipmentStatus.IN_TRANSIT);
    expect(res.providerStatus).toBe('in_transit');
  });

  it('looks up status by Tracking Code', async () => {
    // Seeded fixture ST1004 is out_for_delivery
    const res = await provider.getStatusByTrackingCode('ST1004');
    expect(res.status).toBe(ShipmentStatus.OUT_FOR_DELIVERY);
    expect(res.providerStatus).toBe('out_for_delivery');
  });

  it('retrieves simulated merchant balance', async () => {
    const balance = await provider.getBalance();
    expect(balance.currentBalance).toBeGreaterThan(0);
    expect(balance.currency).toBe('BDT');
  });

  it('simulates return request lifecycle', async () => {
    const successRes = await provider.createReturnRequest('1001', 'Damaged in transit');
    expect(successRes.success).toBe(true);
    expect(successRes.consignmentId).toBe('1001');

    const rejectRes = await provider.createReturnRequest('1001', 'REJECT_RETURN');
    expect(rejectRes.success).toBe(false);
  });

  it('reports operational health in mock mode', async () => {
    const health = await provider.healthCheck();
    expect(health.enabled).toBe(true);
    expect(health.mode).toBe('mock');
    expect(health.connected).toBe(true);
    expect(health.configured).toBe(true);
  });

  it('allows programmatic status progression in mock mode', async () => {
    provider.setMockStatus('9999', 'in_transit');
    let status = await provider.getStatusByConsignmentId('9999');
    expect(status.status).toBe(ShipmentStatus.IN_TRANSIT);

    provider.setMockStatus('9999', 'delivered');
    status = await provider.getStatusByConsignmentId('9999');
    expect(status.status).toBe(ShipmentStatus.DELIVERED);
  });
});
