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
  Plus,
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

  // Hide on checkout flow to avoid cart distraction
  const isCheckout = pathname === '/checkout' || pathname?.startsWith('/checkout/');
  if (isCheckout) return null;

  const visibleCategories = categories.filter(
    (category) => (category._count?.products ?? 1) > 0,
  );

  const userInitial = user?.name?.trim()?.charAt(0)?.toUpperCase() || user?.email?.trim()?.charAt(0)?.toUpperCase() || 'U';

  return (
    <>
      {/* ================= FLOATING GLASSMORPHIC CAPSULE DOCK (YOUTUBE-STYLE) ================= */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="fixed inset-x-3 z-40 lg:hidden max-w-[430px] mx-auto select-none pointer-events-none"
        style={{
          bottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))',
        }}
      >
        <div className="pointer-events-auto flex items-center justify-around h-[54px] px-2.5 rounded-full bg-[#05261e]/85 backdrop-blur-xl border border-white/20 shadow-[0_12px_36px_rgba(0,0,0,0.45),0_2px_8px_rgba(0,0,0,0.2)]">
          {/* 1. HOME */}
          <Link
            href="/"
            aria-label="Home"
            title="Home"
            className={`flex items-center justify-center transition-all duration-200 cursor-pointer ${
              isHomeActive
                ? 'w-12 h-9 rounded-full bg-white/20 text-[#c79a45] shadow-inner'
                : 'w-10 h-9 rounded-full text-white/75 hover:text-white hover:bg-white/10'
            }`}
          >
            <Home
              className={`w-5 h-5 transition-transform duration-200 ${
                isHomeActive ? 'scale-110 stroke-[2.2]' : 'stroke-[1.8]'
              }`}
            />
          </Link>

          {/* 2. OFFERS / SHORTS */}
          <Link
            href="/offers"
            aria-label="Special Offers"
            title="Special Offers"
            className={`flex items-center justify-center relative transition-all duration-200 cursor-pointer ${
              isOffersActive
                ? 'w-12 h-9 rounded-full bg-white/20 text-[#c79a45] shadow-inner'
                : 'w-10 h-9 rounded-full text-white/75 hover:text-white hover:bg-white/10'
            }`}
          >
            <Sparkles
              className={`w-5 h-5 transition-transform duration-200 ${
                isOffersActive ? 'scale-110 stroke-[2.2]' : 'stroke-[1.8]'
              }`}
            />
            <span className="absolute top-1.5 right-2 w-1.5 h-1.5 bg-[#c79a45] rounded-full animate-pulse shadow-[0_0_6px_#c79a45]" />
          </Link>

          {/* 3. CENTER BUTTON (+) - BROWSE CATEGORIES */}
          <button
            type="button"
            onClick={() => setIsCategorySheetOpen((prev) => !prev)}
            aria-label="Browse Categories"
            title="Wardrobe Categories"
            aria-expanded={isCategorySheetOpen}
            className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-90 shadow-sm ${
              isCategorySheetOpen || isCategoriesActive
                ? 'border-[#c79a45] bg-[#c79a45]/20 text-[#c79a45]'
                : 'border-white/35 bg-white/10 text-white hover:bg-white/20 hover:border-white/50'
            }`}
          >
            <Plus
              className={`w-5 h-5 stroke-[2.4] transition-transform duration-200 ${
                isCategorySheetOpen ? 'rotate-45' : ''
              }`}
            />
          </button>

          {/* 4. ORDERS */}
          <Link
            href="/orders"
            aria-label="Order History & Tracking"
            title="My Orders"
            className={`flex items-center justify-center transition-all duration-200 cursor-pointer ${
              isOrdersActive
                ? 'w-12 h-9 rounded-full bg-white/20 text-[#c79a45] shadow-inner'
                : 'w-10 h-9 rounded-full text-white/75 hover:text-white hover:bg-white/10'
            }`}
          >
            <Package
              className={`w-5 h-5 transition-transform duration-200 ${
                isOrdersActive ? 'scale-110 stroke-[2.2]' : 'stroke-[1.8]'
              }`}
            />
          </Link>

          {/* 5. USER / PROFILE (Circular Avatar initial like YouTube M-circle) */}
          <Link
            href={isLoggedIn ? '/profile' : '/login'}
            aria-label={isLoggedIn ? 'User Profile' : 'Sign In'}
            title={isLoggedIn ? (user?.name || 'My Profile') : 'Sign In'}
            className={`flex items-center justify-center relative transition-all duration-200 cursor-pointer ${
              isProfileActive
                ? 'w-12 h-9 rounded-full bg-white/20 text-[#c79a45] shadow-inner'
                : 'w-10 h-9 rounded-full text-white/75 hover:text-white hover:bg-white/10'
            }`}
          >
            {mounted && isLoggedIn ? (
              <div className="relative">
                <div className="w-7 h-7 rounded-full bg-[#10b981] text-white font-bold text-xs flex items-center justify-center border border-white/40 shadow-xs uppercase">
                  {userInitial}
                </div>
                {unreadCount > 0 ? (
                  <span
                    key={unreadCount}
                    className="absolute -top-1 -right-1 bg-[#ba1a1a] text-white text-[9px] font-bold min-w-3.5 h-3.5 px-0.5 rounded-full flex items-center justify-center border border-[#073a2d]"
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                ) : (
                  <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#10b981] border border-[#073a2d]" />
                )}
              </div>
            ) : (
              <div className="relative">
                <div className="w-7 h-7 rounded-full bg-white/10 border border-white/25 flex items-center justify-center text-white">
                  <User className="w-4 h-4 stroke-[2]" />
                </div>
                {mounted && unreadCount > 0 && (
                  <span
                    key={unreadCount}
                    className="absolute -top-1 -right-1 bg-[#ba1a1a] text-white text-[9px] font-bold min-w-3.5 h-3.5 px-0.5 rounded-full flex items-center justify-center border border-[#073a2d]"
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
            )}
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
