import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { UddoktaPaymentService } from './uddokta-payment.service.js';
import { OrderStatus, PaymentStatus, PaymentMethod } from '@prisma/client';

describe('UddoktaPaymentService', () => {
  let service: UddoktaPaymentService;
  let mockPrisma: any;
  let mockConfig: any;
  let mockOrdersService: any;
  let mockGa4Service: any;

  const mockApiKey = 'test_uddoktapay_api_key_2026';
  const mockBaseUrl = 'https://sandbox.uddoktapay.com';

  beforeEach(() => {
    vi.clearAllMocks();

    mockConfig = {
      get: vi.fn((key: string) => {
        if (key === 'UDDOKTAPAY_API_KEY') return mockApiKey;
        if (key === 'UDDOKTAPAY_BASE_URL') return mockBaseUrl;
        if (key === 'FRONTEND_URL') return 'http://localhost:3000';
        if (key === 'BACKEND_PUBLIC_URL') return 'http://localhost:4000';
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

    mockOrdersService = {
      deleteUnpaidOrFailedOrder: vi.fn().mockResolvedValue({ success: true, message: 'Deleted' }),
      dispatchConfirmationNotificationForPaidOrder: vi.fn().mockResolvedValue(undefined),
    };

    mockGa4Service = {
      sendPurchaseEvent: vi.fn().mockResolvedValue(undefined),
    };

    service = new UddoktaPaymentService(
      mockPrisma as any,
      mockConfig as any,
      mockOrdersService as any,
      mockGa4Service as any,
    );
  });

  describe('Configuration & Credentials', () => {
    it('reports configured when API key exists', () => {
      expect(service.isConfigured()).toBe(true);
      expect(service.getApiKey()).toBe(mockApiKey);
      expect(service.getBaseUrl()).toBe(mockBaseUrl);
    });

    it('defaults base URL to paymently when not explicitly configured', () => {
      mockConfig.get.mockImplementation((key: string) =>
        key === 'UDDOKTAPAY_API_KEY' ? mockApiKey : undefined,
      );
      expect(service.getBaseUrl()).toBe('https://ronginlibas.paymently.io/api');
    });

    it('throws ServiceUnavailableException during initiation if API key is missing', async () => {
      mockConfig.get.mockImplementation(() => undefined);
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
      shippingAddress: { fullName: 'Rahim Khan', email: 'rahim@example.com', phone: '01711223344' },
      payments: [],
    };

    it('initiates payment for a valid customer order and returns hosted checkoutUrl', async () => {
      mockPrisma.order.findFirst.mockResolvedValue(validOrder);
      mockPrisma.payment.create.mockResolvedValue({ id: 'pmt-1' });

      // Mock upstream UddoktaPay POST /api/checkout-v2
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'success',
          message: 'Payment session created',
          payment_url: 'https://sandbox.uddoktapay.com/checkout/sess_test_123',
        }),
      } as any);

      const result = await service.initiatePayment({ orderId: 'ord-123' }, 'cust-abc');

      expect(result).toBeDefined();
      expect(result.checkoutUrl).toBe('https://sandbox.uddoktapay.com/checkout/sess_test_123');
      expect(result.amount).toBe(2500);
      expect(result.currency).toBe('BDT');
      expect(result.orderNumber).toBe('#RL100200');
      expect(fetchSpy).toHaveBeenCalledTimes(1);

      const [endpoint, opts] = fetchSpy.mock.calls[0];
      expect(endpoint).toBe('https://sandbox.uddoktapay.com/api/checkout-v2');
      expect(opts?.headers).toHaveProperty('RT-UDDOKTAPAY-API-KEY', mockApiKey);
    });

    it('initiates payment for a guest order when matching phone is supplied', async () => {
      const guestOrder = {
        ...validOrder,
        customerId: null,
        guestPhone: '01711223344',
      };
      mockPrisma.order.findFirst.mockResolvedValue(guestOrder);
      mockPrisma.payment.create.mockResolvedValue({ id: 'pmt-1' });

      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: true,
          payment_url: 'https://sandbox.uddoktapay.com/checkout/sess_test_guest',
        }),
      } as any);

      const result = await service.initiatePayment(
        { orderId: 'ord-123', phone: '01711223344' },
        undefined,
      );
      expect(result.checkoutUrl).toBe('https://sandbox.uddoktapay.com/checkout/sess_test_guest');
    });

    it('denies initiation for orders belonging to a different customer', async () => {
      mockPrisma.order.findFirst.mockResolvedValue(validOrder);
      await expect(
        service.initiatePayment({ orderId: 'ord-123' }, 'cust-different'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('denies initiation for guest order when neither matching phone nor tracking token is provided', async () => {
      const guestOrder = {
        ...validOrder,
        customerId: null,
        guestPhone: '01711223344',
      };
      mockPrisma.order.findFirst.mockResolvedValue(guestOrder);
      await expect(
        service.initiatePayment({ orderId: 'ord-123', phone: '01999999999' }, undefined),
      ).rejects.toThrow(ForbiddenException);
    });

    it('rejects initiation for already-paid orders', async () => {
      mockPrisma.order.findFirst.mockResolvedValue({
        ...validOrder,
        paymentStatus: PaymentStatus.PAID,
      });
      await expect(
        service.initiatePayment({ orderId: 'ord-123' }, 'cust-abc'),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects initiation for cancelled orders', async () => {
      mockPrisma.order.findFirst.mockResolvedValue({
        ...validOrder,
        status: OrderStatus.CANCELLED,
      });
      await expect(
        service.initiatePayment({ orderId: 'ord-123' }, 'cust-abc'),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects initiation when payable amount is zero', async () => {
      mockPrisma.order.findFirst.mockResolvedValue({
        ...validOrder,
        totalAmount: '2500.00',
        paidAmount: '2500.00',
      });
      await expect(
        service.initiatePayment({ orderId: 'ord-123' }, 'cust-abc'),
      ).rejects.toThrow(BadRequestException);
    });

    it('reuses existing pending payment attempt on retry without duplicating attempts', async () => {
      mockPrisma.order.findFirst.mockResolvedValue(validOrder);
      mockPrisma.payment.findFirst.mockResolvedValue({
        id: 'pmt-existing',
        providerOrderId: 'UPAY-RL100200',
        amount: 2500,
        status: PaymentStatus.PENDING,
      });
      mockPrisma.payment.update.mockResolvedValue({ id: 'pmt-existing' });

      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'success',
          payment_url: 'https://sandbox.uddoktapay.com/checkout/sess_retry',
        }),
      } as any);

      const result = await service.initiatePayment({ orderId: 'ord-123' }, 'cust-abc');
      expect(result.paymentAttemptId).toBe('UPAY-RL100200');
      expect(mockPrisma.payment.create).not.toHaveBeenCalled();
      expect(mockPrisma.payment.update).toHaveBeenCalled();
    });

    it('handles upstream UddoktaPay outage or network failure gracefully', async () => {
      mockPrisma.order.findFirst.mockResolvedValue(validOrder);
      vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Connection refused'));

      await expect(
        service.initiatePayment({ orderId: 'ord-123' }, 'cust-abc'),
      ).rejects.toThrow(ServiceUnavailableException);
    });

    it('handles upstream error response from UddoktaPay gracefully', async () => {
      mockPrisma.order.findFirst.mockResolvedValue(validOrder);
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ message: 'Invalid API Key' }),
      } as any);

      await expect(
        service.initiatePayment({ orderId: 'ord-123' }, 'cust-abc'),
      ).rejects.toThrow(ServiceUnavailableException);
    });
  });

  describe('Server-Side Payment Verification (POST /api/verify-payment)', () => {
    it('verifies COMPLETED payment and updates database atomically', async () => {
      mockPrisma.payment.findFirst.mockResolvedValue({
        id: 'pmt-1',
        providerOrderId: 'UPAY-RL100200',
        amount: 2500,
        status: PaymentStatus.PENDING,
        order: {
          id: 'ord-123',
          orderNumber: '#RL100200',
          status: OrderStatus.PENDING,
          paymentStatus: PaymentStatus.PENDING,
          customer: { fullName: 'Rahim' },
          items: [],
        },
      });

      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'COMPLETED',
          message: 'Payment verified successfully',
          data: {
            invoice_id: 'INV-UDD-999',
            amount: '2500.00',
            payment_method: 'bKash',
            transaction_id: 'TRX_BKASH_12345',
            metadata: { order_number: '#RL100200' },
          },
        }),
      } as any);

      const result = await service.verifyPayment('INV-UDD-999');

      expect(result.success).toBe(true);
      expect(result.isPaid).toBe(true);
      expect(result.paymentStatus).toBe(PaymentStatus.PAID);
      expect(result.transactionId).toBe('TRX_BKASH_12345');
      expect(mockPrisma.$transaction).toHaveBeenCalled();
      expect(mockPrisma.payment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: PaymentStatus.PAID,
            providerInvoiceId: 'INV-UDD-999',
            providerTransactionId: 'TRX_BKASH_12345',
          }),
        }),
      );
    });

    it('handles PENDING verification response without marking order as paid', async () => {
      mockPrisma.payment.findFirst.mockResolvedValue({
        id: 'pmt-1',
        providerOrderId: 'UPAY-RL100200',
        amount: 2500,
        status: PaymentStatus.PENDING,
        order: {
          id: 'ord-123',
          orderNumber: '#RL100200',
          status: OrderStatus.PENDING,
          paymentStatus: PaymentStatus.PENDING,
        },
      });

      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'PENDING',
          message: 'Payment awaiting manual verification',
          data: {
            invoice_id: 'INV-UDD-PENDING',
            amount: '2500.00',
          },
        }),
      } as any);

      const result = await service.verifyPayment('INV-UDD-PENDING');

      expect(result.success).toBe(true);
      expect(result.isPaid).toBe(false);
      expect(result.paymentStatus).toBe(PaymentStatus.PENDING);
      expect(mockPrisma.payment.update).not.toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: PaymentStatus.PAID }),
        }),
      );
    });

    it('handles ERROR verification response by updating payment status to FAILED', async () => {
      mockPrisma.payment.findFirst.mockResolvedValue({
        id: 'pmt-1',
        providerOrderId: 'UPAY-RL100200',
        amount: 2500,
        status: PaymentStatus.PENDING,
        order: {
          id: 'ord-123',
          orderNumber: '#RL100200',
          status: OrderStatus.PENDING,
          paymentStatus: PaymentStatus.PENDING,
        },
      });

      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'ERROR',
          message: 'Payment rejected by bank',
        }),
      } as any);

      const result = await service.verifyPayment('INV-UDD-FAILED');

      expect(result.success).toBe(false);
      expect(result.isPaid).toBe(false);
      expect(result.paymentStatus).toBe(PaymentStatus.FAILED);
      expect(mockPrisma.payment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: PaymentStatus.FAILED,
          }),
        }),
      );
    });

    it('rejects empty or whitespace invoice_id with BadRequestException', async () => {
      await expect(service.verifyPayment('')).rejects.toThrow(BadRequestException);
    });
  });

  describe('Webhook (IPN) Processing', () => {
    const validWebhookPayload = {
      full_name: 'Rahim Khan',
      email: 'rahim@example.com',
      amount: '2500.00',
      fee: '37.50',
      charged_amount: '2537.50',
      invoice_id: 'INV-UDD-777',
      metadata: {
        order_id: 'ord-123',
        order_number: '#RL100200',
        payment_attempt_id: 'UPAY-RL100200',
      },
      payment_method: 'Nagad',
      sender_number: '018XXXXXXXX',
      transaction_id: 'TRX_NAGAD_999',
      date: '2026-10-15 12:30:00',
      status: 'COMPLETED',
    };

    const validHeaders = {
      'rt-uddoktapay-api-key': mockApiKey,
    };

    it('rejects webhook when RT-UDDOKTAPAY-API-KEY header is missing', async () => {
      await expect(
        service.processWebhook({}, validWebhookPayload),
      ).rejects.toThrow(ForbiddenException);
    });

    it('rejects webhook when RT-UDDOKTAPAY-API-KEY header is invalid', async () => {
      await expect(
        service.processWebhook(
          { 'rt-uddoktapay-api-key': 'invalid_secret_key' },
          validWebhookPayload,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('processes valid COMPLETED webhook and updates payment & order to PAID', async () => {
      mockPrisma.payment.findFirst.mockResolvedValueOnce({
        id: 'pmt-1',
        orderId: 'ord-123',
        providerOrderId: 'UPAY-RL100200',
        amount: 2500,
        currency: 'BDT',
        status: PaymentStatus.PENDING,
        order: {
          id: 'ord-123',
          orderNumber: '#RL100200',
          status: OrderStatus.PENDING,
          paymentStatus: PaymentStatus.PENDING,
          customer: { fullName: 'Rahim' },
          items: [],
        },
      });

      const result = await service.processWebhook(validHeaders, validWebhookPayload);

      expect(result.success).toBe(true);
      expect(mockPrisma.$transaction).toHaveBeenCalled();
      expect(mockPrisma.payment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: PaymentStatus.PAID,
            providerInvoiceId: 'INV-UDD-777',
            providerTransactionId: 'TRX_NAGAD_999',
          }),
        }),
      );
      expect(mockPrisma.order.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            paymentStatus: PaymentStatus.PAID,
            status: OrderStatus.CONFIRMED,
            paidAmount: 2500,
          }),
        }),
      );
    });

    it('idempotently handles duplicate webhooks without re-running transactions', async () => {
      mockPrisma.payment.findFirst.mockResolvedValueOnce({
        id: 'pmt-1',
        orderId: 'ord-123',
        providerOrderId: 'UPAY-RL100200',
        amount: 2500,
        status: PaymentStatus.PAID,
        order: { id: 'ord-123' },
      });

      const result = await service.processWebhook(validHeaders, validWebhookPayload);

      expect(result.success).toBe(true);
      expect(result.idempotent).toBe(true);
      expect(mockPrisma.$transaction).not.toHaveBeenCalled();
    });

    it('rejects webhooks with mismatched payment amounts', async () => {
      mockPrisma.payment.findFirst.mockResolvedValueOnce({
        id: 'pmt-1',
        orderId: 'ord-123',
        providerOrderId: 'UPAY-RL100200',
        amount: 2500,
        status: PaymentStatus.PENDING,
        order: { id: 'ord-123' },
      });

      await expect(
        service.processWebhook(validHeaders, {
          ...validWebhookPayload,
          amount: '100.00',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects duplicate transaction ID used for another payment', async () => {
      mockPrisma.payment.findFirst
        .mockResolvedValueOnce({
          id: 'pmt-1',
          orderId: 'ord-123',
          providerOrderId: 'UPAY-RL100200',
          amount: 2500,
          status: PaymentStatus.PENDING,
          order: { id: 'ord-123' },
        })
        .mockResolvedValueOnce({
          id: 'pmt-other',
          providerTransactionId: 'TRX_NAGAD_999',
          status: PaymentStatus.PAID,
        });

      await expect(
        service.processWebhook(validHeaders, validWebhookPayload),
      ).rejects.toThrow(BadRequestException);
    });

    it('handles explicit non-completed status (FAILED/CANCELLED) by setting status to FAILED', async () => {
      mockPrisma.payment.findFirst.mockResolvedValueOnce({
        id: 'pmt-1',
        orderId: 'ord-123',
        providerOrderId: 'UPAY-RL100200',
        amount: 2500,
        status: PaymentStatus.PENDING,
        order: { id: 'ord-123' },
      });

      const result = await service.processWebhook(validHeaders, {
        ...validWebhookPayload,
        status: 'FAILED',
      });

      expect(result.success).toBe(true);
      expect(mockPrisma.payment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: PaymentStatus.FAILED,
          }),
        }),
      );
    });
  });

  describe('Order Cancellation & Stock Safety', () => {
    it('safely releases stock via ordersService.deleteUnpaidOrFailedOrder', async () => {
      const result = await service.handleFailedPayment('ord-123', 'User aborted');
      expect(result.success).toBe(true);
      expect(mockOrdersService.deleteUnpaidOrFailedOrder).toHaveBeenCalledWith('ord-123', 'User aborted');
    });

    it('prevents deleting an already paid order in fallback deletion', async () => {
      const serviceNoOrders = new UddoktaPaymentService(mockPrisma as any, mockConfig as any);
      mockPrisma.order.findFirst.mockResolvedValue({
        id: 'ord-1',
        orderNumber: '#RL1',
        paymentStatus: PaymentStatus.PAID,
      });

      const result = await serviceNoOrders.handleFailedPayment('ord-1');
      expect(result.success).toBe(false);
      expect(result.message).toContain('Cannot delete already paid order');
    });
  });

  describe('Base URL & Endpoint Resolution', () => {
    it('correctly constructs endpoints when base URL has trailing /api', () => {
      const customConfig = {
        get: vi.fn((key: string) => {
          if (key === 'UDDOKTAPAY_BASE_URL') return 'https://ronginlibas.paymently.io/api';
          return undefined;
        }),
      };
      const customService = new UddoktaPaymentService(mockPrisma as any, customConfig as any);

      expect(customService.getApiEndpoint('checkout-v2')).toBe('https://ronginlibas.paymently.io/api/checkout-v2');
      expect(customService.getApiEndpoint('/checkout-v2')).toBe('https://ronginlibas.paymently.io/api/checkout-v2');
      expect(customService.getApiEndpoint('verify-payment')).toBe('https://ronginlibas.paymently.io/api/verify-payment');
    });

    it('correctly constructs endpoints when base URL does not have /api', () => {
      const customConfig = {
        get: vi.fn((key: string) => {
          if (key === 'UDDOKTAPAY_BASE_URL') return 'https://ronginlibas.paymently.io';
          return undefined;
        }),
      };
      const customService = new UddoktaPaymentService(mockPrisma as any, customConfig as any);

      expect(customService.getApiEndpoint('checkout-v2')).toBe('https://ronginlibas.paymently.io/api/checkout-v2');
      expect(customService.getApiEndpoint('verify-payment')).toBe('https://ronginlibas.paymently.io/api/verify-payment');
    });
  });
});
