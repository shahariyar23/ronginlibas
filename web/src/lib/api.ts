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
  averageRating?: number;
  reviewsCount?: number;
  totalSold?: number;
  reviews?: Array<{ rating: number }>;
  orderItems?: Array<{ quantity: number }>;
  _count?: { reviews?: number; orderItems?: number };
  category?: { name?: string; slug?: string } | null;
  images?: Array<{ url?: string; altText?: string | null; isPrimary?: boolean; publicId?: string | null } | string>;
  variants?: ApiVariant[];
  seoTitle?: string | null;
  metaDescription?: string | null;
  canonicalUrl?: string | null;
  redirectTargetSlug?: string;
  isRedirect?: boolean;
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
  const imageDetails = (source.images ?? [])
    .map((image, idx) => {
      if (typeof image === 'string') {
        return {
          url: image,
          altText: `${source.name} - View ${idx + 1}`,
          isPrimary: idx === 0,
          publicId: null,
        };
      }
      return {
        url: image.url || '',
        altText: image.altText || `${source.name} - View ${idx + 1}`,
        isPrimary: image.isPrimary ?? idx === 0,
        publicId: image.publicId || null,
      };
    })
    .filter((img) => Boolean(img.url));

  const images = imageDetails.map((image) => image.url);

  const totalSold =
    source.totalSold !== undefined
      ? source.totalSold
      : (source.orderItems ?? []).reduce((sum, oi) => sum + (oi.quantity || 1), 0) || (source._count?.orderItems ?? 0);
  const isBestSeller = Boolean(source.isBestSeller || totalSold > 0);

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
      : isBestSeller
        ? 'Best Seller'
        : source.isNewArrival
          ? 'New Arrival'
          : undefined,
    images,
    imageDetails,
    seoTitle: source.seoTitle || undefined,
    metaDescription: source.metaDescription || undefined,
    canonicalUrl: source.canonicalUrl || undefined,
    redirectTargetSlug: source.redirectTargetSlug,
    isRedirect: source.isRedirect,
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
    averageRating:
      source.averageRating !== undefined
        ? source.averageRating
        : source.reviews && source.reviews.length > 0
          ? Number((source.reviews.reduce((sum, r) => sum + r.rating, 0) / source.reviews.length).toFixed(1))
          : 0,
    reviewsCount:
      source.reviewsCount !== undefined
        ? source.reviewsCount
        : source._count?.reviews !== undefined
          ? source._count.reviews
          : (source.reviews?.length ?? 0),
    totalSold,
    isNewArrival: source.isNewArrival,
    isBestSeller,
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
  collection?: string;
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
  description?: string | null;
  seoTitle?: string | null;
  metaDescription?: string | null;
  isActive?: boolean;
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
    if (key === 'sort' && typeof value === 'string') {
      const sortMap: Record<string, string> = {
        'price-low': 'price-asc',
        'price-high': 'price-desc',
      };
      params.set(key, sortMap[value] || value);
      return;
    }
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

export async function getCategoryBySlug(slug: string) {
  return apiRequest<StorefrontCategory>(`/categories/${encodeURIComponent(slug)}`);
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

export interface StorefrontCollection {
  id: string;
  name: string;
  slug: string;
  tagline?: string | null;
  description?: string | null;
  image?: string | null;
  isActive: boolean;
  sortOrder: number;
  seoTitle?: string | null;
  metaDescription?: string | null;
  products?: Product[];
}

export async function getCollection(slug: string): Promise<StorefrontCollection | null> {
  try {
    const raw = await apiRequest<any>(`/collections/${encodeURIComponent(slug)}`);
    return {
      ...raw,
      products: (raw.products || []).map(mapProduct),
    };
  } catch {
    return null;
  }
}

export async function getCollections(): Promise<StorefrontCollection[]> {
  try {
    return await apiRequest<StorefrontCollection[]>('/collections');
  } catch {
    return [];
  }
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

export async function requestForgotPassword(email: string) {
  return apiRequest<{ message: string }>('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function resetPasswordWithToken(token: string, newPassword: string) {
  return apiRequest<{ message: string; passwordReset?: boolean }>('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, newPassword }),
  });
}

export interface CustomerAddress {
  id: string;
  fullName?: string | null;
  email?: string | null;
  phone: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  division: string;
  area?: string | null;
  postalCode?: string | null;
  deliveryInstructions?: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerAddressInput {
  fullName: string;
  email?: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  division: string;
  area?: string;
  postalCode?: string;
  deliveryInstructions?: string;
  isDefault?: boolean;
}

export async function getCustomerAddresses(): Promise<CustomerAddress[]> {
  const res = await apiRequest<{ data: CustomerAddress[] } | CustomerAddress[]>('/customers/me/addresses');
  if (Array.isArray(res)) return res;
  return (res as any)?.data || [];
}

export async function createCustomerAddress(data: CustomerAddressInput): Promise<CustomerAddress> {
  const res = await apiRequest<{ data: CustomerAddress } | CustomerAddress>('/customers/me/addresses', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return (res as any)?.data || (res as any);
}

export async function updateCustomerAddress(id: string, data: Partial<CustomerAddressInput>): Promise<CustomerAddress> {
  const res = await apiRequest<{ data: CustomerAddress } | CustomerAddress>(`/customers/me/addresses/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  return (res as any)?.data || (res as any);
}

export async function setDefaultCustomerAddress(id: string): Promise<CustomerAddress> {
  const res = await apiRequest<{ data: CustomerAddress } | CustomerAddress>(`/customers/me/addresses/${id}/default`, {
    method: 'PATCH',
  });
  return (res as any)?.data || (res as any);
}

export async function deleteCustomerAddress(id: string): Promise<void> {
  await apiRequest(`/customers/me/addresses/${id}`, {
    method: 'DELETE',
  });
}

export interface StorefrontOffersResponse {
  hero: {
    title: string;
    subtitle: string;
    bannerMessage: string;
    maxDiscountPercent: number;
    hasActivePromotion: boolean;
  };
  countdown: {
    offerName: string;
    startDate: string;
    expiryDate: string;
    isActive: boolean;
  } | null;
  freeDelivery: {
    enabled: boolean;
    threshold: number;
    message: string;
  };
  coupons: Array<{
    id: string;
    code: string;
    description: string | null;
    type: 'PERCENTAGE' | 'FIXED';
    value: number;
    minimumOrderAmount: number;
    maximumDiscount: number | null;
    expiryDate: string;
  }>;
  offers: Array<{
    id: string;
    name: string;
    slug: string;
    description: string | null;
    offerType: string;
    discountType: string;
    discountValue: number;
    startDate: string;
    expiryDate: string;
    badgeText?: string;
    couponCode?: string;
    productCount: number;
  }>;
  products: Product[];
  facets: {
    categories: Array<{ id: string; name: string; slug: string; count: number }>;
    discountBands: Array<{ label: string; min: number; count: number }>;
    colors: string[];
    sizes: string[];
    priceRange: { min: number; max: number };
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface OffersQuery {
  category?: string;
  discountBand?: string;
  minPrice?: number;
  maxPrice?: number;
  size?: string[];
  color?: string[];
  tab?: 'all' | 'best-discounts' | 'bundle';
  sort?: 'featured' | 'discount-high' | 'price-low' | 'price-high' | 'newest';
  page?: number;
  limit?: number;
}

export async function getOffersPageData(query: OffersQuery = {}): Promise<StorefrontOffersResponse> {
  const params = new URLSearchParams();
  if (query.category) params.set('category', query.category);
  if (query.discountBand) params.set('discountBand', query.discountBand);
  if (query.minPrice !== undefined) params.set('minPrice', String(query.minPrice));
  if (query.maxPrice !== undefined) params.set('maxPrice', String(query.maxPrice));
  if (query.size?.length) query.size.forEach((s) => params.append('size', s));
  if (query.color?.length) query.color.forEach((c) => params.append('color', c));
  if (query.tab) params.set('tab', query.tab);
  if (query.sort) params.set('sort', query.sort);
  if (query.page) params.set('page', String(query.page));
  if (query.limit) params.set('limit', String(query.limit));

  const qs = params.toString();
  const raw = await apiRequest<StorefrontOffersResponse>(`/offers${qs ? `?${qs}` : ''}`);

  return {
    ...raw,
    products: (raw.products ?? []).map((p: any) => ({
      ...mapProduct(p),
      originalPrice: p.originalPrice ?? (p.compareAtPrice ? Number(p.compareAtPrice) : undefined),
      badge: p.badge || (p.discountPercentage ? `${p.discountPercentage}% OFF` : undefined),
    })),
  };
}

export interface SocialIdentity {
  id: string;
  provider: 'GOOGLE';
  providerEmail: string | null;
  createdAt: string;
}

export interface SocialAuthResponse {
  accessToken: string;
  user: {
    id: string;
    email: string | null;
    firstName: string;
    lastName: string | null;
    role: string;
    type: 'customer';
  };
}

export async function loginWithSocialToken(
  idToken: string,
  fullName?: string | null,
): Promise<SocialAuthResponse> {
  return apiRequest<SocialAuthResponse>('/auth/social', {
    method: 'POST',
    body: JSON.stringify({ idToken, fullName: fullName || undefined }),
  });
}

export async function linkSocialAccountApi(
  idToken: string,
  fullName?: string | null,
): Promise<SocialIdentity> {
  return apiRequest<SocialIdentity>('/auth/social/link', {
    method: 'POST',
    body: JSON.stringify({ idToken, fullName: fullName || undefined }),
  });
}

export async function unlinkSocialAccountApi(
  provider: 'GOOGLE',
): Promise<{ unlinked: boolean }> {
  return apiRequest<{ unlinked: boolean }>(`/auth/social/unlink/${provider}`, {
    method: 'DELETE',
  });
}

export async function getSocialIdentitiesApi(): Promise<SocialIdentity[]> {
  return apiRequest<SocialIdentity[]>('/auth/social/identities', {
    method: 'GET',
  });
}

export interface DataDeletionResponse {
  status: string;
  confirmationCode: string;
  email: string;
  message: string;
}

export async function deleteMyAccountApi(reason?: string): Promise<{ deleted: boolean }> {
  return apiRequest<{ deleted: boolean }>('/customers/me', {
    method: 'DELETE',
    body: JSON.stringify({ reason }),
  });
}

export async function submitDataDeletionRequestApi(data: {
  email: string;
  phone?: string;
  reason?: string;
}): Promise<DataDeletionResponse> {
  return apiRequest<DataDeletionResponse>('/customers/data-deletion-request', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export interface PaymentMethodItem {
  id: string;
  name: string;
  isEnabled: boolean;
  credentialsConfigured?: boolean;
}

export interface WaitmarkInitiateResult {
  checkoutUrl: string;
  paymentAttemptId: string;
  orderId: string;
  orderNumber: string;
  amount: number;
  currency: string;
}

export interface OrderPaymentStatusResult {
  orderId: string;
  orderNumber: string;
  paymentStatus: string;
  orderStatus: string;
  totalAmount: number;
  paidAmount: number;
  paymentReference: string | null;
  paymentMethod: string;
  payments: Array<{
    id: string;
    provider: string;
    providerOrderId: string;
    providerTransactionId: string | null;
    amount: number;
    currency: string;
    status: string;
    failureReason: string | null;
    paidAt: string | null;
    createdAt: string;
  }>;
}

export async function getPaymentMethodsApi(): Promise<PaymentMethodItem[]> {
  return apiRequest<PaymentMethodItem[]>('/payments/methods', {
    method: 'GET',
  });
}

export async function initiateWaitmarkPaymentApi(data: {
  orderId: string;
  phone?: string;
  trackingToken?: string;
}): Promise<WaitmarkInitiateResult> {
  return apiRequest<WaitmarkInitiateResult>('/payments/waitmark/initiate', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getPaymentStatusApi(
  orderId: string,
  params?: { phone?: string; trackingToken?: string },
): Promise<OrderPaymentStatusResult> {
  const query = new URLSearchParams();
  if (params?.phone) query.set('phone', params.phone);
  if (params?.trackingToken) query.set('trackingToken', params.trackingToken);
  const qStr = query.toString();
  return apiRequest<OrderPaymentStatusResult>(
    `/payments/status/${encodeURIComponent(orderId)}${qStr ? `?${qStr}` : ''}`,
    {
      method: 'GET',
    },
  );
}

export async function restoreCartFromOrderApi(data: {
  orderId: string;
  cartId?: string;
  phone?: string;
  trackingToken?: string;
}): Promise<any> {
  return apiRequest('/cart/restore-order', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function cancelOrderApi(
  orderNumber: string,
  params?: { phone?: string; trackingToken?: string },
): Promise<any> {
  return apiRequest(`/orders/${encodeURIComponent(orderNumber)}/cancel`, {
    method: 'POST',
    body: JSON.stringify(params || {}),
  });
}



