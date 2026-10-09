'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { apiRequest } from '@/lib/api';
import { useAuth } from './AuthContext';

interface WishlistContextType {
  wishlist: string[];
  toggleWishlist: (productId: string, productName?: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  isItemLoading: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);
const WISHLIST_KEY = 'rongin_wishlist';

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isLoading) return;
    let active = true;
    const loadWishlist = async () => {
      try {
        if (user) {
          const guestItems = JSON.parse(localStorage.getItem(WISHLIST_KEY) || '[]') as string[];
          for (const productId of guestItems) {
            await apiRequest(`/wishlist/items/${encodeURIComponent(productId)}`, { method: 'POST' });
          }
          const data = await apiRequest<Array<{ product: { id: string } }>>('/wishlist');
          if (active) {
            setWishlist(data.map((item) => item.product.id));
            localStorage.removeItem(WISHLIST_KEY);
          }
        } else {
          const data = JSON.parse(localStorage.getItem(WISHLIST_KEY) || '[]') as unknown;
          if (active) setWishlist(Array.isArray(data) ? data.filter((id): id is string => typeof id === 'string') : []);
        }
      } catch (error) {
        if (active) toast.error(error instanceof Error ? error.message : 'Could not load your wishlist.');
      }
    };
    void loadWishlist();
    return () => {
      active = false;
    };
  }, [user?.id, isLoading]);

  const toggleWishlist = async (productId: string, productName?: string) => {
    if (loadingIds.has(productId)) return;
    setLoadingIds((prev) => new Set(prev).add(productId));
    const exists = wishlist.includes(productId);
    try {
      if (user) {
        await apiRequest(`/wishlist/items/${encodeURIComponent(productId)}`, {
          method: exists ? 'DELETE' : 'POST',
        });
      }
      const next = exists
        ? wishlist.filter((id) => id !== productId)
        : [...wishlist, productId];
      setWishlist(next);
      if (!user) localStorage.setItem(WISHLIST_KEY, JSON.stringify(next));
      toast[exists ? 'info' : 'success'](
        exists
          ? productName ? `Removed ${productName} from wishlist` : 'Removed from wishlist'
          : productName ? `Saved ${productName} to wishlist` : 'Saved to wishlist',
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not update your wishlist.');
    } finally {
      setLoadingIds((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        toggleWishlist,
        isInWishlist: (productId) => wishlist.includes(productId),
        isItemLoading: (productId) => loadingIds.has(productId),
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within a WishlistProvider');
  return context;
}
