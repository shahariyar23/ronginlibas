import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProducts, getCollection, getCollections } from '@/lib/api';
import { ShopContent, ForceFilter } from '@/app/shop/ShopContent';
import { LogoLoader } from '@/components/common/LogoLoader';
import { SITE_CONFIG, generateBreadcrumbJsonLd } from '@/lib/seo';

interface CollectionPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = 'force-dynamic';

const FALLBACK_DEFINITIONS: Record<
  string,
  {
    title: string;
    tagline: string;
    description: string;
    filter: (p: import('@/types').Product) => boolean;
  }
> = {
  'new-arrivals': {
    title: 'New Arrivals',
    tagline: 'FRESH OFF THE LOOM',
    description:
      'The latest artisanal releases from the Rongin Libas atelier. Limited seasonal drops, hand-embroidered panjabis, and mercerized knitwear.',
    filter: (p) => Boolean(p.isNewArrival),
  },
  'bestsellers': {
    title: 'Best Sellers',
    tagline: 'TIMELESS DISTINCTION',
    description:
      'The definitive garments celebrated by discerning patrons across Bangladesh. Hand-selected for impeccable drape, fit, and ancestral quality.',
    filter: (p) => Boolean(p.isBestSeller),
  },
  'featured': {
    title: 'Featured Collection',
    tagline: 'CURATED DISTINCTION',
    description:
      'Masterpieces of Bengal sartorial tradition featuring royal emerald accents, mercerized textures, and bespoke silhouettes.',
    filter: (p) => Boolean(p.featured),
  },
  'essential': {
    title: 'Atelier Essentials',
    tagline: 'FOUNDATION WARDROBE',
    description:
      'Essential wardrobe staples designed for understated elegance, daily luxury, and lasting comfort.',
    filter: () => true,
  },
};

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const dbCollection = await getCollection(slug).catch(() => null);
  const fallback = FALLBACK_DEFINITIONS[slug];

  if (!dbCollection && !fallback) {
    return {
      title: 'Collection Not Found | Rongin Libas',
      robots: { index: false, follow: false },
    };
  }

  const titleText = dbCollection?.seoTitle || dbCollection?.name || fallback?.title || 'Collection';
  const taglineText = dbCollection?.tagline || fallback?.tagline || 'ATELIER COLLECTION';
  const descriptionText =
    dbCollection?.metaDescription ||
    dbCollection?.description ||
    fallback?.description ||
    'Curated artisanal apparel collection.';

  const title = `${titleText} | Rongin Libas — ${taglineText}`;
  const canonical = `${SITE_CONFIG.url}/collections/${slug}`;
  const imageUrl = dbCollection?.image || `${SITE_CONFIG.url}/hero-model.jpg`;

  return {
    title,
    description: descriptionText,
    alternates: {
      canonical,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
      },
    },
    openGraph: {
      title,
      description: descriptionText,
      url: canonical,
      siteName: SITE_CONFIG.name,
      images: [{ url: imageUrl, width: 1200, height: 1200, alt: titleText }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: descriptionText,
      images: [imageUrl],
    },
  };
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { slug } = await params;
  const [dbCollection, allCollections] = await Promise.all([
    getCollection(slug).catch(() => null),
    getCollections().catch(() => []),
  ]);

  const fallback = FALLBACK_DEFINITIONS[slug];

  if (!dbCollection && !fallback) {
    notFound();
  }

  const title = dbCollection?.name || fallback?.title || 'Collection';
  const tagline = dbCollection?.tagline || fallback?.tagline || 'ATELIER COLLECTION';
  const description = dbCollection?.description || fallback?.description || 'Curated luxury apparel collection.';

  // Build dynamic switcher from DB collections if available, else fallback
  const switcher =
    allCollections.length > 0
      ? allCollections.map((col) => ({
          slug: col.slug,
          title: col.name,
          isCurrent: col.slug === slug,
        }))
      : Object.entries(FALLBACK_DEFINITIONS).map(([colSlug, def]) => ({
          slug: colSlug,
          title: def.title,
          isCurrent: colSlug === slug,
        }));

  // Force filter for legacy flags if standard slug, or collection filter
  const forceFilter: ForceFilter = {
    newArrival: slug === 'new-arrivals',
    bestSeller: slug === 'bestsellers',
    featured: slug === 'featured',
  };

  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: title,
    description,
    url: `${SITE_CONFIG.url}/collections/${slug}`,
  };

  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: 'Collections', url: '/shop' },
    { name: title, url: `/collections/${slug}` },
  ]);

  return (
    <div className="w-full bg-[#fbf9f2] min-h-screen">
      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <Suspense fallback={<LogoLoader />}>
        <ShopContent
          basePath={`/collections/${slug}`}
          collectionConfig={{
            slug,
            title,
            tagline,
            description,
            switcher,
          }}
          forceFilter={forceFilter}
        />
      </Suspense>
    </div>
  );
}
