import { notFound, permanentRedirect } from 'next/navigation';
import { getProduct } from '@/lib/api';

interface ProductLegacyPageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = 'force-dynamic';

export default async function LegacyProductPage({ params }: ProductLegacyPageProps) {
  const { id } = await params;

  try {
    const product = await getProduct(id);
    if (product && product.slug) {
      permanentRedirect(`/products/${product.slug}`);
    }
  } catch {
    notFound();
  }

  notFound();
}
