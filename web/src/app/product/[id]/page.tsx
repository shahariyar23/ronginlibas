import React from 'react';
import { ProductDetailClient } from './ProductDetailClient';

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  return <ProductDetailClient productId={id} />;
}
