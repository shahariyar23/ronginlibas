import type { Product } from '@/types';

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:4000/api/v1';

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
      credentials: 'include',
      cache: 'no-store',
    });
  } catch {
    throw new ApiError('Could not connect to the Rongin Libas server.', 0);
  }

  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const error = body as { message?: string | string[] } | null;
    const message = Array.isArray(error?.message)
      ? error.message.join(', ')
      : error?.message || `The server returned ${response.status}.`;
    throw new ApiError(message, response.status);
  }

  if (
    body &&
    typeof body === 'object' &&
    'data' in body
  ) {
    return (body as { data: T }).data;
  }
  return body as T;
}

export interface ApiVariant {
  id: string;
  size: string;
  sizeLabel?: string | null;
  color: string;
  stock: number;
  priceOverride?: number | string | null;
  isActive?: boolean;
}

interface ApiProduct {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  shortDescription?: string | null;
  price: number | string;
  compareAtPrice?: number | string | null;
  fabric?: string | null;
  fabricOrigin?: string | null;
  fit?: string | null;
  careInstructions?: string | null;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  isExpressAvailable?: boolean;
  category?: { name?: string; slug?: string } | null;
  images?: Array<{ url?: string; altText?: string | null } | string>;
  variants?: ApiVariant[];
}

const categoryAliases: Record<string, Product['category']> = {
  panjabi: 'panjabi',
  shirts: 'shirts',
  shirt: 'shirts',
  polos: 'polos',
  polo: 'polos',
  't-shirts': 't-shirts',
  't-shirts and tees': 't-shirts',
  trousers: 'trousers',
  casual: 'casual',
  accessories: 'accessories',
};

function colorHex(name: string) {
  const color = name.toLowerCase();
  if (color.includes('green') || color.includes('emerald')) return '#073a2d';
  if (color.includes('white') || color.includes('ivory') || color.includes('cream')) return '#fbf9f2';
  if (color.includes('blue') || color.includes('navy')) return '#112244';
  if (color.includes('red') || color.includes('terracotta') || color.includes('rust')) return '#9c4a2f';
  if (color.includes('black') || color.includes('onyx')) return '#1b1c18';
  return '#c79a45';
}

export function mapProduct(source: ApiProduct): Product {
  const variants = source.variants ?? [];
  const colors = [...new Set(variants.map((variant) => variant.color).filter(Boolean))];
  const sizes = [...new Set(variants.map((variant) => variant.sizeLabel || variant.size).filter(Boolean))];
  const categoryLabel = source.category?.name || 'Collection';
  const categorySlug =
    source.category?.slug ||
    categoryLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const category = categoryAliases[categorySlug.toLowerCase()] || 'casual';
  const images = (source.images ?? [])
    .map((image) => (typeof image === 'string' ? image : image.url))
    .filter((image): image is string => Boolean(image));

  return {
    id: source.id,
    slug: source.slug,
    name: source.name,
    category,
    categoryLabel,
    price: Number(source.price),
    originalPrice: source.compareAtPrice ? Number(source.compareAtPrice) : undefined,
    badge: source.isFeatured ? 'Atelier Featured' : undefined,
    images,
    description: source.shortDescription || source.description || '',
    fabric: source.fabric || 'Atelier fabric',
    fabricOrigin: source.fabricOrigin || undefined,
    fit: source.fit || 'Regular',
    careGuide: source.careInstructions ? [source.careInstructions] : [],
    sizes: sizes.length ? sizes : ['Standard'],
    colors: colors.map((name) => ({ name, hex: colorHex(name) })),
    inStock: variants.some((variant) => variant.isActive !== false && variant.stock > 0),
    stockCount: variants.reduce((total, variant) => total + Math.max(0, variant.stock), 0),
    isNewArrival: source.isNewArrival,
    isBestSeller: source.isBestSeller,
    featured: source.isFeatured,
    variants,
  };
}

export interface ProductListQuery {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  featured?: boolean;
  newArrival?: boolean;
  bestSeller?: boolean;
  sort?: string;
}

export async function getProducts(query: ProductListQuery = {}) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== '') params.set(key, String(value));
  });
  const result = await apiRequest<{ items: ApiProduct[] }>(
    `/products${params.size ? `?${params.toString()}` : ''}`,
  );
  return (result.items ?? []).map(mapProduct);
}

export async function getProduct(slug: string) {
  const product = await apiRequest<ApiProduct>(`/products/${encodeURIComponent(slug)}`);
  return mapProduct(product);
}

export async function getRelatedProducts(slug: string) {
  const products = await apiRequest<ApiProduct[]>(`/products/${encodeURIComponent(slug)}/related`);
  return products.map(mapProduct);
}

export async function getRecommendations(slug: string) {
  const products = await apiRequest<ApiProduct[]>(`/products/${encodeURIComponent(slug)}/recommendations`);
  return products.map(mapProduct);
}

export async function downloadOrderInvoice(orderNumber: string) {
  const headers = new Headers();
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);
  const response = await fetch(
    `${API_BASE}/orders/${encodeURIComponent(orderNumber)}/invoice`,
    { headers, credentials: 'include', cache: 'no-store' },
  );
  if (!response.ok) {
    const body = await response.json().catch(() => null) as { message?: string | string[] } | null;
    const message = Array.isArray(body?.message)
      ? body.message.join(', ')
      : body?.message || `The server returned ${response.status}.`;
    throw new ApiError(message, response.status);
  }
  const url = URL.createObjectURL(await response.blob());
  const link = document.createElement('a');
  link.href = url;
  link.download = `${orderNumber.replace(/[^a-z0-9-]/gi, '')}-invoice.pdf`;
  link.click();
  URL.revokeObjectURL(url);
}
