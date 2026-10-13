import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AnalyticsService } from './services/analytics.service.js';
import { VisitorSessionService } from './services/visitor-session.service.js';
import { Ga4MeasurementProtocolService } from './services/ga4-measurement-protocol.service.js';

describe('Analytics and User Tracking System', () => {
  describe('VisitorSessionService', () => {
    let visitorService: VisitorSessionService;
    let mockPrisma: any;
    let mockConfig: any;

    beforeEach(() => {
      vi.clearAllMocks();

      mockConfig = {
        get: vi.fn((key: string) => {
          if (key === 'NODE_ENV') return 'development';
          return undefined;
        }),
      };

      mockPrisma = {
        analyticsVisitor: {
          findUnique: vi.fn(),
          create: vi.fn(),
          update: vi.fn(),
        },
        analyticsSession: {
          findFirst: vi.fn(),
          create: vi.fn(),
          update: vi.fn(),
        },
        analyticsConsent: {
          create: vi.fn(),
        },
      };

      visitorService = new VisitorSessionService(mockPrisma, mockConfig);
    });

    it('generates a new visitor and session when no cookie is present', async () => {
      const mockReq: any = {
        cookies: {},
        headers: {},
        ip: '127.0.0.1',
      };
      const mockRes: any = {
        cookie: vi.fn(),
      };

      mockPrisma.analyticsVisitor.create.mockResolvedValue({
        id: 'visitor-uuid-1',
        visitorToken: 'token-random-1',
        customerId: null,
        consents: [],
      });

      mockPrisma.analyticsSession.findFirst.mockResolvedValue(null);
      mockPrisma.analyticsSession.create.mockResolvedValue({
        id: 'session-uuid-1',
        visitorId: 'visitor-uuid-1',
        startedAt: new Date(),
        lastActiveAt: new Date(),
      });

      const context = await visitorService.resolveVisitorAndSession(
        mockReq,
        mockRes,
        '/products/panjabi',
      );

      expect(context.visitorId).toBe('visitor-uuid-1');
      expect(context.isNewVisitor).toBe(true);
      expect(mockRes.cookie).toHaveBeenCalledWith(
        'rl_vid',
        'token-random-1',
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'lax',
        }),
      );
    });

    it('links authenticated customer to anonymous visitor on login without merging separate accounts', async () => {
      const mockReq: any = {
        cookies: { rl_vid: 'existing-anon-token' },
        headers: {},
        ip: '127.0.0.1',
      };

      mockPrisma.analyticsVisitor.findUnique.mockResolvedValue({
        id: 'visitor-uuid-2',
        visitorToken: 'existing-anon-token',
        customerId: null,
        consents: [{ analyticsConsent: true, marketingConsent: true }],
      });

      mockPrisma.analyticsVisitor.update.mockResolvedValue({
        id: 'visitor-uuid-2',
        visitorToken: 'existing-anon-token',
        customerId: 'cust-123',
        consents: [{ analyticsConsent: true, marketingConsent: true }],
      });

      mockPrisma.analyticsSession.findFirst.mockResolvedValue({
        id: 'session-uuid-2',
        visitorId: 'visitor-uuid-2',
        lastActiveAt: new Date(),
      });

      mockPrisma.analyticsSession.update.mockResolvedValue({
        id: 'session-uuid-2',
        visitorId: 'visitor-uuid-2',
        lastActiveAt: new Date(),
      });

      const context = await visitorService.resolveVisitorAndSession(
        mockReq,
        undefined,
        '/',
        undefined,
        undefined,
        'cust-123',
      );

      expect(context.customerId).toBe('cust-123');
      expect(mockPrisma.analyticsVisitor.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'visitor-uuid-2' },
          data: expect.objectContaining({ customerId: 'cust-123' }),
        }),
      );
    });
  });

  describe('AnalyticsService', () => {
    let analyticsService: AnalyticsService;
    let mockPrisma: any;
    let mockVisitorService: any;

    beforeEach(() => {
      vi.clearAllMocks();

      mockPrisma = {
        analyticsEvent: {
          createMany: vi.fn().mockResolvedValue({ count: 2 }),
          count: vi.fn().mockResolvedValue(100),
          findMany: vi.fn().mockResolvedValue([]),
          groupBy: vi.fn().mockResolvedValue([]),
          deleteMany: vi.fn().mockResolvedValue({ count: 50 }),
        },
        analyticsSession: {
          count: vi.fn().mockResolvedValue(50),
          findMany: vi.fn().mockResolvedValue([]),
          deleteMany: vi.fn().mockResolvedValue({ count: 10 }),
        },
        analyticsVisitor: {
          count: vi.fn().mockResolvedValue(40),
        },
        order: {
          findMany: vi.fn().mockResolvedValue([
            { id: 'o-1', totalAmount: 4500 },
            { id: 'o-2', totalAmount: 3200 },
          ]),
          count: vi.fn().mockResolvedValue(2),
        },
      };

      mockVisitorService = {
        resolveVisitorAndSession: vi.fn(),
        recordConsent: vi.fn(),
      };

      analyticsService = new AnalyticsService(mockPrisma, mockVisitorService);
    });

    it('omits tracking when visitor has not given analytics consent', async () => {
      mockVisitorService.resolveVisitorAndSession.mockResolvedValue({
        visitorId: 'v-1',
        visitorToken: 'token-1',
        sessionId: 's-1',
        analyticsConsent: false,
        marketingConsent: false,
      });

      const res = await analyticsService.trackEvents(
        {
          events: [
            {
              eventType: 'view_item',
              pagePath: '/products/royal-panjabi',
              productId: 'p-1',
            },
          ],
        },
        {} as any,
      );

      expect(res.processed).toBe(0);
      expect(res.consented).toBe(false);
      expect(mockPrisma.analyticsEvent.createMany).not.toHaveBeenCalled();
    });

    it('sanitizes sensitive fields like passwords and credit card data from event properties', async () => {
      mockVisitorService.resolveVisitorAndSession.mockResolvedValue({
        visitorId: 'v-1',
        visitorToken: 'token-1',
        sessionId: 's-1',
        analyticsConsent: true,
        marketingConsent: true,
      });

      const payload = {
        events: [
          {
            eventType: 'add_to_cart',
            pagePath: '/products/royal-panjabi',
            properties: {
              size: '42',
              color: 'Heritage Olive',
              password: 'SuperSecretPassword123',
              creditCard: '4111222233334444',
            },
          },
        ],
      };

      const res = await analyticsService.trackEvents(payload, {} as any);

      expect(res.processed).toBe(2);
      expect(mockPrisma.analyticsEvent.createMany).toHaveBeenCalledWith({
        data: [
          expect.objectContaining({
            eventType: 'add_to_cart',
            properties: {
              size: '42',
              color: 'Heritage Olive',
            },
          }),
        ],
      });
    });

    it('calculates overview metrics, conversion rate, and revenue correctly', async () => {
      const overview = await analyticsService.getOverview({ period: '30d' });

      expect(overview.metrics.confirmedPurchases).toBe(2);
      expect(overview.metrics.revenue).toBe(7700);
      expect(overview.metrics.uniqueVisitors).toBe(40);
      expect(overview.metrics.conversionRate).toBe(5); // (2 / 40) * 100
    });

    it('purges retention data older than specified threshold', async () => {
      const cleanup = await analyticsService.cleanupRetention(90);

      expect(cleanup.purgedEvents).toBe(50);
      expect(cleanup.purgedSessions).toBe(10);
      expect(mockPrisma.analyticsEvent.deleteMany).toHaveBeenCalled();
    });
  });

  describe('Ga4MeasurementProtocolService', () => {
    let ga4Service: Ga4MeasurementProtocolService;

    beforeEach(() => {
      vi.clearAllMocks();
      delete process.env.GA4_MEASUREMENT_ID;
      delete process.env.GA4_API_SECRET;
      ga4Service = new Ga4MeasurementProtocolService();
    });

    it('returns gracefully when credentials are not configured', async () => {
      const result = await ga4Service.sendPurchaseEvent({
        id: 'order-1',
        orderNumber: 'RL1001',
        totalAmount: 5000,
      });

      expect(result.success).toBe(false);
      expect(result.reason).toBe('credentials_not_configured');
    });

    it('sends purchase event and prevents duplicate purchase reporting for the same order number', async () => {
      process.env.GA4_MEASUREMENT_ID = 'G-TEST123';
      process.env.GA4_API_SECRET = 'secret123';

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 204,
      });
      global.fetch = mockFetch;

      const firstSend = await ga4Service.sendPurchaseEvent({
        id: 'order-1',
        orderNumber: 'RL1001',
        totalAmount: 5000,
        items: [{ id: 'p-1', name: 'Panjabi', price: 5000, quantity: 1 }],
      });

      expect(firstSend.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Attempt duplicate send
      const secondSend = await ga4Service.sendPurchaseEvent({
        id: 'order-1',
        orderNumber: 'RL1001',
        totalAmount: 5000,
      });

      expect(secondSend.success).toBe(true);
      expect(secondSend.reason).toBe('already_reported');
      expect(mockFetch).toHaveBeenCalledTimes(1); // not called again
    });
  });
});
