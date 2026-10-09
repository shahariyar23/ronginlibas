'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { Heart, ShoppingCart, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist, isItemLoading } = useWishlist();
  const [selectedColor, setSelectedColor] = useState(product.colors[0]?.name || 'Standard');
  const [isHovered, setIsHovered] = useState(false);
  const [showSizePicker, setShowSizePicker] = useState(false);
  const [isAddingSize, setIsAddingSize] = useState<string | null>(null);

  const isFavorite = isInWishlist(product.id);
  const isWishlistBusy = isItemLoading(product.id);

  const handleQuickAdd = async (size: string) => {
    if (isAddingSize) return;
    if (!user) {
      toast.error('First login please', {
        description: 'Please login first to add items to your cart.',
        action: {
          label: 'Login',
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
      await addToCart(product, size, selectedColor, 1);
    } finally {
      setIsAddingSize(null);
      setShowSizePicker(false);
    }
  };

  const currentImage =
    isHovered && product.images.length > 1 ? product.images[1] : product.images[0];

  return (
    <div
      className="group relative flex flex-col bg-white border border-[#deddd3] overflow-hidden transition-all duration-300 hover:shadow-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowSizePicker(false);
      }}
    >
      {/* Product Image Frame */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#f5f4ed]">
        <Link href={`/product/${product.id}`} className="block w-full h-full">
          <img
            src={currentImage}
            alt={product.name}
            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-col gap-1 z-10">
          {product.badge && (
            <span className="bg-[#073a2d] text-[#fbf9f2] font-sans text-[8.5px] sm:text-[10px] font-bold px-1.5 sm:px-2.5 py-0.5 sm:py-1 uppercase tracking-wider sm:tracking-widest border border-[#c79a45]/40 shadow-xs">
              {product.badge}
            </span>
          )}
          {product.stockCount && product.stockCount <= 8 && (
            <span className="bg-[#9c4a2f] text-white font-sans text-[8px] sm:text-[9px] font-semibold px-1.5 sm:px-2 py-0.5 uppercase tracking-wider shadow-xs">
              Only {product.stockCount} Left
            </span>
          )}
        </div>

        {/* Wishlist Floating Button */}
        <button
          disabled={isWishlistBusy}
          onClick={async (e) => {
            e.preventDefault();
            if (isWishlistBusy) return;
            await toggleWishlist(product.id, product.name);
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

        {/* Quick Add Overlay */}
        <div className="absolute inset-x-2 sm:inset-x-3 bottom-2 sm:bottom-3 z-10 transition-all duration-300 opacity-0 group-hover:opacity-100 hidden sm:block">
          {showSizePicker ? (
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
                  toast.error('First login please', {
                    description: 'Please login first to add items to your cart.',
                    action: {
                      label: 'Login',
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
      </div>

      {/* Card Info */}
      <div className="p-2.5 sm:p-4 flex flex-col flex-1 justify-between bg-white border-t border-[#f0eee7]">
        <div>
          <span className="font-sans text-[9px] sm:text-[10px] uppercase tracking-wider text-[#717975] block truncate">
            {product.categoryLabel}
          </span>
          <Link href={`/product/${product.id}`}>
            <h3 className="font-serif text-xs sm:text-base font-semibold text-[#073a2d] hover:text-[#0d4d3b] transition-colors line-clamp-1 mt-0.5 leading-snug">
              {product.name}
            </h3>
          </Link>

          {/* Colorway Swatches */}
          {product.colors && product.colors.length > 0 && (
            <div className="flex items-center gap-1.5 pt-1.5 sm:pt-2">
              {product.colors.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setSelectedColor(c.name)}
                  title={c.name}
                  className={`w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full border transition-all cursor-pointer ${
                    selectedColor === c.name
                      ? 'ring-1.5 ring-[#073a2d] ring-offset-1 border-white'
                      : 'border-black/20 hover:scale-110'
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
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
            {product.originalPrice && (
              <span className="font-sans text-[10px] sm:text-xs text-[#717975] line-through tabular-nums">
                ৳{product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>
          <span className="font-sans text-[8.5px] sm:text-[10px] uppercase tracking-wider text-[#c79a45] font-semibold truncate max-w-[55px] sm:max-w-none">
            {product.fabricOrigin?.split(',')[0] || 'Atelier'}
          </span>
        </div>
      </div>
    </div>
  );
};
