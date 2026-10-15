import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCategoryBySlug, getShopProducts, getStorefrontCategories, parseProductListQuery } from '@/lib/api';
import { ShopContent } from '@/app/shop/ShopContent';
import { LogoLoader } from '@/components/common/LogoLoader';
import { SITE_CONFIG, generateBreadcrumbJsonLd, getCanonicalUrl, getFacetedRobotsDirectives, isFacetedOrFilteredQuery } from '@/lib/seo';

interface MenCategoryPageProps {
  params: Promise<{ category: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params, searchParams }: MenCategoryPageProps): Promise<Metadata> {
  const { category: slug } = await params;
  try {
    const category = await getCategoryBySlug(slug);
    if (!category || category.isActive === false) {
      return {
        title: 'Category Not Found | Rongin Libas',
        robots: { index: false, follow: false },
      };
    }

    const rawParams = searchParams ? await searchParams : {};
    const isFaceted = isFacetedOrFilteredQuery(rawParams);

    const title =
      category.seoTitle?.trim() ||
      `Men's ${category.name} | Rongin Libas — Bespoke Menswear`;

    const description =
      category.metaDescription?.trim() ||
      category.description ||
      `Explore our handcrafted Men's ${category.name} collection by Rongin Libas. Tailored in Dhaka using premium natural weaves.`;

    const canonical = getCanonicalUrl(`/men/${category.slug}`);

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
        images: category.image ? [{ url: category.image }] : [{ url: `${SITE_CONFIG.url}/hero-model.jpg` }],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: category.image ? [category.image] : [`${SITE_CONFIG.url}/hero-model.jpg`],
      },
    };
  } catch {
    return {
      title: 'Category Not Found | Rongin Libas',
      robots: { index: false, follow: false },
    };
  }
}

export default async function MenCategoryPage({ params, searchParams }: MenCategoryPageProps) {
  const { category: slug } = await params;
  const rawParams = searchParams ? await searchParams : {};

  let category;
  try {
    category = await getCategoryBySlug(slug);
  } catch {
    notFound();
  }

  if (!category || category.isActive === false) {
    notFound();
  }

  const categoryQuery = parseProductListQuery(rawParams, { category: category.slug, gender: 'MEN' });

  const [shopResult, allCategories] = await Promise.all([
    getShopProducts(categoryQuery).catch(() => null),
    getStorefrontCategories().catch(() => []),
  ]);

  const siblingCategories = allCategories
    .filter((c) => c.isActive !== false)
    .map((c) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
    }));

  const initialProducts = shopResult?.items ?? [];
  const initialPageMeta = shopResult?.meta;

  // CollectionPage & ItemList JSON-LD
  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `Men's ${category.name}`,
    description: category.description || `Men's ${category.name} collection by Rongin Libas`,
    url: getCanonicalUrl(`/men/${category.slug}`),
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

  // Breadcrumbs: Home -> Men -> [Category]
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: 'Men', url: '/men' },
    { name: category.name, url: `/men/${category.slug}` },
  ]);

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
          key={`/men/${category.slug}`}
          basePath={`/men/${category.slug}`}
          categoryConfig={{
            slug: category.slug,
            name: `Men's ${category.name}`,
            description: category.description || undefined,
            siblingCategories,
          }}
          forceFilter={{ category: category.slug }}
          initialProducts={shopResult ? initialProducts : undefined}
          initialPageMeta={initialPageMeta}
        />
      </Suspense>
    </div>
  );
}
