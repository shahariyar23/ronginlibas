'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  AdminProduct,
  AdminProductDetail,
  AdminOrder,
  InventoryItem,
  InventoryTransactionRecord,
  StoreSettings,
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_INVENTORY,
  INITIAL_SETTINGS,
} from '@/data/adminData';

import { AdminDashboardResponse, DashboardPeriod, adminApi } from '@/lib/api';
import { useToast } from '@/context/ToastContext';

export interface AdminCategoryRecord {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
}

const DEFAULT_FALLBACK_CATEGORIES: AdminCategoryRecord[] = [
  { id: 'cat-panjabi', name: 'Panjabi', slug: 'panjabi' },
  { id: 'cat-shirts', name: 'Shirts', slug: 'shirts' },
  { id: 'cat-polo', name: 'Polo', slug: 'polo' },
  { id: 'cat-trousers', name: 'Trousers', slug: 'trousers' },
  { id: 'cat-t-shirts', name: 'T-Shirts', slug: 't-shirts' },
];

interface AdminContextType {
  categories: AdminCategoryRecord[];
  products: AdminProduct[];
  orders: AdminOrder[];
  inventory: InventoryItem[];
  settings: StoreSettings;
  dashboardMetrics: AdminDashboardResponse | null;
  dashboardLoading: boolean;
  dashboardError: string | null;
  backendConnected: boolean;
  isLoading: boolean;
  inventoryLoadError: string | null;
  refreshData: () => Promise<void>;
  refreshDashboard: (period?: DashboardPeriod) => Promise<boolean>;
  addProduct: (product: AdminProduct) => Promise<boolean>;
  updateProduct: (id: string, product: Partial<AdminProduct>) => Promise<boolean>;
  archiveProduct: (id: string) => Promise<boolean>;
  restoreProduct: (id: string) => Promise<boolean>;
  deleteProduct: (id: string) => Promise<boolean>;
  getProductDetails: (id: string) => Promise<AdminProductDetail | null>;
  updateOrderStatus: (orderId: string, status: AdminOrder['status'], notes?: string) => Promise<boolean>;
  updateInventoryStock: (
    id: string,
    newStock: number,
    reason?: string,
    note?: string,
  ) => Promise<boolean>;
  getVariantHistory: (variantId: string) => Promise<InventoryTransactionRecord[]>;
  updateSettings: (newSettings: Partial<StoreSettings>) => Promise<boolean>;

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

  const threshold =
    p.alertThreshold !== undefined && p.alertThreshold !== null ? Number(p.alertThreshold) : 5;

  const isArchived = p.isActive === false || Boolean(p.deletedAt);
  let status: AdminProduct['status'] = 'Active';
  if (isArchived) {
    status = 'Archived';
  } else if (stock === 0) {
    status = 'Out of Stock';
  } else if (stock <= threshold) {
    status = 'Low Stock';
  }

  return {
    id: p.id,
    name: p.name,
    sku: p.sku,
    category: p.category?.name || p.category || 'Panjabi',
    categoryId: p.categoryId || p.category?.id || undefined,
    price: Number(p.price) || 0,
    promotionalPrice: p.compareAtPrice ? Number(p.compareAtPrice) : undefined,
    costOfGoods: p.costPrice ? Number(p.costPrice) : undefined,
    stock,
    alertThreshold: threshold,
    status,
    isActive: p.isActive,
    deletedAt: p.deletedAt,
    image:
      p.images?.[0]?.url ||
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCKIcKxrkusL16CkM0fjAd340aZTnxr8o_tmugD7XS3cCDAG8yST04u91rCr7OrIxBUE3yNHckrJmRo81EtZGj8lTJHQgDVroNkj2CKu-ot-pwOAH0mcutBcSZUQfz7_-Ar5PUCPtpyOke4D81SjQQyrYnZs7hzWHiKTY0UnNT3WJuv-NAxhFJD5qK4YN7AOBd5nyfFy6KXxGhKLvjxG_EWE4pBc61A0x4zW4Oz-Fnn2JvqDoxPl3_PKQ',
    images: p.images?.map((image: any) => ({
      url: image.url,
      publicId: image.publicId ?? undefined,
      altText: image.altText ?? undefined,
      sortOrder: image.sortOrder,
      isPrimary: image.isPrimary,
    })),
    fabricNote: p.fabric || undefined,
    description: p.description,
    tags: Array.isArray(p.tags) ? p.tags : [],
    featured: p.isFeatured,
    isNewArrival: Boolean(p.isNewArrival),
    isBestSeller: Boolean(p.isBestSeller),
  };
}

function adaptBackendOrder(o: any): AdminOrder {
  const d = new Date(o.createdAt || Date.now());
  const dateStr = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeDetail = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const rawAddr = o.shippingAddress && typeof o.shippingAddress === 'object' ? o.shippingAddress : {};
  const customerName = o.customer
    ? `${o.customer.firstName || ''} ${o.customer.lastName || ''}`.trim()
    : rawAddr.fullName || o.guestName || 'Patron Client';

  const customerEmail = o.customer?.email || o.guestEmail || rawAddr.email || undefined;
  const phone = o.customer?.phone || rawAddr.phone || o.guestPhone || '';

  const locationParts = [
    rawAddr.addressLine1 || rawAddr.address,
    rawAddr.city,
    rawAddr.division,
  ].filter(Boolean);
  const customerLocation = locationParts.length > 0 ? locationParts.join(', ') : 'Dhaka, Bangladesh';

  const items = (o.items || []).map((it: any) => {
    const primaryImg =
      it.product?.images?.find((img: any) => img.isPrimary)?.url ||
      it.product?.images?.[0]?.url ||
      (typeof it.product?.images?.[0] === 'string' ? it.product.images[0] : undefined) ||
      (typeof it.image === 'string' ? it.image : undefined);

    return {
      id: it.id,
      productId: it.productId,
      variantId: it.variantId,
      productName: it.productName || it.product?.name || 'Garment',
      variantName: it.variantName || (it.size ? `Size ${it.size}` : undefined),
      sku: it.sku,
      size: it.size,
      color: it.color,
      quantity: Number(it.quantity) || 1,
      unitPrice: Number(it.unitPrice) || 0,
      subtotal: Number(it.subtotal) || (Number(it.unitPrice) || 0) * (Number(it.quantity) || 1),
      image: primaryImg,
    };
  });

  const itemCount = items.reduce((sum: number, it: any) => sum + (it.quantity || 1), 0);
  const itemsSummary =
    items.map((it: any) => `${it.productName} (x${it.quantity})`).join(', ') || '';

  return {
    id: o.id || o.orderNumber,
    orderNumber: o.orderNumber || o.id,
    customerName,
    customerEmail,
    customerLocation,
    fullAddress: {
      fullName: rawAddr.fullName || customerName,
      phone: rawAddr.phone || phone,
      email: rawAddr.email || customerEmail,
      addressLine1: rawAddr.addressLine1 || rawAddr.address || '',
      addressLine2: rawAddr.addressLine2 || '',
      city: rawAddr.city || '',
      division: rawAddr.division || '',
      deliveryInstructions: rawAddr.deliveryInstructions || undefined,
    },
    phone,
    amount: Number(o.totalAmount ?? o.subtotal) || 0,
    subtotal: Number(o.subtotal) || Number(o.totalAmount) || 0,
    discountAmount: Number(o.discountAmount) || 0,
    deliveryCharge: Number(o.deliveryCharge) || 0,
    paymentMethod: o.paymentMethod || 'COD',
    paymentStatus: o.paymentStatus || 'PENDING',
    status: o.status || 'PENDING',
    dateStr,
    timeDetail,
    itemCount: itemCount || 1,
    itemsSummary,
    items,
    customerNotes: o.customerNotes || undefined,
    adminNotes: o.adminNotes || undefined,
    courierName: o.courierName || undefined,
    trackingNumber: o.trackingNumber || undefined,
    trackingUrl: o.trackingUrl || undefined,
    createdAt: o.createdAt,
  };
}

function adaptBackendInventory(item: any): InventoryItem {
  const alertThreshold =
    item.alertThreshold === undefined || item.alertThreshold === null
      ? 5
      : Number(item.alertThreshold);
  const available = item.available !== undefined ? Number(item.available) : (item.stock ?? 0);
  const reserved = item.reserved !== undefined ? Number(item.reserved) : 0;
  const onHand = item.onHand !== undefined ? Number(item.onHand) : (available + reserved);
  const rawStatus =
    item.status ||
    (available <= 0
      ? 'OUT OF STOCK'
      : available <= alertThreshold
      ? 'LOW STOCK'
      : 'IN STOCK');
  const status = rawStatus.replace('_', ' ');

  return {
    id: item.variantId || item.id,
    variantId: item.variantId || item.id,
    productId: item.productId,
    name: item.productName || item.name,
    subtitle: item.subtitle || item.fabric || 'Atelier Standard Weave',
    sku: item.sku,
    category: item.category || 'Atelier Garments',
    size: item.size || 'M',
    color: item.color || 'Standard',
    onHand,
    reserved,
    available,
    stock: available,
    alertThreshold,
    status: status as any,
    image:
      item.image ||
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCKIcKxrkusL16CkM0fjAd340aZTnxr8o_tmugD7XS3cCDAG8yST04u91rCr7OrIxBUE3yNHckrJmRo81EtZGj8lTJHQgDVroNkj2CKu-ot-pwOAH0mcutBcSZUQfz7_-Ar5PUCPtpyOke4D81SjQQyrYnZs7hzWHiKTY0UnNT3WJuv-NAxhFJD5qK4YN7AOBd5nyfFy6KXxGhKLvjxG_EWE4pBc61A0x4zW4Oz-Fnn2JvqDoxPl3_PKQ',
  };
}


export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<AdminProduct[]>(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<AdminOrder[]>(INITIAL_ORDERS);
  const [categories, setCategories] = useState<AdminCategoryRecord[]>(DEFAULT_FALLBACK_CATEGORIES);
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [settings, setSettings] = useState<StoreSettings>(INITIAL_SETTINGS);
  const [dashboardMetrics, setDashboardMetrics] = useState<AdminDashboardResponse | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState<boolean>(true);
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  const dashboardRequestId = useRef(0);
  const [backendConnected, setBackendConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [inventoryLoadError, setInventoryLoadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { toast } = useToast();

  const refreshDashboard = useCallback(
    async (period: DashboardPeriod = '7'): Promise<boolean> => {
      const requestId = ++dashboardRequestId.current;
      setDashboardLoading(true);
      setDashboardError(null);
      setDashboardMetrics(null);

      try {
        const response = await adminApi.dashboard.getMetrics(period);
        if (!response.success || !response.data) {
          throw new Error(response.error || 'Unable to load dashboard data.');
        }
        if (requestId !== dashboardRequestId.current) return false;

        setDashboardMetrics(response.data);
        return true;
      } catch (error) {
        if (requestId !== dashboardRequestId.current) return false;
        const message =
          error instanceof Error ? error.message : 'Unable to load dashboard data.';
        setDashboardMetrics(null);
        setDashboardError(message);
        toast.error(message, 'DASHBOARD DATA UNAVAILABLE');
        return false;
      } finally {
        if (requestId === dashboardRequestId.current) setDashboardLoading(false);
      }
    },
    [toast],
  );

  // Fetch all primary operational streams from the NestJS Backend including executive dashboard API
  const refreshData = useCallback(async () => {
    setIsLoading(true);
    setInventoryLoadError(null);
    try {
      const [dashboardLoaded, prodRes, ordRes, invRes, setRes, categoriesRes] = await Promise.all([
        refreshDashboard('7'),
        adminApi.products.getAll({ limit: 50 }),
        adminApi.orders.getAll({ limit: 50 }),
        adminApi.inventory.getAll({ page: 1, limit: 100 }),
        adminApi.settings.get(),
        adminApi.categories.getAll(),
      ]);

      let anySuccess = false;

      anySuccess = dashboardLoaded;

      if (prodRes.success && Array.isArray(prodRes.data?.items)) {
        setProducts(prodRes.data.items.map(adaptBackendProduct));
        anySuccess = true;
      }

      if (ordRes.success && Array.isArray(ordRes.data?.items)) {
        setOrders(ordRes.data.items.map(adaptBackendOrder));
        anySuccess = true;
      }

      if (invRes.success && Array.isArray(invRes.data?.items)) {
        const inventoryItems = [...invRes.data.items];
        const totalPages = Number(invRes.data.totalPages) || 1;
        let inventoryComplete = true;

        for (let page = 2; page <= totalPages; page += 5) {
          const pageNumbers = Array.from(
            { length: Math.min(5, totalPages - page + 1) },
            (_, index) => page + index,
          );
          const pageResults = await Promise.all(
            pageNumbers.map((pageNumber) =>
              adminApi.inventory.getAll({ page: pageNumber, limit: 100 }),
            ),
          );
          const failedPage = pageResults.find(
            (result) => !result.success || !Array.isArray(result.data?.items),
          );

          if (failedPage) {
            setInventoryLoadError(failedPage.error || 'Unable to load all inventory records.');
            inventoryComplete = false;
            break;
          }
          inventoryItems.push(...pageResults.flatMap((result) => result.data!.items));
        }

        if (inventoryComplete) {
          setInventory(inventoryItems.map(adaptBackendInventory));
          setInventoryLoadError(null);
        }
        anySuccess = true;
      } else {
        setInventoryLoadError(invRes.error || 'Unable to load inventory from the database.');
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
          freeShippingEnabled: setRes.data.freeShippingEnabled ?? prev.freeShippingEnabled,
          freeDeliveryThreshold:
            setRes.data.freeDeliveryThreshold ?? prev.freeDeliveryThreshold,
          promoEnabled: setRes.data.promoEnabled ?? prev.promoEnabled,
          promoCode: setRes.data.promoCode ?? prev.promoCode,
          promoDiscountText: setRes.data.promoDiscountText ?? prev.promoDiscountText,
          whatsappOrderEnabled: setRes.data.whatsappOrderEnabled ?? prev.whatsappOrderEnabled,
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

      setBackendConnected(
        anySuccess || prodRes.success || ordRes.success || invRes.success,
      );
    } catch (err) {
      console.warn('[AdminContext] Backend synchronization error, using local fallback:', err);
      setBackendConnected(false);
      setInventoryLoadError('Unable to load inventory from the database. Try refreshing the page.');
    } finally {
      setIsLoading(false);
    }
  }, [refreshDashboard]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Create Product: Sync to NestJS + PostgreSQL
  const addProduct = async (product: AdminProduct): Promise<boolean> => {
    let currentCategories = categories;
    let selectedCategory = currentCategories.find(
      (category) =>
        category.name.trim().toLowerCase() === product.category.trim().toLowerCase() ||
        category.slug.trim().toLowerCase() === product.category.trim().toLowerCase(),
    );

    if (!selectedCategory) {
      try {
        const catRes = await adminApi.categories.getAll();
        if (catRes.success && Array.isArray(catRes.data) && catRes.data.length > 0) {
          setCategories(catRes.data);
          currentCategories = catRes.data;
          selectedCategory = currentCategories.find(
            (category: any) =>
              category.name?.trim().toLowerCase() === product.category.trim().toLowerCase() ||
              category.slug?.trim().toLowerCase() === product.category.trim().toLowerCase(),
          );
        }
      } catch {
        // Fallback continues
      }
    }

    if (!selectedCategory) {
      try {
        const createCatRes = await adminApi.categories.create({ name: product.category });
        if (createCatRes.success && createCatRes.data) {
          selectedCategory = createCatRes.data;
          setCategories((prev) => [...prev, createCatRes.data]);
        }
      } catch {
        // Fallback continues
      }
    }

    if (!selectedCategory) {
      toast.error(`Create or select a valid product category for "${product.category}" first`);
      return false;
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
        alertThreshold: product.alertThreshold !== undefined ? Number(product.alertThreshold) : 5,
        isActive: product.status !== 'Out of Stock',
        isFeatured: product.featured ?? false,
        isNewArrival: product.isNewArrival ?? false,
        isBestSeller: product.isBestSeller ?? false,
        tags: product.tags ?? [],
        variants: product.variants?.length
          ? product.variants.map((v) => ({
              size: v.size,
              sizeLabel: v.sizeLabel,
              sizeType: v.sizeType,
              measurements: v.measurements,
              color: v.color || v.shade,
              sku: v.sku,
              stock: v.stock,
              priceOverride: v.priceOverride ?? v.price,
            }))
          : [
              {
                size: 'Standard',
                sizeLabel: 'Standard',
                sizeType: 'CUSTOM',
                color: 'Heritage Collection',
                sku: `${product.sku}-STD`,
                stock: product.stock,
                priceOverride: product.price,
              },
            ],
        images: (product.images ??
          (product.image && !product.image.startsWith('data:')
            ? [{ url: product.image }]
            : [])
        ).map((image, index) => ({
          url: image.url,
          publicId: image.publicId,
          altText: image.altText,
          isPrimary: image.isPrimary ?? index === 0,
          sortOrder: image.sortOrder ?? index,
        })),
      };

      const res = await adminApi.products.create(payload);
      if (res.success && res.data) {
        toast.success(res.message || `Consignment "${product.name}" created successfully`, 'PRODUCT CREATED');
        await refreshData();
        return true;
      } else {
        toast.error(res.error || 'Failed to create product consignment');
        return false;
      }
    } catch (err: any) {
      console.warn('[AdminContext] Error pushing product to backend:', err);
      toast.error(err?.message || 'Error pushing product to backend');
      return false;
    }
  };

  // Update Product
  const updateProduct = async (id: string, updated: Partial<AdminProduct>): Promise<boolean> => {
    try {
      let categoryId = updated.categoryId;
      if (!categoryId && updated.category) {
        const found = categories.find(
          (c) =>
            c.id === updated.category ||
            c.name.toLowerCase() === updated.category!.toLowerCase() ||
            c.slug.toLowerCase() === updated.category!.toLowerCase(),
        );
        if (found) {
          categoryId = found.id;
        }
      }

      const payload: Record<string, any> = {
        name: updated.name,
        price: updated.price,
        compareAtPrice: updated.promotionalPrice,
        costPrice: updated.costOfGoods,
        sku: updated.sku,
        description: updated.description,
        fabric: updated.fabricNote,
        isFeatured: updated.featured,
        ...(updated.isNewArrival !== undefined && { isNewArrival: updated.isNewArrival }),
        ...(updated.isBestSeller !== undefined && { isBestSeller: updated.isBestSeller }),
        tags: updated.tags,
        ...(categoryId && { categoryId }),
        ...(updated.alertThreshold !== undefined && { alertThreshold: Number(updated.alertThreshold) }),
      };

      if (updated.images !== undefined) {
        payload.images = updated.images.map((image, index) => ({
          url: image.url,
          publicId: image.publicId,
          altText: image.altText,
          isPrimary: image.isPrimary ?? index === 0,
          sortOrder: image.sortOrder ?? index,
        }));
      } else if (updated.image) {
        payload.images = [{ url: updated.image, isPrimary: true, sortOrder: 0 }];
      }

      if (updated.variants && Array.isArray(updated.variants)) {
        payload.variants = updated.variants.map((v: any) => ({
          size: v.size,
          sizeLabel: v.sizeLabel,
          sizeType: v.sizeType,
          measurements: v.measurements,
          color: v.color || v.shade || 'Standard',
          sku: v.sku,
          stock: Number(v.stock) || 0,
          priceOverride: v.priceOverride !== undefined ? Number(v.priceOverride) : (v.price !== undefined ? Number(v.price) : undefined),
        }));
      }

      const res = await adminApi.products.update(id, payload);
      if (res.success) {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === id || (p as any).slug === id
              ? {
                  ...p,
                  ...updated,
                  category: res.data?.category?.name || updated.category || p.category,
                  categoryId: res.data?.categoryId || res.data?.category?.id || categoryId || p.categoryId,
                  ...(updated.alertThreshold !== undefined && { alertThreshold: Number(updated.alertThreshold) }),
                }
              : p
          )
        );
        if (res.data?.imageCleanupWarning) {
          toast.info(res.data.imageCleanupWarning, 'IMAGE CLEANUP NEEDS ATTENTION');
        } else {
          toast.success(res.message || `Product "${updated.name || id}" updated successfully`, 'PRODUCT UPDATED');
        }
        await refreshData();
        return true;
      } else {
        toast.error(res.error || 'Failed to update product');
        return false;
      }
    } catch (err: any) {
      console.warn('[AdminContext] Error updating product in backend:', err);
      toast.error(err?.message || 'Error updating product');
      return false;
    }
  };

  // Archive Product (Never optimistically alter before backend confirms success)
  const archiveProduct = async (id: string): Promise<boolean> => {
    try {
      const res = await adminApi.products.archive(id);
      if (res.success) {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === id
              ? { ...p, status: 'Archived', isActive: false, deletedAt: new Date().toISOString() }
              : p,
          ),
        );
        toast.success(res.message || 'Product archived successfully', 'PRODUCT ARCHIVED');
        await refreshData();
        return true;
      } else {
        toast.error(res.error || 'Failed to archive product');
        return false;
      }
    } catch (err: any) {
      console.warn('[AdminContext] Error archiving product:', err);
      toast.error(err?.message || 'Error archiving product');
      return false;
    }
  };

  // Restore Archived Product
  const restoreProduct = async (id: string): Promise<boolean> => {
    try {
      const res = await adminApi.products.restore(id);
      if (res.success) {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === id
              ? { ...p, status: 'Active', isActive: true, deletedAt: null }
              : p,
          ),
        );
        toast.success(res.message || 'Product restored to active catalog', 'PRODUCT RESTORED');
        await refreshData();
        return true;
      } else {
        toast.error(res.error || 'Failed to restore product');
        return false;
      }
    } catch (err: any) {
      console.warn('[AdminContext] Error restoring product:', err);
      toast.error(err?.message || 'Error restoring product');
      return false;
    }
  };

  // Delete / Permanently Remove Product (Never optimistically remove before backend confirms success)
  const deleteProduct = async (id: string): Promise<boolean> => {
    try {
      const res = await adminApi.products.delete(id);
      if (res.success) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        setInventory((prev) => prev.filter((item) => item.id !== id && (item as any).productId !== id));
        if (res.data?.cleanupWarning) {
          toast.info(res.data.cleanupWarning, 'IMAGE CLEANUP NEEDS ATTENTION');
        } else {
          toast.success(res.message || 'Product permanently deleted from database', 'PRODUCT DELETED');
        }
        await refreshData();
        return true;
      } else {
        toast.error(res.error || 'Failed to delete product from database');
        return false;
      }
    } catch (err: any) {
      console.warn('[AdminContext] Error deleting product from backend:', err);
      toast.error(err?.message || 'Error deleting product from database');
      return false;
    }
  };

  const getProductDetails = useCallback(async (id: string): Promise<AdminProductDetail | null> => {
    try {
      const res = await adminApi.products.getById(id);
      if (res.success && res.data) {
        return res.data;
      }
    } catch (err: any) {
      console.warn('[AdminContext] Error fetching product details:', err);
    }
    return null;
  }, []);

  // Update Order Status (Never optimistically mutate before backend confirms success)
  const updateOrderStatus = async (
    orderId: string,
    status: AdminOrder['status'],
    notes?: string,
  ): Promise<boolean> => {
    try {
      const res = await adminApi.orders.updateStatus(orderId, status, notes);
      if (res.success) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId || o.orderNumber === orderId ? { ...o, status } : o
          )
        );
        toast.success(
          res.message || `Order status transitioned to ${status} successfully`,
          'ORDER UPDATED'
        );
        return true;
      } else {
        toast.error(res.error || 'Failed to update order status');
        return false;
      }
    } catch (err: any) {
      console.warn('[AdminContext] Error updating order status in backend:', err);
      toast.error(err?.message || 'Error updating order status in backend');
      return false;
    }
  };

  // Update Inventory Stock Count
  const updateInventoryStock = async (
    id: string,
    newStock: number,
    reason?: string,
    note?: string,
  ): Promise<boolean> => {
    const stockVal = Math.max(0, newStock);
    const existing = inventory.find((it) => it.id === id);
    const prevStock = existing ? existing.available : 0;
    const delta = stockVal - prevStock;

    if (delta === 0) return true;

    const chosenReason = reason || (delta > 0 ? 'RESTOCK' : 'MANUAL_ADJUSTMENT');
    const defaultNote = `Manual stock adjustment (${delta > 0 ? '+' : ''}${delta})`;
    const customNote = note ? note.trim() : defaultNote;

    try {
      const res = await adminApi.inventory.adjustStock(
        id,
        delta,
        delta > 0 ? 'RESTOCK' : 'ADJUSTMENT',
        customNote,
        chosenReason,
      );
      if (res.success) {
        setInventory((prev) =>
          prev.map((item) => {
            if (item.id !== id) return item;
            const newAvailable = stockVal;
            const newOnHand = newAvailable + item.reserved;
            const status =
              newAvailable <= 0
                ? 'OUT OF STOCK'
                : newAvailable <= (item.alertThreshold ?? 5)
                ? 'LOW STOCK'
                : 'IN STOCK';
            return {
              ...item,
              available: newAvailable,
              stock: newAvailable,
              onHand: newOnHand,
              status,
            };
          })
        );
        toast.success(
          res.message || `Inventory stock adjusted to ${stockVal} units (${chosenReason})`,
          'INVENTORY UPDATED'
        );
        return true;
      }
      toast.error(res.error || 'Failed to update inventory stock');
      return false;
    } catch (err: any) {
      console.warn('[AdminContext] Error adjusting stock in backend:', err);
      toast.error(err?.message || 'Failed to adjust stock in backend');
      return false;
    }
  };

  const getVariantHistory = async (variantId: string): Promise<InventoryTransactionRecord[]> => {
    try {
      const res = await adminApi.inventory.getHistory(variantId);
      if (res.success && Array.isArray(res.data)) {
        return res.data;
      }
      return [];
    } catch (err) {
      console.warn('[AdminContext] Error fetching variant history:', err);
      return [];
    }
  };

  // Update Store Settings (Only update after confirmed backend response)
  const updateSettings = async (newSettings: Partial<StoreSettings>): Promise<boolean> => {
    try {
      const res = await adminApi.settings.update(newSettings);
      if (res.success) {
        setSettings((prev) => ({ ...prev, ...newSettings }));
        toast.success(res.message || 'Store settings saved successfully', 'SETTINGS SAVED');
        return true;
      } else {
        toast.error(res.error || 'Failed to save settings');
        return false;
      }
    } catch (err: any) {
      console.warn('[AdminContext] Error updating store settings in backend:', err);
      toast.error(err?.message || 'Failed to update settings');
      return false;
    }
  };

  return (
    <AdminContext.Provider
      value={{
        categories,
        products,
        orders,
        inventory,
        settings,
        dashboardMetrics,
        dashboardLoading,
        dashboardError,
        backendConnected,
        isLoading,
        inventoryLoadError,
        refreshData,
        refreshDashboard,
        addProduct,
        updateProduct,
        archiveProduct,
        restoreProduct,
        deleteProduct,
        getProductDetails,
        updateOrderStatus,
        updateInventoryStock,
        getVariantHistory,
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
