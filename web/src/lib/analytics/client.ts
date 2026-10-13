/**
 * Central Analytics Client for Rongin Libas Storefront.
 * Integrates NestJS Backend Analytics, Google Analytics 4, Meta Pixel, and Microsoft Clarity.
 */

import {
  StandardEventType,
  BaseEventPayload,
  ViewItemPayload,
  SelectVariantPayload,
  CartActionPayload,
  CheckoutPayload,
  ShippingInfoPayload,
  PaymentInfoPayload,
  PurchasePayload,
} from './events';
import { getStoredConsent, ConsentPreferences } from './consent';
import Clarity from '@microsoft/clarity';

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:4000/api/v1';

class AnalyticsClient {
  private queue: Array<{
    eventType: StandardEventType;
    pagePath: string;
    productId?: string;
    engagementDuration?: number;
    campaignSource?: string;
    campaignMedium?: string;
    campaignName?: string;
    properties?: Record<string, any>;
  }> = [];

  private flushTimeout: any = null;
  private recentDedupeKeys: Map<string, number> = new Map();
  private pageStartTime: number = Date.now();
  private activeEngagementDuration: number = 0;
  private lastActiveTimestamp: number = Date.now();
  private isDocumentVisible: boolean = true;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initEngagementTracking();
    }
  }

  /**
   * Initializes visibility change listeners to measure real active engagement.
   */
  private initEngagementTracking() {
    this.isDocumentVisible = document.visibilityState === 'visible';
    this.lastActiveTimestamp = Date.now();

    document.addEventListener('visibilitychange', () => {
      const now = Date.now();
      if (document.visibilityState === 'hidden') {
        if (this.isDocumentVisible) {
          const delta = Math.min((now - this.lastActiveTimestamp) / 1000, 300);
          this.activeEngagementDuration += Math.round(delta);
        }
        this.isDocumentVisible = false;
        this.flushQueue(true);
      } else {
        this.isDocumentVisible = true;
        this.lastActiveTimestamp = now;
      }
    });

    window.addEventListener('beforeunload', () => {
      this.flushQueue(true);
    });
  }

  /**
   * Returns current accumulated engagement duration for the current page and resets counter.
   */
  public extractEngagementDuration(): number {
    const now = Date.now();
    if (this.isDocumentVisible) {
      const delta = Math.min((now - this.lastActiveTimestamp) / 1000, 300);
      this.activeEngagementDuration += Math.round(delta);
      this.lastActiveTimestamp = now;
    }
    const duration = Math.min(this.activeEngagementDuration, 600); // capped at 10 minutes
    this.activeEngagementDuration = 0;
    return duration;
  }

  /**
   * Prevents duplicate events (such as React StrictMode double effect execution within 500ms).
   */
  private isDuplicate(key: string): boolean {
    const now = Date.now();
    const lastTime = this.recentDedupeKeys.get(key);
    if (lastTime && now - lastTime < 500) {
      return true;
    }
    this.recentDedupeKeys.set(key, now);
    if (this.recentDedupeKeys.size > 200) {
      const threshold = now - 5000;
      for (const [k, t] of this.recentDedupeKeys.entries()) {
        if (t < threshold) this.recentDedupeKeys.delete(k);
      }
    }
    return false;
  }

  /**
   * Internal event dispatcher to all approved endpoints.
   */
  public track(
    eventType: StandardEventType,
    payload: BaseEventPayload & { productId?: string },
  ) {
    if (typeof window === 'undefined') return;

    const dedupeKey = `${eventType}_${payload.pagePath}_${payload.productId || ''}`;
    if (this.isDuplicate(dedupeKey)) {
      return;
    }

    const consent = getStoredConsent();
    const hasAnalyticsConsent = Boolean(consent?.analytics);
    const hasMarketingConsent = Boolean(consent?.marketing);

    // 1. Google Analytics 4 (requires analytics consent)
    if (hasAnalyticsConsent && typeof window.gtag === 'function') {
      try {
        const gaParams: Record<string, any> = {
          page_path: payload.pagePath,
          ...(payload.properties || {}),
        };
        if (payload.engagementDuration) {
          gaParams.engagement_time_msec = payload.engagementDuration * 1000;
        }
        if (payload.properties?.items) {
          gaParams.items = payload.properties.items;
        }
        if (payload.properties?.value !== undefined) {
          gaParams.value = Number(payload.properties.value);
          gaParams.currency = payload.properties.currency || 'BDT';
        }
        if (payload.properties?.orderNumber) {
          gaParams.transaction_id = payload.properties.orderNumber;
        }

        window.gtag('event', eventType, gaParams);
      } catch {
        // Safe logging
      }
    }

    // 2. Microsoft Clarity (requires analytics consent)
    if (hasAnalyticsConsent) {
      try {
        Clarity.event(eventType);
      } catch {
        // Safe logging
      }
    }

    // 3. Rongin Libas Backend Ingestion (persists if analytics consent granted)
    if (hasAnalyticsConsent) {
      this.queue.push({
        eventType,
        pagePath: payload.pagePath,
        productId: payload.productId,
        engagementDuration: payload.engagementDuration,
        campaignSource: payload.campaignSource,
        campaignMedium: payload.campaignMedium,
        campaignName: payload.campaignName,
        properties: payload.properties,
      });

      if (this.flushTimeout) clearTimeout(this.flushTimeout);
      this.flushTimeout = setTimeout(() => this.flushQueue(), 1000);
    }
  }

  /**
   * Flushes queued events to the NestJS backend.
   */
  public flushQueue(useBeacon = false) {
    if (this.queue.length === 0) return;

    const batch = [...this.queue];
    this.queue = [];

    const body = JSON.stringify({
      events: batch,
      referrer: document.referrer || undefined,
      deviceType: window.innerWidth < 768 ? 'Mobile' : 'Desktop',
    });

    const endpoint = `${API_BASE}/analytics/events`;

    if (useBeacon && typeof navigator.sendBeacon === 'function') {
      try {
        const blob = new Blob([body], { type: 'application/json' });
        navigator.sendBeacon(endpoint, blob);
        return;
      } catch {
        // Fallback to fetch
      }
    }

    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body,
      keepalive: true,
    }).catch(() => {
      // Re-queue events on transient failure up to 50 events
      if (this.queue.length < 50) {
        this.queue.unshift(...batch.slice(0, 50 - this.queue.length));
      }
    });
  }

  // --- Specific E-Commerce Methods ---

  public trackPageView(pagePath: string, duration?: number) {
    this.track('page_view', {
      pagePath,
      engagementDuration: duration,
      properties: {
        title: typeof document !== 'undefined' ? document.title : '',
      },
    });
  }

  public trackViewItem(payload: ViewItemPayload) {
    this.track('view_item', {
      pagePath: payload.pagePath,
      productId: payload.productId,
      properties: {
        productName: payload.productName,
        price: payload.price,
        currency: payload.currency || 'BDT',
        category: payload.category,
        variant: payload.variant,
        items: payload.items,
      },
    });
  }

  public trackSelectItem(payload: { productId: string; productName: string; pagePath: string; price?: number }) {
    this.track('select_item', {
      pagePath: payload.pagePath,
      productId: payload.productId,
      properties: {
        productName: payload.productName,
        price: payload.price,
      },
    });
  }

  public trackSelectSize(payload: SelectVariantPayload) {
    this.track('select_size', {
      pagePath: payload.pagePath,
      productId: payload.productId,
      properties: {
        size: payload.size,
        productName: payload.productName,
      },
    });
  }

  public trackSelectColor(payload: SelectVariantPayload) {
    this.track('select_color', {
      pagePath: payload.pagePath,
      productId: payload.productId,
      properties: {
        color: payload.color,
        productName: payload.productName,
      },
    });
  }

  public trackAddToCart(payload: CartActionPayload) {
    this.track('add_to_cart', {
      pagePath: payload.pagePath,
      productId: payload.productId,
      properties: {
        productName: payload.productName,
        price: payload.price,
        quantity: payload.quantity,
        size: payload.size,
        color: payload.color,
        currency: payload.currency || 'BDT',
        value: payload.price * payload.quantity,
        items: payload.items,
      },
    });
  }

  public trackRemoveFromCart(payload: CartActionPayload) {
    this.track('remove_from_cart', {
      pagePath: payload.pagePath,
      productId: payload.productId,
      properties: {
        productName: payload.productName,
        price: payload.price,
        quantity: payload.quantity,
        size: payload.size,
        color: payload.color,
      },
    });
  }

  public trackViewCart(pagePath: string, itemsCount: number, total: number) {
    this.track('view_cart', {
      pagePath,
      properties: {
        itemsCount,
        value: total,
        currency: 'BDT',
      },
    });
  }

  public trackBeginCheckout(payload: CheckoutPayload) {
    this.track('begin_checkout', {
      pagePath: payload.pagePath,
      properties: {
        value: payload.value,
        currency: payload.currency || 'BDT',
        coupon: payload.coupon,
        items: payload.items,
      },
    });
  }

  public trackAddShippingInfo(payload: ShippingInfoPayload) {
    this.track('add_shipping_info', {
      pagePath: payload.pagePath,
      properties: {
        value: payload.value,
        currency: payload.currency || 'BDT',
        shipping_tier: payload.shippingTier,
        items: payload.items,
      },
    });
  }

  public trackAddPaymentInfo(payload: PaymentInfoPayload) {
    this.track('add_payment_info', {
      pagePath: payload.pagePath,
      properties: {
        value: payload.value,
        currency: payload.currency || 'BDT',
        payment_type: payload.paymentType,
        items: payload.items,
      },
    });
  }

  public trackPurchase(payload: PurchasePayload) {
    if (typeof window !== 'undefined') {
      const orderRef = payload.orderNumber || payload.orderId;
      if (orderRef) {
        const storageKey = `rl_purchase_tracked_${orderRef}`;
        if (sessionStorage.getItem(storageKey)) {
          // Prevent duplicate Purchase events on refresh, repeated requests, or navigation
          return;
        }
        sessionStorage.setItem(storageKey, 'true');
      }
    }

    this.track('purchase', {
      pagePath: payload.pagePath,
      properties: {
        orderId: payload.orderId,
        orderNumber: payload.orderNumber,
        value: payload.value,
        currency: payload.currency || 'BDT',
        deliveryCharge: payload.deliveryCharge,
        coupon: payload.coupon,
        paymentMethod: payload.paymentMethod,
        items: payload.items,
      },
    });
    // Force immediate dispatch on purchase
    this.flushQueue();
  }

  public trackSearch(pagePath: string, query: string, resultsCount?: number) {
    this.track('search', {
      pagePath,
      properties: {
        search_term: query,
        results_count: resultsCount,
      },
    });
  }

  public trackAuthEvent(type: 'login' | 'sign_up', pagePath: string) {
    this.track(type, {
      pagePath,
    });
  }

  public identify(customerId: string) {
    if (typeof window === 'undefined') return;
    fetch(`${API_BASE}/analytics/identify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    }).catch(() => {});

    try {
      Clarity.identify(customerId);
    } catch {}
  }
}

export const analytics = new AnalyticsClient();
