'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Plus,
  Search,
  Download,
  Filter,
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import { AdminProduct } from '@/data/adminData';

export default function ProductsPage() {
  const { products, deleteProduct } = useAdmin();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [viewProduct, setViewProduct] = useState<AdminProduct | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Compute stat counts
  const activeCount = products.filter((p) => p.status === 'Active').length;
  const lowStockCount = products.filter((p) => p.status === 'Low Stock').length;
  const stockoutCount = products.filter((p) => p.status === 'Out of Stock').length;

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' || p.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesStatus = selectedStatus === 'All' || p.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleDelete = (id: string) => {
    deleteProduct(id);
    setDeleteConfirmId(null);
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Name', 'SKU', 'Category', 'Price', 'Stock', 'Status'];
    const rows = filteredProducts.map((p) => [
      p.id,
      `"${p.name}"`,
      p.sku,
      p.category,
      p.price,
      p.stock,
      p.status,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'rongin_libas_products.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#deddd3] pb-6">
        <div>
          <span className="text-[11px] font-bold tracking-widest uppercase text-[#717975]">
            ATELIER CATALOGUE • Dhaka Production Unit
          </span>
          <div className="flex items-center gap-3 mt-1">
            <h1 className="text-3xl font-serif text-[#1b1c18] tracking-tight">Products</h1>
            <span className="text-xs bg-[#f0eee7] border border-[#deddd3] px-2.5 py-0.5 text-[#404945] font-medium">
              {products.length} Items
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Status summary pills */}
          <div className="hidden lg:flex items-center gap-3 bg-white border border-[#deddd3] px-4 py-2 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-bold text-[#717975]">ACTIVE</span>
              <span className="font-semibold text-[#073a2d]">{activeCount}</span>
            </div>
            <span className="text-[#deddd3]">|</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-bold text-[#8c6722]">LOW STOCK</span>
              <span className="font-semibold text-[#8c6722]">{lowStockCount}</span>
            </div>
            <span className="text-[#deddd3]">|</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-bold text-[#ba1a1a]">STOCKOUT</span>
              <span className="font-semibold text-[#ba1a1a]">{stockoutCount}</span>
            </div>
          </div>

          <Link
            href="/products/add"
            className="flex items-center gap-2 px-5 py-2.5 bg-[#00231a] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#073a2d] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ ADD PRODUCT</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#deddd3] p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#717975] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search products by name, SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#fbf9f2] border border-[#deddd3] text-xs text-[#1b1c18] focus:border-[#073a2d] outline-hidden placeholder-[#717975]"
          />
        </div>

        {/* Dropdowns & Actions */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#fbf9f2] border border-[#deddd3] text-xs px-3 py-2 text-[#404945] focus:border-[#073a2d] outline-hidden cursor-pointer"
          >
            <option value="All">Category: All</option>
            <option value="Panjabi">Panjabi</option>
            <option value="Shirts">Shirts</option>
            <option value="Polo">Polo</option>
            <option value="Trousers">Trousers</option>
            <option value="T-Shirts">T-Shirts</option>
          </select>

          {/* Status Dropdown */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-[#fbf9f2] border border-[#deddd3] text-xs px-3 py-2 text-[#404945] focus:border-[#073a2d] outline-hidden cursor-pointer"
          >
            <option value="All">Status: All</option>
            <option value="Active">Active</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Out of Stock">Out of Stock</option>
          </select>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 border border-[#deddd3] bg-[#fbf9f2] hover:bg-[#e4e2dc] text-xs font-medium text-[#404945] transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>EXPORT CSV</span>
          </button>

          {/* Filter icon toggle */}
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSelectedStatus('All');
              setSearch('');
            }}
            className="p-2 border border-[#deddd3] bg-[#fbf9f2] hover:bg-[#e4e2dc] text-[#404945]"
            title="Reset Filters"
          >
            <Filter className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Products Data Table */}
      <div className="bg-white border border-[#deddd3] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[#deddd3] bg-[#fbf9f2] text-[#717975] uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4 w-10">
                  <input type="checkbox" className="accent-[#073a2d]" />
                </th>
                <th className="py-3 px-4 w-20 font-semibold">IMAGE</th>
                <th className="py-3 px-4 font-semibold">PRODUCT NAME & SKU</th>
                <th className="py-3 px-4 font-semibold">CATEGORY</th>
                <th className="py-3 px-4 font-semibold">PRICE</th>
                <th className="py-3 px-4 font-semibold">STOCK</th>
                <th className="py-3 px-4 font-semibold">STATUS</th>
                <th className="py-3 px-4 text-right font-semibold">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0eee7]">
              {filteredProducts.map((p) => {
                const statusBadge =
                  p.status === 'Active' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase bg-[#b0ecd3]/40 text-[#073a2d]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0d4d3b]" />
                      Active
                    </span>
                  ) : p.status === 'Low Stock' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase bg-[#f5eedf] text-[#8c6722]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#c79a45]" />
                      Low Stock
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase bg-[#ffdad6] text-[#ba1a1a]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a]" />
                      Out of Stock
                    </span>
                  );

                return (
                  <tr key={p.id} className="hover:bg-[#fbf9f2] transition-colors group">
                    <td className="py-3 px-4">
                      <input type="checkbox" className="accent-[#073a2d]" />
                    </td>
                    <td className="py-3 px-4">
                      <div className="w-14 h-16 bg-[#f0eee7] border border-[#deddd3] overflow-hidden relative shrink-0">
                        <Image
                          src={p.image}
                          alt={p.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-serif text-sm text-[#1b1c18] font-medium leading-snug">
                        {p.name}
                      </p>
                      <p className="text-[11px] font-mono text-[#717975] mt-0.5">SKU: {p.sku}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 bg-[#f0eee7] text-[#404945] text-[11px] border border-[#deddd3]">
                        {p.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-serif font-bold text-sm text-[#1b1c18]">
                      ৳{p.price.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`font-medium ${
                          p.stock === 0 ? 'text-[#ba1a1a] font-bold' : 'text-[#1b1c18]'
                        }`}
                      >
                        {p.stock} pcs
                      </span>
                    </td>
                    <td className="py-3 px-4">{statusBadge}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-3 text-[11px] tracking-wider uppercase font-semibold">
                        <button
                          onClick={() => setViewProduct(p)}
                          className="text-[#717975] hover:text-[#073a2d] transition-colors"
                        >
                          VIEW
                        </button>
                        <Link
                          href={`/products/add`}
                          className="text-[#717975] hover:text-[#073a2d] transition-colors"
                        >
                          EDIT
                        </Link>
                        <button
                          onClick={() => setDeleteConfirmId(p.id)}
                          className="text-[#ba1a1a] hover:text-[#93000a] transition-colors"
                        >
                          DELETE
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination & Summary */}
        <div className="p-4 bg-[#fbf9f2] border-t border-[#deddd3] flex flex-col sm:flex-row items-center justify-between text-xs text-[#717975] gap-3">
          <span>
            Showing 1 to {filteredProducts.length} of {products.length} products
          </span>

          <div className="flex items-center gap-1 font-mono text-xs">
            <button className="p-1 text-[#717975] hover:text-[#1b1c18] border border-[#deddd3] bg-white">
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="w-6 h-6 flex items-center justify-center bg-[#073a2d] text-white font-bold">
              1
            </span>
            <button className="w-6 h-6 flex items-center justify-center border border-[#deddd3] bg-white hover:bg-[#f0eee7] text-[#1b1c18]">
              2
            </button>
            <button className="w-6 h-6 flex items-center justify-center border border-[#deddd3] bg-white hover:bg-[#f0eee7] text-[#1b1c18]">
              3
            </button>
            <span className="px-1 text-[#717975]">...</span>
            <button className="w-6 h-6 flex items-center justify-center border border-[#deddd3] bg-white hover:bg-[#f0eee7] text-[#1b1c18]">
              22
            </button>
            <button className="p-1 text-[#717975] hover:text-[#1b1c18] border border-[#deddd3] bg-white">
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* View Product Modal */}
      {viewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white border border-[#deddd3] shadow-2xl p-6 w-full max-w-lg relative animate-in fade-in-0">
            <button
              onClick={() => setViewProduct(null)}
              className="absolute top-4 right-4 text-[#717975] hover:text-[#1b1c18]"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-start gap-5">
              <div className="w-32 h-40 bg-[#f0eee7] border border-[#deddd3] relative overflow-hidden shrink-0">
                <Image
                  src={viewProduct.image}
                  alt={viewProduct.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#073a2d] bg-[#bcedda]/40 px-2 py-0.5">
                  {viewProduct.category}
                </span>
                <h3 className="font-serif text-lg font-bold text-[#1b1c18]">{viewProduct.name}</h3>
                <p className="font-mono text-xs text-[#717975]">SKU: {viewProduct.sku}</p>
                <p className="text-xl font-serif font-bold text-[#073a2d]">
                  ৳{viewProduct.price.toLocaleString()}
                </p>
                <p className="text-xs text-[#69726d]">{viewProduct.fabricNote}</p>
                <div className="pt-2 text-xs text-[#717975]">
                  <span>Available stock: </span>
                  <strong className="text-[#1b1c18]">{viewProduct.stock} units</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white border border-[#deddd3] shadow-2xl p-6 w-full max-w-sm">
            <h3 className="font-serif text-base font-bold text-[#ba1a1a]">Confirm Product Removal</h3>
            <p className="text-xs text-[#69726d] mt-2">
              Are you sure you want to remove this garment silhouette from the active atelier catalog?
            </p>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 border border-[#deddd3] text-xs font-medium text-[#717975] hover:bg-[#f0eee7]"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 bg-[#ba1a1a] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#93000a]"
              >
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
