'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  AdminProduct,
  AdminProductDetail,
  AdminOrder,
  InventoryItem,
  StoreSettings,
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_INVENTORY,
  INITIAL_SETTINGS,
} from '@/data/adminData';
import { adminApi } from '@/lib/api';
import { useToast } from '@/context/ToastContext';

interface AdminCategoryRecord {
  id: string;
  name: string;
  slug: string;
}

interface AdminContextType {
  products: AdminProduct[];
  orders: AdminOrder[];
  inventory: InventoryItem[];
  settings: StoreSettings;
  dashboardMetrics: any;
  backendConnected: boolean;
  isLoading: boolean;
  refreshData: () => Promise<void>;
  addProduct: (product: AdminProduct) => Promise<void>;
  updateProduct: (id: string, product: Partial<AdminProduct>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  getProductDetails: (id: string) => Promise<AdminProductDetail | null>;
  updateOrderStatus: (orderId: string, status: AdminOrder['status'], notes?: string) => Promise<void>;
  updateInventoryStock: (id: string, newStock: number) => Promise<void>;
  updateSettings: (newSettings: Partial<StoreSettings>) => Promise<void>;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

// Helper adapter functions to normalize backend REST entities into Atelier Admin types
function adaptBackendProduct(p: any): AdminProduct {
  const stock =
    p.variants && p.variants.length > 0
      ? p.variants.reduce((sum: number, v: any) => sum + (v.stock || 0), 0)
      : p.stock ?? 0;

  let status: AdminProduct['status'] = 'Active';
  if (p.isActive === false || stock === 0) {
    status = 'Out of Stock';
  } else if (stock <= 5) {
    status = 'Low Stock';
  }

  return {
    id: p.id,
    name: p.name,
    sku: p.sku,
    category: p.category?.name || p.category || 'Panjabi',
    price: Number(p.price) || 0,
    promotionalPrice: p.compareAtPrice ? Number(p.compareAtPrice) : undefined,
    costOfGoods: p.costPrice ? Number(p.costPrice) : undefined,
    stock,
    status,
    image:
      p.images?.[0]?.url ||
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCKIcKxrkusL16CkM0fjAd340aZTnxr8o_tmugD7XS3cCDAG8yST04u91rCr7OrIxBUE3yNHckrJmRo81EtZGj8lTJHQgDVroNkj2CKu-ot-pwOAH0mcutBcSZUQfz7_-Ar5PUCPtpyOke4D81SjQQyrYnZs7hzWHiKTY0UnNT3WJuv-NAxhFJD5qK4YN7AOBd5nyfFy6KXxGhKLvjxG_EWE4pBc61A0x4zW4Oz-Fnn2JvqDoxPl3_PKQ',
    fabricNote: p.fabric || undefined,
    description: p.description,
    featured: p.isFeatured,
  };
}

function adaptBackendOrder(o: any): AdminOrder {
  const d = new Date(o.createdAt || Date.now());
  const dateStr = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeDetail = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const customerName = o.customer
    ? `${o.customer.firstName || ''} ${o.customer.lastName || ''}`.trim()
    : o.shippingAddress?.recipient || 'Patron Client';

  const customerLocation =
    o.shippingAddress?.address || o.shippingAddress?.city || 'Dhaka, Bangladesh';

  const phone = o.customer?.phone || o.shippingAddress?.phone || '';
  const items = o.items || [];
  const itemCount = items.reduce((sum: number, it: any) => sum + (it.quantity || 1), 0);
  const itemsSummary =
    items.map((it: any) => `${it.productName || 'Garment'} (x${it.quantity})`).join(', ') ||
    '';

  return {
    id: o.id || o.orderNumber,
    orderNumber: o.orderNumber || o.id,
    customerName,
    customerLocation,
    phone,
    amount: Number(o.totalAmount || o.subtotal) || 0,
    paymentMethod: o.paymentMethod || 'COD',
    status: o.status || 'PENDING',
    dateStr,
    timeDetail,
    itemCount: itemCount || 1,
    itemsSummary,
    createdAt: o.createdAt,
  };
}

function adaptBackendInventory(item: any): InventoryItem {
  const stock = item.stock ?? 0;
  const status =
    stock === 0 ? 'OUT OF STOCK' : stock <= 5 ? 'LOW STOCK' : 'IN STOCK';

  return {
    id: item.variantId || item.id,
    name: item.productName || item.name,
    subtitle: item.subtitle || item.fabric || 'Atelier Standard Weave',
    sku: item.sku,
    category: item.category || 'Atelier Garments',
    stock,
    status: status as any,
    image:
      item.image ||
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCKIcKxrkusL16CkM0fjAd340aZTnxr8o_tmugD7XS3cCDAG8yST04u91rCr7OrIxBUE3yNHckrJmRo81EtZGj8lTJHQgDVroNkj2CKu-ot-pwOAH0mcutBcSZUQfz7_-Ar5PUCPtpyOke4D81SjQQyrYnZs7hzWHiKTY0UnNT3WJuv-NAxhFJD5qK4YN7AOBd5nyfFy6KXxGhKLvjxG_EWE4pBc61A0x4zW4Oz-Fnn2JvqDoxPl3_PKQ',
  };
}

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<AdminProduct[]>(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<AdminOrder[]>(INITIAL_ORDERS);
  const [categories, setCategories] = useState<AdminCategoryRecord[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [settings, setSettings] = useState<StoreSettings>(INITIAL_SETTINGS);
  const [dashboardMetrics, setDashboardMetrics] = useState<any>(null);
  const [backendConnected, setBackendConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { toast } = useToast();

  // Fetch all primary operational streams from the NestJS Backend including executive dashboard API
  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [dashRes, prodRes, ordRes, invRes, setRes, categoriesRes] = await Promise.all([
        adminApi.dashboard.getMetrics(),
        adminApi.products.getAll({ limit: 50 }),
        adminApi.orders.getAll({ limit: 50 }),
        adminApi.inventory.getAll({ limit: 50 }),
        adminApi.settings.get(),
        adminApi.categories.getAll(),
      ]);

      let anySuccess = false;

      if (dashRes.success && dashRes.data) {
        setDashboardMetrics(dashRes.data);
        anySuccess = true;
      }

      if (prodRes.success && prodRes.data?.items?.length) {
        setProducts(prodRes.data.items.map(adaptBackendProduct));
        anySuccess = true;
      }

      if (ordRes.success && ordRes.data?.items?.length) {
        setOrders(ordRes.data.items.map(adaptBackendOrder));
        anySuccess = true;
      }

      if (invRes.success && invRes.data?.items?.length) {
        setInventory(invRes.data.items.map(adaptBackendInventory));
        anySuccess = true;
      }

      if (setRes.success && setRes.data) {
        setSettings((prev) => ({
          ...prev,
          storeName: setRes.data.storeName || prev.storeName,
          phone: setRes.data.phone || prev.phone,
          whatsapp: setRes.data.whatsapp || prev.whatsapp,
          website: setRes.data.website || prev.website,
          facebook: setRes.data.facebook || prev.facebook,
          dhakaDeliveryCharge: setRes.data.dhakaDeliveryCharge ?? prev.dhakaDeliveryCharge,
          outsideDhakaDeliveryCharge:
            setRes.data.outsideDhakaDeliveryCharge ?? prev.outsideDhakaDeliveryCharge,
          freeDeliveryThreshold:
            setRes.data.freeDeliveryThreshold ?? prev.freeDeliveryThreshold,
          codEnabled: setRes.data.codEnabled ?? prev.codEnabled,
          bkashEnabled: setRes.data.bkashEnabled ?? prev.bkashEnabled,
          bkashWallet: setRes.data.bkashWallet || prev.bkashWallet,
          nagadEnabled: setRes.data.nagadEnabled ?? prev.nagadEnabled,
          nagadWallet: setRes.data.nagadWallet || prev.nagadWallet,
        }));
        anySuccess = true;
      }
      if (categoriesRes.success && Array.isArray(categoriesRes.data)) {
        setCategories(categoriesRes.data);
        anySuccess = true;
      }

      setBackendConnected(anySuccess || dashRes.success || prodRes.success || ordRes.success);
    } catch (err) {
      console.warn('[AdminContext] Backend synchronization error, using local fallback:', err);
      setBackendConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Create Product: Sync to NestJS + PostgreSQL
  const addProduct = async (product: AdminProduct) => {
    const selectedCategory = categories.find(
      (category) =>
        category.name.trim().toLowerCase() === product.category.trim().toLowerCase() ||
        category.slug.trim().toLowerCase() === product.category.trim().toLowerCase(),
    );
    if (!selectedCategory) {
      toast.error(`Create or select a valid product category for "${product.category}" first`);
      return;
    }

    // Send payload to backend
    try {
      const payload = {
        name: product.name,
        sku: product.sku,
        price: product.price,
        compareAtPrice: product.promotionalPrice,
        costPrice: product.costOfGoods,
        categoryId: selectedCategory.id,
        description: product.description,
        fabric: product.fabricNote,
        isActive: product.status !== 'Out of Stock',
        isFeatured: product.featured ?? false,
        variants: product.variants?.length
          ? product.variants.map((v) => ({
              size: v.size,
              color: v.shade,
              sku: v.sku,
              stock: v.stock,
              priceOverride: v.price,
            }))
          : [
              {
                size: 'Standard',
                color: 'Heritage Collection',
                sku: `${product.sku}-STD`,
                stock: product.stock,
                priceOverride: product.price,
              },
            ],
        images: [{ url: product.image, isPrimary: true, sortOrder: 0 }],
      };

      const res = await adminApi.products.create(payload);
      if (res.success && res.data) {
        toast.success(res.message || `Consignment "${product.name}" created successfully`, 'PRODUCT CREATED');
        await refreshData();
      } else {
        toast.error(res.error || 'Failed to create product consignment');
      }
    } catch (err: any) {
      console.warn('[AdminContext] Error pushing product to backend:', err);
      toast.error(err?.message || 'Error pushing product to backend');
    }
  };

  // Update Product
  const updateProduct = async (id: string, updated: Partial<AdminProduct>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updated } : p))
    );

    try {
      const payload: Record<string, any> = {
        name: updated.name,
        price: updated.price,
        compareAtPrice: updated.promotionalPrice,
        costPrice: updated.costOfGoods,
        sku: updated.sku,
        description: updated.description,
        fabric: updated.fabricNote,
        isFeatured: updated.featured,
        tags: updated.tags,
      };

      if (updated.image) {
        payload.images = [{ url: updated.image, isPrimary: true, sortOrder: 0 }];
      }

      if (updated.variants && Array.isArray(updated.variants)) {
        payload.variants = updated.variants.map((v: any) => ({
          size: v.size,
          color: v.color || v.shade || 'Standard',
          sku: v.sku,
          stock: Number(v.stock) || 0,
          priceOverride: v.priceOverride !== undefined ? Number(v.priceOverride) : (v.price !== undefined ? Number(v.price) : undefined),
        }));
      }

      const res = await adminApi.products.update(id, payload);
      if (res.success) {
        toast.success(res.message || `Product "${updated.name || id}" updated successfully`, 'PRODUCT UPDATED');
        await refreshData();
      } else {
        toast.error(res.error || 'Failed to update product');
      }
    } catch (err: any) {
      console.warn('[AdminContext] Error updating product in backend:', err);
      toast.error(err?.message || 'Error updating product');
    }
  };

  // Delete / Permanently Remove Product
  const deleteProduct = async (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setInventory((prev) => prev.filter((item) => item.id !== id));
    try {
      const res = await adminApi.products.delete(id);
      if (res.success) {
        toast.success(res.message || 'Product permanently deleted from database', 'PRODUCT DELETED');
        await refreshData();
      } else {
        toast.error(res.error || 'Failed to delete product from database');
        await refreshData();
      }
    } catch (err: any) {
      console.warn('[AdminContext] Error deleting product from backend:', err);
      toast.error(err?.message || 'Error deleting product from database');
      await refreshData();
    }
  };

  const getProductDetails = async (id: string): Promise<AdminProductDetail | null> => {
    try {
      const res = await adminApi.products.getById(id);
      if (res.success && res.data) {
        return res.data;
      }
    } catch (err: any) {
      console.warn('[AdminContext] Error fetching product details:', err);
    }
    return null;
  };

  // Update Order Status (e.g. PENDING -> CONFIRMED -> PROCESSING -> SHIPPED -> DELIVERED)
  const updateOrderStatus = async (
    orderId: string,
    status: AdminOrder['status'],
    notes?: string,
  ) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId || o.orderNumber === orderId ? { ...o, status } : o
      )
    );

    try {
      const res = await adminApi.orders.updateStatus(orderId, status, notes);
      if (res.success) {
        toast.success(
          res.message || `Order status transitioned to ${status} successfully`,
          'ORDER UPDATED'
        );
      } else {
        toast.error(res.error || 'Failed to update order status');
      }
    } catch (err: any) {
      console.warn('[AdminContext] Error updating order status in backend:', err);
      toast.error(err?.message || 'Error updating order status in backend');
    }
  };

  // Update Inventory Stock Count
  const updateInventoryStock = async (id: string, newStock: number) => {
    const stockVal = Math.max(0, newStock);
    const existing = inventory.find((it) => it.id === id);
    const prevStock = existing ? existing.stock : 0;
    const delta = stockVal - prevStock;

    setInventory((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              stock: stockVal,
              status: stockVal === 0 ? 'OUT OF STOCK' : stockVal <= 5 ? 'LOW STOCK' : 'IN STOCK',
            }
          : item
      )
    );

    try {
      if (delta !== 0) {
        const res = await adminApi.inventory.adjustStock(
          id,
          delta,
          delta > 0 ? 'RESTOCK' : 'ADJUSTMENT',
          `Manual stock adjustment via Atelier Admin (${delta > 0 ? '+' : ''}${delta})`
        );
        if (res.success) {
          toast.success(
            res.message || `Inventory stock adjusted to ${stockVal} units`,
            'INVENTORY UPDATED'
          );
        } else {
          toast.error(res.error || 'Failed to update inventory stock');
        }
      }
    } catch (err: any) {
      console.warn('[AdminContext] Error adjusting stock in backend:', err);
      toast.error(err?.message || 'Failed to adjust stock in backend');
    }
  };

  // Update Store Settings
  const updateSettings = async (newSettings: Partial<StoreSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));

    try {
      const res = await adminApi.settings.update(newSettings);
      if (res.success) {
        toast.success(res.message || 'Store settings saved successfully', 'SETTINGS SAVED');
      } else {
        toast.error(res.error || 'Failed to save settings');
      }
    } catch (err: any) {
      console.warn('[AdminContext] Error updating store settings in backend:', err);
      toast.error(err?.message || 'Failed to update settings');
    }
  };

  return (
    <AdminContext.Provider
      value={{
        products,
        orders,
        inventory,
        settings,
        dashboardMetrics,
        backendConnected,
        isLoading,
        refreshData,
        addProduct,
        updateProduct,
        deleteProduct,
        getProductDetails,
        updateOrderStatus,
        updateInventoryStock,
        updateSettings,
        searchQuery,
        setSearchQuery,
        isSearchOpen,
        setIsSearchOpen,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
