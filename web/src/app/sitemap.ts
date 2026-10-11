import type { MetadataRoute } from 'next';
import { getProducts, getStorefrontCategories } from '@/lib/api';
import { SITE_CONFIG } from '@/lib/seo';

export const revalidate = 3600; // revalidate at most once every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // 1. Static high-priority core pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${SITE_CONFIG.url}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${SITE_CONFIG.url}/shop`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_CONFIG.url}/collections/new-arrivals`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.85,
    },
    {
      url: `${SITE_CONFIG.url}/collections/bestsellers`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.85,
    },
    {
      url: `${SITE_CONFIG.url}/collections/featured`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_CONFIG.url}/collections/essential`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];

  // 2. Dynamic Categories from database
  let categoryRoutes: MetadataRoute.Sitemap = [];
  try {
    const categories = await getStorefrontCategories();
    categoryRoutes = (categories || [])
      .filter((cat) => cat.isActive !== false)
      .map((cat) => ({
        url: `${SITE_CONFIG.url}/categories/${cat.slug}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.8,
      }));
  } catch {
    categoryRoutes = [];
  }

  // 3. Dynamic Products from database (only active, public products)
  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    const products = await getProducts({ limit: 1000 });
    productRoutes = (products || [])
      .filter((p) => p.slug)
      .map((p) => ({
        url: `${SITE_CONFIG.url}/products/${p.slug}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.7,
      }));
  } catch {
    productRoutes = [];
  }

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
