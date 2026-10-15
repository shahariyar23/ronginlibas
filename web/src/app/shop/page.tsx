import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { ShopContent } from './ShopContent';
import { LogoLoader } from '@/components/common/LogoLoader';
import { SITE_CONFIG, getCanonicalUrl } from '@/lib/seo';
import { getShopProducts, parseProductListQuery } from '@/lib/api';

interface ShopPageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    gender?: string;
    color?: string;
    size?: string;
    sort?: string;
    [key: string]: string | string[] | undefined;
  }>;
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ searchParams }: ShopPageProps): Promise<Metadata> {
  const params = await searchParams;
  const searchKeyword = (params.search || params.q || '').toString().trim();
  const hasSearch = Boolean(searchKeyword);
  const categoryParam = params.category?.toString().trim();

  const title = hasSearch
    ? `Search Results for "${searchKeyword}" | Rongin Libas`
    : categoryParam && categoryParam !== 'all'
      ? `Men's ${categoryParam.replace(/[-_]+/g, ' ')} | Rongin Libas`
      : "Men's Collection | Rongin Libas — Bespoke Panjabis & Sartorial Menswear";

  const description =
    'Browse handcrafted Bangladeshi panjabis, mercerized Egyptian cotton polos, and tailored trousers from the Rongin Libas atelier.';

  // Canonical destination: if category is specified, point to semantic category hub. Otherwise point to /men.
  const canonical = categoryParam && categoryParam !== 'all'
    ? getCanonicalUrl(`/men/${encodeURIComponent(categoryParam)}`)
    : getCanonicalUrl('/men');

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    robots: {
      // Filter combinations and query searches should not be indexed as standalone landing pages
      index: false,
      follow: true,
      googleBot: {
        index: false,
        follow: true,
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_CONFIG.name,
      images: [{ url: `${SITE_CONFIG.url}/hero-model.jpg`, width: 1200, height: 1200, alt: 'Rongin Libas Catalogue' }],
      type: 'website',
    },
  };
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const rawParams = searchParams ? await searchParams : {};
  const query = parseProductListQuery(rawParams);
  const initialShopData = await getShopProducts(query).catch(() => null);

  return (
    <Suspense fallback={<LogoLoader />}>
      <ShopContent
        initialProducts={initialShopData?.items}
        initialPageMeta={initialShopData?.meta}
      />
    </Suspense>
  );
}
