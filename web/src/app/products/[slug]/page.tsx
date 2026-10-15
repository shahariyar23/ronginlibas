import React from 'react';
import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { getProduct, getRelatedProducts, getProductReviews } from '@/lib/api';
import type { Product } from '@/types';
import type { ProductReviewsResponse } from '@/lib/api';
import { ProductDetailClient } from '@/app/product/[id]/ProductDetailClient';
import {
  generateProductMetadata,
  generateProductJsonLd,
  generateBreadcrumbJsonLd,
} from '@/lib/seo';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const product = await getProduct(slug);
    if (!product || product.isRedirect) {
      return {
        title: 'Garment Relocated | Rongin Libas',
        robots: { index: false, follow: false },
      };
    }
    return generateProductMetadata(product);
  } catch {
    return {
      title: 'Garment Not Found | Rongin Libas',
      robots: { index: false, follow: false },
    };
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  let product: Product | undefined;
  try {
    product = await getProduct(slug);
  } catch {
    notFound();
  }

  if (!product) {
    notFound();
  }

  // Handle persistent 301 slug redirect if old slug or redirect target was hit
  if (product.isRedirect && product.redirectTargetSlug) {
    permanentRedirect(`/products/${product.redirectTargetSlug}`);
  }

  // If the product was accessed via an ID or outdated slug, 301 redirect to canonical slug
  if (product.slug && product.slug !== slug) {
    permanentRedirect(`/products/${product.slug}`);
  }

  // Parallel fetch reviews and related products
  let relatedProducts: Product[] = [];
  let initialReviews: ProductReviewsResponse | undefined;

  try {
    const [related, reviews] = await Promise.all([
      getRelatedProducts(product.slug).catch(() => []),
      getProductReviews(product.slug).catch(() => undefined),
    ]);
    relatedProducts = related;
    initialReviews = reviews;
  } catch {
    // Graceful fallback
  }

  // Generate server-rendered JSON-LD structured data
  const productJsonLd = generateProductJsonLd(product, initialReviews);
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    {
      name: 'Men',
      url: '/men',
    },
    {
      name: product.categoryLabel || 'Collection',
      url: `/men/${product.category || 'panjabi'}`,
    },
    {
      name: product.name,
      url: `/products/${product.slug}`,
    },
  ]);

  return (
    <div className="w-full">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />



      {/* Product Detail Interactive Application */}
      <ProductDetailClient
        productId={product.id}
        product={product}
        relatedProducts={relatedProducts}
        initialReviews={initialReviews}
      />
    </div>
  );
}
