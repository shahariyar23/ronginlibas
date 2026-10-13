import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { CartService } from './cart.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { SettingsService } from '../settings/services/settings.service.js';
import { MailService } from '../mail/mail.service.js';
import { AuditService } from '../audit/audit.service.js';

describe('CartService - restoreOrderToCart', () => {
  let service: CartService;
  let mockPrisma: any;
  let mockSettings: any;
  let mockMail: any;
  let mockAudit: any;

  beforeEach(() => {
    mockPrisma = {
      order: {
        findFirst: vi.fn(),
        update: vi.fn(),
      },
      orderTrackingEvent: {
        create: vi.fn(),
      },
      cart: {
        findUnique: vi.fn(),
        upsert: vi.fn(),
        findUniqueOrThrow: vi.fn(),
      },
      cartItem: {
        findUnique: vi.fn(),
        create: vi.fn(),
        upsert: vi.fn(),
        deleteMany: vi.fn(),
      },
      productVariant: {
        findUnique: vi.fn(),
        updateMany: vi.fn(),
      },
      inventoryTransaction: {
        create: vi.fn(),
      },
      $transaction: vi.fn(async (cb: any) => cb(mockPrisma)),
    };

    mockSettings = {
      getPublicSettings: vi.fn().mockResolvedValue({
        freeShippingEnabled: true,
        freeDeliveryThreshold: 2000,
      }),
    };
    mockMail = {};
    mockAudit = {};

    service = new CartService(
      mockPrisma as unknown as PrismaService,
      mockSettings as unknown as SettingsService,
      mockMail as unknown as MailService,
      mockAudit as unknown as AuditService,
    );
  });

  it('rejects restoration if order is already PAID', async () => {
    mockPrisma.order.findFirst.mockResolvedValue({
      id: 'ord-1',
      orderNumber: '#RL1001',
      customerId: 'cust-1',
      paymentStatus: 'PAID',
      status: 'CONFIRMED',
      items: [],
    });

    await expect(
      service.restoreOrderToCart('cust-1', undefined, '#RL1001'),
    ).rejects.toThrow(BadRequestException);
  });

  it('rejects restoration if order belongs to a different customer', async () => {
    mockPrisma.order.findFirst.mockResolvedValue({
      id: 'ord-1',
      orderNumber: '#RL1001',
      customerId: 'cust-owner',
      paymentStatus: 'PENDING',
      status: 'PENDING',
      items: [],
    });

    await expect(
      service.restoreOrderToCart('cust-attacker', undefined, '#RL1001'),
    ).rejects.toThrow(ForbiddenException);
  });

  it('throws NotFoundException if order does not exist', async () => {
    mockPrisma.order.findFirst.mockResolvedValue(null);

    await expect(
      service.restoreOrderToCart('cust-1', undefined, '#RL-NOT-EXIST'),
    ).rejects.toThrow(NotFoundException);
  });

  it('restores eligible items from an unpaid order without duplicating items already in cart', async () => {
    const orderItems = [
      {
        id: 'oi-1',
        variantId: 'v-1',
        productId: 'p-1',
        quantity: 2,
      },
      {
        id: 'oi-2',
        variantId: 'v-2',
        productId: 'p-2',
        quantity: 1,
      },
    ];

    mockPrisma.order.findFirst.mockResolvedValue({
      id: 'ord-1',
      orderNumber: '#RL1001',
      customerId: 'cust-1',
      paymentStatus: 'PENDING',
      status: 'PENDING',
      items: orderItems,
    });

    // Customer cart exists with cart ID cart-1
    mockPrisma.cart.findUnique.mockResolvedValue({ id: 'cart-1', customerId: 'cust-1' });

    // Stock check for inventory restoration of pending order
    mockPrisma.productVariant.findUnique.mockImplementation(({ where }: any) => {
      if (where.id === 'v-1') {
        return Promise.resolve({
          id: 'v-1',
          productId: 'p-1',
          stock: 4,
          isActive: true,
          product: { isActive: true },
        });
      }
      if (where.id === 'v-2') {
        return Promise.resolve({
          id: 'v-2',
          productId: 'p-2',
          stock: 3,
          isActive: true,
          product: { isActive: true },
        });
      }
      return Promise.resolve(null);
    });

    // v-1 is ALREADY in the cart; v-2 is NOT in the cart
    mockPrisma.cartItem.findUnique.mockImplementation(({ where }: any) => {
      if (where.cartId_variantId?.variantId === 'v-1') {
        return Promise.resolve({ id: 'ci-existing-1', quantity: 2 });
      }
      return Promise.resolve(null);
    });

    // Stub getCart return
    vi.spyOn(service, 'getCart').mockResolvedValue({
      cartId: 'cart-1',
      items: [],
      subtotal: 0,
      deliveryCharge: 0,
      total: 0,
      currency: 'BDT',
    });

    await service.restoreOrderToCart('cust-1', undefined, '#RL1001');

    // v-1 was already present, so cartItem.create should NOT be called for v-1
    expect(mockPrisma.cartItem.create).not.toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ variantId: 'v-1' }),
      }),
    );

    // v-2 was not in the cart, so cartItem.create SHOULD be called for v-2
    expect(mockPrisma.cartItem.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          cartId: 'cart-1',
          variantId: 'v-2',
          productId: 'p-2',
          quantity: 1,
        }),
      }),
    );
  });
});
