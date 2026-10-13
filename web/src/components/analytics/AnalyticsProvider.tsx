'use client';

import React, { useEffect, useState, useRef } from 'react';
import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { analytics } from '@/lib/analytics/client';
import {
  getStoredConsent,
  CONSENT_EVENT_NAME,
  ConsentPreferences,
} from '@/lib/analytics/consent';
import Clarity from '@microsoft/clarity';

const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || process.env.NEXT_PUBLIC_GA_ID;
const CLARITY_PROJECT_ID =
  process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID || process.env.NEXT_PUBLIC_CLARITY_ID;

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [consent, setConsent] = useState<ConsentPreferences | null>(null);
  const previousPathRef = useRef<string>('');

  // Synchronize Microsoft Clarity with granular analytics and ad consent
  useEffect(() => {
    if (!CLARITY_PROJECT_ID || typeof window === 'undefined') return;

    if (consent?.analytics) {
      Clarity.init(CLARITY_PROJECT_ID);
      Clarity.consentV2({
        analytics_Storage: 'granted',
        ad_Storage: consent.marketing ? 'granted' : 'denied',
      });
    } else if (consent && !consent.analytics) {
      Clarity.consent(false);
      Clarity.consentV2({
        analytics_Storage: 'denied',
        ad_Storage: 'denied',
      });
    }
  }, [consent]);

  useEffect(() => {
    // Initial consent read
    setConsent(getStoredConsent());

    const handleConsentChange = (e: Event) => {
      const customEvent = e as CustomEvent<ConsentPreferences>;
      setConsent(customEvent.detail);
    };

    window.addEventListener(CONSENT_EVENT_NAME, handleConsentChange);
    return () => {
      window.removeEventListener(CONSENT_EVENT_NAME, handleConsentChange);
    };
  }, []);

  // Track page navigation & engagement duration
  useEffect(() => {
    if (!pathname) return;

    const queryString = searchParams?.toString();
    const currentPath = queryString ? `${pathname}?${queryString}` : pathname;

    if (previousPathRef.current !== currentPath) {
      const engagement = analytics.extractEngagementDuration();
      analytics.trackPageView(currentPath, engagement > 0 ? engagement : undefined);

      // Microsoft Clarity: record page path and route transition event
      if (consent?.analytics && CLARITY_PROJECT_ID && typeof window !== 'undefined') {
        Clarity.setTag('page_path', currentPath);
        Clarity.event('page_view');
      }

      previousPathRef.current = currentPath;
    }
  }, [pathname, searchParams, consent?.analytics]);

  return (
    <>
      {/* Google Analytics 4 Script (Conditional on Analytics Consent) */}
      {GA_MEASUREMENT_ID && consent?.analytics && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('consent', 'default', {
                'analytics_storage': 'granted',
                'ad_storage': '${consent?.marketing ? 'granted' : 'denied'}',
                'ad_user_data': '${consent?.marketing ? 'granted' : 'denied'}',
                'ad_personalization': '${consent?.marketing ? 'granted' : 'denied'}'
              });
              gtag('config', '${GA_MEASUREMENT_ID}', {
                page_path: window.location.pathname,
                send_page_view: false
              });
            `}
          </Script>
        </>
      )}

      {children}
    </>
  );
}
