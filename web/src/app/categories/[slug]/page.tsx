import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCategoryBySlug, getProducts, getStorefrontCategories } from '@/lib/api';
import { ShopContent } from '@/app/shop/ShopContent';
import { LogoLoader } from '@/components/common/LogoLoader';
import { SITE_CONFIG, generateBreadcrumbJsonLd } from '@/lib/seo';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const category = await getCategoryBySlug(slug);
    if (!category) {
      return {
        title: 'Category Not Found | Rongin Libas',
        robots: { index: false, follow: false },
      };
    }

    const title =
      category.seoTitle?.trim() ||
      `${category.name} | Rongin Libas — Bespoke Menswear`;

    const description =
      category.metaDescription?.trim() ||
      category.description ||
      `Explore our curated ${category.name} collection handcrafted in Dhaka with premium natural weaves.`;

    const canonical = `${SITE_CONFIG.url}/categories/${category.slug}`;

    return {
      title,
      description,
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

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;

  let category;
  try {
    category = await getCategoryBySlug(slug);
  } catch {
    notFound();
  }

  if (!category) {
    notFound();
  }

  const [products, allCategories] = await Promise.all([
    getProducts({ category: category.slug, limit: 48 }).catch(() => []),
    getStorefrontCategories().catch(() => []),
  ]);

  const siblingCategories = allCategories
    .filter((c) => c.isActive !== false)
    .map((c) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
    }));

  // CollectionPage & ItemList JSON-LD
  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: category.name,
    description: category.description || `${category.name} collection by Rongin Libas`,
    url: `${SITE_CONFIG.url}/categories/${category.slug}`,
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
    { name: 'Categories', url: '/shop' },
    { name: category.name, url: `/categories/${category.slug}` },
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
          basePath={`/categories/${category.slug}`}
          categoryConfig={{
            slug: category.slug,
            name: category.name,
            description: category.description || undefined,
            siblingCategories,
          }}
          forceFilter={{ category: category.slug }}
        />
      </Suspense>
    </div>
  );
}
