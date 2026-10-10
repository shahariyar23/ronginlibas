/**
 * Rongin Libas Atelier - Admin API Client
 * Seamlessly interfaces the Next.js Admin Dashboard with the NestJS REST API
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

// Token storage keys
const TOKEN_STORAGE_KEY = 'rl_admin_access_token';
const REFRESH_STORAGE_KEY = 'rl_admin_refresh_token';
const USER_STORAGE_KEY = 'rl_admin_user';

// In-memory token cache fallback
let memoryToken: string | null = null;

export interface AdminUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | string;
  type?: string;
  permissions?: string[];
  mustChangePassword?: boolean;
}

export interface StaffUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER';
  permissions: string[];
  isActive: boolean;
  mustChangePassword: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateStaffUserPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER';
  permissions?: string[];
  mustChangePassword?: boolean;
}

export interface UpdateStaffUserPayload {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  role?: 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER';
  permissions?: string[];
  isActive?: boolean;
  mustChangePassword?: boolean;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export type DashboardPeriod = '7' | '30' | 'month';

export interface AdminDashboardResponse {
  period: DashboardPeriod;
  metrics: {
    totalSales: number;
    totalOrders: number;
    activeProducts: number;
    totalCustomers: number;
  };
  salesOverview: {
    chartData: Array<{
      date: string;
      day: string;
      dhakaSales: number;
      nationalSales: number;
      unclassifiedSales: number;
    }>;
    peakPoint: { label: string; amount: number; day: string } | null;
    kpis: {
      averageOrderValue: number | null;
      deliveryRate: number | null;
      conversionRate: number | null;
      fulfillmentVelocityHours: number | null;
    };
  };
  dailySales: {
    today: { date: string; total: number; orderCount: number };
    yesterday: { date: string; total: number; orderCount: number };
    lastSevenDays: Array<{
      date: string;
      day: string;
      total: number;
      orderCount: number;
    }>;
  };
  needsAttention: {
    pendingOrders: number;
    lowStockVariants: number;
    outOfStockVariants: number;
    pendingReviews: number;
    failedPayments: number;
  };
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    customerName: string;
    customerLocation: string;
    amount: number;
    status: string;
    paymentMethod: string;
    createdAt: string;
  }>;
  topSellingProducts: Array<{
    productId: string;
    name: string;
    sku: string;
    unitsSold: number;
    revenue: number;
  }>;
  lowStockProducts: Array<{
    id: string;
    variantId: string;
    name: string;
    sku: string;
    stock: number;
    status: string;
    image: string;
  }>;
}

export type CouponDiscountType = 'PERCENTAGE' | 'FIXED';

export interface AdminCoupon {
  id: string;
  code: string;
  type: CouponDiscountType;
  value: number | string;
  minimumOrderAmount: number | string;
  usageCount: number;
  startDate: string;
  expiryDate: string;
  isActive: boolean;
}

export interface CreateCouponPayload {
  code: string;
  type: CouponDiscountType;
  value: number;
  minimumOrderAmount: number;
  startDate: string;
  expiryDate: string;
  isActive: boolean;
}

export interface AdminReview {
  id: string;
  rating: number;
  comment: string;
  images?: string[];
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'HIDDEN';
  adminFeedback: string | null;
  adminFeedbackAt: string | null;
  createdAt: string;
  customer: {
    firstName: string;
    lastName: string | null;
    email: string | null;
    phone: string;
    addresses: Array<{ city: string; division: string }>;
  };
  product: { name: string; sku: string };
}

export interface AdminReviewListResponse {
  items: AdminReview[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AdminAuditEvent {
  id: string;
  actorId: string;
  actorName: string;
  actorEmail: string;
  actorRole: string;
  module: string;
  action: string;
  entityType: string;
  entityId: string | null;
  entityLabel: string | null;
  summary: string;
  before: unknown;
  after: unknown;
  createdAt: string;
}

export interface AdminAuditListResponse {
  items: AdminAuditEvent[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export const getStoredToken = (): string | null => {
  if (typeof window === 'undefined') return memoryToken;
  try {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY) || memoryToken;
    if (token && typeof document !== 'undefined' && !document.cookie.includes(TOKEN_STORAGE_KEY)) {
      document.cookie = `${TOKEN_STORAGE_KEY}=${encodeURIComponent(token)}; path=/; max-age=604800; SameSite=Lax`;
    }
    return token;
  } catch {
    return memoryToken;
  }
};

export const getStoredRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(REFRESH_STORAGE_KEY);
  } catch {
    return null;
  }
};

export const getStoredUser = (): AdminUser | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setStoredUser = (user: AdminUser) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } catch {
      // storage unavailable
    }
  }
};

export const setStoredTokens = (accessToken: string, refreshToken?: string) => {
  memoryToken = accessToken;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(TOKEN_STORAGE_KEY, accessToken);
      if (refreshToken) localStorage.setItem(REFRESH_STORAGE_KEY, refreshToken);
      // Synchronize cookie for server/proxy verification (7 days duration)
      document.cookie = `${TOKEN_STORAGE_KEY}=${encodeURIComponent(accessToken)}; path=/; max-age=604800; SameSite=Lax`;
    } catch {
      // storage unavailable
    }
  }
};

export const clearStoredTokens = () => {
  memoryToken = null;
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(REFRESH_STORAGE_KEY);
      localStorage.removeItem(USER_STORAGE_KEY);
      // Clear cookie immediately
      document.cookie = `${TOKEN_STORAGE_KEY}=; path=/; max-age=0; SameSite=Lax`;
    } catch {
      // storage unavailable
    }
  }
};

/**
 * Acquire or reuse an existing admin JWT session without automatic credential spoofing
 */
export async function ensureAdminAuthenticated(): Promise<string> {
  const existing = getStoredToken();
  if (existing) return existing;
  return '';
}

/**
 * Attempt to refresh expired access token using stored refresh token
 */
async function tryRefreshToken(): Promise<boolean> {
  const refreshToken = getStoredRefreshToken();
  if (!refreshToken) return false;

  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (res.ok) {
      const data = await res.json();
      const newAccess = data?.data?.accessToken;
      const newRefresh = data?.data?.refreshToken || refreshToken;
      if (newAccess) {
        setStoredTokens(newAccess, newRefresh);
        return true;
      }
    }
  } catch (err) {
    console.warn('[AdminAPI] Refresh token error:', err);
  }

  return false;
}

/**
 * Authenticated Fetch wrapper
 */
async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  retries = 1,
): Promise<{ success: boolean; data?: T; message?: string; error?: string }> {
  try {
    let token = getStoredToken();

    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };
    if (typeof FormData === 'undefined' || !(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
    const res = await fetch(url, { ...options, headers });

    // Handle token expiration
    if (res.status === 401 && retries > 0) {
      const refreshed = await tryRefreshToken();
      if (refreshed) {
        return request<T>(endpoint, options, retries - 1);
      }
      clearStoredTokens();
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      return {
        success: false,
        error: 'Session expired. Please sign in again.',
      };
    }

    const json = await res.json().catch(() => null);

    if (!res.ok) {
      return {
        success: false,
        error: json?.message || `HTTP error ${res.status}`,
      };
    }

    return {
      success: true,
      data: json?.data !== undefined ? json.data : json,
      message: json?.message,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Network request failed',
    };
  }
}

export const adminApi = {
  // Auth
  auth: {
    login: async (email: string, password: string) => {
      const res = await fetch(`${API_BASE}/auth/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (res.ok && json?.data?.accessToken) {
        setStoredTokens(json.data.accessToken, json.data.refreshToken);
        if (json.data.user) {
          setStoredUser(json.data.user);
        }
      }
      return json;
    },
    logout: () => {
      clearStoredTokens();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    },
    getUser: () => getStoredUser(),
    refreshUser: async (): Promise<AdminUser | null> => {
      const res = await request<AdminUser>('/admin/users/me');
      if (res.success && res.data) {
        setStoredUser(res.data);
        return res.data;
      }
      return getStoredUser();
    },
    isAuthenticated: () => !!getStoredToken(),
  },

  // Dashboard Metrics
  dashboard: {
    getMetrics: (period: DashboardPeriod = '7') =>
      request<AdminDashboardResponse>(`/admin/dashboard?period=${period}`),
  },

  activity: {
    getAll: (params: {
      page?: number;
      limit?: number;
      module?: string;
      action?: string;
      actor?: string;
      search?: string;
      from?: string;
      to?: string;
    }) => {
      const query = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value) query.set(key, String(value));
      }
      return request<AdminAuditListResponse>(`/admin/activity?${query.toString()}`);
    },
  },

  // Products
  products: {
    getAll: (params?: { page?: number; limit?: number; search?: string; category?: string }) => {
      const query = new URLSearchParams();
      if (params?.page) query.set('page', params.page.toString());
      if (params?.limit) query.set('limit', params.limit.toString());
      if (params?.search) query.set('search', params.search);
      if (params?.category && params.category !== 'All') query.set('category', params.category);
      const qs = query.toString();
      return request<any>(`/admin/products${qs ? `?${qs}` : ''}`);
    },
    getById: (id: string) =>
      request<any>(`/admin/products/${encodeURIComponent(id)}`),
    create: (payload: any) =>
      request<any>('/admin/products', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    uploadImage: (file: File) => {
      const body = new FormData();
      body.append('file', file);
      return request<{ url: string; publicId: string }>('/admin/products/images/upload', {
        method: 'POST',
        body,
      });
    },
    destroyImage: (publicId: string) =>
      request<void>('/admin/products/images/cleanup', {
        method: 'DELETE',
        body: JSON.stringify({ publicId }),
      }),
    update: (id: string, payload: any) =>
      request<any>(`/admin/products/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    archive: (id: string) =>
      request<any>(`/admin/products/${id}/archive`, {
        method: 'PATCH',
      }),
    restore: (id: string) =>
      request<any>(`/admin/products/${id}/restore`, {
        method: 'PATCH',
      }),
    deletePermanent: (id: string) =>
      request<any>(`/admin/products/${id}/permanent`, {
        method: 'DELETE',
      }),
    delete: (id: string) =>
      request<any>(`/admin/products/${id}/permanent`, {
        method: 'DELETE',
      }),
  },

  // Orders
  orders: {
    getAll: (params?: { page?: number; limit?: number; status?: string; search?: string }) => {
      const query = new URLSearchParams();
      if (params?.page) query.set('page', params.page.toString());
      if (params?.limit) query.set('limit', params.limit.toString());
      if (params?.status && params.status !== 'ALL') query.set('status', params.status);
      if (params?.search) query.set('search', params.search);
      const qs = query.toString();
      return request<any>(`/admin/orders${qs ? `?${qs}` : ''}`);
    },
    getById: (id: string) => request<any>(`/admin/orders/${encodeURIComponent(id.trim())}`),
    updateStatus: (id: string, status: string, adminNotes?: string) =>
      request<any>(`/admin/orders/${encodeURIComponent(id.trim())}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, adminNotes }),
      }),
    update: (id: string, payload: any) =>
      request<any>(`/admin/orders/${encodeURIComponent(id.trim())}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
  },

  // Reviews
  reviews: {
    getAll: (params?: { page?: number; limit?: number; status?: string }) => {
      const query = new URLSearchParams();
      if (params?.page) query.set('page', params.page.toString());
      if (params?.limit) query.set('limit', params.limit.toString());
      if (params?.status && params.status !== 'ALL') query.set('status', params.status);
      const qs = query.toString();
      return request<AdminReviewListResponse>(`/admin/reviews${qs ? `?${qs}` : ''}`);
    },
    sendFeedback: (id: string, feedback: string) =>
      request<Pick<AdminReview, 'id' | 'adminFeedback' | 'adminFeedbackAt'>>(
        `/admin/reviews/${encodeURIComponent(id)}/feedback`,
        { method: 'PATCH', body: JSON.stringify({ feedback }) },
      ),
    updateStatus: (id: string, status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'HIDDEN') =>
      request<Pick<AdminReview, 'id' | 'status'>>(
        `/admin/reviews/${encodeURIComponent(id)}/status`,
        { method: 'PATCH', body: JSON.stringify({ status }) },
      ),
  },

  // Inventory
  inventory: {
    getAll: (params?: { page?: number; limit?: number; filter?: string; search?: string }) => {
      const query = new URLSearchParams();
      if (params?.page) query.set('page', params.page.toString());
      if (params?.limit) query.set('limit', params.limit.toString());
      if (params?.filter && params.filter !== 'ALL') query.set('filter', params.filter);
      if (params?.search) query.set('search', params.search);
      const qs = query.toString();
      return request<any>(`/admin/inventory${qs ? `?${qs}` : ''}`);
    },
    adjustStock: (
      variantId: string,
      quantityChange: number,
      type = 'ADJUSTMENT',
      note?: string,
      reason?: string,
    ) =>
      request<any>('/admin/inventory/adjust', {
        method: 'POST',
        body: JSON.stringify({ variantId, quantityChange, type, note, reason }),
      }),
    getHistory: (variantId: string) =>
      request<any>(`/admin/inventory/${variantId}/history`),
  },


  // Categories
  categories: {
    getAll: () => request<any[]>('/admin/categories'),
    create: (data: { name: string; description?: string; image?: string; sortOrder?: number }) =>
      request<any>('/admin/categories', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  // Customers
  customers: {
    getAll: (params?: { page?: number; limit?: number; search?: string; status?: string }) => {
      const query = new URLSearchParams();
      if (params?.page) query.set('page', params.page.toString());
      if (params?.limit) query.set('limit', params.limit.toString());
      if (params?.search) query.set('search', params.search);
      if (params?.status) query.set('status', params.status);
      const qs = query.toString();
      return request<any>(`/admin/customers${qs ? `?${qs}` : ''}`);
    },
    getById: (id: string) => request<any>(`/admin/customers/${id}`),
    sendResetPassword: (id: string) =>
      request<any>(`/admin/customers/${id}/reset-password`, {
        method: 'POST',
      }),
    updateStatus: (id: string, payload: { isActive: boolean; reason?: string }) =>
      request<any>(`/admin/customers/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    softDelete: (id: string) =>
      request<any>(`/admin/customers/${id}/soft`, {
        method: 'DELETE',
      }),
    restore: (id: string) =>
      request<any>(`/admin/customers/${id}/restore`, {
        method: 'POST',
      }),
    permanentDelete: (id: string, payload: { confirm: boolean; reason?: string }) =>
      request<any>(`/admin/customers/${id}/permanent`, {
        method: 'DELETE',
        body: JSON.stringify(payload),
      }),
    getArchives: (params?: { page?: number; limit?: number; search?: string }) => {
      const query = new URLSearchParams();
      if (params?.page) query.set('page', params.page.toString());
      if (params?.limit) query.set('limit', params.limit.toString());
      if (params?.search) query.set('search', params.search);
      const qs = query.toString();
      return request<any>(`/admin/customers/archives${qs ? `?${qs}` : ''}`);
    },
    getArchiveById: (id: string) => request<any>(`/admin/customers/archives/${id}`),
  },

  // Coupons
  coupons: {
    getAll: () => request<AdminCoupon[]>('/admin/coupons'),
    create: (payload: CreateCouponPayload) =>
      request<AdminCoupon>('/admin/coupons', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    update: (id: string, payload: Partial<CreateCouponPayload>) =>
      request<AdminCoupon>(`/admin/coupons/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    delete: (id: string) =>
      request<AdminCoupon>(`/admin/coupons/${id}`, {
        method: 'DELETE',
      }),
  },

  // Store Settings
  settings: {
    get: () => request<any>('/admin/settings'),
    update: (payload: any) =>
      request<any>('/admin/settings', {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
  },

  // Staff & Role Management
  users: {
    getMe: () => request<StaffUser>('/admin/users/me'),
    getAll: () => request<StaffUser[]>('/admin/users'),
    getById: (id: string) => request<StaffUser>(`/admin/users/${id}`),
    create: (payload: CreateStaffUserPayload) =>
      request<StaffUser>('/admin/users', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    update: (id: string, payload: UpdateStaffUserPayload) =>
      request<StaffUser>(`/admin/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    delete: (id: string) =>
      request<{ message: string }>(`/admin/users/${id}`, {
        method: 'DELETE',
      }),
    changePassword: (payload: ChangePasswordPayload) =>
      request<{ message: string }>('/admin/users/me/change-password', {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
  },
};
