'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Plus, Minus, Trash2, ArrowRight, ShieldCheck, Tag, ShoppingCart } from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    subtotal,
    discount,
    shippingFee,
    total,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');

  const freeShippingThreshold = 3000;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingProgress = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    if (await applyCoupon(couponInput)) {
      setCouponInput('');
    }
  };

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md p-0 flex flex-col bg-[#fbf9f2] border-l border-[#deddd3] text-[#1b1c18]"
      >
        {/* Header */}
        <SheetHeader className="p-6 border-b border-[#deddd3] bg-white">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-sans font-semibold tracking-[0.2em] text-[#c79a45] uppercase block flex items-center gap-1.5">
                <ShoppingCart className="w-3.5 h-3.5" />
                Atelier Selection
              </span>
              <SheetTitle className="font-serif text-2xl font-normal text-[#073a2d]">
                Shopping Cart
              </SheetTitle>
            </div>
            <Badge variant="outline" className="font-sans text-xs bg-[#f5f4ed] px-2.5 py-1 text-[#073a2d] font-medium border-[#deddd3] rounded-none">
              {items.length} {items.length === 1 ? 'Item' : 'Items'}
            </Badge>
          </div>

          {/* Free Shipping Progress Indicator */}
          <div className="mt-4 pt-4 border-t border-[#f0eee7]">
            <div className="flex items-center justify-between text-xs mb-1.5 font-sans">
              {remainingForFreeShipping > 0 ? (
                <span className="text-[#69726d]">
                  Add <strong className="text-[#073a2d]">৳{remainingForFreeShipping.toLocaleString()}</strong> more for complimentary shipping
                </span>
              ) : (
                <span className="text-[#073a2d] font-semibold flex items-center gap-1">
                  ✓ Complimentary Nationwide Delivery Unlocked
                </span>
              )}
              <span className="font-bold text-[#073a2d]">{Math.round(freeShippingProgress)}%</span>
            </div>
            <div className="w-full h-1.5 bg-[#eae8e1] overflow-hidden">
              <div
                className="h-full bg-[#073a2d] transition-all duration-500 ease-out"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>
        </SheetHeader>

        {/* Bag Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <div className="w-16 h-16 flex items-center justify-center mb-4">
                <img src="/logo.svg" alt="Rongin Libas Logo" className="w-14 h-14 object-contain" />
              </div>
              <h3 className="font-serif text-xl text-[#073a2d] mb-2">Your Cart is Empty</h3>
              <p className="font-sans text-xs text-[#69726d] max-w-xs mb-6">
                Discover our curated heritage panjabis, mercerized knitwear, and architectural menswear.
              </p>
              <Link
                href="/shop"
                onClick={() => setIsCartOpen(false)}
                className={cn(
                  buttonVariants({ variant: 'default' }),
                  'bg-[#073a2d] hover:bg-[#0d4d3b] text-[#fbf9f2] font-sans uppercase tracking-[0.15em] text-xs h-11 px-8 inline-flex items-center justify-center'
                )}
              >
                Explore Collection
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item, index) => (
                <div
                  key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}-${index}`}
                  className="flex gap-4 p-3 bg-white border border-[#deddd3] relative group"
                >
                  {/* Image */}
                  <div className="relative w-20 h-26 bg-[#f5f4ed] overflow-hidden flex-shrink-0">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-between py-0.5">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[10px] uppercase font-sans tracking-widest text-[#717975]">
                          {item.product.categoryLabel}
                        </span>
                        <button
                          onClick={() => removeFromCart(item.product.id, item.selectedSize, item.selectedColor)}
                          className="text-[#717975] hover:text-[#ba1a1a] transition-colors p-1"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <h4 className="font-serif text-sm font-semibold text-[#073a2d] line-clamp-1 mt-0.5">
                        {item.product.name}
                      </h4>
                      <p className="text-xs text-[#69726d] mt-1 flex items-center gap-2">
                        <span>Size: <strong className="text-[#1b1c18]">{item.selectedSize}</strong></span>
                        <span className="text-[#deddd3]">•</span>
                        <span>Color: <strong className="text-[#1b1c18]">{item.selectedColor}</strong></span>
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#f0eee7]">
                      {/* Quantity Selector */}
                      <div className="flex items-center border border-[#deddd3] bg-[#fbf9f2]">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.selectedSize, item.selectedColor, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center text-[#1b1c18] hover:bg-[#eae8e1] transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-xs font-semibold tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.selectedSize, item.selectedColor, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center text-[#1b1c18] hover:bg-[#eae8e1] transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Line Price */}
                      <div className="text-right">
                        <span className="font-sans font-bold text-sm text-[#073a2d] tabular-nums">
                          ৳{(item.product.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer / Checkout CTA */}
        {items.length > 0 && (
          <div className="p-6 border-t border-[#deddd3] bg-white space-y-4">
            {/* Coupon Code Input */}
            <div>
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2.5 bg-[#f0eee7] border border-[#c79a45]/40 text-xs">
                  <div className="flex items-center gap-2 text-[#073a2d]">
                    <Tag className="w-3.5 h-3.5 text-[#c79a45]" />
                    <span>Coupon <strong>{appliedCoupon}</strong> Applied</span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-[11px] text-[#ba1a1a] hover:underline uppercase tracking-wider font-semibold"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <Input
                    placeholder="Enter Coupon (e.g. RONGINLAUNCH)"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    className="h-10 text-xs bg-[#fbf9f2] border-[#deddd3] rounded-none focus-visible:ring-[#073a2d]"
                  />
                  <Button
                    type="submit"
                    variant="outline"
                    className="h-10 px-4 text-xs font-sans uppercase tracking-wider border-[#073a2d] text-[#073a2d] hover:bg-[#073a2d] hover:text-white"
                  >
                    Apply
                  </Button>
                </form>
              )}
            </div>

            {/* Price Calculations */}
            <div className="space-y-1.5 text-xs text-[#69726d] font-sans">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-[#1b1c18] tabular-nums">
                  ৳{subtotal.toLocaleString()}
                </span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-[#073a2d]">
                  <span>Promotional Discount</span>
                  <span className="font-semibold tabular-nums">-৳{discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Nationwide Delivery</span>
                <span className="font-semibold tabular-nums text-[#1b1c18]">
                  {shippingFee === 0 ? (
                    <span className="text-[#073a2d] uppercase text-[10px] tracking-wider">Free</span>
                  ) : (
                    `৳${shippingFee}`
                  )}
                </span>
              </div>
              <Separator className="my-2 bg-[#deddd3]" />
              <div className="flex justify-between text-base font-bold text-[#073a2d]">
                <span className="font-serif">Estimated Total</span>
                <span className="tabular-nums">৳{total.toLocaleString()}</span>
              </div>
              <p className="text-[10px] text-[#717975] text-right">
                All prices inclusive of VAT & local crafting taxes
              </p>
            </div>

            {/* Proceed to Checkout Button */}
            <Link
              href="/checkout"
              onClick={() => setIsCartOpen(false)}
              className={cn(
                buttonVariants({ variant: 'default' }),
                'w-full bg-[#073a2d] hover:bg-[#0d4d3b] text-[#fbf9f2] font-sans uppercase tracking-[0.16em] text-xs h-13 py-4 shadow-md flex items-center justify-center gap-2 group'
              )}
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <div className="flex items-center justify-center gap-2 text-[11px] text-[#69726d] pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#073a2d]" />
              <span>Authentic Open-Box Verification & Easy Exchanges</span>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};
