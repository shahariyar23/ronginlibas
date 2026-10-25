'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { Heart, ShoppingCart, Loader2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { analytics } from '@/lib/analytics/client';
import { getOptimizedImageUrl, getCloudinarySrcSet, getNaturalAltText } from '@/lib/images';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist, isItemLoading } = useWishlist();
  const [selectedColor, setSelectedColor] = useState(product.colors[0]?.name || 'Standard');
  const [isHovered, setIsHovered] = useState(false);
  const [mobileImageIndex, setMobileImageIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [showSizePicker, setShowSizePicker] = useState(false);
  const [isAddingSize, setIsAddingSize] = useState<string | null>(null);

  const isFavorite = isInWishlist(product.id);
  const isWishlistBusy = isItemLoading(product.id);

  const isOutOfStock =
    product.inStock === false ||
    product.stockCount === 0 ||
    (Boolean(product.variants?.length) && product.variants!.every((v) => (v.stock ?? 0) <= 0));

  const handleQuickAdd = async (size: string) => {
    if (isOutOfStock || isAddingSize) return;
    if (!user) {
      toast.error('Please Sign In', {
        description: 'Please sign in to add items to your cart.',
        action: {
          label: 'Sign In',
          onClick: () => {
            window.location.href = '/login';
          },
        },
      });
      setShowSizePicker(false);
      return;
    }
    setIsAddingSize(size);
    try {
      const added = await addToCart(product, size, selectedColor, 1);
      if (added) {
        analytics.trackAddToCart({
          pagePath: `/products/${product.slug}`,
          productId: product.id,
          productName: product.name,
          price: product.price,
          quantity: 1,
          size,
          color: selectedColor,
          currency: 'BDT',
        });
      }
    } finally {
      setIsAddingSize(null);
      setShowSizePicker(false);
    }
  };

  const hasMultipleImages = Boolean(product.images && product.images.length > 1);
  const displayIndex = isHovered && hasMultipleImages ? 1 : mobileImageIndex;
  const currentRawImage =
    hasMultipleImages && product.images[displayIndex]
      ? product.images[displayIndex]
      : (product.images[0] || '');
  const optimizedImage = getOptimizedImageUrl(currentRawImage, { preset: 'card' });
  const cardSrcSet = getCloudinarySrcSet(currentRawImage, [320, 480, 640, 800]);

  const naturalAlt = getNaturalAltText(product.name, {
    color: selectedColor,
    category: product.categoryLabel,
    viewIndex: displayIndex,
    totalViews: product.images.length,
    customAlt: product.imageDetails?.[displayIndex]?.altText || product.imageDetails?.[0]?.altText,
  });

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!hasMultipleImages) return;
    setTouchStartX(e.touches[0].clientX);
    setTouchStartY(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!hasMultipleImages || touchStartX === null || touchStartY === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX;
    const deltaY = e.changedTouches[0].clientY - touchStartY;

    // Detect horizontal swipe with clear intent: deltaX > 35px and more horizontal than vertical
    if (Math.abs(deltaX) > 35 && Math.abs(deltaX) > Math.abs(deltaY) * 1.3) {
      const maxViews = Math.min(product.images.length, 3);
      if (deltaX < 0) {
        // Swiped Left -> Next image (e.g. 2nd image)
        setMobileImageIndex((prev) => (prev + 1) % maxViews);
      } else {
        // Swiped Right -> Previous image
        setMobileImageIndex((prev) => (prev - 1 + maxViews) % maxViews);
      }
    }
    setTouchStartX(null);
    setTouchStartY(null);
  };

  return (
    <div
      className="group relative flex flex-col bg-white border border-[#deddd3] overflow-hidden transition-all duration-300 hover:shadow-lg"
      onMouseEnter={() => {
        if (typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
          setIsHovered(true);
        }
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowSizePicker(false);
      }}
    >
      {/* Product Image Frame */}
      <div
        className="relative aspect-[3/4] w-full overflow-hidden bg-[#f5f4ed]"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <Link href={`/products/${product.slug}`} className="block w-full h-full">
          <img
            src={optimizedImage || currentRawImage}
            srcSet={cardSrcSet || undefined}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            alt={naturalAlt}
            loading="lazy"
            decoding="async"
            className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
              isOutOfStock ? 'opacity-85 grayscale-[15%]' : ''
            }`}
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-col gap-1 z-10">
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="bg-[#ba1a1a] text-white font-sans text-[8.5px] sm:text-[10px] font-bold px-1.5 sm:px-2.5 py-0.5 sm:py-1 uppercase tracking-wider shadow-xs">
              {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
            </span>
          )}
          {product.badge && (!product.originalPrice || !product.badge.includes('OFF')) && (
            <span className="bg-[#073a2d] text-[#fbf9f2] font-sans text-[8.5px] sm:text-[10px] font-bold px-1.5 sm:px-2.5 py-0.5 sm:py-1 uppercase tracking-wider sm:tracking-widest border border-[#c79a45]/40 shadow-xs">
              {product.badge}
            </span>
          )}
          {!isOutOfStock &&
            typeof product.stockCount === 'number' &&
            product.stockCount > 0 &&
            product.stockCount <= 8 && (
              <span className="bg-[#9c4a2f] text-white font-sans text-[8px] sm:text-[9px] font-semibold px-1.5 sm:px-2 py-0.5 uppercase tracking-wider shadow-xs">
                Only {product.stockCount} Left
              </span>
            )}
        </div>

        {/* Center Section Out of Stock Banner */}
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 p-3">
            <div className="bg-[#1b1c18]/90 text-[#fbf9f2] backdrop-blur-xs px-4 py-2 border border-[#c79a45]/50 shadow-xl text-center transform transition-transform duration-300 group-hover:scale-105">
              <span className="font-sans text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] text-[#fbf9f2] block">
                Out of Stock
              </span>
            </div>
          </div>
        )}

        {/* Wishlist Floating Button */}
        <button
          disabled={isWishlistBusy}
          onClick={async (e) => {
            e.preventDefault();
            if (isWishlistBusy) return;
            const willFavorite = !isFavorite;
            await toggleWishlist(product.id, product.name);
            if (willFavorite && isOutOfStock) {
              toast.info('Restock Notification Set', {
                description: `We will email you as soon as ${product.name} is restocked and available.`,
              });
            }
          }}
          aria-label={isWishlistBusy ? "Updating wishlist" : "Toggle Wishlist"}
          aria-busy={isWishlistBusy ? "true" : undefined}
          className="absolute top-2 right-2 sm:top-3 sm:right-3 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/95 hover:bg-white text-[#1b1c18] hover:text-[#073a2d] flex items-center justify-center backdrop-blur-xs transition-transform duration-200 active:scale-95 sm:hover:scale-110 shadow-xs z-10 disabled:opacity-75 disabled:cursor-wait cursor-pointer"
        >
          {isWishlistBusy ? (
            <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin text-[#073a2d]" />
          ) : (
            <Heart
              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors ${
                isFavorite ? 'fill-[#ba1a1a] text-[#ba1a1a]' : 'text-[#1b1c18]'
              }`}
            />
          )}
        </button>

        {/* Quick Add Overlay / View Details for Out of Stock */}
        <div className="absolute inset-x-2 sm:inset-x-3 bottom-2 sm:bottom-3 z-10 transition-all duration-300 opacity-0 group-hover:opacity-100 hidden sm:block">
          {isOutOfStock ? (
            <Link
              href={`/products/${product.slug}`}
              aria-label={`View details for ${product.name}`}
              className="w-full bg-[#1b1c18]/90 hover:bg-[#1b1c18] text-[#fbf9f2] font-sans text-xs uppercase tracking-widest h-10 shadow-md flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>View Product Details</span>
            </Link>
          ) : showSizePicker ? (
            <div className="bg-[#073a2d] text-white p-2.5 border border-[#c79a45]/40 shadow-xl space-y-1.5 animate-in fade-in">
              <span className="text-[10px] font-sans uppercase tracking-widest text-[#c79a45] block text-center">
                {isAddingSize ? 'Adding to bag...' : 'Select Your Size'}
              </span>
              <div className="flex flex-wrap gap-1 justify-center">
                {product.sizes.map((s) => {
                  const isCurrent = isAddingSize === s;
                  return (
                    <button
                      key={s}
                      disabled={Boolean(isAddingSize)}
                      onClick={() => handleQuickAdd(s)}
                      className="px-2 py-1 bg-white/10 hover:bg-[#c79a45] hover:text-[#073a2d] text-[11px] font-sans font-semibold transition-colors disabled:opacity-50 disabled:cursor-wait flex items-center gap-1"
                    >
                      {isCurrent && <Loader2 className="w-3 h-3 animate-spin shrink-0" />}
                      <span>{s}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <Button
              onClick={() => {
                if (!user) {
                  toast.error('Please Sign In', {
                    description: 'Please sign in to add items to your cart.',
                    action: {
                      label: 'Sign In',
                      onClick: () => {
                        window.location.href = '/login';
                      },
                    },
                  });
                  return;
                }
                setShowSizePicker(true);
              }}
              className="w-full bg-[#073a2d] hover:bg-[#0d4d3b] text-[#fbf9f2] font-sans text-xs uppercase tracking-widest h-10 shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Quick Add</span>
            </Button>
          )}
        </div>

        {/* Mobile & Tablet Second Image Indicator (Hidden on Desktop 'lg:hidden') */}
        {hasMultipleImages && (
          <div
            className="lg:hidden absolute bottom-2 sm:bottom-2.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1b1c18]/70 backdrop-blur-md border border-white/20 shadow-xs pointer-events-auto select-none"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            {product.images.slice(0, Math.min(product.images.length, 3)).map((_, idx) => {
              const isActive = displayIndex === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  aria-label={`View photo ${idx + 1} of ${product.name}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setMobileImageIndex(idx);
                  }}
                  className="p-1 -m-0.5 flex items-center justify-center cursor-pointer focus:outline-none"
                >
                  <span
                    className={`block rounded-full transition-all duration-300 ${
                      isActive
                        ? 'w-3.5 h-1.5 bg-[#c79a45] shadow-xs'
                        : 'w-1.5 h-1.5 bg-white/60 hover:bg-white'
                    }`}
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Card Info */}
      <div className="p-2.5 sm:p-4 flex flex-col flex-1 justify-between bg-white border-t border-[#f0eee7]">
        <div>
          {product.category ? (
            <Link
              href={`/men/${encodeURIComponent(product.category)}`}
              className="font-sans text-[9px] sm:text-[10px] uppercase tracking-wider text-[#717975] hover:text-[#073a2d] transition-colors block truncate"
            >
              {product.categoryLabel}
            </Link>
          ) : (
            <span className="font-sans text-[9px] sm:text-[10px] uppercase tracking-wider text-[#717975] block truncate">
              {product.categoryLabel}
            </span>
          )}
          <Link
            href={`/products/${product.slug}`}
            onClick={() =>
              analytics.trackSelectItem({
                productId: product.id,
                productName: product.name,
                pagePath: `/products/${product.slug}`,
                price: product.price,
              })
            }
          >
            <h3 className="font-serif text-xs sm:text-base font-semibold text-[#073a2d] hover:text-[#0d4d3b] transition-colors line-clamp-1 mt-0.5 leading-snug">
              {product.name}
            </h3>
          </Link>

          {/* Reviews Rating & Buyers */}
          {((product.reviewsCount ?? 0) > 0 || (product.totalSold ?? 0) > 0) && (
            <div className="flex items-center gap-1.5 pt-1 text-[10px] sm:text-[11px] font-sans">
              {(product.reviewsCount ?? 0) > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-[#c79a45] text-[#c79a45] shrink-0" />
                  <span className="font-bold text-[#073a2d]">
                    {product.averageRating ? product.averageRating.toFixed(1) : '5.0'}
                  </span>
                  <span className="text-[#717975]">/5</span>
                  <span className="text-[#717975]">
                    ({product.reviewsCount})
                  </span>
                </div>
              )}

              {(product.reviewsCount ?? 0) > 0 && (product.totalSold ?? 0) > 0 && (
                <span className="text-[#deddd3]">•</span>
              )}

              {(product.totalSold ?? 0) > 0 && (
                <span className="text-[#69726d] font-medium">
                  {product.totalSold} {product.totalSold === 1 ? 'bought' : 'bought'}
                </span>
              )}
            </div>
          )}

          {/* Colorway Swatches */}
          {product.colors && product.colors.length > 0 && (
            <div className="flex items-center gap-1.5 pt-1.5 sm:pt-2">
              {product.colors.map((c) => {
                const isLight =
                  !c.hex ||
                  ['#ffffff', '#fff', '#fbf9f2', '#f5f4ed', '#fafafa', '#f8fafc'].includes(c.hex.toLowerCase()) ||
                  c.name.toLowerCase().includes('white');

                return (
                  <button
                    key={c.name}
                    onClick={() => setSelectedColor(c.name)}
                    title={c.name}
                    className={`w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full border transition-all cursor-pointer ${
                      isLight
                        ? 'border-neutral-400 shadow-[0_1px_3px_rgba(0,0,0,0.35)] ring-1 ring-black/10'
                        : 'border-black/20'
                    } ${
                      selectedColor === c.name
                        ? `ring-1.5 ring-[#073a2d] ring-offset-1 ${isLight ? 'border-neutral-400' : 'border-white'}`
                        : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: c.hex }}
                  />
                );
              })}
              <span className="text-[9px] sm:text-[10px] text-[#717975] ml-0.5 font-sans truncate max-w-[65px] sm:max-w-none">
                {selectedColor}
              </span>
            </div>
          )}
        </div>

        {/* Price & Action */}
        <div className="flex items-baseline justify-between pt-2 sm:pt-3 mt-1.5 sm:mt-2 border-t border-[#f5f4ed]">
          <div className="flex items-baseline gap-1.5 sm:gap-2">
            <span className="font-sans font-bold text-xs sm:text-base text-[#073a2d] tabular-nums">
              ৳{product.price.toLocaleString()}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="font-sans text-[10px] sm:text-xs text-[#717975] line-through tabular-nums">
                ৳{product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>
          <span className="font-sans text-[8.5px] sm:text-[10px] uppercase tracking-wider text-[#c79a45] font-semibold truncate max-w-[55px] sm:max-w-none">
            {product.fabricOrigin?.split(',')[0] || 'Rongin Libas'}
          </span>
        </div>
      </div>
    </div>
  );
};
