import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PathaoAuthService } from './pathao-auth.service.js';
import { PathaoService } from './pathao.service.js';

describe('Pathao Courier Sandbox Integration', () => {
  let configService: ConfigService;
  let authService: PathaoAuthService;
  let pathaoService: PathaoService;
  let mockPrisma: any;

  const validConfig: Record<string, string> = {
    PATHAO_ENV: 'sandbox',
    PATHAO_BASE_URL: 'https://courier-api-sandbox.pathao.com',
    PATHAO_CLIENT_ID: 'test-client-id',
    PATHAO_CLIENT_SECRET: 'test-client-secret',
    PATHAO_USERNAME: 'test@merchant.com',
    PATHAO_PASSWORD: 'test-password',
    PATHAO_GRANT_TYPE: 'password',
  };

  beforeEach(() => {
    configService = new ConfigService(validConfig);
    authService = new PathaoAuthService(configService);

    mockPrisma = {
      order: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      orderTrackingEvent: {
        create: vi.fn().mockResolvedValue({ id: 'track-1' }),
      },
    };

    pathaoService = new PathaoService(mockPrisma as any, authService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Requirement 16 & Security: Sandbox Environment & URL Safety Guard', () => {
    it('16. refuses to run when PATHAO_ENV is not sandbox', () => {
      const liveConfig = new ConfigService({
        ...validConfig,
        PATHAO_ENV: 'production',
      });
      const liveAuth = new PathaoAuthService(liveConfig);
      expect(() => liveAuth.getEnvironment()).toThrow(BadRequestException);
      expect(() => liveAuth.getEnvironment()).toThrow(/locked to sandbox/);
    });

    it('16b. ensures production URL cannot be used by sandbox endpoints', () => {
      const prodUrlConfig = new ConfigService({
        ...validConfig,
        PATHAO_BASE_URL: 'https://api-hermes.pathao.com',
      });
      const prodUrlAuth = new PathaoAuthService(prodUrlConfig);
      expect(() => prodUrlAuth.getBaseUrl()).toThrow(BadRequestException);
      expect(() => prodUrlAuth.getBaseUrl()).toThrow(/Production Pathao base URL cannot be used/);
    });
  });

  describe('Requirement 3: Sandbox Access Token Generation & Caching', () => {
    it('1. generates access token successfully and caches it', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          access_token: 'sandbox-bearer-token-12345',
          token_type: 'Bearer',
          expires_in: 3600,
        }),
      });
      vi.stubGlobal('fetch', mockFetch);

      const token1 = await authService.getAccessToken();
      expect(token1).toBe('sandbox-bearer-token-12345');
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Second request should reuse cached token without hitting network
      const token2 = await authService.getAccessToken();
      expect(token2).toBe('sandbox-bearer-token-12345');
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('2. throws UnauthorizedException when credentials are missing', async () => {
      const missingCredsConfig = {
        get: (key: string) => {
          if (key === 'PATHAO_ENV') return 'sandbox';
          if (key === 'PATHAO_BASE_URL') return 'https://courier-api-sandbox.pathao.com';
          return undefined;
        },
      } as unknown as ConfigService;
      const unauthAuth = new PathaoAuthService(missingCredsConfig);
      await expect(unauthAuth.issueAccessToken()).rejects.toThrow(UnauthorizedException);
    });

    it('2b. throws UnauthorizedException when sandbox returns 401 Unauthorized', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ message: 'Invalid credentials' }),
      });
      vi.stubGlobal('fetch', mockFetch);

      await expect(authService.issueAccessToken()).rejects.toThrow(UnauthorizedException);
    });

    it('17. ensures access token and credentials are never exposed via getStatus', async () => {
      vi.spyOn(authService, 'getAccessToken').mockResolvedValue('super-secret-token');
      vi.spyOn(pathaoService, 'getCities').mockResolvedValue([{ city_id: 1, city_name: 'Dhaka' }]);
      vi.spyOn(pathaoService, 'getStores').mockResolvedValue([
        { store_id: 1, store_name: 'Atelier Warehouse', store_address: 'Banani' },
      ]);

      const status = await pathaoService.getStatus();
      expect(status.environment).toBe('sandbox');
      expect(status.configured).toBe(true);
      expect(status.connected).toBe(true);

      const statusStr = JSON.stringify(status);
      expect(statusStr).not.toContain('super-secret-token');
      expect(statusStr).not.toContain('test-client-secret');
      expect(statusStr).not.toContain('test-password');
    });
  });

  describe('Requirement 4: Test Connection API', () => {
    it('3. reports connection success when credentials and API respond', async () => {
      vi.spyOn(authService, 'getAccessToken').mockResolvedValue('token-abc');
      vi.spyOn(pathaoService, 'getCities').mockResolvedValue([{ city_id: 1, city_name: 'Dhaka' }]);
      vi.spyOn(pathaoService, 'getStores').mockResolvedValue([
        { store_id: 99, store_name: 'Main Store', store_address: 'Gulshan' },
      ]);

      const res = await pathaoService.testConnection();
      expect(res.success).toBe(true);
      expect(res.environment).toBe('sandbox');
      expect(res.provider).toBe('Pathao');
      expect(res.details?.storesCount).toBe(1);
      expect(res.details?.citiesCount).toBe(1);
    });

    it('4. reports failure safely without leaking secrets when auth fails', async () => {
      vi.spyOn(authService, 'getAccessToken').mockRejectedValue(
        new UnauthorizedException('Pathao sandbox authentication failed (401)'),
      );

      const res = await pathaoService.testConnection();
      expect(res.success).toBe(false);
      expect(res.message).toContain('failed');
      expect(res.environment).toBe('sandbox');
    });
  });

  describe('Requirement 6: Location APIs (Cities, Zones, Areas)', () => {
    it('5. fetches and caches sandbox cities', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          data: {
            data: [
              { city_id: 1, city_name: 'Dhaka' },
              { city_id: 2, city_name: 'Chittagong' },
            ],
          },
        }),
      });
      vi.stubGlobal('fetch', mockFetch);
      vi.spyOn(authService, 'getAccessToken').mockResolvedValue('token');

      const cities = await pathaoService.getCities();
      expect(cities).toHaveLength(2);
      expect(cities[0].city_name).toBe('Dhaka');

      // Second call should return cached cities
      const cached = await pathaoService.getCities();
      expect(cached).toHaveLength(2);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('6. fetches zones for a city', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          data: {
            data: [
              { zone_id: 101, zone_name: 'Gulshan' },
              { zone_id: 102, zone_name: 'Banani' },
            ],
          },
        }),
      });
      vi.stubGlobal('fetch', mockFetch);
      vi.spyOn(authService, 'getAccessToken').mockResolvedValue('token');

      const zones = await pathaoService.getZones(1);
      expect(zones).toHaveLength(2);
      expect(zones[0].zone_name).toBe('Gulshan');
    });

    it('7. fetches areas for a zone', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          data: {
            data: [
              { area_id: 201, area_name: 'Road 11' },
              { area_id: 202, area_name: 'Block D' },
            ],
          },
        }),
      });
      vi.stubGlobal('fetch', mockFetch);
      vi.spyOn(authService, 'getAccessToken').mockResolvedValue('token');

      const areas = await pathaoService.getAreas(102);
      expect(areas).toHaveLength(2);
      expect(areas[0].area_name).toBe('Road 11');
    });
  });

  describe('Requirement 7: Price Calculation API', () => {
    it('8. calculates price plan correctly from sandbox response', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          data: {
            price: 70,
            plan_id: 1,
            additional_charge: 0,
          },
        }),
      });
      vi.stubGlobal('fetch', mockFetch);
      vi.spyOn(authService, 'getAccessToken').mockResolvedValue('token');

      const plan = await pathaoService.calculatePrice({
        store_id: 1,
        delivery_type: 48,
        item_type: 2,
        item_weight: 0.8,
        recipient_city: 1,
        recipient_zone: 101,
      });

      expect(plan.price).toBe(70);
      expect(plan.plan_id).toBe(1);
    });
  });

  describe('Requirement 8 & 9: Create Sandbox Order & Order Validation', () => {
    it('9. creates a sandbox order successfully', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          type: 'success',
          message: 'Order created',
          data: {
            consignment_id: 'DS10009876',
            merchant_order_id: 'RL-TEST-001',
            order_status: 'Pending',
            delivery_fee: 60,
          },
        }),
      });
      vi.stubGlobal('fetch', mockFetch);
      vi.spyOn(authService, 'getAccessToken').mockResolvedValue('token');

      const res = await pathaoService.createSandboxOrder({
        store_id: 1,
        merchant_order_id: 'RL-TEST-001',
        recipient_name: 'Mostak Shahariyar',
        recipient_phone: '01712088866',
        recipient_address: 'House 12, Road 4, Sector 3, Uttara, Dhaka',
        delivery_type: 48,
        item_type: 2,
        item_quantity: 1,
        item_weight: 0.5,
        amount_to_collect: 1500,
        item_description: 'Festive Panjabi',
      });

      expect(res.consignment_id).toBe('DS10009876');
      expect(res.order_status).toBe('Pending');
    });

    it('10. rejects order with invalid phone format', async () => {
      await expect(
        pathaoService.createSandboxOrder({
          store_id: 1,
          recipient_name: 'Test',
          recipient_phone: '12345', // invalid
          recipient_address: 'House 1, Road 2, Dhaka',
          delivery_type: 48,
          item_type: 2,
          item_quantity: 1,
          item_weight: 0.5,
          amount_to_collect: 0,
          item_description: 'Silk Kurti',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('11. rejects booking parcel from order with empty address', async () => {
      mockPrisma.order.findUnique.mockResolvedValue({
        id: 'order-bad-addr',
        orderNumber: '#RL999',
        status: 'PENDING',
        paymentStatus: 'PENDING',
        totalAmount: 1200,
        paidAmount: 0,
        shippingAddress: {}, // empty
        items: [{ productName: 'Kurti', quantity: 1 }],
      });

      await expect(pathaoService.createParcelFromOrder('order-bad-addr')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('19. prevents duplicate parcel creation when consignment ID already exists', async () => {
      mockPrisma.order.findUnique.mockResolvedValue({
        id: 'order-dup',
        orderNumber: '#RL1001',
        status: 'CONFIRMED',
        courierConsignmentId: 'EXISTING_CONSIGNMENT_123',
        shippingAddress: {
          fullName: 'Mostak',
          phone: '01712088866',
          addressLine1: 'Dhanmondi, Dhaka',
        },
        items: [{ productName: 'Panjabi', quantity: 1 }],
      });

      await expect(
        pathaoService.createParcelFromOrder('order-dup', { forceDuplicate: false }),
      ).rejects.toThrow(/already has an active Pathao parcel/);
    });

    it('9b. creates sandbox parcel from order and updates database fields safely', async () => {
      mockPrisma.order.findUnique.mockResolvedValue({
        id: 'order-good-1',
        orderNumber: '#RL2001',
        status: 'CONFIRMED',
        paymentStatus: 'PENDING',
        totalAmount: 3500,
        paidAmount: 500,
        courierConsignmentId: null,
        shippingAddress: {
          fullName: 'Patron Mostak',
          phone: '01712088866',
          streetAddress: 'House 5, Road 10, Banani',
          district: 'Dhaka',
        },
        items: [{ productName: 'Emerald Velvet Panjabi', quantity: 1 }],
      });

      mockPrisma.order.update.mockResolvedValue({
        id: 'order-good-1',
        orderNumber: '#RL2001',
        courierConsignmentId: 'CSG-778899',
        courierStatus: 'Pending',
      });

      vi.spyOn(pathaoService, 'getStores').mockResolvedValue([
        { store_id: 5, store_name: 'Atelier HQ', store_address: 'Dhaka' },
      ]);

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          type: 'success',
          data: {
            consignment_id: 'CSG-778899',
            merchant_order_id: '#RL2001',
            order_status: 'Pending',
            delivery_fee: 80,
          },
        }),
      });
      vi.stubGlobal('fetch', mockFetch);
      vi.spyOn(authService, 'getAccessToken').mockResolvedValue('token');

      const result = await pathaoService.createParcelFromOrder('order-good-1');
      expect(result.parcel.consignment_id).toBe('CSG-778899');
      expect(mockPrisma.order.update).toHaveBeenCalledTimes(1);
      const updateData = mockPrisma.order.update.mock.calls[0][0].data;
      expect(updateData.courierProvider).toBe('Pathao');
      expect(updateData.courierConsignmentId).toBe('CSG-778899');
      expect(updateData.trackingNumber).toBe('CSG-778899');
      expect(updateData.courierStatus).toBe('PENDING');
      expect(updateData.courierStatusRaw).toBe('Pending');
      expect(updateData.trackingUrl).toContain('CSG-778899');
    });
  });

  describe('Requirement 11 & 18: Tracking & Refresh Status', () => {
    it('fetches tracking info for an order consignment and normalizes status while preserving raw', async () => {
      mockPrisma.order.findUnique.mockResolvedValue({
        id: 'order-track-1',
        orderNumber: '#RL5001',
        courierConsignmentId: 'CSG-112233',
        courierStatus: 'PENDING',
        courierStatusRaw: 'Pending',
      });

      mockPrisma.order.update.mockResolvedValue({});

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          data: {
            consignment_id: 'CSG-112233',
            order_status: 'In Transit',
            order_status_slug: 'in-transit',
            history: [{ status: 'Picked Up', time: '2026-10-12T10:00:00Z' }],
          },
        }),
      });
      vi.stubGlobal('fetch', mockFetch);
      vi.spyOn(authService, 'getAccessToken').mockResolvedValue('token');

      const refresh = await pathaoService.refreshOrderStatus('order-track-1');
      expect(refresh.courierStatus).toBe('IN_TRANSIT');
      expect(refresh.courierStatusRaw).toBe('in-transit');
      expect(mockPrisma.order.update).toHaveBeenCalledTimes(1);
      const updateData = mockPrisma.order.update.mock.calls[0][0].data;
      expect(updateData.courierStatus).toBe('IN_TRANSIT');
      expect(updateData.courierStatusRaw).toBe('in-transit');
    });

    it('safely handles unknown/future Pathao status during refresh without crashing and preserves raw', async () => {
      mockPrisma.order.findUnique.mockResolvedValue({
        id: 'order-track-2',
        orderNumber: '#RL5002',
        courierConsignmentId: 'CSG-998877',
        courierStatus: 'IN_TRANSIT',
        courierStatusRaw: 'in-transit',
      });

      mockPrisma.order.update.mockResolvedValue({});

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          data: {
            consignment_id: 'CSG-998877',
            order_status: 'Sorting Facility Inspection',
            order_status_slug: 'sorting-facility-inspection',
          },
        }),
      });
      vi.stubGlobal('fetch', mockFetch);
      vi.spyOn(authService, 'getAccessToken').mockResolvedValue('token');

      const refresh = await pathaoService.refreshOrderStatus('order-track-2');
      expect(refresh.courierStatus).toBe('UNKNOWN');
      expect(refresh.courierStatusRaw).toBe('sorting-facility-inspection');
      expect(mockPrisma.order.update).toHaveBeenCalledTimes(1);
      const updateData = mockPrisma.order.update.mock.calls[0][0].data;
      expect(updateData.courierStatus).toBe('UNKNOWN');
      expect(updateData.courierStatusRaw).toBe('sorting-facility-inspection');
    });
  });

  describe('Requirement 17: Webhook Processing Safety', () => {
    it('processes webhook event for known status and updates order safely', async () => {
      mockPrisma.order.findFirst = vi.fn().mockResolvedValue({
        id: 'order-wb-1',
        orderNumber: '#RL9001',
        courierConsignmentId: 'CSG-WB-100',
        courierStatus: 'IN_TRANSIT',
        courierStatusRaw: 'in-transit',
      });
      mockPrisma.order.update.mockResolvedValue({});

      const result = await pathaoService.processWebhook({
        consignment_id: 'CSG-WB-100',
        order_status: 'Delivered',
        order_status_slug: 'delivered',
      });

      expect(result.success).toBe(true);
      expect(result.courierStatus).toBe('DELIVERED');
      expect(result.courierStatusRaw).toBe('delivered');
      expect(mockPrisma.order.update).toHaveBeenCalledTimes(1);
      const updateData = mockPrisma.order.update.mock.calls[0][0].data;
      expect(updateData.courierStatus).toBe('DELIVERED');
      expect(updateData.courierStatusRaw).toBe('delivered');
    });

    it('processes webhook event with unknown status safely without crashing', async () => {
      mockPrisma.order.findFirst = vi.fn().mockResolvedValue({
        id: 'order-wb-2',
        orderNumber: '#RL9002',
        courierConsignmentId: 'CSG-WB-200',
        courierStatus: 'IN_TRANSIT',
        courierStatusRaw: 'in-transit',
      });
      mockPrisma.order.update.mockResolvedValue({});

      const result = await pathaoService.processWebhook({
        consignment_id: 'CSG-WB-200',
        order_status: 'Customer Rescheduled Drone Drop',
        order_status_slug: 'customer-rescheduled-drone-drop',
      });

      expect(result.success).toBe(true);
      expect(result.courierStatus).toBe('UNKNOWN');
      expect(result.courierStatusRaw).toBe('customer-rescheduled-drone-drop');
      expect(mockPrisma.order.update).toHaveBeenCalledTimes(1);
      const updateData = mockPrisma.order.update.mock.calls[0][0].data;
      expect(updateData.courierStatus).toBe('UNKNOWN');
      expect(updateData.courierStatusRaw).toBe('customer-rescheduled-drone-drop');
    });
  });
});
