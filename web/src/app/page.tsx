import React from 'react';
import { HeroBanner } from '@/components/home/HeroBanner';
import { TrustBadges } from '@/components/home/TrustBadges';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { ProductGridSection } from '@/components/home/ProductGridSection';
import { EditorialBanner } from '@/components/home/EditorialBanner';
import { CraftStory } from '@/components/home/CraftStory';
import { InstagramFeed } from '@/components/home/InstagramFeed';
import { Newsletter } from '@/components/home/Newsletter';
import { PRODUCTS } from '@/data/products';

export default function HomePage() {
  const newArrivals = PRODUCTS.filter((p) => p.isNewArrival);
  const bestSellers = PRODUCTS.filter((p) => p.isBestSeller);

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
        products={newArrivals.length >= 4 ? newArrivals : PRODUCTS.slice(0, 4)}
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
        products={bestSellers.length >= 4 ? bestSellers : PRODUCTS.slice(4, 8)}
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
