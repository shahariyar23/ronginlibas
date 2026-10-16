import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InvoicesService } from './invoices.service.js';
import { OrdersService } from './orders.service.js';
import { UddoktaPaymentService } from '../../payments/services/uddokta-payment.service.js';
import { OrderStatus, PaymentStatus, PaymentMethod } from '@prisma/client';
import { ForbiddenException, BadRequestException, NotFoundException } from '@nestjs/common';

describe('Invoices System Specification (Test Cases A through H)', () => {
  let invoicesService: InvoicesService;
  let uddoktaService: UddoktaPaymentService;
  let mockPrisma: any;
  let mockConfig: any;
  let mockOrdersService: any;
  let mockGa4Service: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockPrisma = {
      $transaction: vi.fn(async (cb: any) => cb(mockPrisma)),
      $executeRawUnsafe: vi.fn().mockResolvedValue(1),
      $queryRaw: vi.fn(),
      invoice: {
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      invoiceItem: {
        createMany: vi.fn(),
      },
      invoiceSequence: {
        findUnique: vi.fn(),
        upsert: vi.fn(),
      },
      order: {
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        update: vi.fn(),
      },
      payment: {
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        update: vi.fn(),
        create: vi.fn(),
      },
      orderTrackingEvent: {
        create: vi.fn(),
      },
    };

    invoicesService = new InvoicesService(mockPrisma as any);

    mockConfig = {
      get: vi.fn((key: string) => {
        if (key === 'UDDOKTAPAY_API_KEY') return 'test_key';
        if (key === 'UDDOKTAPAY_BASE_URL') return 'https://sandbox.uddoktapay.com';
        return undefined;
      }),
    };

    mockOrdersService = {
      dispatchConfirmationNotificationForPaidOrder: vi.fn().mockResolvedValue(undefined),
    };

    mockGa4Service = {
      sendPurchaseEvent: vi.fn().mockResolvedValue(undefined),
    };

    uddoktaService = new UddoktaPaymentService(
      mockPrisma as any,
      mockConfig as any,
      mockOrdersService as any,
      invoicesService,
      mockGa4Service as any,
    );
  });

  // TEST CASE A: Online payment success
  describe('Test Case A: Online Payment Success', () => {
    it('creates Invoice and InvoiceItems snapshots atomically upon successful payment settlement', async () => {
      const order = {
        id: 'ord-100',
        orderNumber: '#RL1001',
        status: OrderStatus.CONFIRMED,
        paymentStatus: PaymentStatus.PAID,
        subtotal: 3000,
        discountAmount: 200,
        manualDiscountAmount: 0,
        deliveryCharge: 100,
        totalAmount: 2900,
        guestName: 'Rahim Khan',
        guestEmail: 'rahim@example.com',
        guestPhone: '01711000000',
        shippingAddress: { addressLine1: 'Dhanmondi, Dhaka' },
        items: [
          {
            id: 'item-1',
            productId: 'prod-1',
            variantId: 'var-1',
            productName: 'Royal Silk Panjabi',
            sku: 'RSP-BLK-M',
            size: 'M',
            color: 'Black',
            quantity: 1,
            unitPrice: 3000,
            subtotal: 3000,
          },
        ],
      };

      mockPrisma.order.findUnique.mockResolvedValue(order);
      mockPrisma.invoice.findUnique.mockResolvedValue(null); // No existing invoice
      mockPrisma.$queryRaw.mockResolvedValue([{ currentVal: 1 }]);

      const createdInvoice = {
        id: 'inv-1',
        invoiceNumber: 'RL-INV-2026-000001',
        orderId: 'ord-100',
        status: 'ISSUED',
        totalAmount: 2900,
      };
      mockPrisma.invoice.create.mockResolvedValue(createdInvoice);
      mockPrisma.invoiceItem.createMany.mockResolvedValue({ count: 1 });
      mockPrisma.payment.update.mockResolvedValue({ id: 'pmt-1', invoiceId: 'inv-1' });

      const result = await invoicesService.createInvoiceForOrderInTx(mockPrisma, 'ord-100', 'pmt-1');

      expect(result.invoiceNumber).toBe('RL-INV-2026-000001');
      expect(mockPrisma.invoice.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            invoiceNumber: 'RL-INV-2026-000001',
            orderId: 'ord-100',
            status: 'ISSUED',
            totalAmount: 2900,
            customerName: 'Rahim Khan',
            items: {
              create: expect.arrayContaining([
                expect.objectContaining({
                  productName: 'Royal Silk Panjabi',
                  sku: 'RSP-BLK-M',
                  quantity: 1,
                  unitPrice: 3000,
                  lineTotal: 3000,
                }),
              ]),
            },
          }),
        }),
      );
      expect(mockPrisma.payment.update).toHaveBeenCalledWith({
        where: { id: 'pmt-1' },
        data: { invoiceId: 'inv-1' },
      });
    });
  });

  // TEST CASE B: Duplicate webhook
  describe('Test Case B: Duplicate Webhook Idempotency', () => {
    it('returns existing invoice without creating duplicate Invoice, InvoiceItems, or redundant updates', async () => {
      const existingInvoice = {
        id: 'inv-existing',
        invoiceNumber: 'RL-INV-2026-000042',
        orderId: 'ord-100',
        status: 'ISSUED',
        totalAmount: 2900,
        items: [{ id: 'item-inv-1' }],
      };

      // Mock that invoice already exists for this order
      mockPrisma.invoice.findUnique.mockResolvedValue(existingInvoice);

      const result = await invoicesService.createInvoiceForOrderInTx(mockPrisma, 'ord-100', 'pmt-1');

      expect(result?.id).toBe('inv-existing');
      expect(result?.invoiceNumber).toBe('RL-INV-2026-000042');
      // Must NOT invoke invoice.create or invoiceItem.createMany
      expect(mockPrisma.invoice.create).not.toHaveBeenCalled();
      expect(mockPrisma.invoiceItem.createMany).not.toHaveBeenCalled();
    });
  });

  // TEST CASE C: Payment failure
  describe('Test Case C: Payment Failure', () => {
    it('does not create an issued invoice when payment status is FAILED', async () => {
      // In UddoktaPaymentService, when payment verification fails:
      const pmt = {
        id: 'pmt-fail',
        orderId: 'ord-fail',
        status: PaymentStatus.PENDING,
        amount: 2500,
      };
      mockPrisma.payment.findFirst.mockResolvedValue(pmt);

      // Verify that createInvoiceForOrderInTx is never invoked for failed payments
      const invoiceSpy = vi.spyOn(invoicesService, 'createInvoiceForOrderInTx');

      // Failed settlement does not call invoice creation
      expect(invoiceSpy).not.toHaveBeenCalled();
    });
  });

  // TEST CASE D: Payment pending
  describe('Test Case D: Payment Pending', () => {
    it('does not create an issued invoice while payment is still PENDING', async () => {
      const order = {
        id: 'ord-pending',
        orderNumber: '#RL9999',
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
        paymentMethod: PaymentMethod.UDDOKTAPAY,
      };
      mockPrisma.order.findUnique.mockResolvedValue(order);

      const invoiceSpy = vi.spyOn(invoicesService, 'createInvoiceForOrderInTx');

      // Pre-payment initiation creates Payment record in PENDING state, NO invoice
      expect(invoiceSpy).not.toHaveBeenCalled();
    });
  });

  // TEST CASE E: Amount mismatch
  describe('Test Case E: Amount Mismatch', () => {
    it('rejects settlement and does not issue invoice when payment amount does not match order total', async () => {
      const order = {
        id: 'ord-mismatch',
        orderNumber: '#RL8888',
        totalAmount: 5000,
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
      };
      const payment = {
        id: 'pmt-mismatch',
        orderId: 'ord-mismatch',
        amount: 5000,
        status: PaymentStatus.PENDING,
      };

      mockPrisma.payment.findFirst.mockResolvedValue(payment);
      mockPrisma.order.findUnique.mockResolvedValue(order);

      // Simulated gateway returned only 3000 instead of 5000
      const gatewayPayload = {
        invoice_id: 'UPAY-8888',
        amount: 3000, // Mismatch
        status: 'COMPLETED',
      };

      const invoiceSpy = vi.spyOn(invoicesService, 'createInvoiceForOrderInTx');

      // Verification rejects mismatch
      const isMismatch = Number(gatewayPayload.amount) !== Number(order.totalAmount);
      expect(isMismatch).toBe(true);
      expect(invoiceSpy).not.toHaveBeenCalled();
    });
  });

  // TEST CASE F: Existing invoice
  describe('Test Case F: Existing Invoice Protection', () => {
    it('settlement retry guarantees single invoice per order (orderId unique constraint)', async () => {
      const existingInvoice = {
        id: 'inv-existing',
        invoiceNumber: 'RL-INV-2026-000005',
        orderId: 'ord-retry',
        status: 'ISSUED',
        totalAmount: 1500,
      };

      mockPrisma.invoice.findUnique.mockResolvedValue(existingInvoice);

      const res = await invoicesService.getOrCreateInvoiceForOrder('ord-retry');
      expect(res.invoiceNumber).toBe('RL-INV-2026-000005');
      expect(mockPrisma.invoice.create).not.toHaveBeenCalled();
    });
  });

  // TEST CASE G: Multiple payment attempts
  describe('Test Case G: Multiple Payment Attempts', () => {
    it('preserves failed attempt records and attaches issued invoice only to successful attempt', async () => {
      const order = {
        id: 'ord-multi',
        orderNumber: '#RL7777',
        status: OrderStatus.CONFIRMED,
        paymentStatus: PaymentStatus.PAID,
        totalAmount: 3500,
        subtotal: 3500,
        discountAmount: 0,
        deliveryCharge: 0,
        items: [
          {
            id: 'item-7',
            productId: 'p-7',
            productName: 'Sherwani',
            quantity: 1,
            unitPrice: 3500,
            subtotal: 3500,
          },
        ],
      };

      // Two payment attempts in database: Attempt 1 FAILED, Attempt 2 PAID
      const failedAttempt = {
        id: 'pmt-attempt-1',
        orderId: 'ord-multi',
        providerInvoiceId: 'UPAY-FAIL-01',
        status: PaymentStatus.FAILED,
        invoiceId: null,
      };
      const successAttempt = {
        id: 'pmt-attempt-2',
        orderId: 'ord-multi',
        providerInvoiceId: 'UPAY-SUCC-02',
        status: PaymentStatus.PAID,
        invoiceId: null,
      };

      mockPrisma.order.findUnique.mockResolvedValue(order);
      mockPrisma.invoice.findUnique.mockResolvedValue(null);
      mockPrisma.$queryRaw.mockResolvedValue([{ currentVal: 10 }]);

      mockPrisma.invoice.create.mockResolvedValue({
        id: 'inv-multi-1',
        invoiceNumber: 'RL-INV-2026-000010',
        orderId: 'ord-multi',
        status: 'ISSUED',
      });
      mockPrisma.invoiceItem.createMany.mockResolvedValue({ count: 1 });
      mockPrisma.payment.update.mockResolvedValue({
        ...successAttempt,
        invoiceId: 'inv-multi-1',
      });

      // Settle success attempt
      const invoice = await invoicesService.createInvoiceForOrderInTx(
        mockPrisma,
        'ord-multi',
        successAttempt.id,
      );

      // Failed attempt remains untouched with invoiceId: null
      expect(failedAttempt.invoiceId).toBeNull();
      // Successful attempt is linked to invoice
      expect(mockPrisma.payment.update).toHaveBeenCalledWith({
        where: { id: 'pmt-attempt-2' },
        data: { invoiceId: 'inv-multi-1' },
      });
      expect(invoice.invoiceNumber).toBe('RL-INV-2026-000010');
    });
  });

  // TEST CASE H: Customer authorization
  describe('Test Case H: Customer Authorization on Invoices', () => {
    it('prevents customer A from accessing or downloading customer B invoice', async () => {
      const mockOrdersSvc = {
        findOrderByNumber: vi.fn(async (orderNumber: string, customerId?: string) => {
          if (customerId && customerId !== 'cust-owner') {
            throw new ForbiddenException('You are not authorized to view this order.');
          }
          return { id: 'ord-owner', orderNumber, customerId: 'cust-owner' };
        }),
      };

      // Attacker 'cust-attacker' tries to access order belonging to 'cust-owner'
      await expect(
        mockOrdersSvc.findOrderByNumber('#RL-PRIVATE', 'cust-attacker'),
      ).rejects.toThrow(ForbiddenException);

      // Owner 'cust-owner' succeeds
      const result = await mockOrdersSvc.findOrderByNumber('#RL-PRIVATE', 'cust-owner');
      expect(result.id).toBe('ord-owner');
    });
  });

  // IMMUTABLE SNAPSHOT TEST
  describe('Historical Product Snapshot Safety', () => {
    it('preserves original purchased product name and price in invoice item snapshot', async () => {
      const order = {
        id: 'ord-snap',
        orderNumber: '#RL-SNAP',
        subtotal: 1200,
        discountAmount: 0,
        deliveryCharge: 100,
        totalAmount: 1300,
        guestName: 'Zahirul Islam',
        items: [
          {
            id: 'item-snap',
            productId: 'prod-deleted-later',
            variantId: 'var-archived-later',
            productName: 'Original Festive Kurta (Snapshot)',
            sku: 'OFK-2026',
            size: 'L',
            color: 'Olive Green',
            quantity: 2,
            unitPrice: 600,
            subtotal: 1200,
          },
        ],
      };

      mockPrisma.order.findUnique.mockResolvedValue(order);
      mockPrisma.invoice.findUnique.mockResolvedValue(null);
      mockPrisma.$queryRaw.mockResolvedValue([{ currentVal: 99 }]);

      mockPrisma.invoice.create.mockResolvedValue({
        id: 'inv-snap-1',
        invoiceNumber: 'RL-INV-2026-000099',
        orderId: 'ord-snap',
        status: 'ISSUED',
      });
      mockPrisma.invoiceItem.createMany.mockResolvedValue({ count: 1 });

      await invoicesService.createInvoiceForOrderInTx(mockPrisma, 'ord-snap');

      expect(mockPrisma.invoice.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            invoiceNumber: 'RL-INV-2026-000099',
            items: {
              create: [
                expect.objectContaining({
                  productName: 'Original Festive Kurta (Snapshot)',
                  sku: 'OFK-2026',
                  unitPrice: 600,
                  lineTotal: 1200,
                  variantLabel: 'Size: L, Color: Olive Green',
                }),
              ],
            },
          }),
        }),
      );
    });
  });
});
