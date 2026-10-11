import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { ShopContent } from './ShopContent';
import { LogoLoader } from '@/components/common/LogoLoader';
import { SITE_CONFIG } from '@/lib/seo';

interface ShopPageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    gender?: string;
    color?: string;
    size?: string;
    sort?: string;
  }>;
}

export async function generateMetadata({ searchParams }: ShopPageProps): Promise<Metadata> {
  const params = await searchParams;
  const hasSearch = Boolean(params.search?.trim());
  const hasFilters = Boolean(params.category || params.color || params.size || params.gender);

  const title = hasSearch
    ? `Search Results for "${params.search}" | Rongin Libas`
    : "Men's Collection | Rongin Libas — Bespoke Panjabis & Sartorial Menswear";

  const description =
    'Browse handcrafted Bangladeshi panjabis, mercerized Egyptian cotton polos, and tailored trousers from the Rongin Libas atelier.';

  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_CONFIG.url}/shop`,
    },
    robots: {
      // Internal search queries or faceted filters should not be indexed as duplicate landing pages
      index: !hasSearch && !hasFilters,
      follow: true,
    },
    openGraph: {
      title,
      description,
      url: `${SITE_CONFIG.url}/shop`,
      siteName: SITE_CONFIG.name,
      images: [{ url: `${SITE_CONFIG.url}/hero-model.jpg`, width: 1200, height: 1200, alt: 'Rongin Libas Catalogue' }],
      type: 'website',
    },
  };
}

export default function ShopPage() {
  return (
    <Suspense fallback={<LogoLoader />}>
      <ShopContent />
    </Suspense>
  );
}
