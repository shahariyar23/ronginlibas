import type { Metadata } from 'next';
import type { Product } from '@/types';
import type { ProductReviewsResponse } from '@/lib/api';

export const CANONICAL_BASE_URL = 'https://ronginlibas.com';

/**
 * Normalizes any route path or absolute URL into an authoritative, canonical URL.
 * Always resolves to the production origin (https://ronginlibas.com).
 * Enforces:
 * - HTTPS protocol
 * - Single canonical host (ronginlibas.com, never www or localhost)
 * - Trailing slash removal (except root '/')
 * - Query string and hash removal
 */
export function getCanonicalUrl(path = '/'): string {
  if (!path || path === '/') {
    return CANONICAL_BASE_URL;
  }

  let clean = path.trim();

  // If path is an absolute URL, extract its pathname
  if (clean.startsWith('http://') || clean.startsWith('https://')) {
    try {
      const parsed = new URL(clean);
      clean = parsed.pathname;
    } catch {
      clean = '/' + clean.replace(/^https?:\/\/[^/]+/i, '');
    }
  }

  // Strip query parameters and hash fragments
  clean = clean.split('?')[0].split('#')[0];

  // Ensure leading slash
  if (!clean.startsWith('/')) {
    clean = `/${clean}`;
  }

  // Strip trailing slashes (except root '/')
  if (clean.length > 1 && clean.endsWith('/')) {
    clean = clean.replace(/\/+$/, '');
  }

  if (clean === '' || clean === '/') {
    return CANONICAL_BASE_URL;
  }

  return `${CANONICAL_BASE_URL}${clean}`;
}

/**
 * Determines whether a URL state contains non-indexable search or faceted filter parameters.
 * Faceted parameters (size, color, fabric, fit, price, sort, search, q, or page combined with filters)
 * trigger { index: false, follow: true } to prevent index bloat while preserving link equity.
 */
export function isFacetedOrFilteredQuery(
  searchParams?: Record<string, string | string[] | undefined> | null
): boolean {
  if (!searchParams) return false;

  const facetedKeys = [
    'size',
    'color',
    'fabric',
    'fabricOrigin',
    'fit',
    'minPrice',
    'maxPrice',
    'price',
    'sort',
    'q',
    'search',
    'filter',
    'inStock',
    'offers',
    'bestSeller',
    'newArrival',
    'wishlist',
  ];

  return facetedKeys.some((key) => {
    const val = searchParams[key];
    if (Array.isArray(val)) return val.length > 0;
    return typeof val === 'string' && val.trim() !== '';
  });
}

/**
 * Generates appropriate robots directives for faceted or clean pages.
 */
export function getFacetedRobotsDirectives(
  isFaceted: boolean
): Metadata['robots'] {
  if (isFaceted) {
    return {
      index: false,
      follow: true,
      googleBot: {
        index: false,
        follow: true,
      },
    };
  }
  return {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
    },
  };
}

export const SITE_CONFIG = {
  name: 'Rongin Libas',
  legalName: 'Rongin Libas Atelier',
  tagline: 'CLOTH YOUR IDENTITY',
  secondaryTagline: 'Style. Comfort. Confidence. Everyday.',
  url: CANONICAL_BASE_URL,
  description:
    'Luxury Bangladeshi menswear atelier specializing in bespoke panjabis, mercerized knitwear, and architectural casual wear. Handcrafted in Dhaka.',
  logo: `${CANONICAL_BASE_URL}/logo.svg`,
  logoPng: `${CANONICAL_BASE_URL}/logo.png`,
  ogImage: `${CANONICAL_BASE_URL}/hero-model.jpg`,
  telephone: '01352926067',
  whatsapp: '01352926067',
  email: 'concierge@ronginlibas.com',
  pressEmail: 'concierge@ronginlibas.com',
  currency: 'BDT',
  country: 'BD',
  location: 'Dhaka, Bangladesh',
  colors: {
    primary: '#073A2D', // Primary Emerald
    deepEmerald: '#0D4D3B', // Deep Emerald
    accent: '#C79A45', // Imperial Gold
    parchment: '#F8F6EF', // Warm Ivory / Parchment
    borderOchre: '#DEDDD3', // Border Ochre
    mutedSlate: '#69726D', // Muted Slate
  },
  social: [
    'https://facebook.com/ronginlibas',
  ],
};

/**
 * Generate Next.js dynamic metadata for a single product page
 */
export function generateProductMetadata(product: Product): Metadata {
  const title =
    product.seoTitle?.trim() ||
    `${product.name} | Rongin Libas — Aristocratic Menswear`;

  const fallbackDescription =
    product.shortDescription ||
    (product.description ? product.description.slice(0, 155) : '') ||
    `Discover ${product.name} handcrafted by the Rongin Libas atelier with premium textiles and ancestral Bengal craftsmanship.`;

  const description = (product.metaDescription?.trim() || fallbackDescription).replace(/\s+/g, ' ').trim();

  const canonical = product.canonicalUrl?.trim()
    ? getCanonicalUrl(product.canonicalUrl)
    : getCanonicalUrl(`/products/${product.slug}`);

  const primaryImage =
    product.imageDetails?.[0]?.url || product.images?.[0] || `${CANONICAL_BASE_URL}/hero-model.jpg`;
  const primaryAlt =
    product.imageDetails?.[0]?.altText || `${product.name} by Rongin Libas`;

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
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_CONFIG.name,
      images: [
        {
          url: primaryImage,
          width: 1200,
          height: 1200,
          alt: primaryAlt,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [primaryImage],
    },
  };
}

/**
 * Generate schema.org JSON-LD structured data for a product.
 * Automatically branches to:
 * - ProductGroup: for apparel with true size/color variants
 * - Product: for individual standalone garments
 */
export function generateProductJsonLd(
  product: Product,
  reviewsResponse?: ProductReviewsResponse,
): Record<string, unknown> {
  const productUrl = getCanonicalUrl(`/products/${product.slug}`);
  const images = product.images.length > 0 ? product.images : [`${CANONICAL_BASE_URL}/hero-model.jpg`];

  // Evaluate genuine reviews and ratings
  const reviewCount = product.reviewsCount ?? reviewsResponse?.total ?? 0;
  const ratingValue = product.averageRating ?? reviewsResponse?.averageRating ?? 0;
  const hasValidReviews = reviewCount > 0 && ratingValue > 0;

  let aggregateRating: Record<string, unknown> | undefined;
  if (hasValidReviews) {
    aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: Number(ratingValue.toFixed(1)),
      reviewCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  const approvedReviews = reviewsResponse?.items ?? [];
  const reviewList =
    approvedReviews.length > 0
      ? approvedReviews.map((rev) => ({
          '@type': 'Review',
          author: {
            '@type': 'Person',
            name: rev.customerName || 'Verified Patron',
          },
          reviewRating: {
            '@type': 'Rating',
            ratingValue: rev.rating,
            bestRating: 5,
            worstRating: 1,
          },
          reviewBody: rev.comment,
          datePublished: rev.createdAt.split('T')[0],
        }))
      : undefined;

  // Determine whether true multi-variants exist
  const activeVariants = (product.variants || []).filter((v) => v.isActive !== false);
  const distinctSizes = new Set(activeVariants.map((v) => v.sizeLabel || v.size).filter(Boolean));
  const distinctColors = new Set(activeVariants.map((v) => v.color).filter(Boolean));
  const hasApparelVariants = activeVariants.length > 1 && (distinctSizes.size > 1 || distinctColors.size > 1);

  if (hasApparelVariants) {
    // 1. APPAREL VARIANT PRODUCTGROUP SCHEMA
    const variesBy: string[] = [];
    if (distinctSizes.size > 1) variesBy.push('https://schema.org/size');
    if (distinctColors.size > 1) variesBy.push('https://schema.org/color');

    const hasVariant = activeVariants.map((v) => {
      const variantSku = v.sku || `${product.sku || product.slug}-${v.size}-${v.color}`;
      const isVariantInStock = v.stock > 0;
      const variantPrice = Number(v.priceOverride || product.price);

      return {
        '@type': 'Product',
        name: `${product.name} - ${v.color} / ${v.sizeLabel || v.size}`,
        sku: variantSku,
        inProductGroupWithID: product.sku || product.slug,
        color: v.color,
        size: v.sizeLabel || v.size,
        image: images[0],
        offers: {
          '@type': 'Offer',
          sku: variantSku,
          name: `${product.name} - ${v.sizeLabel || v.size} / ${v.color}`,
          price: variantPrice,
          priceCurrency: SITE_CONFIG.currency,
          availability: isVariantInStock
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
          url: productUrl,
          itemCondition: 'https://schema.org/NewCondition',
          priceValidUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
          seller: {
            '@type': 'Organization',
            name: SITE_CONFIG.name,
          },
        },
      };
    });

    const productGroupJsonLd: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'ProductGroup',
      productGroupID: product.sku || product.slug,
      name: product.name,
      description: product.shortDescription || product.description || `${product.name} by Rongin Libas Atelier.`,
      url: productUrl,
      brand: {
        '@type': 'Brand',
        name: SITE_CONFIG.name,
      },
      image: images,
      variesBy,
      hasVariant,
    };

    if (aggregateRating) productGroupJsonLd.aggregateRating = aggregateRating;
    if (reviewList) productGroupJsonLd.review = reviewList;

    return productGroupJsonLd;
  }

  // 2. STANDALONE SINGLE PRODUCT SCHEMA
  const isProductInStock =
    product.inStock !== false &&
    product.stockCount !== 0 &&
    (product.variants?.length ? product.variants.some((v) => (v.stock ?? 0) > 0) : true);

  const singleOffer = {
    '@type': 'Offer',
    sku: product.sku || product.slug,
    price: Number(product.price),
    priceCurrency: SITE_CONFIG.currency,
    availability: isProductInStock
      ? 'https://schema.org/InStock'
      : 'https://schema.org/OutOfStock',
    url: productUrl,
    itemCondition: 'https://schema.org/NewCondition',
    priceValidUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    seller: {
      '@type': 'Organization',
      name: SITE_CONFIG.name,
    },
  };

  const productJsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.shortDescription || product.description || `${product.name} by Rongin Libas Atelier.`,
    image: images,
    sku: product.sku || product.slug,
    url: productUrl,
    brand: {
      '@type': 'Brand',
      name: SITE_CONFIG.name,
    },
    offers: singleOffer,
  };

  if (aggregateRating) productJsonLd.aggregateRating = aggregateRating;
  if (reviewList) productJsonLd.review = reviewList;

  return productJsonLd;
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

/**
 * Generate BreadcrumbList schema with guaranteed Position 1 "Home" and canonical URLs
 */
export function generateBreadcrumbJsonLd(
  breadcrumbs: BreadcrumbItem[],
): Record<string, unknown> {
  const cleanList: BreadcrumbItem[] = [];

  // Guarantee Position 1 is always Home
  const firstIsHome =
    breadcrumbs.length > 0 &&
    (breadcrumbs[0].url === '/' ||
      breadcrumbs[0].url === CANONICAL_BASE_URL ||
      breadcrumbs[0].name.toLowerCase() === 'home');

  if (!firstIsHome) {
    cleanList.push({
      name: 'Home',
      url: '/',
    });
  }

  cleanList.push(...breadcrumbs);

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: cleanList.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: getCanonicalUrl(crumb.url),
    })),
  };
}

/**
 * Generate Organization schema for Rongin Libas with real atelier identity
 */
export function generateOrganizationJsonLd(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_CONFIG.name,
    legalName: SITE_CONFIG.legalName,
    url: CANONICAL_BASE_URL,
    logo: `${CANONICAL_BASE_URL}/logo.svg`,
    description: SITE_CONFIG.description,
    slogan: SITE_CONFIG.tagline,
    telephone: SITE_CONFIG.telephone,
    email: 'concierge@ronginlibas.com',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Dhaka',
      addressCountry: 'BD',
    },
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: SITE_CONFIG.telephone,
        contactType: 'customer service',
        availableLanguage: ['English', 'Bengali'],
        areaServed: 'BD',
      },
    ],
    sameAs: SITE_CONFIG.social,
  };
}

/**
 * Generate WebSite schema without obsolete SearchAction sitelinks markup
 */
export function generateWebSiteJsonLd(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_CONFIG.name,
    alternateName: 'Rongin Libas Atelier',
    url: CANONICAL_BASE_URL,
    description: SITE_CONFIG.description,
  };
}

export interface ArticleSchemaProps {
  headline: string;
  description: string;
  url: string;
  image: string;
  datePublished: string;
  dateModified?: string;
  authorName?: string;
}

/**
 * Generate Article / BlogPosting schema for Rongin Libas Journal entries
 */
export function generateArticleJsonLd(props: ArticleSchemaProps): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: props.headline,
    description: props.description,
    url: getCanonicalUrl(props.url),
    image: props.image.startsWith('http') ? props.image : `${CANONICAL_BASE_URL}${props.image}`,
    datePublished: props.datePublished,
    dateModified: props.dateModified || props.datePublished,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': getCanonicalUrl(props.url),
    },
    author: {
      '@type': 'Organization',
      name: props.authorName || SITE_CONFIG.name,
      url: CANONICAL_BASE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_CONFIG.name,
      url: CANONICAL_BASE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${CANONICAL_BASE_URL}/logo.svg`,
      },
    },
  };
}

export interface FaqItemSchema {
  question: string;
  answer: string;
}

/**
 * Generate FAQPage schema strictly matching visible question-and-answer pairs
 */
export function generateFaqJsonLd(faqs: FaqItemSchema[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Generate ContactPage schema with confirmed atelier communication channels
 */
export function generateContactPageJsonLd(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: `Contact ${SITE_CONFIG.name}`,
    url: `${CANONICAL_BASE_URL}/contact`,
    mainEntity: {
      '@type': 'Organization',
      name: SITE_CONFIG.name,
      telephone: SITE_CONFIG.telephone,
      email: SITE_CONFIG.email,
      url: CANONICAL_BASE_URL,
      contactPoint: [
        {
          '@type': 'ContactPoint',
          telephone: SITE_CONFIG.telephone,
          contactType: 'customer service',
          availableLanguage: ['English', 'Bengali'],
          areaServed: 'BD',
        },
      ],
    },
  };
}

