/**
 * Safe, browser-only interface for Meta Pixel standard events.
 * Marketing consent is enforced by the analytics client before this is called.
 */

export type MetaStandardEvent =
  | 'PageView'
  | 'ViewContent'
  | 'Search'
  | 'AddToCart'
  | 'InitiateCheckout'
  | 'AddPaymentInfo'
  | 'Purchase';

export type MetaEventParameters = Record<string, unknown>;

export function trackMetaEvent(event: MetaStandardEvent, parameters?: MetaEventParameters) {
  if (typeof window === 'undefined' || !process.env.NEXT_PUBLIC_META_PIXEL_ID) return;

  try {
    window.fbq?.('track', event, parameters);
  } catch {
    // Third-party tracking must never affect storefront functionality.
  }
}

export function trackMetaPageView() {
  trackMetaEvent('PageView');
}
