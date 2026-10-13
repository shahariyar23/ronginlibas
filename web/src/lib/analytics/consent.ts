/**
 * Privacy and Consent Management Layer for Rongin Libas.
 * Supports granular controls, GA4 consent mode, and backend synchronization.
 */

export const CONSENT_STORAGE_KEY = 'rl_consent_preferences';
export const CONSENT_EVENT_NAME = 'rl_consent_changed';
export const CONSENT_VERSION = '1.0';

export interface ConsentPreferences {
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
  version: string;
}

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
    clarity?: (...args: any[]) => void;
  }
}

/**
 * Retrieves the stored consent choices from local storage.
 */
export function getStoredConsent(): ConsentPreferences | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed.analytics === 'boolean' && typeof parsed.marketing === 'boolean') {
      return parsed;
    }
  } catch {
    // Malformed JSON fallback
  }
  return null;
}

/**
 * Checks whether user has explicitly made a consent choice.
 */
export function hasConsentBeenDetermined(): boolean {
  return getStoredConsent() !== null;
}

/**
 * Updates Google Analytics 4 Consent Mode v2 state.
 */
export function updateGtagConsent(prefs: ConsentPreferences) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;

  window.gtag('consent', 'update', {
    analytics_storage: prefs.analytics ? 'granted' : 'denied',
    ad_storage: prefs.marketing ? 'granted' : 'denied',
    ad_user_data: prefs.marketing ? 'granted' : 'denied',
    ad_personalization: prefs.marketing ? 'granted' : 'denied',
  });
}

/**
 * Saves consent choices, informs GA4, triggers local custom event,
 * and synchronizes with the NestJS backend.
 */
export function saveConsent(choices: { analytics: boolean; marketing: boolean }): ConsentPreferences {
  const prefs: ConsentPreferences = {
    analytics: choices.analytics,
    marketing: choices.marketing,
    timestamp: new Date().toISOString(),
    version: CONSENT_VERSION,
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(prefs));
    updateGtagConsent(prefs);
    window.dispatchEvent(new CustomEvent(CONSENT_EVENT_NAME, { detail: prefs }));

    // Asynchronously synchronize with backend analytics module
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:4000/api/v1';

    fetch(`${apiUrl}/analytics/consent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        analyticsConsent: prefs.analytics,
        marketingConsent: prefs.marketing,
        version: prefs.version,
      }),
    }).catch(() => {
      // Graceful offline/network fallback
    });
  }

  return prefs;
}
