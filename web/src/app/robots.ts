import type { MetadataRoute } from 'next';
import { CANONICAL_BASE_URL } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/men',
          '/men/',
          '/products/',
          '/collections/',
          '/offers',
          '/about',
          '/contact',
          '/shipping',
          '/returns',
          '/faq',
          '/press',
          '/journal',
          '/journal/',
          '/terms',
          '/privacy',
          '/data-deletion',
          '/shop', // Crawlable so Google sees canonical & noindex directives
          '/assets/',
          '/_next/',
          '/logo.svg',
          '/logo.png',
          '/hero-model.jpg',
        ],
        disallow: [
          '/admin',
          '/admin/',
          '/account',
          '/account/',
          '/checkout',
          '/checkout/',
          '/cart',
          '/cart/',
          '/login',
          '/register',
          '/forgot-password',
          '/reset-password',
          '/profile',
          '/profile/',
          '/orders',
          '/orders/',
          '/track-order',
          '/track-order/',
          '/private/',
          '/internal/',
          '/api/',
        ],
      },
    ],
    sitemap: `${CANONICAL_BASE_URL}/sitemap.xml`,
  };
}
