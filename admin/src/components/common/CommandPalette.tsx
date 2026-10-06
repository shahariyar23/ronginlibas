'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Shirt, ShoppingBag, Warehouse, Settings, LayoutDashboard, Plus } from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';

export function CommandPalette() {
  const { isSearchOpen, setIsSearchOpen, products, orders } = useAdmin();
  const [query, setQuery] = useState('');
  const router = useRouter();

  if (!isSearchOpen) return null;

  const filteredProducts = query.trim()
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.sku.toLowerCase().includes(query.toLowerCase()) ||
          p.category.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const filteredOrders = query.trim()
    ? orders.filter(
        (o) =>
          o.id.toLowerCase().includes(query.toLowerCase()) ||
          o.customerName.toLowerCase().includes(query.toLowerCase()) ||
          o.phone.includes(query)
      )
    : [];

  const handleNavigate = (path: string) => {
    setIsSearchOpen(false);
    setQuery('');
    router.push(path);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/50 backdrop-blur-xs p-4">
      <div className="w-full max-w-xl bg-white border border-[#deddd3] shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95">
        {/* Search header */}
        <div className="flex items-center px-4 py-3 border-b border-[#deddd3] gap-3">
          <Search className="w-5 h-5 text-[#073a2d]" />
          <input
            type="text"
            placeholder="Search products, orders, SKUs, or quick actions..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="flex-1 bg-transparent text-sm text-[#1b1c18] placeholder-[#717975] focus:outline-hidden"
          />
          <button
            onClick={() => setIsSearchOpen(false)}
            className="text-[#717975] hover:text-[#1b1c18] p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Results */}
        <div className="max-h-96 overflow-y-auto p-3 text-xs space-y-4">
          {query.trim() === '' ? (
            <div>
              <p className="text-[10px] uppercase tracking-wider font-semibold text-[#717975] px-2 mb-2">
                Quick Navigation
              </p>
              <div className="space-y-1">
                <button
                  onClick={() => handleNavigate('/')}
                  className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-[#f5f4ed] text-[#1b1c18] transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4 text-[#073a2d]" />
                  <span>Dashboard Overview</span>
                </button>
                <button
                  onClick={() => handleNavigate('/products/add')}
                  className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-[#f5f4ed] text-[#1b1c18] transition-colors"
                >
                  <Plus className="w-4 h-4 text-[#073a2d]" />
                  <span>Add New Product to Atelier</span>
                </button>
                <button
                  onClick={() => handleNavigate('/products')}
                  className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-[#f5f4ed] text-[#1b1c18] transition-colors"
                >
                  <Shirt className="w-4 h-4 text-[#073a2d]" />
                  <span>Product Management</span>
                </button>
                <button
                  onClick={() => handleNavigate('/orders')}
                  className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-[#f5f4ed] text-[#1b1c18] transition-colors"
                >
                  <ShoppingBag className="w-4 h-4 text-[#073a2d]" />
                  <span>Orders & Dispatch Stream</span>
                </button>
                <button
                  onClick={() => handleNavigate('/inventory')}
                  className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-[#f5f4ed] text-[#1b1c18] transition-colors"
                >
                  <Warehouse className="w-4 h-4 text-[#073a2d]" />
                  <span>Inventory & Stock Ledger</span>
                </button>
                <button
                  onClick={() => handleNavigate('/settings')}
                  className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-[#f5f4ed] text-[#1b1c18] transition-colors"
                >
                  <Settings className="w-4 h-4 text-[#073a2d]" />
                  <span>Basic Store Settings</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {filteredProducts.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-[#717975] px-2 mb-2">
                    Products ({filteredProducts.length})
                  </p>
                  <div className="space-y-1">
                    {filteredProducts.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => handleNavigate('/products')}
                        className="w-full flex items-center justify-between px-3 py-2 hover:bg-[#f5f4ed] text-[#1b1c18] transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <Shirt className="w-3.5 h-3.5 text-[#073a2d]" />
                          <span className="font-medium">{p.name}</span>
                          <span className="text-[10px] text-[#717975] bg-[#f0eee7] px-1.5 py-0.5">
                            {p.sku}
                          </span>
                        </div>
                        <span className="font-semibold text-[#073a2d]">৳{p.price}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {filteredOrders.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-[#717975] px-2 mb-2">
                    Orders ({filteredOrders.length})
                  </p>
                  <div className="space-y-1">
                    {filteredOrders.map((o) => (
                      <button
                        key={o.id}
                        onClick={() => handleNavigate('/orders')}
                        className="w-full flex items-center justify-between px-3 py-2 hover:bg-[#f5f4ed] text-[#1b1c18] transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <ShoppingBag className="w-3.5 h-3.5 text-[#073a2d]" />
                          <span className="font-medium">{o.id}</span>
                          <span className="text-[11px] text-[#717975]">{o.customerName} ({o.customerLocation})</span>
                        </div>
                        <span className="font-semibold text-[#073a2d]">৳{o.amount}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {filteredProducts.length === 0 && filteredOrders.length === 0 && (
                <div className="py-8 text-center text-[#717975]">
                  No matching products or orders found for &quot;{query}&quot;
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-2.5 bg-[#fbf9f2] border-t border-[#deddd3] flex items-center justify-between text-[11px] text-[#717975] px-4">
          <span>Navigate with mouse or click</span>
          <kbd className="font-mono text-[10px] bg-white border border-[#deddd3] px-1 py-0.5">
            ESC to close
          </kbd>
        </div>
      </div>
    </div>
  );
}
