import React from 'react';
import type { Metadata } from 'next';
import { getProducts, getStorefrontCategories } from '@/lib/api';
import { HomeContent } from './HomeContent';
import {
  SITE_CONFIG,
  generateOrganizationJsonLd,
  generateWebSiteJsonLd,
} from '@/lib/seo';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Rongin Libas | Cloth Your Identity — Aristocratic Menswear & Bespoke Panjabis',
  description:
    'Luxury Bangladeshi menswear atelier specializing in bespoke panjabis, mercerized knitwear, and architectural casual wear. Handcrafted in Dhaka.',
  alternates: {
    canonical: SITE_CONFIG.url,
  },
  openGraph: {
    title: 'Rongin Libas | Cloth Your Identity',
    description:
      'Aristocratic Menswear & Bespoke Panjabis handcrafted with ancestral Bengal weaves in Dhaka.',
    url: SITE_CONFIG.url,
    siteName: SITE_CONFIG.name,
    images: [{ url: `${SITE_CONFIG.url}/hero-model.jpg`, width: 1200, height: 1200, alt: 'Rongin Libas Atelier' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rongin Libas | Cloth Your Identity',
    description:
      'Aristocratic Menswear & Bespoke Panjabis handcrafted with ancestral Bengal weaves.',
    images: [`${SITE_CONFIG.url}/hero-model.jpg`],
  },
};

export default async function HomePage() {
  const [products, categories] = await Promise.all([
    getProducts({ limit: 100 }).catch(() => []),
    getStorefrontCategories().catch(() => []),
  ]);
  const organizationJsonLd = generateOrganizationJsonLd();
  const websiteJsonLd = generateWebSiteJsonLd();

  return (
    <>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <HomeContent initialProducts={products} categories={categories} />
    </>
  );
}
