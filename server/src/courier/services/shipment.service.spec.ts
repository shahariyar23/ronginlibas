import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ShipmentService } from './shipment.service.js';
import { MockSteadfastCourierProvider } from '../providers/mock-steadfast.provider.js';
import { OrderStatus, PaymentStatus, ShipmentStatus } from '@prisma/client';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

describe('ShipmentService', () => {
  let service: ShipmentService;
  let mockPrisma: any;
  let mockConfigService: any;
  let mockInvoicesService: any;
  let mockProvider: MockSteadfastCourierProvider;

  beforeEach(() => {
    mockProvider = new MockSteadfastCourierProvider();

    mockConfigService = {
      get: vi.fn((key: string) => {
        if (key === 'STEADFAST_MODE') return 'mock';
        if (key === 'STEADFAST_WEBHOOK_SECRET') return 'test_webhook_secret_key_123';
        return null;
      }),
    };

    mockInvoicesService = {
      getOrCreateInvoiceForOrder: vi.fn().mockImplementation((orderId: string) =>
        Promise.resolve({
          id: `inv-${orderId}`,
          invoiceNumber: `RL-INV-${orderId}`,
          totalAmount: 2500,
        }),
      ),
    };

    mockPrisma = {
      order: {
        findUnique: vi.fn(),
        update: vi.fn().mockResolvedValue({}),
      },
      shipment: {
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      shipmentEvent: {
        create: vi.fn().mockResolvedValue({}),
      },
      $transaction: vi.fn(async (cb: (tx: any) => Promise<any>) => cb(mockPrisma)),
    };

    service = new ShipmentService(
      mockPrisma as any,
      mockConfigService as any,
      mockInvoicesService as any,
      mockProvider,
    );
  });

  describe('Authoritative COD Amount Calculation', () => {
    it('sets codAmount to 0 for fully prepaid orders (paymentStatus: PAID)', async () => {
      mockPrisma.order.findUnique.mockResolvedValue({
        id: 'ord-prepaid',
        orderNumber: '#RL101',
        status: OrderStatus.CONFIRMED,
        paymentStatus: PaymentStatus.PAID,
        totalAmount: 3500,
        paidAmount: 3500,
        shippingAddress: {
          fullName: 'Sartorial Patron',
          phone: '01712345678',
          address: 'Banani 11, Dhaka',
        },
      });

      mockPrisma.shipment.findFirst.mockResolvedValue(null);
      mockPrisma.shipment.create.mockImplementation((args: any) => ({
        id: 'ship-1',
        ...args.data,
      }));

      const res = await service.createShipmentForOrder('ord-prepaid');
      expect(res.codAmount).toBe(0);
      expect(mockPrisma.shipment.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ codAmount: 0 }),
        }),
      );
    });

    it('sets codAmount to total order amount for unpaid COD orders', async () => {
      mockPrisma.order.findUnique.mockResolvedValue({
        id: 'ord-cod',
        orderNumber: '#RL102',
        status: OrderStatus.CONFIRMED,
        paymentStatus: PaymentStatus.PENDING,
        totalAmount: 2400,
        paidAmount: 0,
        shippingAddress: {
          fullName: 'Tariq Ali',
          phone: '01712345678',
          address: 'Uttara Sector 4, Dhaka',
        },
      });

      mockPrisma.shipment.findFirst.mockResolvedValue(null);
      mockPrisma.shipment.create.mockImplementation((args: any) => ({
        id: 'ship-2',
        ...args.data,
      }));

      const res = await service.createShipmentForOrder('ord-cod');
      expect(res.codAmount).toBe(2400);
    });

    it('sets codAmount to remaining balance for partially paid orders', async () => {
      mockPrisma.order.findUnique.mockResolvedValue({
        id: 'ord-partial',
        orderNumber: '#RL103',
        status: OrderStatus.CONFIRMED,
        paymentStatus: PaymentStatus.PARTIALLY_PAID,
        totalAmount: 5000,
        paidAmount: 2000,
        shippingAddress: {
          fullName: 'Zubair Hossain',
          phone: '01712345678',
          address: 'Dhanmondi, Dhaka',
        },
      });

      mockPrisma.shipment.findFirst.mockResolvedValue(null);
      mockPrisma.shipment.create.mockImplementation((args: any) => ({
        id: 'ship-3',
        ...args.data,
      }));

      const res = await service.createShipmentForOrder('ord-partial');
      expect(res.codAmount).toBe(3000); // 5000 - 2000
    });
  });

  describe('Duplicate Consignment Prevention & Idempotency', () => {
    it('throws ConflictException if an active consignment is already booked for this order', async () => {
      mockPrisma.order.findUnique.mockResolvedValue({
        id: 'ord-already-shipped',
        orderNumber: '#RL104',
        status: OrderStatus.SHIPPED,
        totalAmount: 2000,
        shippingAddress: { phone: '01700000000', address: 'Dhaka' },
      });

      mockPrisma.shipment.findFirst.mockResolvedValue({
        id: 'ship-existing',
        orderId: 'ord-already-shipped',
        provider: 'STEADFAST',
        consignmentId: 'CID-9988',
        trackingCode: 'ST9988',
        status: ShipmentStatus.IN_TRANSIT,
      });

      await expect(service.createShipmentForOrder('ord-already-shipped')).rejects.toThrow(
        ConflictException,
      );
      expect(mockPrisma.shipment.create).not.toHaveBeenCalled();
    });
  });

  describe('Order State & Recipient Validation', () => {
    it('throws BadRequestException if the order is already cancelled', async () => {
      mockPrisma.order.findUnique.mockResolvedValue({
        id: 'ord-cancelled',
        orderNumber: '#RL105',
        status: OrderStatus.CANCELLED,
        shippingAddress: { phone: '01700000000', address: 'Dhaka' },
      });

      await expect(service.createShipmentForOrder('ord-cancelled')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('throws BadRequestException if recipient phone number is missing or invalid', async () => {
      mockPrisma.order.findUnique.mockResolvedValue({
        id: 'ord-no-phone',
        orderNumber: '#RL106',
        status: OrderStatus.CONFIRMED,
        totalAmount: 1000,
        shippingAddress: {
          phone: '', // missing phone
          address: 'Dhaka',
        },
      });

      mockPrisma.shipment.findFirst.mockResolvedValue(null);

      await expect(service.createShipmentForOrder('ord-no-phone')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('Status Synchronization & Delivery Automation', () => {
    it('automatically advances Order status to DELIVERED and marks COD payment PAID upon delivery sync', async () => {
      mockPrisma.shipment.findFirst.mockResolvedValue({
        id: 'ship-sync-1',
        orderId: 'ord-deliv',
        consignmentId: '1005', // Seeded in mock provider as 'delivered'
        trackingCode: 'ST1005',
        order: {
          id: 'ord-deliv',
          orderNumber: '#RL107',
          status: OrderStatus.SHIPPED,
          paymentMethod: 'COD',
          paymentStatus: PaymentStatus.PENDING,
          totalAmount: 1500,
        },
      });

      mockPrisma.shipment.update.mockResolvedValue({
        id: 'ship-sync-1',
        orderId: 'ord-deliv',
        provider: 'STEADFAST',
        consignmentId: '1005',
        trackingCode: 'ST1005',
        status: ShipmentStatus.DELIVERED,
        providerStatus: 'delivered',
        codAmount: 0,
        deliveryCharge: 80,
        trackingUrl: 'https://steadfast.com.bd/t/ST1005',
        recipientName: 'Patron',
        recipientPhone: '01700000000',
        recipientAddress: 'Dhaka',
        note: null,
        providerInvoice: 'RL-INV-2026-000005',
        lastSyncedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await service.refreshShipmentStatus('ord-deliv');
      expect(res.status).toBe(ShipmentStatus.DELIVERED);

      // Verify order update marked DELIVERED and paymentStatus PAID
      expect(mockPrisma.order.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'ord-deliv' },
          data: expect.objectContaining({
            status: OrderStatus.DELIVERED,
            paymentStatus: PaymentStatus.PAID,
            paidAmount: 1500,
          }),
        }),
      );
    });
  });

  describe('Steadfast Webhook Processing & Idempotency', () => {
    it('rejects unauthorized webhooks when signature/secret does not match configured secret', async () => {
      const payload = {
        consignment_id: '1001',
        status: 'delivered',
      };
      const invalidHeaders = {
        'x-steadfast-signature': 'wrong_secret',
      };

      await expect(service.processWebhook(payload, invalidHeaders)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('processes authorized webhook, updates status, and records ShipmentEvent', async () => {
      mockPrisma.shipment.findFirst.mockResolvedValue({
        id: 'ship-hook-1',
        orderId: 'ord-hook-1',
        consignmentId: '1001',
        order: {
          id: 'ord-hook-1',
          orderNumber: '#RL108',
          status: OrderStatus.SHIPPED,
          paymentMethod: 'COD',
          paymentStatus: PaymentStatus.PENDING,
          totalAmount: 2000,
        },
        events: [],
      });

      const payload = {
        consignment_id: '1001',
        status: 'delivered',
        invoice: 'RL-INV-2026-000001',
      };
      const validHeaders = {
        'x-steadfast-signature': 'test_webhook_secret_key_123',
      };

      const result = await service.processWebhook(payload, validHeaders);
      expect(result.success).toBe(true);

      expect(mockPrisma.shipment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'ship-hook-1' },
          data: expect.objectContaining({
            status: ShipmentStatus.DELIVERED,
            providerStatus: 'delivered',
          }),
        }),
      );

      expect(mockPrisma.shipmentEvent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            shipmentId: 'ship-hook-1',
            eventType: 'WEBHOOK_RECEIVED',
            status: ShipmentStatus.DELIVERED,
            source: 'WEBHOOK',
          }),
        }),
      );
    });

    it('safely handles duplicate webhook deliveries idempotently without re-triggering side effects', async () => {
      mockPrisma.shipment.findFirst.mockResolvedValue({
        id: 'ship-hook-duplicate',
        orderId: 'ord-hook-2',
        consignmentId: '1001',
        order: {
          id: 'ord-hook-2',
          orderNumber: '#RL109',
          status: OrderStatus.DELIVERED,
          paymentStatus: PaymentStatus.PAID,
        },
        events: [
          {
            eventType: 'WEBHOOK_RECEIVED',
            status: ShipmentStatus.DELIVERED,
          },
        ],
      });

      const payload = {
        consignment_id: '1001',
        status: 'delivered',
      };
      const validHeaders = {
        'x-steadfast-signature': 'test_webhook_secret_key_123',
      };

      const result = await service.processWebhook(payload, validHeaders);
      expect(result.success).toBe(true);
      expect(result.message).toContain('Idempotent');
      // Must not call shipment.update or order.update again
      expect(mockPrisma.shipment.update).not.toHaveBeenCalled();
    });
  });
});
