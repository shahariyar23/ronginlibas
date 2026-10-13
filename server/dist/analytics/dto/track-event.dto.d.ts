export declare const ALLOWED_EVENT_TYPES: readonly ["page_view", "view_item_list", "select_item", "view_item", "select_size", "select_color", "add_to_cart", "remove_from_cart", "view_cart", "begin_checkout", "add_shipping_info", "add_payment_info", "purchase", "search", "sign_up", "login", "add_to_wishlist", "remove_from_wishlist", "view_promotion", "select_promotion"];
export type AllowedEventType = (typeof ALLOWED_EVENT_TYPES)[number];
export declare class TrackEventDto {
    eventType: string;
    pagePath: string;
    productId?: string;
    engagementDuration?: number;
    campaignSource?: string;
    campaignMedium?: string;
    campaignName?: string;
    properties?: Record<string, any>;
}
export declare class TrackEventsBatchDto {
    events: TrackEventDto[];
    referrer?: string;
    deviceType?: string;
}
export declare class UpdateConsentDto {
    analyticsConsent: boolean;
    marketingConsent: boolean;
    version?: string;
}
export declare class AnalyticsQueryDto {
    from?: string;
    to?: string;
    period?: 'today' | '7d' | '30d' | '90d' | 'year' | 'all';
    page?: number;
    limit?: number;
    search?: string;
}
