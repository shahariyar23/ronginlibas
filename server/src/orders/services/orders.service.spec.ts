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

describe('OrdersService.createByAdmin', () => {
  const actor = {
    id: 'admin-id-123',
    firstName: 'Mostak',
    lastName: 'Admin',
    email: 'admin@ronginlibas.com',
    role: 'SUPER_ADMIN',
  };

  const sampleVariant = {
    id: 'var-1',
    productId: 'prod-1',
    sku: 'RL-POLO-GRN-L',
    size: 'L',
    sizeLabel: 'L',
    color: 'Forest Green',
    stock: 10,
    priceOverride: null,
    isActive: true,
    product: {
      id: 'prod-1',
      name: 'Mercerized Polo T-Shirt',
      price: 1590,
      compareAtPrice: 1890,
      isActive: true,
      deletedAt: null,
      images: [{ url: 'https://cdn.example.com/polo.jpg', isPrimary: true }],
    },
  };

  function setupAdminPrismaMock(options?: {
    variant?: any;
    customer?: any;
    coupon?: any;
    updateManyCount?: number;
  }) {
    const variantData = options?.variant !== undefined ? options.variant : sampleVariant;
    const customerData = options?.customer !== undefined ? options.customer : null;
    const couponData = options?.coupon !== undefined ? options.coupon : null;
    const updateCount = options?.updateManyCount !== undefined ? options.updateManyCount : 1;

    const tx = {
      customer: {
        findUnique: vi.fn().mockResolvedValue(customerData),
        findFirst: vi.fn().mockResolvedValue(customerData),
        create: vi.fn().mockImplementation((args) =>
          Promise.resolve({
            id: 'new-cust-id',
            firstName: args.data.firstName,
            lastName: args.data.lastName,
            phone: args.data.phone,
            email: args.data.email,
          }),
        ),
      },
      address: {
        findUnique: vi.fn().mockImplementation(({ where }) => {
          if (where.id === 'addr-1') {
            return Promise.resolve({
              id: 'addr-1',
              addressLine1: 'Section 10, Block C',
              city: 'Dhaka',
              division: 'Dhaka',
              phone: '01916664011',
              fullName: 'Mostak Shahariyar',
            });
          }
          return Promise.resolve(null);
        }),
        create: vi.fn().mockResolvedValue({ id: 'new-addr-id' }),
      },
      customerAddress: {
        findFirst: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({ id: 'new-addr-id' }),
      },
      productVariant: {
        findMany: vi.fn().mockResolvedValue(variantData ? [variantData] : []),
        findUnique: vi.fn().mockResolvedValue(variantData),
        findFirst: vi.fn().mockImplementation((args) => {
          if (!variantData) return Promise.resolve(null);
          if (args?.where?.product?.isActive === true && variantData.product?.isActive === false) {
            return Promise.resolve(null);
          }
          if (args?.where?.isActive === true && variantData.isActive === false) {
            return Promise.resolve(null);
          }
          return Promise.resolve(variantData);
        }),
        updateMany: vi.fn().mockResolvedValue({ count: updateCount }),
      },
      coupon: {
        findUnique: vi.fn().mockResolvedValue(couponData),
        update: vi.fn().mockResolvedValue({ count: 1 }),
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
      inventoryTransaction: {
        create: vi.fn().mockResolvedValue({ id: 'inv-tx-1' }),
      },
      order: {
        create: vi.fn().mockImplementation((args) =>
          Promise.resolve({
            id: 'admin-order-id-1',
            orderNumber: '#RL20261012-001',
            ...args.data,
            items: args.data.items?.create || [],
            trackingEvents: [],
            customer: customerData || {
              firstName: 'Test',
              lastName: 'Customer',
              phone: '01916664011',
            },
          }),
        ),
      },
      orderTrackingEvent: {
        create: vi.fn().mockResolvedValue({ id: 'evt-1' }),
      },
    };

    const prisma = {
      $transaction: vi.fn((cb: (txArg: typeof tx) => Promise<unknown>) => cb(tx)),
      address: {
        findUnique: vi.fn().mockImplementation(({ where }) => {
          if (where.id === 'addr-1') {
            return Promise.resolve({
              id: 'addr-1',
              addressLine1: 'Section 10, Block C',
              city: 'Dhaka',
              division: 'Dhaka',
              phone: '01916664011',
              fullName: 'Mostak Shahariyar',
            });
          }
          return Promise.resolve(null);
        }),
      },
    } as unknown as PrismaService;

    const settings = {
      getPublicSettings: vi.fn().mockResolvedValue({
        freeDeliveryThreshold: 2000,
        dhakaDeliveryCharge: 80,
        outsideDhakaDeliveryCharge: 130,
      }),
    } as unknown as SettingsService;

    return { prisma, settings, tx };
  }

  it('creates a COD order for an existing customer successfully with inventory decrement and transaction', async () => {
    const existingCustomer = {
      id: 'cust-101',
      firstName: 'Mostak',
      lastName: 'Shahariyar',
      phone: '01916664011',
      email: 'client@example.com',
      addresses: [
        {
          id: 'addr-1',
          division: 'Dhaka',
          district: 'Dhaka',
          thana: 'Mirpur',
          streetAddress: 'Section 10, Block C',
        },
      ],
    };

    const { prisma, settings, tx } = setupAdminPrismaMock({
      customer: existingCustomer,
    });
    tx.customerAddress.findFirst = vi.fn().mockResolvedValue(existingCustomer.addresses[0]);

    const service = new OrdersService(prisma, settings);

    const result = await service.createByAdmin(
      {
        customerId: 'cust-101',
        addressId: 'addr-1',
        items: [{ productVariantId: 'var-1', quantity: 2 }],
        paymentMethod: 'COD',
        paymentStatus: 'UNPAID',
        deliveryCharge: 80,
        courierProvider: 'Steadfast',
        source: 'ADMIN',
      },
      actor,
    );

    expect(tx.productVariant.updateMany).toHaveBeenCalledWith({
      where: { id: 'var-1', isActive: true, stock: 10 },
      data: { stock: { decrement: 2 } },
    });

    expect(tx.inventoryTransaction.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        variantId: 'var-1',
        quantityChange: -2,
        previousStock: 10,
        newStock: 8,
        type: 'SALE',
      }),
    });

    const createdData1 = tx.order.create.mock.calls[0][0].data;
    expect(createdData1.customerId).toBe('cust-101');
    expect(createdData1.subtotal.toString()).toBe('3180');
    expect(createdData1.deliveryCharge.toString()).toBe('80');
    expect(createdData1.totalAmount.toString()).toBe('3260');
    expect(createdData1.paymentMethod).toBe('COD');
    expect(createdData1.paymentStatus).toBe('PENDING');
    expect(createdData1.source).toBe('ADMIN');
    expect(createdData1.createdById).toBe('admin-id-123');
    expect(createdData1.createdByName).toBe('Mostak Admin');

    expect(result.id).toBe('admin-order-id-1');
  });

  it('creates a paid order with payment reference and paid amount', async () => {
    const { prisma, settings, tx } = setupAdminPrismaMock();

    const service = new OrdersService(prisma, settings);

    await service.createByAdmin(
      {
        customer: {
          firstName: 'Farhan',
          lastName: 'Ahmed',
          phoneNumber: '01819998877',
        },
        shippingAddress: {
          receiverName: 'Farhan Ahmed',
          receiverPhone: '01819998877',
          division: 'Dhaka',
          district: 'Dhaka',
          thana: 'Gulshan',
          streetAddress: 'Road 11, House 22',
        },
        items: [{ productVariantId: 'var-1', quantity: 1 }],
        paymentMethod: 'BKASH',
        paymentStatus: 'PAID',
        paymentReference: 'TRX-BKASH-9988',
        paidAmount: 1670,
        deliveryCharge: 80,
      },
      actor,
    );

    const createdData2 = tx.order.create.mock.calls[0][0].data;
    expect(createdData2.paymentMethod).toBe('BKASH');
    expect(createdData2.paymentStatus).toBe('PAID');
    expect(createdData2.paymentReference).toBe('TRX-BKASH-9988');
    expect(createdData2.paidAmount.toString()).toBe('1670');
  });

  it('rejects order creation if variant stock is insufficient', async () => {
    const { prisma, settings, tx } = setupAdminPrismaMock({
      variant: {
        ...sampleVariant,
        stock: 1, // Only 1 in stock
      },
    });

    const service = new OrdersService(prisma, settings);

    await expect(
      service.createByAdmin(
        {
          customer: { firstName: 'Test', phoneNumber: '01700000000' },
          shippingAddress: {
            receiverName: 'Test',
            receiverPhone: '01700000000',
            division: 'Dhaka',
            district: 'Dhaka',
            thana: 'Uttara',
            streetAddress: 'Sector 3',
          },
          items: [{ productVariantId: 'var-1', quantity: 3 }], // Requesting 3
        },
        actor,
      ),
    ).rejects.toThrow(/Insufficient stock/);
  });

  it('rejects order creation if product is inactive or deleted', async () => {
    const { prisma, settings } = setupAdminPrismaMock({
      variant: {
        ...sampleVariant,
        product: {
          ...sampleVariant.product,
          isActive: false, // Inactive
        },
      },
    });

    const service = new OrdersService(prisma, settings);

    await expect(
      service.createByAdmin(
        {
          customer: { firstName: 'Test', phoneNumber: '01700000000' },
          shippingAddress: {
            receiverName: 'Test',
            receiverPhone: '01700000000',
            division: 'Dhaka',
            district: 'Dhaka',
            thana: 'Uttara',
            streetAddress: 'Sector 3',
          },
          items: [{ productVariantId: 'var-1', quantity: 1 }],
        },
        actor,
      ),
    ).rejects.toThrow(/is currently unavailable/);
  });

  it('applies coupon and manual discount correctly', async () => {
    const activeCoupon = {
      id: 'coupon-1',
      code: 'EID20',
      type: 'PERCENTAGE',
      value: 20,
      minimumOrderAmount: 1000,
      startDate: new Date('2026-01-01'),
      expiryDate: new Date('2026-12-31'),
      isActive: true,
      usageLimit: null,
      usageCount: 0,
    };

    const { prisma, settings, tx } = setupAdminPrismaMock({
      coupon: activeCoupon,
    });

    const service = new OrdersService(prisma, settings);

    await service.createByAdmin(
      {
        customer: { firstName: 'VIP', phoneNumber: '01711112233' },
        shippingAddress: {
          receiverName: 'VIP Client',
          receiverPhone: '01711112233',
          division: 'Dhaka',
          district: 'Dhaka',
          thana: 'Banani',
          streetAddress: 'Road 10',
        },
        items: [{ productVariantId: 'var-1', quantity: 2 }], // 3180 subtotal
        couponCode: 'EID20', // 20% of 3180 = 636
        manualDiscountType: 'FIXED',
        manualDiscountValue: 144, // 144 manual discount
        deliveryCharge: 80,
      },
      actor,
    );

    // subtotal: 3180
    // coupon: 636
    // manual: 144
    // total discount: 780
    // delivery: 80
    const createdData5 = tx.order.create.mock.calls[0][0].data;
    expect(createdData5.subtotal.toString()).toBe('3180');
    expect(createdData5.discountAmount.toString()).toBe('780');
    expect(createdData5.manualDiscountAmount.toString()).toBe('144');
    expect(createdData5.deliveryCharge.toString()).toBe('80');
    expect(createdData5.totalAmount.toString()).toBe('2480');
  });

  describe('Courier Status Action Protection (Requirements 27 & 28)', () => {
    it('rejects transitioning to DELIVERED when linked Pathao courier status is UNKNOWN', async () => {
      const orderWithUnknownCourier = {
        id: 'ord-unknown',
        orderNumber: '#RL9911',
        status: OrderStatus.SHIPPED,
        courierConsignmentId: 'CSG-UNKNOWN-1',
        courierStatus: 'UNKNOWN',
        courierStatusRaw: 'some-future-pathao-state',
        items: [],
      };

      const tx = {
        order: {
          findFirst: vi.fn().mockResolvedValue(orderWithUnknownCourier),
          update: vi.fn(),
        },
      };
      const prisma = {
        $transaction: vi.fn((cb: any) => cb(tx)),
      } as unknown as PrismaService;
      const settings = {} as unknown as SettingsService;
      const service = new OrdersService(prisma, settings);

      await expect(
        service.updateStatus('ord-unknown', { status: OrderStatus.DELIVERED } as UpdateOrderStatusDto),
      ).rejects.toThrow(/Cannot transition order to DELIVERED: Courier shipment is not in a confirmed DELIVERED state/);
    });

    it('permits transitioning to DELIVERED when linked Pathao courier status is DELIVERED', async () => {
      const orderWithDeliveredCourier = {
        id: 'ord-delivered',
        orderNumber: '#RL9922',
        status: OrderStatus.SHIPPED,
        courierConsignmentId: 'CSG-DELIVERED-1',
        courierStatus: 'DELIVERED',
        courierStatusRaw: 'delivered',
        items: [],
      };

      const tx = {
        order: {
          findFirst: vi.fn().mockResolvedValue(orderWithDeliveredCourier),
          update: vi.fn().mockResolvedValue({ ...orderWithDeliveredCourier, status: OrderStatus.DELIVERED }),
        },
        orderTrackingEvent: {
          create: vi.fn().mockResolvedValue({ id: 'evt-1' }),
        },
      };
      const prisma = {
        $transaction: vi.fn((cb: any) => cb(tx)),
      } as unknown as PrismaService;
      const settings = {} as unknown as SettingsService;
      const service = new OrdersService(prisma, settings);

      const result = await service.updateStatus('ord-delivered', {
        status: OrderStatus.DELIVERED,
      } as UpdateOrderStatusDto);
      expect(result.status).toBe(OrderStatus.DELIVERED);
    });

    it('permits override when overrideCourierStatus is explicitly set', async () => {
      const orderWithUnknownCourier = {
        id: 'ord-override',
        orderNumber: '#RL9933',
        status: OrderStatus.SHIPPED,
        courierConsignmentId: 'CSG-UNKNOWN-2',
        courierStatus: 'UNKNOWN',
        courierStatusRaw: 'new-unmapped-status',
        items: [],
      };

      const tx = {
        order: {
          findFirst: vi.fn().mockResolvedValue(orderWithUnknownCourier),
          update: vi.fn().mockResolvedValue({ ...orderWithUnknownCourier, status: OrderStatus.DELIVERED }),
        },
        orderTrackingEvent: {
          create: vi.fn().mockResolvedValue({ id: 'evt-2' }),
        },
      };
      const prisma = {
        $transaction: vi.fn((cb: any) => cb(tx)),
      } as unknown as PrismaService;
      const settings = {} as unknown as SettingsService;
      const service = new OrdersService(prisma, settings);

      const result = await service.updateStatus('ord-override', {
        status: OrderStatus.DELIVERED,
        overrideCourierStatus: true,
      } as UpdateOrderStatusDto);
      expect(result.status).toBe(OrderStatus.DELIVERED);
    });

    it('masks UNKNOWN courier status as UPDATING for customer tracking without exposing internal tokens', async () => {
      const orderRecord = {
        id: 'ord-cust-1',
        orderNumber: '#RL9944',
        status: OrderStatus.SHIPPED,
        courierName: 'Pathao',
        courierProvider: 'Pathao',
        courierStatus: 'UNKNOWN',
        courierStatusRaw: 'sorting-hub-drone-queue',
        trackingNumber: 'CSG-CUST-1',
        trackingUrl: 'https://pathao.com/track',
        estimatedDelivery: null,
        updatedAt: new Date(),
        trackingEvents: [],
      };

      const prisma = {} as unknown as PrismaService;
      const settings = {} as unknown as SettingsService;
      const service = new OrdersService(prisma, settings);
      vi.spyOn(service as any, 'findOrderForAccess').mockResolvedValue(orderRecord);

      const tracking = await service.getTracking('#RL9944');
      expect(tracking.courierStatus).toBe('UPDATING');
      expect(tracking.courier).toBe('Pathao');
      expect((tracking as any).courierStatusRaw).toBeUndefined();
    });
  });

  describe('Unpaid Order Expiration & Inventory Release', () => {
    it('cancels expired unpaid WAITMARK_PAY orders and releases reserved stock back to variants', async () => {
      const expiredOrder = {
        id: 'ord-expired-1',
        orderNumber: '#RL100300',
        paymentMethod: 'WAITMARK_PAY',
        status: OrderStatus.PENDING,
        paymentStatus: 'PENDING',
        createdAt: new Date(Date.now() - 40 * 60 * 1000), // 40 minutes old
        items: [{ variantId: 'v-101', quantity: 2 }],
      };

      const tx = {
        productVariant: {
          findUnique: vi.fn().mockResolvedValue({ id: 'v-101', stock: 5 }),
          updateMany: vi.fn().mockResolvedValue({ count: 1 }),
        },
        inventoryTransaction: {
          create: vi.fn().mockResolvedValue({ id: 'itx-1' }),
        },
        order: {
          update: vi.fn().mockResolvedValue({ ...expiredOrder, status: OrderStatus.CANCELLED }),
          delete: vi.fn().mockResolvedValue(expiredOrder),
        },
        orderTrackingEvent: {
          create: vi.fn().mockResolvedValue({ id: 'evt-timeout' }),
        },
      };

      const prisma = {
        order: {
          findMany: vi.fn().mockResolvedValue([expiredOrder]),
        },
        $transaction: vi.fn(async (cb: any) => cb(tx)),
      } as unknown as PrismaService;

      const settings = {} as unknown as SettingsService;
      const service = new OrdersService(prisma, settings);

      const count = await service.cancelExpiredUnpaidOrders(30);

      expect(count).toBe(1);
      expect(tx.productVariant.updateMany).toHaveBeenCalledWith({
        where: { id: 'v-101', stock: 5 },
        data: { stock: 7 }, // 5 + 2
      });
      expect(tx.inventoryTransaction.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          variantId: 'v-101',
          quantityChange: 2,
          type: 'RETURN',
        }),
      });
      expect(tx.order.delete).toHaveBeenCalledWith({
        where: { id: 'ord-expired-1' },
      });
    });

    it('rejects explicit cancellation of an already PAID order', async () => {
      const paidOrder = {
        id: 'ord-paid',
        orderNumber: '#RL100400',
        paymentStatus: 'PAID',
        status: OrderStatus.CONFIRMED,
        customerId: 'cust-1',
        items: [],
      };

      const prisma = {} as unknown as PrismaService;
      const settings = {} as unknown as SettingsService;
      const service = new OrdersService(prisma, settings);
      vi.spyOn(service as any, 'findOrderForAccess').mockResolvedValue(paidOrder);

      await expect(
        service.cancelUnpaidOrder('#RL100400', 'cust-1'),
      ).rejects.toThrow('Cannot cancel an already paid order');
    });
  });
});
