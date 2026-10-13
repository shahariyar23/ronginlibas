var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var Ga4MeasurementProtocolService_1;
import { Injectable, Logger } from '@nestjs/common';
let Ga4MeasurementProtocolService = Ga4MeasurementProtocolService_1 = class Ga4MeasurementProtocolService {
    logger = new Logger(Ga4MeasurementProtocolService_1.name);
    sentOrderNumbers = new Set();
    get measurementId() {
        return (process.env.GA4_MEASUREMENT_ID ||
            process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ||
            process.env.NEXT_PUBLIC_GA_ID);
    }
    get apiSecret() {
        return process.env.GA4_API_SECRET;
    }
    async sendPurchaseEvent(order, visitorToken) {
        const measurementId = this.measurementId;
        const apiSecret = this.apiSecret;
        if (!measurementId || !apiSecret) {
            this.logger.debug(`[GA4 MP] GA4_MEASUREMENT_ID or GA4_API_SECRET not configured on server; skipping server purchase reporting for order #${order.orderNumber}.`);
            return { success: false, reason: 'credentials_not_configured' };
        }
        if (this.sentOrderNumbers.has(order.orderNumber)) {
            this.logger.debug(`[GA4 MP] Order #${order.orderNumber} already reported via Measurement Protocol; skipping duplicate.`);
            return { success: true, reason: 'already_reported' };
        }
        const clientId = visitorToken ||
            order.guestTrackingToken ||
            `rl_cust_${order.customerId || order.id}`;
        const items = (order.items || []).map((i) => ({
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
        const endpoint = `https://www.google-analytics.com/mp/collect?measurement_id=${encodeURIComponent(measurementId)}&api_secret=${encodeURIComponent(apiSecret)}`;
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
            if (response.ok || response.status === 204) {
                this.sentOrderNumbers.add(order.orderNumber);
                if (this.sentOrderNumbers.size > 5000) {
                    const firstKey = this.sentOrderNumbers.values().next().value;
                    if (firstKey)
                        this.sentOrderNumbers.delete(firstKey);
                }
                this.logger.log(`[GA4 MP] Successfully dispatched server-side purchase event for order #${order.orderNumber} (৳${order.totalAmount})`);
                return { success: true };
            }
            else {
                this.logger.warn(`[GA4 MP] Non-200 response from Google Analytics (${response.status}) for order #${order.orderNumber}.`);
                return { success: false, reason: `http_${response.status}` };
            }
        }
        catch (err) {
            this.logger.warn(`[GA4 MP] Failed to send Measurement Protocol event for order #${order.orderNumber}: ${err?.message || 'Network error'}`);
            return { success: false, reason: err?.message || 'network_error' };
        }
    }
};
Ga4MeasurementProtocolService = Ga4MeasurementProtocolService_1 = __decorate([
    Injectable()
], Ga4MeasurementProtocolService);
export { Ga4MeasurementProtocolService };
//# sourceMappingURL=ga4-measurement-protocol.service.js.map