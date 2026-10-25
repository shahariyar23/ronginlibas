'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  Home,
  Sparkles,
  LayoutGrid,
  Package,
  User,
  X,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useStorefront } from '@/context/StorefrontContext';
import { useNotifications } from '@/context/NotificationContext';

function BottomNavContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, isLoggedIn } = useAuth();
  const { categories, womenAvailable } = useStorefront();
  const { unreadCount } = useNotifications();

  const [mounted, setMounted] = useState(false);
  const [isCategorySheetOpen, setIsCategorySheetOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close category sheet whenever route changes
  useEffect(() => {
    setIsCategorySheetOpen(false);
  }, [pathname, searchParams]);

  // Lock body scroll when category sheet is open
  useEffect(() => {
    if (isCategorySheetOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCategorySheetOpen]);

  // Route active states
  const isHomeActive = pathname === '/';
  const isOffersActive =
    pathname === '/offers' ||
    (pathname === '/shop' &&
      (searchParams?.get('offers') === 'true' || searchParams?.get('hasDiscount') === 'true'));
  const isCategoriesActive =
    isCategorySheetOpen ||
    pathname === '/categories' ||
    pathname === '/men' ||
    pathname.startsWith('/men/') ||
    (pathname === '/shop' && !isOffersActive);
  const isOrdersActive =
    pathname === '/orders' ||
    pathname.startsWith('/orders/') ||
    pathname === '/track-order' ||
    pathname.startsWith('/track-order/');
  const isProfileActive =
    pathname === '/profile' ||
    pathname.startsWith('/profile/') ||
    pathname === '/login' ||
    pathname === '/register';

  const visibleCategories = categories.filter(
    (category) => (category._count?.products ?? 1) > 0,
  );

  return (
    <>
      {/* ================= COMPACT LUXURY BOTTOM NAV BAR ================= */}
      {/* Structure: Home | Offers | Category | Orders | Profile */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-[#073a2d] border-t border-[#0f5442] shadow-[0_-4px_24px_rgba(0,0,0,0.22)] select-none"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="grid grid-cols-5 items-stretch h-[54px] sm:h-[58px] max-w-lg mx-auto px-1">
          {/* 1. HOME */}
          <Link
            href="/"
            aria-label="Home"
            className={`flex flex-col items-center justify-center relative py-1 px-0.5 group transition-all duration-200 cursor-pointer ${
              isHomeActive
                ? 'text-[#c79a45]'
                : 'text-[#d3ddd8]/75 hover:text-white'
            }`}
          >
            {isHomeActive && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-7 h-0.5 bg-[#c79a45] rounded-full shadow-[0_0_8px_#c79a45]" />
            )}
            <Home
              className={`w-[19px] h-[19px] sm:w-5 sm:h-5 transition-transform duration-200 ${
                isHomeActive ? 'scale-110 stroke-[2.2]' : 'stroke-[1.75] group-hover:scale-105'
              }`}
            />
            <span
              className={`text-[9.5px] sm:text-[10px] font-sans font-medium tracking-[0.04em] uppercase mt-0.5 leading-none transition-colors ${
                isHomeActive ? 'font-bold text-[#c79a45]' : 'text-[#d3ddd8]/80'
              }`}
            >
              Home
            </span>
          </Link>

          {/* 2. OFFERS */}
          <Link
            href="/offers"
            aria-label="Special Offers"
            className={`flex flex-col items-center justify-center relative py-1 px-0.5 group transition-all duration-200 cursor-pointer ${
              isOffersActive
                ? 'text-[#c79a45]'
                : 'text-[#d3ddd8]/75 hover:text-white'
            }`}
          >
            {isOffersActive && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-7 h-0.5 bg-[#c79a45] rounded-full shadow-[0_0_8px_#c79a45]" />
            )}
            <div className="relative">
              <Sparkles
                className={`w-[19px] h-[19px] sm:w-5 sm:h-5 transition-transform duration-200 ${
                  isOffersActive ? 'scale-110 stroke-[2.2]' : 'stroke-[1.75] group-hover:scale-105'
                }`}
              />
              <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-[#c79a45] rounded-full animate-pulse" />
            </div>
            <span
              className={`text-[9.5px] sm:text-[10px] font-sans font-medium tracking-[0.04em] uppercase mt-0.5 leading-none transition-colors ${
                isOffersActive ? 'font-bold text-[#c79a45]' : 'text-[#d3ddd8]/80'
              }`}
            >
              Offers
            </span>
          </Link>

          {/* 3. CATEGORY */}
          <button
            type="button"
            onClick={() => setIsCategorySheetOpen((prev) => !prev)}
            aria-label="Browse Categories"
            aria-expanded={isCategorySheetOpen}
            className={`flex flex-col items-center justify-center relative py-1 px-0.5 group transition-all duration-200 cursor-pointer ${
              isCategoriesActive
                ? 'text-[#c79a45]'
                : 'text-[#d3ddd8]/75 hover:text-white'
            }`}
          >
            {isCategoriesActive && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-7 h-0.5 bg-[#c79a45] rounded-full shadow-[0_0_8px_#c79a45]" />
            )}
            <LayoutGrid
              className={`w-[19px] h-[19px] sm:w-5 sm:h-5 transition-transform duration-200 ${
                isCategoriesActive ? 'scale-110 stroke-[2.2]' : 'stroke-[1.75] group-hover:scale-105'
              }`}
            />
            <span
              className={`text-[9.5px] sm:text-[10px] font-sans font-medium tracking-[0.04em] uppercase mt-0.5 leading-none transition-colors ${
                isCategoriesActive ? 'font-bold text-[#c79a45]' : 'text-[#d3ddd8]/80'
              }`}
            >
              Category
            </span>
          </button>

          {/* 4. ORDERS (Reuse existing /orders page) */}
          <Link
            href="/orders"
            aria-label="Order History & Tracking"
            className={`flex flex-col items-center justify-center relative py-1 px-0.5 group transition-all duration-200 cursor-pointer ${
              isOrdersActive
                ? 'text-[#c79a45]'
                : 'text-[#d3ddd8]/75 hover:text-white'
            }`}
          >
            {isOrdersActive && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-7 h-0.5 bg-[#c79a45] rounded-full shadow-[0_0_8px_#c79a45]" />
            )}
            <Package
              className={`w-[19px] h-[19px] sm:w-5 sm:h-5 transition-transform duration-200 ${
                isOrdersActive ? 'scale-110 stroke-[2.2]' : 'stroke-[1.75] group-hover:scale-105'
              }`}
            />
            <span
              className={`text-[9.5px] sm:text-[10px] font-sans font-medium tracking-[0.04em] uppercase mt-0.5 leading-none transition-colors ${
                isOrdersActive ? 'font-bold text-[#c79a45]' : 'text-[#d3ddd8]/80'
              }`}
            >
              Orders
            </span>
          </Link>

          {/* 5. USER / PROFILE (With Notification Badge) */}
          <Link
            href={isLoggedIn ? '/profile' : '/login'}
            aria-label={isLoggedIn ? 'User Profile' : 'Sign In'}
            className={`flex flex-col items-center justify-center relative py-1 px-0.5 group transition-all duration-200 cursor-pointer ${
              isProfileActive
                ? 'text-[#c79a45]'
                : 'text-[#d3ddd8]/75 hover:text-white'
            }`}
          >
            {isProfileActive && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-7 h-0.5 bg-[#c79a45] rounded-full shadow-[0_0_8px_#c79a45]" />
            )}
            <div className="relative">
              <User
                className={`w-[19px] h-[19px] sm:w-5 sm:h-5 transition-transform duration-200 ${
                  isProfileActive ? 'scale-110 stroke-[2.2]' : 'stroke-[1.75] group-hover:scale-105'
                }`}
              />
              {/* Notification Badge if customer has unread order/review updates */}
              {mounted && unreadCount > 0 ? (
                <span
                  key={unreadCount}
                  className="absolute -top-1.5 -right-2 bg-[#ba1a1a] text-white text-[9px] font-bold min-w-4 h-4 px-1 rounded-full flex items-center justify-center border border-[#073a2d] shadow-xs animate-in zoom-in-75 duration-200"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              ) : mounted && isLoggedIn ? (
                <span className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[#10b981] border border-[#073a2d]" />
              ) : null}
            </div>
            <span
              className={`text-[9.5px] sm:text-[10px] font-sans font-medium tracking-[0.04em] uppercase mt-0.5 leading-none transition-colors truncate max-w-[56px] text-center ${
                isProfileActive ? 'font-bold text-[#c79a45]' : 'text-[#d3ddd8]/80'
              }`}
            >
              Profile
            </span>
          </Link>
        </div>
      </nav>

      {/* ================= CATEGORY SLIDE-UP SHEET ================= */}
      {isCategorySheetOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setIsCategorySheetOpen(false)}
            aria-hidden="true"
          />

          {/* Sheet Container */}
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Wardrobe Categories"
            className="relative z-10 w-full max-h-[80vh] bg-[#fbf9f2] rounded-t-2xl shadow-2xl border-t border-[#deddd3] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 8px)' }}
          >
            {/* Grab Handle */}
            <div className="pt-3 pb-1 flex justify-center">
              <span className="w-10 h-1 rounded-full bg-[#d5d3c8]" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-[#deddd3]/70">
              <div>
                <h3 className="font-serif font-bold text-lg text-[#073a2d] tracking-wide">
                  Wardrobe Collections
                </h3>
                <p className="font-sans text-[11px] text-[#717975] uppercase tracking-wider">
                  Handcrafted Aristocratic Menswear
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCategorySheetOpen(false)}
                className="w-8 h-8 rounded-full bg-white border border-[#deddd3] hover:bg-[#deddd3]/30 flex items-center justify-center text-[#1b1c18] transition-colors cursor-pointer"
                aria-label="Close categories sheet"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="overflow-y-auto px-4 py-4 space-y-4 max-h-[calc(80vh-80px)]">
              {/* Quick Links Banner */}
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/men"
                  onClick={() => setIsCategorySheetOpen(false)}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#073a2d] text-white transition-transform active:scale-[0.98] shadow-xs"
                >
                  <div>
                    <span className="block text-[11px] font-sans font-bold uppercase tracking-wider text-[#c79a45]">
                      Explore All
                    </span>
                    <span className="block text-xs font-semibold text-[#fbf9f2]">
                      Men&apos;s Atelier
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#c79a45]" />
                </Link>

                <Link
                  href="/collections/new-arrivals"
                  onClick={() => setIsCategorySheetOpen(false)}
                  className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#c79a45]/30 hover:border-[#c79a45] transition-transform active:scale-[0.98] shadow-xs"
                >
                  <div>
                    <span className="block text-[11px] font-sans font-bold uppercase tracking-wider text-[#c79a45]">
                      Fresh Drop
                    </span>
                    <span className="block text-xs font-semibold text-[#073a2d]">
                      New Arrivals
                    </span>
                  </div>
                  <Sparkles className="w-4 h-4 text-[#c79a45]" />
                </Link>
              </div>

              {/* Category Grid */}
              <div className="space-y-1.5">
                <div className="text-[10.5px] font-sans font-bold uppercase tracking-widest text-[#717975] px-1">
                  Atelier Categories
                </div>

                <div className="bg-white rounded-xl border border-[#deddd3] divide-y divide-[#f0eee7] overflow-hidden shadow-xs">
                  {visibleCategories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/men/${encodeURIComponent(category.slug)}`}
                      onClick={() => setIsCategorySheetOpen(false)}
                      className="flex items-center justify-between p-3.5 hover:bg-[#fbf9f2] transition-colors group"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#c79a45] group-hover:scale-125 transition-transform" />
                        <span className="text-xs font-bold font-sans text-[#1b1c18] group-hover:text-[#073a2d] transition-colors">
                          {category.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {category._count?.products !== undefined && (
                          <span className="text-[10px] uppercase font-bold tracking-wider text-[#717975] bg-[#f5f4ed] px-2 py-0.5 rounded-full border border-[#deddd3]/60">
                            {category._count.products} Items
                          </span>
                        )}
                        <ArrowRight className="w-3.5 h-3.5 text-[#a4b5ad] group-hover:text-[#073a2d] group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </Link>
                  ))}

                  {/* Best Sellers */}
                  <Link
                    href="/collections/bestsellers"
                    onClick={() => setIsCategorySheetOpen(false)}
                    className="flex items-center justify-between p-3.5 hover:bg-[#fbf9f2] transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#073a2d]" />
                      <span className="text-xs font-bold font-sans text-[#1b1c18] group-hover:text-[#073a2d] transition-colors">
                        Best Sellers
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#073a2d] bg-[#073a2d]/10 px-2 py-0.5 rounded-full">
                        Iconic
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#a4b5ad] group-hover:text-[#073a2d] transition-all" />
                    </div>
                  </Link>

                  {/* Offers */}
                  <Link
                    href="/offers"
                    onClick={() => setIsCategorySheetOpen(false)}
                    className="flex items-center justify-between p-3.5 hover:bg-[#fbf9f2] transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#c79a45]" />
                      <span className="text-xs font-bold font-sans text-[#c79a45] group-hover:text-[#b08436] transition-colors">
                        Offers & Promotions
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-white bg-[#c79a45] px-2 py-0.5 rounded-full">
                        Sale
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#c79a45] group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </Link>

                  {/* Women if available */}
                  {womenAvailable && (
                    <Link
                      href="/shop?gender=WOMEN"
                      onClick={() => setIsCategorySheetOpen(false)}
                      className="flex items-center justify-between p-3.5 hover:bg-[#fbf9f2] transition-colors group"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#073a2d]" />
                        <span className="text-xs font-bold font-sans text-[#1b1c18] group-hover:text-[#073a2d] transition-colors">
                          Women&apos;s Edition
                        </span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-[#a4b5ad] group-hover:text-[#073a2d] transition-all" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function BottomNav() {
  return (
    <Suspense fallback={null}>
      <BottomNavContent />
    </Suspense>
  );
}
