'use client';

import React, { createContext, useContext, useState } from 'react';
import {
  AdminProduct,
  AdminOrder,
  InventoryItem,
  StoreSettings,
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_INVENTORY,
  INITIAL_SETTINGS,
} from '@/data/adminData';

interface AdminContextType {
  products: AdminProduct[];
  orders: AdminOrder[];
  inventory: InventoryItem[];
  settings: StoreSettings;
  addProduct: (product: AdminProduct) => void;
  updateProduct: (id: string, product: Partial<AdminProduct>) => void;
  deleteProduct: (id: string) => void;
  updateOrderStatus: (orderId: string, status: AdminOrder['status']) => void;
  updateInventoryStock: (id: string, newStock: number) => void;
  updateSettings: (newSettings: Partial<StoreSettings>) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<AdminProduct[]>(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<AdminOrder[]>(INITIAL_ORDERS);
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [settings, setSettings] = useState<StoreSettings>(INITIAL_SETTINGS);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const addProduct = (product: AdminProduct) => {
    setProducts((prev) => [product, ...prev]);
    // Also sync to inventory
    const newInv: InventoryItem = {
      id: `inv-${Date.now()}`,
      name: product.name,
      subtitle: product.fabricNote || 'Atelier Standard Weave',
      sku: product.sku,
      category: product.category,
      stock: product.stock,
      status: product.stock === 0 ? 'OUT OF STOCK' : product.stock <= 5 ? 'LOW STOCK' : 'IN STOCK',
      image: product.image,
    };
    setInventory((prev) => [newInv, ...prev]);
  };

  const updateProduct = (id: string, updated: Partial<AdminProduct>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updated } : p))
    );
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const updateOrderStatus = (orderId: string, status: AdminOrder['status']) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
  };

  const updateInventoryStock = (id: string, newStock: number) => {
    const stockVal = Math.max(0, newStock);
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
  };

  const updateSettings = (newSettings: Partial<StoreSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  return (
    <AdminContext.Provider
      value={{
        products,
        orders,
        inventory,
        settings,
        addProduct,
        updateProduct,
        deleteProduct,
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
