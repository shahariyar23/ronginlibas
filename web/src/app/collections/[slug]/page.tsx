import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCollection, getShopProducts, parseProductListQuery } from '@/lib/api';
import { ShopContent, ForceFilter } from '@/app/shop/ShopContent';
import { LogoLoader } from '@/components/common/LogoLoader';
import { SITE_CONFIG, generateBreadcrumbJsonLd, getCanonicalUrl, getFacetedRobotsDirectives, isFacetedOrFilteredQuery } from '@/lib/seo';

interface CollectionPageProps {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
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

export async function generateMetadata({ params, searchParams }: CollectionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const dbCollection = await getCollection(slug).catch(() => null);
  const fallback = FALLBACK_DEFINITIONS[slug];

  if (!dbCollection && !fallback) {
    return {
      title: 'Collection Not Found | Rongin Libas',
      robots: { index: false, follow: false },
    };
  }

  const rawParams = searchParams ? await searchParams : {};
  const isFaceted = isFacetedOrFilteredQuery(rawParams);

  const titleText = dbCollection?.seoTitle || dbCollection?.name || fallback?.title || 'Collection';
  const taglineText = dbCollection?.tagline || fallback?.tagline || 'ATELIER COLLECTION';
  const descriptionText =
    dbCollection?.metaDescription ||
    dbCollection?.description ||
    fallback?.description ||
    'Curated artisanal apparel collection.';

  const title = `${titleText} | Rongin Libas — ${taglineText}`;
  const canonical = getCanonicalUrl(`/collections/${slug}`);
  const imageUrl = dbCollection?.image || `${SITE_CONFIG.url}/hero-model.jpg`;

  return {
    title,
    description: descriptionText,
    alternates: {
      canonical,
    },
    robots: getFacetedRobotsDirectives(isFaceted),
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

export default async function CollectionPage({ params, searchParams }: CollectionPageProps) {
  const { slug } = await params;
  const rawParams = searchParams ? await searchParams : {};
  const dbCollection = await getCollection(slug).catch(() => null);

  const fallback = FALLBACK_DEFINITIONS[slug];

  if (!dbCollection && !fallback) {
    notFound();
  }

  const title = dbCollection?.name || fallback?.title || 'Collection';
  const tagline = dbCollection?.tagline || fallback?.tagline || 'ATELIER COLLECTION';
  const description = dbCollection?.description || fallback?.description || 'Curated luxury apparel collection.';

  // Force filter for legacy flags if standard slug, or collection filter
  const forceFilter: ForceFilter = {
    newArrival: slug === 'new-arrivals',
    bestSeller: slug === 'bestsellers',
    featured: slug === 'featured',
    collection: !['new-arrivals', 'bestsellers', 'featured'].includes(slug) ? slug : undefined,
  };

  const collectionQuery = parseProductListQuery(rawParams, forceFilter);
  const shopResult = await getShopProducts(collectionQuery).catch(() => null);

  const initialProducts = shopResult?.items ?? [];
  const initialPageMeta = shopResult?.meta;

  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: title,
    description,
    url: `${SITE_CONFIG.url}/collections/${slug}`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: initialProducts.map((product, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `${SITE_CONFIG.url}/products/${product.slug}`,
        name: product.name,
      })),
    },
  };

  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Men's Collection", url: '/men' },
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
          key={`/collections/${slug}`}
          basePath={`/collections/${slug}`}
          collectionConfig={{
            slug,
            title,
            tagline,
            description,
          }}
          forceFilter={forceFilter}
          initialProducts={shopResult ? initialProducts : undefined}
          initialPageMeta={initialPageMeta}
        />
      </Suspense>
    </div>
  );
}
