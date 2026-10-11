import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCategoryBySlug, getProducts, getStorefrontCategories } from '@/lib/api';
import { ProductCard } from '@/components/shop/ProductCard';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
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

  const breadcrumbs = [
    { label: 'Categories', href: '/shop' },
    { label: category.name },
  ];

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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Breadcrumbs items={breadcrumbs} />

        {/* Category Header */}
        <header className="mb-10 text-center max-w-3xl mx-auto pt-4">
          <span className="font-sans text-[11px] uppercase tracking-[0.2em] text-[#c79a45] font-semibold block mb-2">
            ATELIER CAPSULE
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#073a2d] tracking-tight">
            {category.name}
          </h1>
          {category.description && (
            <p className="mt-4 text-sm sm:text-base text-[#404945] font-sans leading-relaxed">
              {category.description}
            </p>
          )}

          {/* Sibling Category Pill Links for Crawlability */}
          {allCategories.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
              {allCategories.map((c) => {
                const isCurrent = c.slug === category.slug;
                return (
                  <Link
                    key={c.id}
                    href={`/categories/${c.slug}`}
                    className={`text-xs font-sans uppercase tracking-wider px-3.5 py-1.5 transition-all ${
                      isCurrent
                        ? 'bg-[#073a2d] text-white font-semibold'
                        : 'bg-white border border-[#deddd3] text-[#404945] hover:border-[#073a2d] hover:text-[#073a2d]'
                    }`}
                  >
                    {c.name}
                  </Link>
                );
              })}
            </div>
          )}
        </header>

        {/* Products Grid */}
        {products.length > 0 ? (
          <div>
            <div className="flex items-center justify-between border-b border-[#deddd3] pb-3 mb-6 text-xs text-[#717975] font-sans uppercase tracking-wider">
              <span>{products.length} {products.length === 1 ? 'Garment' : 'Garments'} Available</span>
              <span>Handcrafted in Dhaka</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-16 bg-white border border-[#deddd3] p-8 max-w-xl mx-auto">
            <h2 className="font-serif text-xl font-bold text-[#073a2d] mb-2">
              Capsule In Preparation
            </h2>
            <p className="text-sm text-[#717975] font-sans mb-6">
              New garments for this silhouette are currently being handcrafted. Explore our other capsules or browse the entire shop.
            </p>
            <Link
              href="/shop"
              className="inline-block bg-[#073a2d] text-white px-6 py-2.5 text-xs font-sans uppercase tracking-widest hover:bg-[#0a4d3c] transition-colors"
            >
              Browse All Menswear
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
