import React from 'react';
import { ProductDetailClient } from './ProductDetailClient';
import { getProduct, getRelatedProducts, getRecommendations, getProductReviews } from '@/lib/api';
import type { Product } from '@/types';
import type { ProductReviewsResponse } from '@/lib/api';

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = 'force-dynamic';

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  let product: Product | undefined;
  let relatedProducts: Product[] = [];
  let recommendations: Product[] = [];
  let initialReviews: ProductReviewsResponse | undefined;

  try {
    const [loadedProduct, related, recs, revs] = await Promise.all([
      getProduct(id),
      getRelatedProducts(id).catch(() => []),
      getRecommendations(id).catch(() => []),
      getProductReviews(id).catch(() => undefined),
    ]);
    product = loadedProduct;
    relatedProducts = related;
    recommendations = recs;
    initialReviews = revs;
  } catch (error) {
    console.warn(`[ProductPage] Could not load product on server (${id}):`, error);
  }

  return (
    <ProductDetailClient
      productId={id}
      product={product}
      relatedProducts={relatedProducts}
      recommendations={recommendations}
      initialReviews={initialReviews}
    />
  );
}
