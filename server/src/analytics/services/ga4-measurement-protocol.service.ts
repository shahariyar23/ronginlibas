import { Injectable, Logger } from '@nestjs/common';

export interface Ga4ServerPurchaseItem {
  item_id: string;
  item_name: string;
  price: number;
  quantity: number;
  item_category?: string;
  item_variant?: string;
}

export interface Ga4ServerPurchaseOrder {
  id: string;
  orderNumber: string;
  totalAmount: number | string | any;
  shippingFee?: number | string | any;
  paymentMethod?: string;
  customerId?: string | null;
  guestTrackingToken?: string | null;
  items?: any[];
}

@Injectable()
export class Ga4MeasurementProtocolService {
  private readonly logger = new Logger(Ga4MeasurementProtocolService.name);
  private readonly sentOrderNumbers = new Set<string>();

  private get measurementId(): string | undefined {
    return (
      process.env.GA4_MEASUREMENT_ID ||
      process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ||
      process.env.NEXT_PUBLIC_GA_ID
    );
  }

  private get apiSecret(): string | undefined {
    return process.env.GA4_API_SECRET;
  }

  /**
   * Sends a server-side purchase conversion event to Google Analytics 4 via Measurement Protocol.
   * Completely safe: errors never throw to interrupt order creation or payment webhooks.
   */
  async sendPurchaseEvent(
    order: Ga4ServerPurchaseOrder,
    visitorToken?: string,
  ): Promise<{ success: boolean; reason?: string }> {
    const measurementId = this.measurementId;
    const apiSecret = this.apiSecret;

    // Measurement Protocol requires both measurementId and apiSecret
    if (!measurementId || !apiSecret) {
      this.logger.debug(
        `[GA4 MP] GA4_MEASUREMENT_ID or GA4_API_SECRET not configured on server; skipping server purchase reporting for order #${order.orderNumber}.`,
      );
      return { success: false, reason: 'credentials_not_configured' };
    }

    // Deduplication check: never report the same order twice
    if (this.sentOrderNumbers.has(order.orderNumber)) {
      this.logger.debug(
        `[GA4 MP] Order #${order.orderNumber} already reported via Measurement Protocol; skipping duplicate.`,
      );
      return { success: true, reason: 'already_reported' };
    }

    // Client ID resolution: use visitor first-party token, tracking token, or hashed order ID
    const clientId =
      visitorToken ||
      order.guestTrackingToken ||
      `rl_cust_${order.customerId || order.id}`;

    // Format items
    const items: Ga4ServerPurchaseItem[] = (order.items || []).map((i) => ({
      item_id: String(i.productId || i.id || 'item'),
      item_name: String(i.product?.name || i.name || 'Product'),
      price: Number(i.price || i.unitPrice || 0),
      quantity: Number(i.quantity || 1),
      item_category: i.product?.categoryLabel || undefined,
      item_variant: i.size || i.color ? `${i.size || ''} / ${i.color || ''}` : undefined,
    }));

    const payload = {
      client_id: clientId,
      user_id: order.customerId ? String(order.customerId) : undefined,
      events: [
        {
          name: 'purchase',
          params: {
            transaction_id: order.orderNumber,
            value: Number(order.totalAmount || 0),
            currency: 'BDT',
            shipping: Number(order.shippingFee || 0),
            items,
          },
        },
      ],
    };

    const endpoint = `https://www.google-analytics.com/mp/collect?measurement_id=${encodeURIComponent(
      measurementId,
    )}&api_secret=${encodeURIComponent(apiSecret)}`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // GA4 Measurement Protocol returns 204 No Content or 200 on receipt
      if (response.ok || response.status === 204) {
        this.sentOrderNumbers.add(order.orderNumber);
        // Cap deduplication cache at 5000 items
        if (this.sentOrderNumbers.size > 5000) {
          const firstKey = this.sentOrderNumbers.values().next().value;
          if (firstKey) this.sentOrderNumbers.delete(firstKey);
        }

        this.logger.log(
          `[GA4 MP] Successfully dispatched server-side purchase event for order #${order.orderNumber} (৳${order.totalAmount})`,
        );
        return { success: true };
      } else {
        this.logger.warn(
          `[GA4 MP] Non-200 response from Google Analytics (${response.status}) for order #${order.orderNumber}.`,
        );
        return { success: false, reason: `http_${response.status}` };
      }
    } catch (err: any) {
      // Safe logging: never expose secret or customer PII
      this.logger.warn(
        `[GA4 MP] Failed to send Measurement Protocol event for order #${order.orderNumber}: ${err?.message || 'Network error'}`,
      );
      return { success: false, reason: err?.message || 'network_error' };
    }
  }
}
