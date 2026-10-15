import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { getShopProducts, parseProductListQuery } from '@/lib/api';
import { ShopContent } from '@/app/shop/ShopContent';
import { LogoLoader } from '@/components/common/LogoLoader';
import { SITE_CONFIG, generateBreadcrumbJsonLd, getCanonicalUrl, getFacetedRobotsDirectives, isFacetedOrFilteredQuery } from '@/lib/seo';

interface MenPageProps {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ searchParams }: MenPageProps): Promise<Metadata> {
  const rawParams = searchParams ? await searchParams : {};
  const isFaceted = isFacetedOrFilteredQuery(rawParams);

  const title = "Men's Sartorial Collection | Rongin Libas — Bespoke Menswear Dhaka";
  const description =
    "Explore handcrafted Bangladeshi menswear by Rongin Libas. Tailored panjabis, mercerized Egyptian cotton polos, formal shirts, and pleated trousers crafted in Dhaka.";
  const canonical = getCanonicalUrl('/men');

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    robots: getFacetedRobotsDirectives(isFaceted),
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_CONFIG.name,
      images: [{ url: `${SITE_CONFIG.url}/hero-model.jpg`, width: 1200, height: 1200, alt: "Rongin Libas Men's Collection" }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${SITE_CONFIG.url}/hero-model.jpg`],
    },
  };
}

export default async function MenPage({ searchParams }: MenPageProps) {
  const rawParams = searchParams ? await searchParams : {};
  const query = parseProductListQuery(rawParams, { gender: 'MEN' });

  const shopResult = await getShopProducts(query).catch(() => null);
  const initialProducts = shopResult?.items ?? [];
  const initialPageMeta = shopResult?.meta;

  // Breadcrumb structured data: Home -> Men
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Men's Collection", url: '/men' },
  ]);

  // CollectionPage & ItemList JSON-LD
  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: "Men's Sartorial Collection",
    description:
      "Handcrafted Bangladeshi menswear by Rongin Libas atelier. Tailored panjabis, mercerized knitwear, Egyptian cotton shirts, and architectural bottom wear.",
    url: getCanonicalUrl('/men'),
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

  return (
    <div className="w-full bg-[#fbf9f2] min-h-screen">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />


      {/* Step 3 Server-Rendered Product Grid */}
      <Suspense fallback={<LogoLoader />}>
        <ShopContent
          key="/men"
          basePath="/men"
          initialProducts={shopResult ? initialProducts : undefined}
          initialPageMeta={initialPageMeta}
        />
      </Suspense>
    </div>
  );
}
