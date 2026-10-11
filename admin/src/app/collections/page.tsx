'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  Search,
  ExternalLink,
  Loader2,
  Check,
  AlertTriangle,
  FolderPlus,
  Eye,
  Layers,
} from 'lucide-react';
import {
  adminApi,
  AdminCollection,
  CreateCollectionPayload,
} from '@/lib/api';

interface ProductOption {
  id: string;
  name: string;
  sku: string;
  price: number;
}
import { useToast } from '@/context/ToastContext';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { TablePageSkeleton } from '@/components/common/Skeleton';

export default function CollectionsAdminPage() {
  return (
    <PermissionGuard
      permission={['collections', 'categories', 'products']}
      moduleName="Collections"
    >
      <CollectionsContent />
    </PermissionGuard>
  );
}

function CollectionsContent() {
  const { toast } = useToast();
  const [collections, setCollections] = useState<AdminCollection[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<AdminCollection | null>(null);
  const [deletingCollection, setDeletingCollection] = useState<AdminCollection | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [form, setForm] = useState<CreateCollectionPayload>({
    name: '',
    slug: '',
    tagline: '',
    description: '',
    image: '',
    isActive: true,
    sortOrder: 0,
    seoTitle: '',
    metaDescription: '',
    productIds: [],
  });

  const loadCollections = async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.collections.getAll();
      if (res.success && res.data) {
        setCollections(res.data);
      } else {
        toast.error(res.error || 'Failed to load collections');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Error communicating with server');
    } finally {
      setIsLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const res = await adminApi.products.getAll({ limit: 100 });
      if (res.success && res.data) {
        const items = Array.isArray(res.data) ? res.data : (res.data.items || []);
        setProducts(
          items.map((p: any) => ({
            id: p.id,
            name: p.name,
            sku: p.sku || 'N/A',
            price: Number(p.price || 0),
          })),
        );
      }
    } catch {
      // Products list is supplementary for the multiselect
    }
  };

  useEffect(() => {
    loadCollections();
    loadProducts();
  }, []);

  const openCreateModal = () => {
    setEditingCollection(null);
    setForm({
      name: '',
      slug: '',
      tagline: '',
      description: '',
      image: '',
      isActive: true,
      sortOrder: (collections.length + 1) * 10,
      seoTitle: '',
      metaDescription: '',
      productIds: [],
    });
    setIsModalOpen(true);
  };

  const openEditModal = async (col: AdminCollection) => {
    setEditingCollection(col);
    setIsModalOpen(true);
    try {
      const res = await adminApi.collections.getById(col.id);
      if (res.success && res.data) {
        const full = res.data;
        setForm({
          name: full.name,
          slug: full.slug,
          tagline: full.tagline || '',
          description: full.description || '',
          image: full.image || '',
          isActive: full.isActive,
          sortOrder: full.sortOrder,
          seoTitle: full.seoTitle || '',
          metaDescription: full.metaDescription || '',
          productIds: full.products?.map((p) => p.id) || [],
        });
      }
    } catch {
      setForm({
        name: col.name,
        slug: col.slug,
        tagline: col.tagline || '',
        description: col.description || '',
        image: col.image || '',
        isActive: col.isActive,
        sortOrder: col.sortOrder,
        seoTitle: col.seoTitle || '',
        metaDescription: col.metaDescription || '',
        productIds: [],
      });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (editingCollection) {
        const res = await adminApi.collections.update(editingCollection.id, form);
        if (res.success) {
          toast.success(`Collection "${form.name}" updated successfully`, 'UPDATED');
          setIsModalOpen(false);
          await loadCollections();
        } else {
          toast.error(res.error || 'Failed to update collection');
        }
      } else {
        const res = await adminApi.collections.create(form);
        if (res.success) {
          toast.success(`Collection "${form.name}" created successfully`, 'CREATED');
          setIsModalOpen(false);
          await loadCollections();
        } else {
          toast.error(res.error || 'Failed to create collection');
        }
      }
    } catch (err: any) {
      toast.error(err?.message || 'Server error saving collection');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingCollection || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await adminApi.collections.delete(deletingCollection.id);
      if (res.success) {
        toast.success(`Collection "${deletingCollection.name}" deleted safely`, 'REMOVED');
        setDeletingCollection(null);
        await loadCollections();
      } else {
        toast.error(res.error || 'Failed to delete collection');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Error deleting collection');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleProduct = (productId: string) => {
    setForm((prev) => {
      const current = prev.productIds || [];
      const exists = current.includes(productId);
      return {
        ...prev,
        productIds: exists
          ? current.filter((id) => id !== productId)
          : [...current, productId],
      };
    });
  };

  const filteredCollections = collections.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.tagline && c.tagline.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="border-b border-[#deddd3] pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold tracking-widest uppercase text-[#717975]">
            CURATED SARTORIAL EDITIONS
          </span>
          <h1 className="text-3xl font-serif text-[#1b1c18] mt-1 tracking-tight flex items-center gap-3">
            <Sparkles className="w-7 h-7 text-[#c79a45]" />
            <span>Product Collections</span>
          </h1>
          <p className="text-xs text-[#69726d] mt-1">
            Organize customer-facing showcases like New Arrivals, Atelier Essentials, and Seasonal Drops.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#00231a] hover:bg-[#073a2d] text-white text-xs font-semibold uppercase tracking-wider rounded shadow-sm transition-colors cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4 text-[#c79a45]" />
          <span>New Collection</span>
        </button>
      </div>

      {/* Search Bar & Summary Stats */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#69726d] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search collections by title, slug, or tagline..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-white border border-[#deddd3] rounded focus:outline-none focus:border-[#00231a] text-[#1b1c18]"
          />
        </div>

        <div className="flex items-center gap-4 text-xs text-[#69726d]">
          <span className="bg-[#f2efe9] px-3 py-1.5 rounded font-mono font-medium text-[#1b1c18]">
            {collections.length} {collections.length === 1 ? 'Collection' : 'Collections'}
          </span>
          <span className="bg-[#e7f5ef] text-[#0f5c40] px-3 py-1.5 rounded font-medium">
            {collections.filter((c) => c.isActive).length} Active
          </span>
        </div>
      </div>

      {/* Main Content Table */}
      {isLoading ? (
        <TablePageSkeleton />
      ) : filteredCollections.length === 0 ? (
        <div className="bg-white border border-[#deddd3] rounded-lg p-12 text-center max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-full bg-[#fbf9f2] border border-[#c79a45]/30 flex items-center justify-center mx-auto mb-4 text-[#c79a45]">
            <FolderPlus className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-lg text-[#1b1c18] font-bold">No Collections Found</h3>
          <p className="text-xs text-[#69726d] mt-1 mb-6">
            {searchQuery
              ? 'No collections matched your search keywords.'
              : 'Start by creating your first curated storefront product collection.'}
          </p>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#00231a] hover:bg-[#073a2d] text-white text-xs font-semibold uppercase tracking-wider rounded transition-colors"
          >
            <Plus className="w-4 h-4 text-[#c79a45]" />
            <span>Create Collection</span>
          </button>
        </div>
      ) : (
        <div className="bg-white border border-[#deddd3] rounded-lg overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#fbf9f2] border-b border-[#deddd3] text-[#717975] uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4 font-semibold">Collection</th>
                  <th className="py-3 px-4 font-semibold">Storefront Route</th>
                  <th className="py-3 px-4 font-semibold text-center">Products</th>
                  <th className="py-3 px-4 font-semibold text-center">Order</th>
                  <th className="py-3 px-4 font-semibold text-center">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#deddd3]">
                {filteredCollections.map((col) => (
                  <tr key={col.id} className="hover:bg-[#fbf9f2]/50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded bg-[#deddd3]/40 border border-[#deddd3] overflow-hidden relative shrink-0 flex items-center justify-center text-[#717975]">
                          {col.image ? (
                            <Image
                              src={col.image}
                              alt={col.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <Layers className="w-5 h-5 text-[#c79a45]" />
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-sm text-[#1b1c18] flex items-center gap-2">
                            <span>{col.name}</span>
                          </div>
                          {col.tagline && (
                            <p className="text-[11px] font-mono tracking-wider text-[#c79a45] uppercase">
                              {col.tagline}
                            </p>
                          )}
                          {col.description && (
                            <p className="text-[11px] text-[#69726d] line-clamp-1 max-w-sm mt-0.5">
                              {col.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 font-mono text-[11px] text-[#424945]">
                      <a
                        href={`https://ronginlibas.com/collections/${col.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[#00231a] hover:text-[#c79a45] transition-colors"
                      >
                        <span>/collections/{col.slug}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>

                    <td className="py-4 px-4 text-center font-mono font-medium text-[#1b1c18]">
                      <span className="inline-block px-2.5 py-1 bg-[#f2efe9] rounded text-[11px]">
                        {col._count?.products ?? 0}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-center font-mono text-xs text-[#717975]">
                      {col.sortOrder}
                    </td>

                    <td className="py-4 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-1 rounded text-[10px] font-semibold tracking-wider uppercase ${
                          col.isActive
                            ? 'bg-[#e7f5ef] text-[#0f5c40] border border-[#a3e2c9]'
                            : 'bg-[#fbe9e7] text-[#ba1a1a] border border-[#ffdad6]'
                        }`}
                      >
                        {col.isActive ? 'Active' : 'Draft / Inactive'}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(col)}
                          className="p-1.5 text-[#69726d] hover:text-[#00231a] hover:bg-[#f2efe9] rounded transition-colors cursor-pointer"
                          title="Edit Collection"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingCollection(col)}
                          className="p-1.5 text-[#ba1a1a] hover:bg-[#ffdad6]/40 rounded transition-colors cursor-pointer"
                          title="Delete Collection"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border border-[#deddd3] rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSave} className="p-6 space-y-6">
              <div className="border-b border-[#deddd3] pb-4 flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#1b1c18]">
                    {editingCollection ? 'Edit Collection' : 'Create New Collection'}
                  </h3>
                  <p className="text-xs text-[#69726d] mt-0.5">
                    Configure customer-facing metadata and assign apparel pieces.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-[#1b1c18] uppercase tracking-wider mb-1">
                    Collection Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Essential Collection"
                    value={form.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setForm((prev) => ({
                        ...prev,
                        name,
                        slug: prev.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
                      }));
                    }}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#deddd3] rounded focus:outline-none focus:border-[#00231a]"
                  />
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-xs font-semibold text-[#1b1c18] uppercase tracking-wider mb-1">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. essential"
                    value={form.slug}
                    onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
                    className="w-full px-3 py-2 text-xs font-mono bg-white border border-[#deddd3] rounded focus:outline-none focus:border-[#00231a]"
                  />
                </div>

                {/* Tagline */}
                <div>
                  <label className="block text-xs font-semibold text-[#1b1c18] uppercase tracking-wider mb-1">
                    Tagline
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. FOUNDATION WARDROBE"
                    value={form.tagline || ''}
                    onChange={(e) => setForm((prev) => ({ ...prev, tagline: e.target.value }))}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#deddd3] rounded focus:outline-none focus:border-[#00231a]"
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-[#1b1c18] uppercase tracking-wider mb-1">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Artisanal narrative or collection styling notes..."
                    value={form.description || ''}
                    onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#deddd3] rounded focus:outline-none focus:border-[#00231a]"
                  />
                </div>

                {/* Cover Image URL */}
                <div>
                  <label className="block text-xs font-semibold text-[#1b1c18] uppercase tracking-wider mb-1">
                    Cover Image URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={form.image || ''}
                    onChange={(e) => setForm((prev) => ({ ...prev, image: e.target.value }))}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#deddd3] rounded focus:outline-none focus:border-[#00231a]"
                  />
                </div>

                {/* Sort Order */}
                <div>
                  <label className="block text-xs font-semibold text-[#1b1c18] uppercase tracking-wider mb-1">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    value={form.sortOrder}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))
                    }
                    className="w-full px-3 py-2 text-xs bg-white border border-[#deddd3] rounded focus:outline-none focus:border-[#00231a]"
                  />
                </div>

                {/* SEO Title */}
                <div>
                  <label className="block text-xs font-semibold text-[#1b1c18] uppercase tracking-wider mb-1">
                    SEO Meta Title
                  </label>
                  <input
                    type="text"
                    placeholder="Atelier Essentials | Rongin Libas"
                    value={form.seoTitle || ''}
                    onChange={(e) => setForm((prev) => ({ ...prev, seoTitle: e.target.value }))}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#deddd3] rounded focus:outline-none focus:border-[#00231a]"
                  />
                </div>

                {/* Active Toggle */}
                <div className="flex items-center gap-2 self-end mb-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={form.isActive}
                    onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                    className="w-4 h-4 text-[#00231a] rounded border-[#deddd3]"
                  />
                  <label htmlFor="isActive" className="text-xs font-semibold text-[#1b1c18] cursor-pointer">
                    Active on Storefront
                  </label>
                </div>

                {/* Meta Description */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-[#1b1c18] uppercase tracking-wider mb-1">
                    SEO Meta Description
                  </label>
                  <input
                    type="text"
                    placeholder="Concise overview for search engine snippets..."
                    value={form.metaDescription || ''}
                    onChange={(e) => setForm((prev) => ({ ...prev, metaDescription: e.target.value }))}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#deddd3] rounded focus:outline-none focus:border-[#00231a]"
                  />
                </div>
              </div>

              {/* Product Attachment Multi-Select */}
              <div className="border-t border-[#deddd3] pt-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-[#1b1c18] uppercase tracking-wider">
                    Linked Products ({form.productIds?.length || 0} selected)
                  </label>
                  <span className="text-[11px] text-[#717975]">
                    Select products that belong to this curated collection
                  </span>
                </div>

                <div className="max-h-48 overflow-y-auto border border-[#deddd3] rounded p-2 divide-y divide-[#deddd3]/50 bg-[#fbf9f2]">
                  {products.length === 0 ? (
                    <p className="text-xs text-[#717975] py-2 text-center">No products found in catalogue.</p>
                  ) : (
                    products.map((p) => {
                      const isSelected = form.productIds?.includes(p.id);
                      return (
                        <div
                          key={p.id}
                          onClick={() => handleToggleProduct(p.id)}
                          className={`py-2 px-2 flex items-center justify-between text-xs cursor-pointer rounded transition-colors ${
                            isSelected ? 'bg-[#00231a]/10 font-semibold text-[#00231a]' : 'hover:bg-white text-[#424945]'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              readOnly
                              checked={isSelected}
                              className="w-3.5 h-3.5 text-[#00231a] rounded pointer-events-none"
                            />
                            <span>{p.name}</span>
                            <span className="font-mono text-[10px] text-[#717975]">({p.sku})</span>
                          </div>
                          <span className="font-mono text-[11px]">৳{Number(p.price).toLocaleString()}</span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#deddd3]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-[#deddd3] text-[#424945] hover:bg-[#f2efe9] text-xs font-semibold uppercase tracking-wider rounded transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-[#00231a] hover:bg-[#073a2d] text-white text-xs font-semibold uppercase tracking-wider rounded transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingCollection ? 'Save Changes' : 'Create Collection'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Safe Delete Modal */}
      {deletingCollection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border border-[#deddd3] rounded-lg shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#fbe9e7] flex items-center justify-center text-[#ba1a1a]">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-serif text-lg font-bold text-[#1b1c18]">
                Delete Collection &quot;{deletingCollection.name}&quot;?
              </h3>
              <p className="text-xs text-[#69726d] mt-1 leading-relaxed">
                This action is safe: it will only unlink garments from this collection. No products, stock, or customer orders will be deleted.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#deddd3]">
              <button
                type="button"
                onClick={() => setDeletingCollection(null)}
                disabled={isSubmitting}
                className="px-4 py-2 border border-[#deddd3] text-[#424945] hover:bg-[#f2efe9] text-xs font-semibold uppercase tracking-wider rounded cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#ba1a1a] hover:bg-[#93000a] text-white text-xs font-semibold uppercase tracking-wider rounded cursor-pointer disabled:opacity-50"
              >
                {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
