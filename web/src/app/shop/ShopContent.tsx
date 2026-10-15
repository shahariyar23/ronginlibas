'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Product } from '@/types';
import {
  colorHex,
  getProductFilters,
  getShopProducts,
  parseProductListQuery,
  PaginationMeta,
  ProductFilters,
  ProductListQuery,
} from '@/lib/api';
import { getWhatsAppUrl, useStorefront } from '@/context/StorefrontContext';
import { ProductCard } from '@/components/shop/ProductCard';
import { LogoLoader } from '@/components/common/LogoLoader';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
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
  LayoutGrid,
  Grid3X3,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';

export interface CollectionConfig {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  switcher?: { slug: string; title: string; isCurrent: boolean }[];
}

export interface CategoryConfig {
  slug: string;
  name: string;
  description?: string;
  siblingCategories?: { id: string; slug: string; name: string }[];
}

export interface ForceFilter {
  newArrival?: boolean;
  bestSeller?: boolean;
  featured?: boolean;
  category?: string;
  collection?: string;
}

export interface ShopContentProps {
  basePath?: string;
  collectionConfig?: CollectionConfig;
  categoryConfig?: CategoryConfig;
  forceFilter?: ForceFilter;
  initialProducts?: Product[];
  initialPageMeta?: PaginationMeta;
}

export const ShopContent: React.FC<ShopContentProps> = ({
  basePath = '/shop',
  collectionConfig,
  categoryConfig,
  forceFilter,
  initialProducts,
  initialPageMeta,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { settings } = useStorefront();
  const [products, setProducts] = useState<Product[]>(initialProducts || []);
  const [filters, setFilters] = useState<ProductFilters | null>(null);
  const [pageMeta, setPageMeta] = useState<PaginationMeta>(
    initialPageMeta || {
      page: 1,
      limit: 12,
      total: initialProducts ? initialProducts.length : 0,
      totalPages: initialProducts ? Math.max(1, Math.ceil(initialProducts.length / 12)) : 1,
      hasNext: false,
      hasPrevious: false,
    },
  );
  const [isLoading, setIsLoading] = useState(!initialProducts);
  const [loadError, setLoadError] = useState('');
  const [retryKey, setRetryKey] = useState(0);
  const [searchEdit, setSearchEdit] = useState<{ query: string; value: string } | null>(null);
  const [priceEdit, setPriceEdit] = useState<{
    key: string;
    value: [number, number];
  } | null>(null);

  const queryString = searchParams.toString();
  const urlParams = useMemo(() => new URLSearchParams(queryString), [queryString]);
  const selectedCategory = urlParams.get('category') || 'all';
  const selectedSizes = useMemo(() => urlParams.getAll('size'), [urlParams]);
  const selectedColors = useMemo(() => urlParams.getAll('color'), [urlParams]);
  const selectedFabrics = useMemo(() => urlParams.getAll('fabric'), [urlParams]);
  const selectedFabricOrigins = useMemo(() => urlParams.getAll('fabricOrigin'), [urlParams]);
  const selectedFits = useMemo(() => urlParams.getAll('fit'), [urlParams]);
  const inStockOnly = urlParams.get('inStock') === 'true';
  const initialFilterFromUrl = urlParams.get('filter') || '';
  const initialQueryFromUrl = urlParams.get('q') || '';
  const genderParam = urlParams.get('gender');
  const selectedGender =
    genderParam === 'MEN' || genderParam === 'WOMEN' || genderParam === 'UNISEX'
      ? genderParam
      : undefined;
  const newArrivalSelected = urlParams.get('newArrival') === 'true' || initialFilterFromUrl === 'new';
  const bestSellerSelected =
    urlParams.get('bestSeller') === 'true' || initialFilterFromUrl === 'bestseller';
  const offersSelected =
    urlParams.get('offers') === 'true' ||
    initialFilterFromUrl === 'offers' ||
    initialFilterFromUrl === 'sale';
  const page = Math.max(1, Number(urlParams.get('page')) || 1);
  const minAvailablePrice = filters?.price.min ?? 0;
  const maxAvailablePrice = filters?.price.max ?? 0;
  const priceRange: [number, number] = [
    Number(urlParams.get('minPrice') ?? minAvailablePrice),
    Number(urlParams.get('maxPrice') ?? maxAvailablePrice),
  ];
  const priceDraftKey = `${queryString}|${minAvailablePrice}|${maxAvailablePrice}`;
  const priceDraft =
    priceEdit?.key === priceDraftKey
      ? priceEdit.value
      : priceRange;
  const searchDraft =
    searchEdit?.query === initialQueryFromUrl ? searchEdit.value : initialQueryFromUrl;
  const rawSort =
    urlParams.get('sort') ||
    (forceFilter?.bestSeller || bestSellerSelected ? 'best-selling' : 'featured');
  const sortBy =
    rawSort === 'price-asc'
      ? 'price-low'
      : rawSort === 'price-desc'
        ? 'price-high'
        : rawSort;
  const [gridCols, setGridCols] = useState<3 | 4>(3);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const whatsappUrl = getWhatsAppUrl(
    settings?.whatsapp || '',
    'Hello Rongin Libas Atelier, I would like to consult on a bespoke fit.',
  );

  const updateQuery = (updates: Record<string, string | string[] | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      params.delete(key);
      if (Array.isArray(value)) value.forEach((item) => params.append(key, item));
      else if (value) params.set(key, value);
    }
    if (!('page' in updates)) params.delete('page');
    const nextQuery = params.toString();
    router.push(`${basePath}${nextQuery ? `?${nextQuery}` : ''}`, { scroll: false });
  };

  const productQuery = useMemo<ProductListQuery>(
    () => parseProductListQuery(urlParams, forceFilter),
    [urlParams, forceFilter],
  );
  const requestKey = JSON.stringify(productQuery);
  const isFirstMount = useRef(Boolean(initialProducts));
  const [completedRequestKey, setCompletedRequestKey] = useState(
    initialProducts ? requestKey : '',
  );

  const filterQuery = useMemo<ProductListQuery>(
    () => ({
      category: forceFilter?.category || (selectedCategory !== 'all' ? selectedCategory : undefined),
      collection: forceFilter?.collection || undefined,
      size: selectedSizes.length ? selectedSizes : undefined,
      color: selectedColors.length ? selectedColors : undefined,
      fabric: selectedFabrics.length ? selectedFabrics : undefined,
      fabricOrigin: selectedFabricOrigins.length ? selectedFabricOrigins : undefined,
      fit: selectedFits.length ? selectedFits : undefined,
      newArrival: forceFilter?.newArrival || newArrivalSelected || undefined,
      bestSeller: forceFilter?.bestSeller || bestSellerSelected || undefined,
      featured: forceFilter?.featured || undefined,
    }),
    [
      selectedCategory, selectedSizes, selectedColors,
      selectedFabrics, selectedFabricOrigins, selectedFits,
      forceFilter, newArrivalSelected, bestSellerSelected,
    ],
  );

  const retryProducts = () => {
    setLoadError('');
    setIsLoading(true);
    setCompletedRequestKey('');
    setRetryKey((value) => value + 1);
  };

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    let active = true;
    getShopProducts(productQuery)
      .then((result) => {
        if (!active) return;
        setProducts(result.items);
        setPageMeta(result.meta);
        setLoadError('');
      })
      .catch(() => {
        if (!active) return;
        const message = 'We could not load the collection. Please try again.';
        setProducts([]);
        setPageMeta((current) => ({ ...current, total: 0 }));
        setLoadError(message);
        toast.error(message);
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
          setCompletedRequestKey(requestKey);
        }
      });
    return () => { active = false; };
  }, [productQuery, requestKey, retryKey]);

  useEffect(() => {
    let active = true;
    getProductFilters(filterQuery)
      .then((data) => {
        if (active) setFilters(data);
      })
      .catch(() => {
        if (active) toast.error('Filter options could not be loaded.');
      });
    return () => { active = false; };
  }, [filterQuery]);

  const isRefreshing = !isLoading && completedRequestKey !== '' && completedRequestKey !== requestKey;

  const toggleQueryValue = (key: string, value: string) => {
    const current = searchParams.getAll(key);
    updateQuery({ [key]: current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value] });
  };

  const clearAllFilters = () => router.push(basePath, { scroll: false });

  const activeFiltersCount =
    (selectedCategory !== 'all' ? 1 : 0) +
    (selectedGender ? 1 : 0) +
    selectedSizes.length +
    selectedColors.length +
    selectedFabrics.length +
    selectedFabricOrigins.length +
    selectedFits.length +
    (urlParams.has('minPrice') || urlParams.has('maxPrice') ? 1 : 0) +
    (inStockOnly ? 1 : 0) +
    (initialQueryFromUrl ? 1 : 0) +
    (newArrivalSelected || bestSellerSelected || offersSelected ? 1 : 0);

  const categories = [
    { id: 'all', name: selectedGender === 'WOMEN' ? 'All Women' : 'All Men', slug: 'all', count: pageMeta.total },
    ...(filters?.categories ?? []),
  ];
  const sizeOptions = filters?.sizes ?? [];
  const sizeGroups = [
    { type: 'APPAREL', label: 'Apparel' },
    { type: 'WAIST', label: 'Trouser Waist' },
    { type: 'CUSTOM', label: 'Custom' },
  ]
    .map((group) => ({
      ...group,
      options: sizeOptions.filter((option) => option.type === group.type),
    }))
    .filter((group) => group.options.length);
  const colorOptions = filters?.colors ?? [];
  const fabricOptions = filters?.fabrics ?? [];
  const fabricOriginOptions = filters?.fabricOrigins ?? [];
  const fitOptions = filters?.fits ?? [];
  const formatOption = (name: string, count: number) => `${name} (${count})`;
  const commitPriceRange = (value: number | readonly number[]) => {
    if (!Array.isArray(value) || value.length < 2) return;
    const lower = Math.max(minAvailablePrice, Math.min(Number(value[0]), maxAvailablePrice));
    const upper = Math.max(lower, Math.min(Number(value[1]), maxAvailablePrice));
    updateQuery({
      minPrice: lower > minAvailablePrice ? String(lower) : null,
      maxPrice: upper < maxAvailablePrice ? String(upper) : null,
    });
  };

  const renderFilterPanel = () => (
    <div className="space-y-8 text-xs font-sans">
      {/* Curated Highlights */}
      <div>
        <h4 className="font-serif text-sm font-semibold uppercase tracking-wider text-[#073a2d] mb-3">
          Highlights
        </h4>
        <div className="space-y-2">
          <label className="flex items-center justify-between text-xs text-[#404945] cursor-pointer hover:text-[#073a2d]">
            <div className="flex items-center gap-2.5">
              <Checkbox
                checked={bestSellerSelected}
                onCheckedChange={(checked) =>
                  updateQuery({
                    bestSeller: checked ? 'true' : null,
                    sort: checked ? 'best-selling' : null,
                    filter: null,
                  })
                }
                className="rounded-none border-[#deddd3] data-[state=checked]:bg-[#073a2d]"
              />
              <span className={bestSellerSelected ? 'font-semibold text-[#073a2d]' : ''}>
                Best Sellers
              </span>
            </div>
            <span className="text-[10px] uppercase font-semibold text-[#c79a45] bg-[#c79a45]/10 px-1.5 py-0.5 rounded-xs">
              Top Sold
            </span>
          </label>
          <label className="flex items-center justify-between text-xs text-[#404945] cursor-pointer hover:text-[#073a2d]">
            <div className="flex items-center gap-2.5">
              <Checkbox
                checked={newArrivalSelected}
                onCheckedChange={(checked) =>
                  updateQuery({
                    newArrival: checked ? 'true' : null,
                    filter: null,
                  })
                }
                className="rounded-none border-[#deddd3] data-[state=checked]:bg-[#073a2d]"
              />
              <span className={newArrivalSelected ? 'font-semibold text-[#073a2d]' : ''}>
                New Arrivals
              </span>
            </div>
            <span className="text-[10px] uppercase font-semibold text-[#073a2d] bg-[#073a2d]/10 px-1.5 py-0.5 rounded-xs">
              Fresh
            </span>
          </label>
          <label className="flex items-center justify-between text-xs text-[#404945] cursor-pointer hover:text-[#073a2d]">
            <div className="flex items-center gap-2.5">
              <Checkbox
                checked={offersSelected}
                onCheckedChange={(checked) =>
                  updateQuery({
                    offers: checked ? 'true' : null,
                    filter: null,
                  })
                }
                className="rounded-none border-[#deddd3] data-[state=checked]:bg-[#073a2d]"
              />
              <span className={offersSelected ? 'font-semibold text-[#073a2d]' : ''}>
                Offers & Archive
              </span>
            </div>
            <span className="text-[10px] uppercase font-semibold text-[#ba1a1a] bg-[#ba1a1a]/10 px-1.5 py-0.5 rounded-xs">
              Sale
            </span>
          </label>
        </div>
      </div>

      {/* Category List */}
      <div>
        <h4 className="font-serif text-sm font-semibold uppercase tracking-wider text-[#073a2d] mb-3">
          Category
        </h4>
        <div className="space-y-1.5">
          {categories.map((cat) => {
            const isMenRoute = basePath.startsWith('/men');
            const targetHref = cat.slug === 'all' ? '/men' : `/men/${cat.slug}`;
            const isActive = selectedCategory === cat.slug;

            if (isMenRoute) {
              return (
                <Link
                  key={cat.slug}
                  href={targetHref}
                  className={`w-full text-left py-1.5 px-2.5 transition-colors flex items-center justify-between ${
                    isActive
                      ? 'bg-[#073a2d] text-white font-semibold'
                      : 'text-[#404945] hover:bg-[#f0eee7]'
                  }`}
                >
                  <span>{cat.name} <span className="opacity-70">({cat.count})</span></span>
                  {isActive && <span className="text-[10px]">●</span>}
                </Link>
              );
            }

            return (
              <button
                key={cat.slug}
                onClick={() => updateQuery({ category: cat.slug === 'all' ? null : cat.slug })}
                className={`w-full text-left py-1.5 px-2.5 transition-colors flex items-center justify-between ${
                  isActive
                    ? 'bg-[#073a2d] text-white font-semibold'
                    : 'text-[#404945] hover:bg-[#f0eee7]'
                }`}
              >
                <span>{cat.name} <span className="opacity-70">({cat.count})</span></span>
                {isActive && <span className="text-[10px]">●</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Size Swatches */}
      <div>
        <h4 className="font-serif text-sm font-semibold uppercase tracking-wider text-[#073a2d] mb-3">
          Size
        </h4>
        <div className="space-y-3">
          {sizeGroups.map((group) => (
            <div key={group.type}>
              {sizeGroups.length > 1 && (
                <p className="mb-1.5 text-[10px] uppercase tracking-wider text-[#717975]">
                  {group.label}
                </p>
              )}
              <div className="grid grid-cols-3 gap-2">
                {group.options.map((option) => {
                  const active = selectedSizes.includes(option.value);
                  return (
                    <button
                      key={`${group.type}-${option.value}`}
                      onClick={() => toggleQueryValue('size', option.value)}
                      className={`py-2 text-center border font-semibold text-xs transition-all ${
                        active
                          ? 'bg-[#073a2d] text-white border-[#073a2d]'
                          : 'bg-white border-[#deddd3] text-[#1b1c18] hover:border-[#073a2d]'
                      }`}
                    >
                      {option.value}
                      <span className="block text-[9px] opacity-70">{option.count}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Color Palette */}
      <div>
        <h4 className="font-serif text-sm font-semibold uppercase tracking-wider text-[#073a2d] mb-3">
          Color Story
        </h4>
        <div className="flex flex-wrap gap-2">
          {colorOptions.map((color) => {
            const active = selectedColors.includes(color.name);
            return (
              <button
                key={color.slug}
                onClick={() => toggleQueryValue('color', color.name)}
                aria-pressed={active}
                className={`flex items-center gap-2 px-2.5 py-1.5 border text-xs transition-all ${
                  active
                    ? 'border-[#073a2d] bg-[#073a2d] text-white'
                    : 'border-[#deddd3] bg-white text-[#1b1c18] hover:border-[#073a2d]'
                }`}
              >
                <span
                  className={`w-3 h-3 rounded-full border ${
                    color.name.toLowerCase().includes('white')
                      ? 'border-neutral-400 shadow-[0_1px_3px_rgba(0,0,0,0.35)] ring-1 ring-black/10'
                      : 'border-black/20'
                  }`}
                  style={{ backgroundColor: colorHex(color.name) }}
                />
                <span>{formatOption(color.name, color.count)}</span>
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
          min={minAvailablePrice}
          max={Math.max(minAvailablePrice + 1, maxAvailablePrice)}
          step={Math.max(1, Math.round((maxAvailablePrice - minAvailablePrice) / 100))}
          disabled={!filters || maxAvailablePrice <= minAvailablePrice}
          value={priceDraft}
          onValueChange={(value) => {
            if (Array.isArray(value) && value.length >= 2) {
              setPriceEdit({
                key: priceDraftKey,
                value: [Number(value[0]), Number(value[1])],
              });
            }
          }}
          onValueCommitted={commitPriceRange}
          className="my-4"
        />
        <div className="flex justify-between text-[11px] text-[#717975]">
          <span>৳{minAvailablePrice.toLocaleString()}</span>
          <span>৳{maxAvailablePrice.toLocaleString()}</span>
        </div>
      </div>

      {/* Fabrics */}
      <div>
        <h4 className="font-serif text-sm font-semibold uppercase tracking-wider text-[#073a2d] mb-3">
          Fabric
        </h4>
        <div className="space-y-2">
          {fabricOptions.map((fab) => {
            const active = selectedFabrics.includes(fab.name);
            return (
              <label
                key={fab.slug}
                className="flex items-center gap-2.5 text-xs text-[#404945] cursor-pointer hover:text-[#073a2d]"
              >
                <Checkbox
                  checked={active}
                  onCheckedChange={() => toggleQueryValue('fabric', fab.name)}
                  className="rounded-none border-[#deddd3] data-[state=checked]:bg-[#073a2d]"
                />
                <span>{formatOption(fab.name, fab.count)}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Fabric Origins */}
      <div>
        <h4 className="font-serif text-sm font-semibold uppercase tracking-wider text-[#073a2d] mb-3">
          Fabric Origin
        </h4>
        <div className="space-y-2">
          {fabricOriginOptions.map((origin) => (
            <label
              key={origin.slug}
              className="flex items-center gap-2.5 text-xs text-[#404945] cursor-pointer hover:text-[#073a2d]"
            >
              <Checkbox
                checked={selectedFabricOrigins.includes(origin.name)}
                onCheckedChange={() => toggleQueryValue('fabricOrigin', origin.name)}
                className="rounded-none border-[#deddd3] data-[state=checked]:bg-[#073a2d]"
              />
              <span>{formatOption(origin.name, origin.count)}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Fit */}
      <div>
        <h4 className="font-serif text-sm font-semibold uppercase tracking-wider text-[#073a2d] mb-3">
          Fit
        </h4>
        <div className="space-y-2">
          {fitOptions.map((fit) => (
            <label
              key={fit.slug}
              className="flex items-center gap-2.5 text-xs text-[#404945] cursor-pointer hover:text-[#073a2d]"
            >
              <Checkbox
                checked={selectedFits.includes(fit.name)}
                onCheckedChange={() => toggleQueryValue('fit', fit.name)}
                className="rounded-none border-[#deddd3] data-[state=checked]:bg-[#073a2d]"
              />
              <span>{formatOption(fit.name, fit.count)}</span>
            </label>
          ))}
        </div>
      </div>
      {/* In-Stock Toggle */}
      <div className="pt-2 border-t border-[#deddd3]">
        <label className="flex items-center gap-2.5 text-xs text-[#404945] cursor-pointer hover:text-[#073a2d]">
          <Checkbox
            checked={inStockOnly}
            onCheckedChange={(checked) => updateQuery({ inStock: checked ? 'true' : null })}
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
      <div className="w-full bg-[#f0eee7] border-b border-[#deddd3] py-10 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          {collectionConfig ? (
            <nav className="flex items-center gap-2 text-[11px] font-sans uppercase tracking-widest text-[#717975] mb-3">
              <Link href="/" className="hover:text-[#073a2d]">
                Home
              </Link>
              <span>/</span>
              <Link href="/men" className="hover:text-[#073a2d]">
                Men
              </Link>
              <span>/</span>
              <span className="text-[#073a2d] font-semibold">{collectionConfig.title}</span>
            </nav>
          ) : categoryConfig ? (
            <nav aria-label="Breadcrumbs" className="flex items-center gap-2 text-[11px] font-sans uppercase tracking-widest text-[#717975] mb-3">
              <Link href="/" className="hover:text-[#073a2d]">
                Home
              </Link>
              <span>/</span>
              <Link href="/men" className="hover:text-[#073a2d]">
                Men
              </Link>
              <span>/</span>
              <span className="text-[#073a2d] font-semibold">{categoryConfig.name}</span>
            </nav>
          ) : (
            <nav aria-label="Breadcrumbs" className="flex items-center gap-2 text-[11px] font-sans uppercase tracking-widest text-[#717975] mb-3">
              <Link href="/" className="hover:text-[#073a2d]">
                Home
              </Link>
              <span>/</span>
              <Link
                href={selectedGender === 'WOMEN' ? '/shop?gender=WOMEN' : selectedGender === 'UNISEX' ? '/shop?gender=UNISEX' : '/men'}
                className="hover:text-[#073a2d]"
              >
                {selectedGender === 'WOMEN' ? 'Women' : selectedGender === 'UNISEX' ? 'Unisex' : 'Men'}
              </Link>
              <span>/</span>
              <span className="text-[#073a2d] font-semibold">
                {newArrivalSelected
                  ? 'New Arrivals'
                  : bestSellerSelected
                  ? 'Best Sellers'
                  : offersSelected
                  ? 'Offers & Archive'
                  : selectedCategory !== 'all'
                  ? categories.find((c) => c.slug === selectedCategory)?.name
                  : selectedGender === 'WOMEN'
                  ? 'Women’s Collection'
                  : selectedGender === 'UNISEX'
                  ? 'Unisex Collection'
                  : 'All Sartorial Weaves'}
              </span>
            </nav>
          )}

          {collectionConfig ? (
            <>
              {collectionConfig.tagline && (
                <span className="font-sans text-[11px] uppercase tracking-[0.2em] text-[#c79a45] font-semibold block mb-2">
                  {collectionConfig.tagline}
                </span>
              )}
              <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#073a2d] tracking-tight mb-3">
                {collectionConfig.title}
              </h1>
              <p className="font-sans text-xs sm:text-sm text-[#69726d] max-w-2xl font-light">
                {collectionConfig.description}
              </p>
            </>
          ) : categoryConfig ? (
            <>
              <span className="font-sans text-[11px] uppercase tracking-[0.2em] text-[#c79a45] font-semibold block mb-2">
                ATELIER CAPSULE
              </span>
              <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#073a2d] tracking-tight mb-3">
                {categoryConfig.name}
              </h1>
              {categoryConfig.description && (
                <p className="font-sans text-xs sm:text-sm text-[#69726d] max-w-2xl font-light">
                  {categoryConfig.description}
                </p>
              )}
            </>
          ) : (
            <>
              <h1 className="font-serif text-3xl sm:text-5xl font-normal text-[#073a2d] mb-3">
                {newArrivalSelected
                  ? 'NEW ARRIVALS'
                  : bestSellerSelected
                  ? 'BEST SELLERS'
                  : offersSelected
                  ? 'EXCLUSIVE OFFERS'
                  : selectedCategory !== 'all'
                  ? categories.find((c) => c.slug === selectedCategory)?.name.toUpperCase() ?? 'MEN’S COLLECTION'
                  : selectedGender === 'WOMEN'
                  ? 'WOMEN’S COLLECTION'
                  : selectedGender === 'UNISEX'
                  ? 'UNISEX COLLECTION'
                  : 'MEN’S COLLECTION'}
              </h1>
              <p className="font-sans text-xs sm:text-sm text-[#69726d] max-w-2xl font-light">
                Handcrafted Bengal panjabis, Egyptian long-staple cotton shirts, and modern architectural bottom wear designed for tropical ease and aristocratic presence.
              </p>
            </>
          )}
        </div>
      </div>

      {/* Main Interactive Controls Bar */}
      <div className="sticky top-16 sm:top-20 z-30 bg-[#fbf9f2]/95 backdrop-blur-md border-b border-[#deddd3] py-2.5 sm:py-3.5">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          {/* Mobile view (< sm): Clean two-row mobile-first toolbar */}
          <div className="flex flex-col gap-2.5 sm:hidden">
            {/* Row 1: Full-width prominent search bar */}
            <form
              onSubmit={(event) => {
                event.preventDefault();
                updateQuery({ q: searchDraft.trim() || null });
              }}
              className="flex items-center bg-white border-2 border-[#073a2d]/40 focus-within:border-[#073a2d] focus-within:ring-2 focus-within:ring-[#073a2d]/20 h-11 w-full shadow-xs transition-all overflow-hidden"
              role="search"
            >
              <div className="pl-3.5 pr-2 text-[#073a2d] shrink-0">
                <Search className="h-4 w-4" />
              </div>
              <input
                value={searchDraft}
                onChange={(event) =>
                  setSearchEdit({
                    query: initialQueryFromUrl,
                    value: event.target.value,
                  })
                }
                placeholder="Search panjabis, shirts, polos..."
                aria-label="Search collection"
                className="w-full bg-transparent pr-2 text-sm font-sans outline-none placeholder:text-[#69726d] text-[#1b1c18]"
              />
              {searchDraft && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchEdit({ query: initialQueryFromUrl, value: '' });
                    updateQuery({ q: null });
                  }}
                  className="p-1.5 text-[#717975] hover:text-[#ba1a1a] shrink-0 mr-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="submit"
                className="h-full px-3.5 bg-[#073a2d] hover:bg-[#0c4e3b] text-white font-sans text-xs font-bold uppercase tracking-wider shrink-0 transition-colors"
              >
                Search
              </button>
            </form>

            {/* Row 2: Filter Button & Sort Dropdown side by side */}
            <div className="grid grid-cols-2 gap-2">
              <Sheet open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
                <SheetTrigger
                  render={
                    <Button
                      variant="outline"
                      className="w-full h-9 px-3 text-[11px] font-sans uppercase tracking-wider border-[#073a2d] text-[#073a2d] flex items-center justify-center gap-1.5 bg-white font-semibold shadow-2xs"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5 text-[#c79a45]" />
                      <span>Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}</span>
                    </Button>
                  }
                />
                <SheetContent side="left" className="w-[85vw] max-w-sm bg-[#fbf9f2] p-5 overflow-y-auto">
                  <SheetHeader className="pb-3 border-b border-[#deddd3]">
                    <SheetTitle className="font-serif text-lg text-[#073a2d]">
                      Filter Collection
                    </SheetTitle>
                  </SheetHeader>
                  <div className="mt-4">
                    {renderFilterPanel()}
                  </div>
                </SheetContent>
              </Sheet>

              <select
                value={sortBy}
                onChange={(e) => updateQuery({ sort: e.target.value === 'featured' ? null : e.target.value })}
                className="w-full h-9 bg-white border border-[#deddd3] text-[11px] font-sans px-2.5 text-[#1b1c18] focus:outline-none focus:border-[#073a2d] shadow-2xs"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="newest">Newest Drops</option>
                <option value="best-selling">Best Selling</option>
              </select>
            </div>

            {/* Row 3: Count and mobile active filter tags */}
            <div className="flex items-center justify-between text-[11px] text-[#69726d] pt-0.5">
              <span>Showing <strong className="text-[#073a2d] font-semibold">{pageMeta.total}</strong> pieces</span>
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="text-[11px] text-[#ba1a1a] font-semibold hover:underline"
                >
                  Clear Filters ({activeFiltersCount})
                </button>
              )}
            </div>
          </div>

          {/* Desktop & Tablet view (sm:flex) */}
          <div className="hidden sm:flex flex-wrap items-center justify-between gap-4">
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
                    {renderFilterPanel()}
                  </div>
                </SheetContent>
              </Sheet>

              <span className="text-xs font-sans text-[#69726d]">
                Showing <strong className="text-[#073a2d]">{pageMeta.total}</strong> Sartorial Pieces
              </span>
            </div>

            {/* Active Filter Pills */}
            {activeFiltersCount > 0 && (
              <div className="hidden sm:flex items-center gap-2 flex-wrap">
                {bestSellerSelected && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-[#deddd3] text-[11px] text-[#073a2d]">
                    Best Sellers
                    <button onClick={() => updateQuery({ bestSeller: null, filter: null, sort: null })}>
                      <X className="w-3 h-3 text-[#717975] hover:text-black" />
                    </button>
                  </span>
                )}
                {newArrivalSelected && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-[#deddd3] text-[11px] text-[#073a2d]">
                    New Arrivals
                    <button onClick={() => updateQuery({ newArrival: null, filter: null })}>
                      <X className="w-3 h-3 text-[#717975] hover:text-black" />
                    </button>
                  </span>
                )}
                {offersSelected && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-[#deddd3] text-[11px] text-[#073a2d]">
                    Special Offers
                    <button onClick={() => updateQuery({ offers: null, filter: null })}>
                      <X className="w-3 h-3 text-[#717975] hover:text-black" />
                    </button>
                  </span>
                )}
                {selectedCategory !== 'all' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-[#deddd3] text-[11px] text-[#073a2d]">
                    {categories.find((c) => c.slug === selectedCategory)?.name}
                    <button onClick={() => updateQuery({ category: null })}>
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
                    <button onClick={() => toggleQueryValue('size', s)}>
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
            <div className="flex items-center gap-3 lg:gap-4">
              {/* Prominent High-Visibility Search Bar */}
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  updateQuery({ q: searchDraft.trim() || null });
                }}
                className="relative flex items-center bg-white border-2 border-[#073a2d]/40 hover:border-[#073a2d] focus-within:border-[#073a2d] focus-within:ring-2 focus-within:ring-[#073a2d]/20 h-10 sm:h-11 w-64 md:w-80 lg:w-[380px] shadow-xs hover:shadow-sm transition-all overflow-hidden"
                role="search"
              >
                <div className="pl-3.5 pr-2 text-[#073a2d] shrink-0">
                  <Search className="h-4 w-4" />
                </div>
                <input
                  value={searchDraft}
                  onChange={(event) =>
                    setSearchEdit({
                      query: initialQueryFromUrl,
                      value: event.target.value,
                    })
                  }
                  placeholder="Search panjabis, shirts, polos..."
                  aria-label="Search products"
                  className="w-full bg-transparent pr-2 text-xs sm:text-sm font-sans text-[#1b1c18] placeholder:text-[#69726d] outline-none"
                />
                {searchDraft && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchEdit({ query: initialQueryFromUrl, value: '' });
                      updateQuery({ q: null });
                    }}
                    className="p-1.5 text-[#717975] hover:text-[#ba1a1a] shrink-0 mr-1 transition-colors cursor-pointer"
                    title="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="submit"
                  aria-label="Submit product search"
                  className="h-full px-4 bg-[#073a2d] hover:bg-[#0c4e3b] text-white font-sans text-[11px] sm:text-xs font-bold uppercase tracking-wider shrink-0 transition-colors flex items-center justify-center cursor-pointer"
                >
                  Search
                </button>
              </form>

              {/* Sorting Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-sans text-[#717975] hidden sm:inline">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => updateQuery({ sort: e.target.value === 'featured' ? null : e.target.value })}
                  className="bg-white border-2 border-[#deddd3] hover:border-[#073a2d]/40 focus:border-[#073a2d] h-10 sm:h-11 text-xs font-sans px-3 text-[#1b1c18] focus:outline-none transition-colors shadow-xs"
                >
                  <option value="featured">Featured Atelier Pieces</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="newest">Newest Loom Drops</option>
                  <option value="best-selling">Best Selling</option>
                </select>
              </div>

              {/* Layout Toggle */}
              <div className="hidden md:flex items-center border-2 border-[#deddd3] bg-white h-10 sm:h-11 shadow-xs">
                <button
                  onClick={() => setGridCols(3)}
                  className={`h-full px-2.5 flex items-center justify-center transition-colors ${gridCols === 3 ? 'bg-[#073a2d] text-white' : 'text-[#717975] hover:text-black'}`}
                  title="3 Columns"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setGridCols(4)}
                  className={`h-full px-2.5 flex items-center justify-center transition-colors ${gridCols === 4 ? 'bg-[#073a2d] text-white' : 'text-[#717975] hover:text-black'}`}
                  title="4 Columns"
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Canvas: Left Sidebar + Right Grid */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
          {/* Desktop Left Sidebar Filters (3 Cols) */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="sticky top-38 p-6 bg-white border border-[#deddd3] shadow-xs">
              {renderFilterPanel()}
            </div>
          </div>

          {/* Right Product Grid (9 Cols) */}
          <div className="lg:col-span-9">
            {loadError && products.length === 0 ? (
              <div className="p-16 bg-white border border-[#deddd3] text-center space-y-4">
                <h3 className="font-serif text-2xl text-[#073a2d]">The collection could not be loaded</h3>
                <p className="font-sans text-xs text-[#69726d]">{loadError}</p>
                <Button onClick={retryProducts} className="bg-[#073a2d] text-white">
                  Try Again
                </Button>
              </div>
            ) : isLoading && products.length === 0 ? (
              <LogoLoader />
            ) : pageMeta.total === 0 && products.length === 0 ? (
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
                className={`grid grid-cols-2 gap-3 sm:gap-6 ${
                  gridCols === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'
                }`}
              >
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}

            {isRefreshing && !isLoading && (
              <div className="mt-3 flex items-center justify-center gap-2 text-xs text-[#69726d]" role="status">
                <Loader2 className="h-4 w-4 animate-spin" /> Updating collection…
              </div>
            )}

            {pageMeta.totalPages > 1 && (
              <nav className="mt-8 flex items-center justify-center gap-4" aria-label="Product pages">
                <Button
                  variant="outline"
                  disabled={!pageMeta.hasPrevious || isRefreshing}
                  onClick={() => updateQuery({ page: String(pageMeta.page - 1) })}
                  className="border-[#deddd3]"
                >
                  <ChevronLeft className="h-4 w-4" /> Previous
                </Button>
                <span className="text-xs text-[#69726d]">
                  Page {pageMeta.page} of {pageMeta.totalPages}
                </span>
                <Button
                  variant="outline"
                  disabled={!pageMeta.hasNext || isRefreshing}
                  onClick={() => updateQuery({ page: String(pageMeta.page + 1) })}
                  className="border-[#deddd3]"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </nav>
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

              {settings?.whatsappOrderEnabled && whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-6 py-3.5 bg-[#c79a45] hover:bg-[#b08535] text-[#073a2d] font-sans font-bold text-xs uppercase tracking-widest whitespace-nowrap shadow-sm flex items-center gap-2"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Chat with Master Cutter</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
