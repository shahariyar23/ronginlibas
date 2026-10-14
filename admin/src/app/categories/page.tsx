'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  Plus,
  Edit2,
  Trash2,
  Layers,
  Loader2,
  Upload,
  Info,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ImageIcon,
  Sparkles,
} from 'lucide-react';
import { adminApi } from '@/lib/api';
import { useAdmin } from '@/context/AdminContext';
import { useToast } from '@/context/ToastContext';
import { CategoriesSkeleton } from '@/components/common/Skeleton';
import { PermissionGuard } from '@/components/auth/PermissionGuard';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  itemCount: number;
  image: string;
  sortOrder: number;
  isActive: boolean;
}

const DEFAULT_CATEGORY_IMAGE =
  'https://res.cloudinary.com/zuk7ltez/image/upload/v1791820280/rongin-libas/products/ahwgmutdoa8e26obzpf0.webp';

function CategoriesContent() {
  const { refreshData } = useAdmin();
  const { toast } = useToast();

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formImage, setFormImage] = useState('');
  const [formSortOrder, setFormSortOrder] = useState(0);
  const [formIsActive, setFormIsActive] = useState(true);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Delete State
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch categories from backend
  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const res = await adminApi.categories.getAll();
      if (res.success && Array.isArray(res.data)) {
        const mapped: CategoryItem[] = res.data.map((c: any) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          description: c.description || '',
          itemCount: c._count?.products ?? c.itemCount ?? 0,
          image: c.image || DEFAULT_CATEGORY_IMAGE,
          sortOrder: c.sortOrder ?? 0,
          isActive: c.isActive !== false,
        }));
        // Sort by sortOrder ascending
        mapped.sort((a, b) => a.sortOrder - b.sortOrder);
        setCategories(mapped);
      }
    } catch (err: any) {
      console.warn('Categories API fetch error:', err);
      toast.error(err?.message || 'Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openCreateModal = () => {
    setModalMode('create');
    setEditingCategory(null);
    setFormName('');
    setFormSlug('');
    setFormDescription('');
    setFormImage('');
    setFormSortOrder(categories.length + 1);
    setFormIsActive(true);
  };

  const openEditModal = (cat: CategoryItem) => {
    setModalMode('edit');
    setEditingCategory(cat);
    setFormName(cat.name);
    setFormSlug(cat.slug);
    setFormDescription(cat.description);
    setFormImage(cat.image);
    setFormSortOrder(cat.sortOrder);
    setFormIsActive(cat.isActive);
  };

  const closeModal = () => {
    if (isSubmitting || isUploadingImage) return;
    setModalMode(null);
    setEditingCategory(null);
  };

  // Direct file upload to Cloudinary via backend
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (WebP, JPG, or PNG).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image file size must be under 5MB.');
      return;
    }

    setIsUploadingImage(true);
    try {
      const res = await adminApi.products.uploadImage(file);
      if (res.success && res.data?.url) {
        setFormImage(res.data.url);
        toast.success('Category photo uploaded successfully!');
      } else {
        toast.error(res.error || 'Failed to upload photo.');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Error uploading image.');
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const payload = {
      name: formName.trim(),
      slug: formSlug.trim() || undefined,
      description: formDescription.trim() || undefined,
      image: formImage.trim() || undefined,
      sortOrder: Number(formSortOrder) || 0,
      isActive: formIsActive,
    };

    try {
      if (modalMode === 'create') {
        const res = await adminApi.categories.create(payload);
        if (res.success && res.data) {
          toast.success(`Category "${res.data.name}" created successfully!`, 'CATEGORY CREATED');
          closeModal();
          await loadCategories();
          await refreshData();
        } else {
          toast.error(res.error || 'Failed to create category');
        }
      } else if (modalMode === 'edit' && editingCategory) {
        const res = await adminApi.categories.update(editingCategory.id, payload);
        if (res.success && res.data) {
          toast.success(`Category "${res.data.name}" updated successfully!`, 'CATEGORY UPDATED');
          closeModal();
          await loadCategories();
          await refreshData();
        } else {
          toast.error(res.error || 'Failed to update category');
        }
      }
    } catch (err: any) {
      toast.error(err?.message || 'An error occurred while saving the category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      const res = await adminApi.categories.delete(id);
      if (res.success) {
        toast.success(`Category "${name}" deleted successfully.`);
        setDeletingId(null);
        await loadCategories();
        await refreshData();
      } else {
        toast.error(res.error || 'Failed to delete category');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Cannot delete category with associated products.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return <CategoriesSkeleton />;
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#deddd3] pb-6">
        <div>
          <span className="text-[11px] font-bold tracking-widest uppercase text-[#717975] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#c79a45]" />
            SILHOUETTE ARCHITECTURE • DHAKA ATELIER
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif text-[#1b1c18] mt-1 tracking-tight">
            Categories & Showcase Cards
          </h1>
          <p className="text-xs text-[#69726d] mt-1 max-w-2xl">
            Control the curated categories, editorial descriptions, and showcase cards displayed on the homepage and customer catalog.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#00231a] hover:bg-[#073a2d] text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-sm hover:shadow-md cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ ADD CATEGORY</span>
        </button>
      </div>

      {/* Prominent Photo Size & Framing Guidance Card */}
      <div className="bg-[#fcfbf7] border-2 border-[#c79a45]/40 p-5 rounded-none shadow-xs space-y-2">
        <div className="flex items-center gap-2 text-[#073a2d]">
          <Info className="w-5 h-5 text-[#c79a45] shrink-0" />
          <h3 className="font-serif text-base font-semibold">
            Category Card Photo Size Specifications
          </h3>
        </div>
        <p className="text-xs text-[#404945] leading-relaxed">
          The homepage <strong>Shop Men / Curated Wardrobe</strong> section renders photos in a vertical portrait aspect ratio. For crisp display and optimal framing without unintended cropping, use photos matching these dimensions:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-mono">
          <div className="bg-white border border-[#deddd3] p-3">
            <span className="text-[10px] uppercase font-bold text-[#717975] block font-sans">
              Aspect Ratio
            </span>
            <span className="text-sm font-bold text-[#073a2d]">3:4 Portrait</span>
            <span className="text-[11px] text-[#69726d] block font-sans mt-0.5">Vertical card format</span>
          </div>
          <div className="bg-white border border-[#deddd3] p-3">
            <span className="text-[10px] uppercase font-bold text-[#717975] block font-sans">
              Recommended Size
            </span>
            <span className="text-sm font-bold text-[#073a2d]">600 × 800 px</span>
            <span className="text-[11px] text-[#69726d] block font-sans mt-0.5">or 900 × 1200 px (Retina)</span>
          </div>
          <div className="bg-white border border-[#deddd3] p-3">
            <span className="text-[10px] uppercase font-bold text-[#717975] block font-sans">
              Format & Weight
            </span>
            <span className="text-sm font-bold text-[#073a2d]">WebP or JPEG</span>
            <span className="text-[11px] text-[#69726d] block font-sans mt-0.5">Optimized under 2MB</span>
          </div>
        </div>
      </div>

      {/* Categories Grid (rendered in 3:4 aspect ratio just like the homepage) */}
      {categories.length === 0 ? (
        <div className="bg-white border border-[#deddd3] p-12 text-center space-y-3">
          <Layers className="w-8 h-8 text-[#717975] mx-auto opacity-40" />
          <h3 className="font-serif text-lg text-[#1b1c18]">No Categories in Catalog</h3>
          <p className="text-xs text-[#717975] max-w-sm mx-auto">
            Create apparel divisions like Panjabi, Shirts, Polos, or Trousers to organize your catalog.
          </p>
          <button
            onClick={openCreateModal}
            className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-[#073a2d] text-white text-xs font-semibold uppercase tracking-wider cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Inaugural Category</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white border border-[#deddd3] hover:border-[#c79a45] shadow-xs flex flex-col justify-between transition-all group overflow-hidden"
            >
              <div>
                {/* 3:4 Aspect Ratio Card Preview */}
                <div className="relative aspect-[3/4] bg-[#f0eee7] border-b border-[#deddd3] overflow-hidden">
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    unoptimized
                  />
                  {/* Gradient Veil */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#00231a]/95 via-black/40 to-transparent opacity-85" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-[#00231a]/90 text-[#fbf9f2] px-2.5 py-1 border border-white/20">
                      Rank #{cat.sortOrder}
                    </span>
                    <span
                      className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 border ${
                        cat.isActive
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-amber-100 text-amber-800 border-amber-300'
                      }`}
                    >
                      {cat.isActive ? 'Active' : 'Draft / Hidden'}
                    </span>
                  </div>

                  {/* Bottom Text Overlay */}
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    {cat.description && (
                      <p className="text-[10px] uppercase tracking-widest text-[#c79a45] font-semibold mb-1 line-clamp-1">
                        {cat.description}
                      </p>
                    )}
                    <h3 className="font-serif text-2xl font-normal leading-tight">{cat.name}</h3>
                    <p className="text-[11px] text-[#deddd3] mt-1 font-mono">
                      {cat.itemCount} Live Products
                    </p>
                  </div>
                </div>

                {/* Card Meta details */}
                <div className="p-4 space-y-1 text-xs">
                  <div className="flex items-center justify-between text-[#717975] font-mono text-[11px]">
                    <span>slug: /{cat.slug}</span>
                    <span>sort: {cat.sortOrder}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 pt-0 border-t border-[#f0eee7] flex items-center justify-between gap-2 mt-2">
                <a
                  href={`/shop?category=${cat.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-[#073a2d] hover:underline font-semibold"
                >
                  <span>Preview</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(cat)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 border border-[#deddd3] hover:border-[#073a2d] text-[#073a2d] text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => setDeletingId(cat.id)}
                    className="p-1.5 text-[#717975] hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    title="Delete Category"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Category Modal */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white border-2 border-[#073a2d] shadow-2xl p-6 sm:p-8 w-full max-w-2xl my-8 animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-[#deddd3] pb-4 mb-5">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#c79a45]">
                  {modalMode === 'create' ? 'Inaugurate Division' : 'Category Configuration'}
                </span>
                <h3 className="font-serif text-2xl font-bold text-[#073a2d]">
                  {modalMode === 'create' ? 'Add New Category' : `Edit Category: ${editingCategory?.name}`}
                </h3>
              </div>
              <button
                type="button"
                onClick={closeModal}
                disabled={isSubmitting || isUploadingImage}
                className="text-[#717975] hover:text-[#1b1c18] p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Category Name */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#404945] mb-1">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Panjabi, Shirts, Polos"
                    value={formName}
                    onChange={(e) => {
                      setFormName(e.target.value);
                      if (modalMode === 'create' && !formSlug) {
                        setFormSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                      }
                    }}
                    className="w-full px-3 py-2 border border-[#deddd3] text-xs text-[#1b1c18] focus:border-[#073a2d] outline-hidden"
                  />
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#404945] mb-1">
                    URL Slug *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. panjabi"
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'))}
                    className="w-full px-3 py-2 border border-[#deddd3] text-xs font-mono text-[#1b1c18] focus:border-[#073a2d] outline-hidden"
                  />
                </div>
              </div>

              {/* Tagline / Subtitle */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#404945] mb-1">
                  Editorial Subtitle / Tagline
                </label>
                <input
                  type="text"
                  placeholder="e.g. Traditional Elegance & Ancestral Weaves"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-[#deddd3] text-xs text-[#1b1c18] focus:border-[#073a2d] outline-hidden"
                />
                <p className="text-[10px] text-[#717975] mt-1">
                  Displayed as the gold subtitle on the homepage category card.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                {/* Sort Order */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#404945] mb-1">
                    Display Sort Order (Rank)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={99}
                    value={formSortOrder}
                    onChange={(e) => setFormSortOrder(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-[#deddd3] text-xs text-[#1b1c18] focus:border-[#073a2d] outline-hidden font-mono"
                  />
                  <p className="text-[10px] text-[#717975] mt-1">
                    Controls card sequence on the homepage (1 is first).
                  </p>
                </div>

                {/* Active Toggle */}
                <div className="pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsActive}
                      onChange={(e) => setFormIsActive(e.target.checked)}
                      className="w-4 h-4 accent-[#073a2d]"
                    />
                    <span className="text-xs font-semibold text-[#1b1c18]">
                      Active on Storefront & Homepage
                    </span>
                  </label>
                  <p className="text-[10px] text-[#717975] mt-1 pl-6">
                    Uncheck to hide this category from customers.
                  </p>
                </div>
              </div>

              {/* Category Photo Section with Explicit Size Specification */}
              <div className="border border-[#deddd3] p-4 bg-[#fbf9f2] space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#073a2d] flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-[#c79a45]" />
                    <span>Category Card Photo (3:4 Portrait Ratio)</span>
                  </label>
                  <span className="text-[10px] font-mono text-[#073a2d] font-bold bg-[#f0eee7] px-2 py-0.5 border border-[#c79a45]/30">
                    Required: 600 × 800 px
                  </span>
                </div>

                <p className="text-[11px] text-[#69726d] leading-relaxed">
                  Upload a vertical photo for the homepage card. The recommended size is <strong>600 × 800 px</strong> (or <strong>900 × 1200 px</strong> for high resolution). Photos with vertical 3:4 framing prevent any unwanted cropping.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start pt-1">
                  {/* Photo Preview in 3:4 */}
                  <div className="relative aspect-[3/4] w-full max-w-[160px] mx-auto bg-[#eae8e1] border-2 border-[#073a2d] overflow-hidden shadow-sm">
                    {formImage ? (
                      <img
                        src={formImage}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center text-[#717975]">
                        <ImageIcon className="w-8 h-8 opacity-40 mb-1" />
                        <span className="text-[10px] font-mono">No Image</span>
                      </div>
                    )}
                    {formImage && (
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2 text-white">
                        <span className="text-[9px] font-serif line-clamp-1">{formName || 'Preview'}</span>
                      </div>
                    )}
                  </div>

                  {/* Upload Controls */}
                  <div className="sm:col-span-2 space-y-3">
                    <div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/webp,image/jpeg,image/png"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        disabled={isUploadingImage}
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-[#f5f4ed] border border-[#073a2d] text-[#073a2d] text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {isUploadingImage ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-[#073a2d]" />
                            <span>Uploading to Cloudinary...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 text-[#c79a45]" />
                            <span>Upload Image File (3:4 Ratio)</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="h-px bg-[#deddd3] flex-1" />
                      <span className="text-[10px] text-[#717975] uppercase font-bold">OR PASTE URL</span>
                      <div className="h-px bg-[#deddd3] flex-1" />
                    </div>

                    <div>
                      <input
                        type="url"
                        placeholder="https://res.cloudinary.com/.../photo.webp"
                        value={formImage}
                        onChange={(e) => setFormImage(e.target.value)}
                        className="w-full px-3 py-2 border border-[#deddd3] text-xs text-[#1b1c18] focus:border-[#073a2d] outline-hidden font-mono"
                      />
                      <span className="text-[10px] text-[#717975] mt-1 block">
                        Cloudinary or public HTTPS image URL.
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="pt-4 border-t border-[#deddd3] flex items-center justify-end gap-3">
                <button
                  type="button"
                  disabled={isSubmitting || isUploadingImage}
                  onClick={closeModal}
                  className="px-5 py-2.5 border border-[#deddd3] text-xs font-semibold text-[#717975] hover:bg-[#f0eee7] transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isUploadingImage || !formName.trim()}
                  className="px-6 py-2.5 bg-[#00231a] hover:bg-[#073a2d] text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2 shadow-sm"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Category...</span>
                    </>
                  ) : (
                    <span>{modalMode === 'create' ? 'Create Category' : 'Save Changes'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white border-2 border-red-600 shadow-2xl p-6 max-w-md w-full space-y-4">
            <div className="flex items-center gap-2 text-red-600">
              <Trash2 className="w-5 h-5" />
              <h3 className="font-serif text-lg font-bold">Delete Category?</h3>
            </div>
            <p className="text-xs text-[#69726d] leading-relaxed">
              Are you sure you want to delete this category? If there are products associated with this category, the deletion will be rejected to protect catalog integrity.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 border border-[#deddd3] text-xs font-semibold text-[#717975] hover:bg-[#f0eee7] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => {
                  const target = categories.find((c) => c.id === deletingId);
                  if (target) void handleDelete(target.id, target.name);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider cursor-pointer flex items-center gap-1.5"
              >
                {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CategoriesPage() {
  return (
    <PermissionGuard permission="categories" moduleName="Categories">
      <CategoriesContent />
    </PermissionGuard>
  );
}
