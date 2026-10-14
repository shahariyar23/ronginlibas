import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WaitmarkPaymentService } from './waitmark-payment.service.js';
import { OrderStatus, PaymentStatus, PaymentMethod } from '@prisma/client';
import { createHmac } from 'node:crypto';

describe('WaitmarkPaymentService', () => {
  let service: WaitmarkPaymentService;
  let mockPrisma: any;
  let mockConfig: any;

  const mockSecretKey = 'sk_test_waitmark_libas_sec_2026';
  const mockPublicKey = 'pk_test_waitmark_libas_2026';

  beforeEach(() => {
    vi.clearAllMocks();

    mockConfig = {
      get: vi.fn((key: string) => {
        if (key === 'WAITMARK_PUBLIC_KEY') return mockPublicKey;
        if (key === 'WAITMARK_SECRET_KEY') return mockSecretKey;
        if (key === 'WAITMARK_CHECKOUT_URL') return 'https://pay.waitmark.com/checkout';
        if (key === 'WAITMARK_SUCCESS_URL') return 'http://localhost:4000/api/v1/payments/waitmark/webhook';
        if (key === 'PORT') return 4000;
        return undefined;
      }),
    };

    mockPrisma = {
      order: {
        findFirst: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      productVariant: {
        findUnique: vi.fn(),
        updateMany: vi.fn(),
      },
      inventoryTransaction: {
        create: vi.fn(),
      },
      payment: {
        create: vi.fn(),
        findFirst: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      orderTrackingEvent: {
        create: vi.fn(),
      },
      $transaction: vi.fn(async (cb: any) => cb(mockPrisma)),
    };

    service = new WaitmarkPaymentService(mockPrisma as any, mockConfig as any);
  });

  describe('Configuration & Credentials', () => {
    it('reports configured when public and secret keys exist', () => {
      expect(service.isConfigured()).toBe(true);
      expect(service.getPublicKey()).toBe(mockPublicKey);
      expect(service.getSecretKey()).toBe(mockSecretKey);
    });

    it('throws ServiceUnavailableException during initiation if public key is missing', async () => {
      mockConfig.get.mockImplementation((key: string) =>
        key === 'WAITMARK_SECRET_KEY' ? mockSecretKey : undefined,
      );
      await expect(
        service.initiatePayment({ orderId: 'ord-1' }),
      ).rejects.toThrow(ServiceUnavailableException);
    });
  });

  describe('Payment Initiation', () => {
    const validOrder = {
      id: 'ord-123',
      orderNumber: '#RL100200',
      customerId: 'cust-abc',
      status: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
      totalAmount: '2500.00',
      paidAmount: null,
      shippingAddress: { phone: '01711223344' },
      payments: [],
    };

    it('initiates payment for a valid customer order', async () => {
      mockPrisma.order.findFirst.mockResolvedValue(validOrder);
      mockPrisma.payment.create.mockResolvedValue({ id: 'pmt-1' });

      const result = await service.initiatePayment(
        { orderId: 'ord-123' },
        'cust-abc',
      );

      expect(result.orderNumber).toBe('#RL100200');
      expect(result.amount).toBe(2500);
      expect(result.currency).toBe('BDT');
      expect(result.paymentAttemptId).toContain('RL100200');
      expect(result.checkoutUrl).toContain('https://pay.waitmark.com/checkout?');
      expect(result.checkoutUrl).toContain('public_key=pk_test_waitmark_libas_2026');
      expect(result.checkoutUrl).toContain('amount=2500.00');
      expect(mockPrisma.payment.create).toHaveBeenCalledTimes(1);
    });

    it('rejects initiation if order belongs to another customer', async () => {
      mockPrisma.order.findFirst.mockResolvedValue(validOrder);

      await expect(
        service.initiatePayment({ orderId: 'ord-123' }, 'attacker-cust-id'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('allows guest order initiation when matching phone is provided', async () => {
      const guestOrder = {
        ...validOrder,
        customerId: null,
        guestPhone: '01711223344',
      };
      mockPrisma.order.findFirst.mockResolvedValue(guestOrder);
      mockPrisma.payment.create.mockResolvedValue({ id: 'pmt-2' });

      const result = await service.initiatePayment({
        orderId: 'ord-123',
        phone: '01711223344',
      });

      expect(result.orderNumber).toBe('#RL100200');
      expect(mockPrisma.payment.create).toHaveBeenCalledTimes(1);
    });

    it('rejects initiation for an already-paid order', async () => {
      mockPrisma.order.findFirst.mockResolvedValue({
        ...validOrder,
        paymentStatus: PaymentStatus.PAID,
      });

      await expect(
        service.initiatePayment({ orderId: 'ord-123' }, 'cust-abc'),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects initiation for a cancelled order', async () => {
      mockPrisma.order.findFirst.mockResolvedValue({
        ...validOrder,
        status: OrderStatus.CANCELLED,
      });

      await expect(
        service.initiatePayment({ orderId: 'ord-123' }, 'cust-abc'),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws NotFoundException when order does not exist', async () => {
      mockPrisma.order.findFirst.mockResolvedValue(null);

      await expect(
        service.initiatePayment({ orderId: 'non-existent' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('Webhook / IPN Verification & Processing', () => {
    const validAttemptId = 'WMPAY-RL100200-999999-ABCD';
    const validPayload = {
      order_id: validAttemptId,
      trx_id: 'WM7X9K2P1Q',
      amount: '2500.00',
      currency: 'BDT',
      status: 'completed',
      paid_at: '2026-07-28T14:30:00Z',
    };

    function computeSignature(payloadString: string, secret: string = mockSecretKey): string {
      return createHmac('sha256', secret).update(Buffer.from(payloadString, 'utf8')).digest('hex');
    }

    it('rejects webhook when signature header is missing', async () => {
      const payloadStr = JSON.stringify(validPayload);
      await expect(
        service.processWebhook(Buffer.from(payloadStr), ''),
      ).rejects.toThrow(ForbiddenException);
    });

    it('rejects webhook when signature is invalid (spoofing attempt)', async () => {
      const payloadStr = JSON.stringify(validPayload);
      const invalidSig = computeSignature(payloadStr, 'wrong-secret-key');

      await expect(
        service.processWebhook(Buffer.from(payloadStr), invalidSig),
      ).rejects.toThrow(ForbiddenException);
    });

    it('verifies valid HMAC signature and processes payment atomically', async () => {
      const payloadStr = JSON.stringify(validPayload);
      const validSig = computeSignature(payloadStr);

      const existingPayment = {
        id: 'pmt-1',
        orderId: 'ord-123',
        providerOrderId: validAttemptId,
        amount: '2500.00',
        status: PaymentStatus.PENDING,
        order: { id: 'ord-123', orderNumber: '#RL100200', status: OrderStatus.PENDING },
      };

      mockPrisma.payment.findUnique.mockResolvedValue(existingPayment);
      mockPrisma.order.findUnique.mockResolvedValue({
        id: 'ord-123',
        orderNumber: '#RL100200',
        status: OrderStatus.PENDING,
        adminNotes: null,
      });

      const result = await service.processWebhook(Buffer.from(payloadStr), validSig);

      expect(result.success).toBe(true);
      expect(mockPrisma.payment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'pmt-1' },
          data: expect.objectContaining({
            status: PaymentStatus.PAID,
            providerTransactionId: 'WM7X9K2P1Q',
          }),
        }),
      );
      expect(mockPrisma.order.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'ord-123' },
          data: expect.objectContaining({
            status: OrderStatus.CONFIRMED,
            paymentStatus: PaymentStatus.PAID,
            paymentMethod: PaymentMethod.WAITMARK_PAY,
            paymentReference: 'WM7X9K2P1Q',
          }),
        }),
      );
      expect(mockPrisma.orderTrackingEvent.create).toHaveBeenCalledTimes(1);
    });

    it('handles duplicate webhook idempotently without duplicate side-effects', async () => {
      const payloadStr = JSON.stringify(validPayload);
      const validSig = computeSignature(payloadStr);

      const alreadyPaidPayment = {
        id: 'pmt-1',
        orderId: 'ord-123',
        providerOrderId: validAttemptId,
        amount: '2500.00',
        status: PaymentStatus.PAID, // Already marked PAID
        order: { id: 'ord-123', orderNumber: '#RL100200', status: OrderStatus.CONFIRMED },
      };

      mockPrisma.payment.findUnique.mockResolvedValue(alreadyPaidPayment);

      const result = await service.processWebhook(Buffer.from(payloadStr), validSig);

      expect(result.success).toBe(true);
      expect(result.idempotent).toBe(true);
      expect(mockPrisma.payment.update).not.toHaveBeenCalled();
      expect(mockPrisma.order.update).not.toHaveBeenCalled();
    });

    it('rejects webhook if payment amount mismatches internal record', async () => {
      const tamperedPayload = { ...validPayload, amount: '100.00' };
      const payloadStr = JSON.stringify(tamperedPayload);
      const validSig = computeSignature(payloadStr);

      const existingPayment = {
        id: 'pmt-1',
        orderId: 'ord-123',
        providerOrderId: validAttemptId,
        amount: '2500.00', // Expected 2500, received 100
        status: PaymentStatus.PENDING,
        order: { id: 'ord-123', orderNumber: '#RL100200' },
      };

      mockPrisma.payment.findUnique.mockResolvedValue(existingPayment);

      await expect(
        service.processWebhook(Buffer.from(payloadStr), validSig),
      ).rejects.toThrow(BadRequestException);
      expect(mockPrisma.payment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'pmt-1' },
          data: expect.objectContaining({
            status: PaymentStatus.FAILED,
          }),
        }),
      );
    });

    it('flags order with review note if customer cancelled order before payment confirmation', async () => {
      const payloadStr = JSON.stringify(validPayload);
      const validSig = computeSignature(payloadStr);

      const existingPayment = {
        id: 'pmt-1',
        orderId: 'ord-123',
        providerOrderId: validAttemptId,
        amount: '2500.00',
        status: PaymentStatus.PENDING,
        order: { id: 'ord-123', orderNumber: '#RL100200', status: OrderStatus.CANCELLED },
      };

      mockPrisma.payment.findUnique.mockResolvedValue(existingPayment);
      mockPrisma.order.findUnique.mockResolvedValue({
        id: 'ord-123',
        orderNumber: '#RL100200',
        status: OrderStatus.CANCELLED,
        adminNotes: 'Customer requested cancellation',
      });

      const result = await service.processWebhook(Buffer.from(payloadStr), validSig);

      expect(result.success).toBe(true);
      expect(mockPrisma.order.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'ord-123' },
          data: expect.objectContaining({
            paymentStatus: PaymentStatus.PAID,
            adminNotes: expect.stringContaining('RECONCILIATION NEEDED'),
          }),
        }),
      );
    });

    it('rejects webhook if transaction ID was already utilized for another payment', async () => {
      const payloadStr = JSON.stringify(validPayload);
      const validSig = computeSignature(payloadStr);

      const existingPayment = {
        id: 'pmt-1',
        orderId: 'ord-123',
        providerOrderId: validAttemptId,
        amount: '2500.00',
        currency: 'BDT',
        status: PaymentStatus.PENDING,
        order: { id: 'ord-123', orderNumber: '#RL100200', status: OrderStatus.PENDING },
      };

      mockPrisma.payment.findUnique.mockResolvedValue(existingPayment);
      mockPrisma.payment.findFirst.mockResolvedValue({ id: 'pmt-other', providerTransactionId: 'WM7X9K2P1Q', status: PaymentStatus.PAID });

      await expect(
        service.processWebhook(Buffer.from(payloadStr), validSig),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects webhook if transaction ID was already utilized for another order', async () => {
      const payloadStr = JSON.stringify(validPayload);
      const validSig = computeSignature(payloadStr);

      const existingPayment = {
        id: 'pmt-1',
        orderId: 'ord-123',
        providerOrderId: validAttemptId,
        amount: '2500.00',
        currency: 'BDT',
        status: PaymentStatus.PENDING,
        order: { id: 'ord-123', orderNumber: '#RL100200', status: OrderStatus.PENDING },
      };

      mockPrisma.payment.findUnique.mockResolvedValue(existingPayment);
      mockPrisma.payment.findFirst.mockResolvedValue(null);
      mockPrisma.order.findFirst.mockResolvedValue({ id: 'ord-other', paymentReference: 'WM7X9K2P1Q', orderNumber: '#RL999999' });

      await expect(
        service.processWebhook(Buffer.from(payloadStr), validSig),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects webhook if currency mismatches internal record', async () => {
      const payloadStr = JSON.stringify({ ...validPayload, currency: 'USD' });
      const validSig = computeSignature(payloadStr);

      const existingPayment = {
        id: 'pmt-1',
        orderId: 'ord-123',
        providerOrderId: validAttemptId,
        amount: '2500.00',
        currency: 'BDT',
        status: PaymentStatus.PENDING,
        order: { id: 'ord-123', orderNumber: '#RL100200', status: OrderStatus.PENDING },
      };

      mockPrisma.payment.findUnique.mockResolvedValue(existingPayment);
      mockPrisma.payment.findFirst.mockResolvedValue(null);
      mockPrisma.order.findFirst.mockResolvedValue(null);

      await expect(
        service.processWebhook(Buffer.from(payloadStr), validSig),
      ).rejects.toThrow(BadRequestException);
      expect(mockPrisma.order.delete).toHaveBeenCalled();
    });

    it('handles explicit failed status by deleting order and releasing reserved stock', async () => {
      const payloadStr = JSON.stringify({ ...validPayload, status: 'failed' });
      const validSig = computeSignature(payloadStr);

      const existingPayment = {
        id: 'pmt-1',
        orderId: 'ord-123',
        providerOrderId: validAttemptId,
        amount: '2500.00',
        currency: 'BDT',
        status: PaymentStatus.PENDING,
        order: {
          id: 'ord-123',
          orderNumber: '#RL100200',
          status: OrderStatus.PENDING,
          items: [{ variantId: 'var-1', quantity: 1 }],
        },
      };

      mockPrisma.payment.findUnique.mockResolvedValue(existingPayment);
      mockPrisma.payment.findFirst.mockResolvedValue(null);
      mockPrisma.order.findFirst.mockResolvedValue(null);
      mockPrisma.productVariant.findUnique.mockResolvedValue({ id: 'var-1', stock: 10 });
      mockPrisma.productVariant.updateMany.mockResolvedValue({ count: 1 });

      const result = await service.processWebhook(Buffer.from(payloadStr), validSig);

      expect(result.success).toBe(false);
      expect(mockPrisma.order.delete).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'ord-123' },
        }),
      );
    });

    it('keeps payment in PENDING state if gateway reports uncertain/processing status instead of assuming failure', async () => {
      const payloadStr = JSON.stringify({ ...validPayload, status: 'processing' });
      const validSig = computeSignature(payloadStr);

      const existingPayment = {
        id: 'pmt-1',
        orderId: 'ord-123',
        providerOrderId: validAttemptId,
        amount: '2500.00',
        currency: 'BDT',
        status: PaymentStatus.PENDING,
        order: { id: 'ord-123', orderNumber: '#RL100200', status: OrderStatus.PENDING },
      };

      mockPrisma.payment.findUnique.mockResolvedValue(existingPayment);
      mockPrisma.payment.findFirst.mockResolvedValue(null);
      mockPrisma.order.findFirst.mockResolvedValue(null);

      const result = await service.processWebhook(Buffer.from(payloadStr), validSig);

      expect(result.success).toBe(false);
      expect(mockPrisma.payment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'pmt-1' },
          data: expect.objectContaining({ status: PaymentStatus.PENDING }),
        }),
      );
    });
  });

  describe('Payment Retry & Status Check', () => {
    it('allows retry payment for an order with FAILED payment status and updates order paymentStatus to PENDING', async () => {
      const failedOrder = {
        id: 'ord-123',
        orderNumber: '#RL100200',
        customerId: 'cust-abc',
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.FAILED,
        totalAmount: '2500.00',
        paidAmount: null,
        shippingAddress: { phone: '01711223344' },
        payments: [],
      };

      mockPrisma.order.findFirst.mockResolvedValue(failedOrder);
      mockPrisma.payment.create.mockResolvedValue({ id: 'pmt-retry' });

      const result = await service.initiatePayment(
        { orderId: 'ord-123' },
        'cust-abc',
      );

      expect(result.orderNumber).toBe('#RL100200');
      expect(mockPrisma.order.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'ord-123' },
          data: { paymentStatus: PaymentStatus.PENDING },
        }),
      );
    });

    it('returns verified payment status and history for an authorized customer', async () => {
      const order = {
        id: 'ord-123',
        orderNumber: '#RL100200',
        customerId: 'cust-abc',
        status: OrderStatus.CONFIRMED,
        paymentStatus: PaymentStatus.PAID,
        totalAmount: '2500.00',
        paidAmount: '2500.00',
        paymentReference: 'WM7X9K2P1Q',
        paymentMethod: PaymentMethod.WAITMARK_PAY,
        payments: [
          {
            id: 'pmt-1',
            provider: 'WAITMARK_PAY',
            providerOrderId: 'WMPAY-RL100200-1',
            providerTransactionId: 'WM7X9K2P1Q',
            amount: '2500.00',
            currency: 'BDT',
            status: PaymentStatus.PAID,
            failureReason: null,
            paidAt: new Date(),
            createdAt: new Date(),
          },
        ],
      };

      mockPrisma.order.findFirst.mockResolvedValue(order);

      const status = await service.getPaymentStatus('ord-123', 'cust-abc');

      expect(status.orderNumber).toBe('#RL100200');
      expect(status.paymentStatus).toBe(PaymentStatus.PAID);
      expect(status.paymentReference).toBe('WM7X9K2P1Q');
      expect(status.payments).toHaveLength(1);
    });

    it('resolves order payment status even when queried by gateway providerOrderId (e.g. after redirect)', async () => {
      const order = {
        id: 'ord-123',
        orderNumber: '#RL100200',
        customerId: 'cust-abc',
        status: OrderStatus.CONFIRMED,
        paymentStatus: PaymentStatus.PAID,
        totalAmount: '2500.00',
        paidAmount: '2500.00',
        paymentReference: 'WM7X9K2P1Q',
        paymentMethod: PaymentMethod.WAITMARK_PAY,
        payments: [
          {
            id: 'pmt-1',
            provider: 'WAITMARK_PAY',
            providerOrderId: 'WMPAY-RL100200-999999-ABCD',
            providerTransactionId: 'WM7X9K2P1Q',
            amount: '2500.00',
            currency: 'BDT',
            status: PaymentStatus.PAID,
            failureReason: null,
            paidAt: new Date(),
            createdAt: new Date(),
          },
        ],
      };

      mockPrisma.order.findFirst.mockResolvedValue(order);

      const status = await service.getPaymentStatus('WMPAY-RL100200-999999-ABCD', 'cust-abc');

      expect(mockPrisma.order.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              { payments: { some: { providerOrderId: 'WMPAY-RL100200-999999-ABCD' } } },
            ]),
          }),
        }),
      );
      expect(status.paymentStatus).toBe(PaymentStatus.PAID);
    });
  });
});

