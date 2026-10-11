'use client';

import React, { useState } from 'react';
import { HeroBanner } from '@/components/home/HeroBanner';
import { TrustBadges } from '@/components/home/TrustBadges';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { ProductGridSection } from '@/components/home/ProductGridSection';
import { EditorialBanner } from '@/components/home/EditorialBanner';
import { CraftStory } from '@/components/home/CraftStory';
import { InstagramFeed } from '@/components/home/InstagramFeed';
import { Newsletter } from '@/components/home/Newsletter';
import type { Product } from '@/types';

interface HomeContentProps {
  initialProducts: Product[];
}

export function HomeContent({ initialProducts }: HomeContentProps) {
  const [products] = useState<Product[]>(initialProducts);

  const newArrivals = products.filter((product) => product.isNewArrival);
  const bestSellers = products.filter((product) => product.isBestSeller);
  const displayNewArrivals = newArrivals.length > 0 ? newArrivals : products.slice(0, 4);
  const displayBestSellers = bestSellers.length > 0 ? bestSellers : products.slice(0, 4);

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
        products={displayNewArrivals}
        viewAllLink="/collections/new-arrivals"
        bgLight={true}
      />

      {/* 5. Editorial Spotlight */}
      <EditorialBanner />

      {/* 6. Best Sellers */}
      <ProductGridSection
        title="BEST SELLERS"
        subtitle="The iconic pieces most celebrated by our patrons across Dhaka, Chattogram, and beyond."
        tagline="PROVEN EXCELLENCE"
        products={displayBestSellers}
        viewAllLink="/collections/bestsellers"
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
