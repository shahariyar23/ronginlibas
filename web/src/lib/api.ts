import type { Product } from '@/types';

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:4000/api/v1';

let accessToken: string | null = null;

function isTokenExpired(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
    const payload = JSON.parse(jsonPayload);
    // Buffer by 30 seconds
    return typeof payload.exp === 'number' && payload.exp * 1000 < Date.now() + 30_000;
  } catch {
    return true;
  }
}

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (isRefreshing && refreshPromise) return refreshPromise;
  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        cache: 'no-store',
      });
      if (res.ok) {
        const body = await res.json();
        const newToken = body?.data?.accessToken || body?.accessToken;
        if (newToken) {
          setAccessToken(newToken);
          return newToken as string;
        }
      }
      return null;
    } catch {
      return null;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();
  return refreshPromise;
}

export function setAccessToken(token: string | null) {
  accessToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('rongin_access_token', token);
    } else {
      localStorage.removeItem('rongin_access_token');
    }
  }
}

export function getAccessToken() {
  if (!accessToken && typeof window !== 'undefined') {
    accessToken = localStorage.getItem('rongin_access_token');
  }
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
  isRetry = false,
): Promise<T> {
  let token = getAccessToken();

  if (
    token &&
    isTokenExpired(token) &&
    !path.startsWith('/auth/refresh') &&
    !path.startsWith('/auth/login')
  ) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      token = refreshed;
    }
  }

  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const headers = new Headers(options.headers);
  if (options.body && !isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
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

  if (response.status === 401 && !isRetry && !path.startsWith('/auth/')) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return apiRequest<T>(path, options, true);
    }
  }

  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const error = body as { message?: string | string[] } | null;
    let message = Array.isArray(error?.message)
      ? error.message.join(', ')
      : error?.message || `The server returned ${response.status}.`;

    if (message.includes('phone') && message.includes('regular expression')) {
      message = 'Please provide a valid mobile number (e.g. 017XXXXXXXX or 17XXXXXXXX)';
    } else if (message.includes('password') && message.includes('regular expression')) {
      message = 'Password must be at least 6 characters.';
    } else if (message.includes('regular expression')) {
      message = message.replace(/must match \/[^/]+\/ regular expression/g, 'is invalid');
    }

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
  sizeType?: 'APPAREL' | 'WAIST' | 'CUSTOM' | null;
  measurements?: Record<string, number | string> | null;
  color: string;
  stock: number;
  priceOverride?: number | string | null;
  isActive?: boolean;
  sku?: string;
}

interface ApiProduct {
  id: string;
  slug: string;
  name: string;
  sku?: string;
  description?: string | null;
  shortDescription?: string | null;
  price: number | string;
  compareAtPrice?: number | string | null;
  fabric?: string | null;
  fabricOrigin?: string | null;
  fit?: string | null;
  gsm?: number | null;
  careInstructions?: string | null;
  gender?: 'MEN' | 'WOMEN' | 'UNISEX';
  tags?: string[];
  isExpressAvailable?: boolean;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
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

export function colorHex(name: string): string {
  if (!name) return '#073a2d';
  const hexMatch = name.match(/#(?:[0-9a-fA-F]{3}){1,2}\b/);
  if (hexMatch) return hexMatch[0];

  const lower = name.toLowerCase().trim();
  const knownPalette: Record<string, string> = {
    'heritage olive': '#4B5320',
    'olive': '#4B5320',
    'navy atelier': '#0F1A2C',
    'midnight navy': '#0F1A2C',
    'navy': '#0F1A2C',
    'raw silk white': '#FBF9F2',
    'ivory': '#FBF9F2',
    'off white': '#FBF9F2',
    'cream': '#FBF9F2',
    'royal emerald': '#00231A',
    'emerald': '#00231A',
    'forest': '#073a2d',
    'antique gold': '#C79A45',
    'gold': '#C79A45',
    'mustard': '#C79A45',
    'midnight noir': '#1A1A1A',
    'noir': '#1A1A1A',
    'black': '#1A1A1A',
    'onyx': '#1A1A1A',
    'charcoal': '#2C3539',
    'slate': '#708090',
    'grey': '#808080',
    'gray': '#808080',
    'silver': '#C0C0C0',
    'white': '#FFFFFF',
    'beige': '#F5F5DC',
    'vintage beige': '#D9CBB6',
    'tan': '#D2B48C',
    'khaki': '#C3B091',
    'camel': '#C19A6B',
    'brown': '#654321',
    'coffee': '#4A2E18',
    'chocolate': '#3D2314',
    'maroon': '#800000',
    'burgundy': '#800020',
    'wine': '#722F37',
    'crimson': '#DC143C',
    'red': '#9C4A2F',
    'terracotta': '#9C4A2F',
    'rust': '#9C4A2F',
    'brick': '#9C4A2F',
    'rose': '#E0BFB8',
    'pink': '#FFC0CB',
    'sage': '#9DC183',
    'mint': '#98FF98',
    'green': '#073A2D',
    'teal': '#008080',
    'turquoise': '#40E0D0',
    'blue': '#112244',
    'sky': '#87CEEB',
    'royal blue': '#4169E1',
    'indigo': '#4B0082',
    'purple': '#800080',
    'violet': '#7F00FF',
    'lavender': '#E6E6FA',
    'plum': '#8E4585',
  };

  if (knownPalette[lower]) return knownPalette[lower];
  for (const [key, hex] of Object.entries(knownPalette)) {
    if (lower.includes(key)) return hex;
  }
  return '#073a2d';
}

export function mapProduct(source: ApiProduct): Product {
  const variants = source.variants ?? [];
  const categorySlug =
    source.category?.slug ||
    (source.category?.name || 'Collection')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  const colors = [...new Set(variants.map((variant) => variant.color).filter(Boolean))];
  const sizes = [
    ...new Set(
      variants
        .map((variant) => variant.sizeLabel || variant.size)
        .filter((size): size is string => Boolean(size))
    )
  ];
  const categoryLabel = source.category?.name || 'Collection';
  const category = categoryAliases[categorySlug.toLowerCase()] || 'casual';
  const images = (source.images ?? [])
    .map((image) => (typeof image === 'string' ? image : image.url))
    .filter((image): image is string => Boolean(image));

  return {
    id: source.id,
    slug: source.slug,
    name: source.name,
    sku: source.sku || '',
    category,
    categoryLabel,
    price: Number(source.price),
    originalPrice: source.compareAtPrice ? Number(source.compareAtPrice) : undefined,
    badge: source.isFeatured
      ? 'Atelier Featured'
      : source.isBestSeller
        ? 'Best Seller'
        : source.isNewArrival
          ? 'New Arrival'
          : undefined,
    images,
    description: source.description || source.shortDescription || '',
    shortDescription: source.shortDescription || undefined,
    fabric: source.fabric || 'Atelier fabric',
    fabricOrigin: source.fabricOrigin || undefined,
    fit: source.fit || 'Regular',
    gsm: source.gsm ? Number(source.gsm) : undefined,
    careInstructions: source.careInstructions || undefined,
    careGuide: source.careInstructions ? [source.careInstructions] : [],
    gender: source.gender || 'MEN',
    tags: Array.isArray(source.tags) ? source.tags : [],
    isExpressAvailable: Boolean(source.isExpressAvailable),
    sizes: sizes.length ? sizes : variants.length ? [] : ['Standard'],
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
  gender?: 'MEN' | 'WOMEN' | 'UNISEX';
  category?: string;
  size?: string[];
  color?: string[];
  fabric?: string[];
  fabricOrigin?: string[];
  fit?: string[];
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  featured?: boolean;
  newArrival?: boolean;
  bestSeller?: boolean;
  onSale?: boolean;
  sort?: string;
}

export interface StorefrontSettings {
  storeName: string;
  phone: string;
  whatsapp: string;
  website: string;
  facebook: string;
  dhakaDeliveryCharge: number;
  outsideDhakaDeliveryCharge: number;
  freeShippingEnabled: boolean;
  freeDeliveryThreshold: number;
  promoEnabled: boolean;
  promoCode: string;
  promoDiscountText: string;
  whatsappOrderEnabled: boolean;
}

export interface StorefrontCategory {
  id: string;
  name: string;
  slug: string;
  image?: string | null;
  sortOrder?: number;
  _count?: { products: number };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface ShopProductsResponse {
  items: Product[];
  meta: PaginationMeta;
}

export interface FilterOption {
  value?: string;
  id?: string;
  name: string;
  slug: string;
  count: number;
}

export interface ProductFilters {
  categories: Array<FilterOption & { id: string }>;
  sizes: Array<FilterOption & { value: string; type: 'APPAREL' | 'WAIST' | 'CUSTOM' }>;
  colors: FilterOption[];
  fabrics: FilterOption[];
  fabricOrigins: FilterOption[];
  fits: FilterOption[];
  price: { min: number; max: number };
}

export function buildProductQuery(query: ProductListQuery = {}) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => params.append(key, item));
    } else if (value !== undefined && value !== '') {
      params.set(key, String(value));
    }
  });
  return params;
}

export async function getShopProducts(query: ProductListQuery = {}): Promise<ShopProductsResponse> {
  const params = buildProductQuery(query);
  const result = await apiRequest<{
    items: ApiProduct[];
    meta: PaginationMeta;
  }>(`/products${params.size ? `?${params.toString()}` : ''}`);
  return {
    items: (result.items ?? []).map(mapProduct),
    meta: result.meta ?? {
      page: 1,
      limit: query.limit ?? 12,
      total: result.items?.length ?? 0,
      totalPages: 1,
      hasNext: false,
      hasPrevious: false,
    },
  };
}

export async function getProductFilters(query: ProductListQuery = {}) {
  const params = buildProductQuery(query);
  params.delete('page');
  params.delete('limit');
  params.delete('sort');
  params.delete('minPrice');
  params.delete('maxPrice');
  return apiRequest<ProductFilters>(`/products/filters${params.size ? `?${params.toString()}` : ''}`);
}

export async function getStorefrontSettings() {
  return apiRequest<StorefrontSettings>('/store/settings');
}

export async function getStorefrontCategories() {
  return apiRequest<StorefrontCategory[]>('/categories');
}

export async function getProducts(query: ProductListQuery = {}) {
  const params = buildProductQuery(query);
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

export interface ProductReview {
  id: string;
  rating: number;
  comment: string;
  images?: string[];
  createdAt: string;
  customerName: string;
  verifiedPurchase: boolean;
  helpfulYes: number;
  helpfulNo: number;
  adminFeedback?: string | null;
  adminFeedbackAt?: string | null;
}

export interface ProductReviewsResponse {
  items: ProductReview[];
  averageRating: number;
  ratingDistribution: Record<number, number>;
  total: number;
}

export interface ReviewEligibilityResponse {
  canReview: boolean;
  reason?: 'NO_DELIVERED_PURCHASE' | 'ALREADY_REVIEWED' | 'ELIGIBLE';
  orderNumber?: string;
  existingReview?: {
    id: string;
    rating: number;
    comment?: string;
    status: string;
    createdAt: string;
  };
}

export interface CustomerSubmittedReview {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  productImage: string | null;
  rating: number;
  comment: string;
  images?: string[];
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminFeedback?: string | null;
  adminFeedbackAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EligibleReviewProduct {
  orderId: string;
  orderNumber: string;
  deliveredAt: string;
  product: {
    id: string;
    name: string;
    slug: string;
    image: string | null;
  };
  size: string;
  color: string;
}

export async function getProductReviews(productIdOrSlug: string, page = 1, limit = 20) {
  return apiRequest<ProductReviewsResponse>(
    `/products/${encodeURIComponent(productIdOrSlug)}/reviews?page=${page}&limit=${limit}`,
  );
}

export async function checkReviewEligibility(productIdOrSlug: string) {
  return apiRequest<ReviewEligibilityResponse>(
    `/products/${encodeURIComponent(productIdOrSlug)}/reviews/eligibility`,
  );
}

export async function uploadReviewImage(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  return apiRequest<{ url: string; publicId: string }>('/reviews/upload', {
    method: 'POST',
    body: formData,
  });
}

export async function submitProductReview(
  productIdOrSlug: string,
  rating: number,
  comment: string,
  images: string[] = [],
) {
  return apiRequest<{ id: string; status: string }>(
    `/products/${encodeURIComponent(productIdOrSlug)}/reviews`,
    {
      method: 'POST',
      body: JSON.stringify({ rating, comment, images }),
    },
  );
}

export async function voteReviewHelpful(reviewId: string, helpful: boolean) {
  return apiRequest<{ recorded: boolean }>(
    `/reviews/${encodeURIComponent(reviewId)}/helpful`,
    {
      method: 'POST',
      body: JSON.stringify({ helpful }),
    },
  );
}

export async function getCustomerReviews() {
  return apiRequest<CustomerSubmittedReview[]>('/reviews/mine');
}

export async function getEligibleReviews() {
  return apiRequest<EligibleReviewProduct[]>('/reviews/eligible');
}

