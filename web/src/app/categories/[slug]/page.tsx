import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { getCategoryBySlug } from '@/lib/api';
import { SITE_CONFIG, getCanonicalUrl } from '@/lib/seo';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const category = await getCategoryBySlug(slug);
    if (!category || category.isActive === false) {
      return {
        title: 'Category Not Found | Rongin Libas',
        robots: { index: false, follow: false },
      };
    }

    const canonical = getCanonicalUrl(`/men/${category.slug}`);

    return {
      title: `${category.name} | Rongin Libas — Bespoke Menswear`,
      alternates: {
        canonical,
      },
      robots: {
        index: false,
        follow: true,
      },
    };
  } catch {
    return {
      title: 'Category Not Found | Rongin Libas',
      robots: { index: false, follow: false },
    };
  }
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
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

  const search = new URLSearchParams();
  Object.entries(rawParams).forEach(([k, v]) => {
    if (Array.isArray(v)) v.forEach((val) => search.append(k, val));
    else if (v) search.set(k, v);
  });
  const queryString = search.toString();

  permanentRedirect(`/men/${category.slug}${queryString ? `?${queryString}` : ''}`);
}

