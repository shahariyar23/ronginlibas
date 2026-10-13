'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Product, CartItem } from '@/types';
import { toast } from 'sonner';
import { apiRequest, getProduct } from '@/lib/api';
import { useAuth } from './AuthContext';
import { analytics } from '@/lib/analytics/client';

interface CartResponse {
  cartId: string | null;
  items: Array<{
    id: string;
    product: { id: string; slug: string; name: string; image?: { url?: string } | string | null };
    variant: { id: string; size: string; sizeLabel?: string | null; color: string };
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }>;
  subtotal: number;
  discountAmount?: number;
  deliveryCharge: number;
  total: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, size: string, color: string, qty?: number, customNotes?: string) => Promise<boolean>;
  removeFromCart: (productId: string, size: string, color: string) => Promise<boolean>;
  updateQuantity: (productId: string, size: string, color: string, quantity: number) => Promise<boolean>;
  clearCart: (showToast?: boolean) => Promise<boolean>;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  appliedCoupon: string | null;
  couponDiscountPercent: number;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  totalCount: number;
  cartId: string | null;
  isCartLoading: boolean;
  refreshCart: () => Promise<void>;
  restoreFromOrder: (orderId: string, phone?: string, trackingToken?: string) => Promise<boolean>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const CART_ID_KEY = 'rongin_cart_id';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [cartId, setCartId] = useState<string | null>(null);
  const [isCartLoading, setIsCartLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discount, setDiscount] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [shippingFee, setShippingFee] = useState(0);
  const [total, setTotal] = useState(0);

  const hydrateCart = useCallback(async (response: CartResponse) => {
    const hydrated = await Promise.all(
      response.items.map(async (item) => {
        const product = await getProduct(item.product.slug);
        const image =
          typeof item.product.image === 'string'
            ? item.product.image
            : item.product.image?.url;
        const resolvedProduct = image && product.images.length === 0
          ? { ...product, images: [image] }
          : product;
        return {
          product: resolvedProduct,
          selectedSize: item.variant.sizeLabel || item.variant.size,
          selectedColor: item.variant.color,
          quantity: item.quantity,
          cartItemId: item.id,
          variantId: item.variant.id,
        };
      }),
    );
    setItems(hydrated);
    setSubtotal(Number(response.subtotal));
    setDiscount(Number(response.discountAmount ?? 0));
    setShippingFee(Number(response.deliveryCharge));
    setTotal(Number(response.total));
  }, []);

  const refreshCart = useCallback(async () => {
    const query = cartId ? `?cartId=${encodeURIComponent(cartId)}` : '';
    const response = await apiRequest<CartResponse>(`/cart${query}`);
    if (response.cartId && response.cartId !== cartId) {
      setCartId(response.cartId);
      localStorage.setItem(CART_ID_KEY, response.cartId);
    }
    await hydrateCart(response);
  }, [cartId, hydrateCart]);

  useEffect(() => {
    if (isAuthLoading) return;
    let active = true;
    const initializeCart = async () => {
      setIsCartLoading(true);
      try {
        const guestCartId = localStorage.getItem(CART_ID_KEY) || undefined;
        let response: CartResponse;
        if (user && guestCartId) {
          response = await apiRequest<CartResponse>('/cart/merge', {
            method: 'POST',
            body: JSON.stringify({ cartId: guestCartId }),
          });
        } else {
          response = await apiRequest<CartResponse>('/cart', {
            method: 'POST',
            body: JSON.stringify({ cartId: user ? undefined : guestCartId }),
          });
        }
        if (!active) return;
        setCartId(response.cartId);
        if (response.cartId) localStorage.setItem(CART_ID_KEY, response.cartId);
        await hydrateCart(response);
      } catch (error) {
        if (active) {
          toast.error(error instanceof Error ? error.message : 'Could not load your cart.');
        }
      } finally {
        if (active) setIsCartLoading(false);
      }
    };
    void initializeCart();
    return () => {
      active = false;
    };
  }, [user?.id, isAuthLoading, hydrateCart]);

  const ensureCartId = async () => {
    if (cartId) return cartId;
    const response = await apiRequest<CartResponse>('/cart', {
      method: 'POST',
      body: JSON.stringify({}),
    });
    if (!response.cartId) throw new Error('The server did not create a cart.');
    setCartId(response.cartId);
    localStorage.setItem(CART_ID_KEY, response.cartId);
    await hydrateCart(response);
    return response.cartId;
  };

  const addToCart = async (
    product: Product,
    size: string,
    color: string,
    quantity = 1,
    _customNotes?: string,
  ): Promise<boolean> => {
    if (!user) {
      toast.error('First login please', {
        description: 'Please login first to add items to your cart.',
        action: {
          label: 'Login',
          onClick: () => {
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
          },
        },
      });
      return false;
    }

    const variant = product.variants?.find(
      (item) =>
        item.isActive !== false &&
        item.stock > 0 &&
        (item.sizeLabel || item.size) === size &&
        item.color === color,
    );
    if (!variant) {
      toast.error('That size and color are currently unavailable.');
      return false;
    }
    try {
      const id = await ensureCartId();
      const response = await apiRequest<CartResponse>('/cart/items', {
        method: 'POST',
        body: JSON.stringify({ cartId: id, variantId: variant.id, quantity }),
      });
      await hydrateCart(response);
      toast.success(`Added ${product.name} to your cart.`);
      setIsCartOpen(true);
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not add this item to your cart.');
      return false;
    }
  };

  const findItem = (productId: string, size: string, color: string) =>
    items.find(
      (item) =>
        item.product.id === productId &&
        item.selectedSize === size &&
        item.selectedColor === color,
    );

  const removeFromCart = async (productId: string, size: string, color: string): Promise<boolean> => {
    const item = findItem(productId, size, color);
    if (!item?.cartItemId) return false;
    try {
      const response = await apiRequest<CartResponse>(
        `/cart/items/${encodeURIComponent(item.cartItemId)}?cartId=${encodeURIComponent(cartId ?? '')}`,
        { method: 'DELETE' },
      );
      await hydrateCart(response);
      toast.success('Item removed from cart.');
      analytics.trackRemoveFromCart({
        pagePath: typeof window !== 'undefined' ? window.location.pathname : '/cart',
        productId: item.product.id,
        productName: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        size: item.selectedSize,
        color: item.selectedColor,
      });
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not remove this item.');
      return false;
    }
  };

  const updateQuantity = async (
    productId: string,
    size: string,
    color: string,
    quantity: number,
  ): Promise<boolean> => {
    if (quantity <= 0) {
      return await removeFromCart(productId, size, color);
    }
    const item = findItem(productId, size, color);
    if (!item?.cartItemId || !cartId) return false;
    try {
      const response = await apiRequest<CartResponse>(
        `/cart/items/${encodeURIComponent(item.cartItemId)}`,
        {
          method: 'PATCH',
          body: JSON.stringify({ cartId, quantity }),
        },
      );
      await hydrateCart(response);
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not update this quantity.');
      return false;
    }
  };

  const clearCart = async (showToast: boolean = true): Promise<boolean> => {
    if (!cartId) return false;
    try {
      const response = await apiRequest<CartResponse>(
        `/cart?cartId=${encodeURIComponent(cartId)}`,
        { method: 'DELETE' },
      );
      await hydrateCart(response);
      setAppliedCoupon(null);
      setDiscount(0);
      if (showToast) {
        toast.success('Cart cleared.');
      }
      return true;
    } catch (error) {
      if (showToast) {
        toast.error(error instanceof Error ? error.message : 'Could not clear your cart.');
      }
      return false;
    }
  };

  const applyCoupon = async (code: string) => {
    if (!items.length) {
      toast.error('Add an item before applying a coupon.');
      return false;
    }
    const couponItems = items
      .filter((item): item is CartItem & { variantId: string } => Boolean(item.variantId))
      .map((item) => ({ variantId: item.variantId, quantity: item.quantity }));
    try {
      const result = await apiRequest<{
        valid: boolean;
        code: string;
        discountAmount: number;
      }>('/coupons/validate', {
        method: 'POST',
        body: JSON.stringify({ code: code.trim().toUpperCase(), items: couponItems }),
      });
      if (!result.valid) throw new Error('This coupon is not valid for the current cart.');
      setAppliedCoupon(result.code);
      setDiscount(Number(result.discountAmount));
      setTotal(subtotal - Number(result.discountAmount) + shippingFee);
      toast.success(`Coupon ${result.code} applied.`);
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not validate the coupon.');
      return false;
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setDiscount(0);
    setTotal(subtotal + shippingFee);
  };

  const restoreFromOrder = async (
    orderId: string,
    phone?: string,
    trackingToken?: string,
  ): Promise<boolean> => {
    try {
      const response = await apiRequest<{
        cartId: string | null;
        items: any[];
        subtotal: number;
        discountAmount?: number;
        deliveryCharge: number;
        total: number;
      }>('/cart/restore-order', {
        method: 'POST',
        body: JSON.stringify({
          orderId,
          cartId: cartId || undefined,
          phone: phone || undefined,
          trackingToken: trackingToken || undefined,
        }),
      });
      const cartData = (response as any)?.data || response;
      if (cartData?.cartId && cartData.cartId !== cartId) {
        setCartId(cartData.cartId);
        localStorage.setItem(CART_ID_KEY, cartData.cartId);
      }
      await hydrateCart(cartData);
      toast.success('Items successfully restored to your cart.');
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not restore items from order.');
      return false;
    }
  };

  const couponDiscountPercent = subtotal > 0 ? Math.round((discount / subtotal) * 100) : 0;
  const totalCount = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        appliedCoupon,
        couponDiscountPercent,
        applyCoupon,
        removeCoupon,
        subtotal,
        discount,
        shippingFee,
        total,
        totalCount,
        cartId,
        isCartLoading,
        refreshCart,
        restoreFromOrder,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
}
