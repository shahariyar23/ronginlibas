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
  role: string;
  type: string;
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
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

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
    isAuthenticated: () => !!getStoredToken(),
  },

  // Dashboard Metrics
  dashboard: {
    getMetrics: () => request<any>('/admin/dashboard'),
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
    update: (id: string, payload: any) =>
      request<any>(`/admin/products/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    delete: (id: string) =>
      request<any>(`/admin/products/${id}`, {
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
    adjustStock: (variantId: string, quantityChange: number, type = 'ADJUSTMENT', note?: string) =>
      request<any>('/admin/inventory/adjust', {
        method: 'POST',
        body: JSON.stringify({ variantId, quantityChange, type, note }),
      }),
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
    getAll: (params?: { page?: number; limit?: number; search?: string }) => {
      const query = new URLSearchParams();
      if (params?.page) query.set('page', params.page.toString());
      if (params?.limit) query.set('limit', params.limit.toString());
      if (params?.search) query.set('search', params.search);
      const qs = query.toString();
      return request<any>(`/admin/customers${qs ? `?${qs}` : ''}`);
    },
    getById: (id: string) => request<any>(`/admin/customers/${id}`),
  },

  // Coupons
  coupons: {
    getAll: () => request<any[]>('/admin/coupons'),
    create: (payload: any) =>
      request<any>('/admin/coupons', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    update: (id: string, payload: any) =>
      request<any>(`/admin/coupons/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
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
};
