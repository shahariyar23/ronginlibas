'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import {
  getShopProducts,
  getStorefrontCategories,
  getStorefrontSettings,
} from '@/lib/api';
import type { StorefrontCategory, StorefrontSettings } from '@/lib/api';

interface StorefrontData {
  settings: StorefrontSettings | null;
  categories: StorefrontCategory[];
  womenAvailable: boolean;
}

interface StorefrontContextValue extends StorefrontData {
  isLoading: boolean;
}

const StorefrontContext = createContext<StorefrontContextValue | null>(null);
const CACHE_DURATION_MS = 60_000;
let cachedData: StorefrontData | null = null;
let cachedAt = 0;
let pendingRequest: Promise<StorefrontData> | null = null;

async function loadStorefrontData(retryCount = 0): Promise<StorefrontData> {
  const [settingsResult, categoriesResult, womenResult] = await Promise.allSettled([
    getStorefrontSettings(),
    getStorefrontCategories(),
    getShopProducts({ gender: 'WOMEN', limit: 1 }),
  ]);

  const hasCriticalFailure =
    settingsResult.status === 'rejected' || categoriesResult.status === 'rejected';

  // If critical storefront metadata failed (e.g. during a serverless DB cold-start), retry once
  if (hasCriticalFailure && retryCount === 0) {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return loadStorefrontData(retryCount + 1);
  }

  if (settingsResult.status === 'rejected') {
    console.warn('Could not load public store settings:', settingsResult.reason);
  }
  if (categoriesResult.status === 'rejected') {
    console.warn('Could not load storefront categories:', categoriesResult.reason);
  }
  if (womenResult.status === 'rejected') {
    console.warn('Could not check availability of women’s products:', womenResult.reason);
  }

  return {
    settings: settingsResult.status === 'fulfilled' ? settingsResult.value : null,
    categories: categoriesResult.status === 'fulfilled' ? categoriesResult.value : [],
    womenAvailable: womenResult.status === 'fulfilled' && womenResult.value.meta.total > 0,
  };
}

function getStorefrontData() {
  if (cachedData && Date.now() - cachedAt < CACHE_DURATION_MS) {
    return Promise.resolve(cachedData);
  }
  if (!pendingRequest) {
    pendingRequest = loadStorefrontData()
      .then((data) => {
        cachedData = data;
        cachedAt = Date.now();
        return data;
      })
      .finally(() => {
        pendingRequest = null;
      });
  }
  return pendingRequest;
}

export function StorefrontProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<StorefrontData>({
    settings: null,
    categories: [],
    womenAvailable: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const refreshData = async () => {
      try {
        const nextData = await getStorefrontData();
        if (active) setData(nextData);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    void refreshData();
    const interval = window.setInterval(() => {
      cachedAt = 0;
      void refreshData();
    }, CACHE_DURATION_MS);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  return (
    <StorefrontContext.Provider value={{ ...data, isLoading }}>
      {children}
    </StorefrontContext.Provider>
  );
}

export function useStorefront() {
  const context = useContext(StorefrontContext);
  if (!context) throw new Error('useStorefront must be used within StorefrontProvider');
  return context;
}

export function getWhatsAppUrl(phone: string, message?: string) {
  const digits = phone.replace(/\D/g, '');
  if (!digits) return '';
  const number = digits.startsWith('880')
    ? digits
    : digits.startsWith('0')
      ? `88${digits}`
      : `880${digits}`;
  const query = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${number}${query}`;
}
