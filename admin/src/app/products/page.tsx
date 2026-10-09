'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Plus,
  Search,
  Download,
  Filter,
  Edit,
  ChevronLeft,
  ChevronRight,
  X,
  Shirt,
  Sparkles,
  Tag,
  AlertCircle,
  ShieldCheck,
  Loader2,
  Archive,
} from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import { AdminProduct, AdminProductDetail } from '@/data/adminData';
import { TablePageSkeleton } from '@/components/common/Skeleton';
import { PermissionGuard } from '@/components/auth/PermissionGuard';

function ProductsContent() {
  const {
    products,
    categories,
    deleteProduct,
    archiveProduct,
    restoreProduct,
    getProductDetails,
    isLoading,
  } = useAdmin();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [viewProduct, setViewProduct] = useState<AdminProduct | null>(null);
  const [detailedProduct, setDetailedProduct] = useState<AdminProductDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);

  // Archive & Permanent Delete Modal States
  const [archiveConfirmProduct, setArchiveConfirmProduct] = useState<AdminProduct | null>(null);
  const [deleteConfirmProduct, setDeleteConfirmProduct] = useState<AdminProduct | null>(null);
  const [isArchiving, setIsArchiving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  // Compute stat counts
  const archivedCount = products.filter(
    (p) => p.status === 'Archived' || p.isActive === false || Boolean(p.deletedAt)
  ).length;
  const activeCount = products.filter((p) => p.status === 'Active').length;
  const lowStockCount = products.filter((p) => p.status === 'Low Stock').length;
  const stockoutCount = products.filter((p) => p.status === 'Out of Stock').length;

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setCurrentPage(1);
  };
  const handleCategoryChange = (val: string) => {
    setSelectedCategory(val);
    setCurrentPage(1);
  };
  const handleStatusChange = (val: string) => {
    setSelectedStatus(val);
    setCurrentPage(1);
  };

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' || p.category.toLowerCase() === selectedCategory.toLowerCase();
    const isArchived = p.status === 'Archived' || p.isActive === false || Boolean(p.deletedAt);
    const matchesStatus =
      selectedStatus === 'All' ||
      (selectedStatus === 'Archived' ? isArchived : p.status === selectedStatus && !isArchived);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const paginatedProducts = filteredProducts.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize
  );
  const startEntry = filteredProducts.length === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1;
  const endEntry = Math.min(safeCurrentPage * pageSize, filteredProducts.length);

  const handleViewProduct = async (product: AdminProduct) => {
    setViewProduct(product);
    setDetailedProduct(null);
    setIsLoadingDetail(true);
    setSelectedImageIdx(0);
    try {
      const data = await getProductDetails(product.id);
      if (data) {
        setDetailedProduct(data);
      }
    } catch (err) {
      console.warn('[ProductsPage] Failed to fetch full product specifications:', err);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleCloseViewModal = () => {
    setViewProduct(null);
    setDetailedProduct(null);
    setSelectedImageIdx(0);
  };

  const handleArchiveConfirm = async () => {
    if (!archiveConfirmProduct || isArchiving) return;
    setIsArchiving(true);
    try {
      const success = await archiveProduct(archiveConfirmProduct.id);
      if (success) {
        setArchiveConfirmProduct(null);
      }
    } finally {
      setIsArchiving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmProduct || isDeleting) return;
    setIsDeleting(true);
    try {
      const success = await deleteProduct(deleteConfirmProduct.id);
      if (success) {
        setDeleteConfirmProduct(null);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRestore = async (p: AdminProduct) => {
    if (isRestoring) return;
    setIsRestoring(true);
    setRestoringId(p.id);
    try {
      await restoreProduct(p.id);
    } finally {
      setIsRestoring(false);
      setRestoringId(null);
    }
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

  if (isLoading) {
    return (
      <TablePageSkeleton
        title="Atelier Products Catalogue"
        showAddButton={true}
        rowCount={8}
      />
    );
  }

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
            <span className="text-[#deddd3]">|</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-bold text-[#717975]">ARCHIVED</span>
              <span className="font-semibold text-[#555e5a]">{archivedCount}</span>
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
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#fbf9f2] border border-[#deddd3] text-xs text-[#1b1c18] focus:border-[#073a2d] outline-hidden placeholder-[#717975]"
          />
        </div>

        {/* Dropdowns & Actions */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="bg-[#fbf9f2] border border-[#deddd3] text-xs px-3 py-2 text-[#404945] focus:border-[#073a2d] outline-hidden cursor-pointer"
          >
            <option value="All">Category: All</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Status Dropdown */}
          <select
            value={selectedStatus}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="bg-[#fbf9f2] border border-[#deddd3] text-xs px-3 py-2 text-[#404945] focus:border-[#073a2d] outline-hidden cursor-pointer"
          >
            <option value="All">Status: All</option>
            <option value="Active">Active</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Out of Stock">Out of Stock</option>
            <option value="Archived">Archived</option>
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
              setCurrentPage(1);
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
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#717975]">
                    <Shirt className="w-8 h-8 mx-auto mb-2 opacity-40 text-[#717975]" />
                    <p className="font-serif text-sm text-[#1b1c18]">No products found</p>
                    <p className="text-[11px] text-[#717975]">
                      Add garments via &apos;Add Product&apos; or adjust filter parameters.
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((p) => {
                const isArchived = p.status === 'Archived' || p.isActive === false || Boolean(p.deletedAt);
                const statusBadge = isArchived ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase bg-[#e4e2dc] text-[#555e5a] border border-[#deddd3]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#717975]" />
                    Archived
                  </span>
                ) : p.status === 'Active' ? (
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
                      <div className="flex items-center justify-end gap-2.5 text-[11px] tracking-wider uppercase font-semibold">
                        <button
                          type="button"
                          onClick={() => handleViewProduct(p)}
                          className="text-[#717975] hover:text-[#073a2d] transition-colors cursor-pointer"
                        >
                          VIEW
                        </button>
                        <Link
                          href={`/products/edit/${p.id}`}
                          className="text-[#717975] hover:text-[#073a2d] transition-colors"
                        >
                          EDIT
                        </Link>
                        {isArchived ? (
                          <button
                            type="button"
                            disabled={isRestoring && restoringId === p.id}
                            onClick={() => handleRestore(p)}
                            className="text-[#073a2d] hover:text-[#0b5f48] transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1"
                            title="Restore product to active catalog"
                          >
                            {isRestoring && restoringId === p.id ? (
                              <>
                                <Loader2 className="w-3 h-3 animate-spin" />
                                <span>RESTORING...</span>
                              </>
                            ) : (
                              <span>RESTORE</span>
                            )}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setArchiveConfirmProduct(p)}
                            className="text-[#8c6722] hover:text-[#73531b] transition-colors cursor-pointer"
                            title="Archive product (hide from storefront)"
                          >
                            ARCHIVE
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmProduct(p)}
                          className="text-[#ba1a1a] hover:text-[#93000a] transition-colors cursor-pointer"
                          title="Permanently delete product and media"
                        >
                          DELETE PERMANENTLY
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
            </tbody>
          </table>
        </div>

        {/* Pagination & Summary */}
        <div className="p-4 bg-[#fbf9f2] border-t border-[#deddd3] flex flex-col sm:flex-row items-center justify-between text-xs text-[#717975] gap-3">
          <span>
            {filteredProducts.length === 0
              ? 'Showing 0 products'
              : `Showing ${startEntry} to ${endEntry} of ${filteredProducts.length} products`}
          </span>

          <div className="flex items-center gap-1 font-mono text-xs">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safeCurrentPage <= 1}
              className={`p-1 border border-[#deddd3] bg-white transition-colors ${
                safeCurrentPage <= 1
                  ? 'opacity-40 cursor-not-allowed text-[#717975]'
                  : 'hover:bg-[#f0eee7] text-[#1b1c18] cursor-pointer'
              }`}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => setCurrentPage(page)}
                className={`w-6 h-6 flex items-center justify-center font-bold text-xs transition-colors cursor-pointer ${
                  page === safeCurrentPage
                    ? 'bg-[#073a2d] text-white'
                    : 'border border-[#deddd3] bg-white hover:bg-[#f0eee7] text-[#1b1c18]'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safeCurrentPage >= totalPages}
              className={`p-1 border border-[#deddd3] bg-white transition-colors ${
                safeCurrentPage >= totalPages
                  ? 'opacity-40 cursor-not-allowed text-[#717975]'
                  : 'hover:bg-[#f0eee7] text-[#1b1c18] cursor-pointer'
              }`}
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* View Full Product Specifications Modal */}
      {viewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
          <div className="bg-[#fbf9f2] border border-[#deddd3] shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col relative animate-in fade-in-0 duration-200">
            {/* Header */}
            <div className="bg-white border-b border-[#deddd3] px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#717975]">
                    ATELIER CATALOGUE SPECIFICATIONS
                  </span>
                  {isLoadingDetail && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono text-[#073a2d] bg-[#bcedda]/40 px-2 py-0.5 animate-pulse">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Loading live specs...
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1b1c18] tracking-tight">
                    {detailedProduct?.name || viewProduct.name}
                  </h2>
                  <span className="font-mono text-xs text-[#717975] bg-[#f0eee7] border border-[#deddd3] px-2 py-0.5">
                    SKU: {detailedProduct?.sku || viewProduct.sku}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <Link
                  href={`/products/edit/${detailedProduct?.id || viewProduct.id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#00231a] hover:bg-[#073a2d] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-xs"
                >
                  <Edit className="w-3.5 h-3.5" />
                  Edit Product
                </Link>
                <button
                  type="button"
                  onClick={handleCloseViewModal}
                  className="p-1.5 border border-[#deddd3] bg-white hover:bg-[#f0eee7] text-[#404945] hover:text-[#1b1c18] transition-colors cursor-pointer"
                  title="Close specifications view"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Badges Bar */}
            <div className="bg-[#f0eee7] border-b border-[#deddd3] px-6 py-2 flex flex-wrap items-center gap-2 text-xs">
              <span className="px-2 py-0.5 font-bold uppercase text-[10px] tracking-wider bg-white border border-[#deddd3] text-[#404945]">
                Category: {detailedProduct?.category?.name || viewProduct.category}
              </span>

              {viewProduct.status === 'Archived' || viewProduct.isActive === false || Boolean(viewProduct.deletedAt) ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#e4e2dc] text-[#555e5a] border border-[#deddd3]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#717975]" />
                  Archived (Hidden from Storefront)
                </span>
              ) : viewProduct.status === 'Active' ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#b0ecd3]/50 text-[#073a2d] border border-[#a1d1be]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0d4d3b]" />
                  Active In Atelier
                </span>
              ) : viewProduct.status === 'Low Stock' ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#f5eedf] text-[#8c6722] border border-[#deb887]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#c79a45]" />
                  Low Stock Warning
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#ffdad6] text-[#ba1a1a] border border-[#ffb4ab]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a]" />
                  Out of Stock
                </span>
              )}

              {(detailedProduct?.isFeatured ?? viewProduct.featured) && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#00231a] text-[#c79a45] border border-[#c79a45]/30">
                  <Sparkles className="w-3 h-3 text-[#c79a45]" />
                  Featured Collection
                </span>
              )}

              {detailedProduct?.isNewArrival && (
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#073a2d] text-white">
                  New Arrival
                </span>
              )}

              {detailedProduct?.isBestSeller && (
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#8c6722] text-white">
                  Best Seller
                </span>
              )}

              {detailedProduct?.isExpressAvailable && (
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#bcedda] text-[#073a2d]">
                  Express 48h Delivery
                </span>
              )}
            </div>

            {/* Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Left Column: Media Gallery */}
                <div className="md:col-span-5 space-y-4">
                  {/* Main Display Image */}
                  <div className="relative aspect-3/4 bg-white border border-[#deddd3] overflow-hidden shadow-xs">
                    {(() => {
                      const allImages = detailedProduct?.images?.length
                        ? detailedProduct.images
                        : [{ url: viewProduct.image, altText: viewProduct.name, isPrimary: true }];
                      const activeImg = allImages[selectedImageIdx] || allImages[0];

                      return (
                        <>
                          <Image
                            src={activeImg?.url || viewProduct.image}
                            alt={activeImg?.altText || viewProduct.name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                          <div className="absolute top-2 left-2 flex flex-col gap-1">
                            {activeImg?.isPrimary && (
                              <span className="bg-[#00231a] text-[#c79a45] text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 border border-[#c79a45]/30">
                                Primary Showcase
                              </span>
                            )}
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  {/* Thumbnail Strip */}
                  {detailedProduct?.images && detailedProduct.images.length > 1 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#717975]">
                        LOOKBOOK GALLERY ({detailedProduct.images.length} PHOTOS)
                      </span>
                      <div className="grid grid-cols-4 gap-2">
                        {detailedProduct.images.map((img, idx) => (
                          <button
                            key={img.id || idx}
                            type="button"
                            onClick={() => setSelectedImageIdx(idx)}
                            className={`relative aspect-3/4 border overflow-hidden transition-all cursor-pointer ${
                              selectedImageIdx === idx
                                ? 'border-[#073a2d] ring-2 ring-[#073a2d]'
                                : 'border-[#deddd3] hover:border-[#717975] opacity-70 hover:opacity-100'
                            }`}
                          >
                            <Image
                              src={img.url}
                              alt={img.altText || `View ${idx + 1}`}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* System Identifiers Card */}
                  <div className="bg-white border border-[#deddd3] p-3 text-xs space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#717975] block border-b border-[#f0eee7] pb-1">
                      System Traceability
                    </span>
                    <div className="space-y-1 font-mono text-[11px] text-[#404945]">
                      <div className="flex justify-between">
                        <span className="text-[#717975]">Internal ID:</span>
                        <span className="font-semibold">{detailedProduct?.id || viewProduct.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#717975]">Catalogue Slug:</span>
                        <span className="truncate max-w-[170px]" title={detailedProduct?.slug || 'n/a'}>
                          {detailedProduct?.slug || 'n/a'}
                        </span>
                      </div>
                      {detailedProduct?.createdAt && (
                        <div className="flex justify-between">
                          <span className="text-[#717975]">Created:</span>
                          <span>
                            {new Date(detailedProduct.createdAt).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column: Complete Specifications */}
                <div className="md:col-span-7 space-y-5">
                  {/* Commercial & Financial Matrix */}
                  <div className="bg-white border border-[#deddd3] p-4 shadow-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#717975] block mb-3">
                      Commercial & Pricing Structure
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="bg-[#fbf9f2] border border-[#deddd3] p-2.5">
                        <p className="text-[9px] uppercase font-bold text-[#717975]">Retail Price</p>
                        <p className="font-serif text-lg font-bold text-[#073a2d]">
                          ৳{Number(detailedProduct?.price ?? viewProduct.price).toLocaleString()}
                        </p>
                      </div>

                      <div className="bg-[#fbf9f2] border border-[#deddd3] p-2.5">
                        <p className="text-[9px] uppercase font-bold text-[#717975]">Compare At MSRP</p>
                        <p className="font-serif text-base font-semibold text-[#717975]">
                          {detailedProduct?.compareAtPrice || viewProduct.promotionalPrice ? (
                            <>
                              ৳
                              {Number(
                                detailedProduct?.compareAtPrice ?? viewProduct.promotionalPrice
                              ).toLocaleString()}
                            </>
                          ) : (
                            'None'
                          )}
                        </p>
                      </div>

                      <div className="bg-[#fbf9f2] border border-[#deddd3] p-2.5">
                        <p className="text-[9px] uppercase font-bold text-[#717975]">Cost of Goods</p>
                        <p className="font-serif text-base font-semibold text-[#1b1c18]">
                          {detailedProduct?.costPrice || viewProduct.costOfGoods ? (
                            <>
                              ৳
                              {Number(
                                detailedProduct?.costPrice ?? viewProduct.costOfGoods
                              ).toLocaleString()}
                            </>
                          ) : (
                            'N/A'
                          )}
                        </p>
                      </div>

                      <div className="bg-[#fbf9f2] border border-[#deddd3] p-2.5">
                        <p className="text-[9px] uppercase font-bold text-[#717975]">Gross Margin</p>
                        <p className="font-serif text-base font-bold text-[#0d4d3b]">
                          {(() => {
                            const p = Number(detailedProduct?.price ?? viewProduct.price);
                            const c = Number(detailedProduct?.costPrice ?? viewProduct.costOfGoods);
                            if (c && p > c) {
                              const pct = Math.round(((p - c) / p) * 100);
                              return `${pct}%`;
                            }
                            return 'Standard';
                          })()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Textile & Craftsmanship Attributes */}
                  <div className="bg-white border border-[#deddd3] p-4 shadow-xs space-y-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#717975] block border-b border-[#f0eee7] pb-1">
                      Textile & Sartorial Architecture
                    </span>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#717975] block">
                          Fabric Composition
                        </span>
                        <p className="font-medium text-[#1b1c18]">
                          {detailedProduct?.fabric || viewProduct.fabricNote || 'Atelier Standard Egyptian Cotton'}
                        </p>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#717975] block">
                          Fabric Origin
                        </span>
                        <p className="font-medium text-[#1b1c18]">
                          {detailedProduct?.fabricOrigin || 'Ancestral Heritage Loom / Import'}
                        </p>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#717975] block">
                          Fabric Weight (GSM)
                        </span>
                        <p className="font-medium text-[#1b1c18]">
                          {detailedProduct?.gsm ? `${detailedProduct.gsm} GSM` : 'Atelier Mid-Weight (180 - 220 GSM)'}
                        </p>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#717975] block">
                          Silhouette & Fit
                        </span>
                        <p className="font-medium text-[#1b1c18]">
                          {detailedProduct?.fit || 'Atelier Contemporary Fit'}
                        </p>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#717975] block">
                          Target Gender
                        </span>
                        <p className="font-medium text-[#1b1c18]">
                          {detailedProduct?.gender || 'MEN'}
                        </p>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#717975] block">
                          Care Protocol
                        </span>
                        <p className="font-medium text-[#1b1c18]">
                          {detailedProduct?.careInstructions || 'Dry clean recommended; cold gentle steam press.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Editorial Descriptions */}
                  <div className="bg-white border border-[#deddd3] p-4 shadow-xs space-y-2.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#717975] block border-b border-[#f0eee7] pb-1">
                      Editorial & Atelier Narrative
                    </span>
                    {detailedProduct?.shortDescription && (
                      <p className="text-xs font-serif italic text-[#404945] bg-[#fbf9f2] p-2.5 border-l-2 border-[#073a2d]">
                        &ldquo;{detailedProduct.shortDescription}&rdquo;
                      </p>
                    )}
                    <p className="text-xs text-[#404945] leading-relaxed">
                      {detailedProduct?.description || viewProduct.description || 'No extended description recorded.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Variant Matrix & Stock Distribution */}
              <div className="bg-white border border-[#deddd3] p-4 shadow-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#f0eee7] pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#073a2d]" />
                    <h3 className="font-serif text-sm font-bold text-[#1b1c18]">
                      Variant Inventory & Stock Distribution
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-[#717975]">
                    Total Units:{' '}
                    <strong className="text-[#073a2d]">
                      {detailedProduct?.variants && detailedProduct.variants.length > 0
                        ? detailedProduct.variants.reduce((sum, v) => sum + (v.stock || 0), 0)
                        : viewProduct.stock}{' '}
                      units
                    </strong>
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-[#deddd3] bg-[#fbf9f2] text-[#717975] uppercase text-[10px] tracking-wider">
                        <th className="py-2.5 px-3 font-semibold">SIZE</th>
                        <th className="py-2.5 px-3 font-semibold">COLOR / SHADE</th>
                        <th className="py-2.5 px-3 font-semibold">VARIANT SKU</th>
                        <th className="py-2.5 px-3 font-semibold">STOCK LEVEL</th>
                        <th className="py-2.5 px-3 font-semibold">UNIT PRICE</th>
                        <th className="py-2.5 px-3 text-right font-semibold">STATUS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f0eee7]">
                      {detailedProduct?.variants && detailedProduct.variants.length > 0 ? (
                        detailedProduct.variants.map((v) => (
                          <tr key={v.id || v.sku} className="hover:bg-[#fbf9f2]">
                            <td className="py-2.5 px-3 font-bold text-[#1b1c18]">
                              <span className="inline-block px-2 py-0.5 bg-[#f0eee7] border border-[#deddd3]">
                                {v.sizeLabel || v.size}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 font-medium text-[#404945]">
                              <div className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-[#00231a] border border-[#deddd3]" />
                                <span>{v.color}</span>
                              </div>
                            </td>
                            <td className="py-2.5 px-3 font-mono text-[11px] text-[#717975]">
                              {v.sku}
                            </td>
                            <td className="py-2.5 px-3 font-bold text-[#1b1c18]">
                              {v.stock} pcs
                            </td>
                            <td className="py-2.5 px-3 font-serif font-semibold text-[#073a2d]">
                              ৳
                              {Number(
                                v.priceOverride || detailedProduct.price || viewProduct.price
                              ).toLocaleString()}
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              {v.stock === 0 ? (
                                <span className="px-2 py-0.5 text-[9px] font-bold uppercase bg-[#ffdad6] text-[#ba1a1a]">
                                  Out of Stock
                                </span>
                              ) : v.stock <= 5 ? (
                                <span className="px-2 py-0.5 text-[9px] font-bold uppercase bg-[#f5eedf] text-[#8c6722]">
                                  Low ({v.stock})
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 text-[9px] font-bold uppercase bg-[#bcedda]/40 text-[#073a2d]">
                                  Available ({v.stock})
                                </span>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td className="py-2.5 px-3 font-bold text-[#1b1c18]">Standard</td>
                          <td className="py-2.5 px-3 text-[#404945]">Primary Palette</td>
                          <td className="py-2.5 px-3 font-mono text-[11px] text-[#717975]">
                            {viewProduct.sku}
                          </td>
                          <td className="py-2.5 px-3 font-bold text-[#1b1c18]">
                            {viewProduct.stock} pcs
                          </td>
                          <td className="py-2.5 px-3 font-serif font-semibold text-[#073a2d]">
                            ৳{viewProduct.price.toLocaleString()}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <span className="px-2 py-0.5 text-[9px] font-bold uppercase bg-[#bcedda]/40 text-[#073a2d]">
                              In Stock
                            </span>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Tags Section */}
              {detailedProduct?.tags && detailedProduct.tags.length > 0 && (
                <div className="bg-white border border-[#deddd3] p-3 text-xs flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#717975] flex items-center gap-1">
                    <Tag className="w-3 h-3 text-[#073a2d]" />
                    Catlogue Tags:
                  </span>
                  {detailedProduct.tags.map((t, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-[#fbf9f2] border border-[#deddd3] text-[#404945] text-[11px]"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-white border-t border-[#deddd3] px-6 py-3.5 flex items-center justify-between text-xs shrink-0">
              <span className="text-[#717975] font-mono text-[11px]">
                Product: <strong>{detailedProduct?.name || viewProduct.name}</strong> • SKU:{' '}
                <strong>{detailedProduct?.sku || viewProduct.sku}</strong>
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCloseViewModal}
                  className="px-4 py-2 border border-[#deddd3] text-xs font-semibold text-[#404945] hover:bg-[#f0eee7] transition-colors cursor-pointer"
                >
                  Close Window
                </button>
                <Link
                  href={`/products/edit/${detailedProduct?.id || viewProduct.id}`}
                  className="px-4 py-2 bg-[#00231a] hover:bg-[#073a2d] text-white text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  Edit Specifications
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Archive Confirmation Modal */}
      {archiveConfirmProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white border border-[#deddd3] shadow-2xl p-6 w-full max-w-md animate-in fade-in-0 duration-150">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-[#f5eedf] flex items-center justify-center text-[#8c6722] shrink-0">
                <Archive className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-base font-bold text-[#1b1c18]">Archive this product?</h3>
                <p className="text-[11px] text-[#717975] font-mono">
                  {archiveConfirmProduct.name} ({archiveConfirmProduct.sku})
                </p>
              </div>
            </div>
            <p className="text-xs text-[#555e5a] leading-relaxed">
              This product will no longer appear on the customer website but will remain available in Admin.
            </p>
            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={isArchiving}
                onClick={() => !isArchiving && setArchiveConfirmProduct(null)}
                className="px-4 py-2 border border-[#deddd3] text-xs font-medium text-[#717975] hover:bg-[#f0eee7] transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isArchiving}
                aria-busy={isArchiving}
                onClick={handleArchiveConfirm}
                className="px-4 py-2 bg-[#8c6722] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#73531b] transition-colors cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
              >
                {isArchiving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Archiving...</span>
                  </>
                ) : (
                  <span>Archive</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Permanent Delete Confirmation Modal */}
      {deleteConfirmProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white border border-[#deddd3] shadow-2xl p-6 w-full max-w-lg animate-in fade-in-0 duration-150">
            <div className="flex items-start gap-3.5 mb-3.5">
              <div className="w-10 h-10 rounded-full bg-[#ffdad6] flex items-center justify-center text-[#ba1a1a] shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-[#ba1a1a]">Delete Product Permanently?</h3>
                <p className="text-xs text-[#717975] font-mono mt-0.5">
                  {deleteConfirmProduct.name} (SKU: {deleteConfirmProduct.sku})
                </p>
              </div>
            </div>
            <div className="bg-[#fbf9f2] border border-[#deddd3] p-3 text-xs text-[#404945] leading-relaxed mb-4 space-y-2">
              <p>
                This action will permanently remove this product, its variants, inventory records, product images, and Cloudinary media. Historical order information will remain preserved.
              </p>
              <p className="text-[#073a2d] font-medium flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#073a2d] shrink-0" />
                <span>Historical orders and invoices will never be broken or deleted.</span>
              </p>
            </div>
            <div className="mt-5 flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => !isDeleting && setDeleteConfirmProduct(null)}
                className="px-4 py-2 border border-[#deddd3] text-xs font-medium text-[#717975] hover:bg-[#f0eee7] transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                aria-busy={isDeleting}
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-[#ba1a1a] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#93000a] transition-colors cursor-pointer disabled:opacity-60 flex items-center gap-1.5 shadow-xs"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Permanently</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <PermissionGuard permission="products" moduleName="Products">
      <ProductsContent />
    </PermissionGuard>
  );
}
