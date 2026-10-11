import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getProducts } from '@/lib/api';
import { ProductCard } from '@/components/shop/ProductCard';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
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

  // Do not index empty collections
  if (products.length === 0) {
    notFound();
  }

  const breadcrumbs = [
    { label: 'Collections', href: '/shop' },
    { label: config.title },
  ];

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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Breadcrumbs items={breadcrumbs} />

        {/* Collection Header */}
        <header className="mb-10 text-center max-w-3xl mx-auto pt-4">
          <span className="font-sans text-[11px] uppercase tracking-[0.2em] text-[#c79a45] font-semibold block mb-2">
            {config.tagline}
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#073a2d] tracking-tight">
            {config.title}
          </h1>
          <p className="mt-4 text-sm sm:text-base text-[#404945] font-sans leading-relaxed">
            {config.description}
          </p>

          {/* Collection Switcher Links for Internal Crawlability */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            {Object.entries(COLLECTION_DEFINITIONS).map(([colSlug, def]) => {
              const isCurrent = colSlug === slug;
              return (
                <Link
                  key={colSlug}
                  href={`/collections/${colSlug}`}
                  className={`text-xs font-sans uppercase tracking-wider px-3.5 py-1.5 transition-all ${
                    isCurrent
                      ? 'bg-[#073a2d] text-white font-semibold'
                      : 'bg-white border border-[#deddd3] text-[#404945] hover:border-[#073a2d] hover:text-[#073a2d]'
                  }`}
                >
                  {def.title}
                </Link>
              );
            })}
          </div>
        </header>

        {/* Products Grid */}
        <div>
          <div className="flex items-center justify-between border-b border-[#deddd3] pb-3 mb-6 text-xs text-[#717975] font-sans uppercase tracking-wider">
            <span>{products.length} {products.length === 1 ? 'Garment' : 'Garments'} Curated</span>
            <span>Bespoke Handcraft</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
