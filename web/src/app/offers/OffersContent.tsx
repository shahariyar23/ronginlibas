'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Tag,
  Clock,
  Truck,
  Copy,
  Check,
  Filter,
  X,
  ChevronDown,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Percent,
  SlidersHorizontal,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  getOffersPageData,
  StorefrontOffersResponse,
  OffersQuery,
} from '@/lib/api';
import { ProductCard } from '@/components/shop/ProductCard';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

function calculateTimeLeft(expiryIso: string): TimeLeft {
  const difference = new Date(expiryIso).getTime() - Date.now();
  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
  }
  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
    isExpired: false,
  };
}

export function OffersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL state
  const initialTab = (searchParams.get('tab') as 'all' | 'best-discounts') || 'all';
  const initialCategory = searchParams.get('category') || '';
  const initialDiscount = searchParams.get('discount') || '';
  const initialSort = (searchParams.get('sort') as any) || 'featured';

  // Filters state
  const [activeTab, setActiveTab] = useState<'all' | 'best-discounts'>(initialTab);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedDiscount, setSelectedDiscount] = useState<string>(initialDiscount);
  const [selectedSize, setSelectedSize] = useState<string[]>([]);
  const [selectedColor, setSelectedColor] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>(initialSort);

  // Data fetching state
  const [data, setData] = useState<StorefrontOffersResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Live countdown state
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  // Fetch offers data
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const query: OffersQuery = {
        tab: activeTab,
        category: selectedCategory || undefined,
        discountBand: selectedDiscount || undefined,
        size: selectedSize.length ? selectedSize : undefined,
        color: selectedColor.length ? selectedColor : undefined,
        sort: sortBy as any,
      };
      const result = await getOffersPageData(query);
      setData(result);

      if (result.countdown?.expiryDate) {
        setTimeLeft(calculateTimeLeft(result.countdown.expiryDate));
      } else {
        setTimeLeft(null);
      }
    } catch (err) {
      console.error('Failed to load offers:', err);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, selectedCategory, selectedDiscount, selectedSize, selectedColor, sortBy]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Live countdown tick
  useEffect(() => {
    if (!data?.countdown?.expiryDate) return;

    const timer = setInterval(() => {
      const remaining = calculateTimeLeft(data.countdown!.expiryDate);
      setTimeLeft(remaining);
      if (remaining.isExpired) {
        clearInterval(timer);
        toast.info('An offer has just ended! Refreshing active deals...');
        fetchData();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [data?.countdown?.expiryDate, fetchData]);

  // Copy coupon handler
  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(code);
    toast.success('Coupon copied!', {
      description: `Use code ${code} at checkout to receive your discount.`,
    });
    setTimeout(() => setCopiedCoupon(null), 3000);
  };

  // Scroll to products
  const scrollToGrid = () => {
    const el = document.getElementById('offers-grid');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Reset filters
  const resetFilters = () => {
    setSelectedCategory('');
    setSelectedDiscount('');
    setSelectedSize([]);
    setSelectedColor([]);
    setSortBy('featured');
    setActiveTab('all');
  };

  const activeFilterCount =
    (selectedCategory ? 1 : 0) +
    (selectedDiscount ? 1 : 0) +
    selectedSize.length +
    selectedColor.length;

  return (
    <div className="min-h-screen bg-[#fbf9f2] text-[#1b1c18]">
      {/* ================= PHASE 1: HERO / BANNER ================= */}
      <section className="relative overflow-hidden bg-[#073a2d] text-[#fbf9f2] pt-20 pb-16 md:pt-28 md:pb-24 border-b border-[#c79a45]/30">
        <div className="absolute inset-0 pointer-events-none opacity-10 bg-[radial-gradient(#c79a45_1px,transparent_1px)] [background-size:20px_20px]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Tagline */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#c79a45]/20 border border-[#c79a45]/40 text-[#c79a45] text-[11px] sm:text-xs font-semibold uppercase tracking-widest mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Atelier Sanctuary Privileges</span>
          </div>

          {/* Hero Title */}
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-light tracking-tight text-[#fbf9f2] max-w-3xl mx-auto leading-tight">
            {data?.hero.title || 'Special Offers'}
          </h1>

          {/* Supporting text */}
          <p className="mt-4 text-sm sm:text-lg text-[#deddd3]/90 max-w-2xl mx-auto font-sans font-light leading-relaxed">
            {data?.hero.subtitle || 'Save more on selected Rongin Libas styles.'}
          </p>

          {/* Dynamic Promotional Highlight */}
          {data?.hero.bannerMessage && (
            <div className="mt-6 inline-block">
              <span className="font-serif text-xl sm:text-3xl font-semibold text-[#c79a45] tracking-wide px-5 py-2 border-y border-[#c79a45]/50 bg-black/20">
                {data.hero.bannerMessage}
              </span>
            </div>
          )}

          {/* Primary CTA */}
          <div className="mt-8 flex justify-center">
            <button
              onClick={scrollToGrid}
              className="inline-flex items-center gap-2 bg-[#c79a45] hover:bg-[#b5893a] text-[#073a2d] font-sans text-xs sm:text-sm font-bold uppercase tracking-widest px-8 py-3.5 shadow-lg transition-transform duration-200 active:scale-95 cursor-pointer"
            >
              <span>Shop Offers</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* ================= PHASE 7: COUNTDOWN TIMER ================= */}
          {data?.countdown && timeLeft && !timeLeft.isExpired && (
            <div className="mt-10 pt-8 border-t border-[#deddd3]/10 max-w-xl mx-auto">
              <div className="flex items-center justify-center gap-2 text-xs uppercase tracking-wider text-[#deddd3]/80 mb-3 font-mono">
                <Clock className="w-3.5 h-3.5 text-[#c79a45]" />
                <span>{data.countdown.offerName} Ends In:</span>
              </div>
              <div className="grid grid-cols-4 gap-2 sm:gap-4 max-w-sm mx-auto">
                <div className="bg-black/30 border border-[#c79a45]/30 p-2 sm:p-3 rounded-xs text-center">
                  <span className="block font-mono text-xl sm:text-3xl font-bold text-[#c79a45] tabular-nums">
                    {String(timeLeft.days).padStart(2, '0')}
                  </span>
                  <span className="block text-[9px] sm:text-[10px] uppercase tracking-wider text-[#deddd3]/70 font-sans mt-0.5">
                    Days
                  </span>
                </div>
                <div className="bg-black/30 border border-[#c79a45]/30 p-2 sm:p-3 rounded-xs text-center">
                  <span className="block font-mono text-xl sm:text-3xl font-bold text-[#c79a45] tabular-nums">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </span>
                  <span className="block text-[9px] sm:text-[10px] uppercase tracking-wider text-[#deddd3]/70 font-sans mt-0.5">
                    Hours
                  </span>
                </div>
                <div className="bg-black/30 border border-[#c79a45]/30 p-2 sm:p-3 rounded-xs text-center">
                  <span className="block font-mono text-xl sm:text-3xl font-bold text-[#c79a45] tabular-nums">
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </span>
                  <span className="block text-[9px] sm:text-[10px] uppercase tracking-wider text-[#deddd3]/70 font-sans mt-0.5">
                    Mins
                  </span>
                </div>
                <div className="bg-black/30 border border-[#c79a45]/30 p-2 sm:p-3 rounded-xs text-center">
                  <span className="block font-mono text-xl sm:text-3xl font-bold text-[#c79a45] tabular-nums">
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </span>
                  <span className="block text-[9px] sm:text-[10px] uppercase tracking-wider text-[#deddd3]/70 font-sans mt-0.5">
                    Secs
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ================= PHASE 6: FREE DELIVERY BANNER ================= */}
      {data?.freeDelivery?.enabled && (
        <section className="bg-[#f5f4ed] border-b border-[#deddd3] py-3.5 px-4">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-3 text-xs sm:text-sm font-sans text-[#073a2d]">
            <Truck className="w-4 h-4 text-[#c79a45] shrink-0" />
            <span className="font-semibold uppercase tracking-wider">
              FREE DELIVERY
            </span>
            <span className="text-[#404945]">
              On all orders over ৳{data.freeDelivery.threshold.toLocaleString()}
            </span>
          </div>
        </section>
      )}

      {/* ================= PHASE 5: COUPON SECTION ================= */}
      {data?.coupons && data.coupons.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center gap-3 mb-6">
            <Tag className="w-5 h-5 text-[#c79a45]" />
            <div>
              <span className="font-sans text-[10px] uppercase tracking-widest text-[#717975] block font-bold">
                EXTRA SAVINGS
              </span>
              <h2 className="font-serif text-xl sm:text-2xl font-semibold text-[#073a2d]">
                Active Atelier Vouchers
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.coupons.map((coupon) => (
              <div
                key={coupon.id}
                className="relative bg-white border border-[#deddd3] p-5 shadow-xs flex flex-col justify-between hover:border-[#c79a45] transition-colors"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-mono text-base font-bold text-[#073a2d] tracking-wider px-2.5 py-1 bg-[#f5f4ed] border border-[#deddd3]">
                      {coupon.code}
                    </span>
                    <span className="bg-[#073a2d] text-[#fbf9f2] text-xs font-bold px-2 py-0.5 tracking-wider">
                      {coupon.type === 'PERCENTAGE'
                        ? `${coupon.value}% OFF`
                        : `৳${coupon.value.toLocaleString()} OFF`}
                    </span>
                  </div>

                  <p className="mt-3 text-xs text-[#404945] font-sans">
                    {coupon.description ||
                      `Save ${
                        coupon.type === 'PERCENTAGE'
                          ? `${coupon.value}%`
                          : `৳${coupon.value.toLocaleString()}`
                      } on your order.`}
                  </p>

                  <div className="mt-2 text-[11px] text-[#717975] font-sans">
                    {coupon.minimumOrderAmount > 0 ? (
                      <span>Minimum spend ৳{coupon.minimumOrderAmount.toLocaleString()}</span>
                    ) : (
                      <span>No minimum order amount</span>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#f5f4ed] flex items-center justify-between">
                  <span className="text-[10px] text-[#717975] font-mono">
                    Expires {new Date(coupon.expiryDate).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => handleCopyCoupon(coupon.code)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#073a2d] hover:text-[#c79a45] transition-colors cursor-pointer"
                  >
                    {copiedCoupon === coupon.code ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ================= MAIN OFFERS PRODUCT AREA ================= */}
      <section id="offers-grid" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* ================= PHASE 4: TABS & CONTROLS ================= */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#deddd3] pb-5 mb-8">
          {/* Tabs */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 font-sans text-xs uppercase tracking-wider font-bold transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-[#073a2d] text-[#fbf9f2]'
                  : 'bg-white text-[#404945] border border-[#deddd3] hover:border-[#073a2d]'
              }`}
            >
              All Offers
            </button>
            <button
              onClick={() => setActiveTab('best-discounts')}
              className={`px-4 py-2 font-sans text-xs uppercase tracking-wider font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'best-discounts'
                  ? 'bg-[#073a2d] text-[#fbf9f2]'
                  : 'bg-white text-[#404945] border border-[#deddd3] hover:border-[#073a2d]'
              }`}
            >
              <Percent className="w-3.5 h-3.5 text-[#c79a45]" />
              <span>Best Discounts</span>
            </button>
          </div>

          {/* Controls: Mobile filter trigger, Sort & Count */}
          <div className="flex items-center justify-between md:justify-end gap-3">
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-[#deddd3] text-xs font-bold text-[#073a2d] uppercase tracking-wider"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 bg-[#073a2d] text-[#fbf9f2] rounded-full text-[10px] flex items-center justify-center font-mono">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Sort Selector */}
            <div className="flex items-center gap-2">
              <label htmlFor="offer-sort" className="text-xs text-[#717975] uppercase tracking-wider font-sans hidden sm:inline">
                Sort:
              </label>
              <select
                id="offer-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white border border-[#deddd3] text-xs font-semibold text-[#1b1c18] px-3 py-2 outline-hidden focus:border-[#073a2d] cursor-pointer"
              >
                <option value="featured">Atelier Featured</option>
                <option value="discount-high">Highest Discount</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="newest">New Arrivals</option>
              </select>
            </div>
          </div>
        </div>

        {/* ================= LAYOUT: SIDEBAR FILTERS + PRODUCT GRID ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block lg:col-span-1 bg-white border border-[#deddd3] p-5 sticky top-24 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#f5f4ed]">
              <h3 className="font-serif text-base font-semibold text-[#073a2d] flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#c79a45]" />
                <span>Offer Filters</span>
              </h3>
              {activeFilterCount > 0 && (
                <button
                  onClick={resetFilters}
                  className="text-[11px] text-[#ba1a1a] hover:underline font-sans cursor-pointer flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            {/* Category Filter */}
            {data?.facets?.categories && data.facets.categories.length > 0 && (
              <div>
                <span className="text-[11px] uppercase tracking-wider font-bold text-[#404945] block mb-2 font-sans">
                  Category
                </span>
                <div className="space-y-1.5">
                  <button
                    onClick={() => setSelectedCategory('')}
                    className={`w-full text-left text-xs px-2.5 py-1.5 flex items-center justify-between transition-colors ${
                      !selectedCategory
                        ? 'bg-[#073a2d] text-[#fbf9f2] font-semibold'
                        : 'text-[#404945] hover:bg-[#f5f4ed]'
                    }`}
                  >
                    <span>All Categories</span>
                  </button>
                  {data.facets.categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() =>
                        setSelectedCategory(
                          selectedCategory === cat.slug ? '' : cat.slug,
                        )
                      }
                      className={`w-full text-left text-xs px-2.5 py-1.5 flex items-center justify-between transition-colors ${
                        selectedCategory === cat.slug
                          ? 'bg-[#073a2d] text-[#fbf9f2] font-semibold'
                          : 'text-[#404945] hover:bg-[#f5f4ed]'
                      }`}
                    >
                      <span className="truncate">{cat.name}</span>
                      <span className="text-[10px] opacity-75 font-mono">
                        ({cat.count})
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Discount Bands Filter */}
            {data?.facets?.discountBands && (
              <div className="pt-4 border-t border-[#f5f4ed]">
                <span className="text-[11px] uppercase tracking-wider font-bold text-[#404945] block mb-2 font-sans">
                  Discount Band
                </span>
                <div className="space-y-1.5">
                  <button
                    onClick={() => setSelectedDiscount('')}
                    className={`w-full text-left text-xs px-2.5 py-1.5 flex items-center justify-between transition-colors ${
                      !selectedDiscount
                        ? 'bg-[#073a2d] text-[#fbf9f2] font-semibold'
                        : 'text-[#404945] hover:bg-[#f5f4ed]'
                    }`}
                  >
                    <span>All Discounts</span>
                  </button>
                  {data.facets.discountBands.map((band) => (
                    <button
                      key={band.min}
                      onClick={() =>
                        setSelectedDiscount(
                          selectedDiscount === String(band.min) ? '' : String(band.min),
                        )
                      }
                      className={`w-full text-left text-xs px-2.5 py-1.5 flex items-center justify-between transition-colors ${
                        selectedDiscount === String(band.min)
                          ? 'bg-[#073a2d] text-[#fbf9f2] font-semibold'
                          : 'text-[#404945] hover:bg-[#f5f4ed]'
                      }`}
                    >
                      <span>{band.label}</span>
                      <span className="text-[10px] opacity-75 font-mono">
                        ({band.count})
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Filter */}
            {data?.facets?.sizes && data.facets.sizes.length > 0 && (
              <div className="pt-4 border-t border-[#f5f4ed]">
                <span className="text-[11px] uppercase tracking-wider font-bold text-[#404945] block mb-2 font-sans">
                  Available Sizes
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {data.facets.sizes.map((s) => {
                    const isSelected = selectedSize.includes(s);
                    return (
                      <button
                        key={s}
                        onClick={() =>
                          setSelectedSize((prev) =>
                            isSelected ? prev.filter((item) => item !== s) : [...prev, s],
                          )
                        }
                        className={`px-2.5 py-1 text-xs border transition-colors ${
                          isSelected
                            ? 'bg-[#073a2d] text-[#fbf9f2] border-[#073a2d]'
                            : 'bg-white text-[#404945] border-[#deddd3] hover:border-[#073a2d]'
                        }`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </aside>

          {/* Product Grid Area */}
          <main className="lg:col-span-3">
            {/* Header info bar */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-serif text-2xl font-semibold text-[#073a2d]">
                  Today&apos;s Offers
                </h2>
                <span className="text-xs text-[#717975] font-sans">
                  {data?.pagination.total ?? 0}{' '}
                  {data?.pagination.total === 1 ? 'privilege item' : 'privilege items'}{' '}
                  available
                </span>
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="py-24 flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-2 border-[#073a2d] border-t-transparent rounded-full animate-spin" />
                <span className="font-serif text-sm text-[#717975]">Refreshing atelier offers...</span>
              </div>
            )}

            {/* Error State */}
            {!isLoading && isError && (
              <div className="bg-white border border-[#ba1a1a]/30 p-8 text-center max-w-md mx-auto my-12">
                <p className="font-serif text-lg text-[#ba1a1a]">
                  Unable to load special offers
                </p>
                <p className="mt-2 text-xs text-[#717975]">
                  Please verify your internet connection and try again.
                </p>
                <button
                  onClick={fetchData}
                  className="mt-4 px-6 py-2 bg-[#073a2d] text-[#fbf9f2] text-xs uppercase tracking-wider font-bold hover:bg-[#0d4d3b]"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !isError && (!data?.products || data.products.length === 0) && (
              <div className="bg-white border border-[#deddd3] p-12 text-center max-w-lg mx-auto my-12 shadow-xs">
                <Tag className="w-10 h-10 text-[#c79a45] mx-auto mb-4" />
                <h3 className="font-serif text-2xl font-light text-[#073a2d]">
                  No active offers right now.
                </h3>
                <p className="mt-2 text-xs text-[#717975] font-sans max-w-sm mx-auto">
                  All current promotional allocations have concluded. Explore our complete
                  bespoke menswear catalog.
                </p>
                <div className="mt-6 flex justify-center gap-3">
                  <Link
                    href="/men"
                    className="inline-flex items-center gap-2 bg-[#073a2d] hover:bg-[#0d4d3b] text-[#fbf9f2] px-6 py-2.5 text-xs font-bold uppercase tracking-widest"
                  >
                    <span>Explore Men&apos;s Collection</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}

            {/* Products Grid */}
            {!isLoading && !isError && data?.products && data.products.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
                {data.products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </main>
        </div>
      </section>

      {/* ================= MOBILE FILTER DRAWER ================= */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setIsMobileFilterOpen(false)}
          />
          <div className="relative ml-auto w-full max-w-xs bg-white h-full shadow-2xl flex flex-col z-10">
            <div className="p-4 border-b border-[#deddd3] flex items-center justify-between">
              <h3 className="font-serif text-base font-semibold text-[#073a2d]">
                Filter Deals
              </h3>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-1 text-[#717975] hover:text-[#1b1c18]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 space-y-6">
              {/* Category */}
              {data?.facets?.categories && data.facets.categories.length > 0 && (
                <div>
                  <span className="text-xs uppercase tracking-wider font-bold text-[#404945] block mb-2 font-sans">
                    Category
                  </span>
                  <div className="space-y-1">
                    <button
                      onClick={() => setSelectedCategory('')}
                      className={`w-full text-left text-xs px-2 py-1.5 ${
                        !selectedCategory
                          ? 'bg-[#073a2d] text-white font-bold'
                          : 'text-[#404945]'
                      }`}
                    >
                      All Categories
                    </button>
                    {data.facets.categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() =>
                          setSelectedCategory(
                            selectedCategory === cat.slug ? '' : cat.slug,
                          )
                        }
                        className={`w-full text-left text-xs px-2 py-1.5 flex justify-between ${
                          selectedCategory === cat.slug
                            ? 'bg-[#073a2d] text-white font-bold'
                            : 'text-[#404945]'
                        }`}
                      >
                        <span>{cat.name}</span>
                        <span className="text-[10px] font-mono">({cat.count})</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Discount Bands */}
              {data?.facets?.discountBands && (
                <div className="pt-4 border-t border-[#f5f4ed]">
                  <span className="text-xs uppercase tracking-wider font-bold text-[#404945] block mb-2 font-sans">
                    Discount Band
                  </span>
                  <div className="space-y-1">
                    {data.facets.discountBands.map((band) => (
                      <button
                        key={band.min}
                        onClick={() =>
                          setSelectedDiscount(
                            selectedDiscount === String(band.min) ? '' : String(band.min),
                          )
                        }
                        className={`w-full text-left text-xs px-2 py-1.5 flex justify-between ${
                          selectedDiscount === String(band.min)
                            ? 'bg-[#073a2d] text-white font-bold'
                            : 'text-[#404945]'
                        }`}
                      >
                        <span>{band.label}</span>
                        <span className="text-[10px] font-mono">({band.count})</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-[#deddd3] flex gap-2">
              <button
                onClick={resetFilters}
                className="w-1/2 py-2.5 border border-[#deddd3] text-xs font-bold uppercase tracking-wider text-[#404945]"
              >
                Reset
              </button>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-1/2 py-2.5 bg-[#073a2d] text-white text-xs font-bold uppercase tracking-wider"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
