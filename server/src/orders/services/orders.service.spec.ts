import { vi } from 'vitest';
import { OrderStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import { SettingsService } from '../../settings/services/settings.service.js';
import { UpdateOrderStatusDto } from '../dto/update-order-status.dto.js';
import { OrdersService } from './orders.service.js';

describe('OrdersService customer access', () => {
  it('returns a guest tracking token without exposing the stored token hash', async () => {
    const safeOrder = {
      id: 'order-id',
      orderNumber: '#RL12345678',
      status: OrderStatus.PENDING,
      paymentStatus: 'PENDING',
      paymentMethod: 'COD',
      subtotal: 100,
      discountAmount: 0,
      deliveryCharge: 80,
      totalAmount: 180,
      shippingAddress: { addressLine1: 'Road 1', city: 'Dhaka', division: 'Dhaka', phone: '01711234567' },
      customerNotes: null,
      courierName: null,
      trackingNumber: null,
      trackingUrl: null,
      estimatedDelivery: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      items: [],
      trackingEvents: [],
    };
    const transaction = {
      productVariant: {
        findFirst: vi.fn().mockResolvedValue({
          id: 'variant-id',
          productId: 'product-id',
          isActive: true,
          stock: 2,
          priceOverride: null,
          color: 'Navy',
          sizeLabel: 'M',
          size: 'M',
          sku: 'RL-001',
          product: { id: 'product-id', name: 'Panjabi', price: 100 },
        }),
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
      inventoryTransaction: { create: vi.fn().mockResolvedValue({ id: 'stock-event' }) },
      order: { create: vi.fn().mockResolvedValue(safeOrder) },
    };
    const prisma = {
      $transaction: vi.fn((callback: (tx: typeof transaction) => Promise<unknown>) =>
        callback(transaction),
      ),
    } as unknown as PrismaService;
    const settings = {
      getPublicSettings: vi.fn().mockResolvedValue({
        freeDeliveryThreshold: 1000,
        dhakaDeliveryCharge: 80,
        outsideDhakaDeliveryCharge: 130,
      }),
    } as unknown as SettingsService;
    const service = new OrdersService(prisma, settings);

    const result = await service.create(
      {
        items: [{ productId: 'product-id', variantId: 'variant-id', quantity: 1 }],
        guestName: 'Guest',
        shippingAddress: {
          addressLine1: 'Road 1',
          city: 'Dhaka',
          division: 'Dhaka',
          phone: '01711234567',
        },
      } as Parameters<OrdersService['create']>[0],
    );

    expect(transaction.order.create).toHaveBeenCalledWith(
      expect.objectContaining({
        select: expect.objectContaining({
          items: expect.any(Object),
          trackingEvents: expect.any(Object),
        }),
      }),
    );
    expect(result).not.toHaveProperty('trackingTokenHash');
    expect(result.guestTrackingToken).toEqual(expect.any(String));
  });

  it('returns only customer-visible order data and tracking events', async () => {
    const order = {
      id: 'order-id',
      orderNumber: '#RL12345678',
      customerId: 'customer-id',
      guestPhone: null,
      trackingTokenHash: 'stored-hash',
      status: 'SHIPPED',
      paymentStatus: 'PENDING',
      paymentMethod: 'COD',
      subtotal: 100,
      discountAmount: 0,
      deliveryCharge: 80,
      totalAmount: 180,
      shippingAddress: {},
      customerNotes: null,
      courierName: null,
      trackingNumber: null,
      trackingUrl: null,
      estimatedDelivery: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      items: [],
      trackingEvents: [
        { status: 'SHIPPED', description: 'Package shipped', createdAt: new Date() },
      ],
    };
    const findUnique = vi.fn().mockResolvedValue(order);
    const prisma = { order: { findUnique } } as unknown as PrismaService;
    const settings = {} as SettingsService;
    const service = new OrdersService(prisma, settings);

    const result = await service.getOrderForCustomerAccess(order.orderNumber, 'customer-id');

    expect(findUnique).toHaveBeenCalledWith({
      where: { orderNumber: order.orderNumber },
      select: expect.objectContaining({
        trackingEvents: expect.objectContaining({
          where: { customerVisible: true },
        }),
      }),
    });
    expect(result).not.toHaveProperty('trackingTokenHash');
    expect(result).not.toHaveProperty('customerId');
    expect(result).not.toHaveProperty('guestPhone');
    expect(result.trackingEvents).toEqual(order.trackingEvents);
  });

  it('restores reserved stock and writes inventory history when an order is cancelled', async () => {
    const order = {
      id: 'order-id',
      orderNumber: '#RL12345678',
      status: OrderStatus.PROCESSING,
      items: [{ variantId: 'variant-id', quantity: 2 }],
    };
    const transaction = {
      order: {
        findFirst: vi.fn().mockResolvedValue(order),
        update: vi.fn().mockResolvedValue({ ...order, status: OrderStatus.CANCELLED }),
      },
      productVariant: {
        findUnique: vi.fn().mockResolvedValue({ id: 'variant-id', stock: 4 }),
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
      inventoryTransaction: { create: vi.fn().mockResolvedValue({ id: 'stock-event' }) },
      orderTrackingEvent: { create: vi.fn().mockResolvedValue({ id: 'tracking-event' }) },
    };
    const prisma = {
      $transaction: vi.fn((callback: (tx: typeof transaction) => Promise<unknown>) =>
        callback(transaction),
      ),
    } as unknown as PrismaService;
    const service = new OrdersService(prisma, {} as SettingsService);

    await service.updateStatus('order-id', { status: OrderStatus.CANCELLED } as UpdateOrderStatusDto);

    expect(transaction.productVariant.updateMany).toHaveBeenCalledWith({
      where: { id: 'variant-id', stock: 4 },
      data: { stock: 6 },
    });
    expect(transaction.inventoryTransaction.create).toHaveBeenCalledWith({
      data: {
        variantId: 'variant-id',
        quantityChange: 2,
        previousStock: 4,
        newStock: 6,
        type: 'RETURN',
        note: 'Order cancellation #RL12345678',
      },
    });
    expect(transaction.order.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'order-id' } }),
    );
  });
});
