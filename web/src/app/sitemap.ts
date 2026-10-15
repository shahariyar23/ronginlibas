import type { MetadataRoute } from 'next';
import type { Product } from '@/types';
import { getShopProducts, getStorefrontCategories, getCollections } from '@/lib/api';
import { getCanonicalUrl } from '@/lib/seo';

export const revalidate = 3600; // Revalidate at most once every hour

function parseDateSafely(val?: string | Date | null): Date | undefined {
  if (!val) return undefined;
  const d = new Date(val);
  return isNaN(d.getTime()) ? undefined : d;
}

async function getAllProductsForSitemap(): Promise<Product[]> {
  const allProducts: Product[] = [];
  let page = 1;
  const limit = 100;
  let hasMore = true;

  while (hasMore) {
    try {
      const result = await getShopProducts({ page, limit });
      const items = result?.items ?? [];
      allProducts.push(...items);
      if (
        !result?.meta ||
        !result.meta.hasNext ||
        items.length === 0 ||
        allProducts.length >= result.meta.total
      ) {
        hasMore = false;
      } else {
        page++;
      }
    } catch {
      hasMore = false;
    }
  }

  return allProducts;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sitemapEntries = new Map<string, MetadataRoute.Sitemap[number]>();

  const addEntry = (entry: MetadataRoute.Sitemap[number]) => {
    if (!entry.url) return;
    const canonical = getCanonicalUrl(entry.url);
    const existing = sitemapEntries.get(canonical);
    if (existing && existing.lastModified && entry.lastModified) {
      const existingTime = new Date(existing.lastModified).getTime();
      const entryTime = new Date(entry.lastModified).getTime();
      if (entryTime > existingTime) {
        sitemapEntries.set(canonical, { ...entry, url: canonical });
      }
    } else {
      sitemapEntries.set(canonical, { ...entry, url: canonical });
    }
  };

  // 1. Fetch live database records concurrently
  const [categoriesResult, collectionsResult, productsResult] = await Promise.allSettled([
    getStorefrontCategories(),
    getCollections(),
    getAllProductsForSitemap(),
  ]);

  const categories = categoriesResult.status === 'fulfilled' ? categoriesResult.value || [] : [];
  const collections = collectionsResult.status === 'fulfilled' ? collectionsResult.value || [] : [];
  const products = productsResult.status === 'fulfilled' ? productsResult.value || [] : [];

  // Determine latest catalog modification date for core landing pages
  let latestCatalogUpdate: Date | undefined;
  for (const p of products) {
    const d = parseDateSafely(p.updatedAt);
    if (d && (!latestCatalogUpdate || d.getTime() > latestCatalogUpdate.getTime())) {
      latestCatalogUpdate = d;
    }
  }

  // 2. Core Hubs: Homepage and Menswear Hub
  addEntry({
    url: getCanonicalUrl('/'),
    lastModified: latestCatalogUpdate,
    changeFrequency: 'daily',
    priority: 1.0,
  });

  addEntry({
    url: getCanonicalUrl('/men'),
    lastModified: latestCatalogUpdate,
    changeFrequency: 'daily',
    priority: 0.95,
  });

  // 3. Category Hubs (/men/[category])
  // Strict canonical category architecture - excludes legacy /categories/[slug]
  for (const cat of categories) {
    if (cat.isActive === false || !cat.slug) continue;
    const catDate = parseDateSafely(cat.updatedAt) || latestCatalogUpdate;
    addEntry({
      url: getCanonicalUrl(`/men/${cat.slug}`),
      lastModified: catDate,
      changeFrequency: 'weekly',
      priority: 0.85,
    });
  }

  // 4. Collections (/collections/[slug])
  // Only public, active collections intended for search indexation
  for (const col of collections) {
    if (col.isActive === false || !col.slug) continue;
    const colDate = parseDateSafely(col.updatedAt) || latestCatalogUpdate;
    addEntry({
      url: getCanonicalUrl(`/collections/${col.slug}`),
      lastModified: colDate,
      changeFrequency: 'weekly',
      priority: 0.85,
    });
  }

  // Fallback if database collections list is empty
  if (collections.length === 0) {
    const fallbackCollectionSlugs = ['new-arrivals', 'bestsellers', 'featured', 'essential'];
    for (const slug of fallbackCollectionSlugs) {
      addEntry({
        url: getCanonicalUrl(`/collections/${slug}`),
        lastModified: latestCatalogUpdate,
        changeFrequency: 'weekly',
        priority: 0.85,
      });
    }
  }

  // 5. Products (/products/[slug])
  // Only public, active, non-archived storefront products with valid slugs
  for (const p of products) {
    if (!p.slug || p.isActive === false || p.deletedAt) continue;
    const productDate = parseDateSafely(p.updatedAt) || parseDateSafely(p.createdAt);
    addEntry({
      url: getCanonicalUrl(`/products/${p.slug}`),
      lastModified: productDate,
      changeFrequency: 'weekly',
      priority: 0.75,
    });
  }

  // 6. Promotional Landing: Offers (/offers)
  addEntry({
    url: getCanonicalUrl('/offers'),
    lastModified: latestCatalogUpdate,
    changeFrequency: 'weekly',
    priority: 0.7,
  });

  // 7. Trust, Legal & Atelier Policy Pages
  const staticDocDate = new Date('2026-10-12T00:00:00.000Z');

  addEntry({
    url: getCanonicalUrl('/terms'),
    lastModified: staticDocDate,
    changeFrequency: 'monthly',
    priority: 0.5,
  });

  addEntry({
    url: getCanonicalUrl('/privacy'),
    lastModified: staticDocDate,
    changeFrequency: 'monthly',
    priority: 0.5,
  });

  addEntry({
    url: getCanonicalUrl('/data-deletion'),
    lastModified: staticDocDate,
    changeFrequency: 'yearly',
    priority: 0.3,
  });

  return Array.from(sitemapEntries.values());
}
