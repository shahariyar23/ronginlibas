import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { OffersContent } from './OffersContent';
import { LogoLoader } from '@/components/common/LogoLoader';
import { SITE_CONFIG } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Best Clothing Offers & Discounts | Rongin Libas',
  description:
    "Shop the latest men's clothing offers, discounts and special deals from Rongin Libas.",
  alternates: {
    canonical: `${SITE_CONFIG.url}/offers`,
  },
  openGraph: {
    title: 'Best Clothing Offers & Discounts | Rongin Libas',
    description:
      "Shop the latest men's clothing offers, discounts and special deals from Rongin Libas.",
    url: `${SITE_CONFIG.url}/offers`,
    siteName: SITE_CONFIG.name,
    images: [
      {
        url: `${SITE_CONFIG.url}/hero-model.jpg`,
        width: 1200,
        height: 630,
        alt: 'Rongin Libas Special Offers',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Best Clothing Offers & Discounts | Rongin Libas',
    description:
      "Shop the latest men's clothing offers, discounts and special deals from Rongin Libas.",
    images: [`${SITE_CONFIG.url}/hero-model.jpg`],
  },
};

export default function OffersPage() {
  return (
    <Suspense
      fallback={<LogoLoader />}
    >
      <OffersContent />
    </Suspense>
  );
}
