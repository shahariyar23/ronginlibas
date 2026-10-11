import type { Metadata } from 'next';
import type { Product } from '@/types';
import type { ProductReviewsResponse } from '@/lib/api';

export const SITE_CONFIG = {
  name: 'Rongin Libas',
  legalName: 'Rongin Libas Atelier',
  tagline: 'CLOTH YOUR IDENTITY',
  url: 'https://ronginlibas.com',
  description:
    'Luxury Bangladeshi menswear atelier specializing in bespoke panjabis, mercerized knitwear, and architectural casual wear. Handcrafted in Dhaka.',
  logo: 'https://ronginlibas.com/logo.svg',
  telephone: '+8801700000000',
  currency: 'BDT',
  country: 'BD',
  social: [
    'https://www.facebook.com/ronginlibas',
    'https://www.instagram.com/ronginlibas',
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

  const canonical = product.canonicalUrl?.trim() || `${SITE_CONFIG.url}/products/${product.slug}`;

  const primaryImage =
    product.imageDetails?.[0]?.url || product.images?.[0] || `${SITE_CONFIG.url}/hero-model.jpg`;
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
      type: 'article',
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
 * Generate schema.org JSON-LD structured data for a single product
 */
export function generateProductJsonLd(
  product: Product,
  reviewsResponse?: ProductReviewsResponse,
) {
  const productUrl = `${SITE_CONFIG.url}/products/${product.slug}`;
  const images = product.images.length > 0 ? product.images : [SITE_CONFIG.logo];

  // Merchant Return Policy & Shipping Details
  const returnPolicy = {
    '@type': 'MerchantReturnPolicy',
    applicableCountry: 'BD',
    returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
    merchantReturnDays: 7,
    returnMethod: 'https://schema.org/ReturnByMail',
    returnFees: 'https://schema.org/FreeReturn',
  };

  const shippingDetails = {
    '@type': 'OfferShippingDetails',
    shippingRate: {
      '@type': 'MonetaryAmount',
      value: 80,
      currency: 'BDT',
    },
    shippingDestination: {
      '@type': 'DefinedRegion',
      addressCountry: 'BD',
    },
    deliveryTime: {
      '@type': 'ShippingDeliveryTime',
      handlingTime: {
        '@type': 'QuantitativeValue',
        minValue: 1,
        maxValue: 2,
        unitCode: 'DAY',
      },
      transitTime: {
        '@type': 'QuantitativeValue',
        minValue: 2,
        maxValue: 5,
        unitCode: 'DAY',
      },
    },
  };

  // Build variants offers or single offer
  const offers =
    product.variants && product.variants.length > 0
      ? product.variants.map((v) => ({
          '@type': 'Offer',
          sku: v.sku || `${product.sku || product.slug}-${v.size}-${v.color}`,
          name: `${product.name} - ${v.size} / ${v.color}`,
          price: Number(v.priceOverride || product.price),
          priceCurrency: SITE_CONFIG.currency,
          availability:
            v.isActive !== false && v.stock > 0
              ? 'https://schema.org/InStock'
              : 'https://schema.org/OutOfStock',
          url: productUrl,
          itemCondition: 'https://schema.org/NewCondition',
          priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
          seller: {
            '@type': 'Organization',
            name: SITE_CONFIG.name,
          },
          shippingDetails,
          hasMerchantReturnPolicy: returnPolicy,
        }))
      : [
          {
            '@type': 'Offer',
            sku: product.sku || product.slug,
            price: product.price,
            priceCurrency: SITE_CONFIG.currency,
            availability: product.inStock
              ? 'https://schema.org/InStock'
              : 'https://schema.org/OutOfStock',
            url: productUrl,
            itemCondition: 'https://schema.org/NewCondition',
            priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split('T')[0],
            seller: {
              '@type': 'Organization',
              name: SITE_CONFIG.name,
            },
            shippingDetails,
            hasMerchantReturnPolicy: returnPolicy,
          },
        ];

  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.shortDescription || product.description,
    image: images,
    sku: product.sku || product.slug,
    url: productUrl,
    brand: {
      '@type': 'Brand',
      name: SITE_CONFIG.name,
    },
    offers: offers.length === 1 ? offers[0] : offers,
  };

  // Only attach AggregateRating when valid, approved ratings exist in database
  const reviewCount = product.reviewsCount ?? reviewsResponse?.total ?? 0;
  const ratingValue = product.averageRating ?? reviewsResponse?.averageRating ?? 0;

  if (reviewCount > 0 && ratingValue > 0) {
    jsonLd.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: Number(ratingValue.toFixed(1)),
      reviewCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  // Include approved reviews only if available
  const approvedReviews = reviewsResponse?.items ?? [];

  if (approvedReviews.length > 0) {
    jsonLd.review = approvedReviews.map((rev) => ({
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
    }));
  }

  // Product variants (ProductGroup representation when true variants exist)
  if (product.variants && product.variants.length > 1) {
    jsonLd.hasVariant = product.variants.map((v) => ({
      '@type': 'Product',
      name: `${product.name} - ${v.color} / ${v.sizeLabel || v.size}`,
      sku: v.sku,
      color: v.color,
      size: v.sizeLabel || v.size,
      offers: {
        '@type': 'Offer',
        price: Number(v.priceOverride || product.price),
        priceCurrency: SITE_CONFIG.currency,
        availability:
          v.isActive !== false && v.stock > 0
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
      },
    }));
  }

  return jsonLd;
}

/**
 * Generate BreadcrumbList schema
 */
export function generateBreadcrumbJsonLd(
  breadcrumbs: Array<{ name: string; url: string }>,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.url.startsWith('http') ? crumb.url : `${SITE_CONFIG.url}${crumb.url}`,
    })),
  };
}

/**
 * Generate Organization schema for Rongin Libas
 */
export function generateOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_CONFIG.name,
    legalName: SITE_CONFIG.legalName,
    url: SITE_CONFIG.url,
    logo: SITE_CONFIG.logo,
    description: SITE_CONFIG.description,
    slogan: SITE_CONFIG.tagline,
    telephone: SITE_CONFIG.telephone,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Dhaka',
      addressCountry: 'BD',
    },
    sameAs: SITE_CONFIG.social,
  };
}

/**
 * Generate WebSite schema with search action
 */
export function generateWebSiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    description: SITE_CONFIG.description,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_CONFIG.url}/shop?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}
