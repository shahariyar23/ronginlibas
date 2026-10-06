'use client';

import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { PRODUCTS } from '@/data/products';
import { ProductCard } from '@/components/shop/ProductCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  SlidersHorizontal,
  X,
  PhoneCall,
  Sparkles,
  ArrowUpDown,
  LayoutGrid,
  Grid3X3,
} from 'lucide-react';
import Link from 'next/link';

export const ShopContent: React.FC = () => {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';
  const initialFilter = searchParams.get('filter') || '';
  const initialQuery = searchParams.get('q') || '';
  const initialWishlist = searchParams.get('wishlist') === 'true';

  // Filters state
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([1000, 8000]);
  const [selectedFabrics, setSelectedFabrics] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'newest'>('featured');
  const [gridCols, setGridCols] = useState<3 | 4>(3);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Available Filter Options
  const categories = [
    { id: 'all', label: 'All Men' },
    { id: 'panjabi', label: 'Imperial Panjabi' },
    { id: 'shirts', label: 'Fine Shirts' },
    { id: 'polos', label: 'Mercerized Polos' },
    { id: 't-shirts', label: 'Heavyweight Tees' },
    { id: 'trousers', label: 'Gurkha Trousers' },
  ];

  const sizeOptions = ['S', 'M', 'L', 'XL', 'XXL', 'Bespoke'];

  const colorOptions = [
    { name: 'Emerald', hex: '#073A2D' },
    { name: 'Onyx', hex: '#1B1C18' },
    { name: 'Ivory', hex: '#FBF9F2' },
    { name: 'Navy', hex: '#112244' },
    { name: 'Terracotta', hex: '#9C4A2F' },
  ];

  const fabricOptions = [
    'Rajshahi Silk',
    'Egyptian Cotton',
    'French Flax Linen',
    'Organic Muslin Voile',
    'Tropical Wool',
  ];

  // Filtering Logic
  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((p) => {
      // Search query
      if (initialQuery) {
        const q = initialQuery.toLowerCase();
        const matchTitle = p.name.toLowerCase().includes(q);
        const matchCat = p.categoryLabel.toLowerCase().includes(q);
        const matchFab = p.fabric.toLowerCase().includes(q);
        if (!matchTitle && !matchCat && !matchFab) return false;
      }

      // Special presets from URL
      if (initialFilter === 'new' && !p.isNewArrival) return false;
      if (initialFilter === 'bestseller' && !p.isBestSeller) return false;
      if (
        (initialFilter === 'offers' || initialFilter === 'sale') &&
        (!p.originalPrice || p.originalPrice <= p.price)
      ) {
        return false;
      }

      // Category
      if (selectedCategory !== 'all' && p.category !== selectedCategory) {
        return false;
      }

      // Sizes
      if (selectedSizes.length > 0) {
        const hasSize = selectedSizes.some((s) => p.sizes.includes(s as any));
        if (!hasSize) return false;
      }

      // Colors
      if (selectedColors.length > 0) {
        const hasColor = p.colors.some((c) =>
          selectedColors.some((sc) => c.name.toLowerCase().includes(sc.toLowerCase()))
        );
        if (!hasColor) return false;
      }

      // Price Range
      if (p.price < priceRange[0] || p.price > priceRange[1]) {
        return false;
      }

      // Fabric Origin
      if (selectedFabrics.length > 0) {
        const hasFabric = selectedFabrics.some(
          (fab) =>
            p.fabric.toLowerCase().includes(fab.toLowerCase()) ||
            (p.fabricOrigin && p.fabricOrigin.toLowerCase().includes(fab.toLowerCase()))
        );
        if (!hasFabric) return false;
      }

      // In-stock only
      if (inStockOnly && !p.inStock) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'newest') return (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0);
      return 0;
    });
  }, [
    selectedCategory,
    selectedSizes,
    selectedColors,
    priceRange,
    selectedFabrics,
    inStockOnly,
    sortBy,
    initialQuery,
    initialFilter,
  ]);

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const toggleColor = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  const toggleFabric = (fab: string) => {
    setSelectedFabrics((prev) =>
      prev.includes(fab) ? prev.filter((f) => f !== fab) : [...prev, fab]
    );
  };

  const clearAllFilters = () => {
    setSelectedCategory('all');
    setSelectedSizes([]);
    setSelectedColors([]);
    setPriceRange([1000, 8000]);
    setSelectedFabrics([]);
    setInStockOnly(false);
  };

  const activeFiltersCount =
    (selectedCategory !== 'all' ? 1 : 0) +
    selectedSizes.length +
    selectedColors.length +
    (priceRange[0] > 1000 || priceRange[1] < 8000 ? 1 : 0) +
    selectedFabrics.length +
    (inStockOnly ? 1 : 0);

  const FilterPanelContent = () => (
    <div className="space-y-8 text-xs font-sans">
      {/* Category List */}
      <div>
        <h4 className="font-serif text-sm font-semibold uppercase tracking-wider text-[#073a2d] mb-3">
          Category
        </h4>
        <div className="space-y-1.5">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`w-full text-left py-1.5 px-2.5 transition-colors flex items-center justify-between ${
                selectedCategory === cat.id
                  ? 'bg-[#073a2d] text-white font-semibold'
                  : 'text-[#404945] hover:bg-[#f0eee7]'
              }`}
            >
              <span>{cat.label}</span>
              {selectedCategory === cat.id && <span className="text-[10px]">●</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Size Swatches */}
      <div>
        <h4 className="font-serif text-sm font-semibold uppercase tracking-wider text-[#073a2d] mb-3">
          Size
        </h4>
        <div className="grid grid-cols-3 gap-2">
          {sizeOptions.map((s) => {
            const active = selectedSizes.includes(s);
            return (
              <button
                key={s}
                onClick={() => toggleSize(s)}
                className={`py-2 text-center border font-semibold text-xs transition-all ${
                  active
                    ? 'bg-[#073a2d] text-white border-[#073a2d]'
                    : 'bg-white border-[#deddd3] text-[#1b1c18] hover:border-[#073a2d]'
                }`}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      {/* Color Palette */}
      <div>
        <h4 className="font-serif text-sm font-semibold uppercase tracking-wider text-[#073a2d] mb-3">
          Color Story
        </h4>
        <div className="flex flex-wrap gap-2">
          {colorOptions.map((c) => {
            const active = selectedColors.includes(c.name);
            return (
              <button
                key={c.name}
                onClick={() => toggleColor(c.name)}
                className={`flex items-center gap-2 px-2.5 py-1.5 border text-xs transition-all ${
                  active
                    ? 'border-[#073a2d] bg-[#073a2d] text-white'
                    : 'border-[#deddd3] bg-white text-[#1b1c18] hover:border-[#073a2d]'
                }`}
              >
                <span
                  className="w-3 h-3 rounded-full border border-black/20"
                  style={{ backgroundColor: c.hex }}
                />
                <span>{c.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Slider */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-serif text-sm font-semibold uppercase tracking-wider text-[#073a2d]">
            Price (BDT)
          </h4>
          <span className="text-[11px] font-semibold text-[#073a2d] tabular-nums">
            ৳{priceRange[0].toLocaleString()} - ৳{priceRange[1].toLocaleString()}
          </span>
        </div>
        <Slider
          defaultValue={[priceRange[0], priceRange[1]]}
          min={1000}
          max={8000}
          step={200}
          value={[priceRange[0], priceRange[1]]}
          onValueChange={(val: any) => {
            if (Array.isArray(val) && val.length >= 2) {
              setPriceRange([val[0], val[1]]);
            }
          }}
          className="my-4"
        />
        <div className="flex justify-between text-[11px] text-[#717975]">
          <span>৳1,000</span>
          <span>৳8,000</span>
        </div>
      </div>

      {/* Fabric Origins */}
      <div>
        <h4 className="font-serif text-sm font-semibold uppercase tracking-wider text-[#073a2d] mb-3">
          Fabric Origin
        </h4>
        <div className="space-y-2">
          {fabricOptions.map((fab) => {
            const active = selectedFabrics.includes(fab);
            return (
              <label
                key={fab}
                className="flex items-center gap-2.5 text-xs text-[#404945] cursor-pointer hover:text-[#073a2d]"
              >
                <Checkbox
                  checked={active}
                  onCheckedChange={() => toggleFabric(fab)}
                  className="rounded-none border-[#deddd3] data-[state=checked]:bg-[#073a2d]"
                />
                <span>{fab}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* In-Stock Toggle */}
      <div className="pt-2 border-t border-[#deddd3]">
        <label className="flex items-center gap-2.5 text-xs text-[#404945] cursor-pointer hover:text-[#073a2d]">
          <Checkbox
            checked={inStockOnly}
            onCheckedChange={(checked) => setInStockOnly(!!checked)}
            className="rounded-none border-[#deddd3] data-[state=checked]:bg-[#073a2d]"
          />
          <span className="font-semibold text-[#073a2d]">In-Stock (Ready for 48h Dispatch)</span>
        </label>
      </div>

      {activeFiltersCount > 0 && (
        <Button
          onClick={clearAllFilters}
          variant="outline"
          className="w-full text-xs uppercase tracking-wider border-[#ba1a1a] text-[#ba1a1a] hover:bg-[#ba1a1a] hover:text-white"
        >
          Reset All Filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="w-full pb-24 bg-[#fbf9f2]">
      {/* Editorial Top Orientation */}
      <div className="w-full bg-[#f0eee7] border-b border-[#deddd3] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-[11px] font-sans uppercase tracking-widest text-[#717975] mb-3">
            <Link href="/" className="hover:text-[#073a2d]">
              Home
            </Link>
            <span>/</span>
            <Link href="/shop" className="hover:text-[#073a2d]">
              Men
            </Link>
            <span>/</span>
            <span className="text-[#073a2d] font-semibold">
              {initialFilter === 'new'
                ? 'New Arrivals'
                : initialFilter === 'bestseller'
                ? 'Best Sellers'
                : initialFilter === 'offers' || initialFilter === 'sale'
                ? 'Offers & Archive'
                : selectedCategory !== 'all'
                ? categories.find((c) => c.id === selectedCategory)?.label
                : 'All Sartorial Weaves'}
            </span>
          </nav>

          <h1 className="font-serif text-3xl sm:text-5xl font-normal text-[#073a2d] mb-3">
            {initialFilter === 'new'
              ? 'NEW ARRIVALS'
              : initialFilter === 'bestseller'
              ? 'BEST SELLERS'
              : initialFilter === 'offers' || initialFilter === 'sale'
              ? 'EXCLUSIVE OFFERS'
              : selectedCategory !== 'all'
              ? categories.find((c) => c.id === selectedCategory)?.label.toUpperCase()
              : 'MEN’S COLLECTION'}
          </h1>
          <p className="font-sans text-xs sm:text-sm text-[#69726d] max-w-2xl font-light">
            Handcrafted Bengal panjabis, Egyptian long-staple cotton shirts, and modern architectural bottom wear designed for tropical ease and aristocratic presence.
          </p>
        </div>
      </div>

      {/* Main Interactive Controls Bar */}
      <div className="sticky top-20 z-30 bg-[#fbf9f2]/95 backdrop-blur-md border-b border-[#deddd3] py-3.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          {/* Mobile Filter Sheet Trigger */}
          <div className="flex items-center gap-3">
            <Sheet open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
              <SheetTrigger
                render={
                  <Button
                    variant="outline"
                    className="lg:hidden h-9 px-3.5 text-xs font-sans uppercase tracking-wider border-[#073a2d] text-[#073a2d] flex items-center gap-2"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}</span>
                  </Button>
                }
              />
              <SheetContent side="left" className="w-4/5 max-w-sm bg-[#fbf9f2] p-6 overflow-y-auto">
                <SheetHeader className="pb-4 border-b border-[#deddd3]">
                  <SheetTitle className="font-serif text-xl text-[#073a2d]">
                    Filter Collection
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <FilterPanelContent />
                </div>
              </SheetContent>
            </Sheet>

            <span className="text-xs font-sans text-[#69726d]">
              Showing <strong className="text-[#073a2d]">{filteredProducts.length}</strong> Sartorial Pieces
            </span>
          </div>

          {/* Active Filter Pills */}
          {activeFiltersCount > 0 && (
            <div className="hidden sm:flex items-center gap-2 flex-wrap">
              {selectedCategory !== 'all' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-[#deddd3] text-[11px] text-[#073a2d]">
                  {categories.find((c) => c.id === selectedCategory)?.label}
                  <button onClick={() => setSelectedCategory('all')}>
                    <X className="w-3 h-3 text-[#717975] hover:text-black" />
                  </button>
                </span>
              )}
              {selectedSizes.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-[#deddd3] text-[11px] text-[#073a2d]"
                >
                  Size: {s}
                  <button onClick={() => toggleSize(s)}>
                    <X className="w-3 h-3 text-[#717975] hover:text-black" />
                  </button>
                </span>
              ))}
              <button
                onClick={clearAllFilters}
                className="text-[11px] text-[#ba1a1a] hover:underline font-semibold ml-1"
              >
                Clear All
              </button>
            </div>
          )}

          {/* Right Layout & Sorting */}
          <div className="flex items-center gap-4">
            {/* Sorting Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-sans text-[#717975] hidden sm:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-white border border-[#deddd3] text-xs font-sans px-3 py-1.5 text-[#1b1c18] focus:outline-none focus:border-[#073a2d]"
              >
                <option value="featured">Featured Atelier Pieces</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="newest">Newest Loom Drops</option>
              </select>
            </div>

            {/* Layout Toggle */}
            <div className="hidden md:flex items-center border border-[#deddd3] bg-white">
              <button
                onClick={() => setGridCols(3)}
                className={`p-1.5 ${gridCols === 3 ? 'bg-[#073a2d] text-white' : 'text-[#717975] hover:text-black'}`}
                title="3 Columns"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setGridCols(4)}
                className={`p-1.5 ${gridCols === 4 ? 'bg-[#073a2d] text-white' : 'text-[#717975] hover:text-black'}`}
                title="4 Columns"
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Canvas: Left Sidebar + Right Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Desktop Left Sidebar Filters (3 Cols) */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="sticky top-38 p-6 bg-white border border-[#deddd3] shadow-xs">
              <FilterPanelContent />
            </div>
          </div>

          {/* Right Product Grid (9 Cols) */}
          <div className="lg:col-span-9">
            {filteredProducts.length === 0 ? (
              <div className="p-16 bg-white border border-[#deddd3] text-center space-y-4">
                <h3 className="font-serif text-2xl text-[#073a2d]">
                  No Sartorial Pieces Matched Your Criteria
                </h3>
                <p className="font-sans text-xs text-[#69726d] max-w-sm mx-auto">
                  Try adjusting your size, color, or price range filters, or explore our full collection.
                </p>
                <Button
                  onClick={clearAllFilters}
                  className="bg-[#073a2d] hover:bg-[#0d4d3b] text-white font-sans text-xs uppercase tracking-widest px-6"
                >
                  View All Products
                </Button>
              </div>
            ) : (
              <div
                className={`grid grid-cols-1 sm:grid-cols-2 ${
                  gridCols === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'
                } gap-6`}
              >
                {filteredProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}

            {/* Mid-Catalogue Bespoke Tailoring Banner */}
            <div className="mt-16 p-8 bg-[#073a2d] text-[#fbf9f2] border border-[#c79a45]/30 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
              <div className="space-y-1.5 text-center md:text-left">
                <span className="font-sans text-[11px] uppercase tracking-[0.25em] text-[#c79a45] font-semibold block">
                  Bespoke Fit Service
                </span>
                <h3 className="font-serif text-2xl text-white">
                  Need Made-To-Measure Dimensions?
                </h3>
                <p className="font-sans text-xs text-[#c0c8c3] max-w-lg">
                  Whether for a wedding ceremony or tailored corporate gifting, our master cutting team accepts custom chest, collar, and length specifications.
                </p>
              </div>

              <a
                href="https://wa.me/8801916664011?text=Hello%20Rongin%20Libas%20Atelier,%20I%20would%20like%20to%20consult%20on%20a%20bespoke%20fit."
                target="_blank"
                rel="noreferrer"
                className="px-6 py-3.5 bg-[#c79a45] hover:bg-[#b08535] text-[#073a2d] font-sans font-bold text-xs uppercase tracking-widest whitespace-nowrap shadow-sm flex items-center gap-2"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Chat with Master Cutter</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
