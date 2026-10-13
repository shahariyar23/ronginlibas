/**
 * Strongly typed e-commerce event catalog for Rongin Libas.
 * Aligns internal event semantics with Google Analytics 4 and Meta Pixel standards.
 */

export interface AnalyticsItem {
  item_id: string;
  item_name: string;
  item_category?: string;
  item_variant?: string;
  price: number;
  quantity?: number;
  currency?: string;
}

export type StandardEventType =
  | 'page_view'
  | 'view_item_list'
  | 'select_item'
  | 'view_item'
  | 'select_size'
  | 'select_color'
  | 'add_to_cart'
  | 'remove_from_cart'
  | 'view_cart'
  | 'begin_checkout'
  | 'add_shipping_info'
  | 'add_payment_info'
  | 'purchase'
  | 'search'
  | 'sign_up'
  | 'login'
  | 'add_to_wishlist'
  | 'remove_from_wishlist'
  | 'view_promotion'
  | 'select_promotion';

export interface BaseEventPayload {
  pagePath: string;
  engagementDuration?: number;
  campaignSource?: string;
  campaignMedium?: string;
  campaignName?: string;
  properties?: Record<string, any>;
}

export interface ViewItemPayload extends BaseEventPayload {
  productId: string;
  productName: string;
  price: number;
  currency?: string;
  category?: string;
  variant?: string;
  items?: AnalyticsItem[];
}

export interface SelectVariantPayload extends BaseEventPayload {
  productId: string;
  productName?: string;
  size?: string;
  color?: string;
}

export interface CartActionPayload extends BaseEventPayload {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
  currency?: string;
  items?: AnalyticsItem[];
}

export interface CheckoutPayload extends BaseEventPayload {
  currency: string;
  value: number;
  coupon?: string;
  items: AnalyticsItem[];
}

export interface ShippingInfoPayload extends BaseEventPayload {
  currency: string;
  value: number;
  shippingTier?: string;
  items: AnalyticsItem[];
}

export interface PaymentInfoPayload extends BaseEventPayload {
  currency: string;
  value: number;
  paymentType?: string;
  items: AnalyticsItem[];
}

export interface PurchasePayload extends BaseEventPayload {
  orderId: string;
  orderNumber: string;
  currency: string;
  value: number;
  deliveryCharge?: number;
  coupon?: string;
  paymentMethod?: string;
  items: AnalyticsItem[];
}
