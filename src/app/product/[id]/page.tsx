import React from 'react';
import { notFound } from 'next/navigation';
import { PRODUCTS } from '@/data/products';
import { ProductDetailClient } from './ProductDetailClient';

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { id } = await params;
  const product = PRODUCTS.find((p) => p.id === id || p.slug === id);

  if (!product) {
    return { title: 'Product Not Found | Rongin Libas' };
  }

  return {
    title: `${product.name} | Rongin Libas — Bespoke Menswear`,
    description: product.description,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = PRODUCTS.find((p) => p.id === id || p.slug === id);

  if (!product) {
    notFound();
  }

  // Related products
  const related = PRODUCTS.filter((p) => p.id !== product.id && p.category === product.category).slice(0, 4);
  const fallbackRelated = PRODUCTS.filter((p) => p.id !== product.id).slice(0, 4);

  return (
    <ProductDetailClient
      product={product}
      relatedProducts={related.length >= 2 ? related : fallbackRelated}
    />
  );
}
