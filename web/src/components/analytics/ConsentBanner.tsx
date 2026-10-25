'use client';

import React, { useEffect, useState } from 'react';
import { ShieldCheck, Settings, Check, X } from 'lucide-react';
import {
  getStoredConsent,
  saveConsent,
  hasConsentBeenDetermined,
  CONSENT_EVENT_NAME,
} from '@/lib/analytics/consent';

export function ConsentBanner() {
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [marketingEnabled, setMarketingEnabled] = useState(true);

  useEffect(() => {
    // Only show if user hasn't made a choice yet
    if (!hasConsentBeenDetermined()) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 800);
      return () => clearTimeout(timer);
    }

    // Listen for custom trigger to reopen consent preferences
    const handleReopen = () => {
      const current = getStoredConsent();
      if (current) {
        setAnalyticsEnabled(current.analytics);
        setMarketingEnabled(current.marketing);
      }
      setIsModalOpen(true);
    };

    window.addEventListener('open_consent_preferences', handleReopen);
    return () => {
      window.removeEventListener('open_consent_preferences', handleReopen);
    };
  }, []);

  const handleAcceptAll = () => {
    saveConsent({ analytics: true, marketing: true });
    setIsOpen(false);
    setIsModalOpen(false);
  };

  const handleEssentialOnly = () => {
    saveConsent({ analytics: false, marketing: false });
    setIsOpen(false);
    setIsModalOpen(false);
  };

  const handleSavePreferences = () => {
    saveConsent({ analytics: analyticsEnabled, marketing: marketingEnabled });
    setIsOpen(false);
    setIsModalOpen(false);
  };

  if (!isOpen && !isModalOpen) return null;

  return (
    <>
      {/* Floating Atelier Banner */}
      {isOpen && !isModalOpen && (
        <aside
          aria-label="Cookie and Privacy Consent"
          className="fixed bottom-16 lg:bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-xl z-50 bg-[#073a2d] text-[#fbf9f2] p-5 sm:p-6 shadow-2xl border border-[#d4af37]/30 rounded-xs backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-5"
        >
          <div className="flex items-start gap-3.5 mb-3">
            <div className="p-2 bg-[#d4af37]/10 rounded-full shrink-0 text-[#d4af37]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-base sm:text-lg font-semibold tracking-wide text-[#fbf9f2]">
                Privacy & Atelier Experience
              </h3>
              <p className="text-xs sm:text-sm text-[#deddd3]/90 leading-relaxed mt-1">
                We use cookies and privacy-conscious analytics to elevate your bespoke browsing
                experience and honor your privacy. Essential cookies remain active to power your
                cart and orders.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2.5 mt-4 pt-3 border-t border-[#fbf9f2]/10">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="px-3.5 py-1.5 text-xs text-[#deddd3] hover:text-[#d4af37] font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5" />
              Customize
            </button>
            <button
              type="button"
              onClick={handleEssentialOnly}
              className="px-4 py-1.5 text-xs font-medium text-[#fbf9f2] bg-white/10 hover:bg-white/15 border border-[#fbf9f2]/20 rounded-xs transition-colors cursor-pointer"
            >
              Essential Only
            </button>
            <button
              type="button"
              onClick={handleAcceptAll}
              className="px-4 py-1.5 text-xs font-semibold text-[#073a2d] bg-[#d4af37] hover:bg-[#e2c04d] rounded-xs shadow-xs transition-colors cursor-pointer"
            >
              Accept All
            </button>
          </div>
        </aside>
      )}

      {/* Granular Preference Customization Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#073a2d] text-[#fbf9f2] w-full max-w-lg border border-[#d4af37]/40 shadow-2xl p-6 rounded-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#fbf9f2]/15">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-[#d4af37]" />
                <h3 className="font-serif text-lg font-semibold tracking-wide">
                  Privacy Preferences
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-[#deddd3] hover:text-[#fbf9f2] p-1 cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#deddd3]/90 leading-relaxed">
              Tailor your tracking permissions. You may update or withdraw your consent at any time.
            </p>

            <div className="space-y-4">
              {/* Essential */}
              <div className="p-3.5 bg-white/5 border border-white/10 rounded-xs flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[#fbf9f2]">
                      Strictly Necessary Cookies
                    </span>
                    <span className="text-[10px] uppercase tracking-wider bg-[#d4af37]/20 text-[#d4af37] px-1.5 py-0.5 rounded-xs font-semibold">
                      Always Active
                    </span>
                  </div>
                  <p className="text-xs text-[#deddd3]/80 mt-1">
                    Required for bag persistence, patron checkout, fraud defense, and basic security.
                  </p>
                </div>
              </div>

              {/* Analytics */}
              <div className="p-3.5 bg-white/5 border border-white/10 rounded-xs flex items-start justify-between gap-3">
                <div>
                  <span className="text-sm font-medium text-[#fbf9f2]">
                    Performance & User Analytics
                  </span>
                  <p className="text-xs text-[#deddd3]/80 mt-1">
                    Allows anonymous page views, engagement duration, and garment interest measurement
                    to refine our atelier offerings.
                  </p>
                </div>
                <input
                  type="checkbox"
                  id="consent-analytics"
                  checked={analyticsEnabled}
                  onChange={(e) => setAnalyticsEnabled(e.target.checked)}
                  className="mt-1 h-4 w-4 accent-[#d4af37] cursor-pointer"
                />
              </div>

              {/* Marketing */}
              <div className="p-3.5 bg-white/5 border border-white/10 rounded-xs flex items-start justify-between gap-3">
                <div>
                  <span className="text-sm font-medium text-[#fbf9f2]">
                    Advertising & Retargeting
                  </span>
                  <p className="text-xs text-[#deddd3]/80 mt-1">
                    Enables Meta Pixel and social campaign conversion measurement for bespoke collections.
                  </p>
                </div>
                <input
                  type="checkbox"
                  id="consent-marketing"
                  checked={marketingEnabled}
                  onChange={(e) => setMarketingEnabled(e.target.checked)}
                  className="mt-1 h-4 w-4 accent-[#d4af37] cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#fbf9f2]/15">
              <button
                type="button"
                onClick={handleEssentialOnly}
                className="px-4 py-2 text-xs font-medium text-[#deddd3] hover:text-[#fbf9f2] transition-colors cursor-pointer"
              >
                Reject Optional
              </button>
              <button
                type="button"
                onClick={handleSavePreferences}
                className="px-5 py-2 text-xs font-semibold text-[#073a2d] bg-[#d4af37] hover:bg-[#e2c04d] rounded-xs transition-colors cursor-pointer"
              >
                Save My Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
