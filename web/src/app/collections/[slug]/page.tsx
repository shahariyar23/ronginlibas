import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProducts } from '@/lib/api';
import { ShopContent, ForceFilter } from '@/app/shop/ShopContent';
import { LogoLoader } from '@/components/common/LogoLoader';
import { SITE_CONFIG, generateBreadcrumbJsonLd } from '@/lib/seo';

interface CollectionPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = 'force-dynamic';

const COLLECTION_DEFINITIONS: Record<
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
  const config = COLLECTION_DEFINITIONS[slug];

  if (!config) {
    return {
      title: 'Collection Not Found | Rongin Libas',
      robots: { index: false, follow: false },
    };
  }

  const title = `${config.title} | Rongin Libas — ${config.tagline}`;
  const canonical = `${SITE_CONFIG.url}/collections/${slug}`;

  return {
    title,
    description: config.description,
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
      description: config.description,
      url: canonical,
      siteName: SITE_CONFIG.name,
      images: [{ url: `${SITE_CONFIG.url}/hero-model.jpg`, width: 1200, height: 1200, alt: config.title }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: config.description,
      images: [`${SITE_CONFIG.url}/hero-model.jpg`],
    },
  };
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { slug } = await params;
  const config = COLLECTION_DEFINITIONS[slug];

  if (!config) {
    notFound();
  }

  const allProducts = await getProducts({ limit: 100 }).catch(() => []);
  const matchingProducts = allProducts.filter(config.filter);
  const products = matchingProducts.length > 0 ? matchingProducts : allProducts.slice(0, 12);

  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: config.title,
    description: config.description,
    url: `${SITE_CONFIG.url}/collections/${slug}`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: products.map((product, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `${SITE_CONFIG.url}/products/${product.slug}`,
        name: product.name,
      })),
    },
  };

  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: 'Collections', url: '/shop' },
    { name: config.title, url: `/collections/${slug}` },
  ]);

  const switcher = Object.entries(COLLECTION_DEFINITIONS).map(([colSlug, def]) => ({
    slug: colSlug,
    title: def.title,
    isCurrent: colSlug === slug,
  }));

  const forceFilter: ForceFilter = {
    newArrival: slug === 'new-arrivals',
    bestSeller: slug === 'bestsellers',
    featured: slug === 'featured',
  };

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
            title: config.title,
            tagline: config.tagline,
            description: config.description,
            switcher,
          }}
          forceFilter={forceFilter}
        />
      </Suspense>
    </div>
  );
}
