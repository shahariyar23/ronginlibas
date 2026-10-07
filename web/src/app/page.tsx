'use client';

import React, { useEffect, useState } from 'react';
import { HeroBanner } from '@/components/home/HeroBanner';
import { TrustBadges } from '@/components/home/TrustBadges';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { ProductGridSection } from '@/components/home/ProductGridSection';
import { EditorialBanner } from '@/components/home/EditorialBanner';
import { CraftStory } from '@/components/home/CraftStory';
import { InstagramFeed } from '@/components/home/InstagramFeed';
import { Newsletter } from '@/components/home/Newsletter';
import type { Product } from '@/types';
import { getProducts } from '@/lib/api';
import { toast } from 'sonner';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    let active = true;
    getProducts({ limit: 100 })
      .then((data) => {
        if (active) setProducts(data);
      })
      .catch((error: unknown) => {
        if (active) toast.error(error instanceof Error ? error.message : 'Could not load products.');
      });
    return () => {
      active = false;
    };
  }, []);

  const newArrivals = products.filter((product) => product.isNewArrival);
  const bestSellers = products.filter((product) => product.isBestSeller);

  return (
    <div className="flex flex-col w-full">
      {/* 1. Hero Showcase */}
      <HeroBanner />

      {/* 2. Trust & Craftsmanship Strip */}
      <TrustBadges />

      {/* 3. Shop by Category */}
      <CategoryGrid />

      {/* 4. New Arrivals */}
      <ProductGridSection
        title="NEW ARRIVALS"
        subtitle="Discover the latest artisanal cuts, silk blends, and seasonal drops from Rongin Libas."
        tagline="FRESH OFF THE LOOM"
        products={newArrivals}
        viewAllLink="/shop?filter=new"
        bgLight={true}
      />

      {/* 5. Editorial Spotlight */}
      <EditorialBanner />

      {/* 6. Best Sellers */}
      <ProductGridSection
        title="BEST SELLERS"
        subtitle="The iconic pieces most celebrated by our patrons across Dhaka, Chattogram, and beyond."
        tagline="PROVEN EXCELLENCE"
        products={bestSellers}
        viewAllLink="/shop?filter=bestseller"
        bgLight={false}
      />

      {/* 7. Craftsmanship & Philosophy */}
      <CraftStory />

      {/* 8. Instagram Editorial Community */}
      <InstagramFeed />

      {/* 9. VIP Guild Newsletter */}
      <Newsletter />
    </div>
  );
}
