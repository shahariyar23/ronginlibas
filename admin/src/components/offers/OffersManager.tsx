'use client';

import React, { useState, useEffect } from 'react';
import {
  Tag,
  Plus,
  Calendar,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  Clock,
  Percent,
  Search,
  Loader2,
  AlertTriangle,
  ArrowRight,
  Layers,
  Shirt,
  Sparkles,
} from 'lucide-react';
import {
  adminApi,
  AdminOffer,
  CreateOfferPayload,
  OfferType,
  OfferDiscountType,
  OfferStatus,
} from '@/lib/api';
import { useToast } from '@/context/ToastContext';

function toDateInputValue(value: string | Date): string {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function OffersManager() {
  const { toast } = useToast();

  const [offers, setOffers] = useState<AdminOffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Form modal state
  const [showModal, setShowModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState<AdminOffer | null>(null);
  const [deleteConfirmOffer, setDeleteConfirmOffer] = useState<AdminOffer | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [bannerTitle, setBannerTitle] = useState('Special Offers');
  const [bannerSubtitle, setBannerSubtitle] = useState('Save more on selected Rongin Libas styles.');
  const [bannerMessage, setBannerMessage] = useState('Up to 30% OFF');
  const [offerType, setOfferType] = useState<OfferType>('PRODUCT_DISCOUNT');
  const [discountType, setDiscountType] = useState<OfferDiscountType>('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState('20');
  const [startDate, setStartDate] = useState(() => toDateInputValue(new Date()));
  const [expiryDate, setExpiryDate] = useState(() => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    return toDateInputValue(nextWeek);
  });
  const [isActive, setIsActive] = useState(true);
  const [badgeText, setBadgeText] = useState('EXCLUSIVE DEAL');
  const [couponCode, setCouponCode] = useState('');
  const [priority, setPriority] = useState('0');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);

  // Async states
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formError, setFormError] = useState('');

  // Available products & categories for picker
  const [availableProducts, setAvailableProducts] = useState<Array<{ id: string; name: string; sku: string; price: number }>>([]);
  const [availableCategories, setAvailableCategories] = useState<Array<{ id: string; name: string }>>([]);

  // Fetch offers
  const loadOffers = async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.offers.getAll({
        search: searchQuery || undefined,
        status: statusFilter,
      });
      if (res.success && res.data) {
        setOffers(res.data);
      } else {
        toast.error(res.error || 'Failed to load promotional offers');
      }
    } catch {
      toast.error('Failed to load offers. Check server connection.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOffers();
  }, [statusFilter]);

  // Load products & categories for selector
  useEffect(() => {
    async function loadScopeData() {
      try {
        const [prodRes, catRes] = await Promise.all([
          adminApi.products.getAll({ limit: 100 }),
          adminApi.categories.getAll(),
        ]);
        if (prodRes.success && prodRes.data?.items) {
          setAvailableProducts(prodRes.data.items);
        } else if (Array.isArray(prodRes.data)) {
          setAvailableProducts(prodRes.data);
        }
        if (catRes.success && Array.isArray(catRes.data)) {
          setAvailableCategories(catRes.data);
        }
      } catch (err) {
        console.error('Failed to load scope data for offers:', err);
      }
    }
    loadScopeData();
  }, []);

  const openCreateModal = () => {
    setEditingOffer(null);
    setName('');
    setSlug('');
    setDescription('');
    setBannerTitle('Special Offers');
    setBannerSubtitle('Save more on selected Rongin Libas styles.');
    setBannerMessage('Up to 30% OFF');
    setOfferType('PRODUCT_DISCOUNT');
    setDiscountType('PERCENTAGE');
    setDiscountValue('20');
    setStartDate(toDateInputValue(new Date()));
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    setExpiryDate(toDateInputValue(nextWeek));
    setIsActive(true);
    setBadgeText('EXCLUSIVE DEAL');
    setCouponCode('');
    setPriority('0');
    setSelectedProductIds([]);
    setSelectedCategoryIds([]);
    setFormError('');
    setShowModal(true);
  };

  const openEditModal = async (offer: AdminOffer) => {
    setEditingOffer(offer);
    setName(offer.name);
    setSlug(offer.slug);
    setDescription(offer.description || '');
    setBannerTitle(offer.bannerTitle || 'Special Offers');
    setBannerSubtitle(offer.bannerSubtitle || 'Save more on selected Rongin Libas styles.');
    setBannerMessage(offer.bannerMessage || 'Up to 30% OFF');
    setOfferType(offer.offerType);
    setDiscountType(offer.discountType);
    setDiscountValue(String(offer.discountValue));
    setStartDate(toDateInputValue(offer.startDate));
    setExpiryDate(toDateInputValue(offer.expiryDate));
    setIsActive(offer.isActive);
    setBadgeText(offer.badgeText || '');
    setCouponCode(offer.couponCode || '');
    setPriority(String(offer.priority || 0));
    setFormError('');
    setShowModal(true);

    // Fetch full details with selected products & categories
    try {
      const fullRes = await adminApi.offers.getById(offer.id);
      if (fullRes.success && fullRes.data) {
        setSelectedProductIds(fullRes.data.products?.map((p) => p.id) || []);
        setSelectedCategoryIds(fullRes.data.categories?.map((c) => c.id) || []);
      }
    } catch (err) {
      console.error('Failed to fetch offer details:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;

    if (!name.trim()) {
      setFormError('Offer name is required');
      return;
    }
    const val = Number(discountValue);
    if (Number.isNaN(val) || val <= 0) {
      setFormError('Please enter a valid discount value greater than 0');
      return;
    }
    if (startDate >= expiryDate) {
      setFormError('Expiry date must be after the start date');
      return;
    }

    const payload: CreateOfferPayload = {
      name: name.trim(),
      slug: slug.trim() || undefined,
      description: description.trim() || undefined,
      bannerTitle: bannerTitle.trim() || undefined,
      bannerSubtitle: bannerSubtitle.trim() || undefined,
      bannerMessage: bannerMessage.trim() || undefined,
      offerType,
      discountType,
      discountValue: val,
      startDate: new Date(startDate).toISOString(),
      expiryDate: new Date(`${expiryDate}T23:59:59.999Z`).toISOString(),
      isActive,
      badgeText: badgeText.trim() || undefined,
      couponCode: couponCode.trim().toUpperCase() || undefined,
      priority: Number(priority) || 0,
      productIds: offerType === 'PRODUCT_DISCOUNT' ? selectedProductIds : undefined,
      categoryIds: offerType === 'CATEGORY_DISCOUNT' ? selectedCategoryIds : undefined,
    };

    setIsSaving(true);
    setFormError('');

    try {
      if (editingOffer) {
        const res = await adminApi.offers.update(editingOffer.id, payload);
        if (!res.success) {
          setFormError(res.error || 'Failed to update offer');
          toast.error(res.error || 'Failed to update offer');
          return;
        }
        toast.success(`Offer "${name}" updated successfully`, 'OFFER UPDATED');
      } else {
        const res = await adminApi.offers.create(payload);
        if (!res.success) {
          setFormError(res.error || 'Failed to create offer');
          toast.error(res.error || 'Failed to create offer');
          return;
        }
        toast.success(`Offer "${name}" created successfully`, 'OFFER CREATED');
      }
      setShowModal(false);
      loadOffers();
    } catch {
      setFormError('Network error while saving offer. Please try again.');
      toast.error('Network error while saving offer.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (offer: AdminOffer) => {
    const nextState = !offer.isActive;
    // Optimistic update
    setOffers((prev) =>
      prev.map((o) => (o.id === offer.id ? { ...o, isActive: nextState } : o)),
    );

    try {
      const res = await adminApi.offers.update(offer.id, { isActive: nextState });
      if (!res.success) {
        // Rollback
        setOffers((prev) =>
          prev.map((o) => (o.id === offer.id ? { ...o, isActive: offer.isActive } : o)),
        );
        toast.error('Failed to change offer status');
      } else {
        toast.success(
          `Offer "${offer.name}" is now ${nextState ? 'Active' : 'Inactive'}`,
          'STATUS UPDATED',
        );
        loadOffers();
      }
    } catch {
      // Rollback
      setOffers((prev) =>
        prev.map((o) => (o.id === offer.id ? { ...o, isActive: offer.isActive } : o)),
      );
      toast.error('Network error updating status');
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmOffer || isDeleting) return;
    setIsDeleting(true);
    try {
      const res = await adminApi.offers.delete(deleteConfirmOffer.id);
      if (res.success) {
        toast.success(`Offer "${deleteConfirmOffer.name}" deleted`, 'OFFER REMOVED');
        setOffers((prev) => prev.filter((o) => o.id !== deleteConfirmOffer.id));
        setDeleteConfirmOffer(null);
      } else {
        toast.error(res.error || 'Failed to delete offer');
      }
    } catch {
      toast.error('Network error deleting offer');
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (status: OfferStatus) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3 h-3" />
            <span>ACTIVE</span>
          </span>
        );
      case 'SCHEDULED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <Clock className="w-3 h-3" />
            <span>SCHEDULED</span>
          </span>
        );
      case 'EXPIRED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
            <XCircle className="w-3 h-3" />
            <span>EXPIRED</span>
          </span>
        );
      case 'INACTIVE':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-bold bg-gray-100 text-gray-700 border border-gray-300">
            <span>INACTIVE</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top action & filter bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Status Filters & Search */}
        <div className="flex flex-wrap items-center gap-2">
          {['ALL', 'ACTIVE', 'SCHEDULED', 'EXPIRED', 'INACTIVE'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#073a2d] text-white shadow-xs'
                  : 'bg-white text-[#404945] border border-[#deddd3] hover:border-[#073a2d]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Create button */}
        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#073a2d] hover:bg-[#0d4d3b] text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Promotional Offer</span>
        </button>
      </div>

      {/* Offers Table */}
      <div className="bg-white border border-[#deddd3] shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#073a2d]" />
            <span className="text-xs text-[#717975] font-sans">
              Loading promotional campaigns...
            </span>
          </div>
        ) : offers.length === 0 ? (
          <div className="py-16 text-center">
            <Tag className="w-10 h-10 text-[#c79a45] mx-auto mb-3 opacity-60" />
            <h4 className="font-serif text-lg font-medium text-[#1b1c18]">
              No promotional offers found
            </h4>
            <p className="mt-1 text-xs text-[#717975] max-w-sm mx-auto">
              Create your first dynamic offer campaign to highlight sales, countdown timers, and discount badges on the storefront.
            </p>
            <button
              onClick={openCreateModal}
              className="mt-4 px-4 py-2 bg-[#073a2d] text-white text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create First Offer</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f5f4ed] border-b border-[#deddd3] text-[10px] uppercase tracking-wider font-mono text-[#717975]">
                  <th className="py-3 px-4">Offer Campaign</th>
                  <th className="py-3 px-4">Discount</th>
                  <th className="py-3 px-4">Scope</th>
                  <th className="py-3 px-4">Date Window</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Active</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f5f4ed] text-xs">
                {offers.map((offer) => (
                  <tr key={offer.id} className="hover:bg-[#fbf9f2]/70 transition-colors">
                    {/* Offer Campaign Name & Slug */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-[#073a2d]">{offer.name}</div>
                      <div className="text-[11px] text-[#717975] font-mono mt-0.5">
                        /{offer.slug}
                      </div>
                      {offer.badgeText && (
                        <span className="inline-block mt-1 px-1.5 py-0.5 bg-[#c79a45]/20 text-[#c79a45] text-[9px] font-bold uppercase">
                          {offer.badgeText}
                        </span>
                      )}
                    </td>

                    {/* Discount */}
                    <td className="py-3.5 px-4 font-mono font-bold text-[#073a2d]">
                      {offer.discountType === 'PERCENTAGE'
                        ? `${offer.discountValue}% OFF`
                        : `৳${offer.discountValue.toLocaleString()} OFF`}
                    </td>

                    {/* Scope */}
                    <td className="py-3.5 px-4 text-[#404945]">
                      {offer.offerType === 'STOREWIDE' ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-[#073a2d]">
                          <Sparkles className="w-3.5 h-3.5 text-[#c79a45]" />
                          <span>Storewide</span>
                        </span>
                      ) : offer.offerType === 'CATEGORY_DISCOUNT' ? (
                        <span className="inline-flex items-center gap-1">
                          <Layers className="w-3.5 h-3.5 text-[#717975]" />
                          <span>{offer.categoryCount} categories</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1">
                          <Shirt className="w-3.5 h-3.5 text-[#717975]" />
                          <span>{offer.productCount} products</span>
                        </span>
                      )}
                    </td>

                    {/* Date Window */}
                    <td className="py-3.5 px-4 font-mono text-[11px] text-[#404945]">
                      <div>{new Date(offer.startDate).toLocaleDateString()}</div>
                      <div className="text-[#717975]">
                        to {new Date(offer.expiryDate).toLocaleDateString()}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">{getStatusBadge(offer.status)}</td>

                    {/* Active Toggle Switch */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(offer)}
                        title={offer.isActive ? 'Deactivate offer' : 'Activate offer'}
                        className={`w-9 h-5 inline-flex items-center rounded-full transition-colors p-0.5 cursor-pointer ${
                          offer.isActive ? 'bg-[#073a2d]' : 'bg-[#deddd3]'
                        }`}
                      >
                        <span
                          className={`w-4 h-4 rounded-full bg-white transition-transform ${
                            offer.isActive ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right space-x-1">
                      <button
                        onClick={() => openEditModal(offer)}
                        title="Edit offer"
                        className="p-1.5 text-[#717975] hover:text-[#073a2d] hover:bg-[#f5f4ed] rounded-xs cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmOffer(offer)}
                        title="Delete offer"
                        className="p-1.5 text-[#717975] hover:text-[#ba1a1a] hover:bg-rose-50 rounded-xs cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ================= MODAL: CREATE / EDIT OFFER ================= */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white border border-[#deddd3] shadow-2xl p-6 sm:p-8 my-8 max-h-[90vh] overflow-y-auto">
            <h3 className="font-serif text-xl font-bold text-[#073a2d] border-b border-[#deddd3] pb-3 flex items-center justify-between">
              <span>{editingOffer ? 'Edit Promotional Offer' : 'Create Promotional Offer'}</span>
              <button
                onClick={() => setShowModal(false)}
                className="text-[#717975] hover:text-[#1b1c18] cursor-pointer text-sm font-sans"
              >
                ✕
              </button>
            </h3>

            {formError && (
              <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              {/* Name & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#404945]">
                    Offer Name <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (!editingOffer) {
                        setSlug(
                          e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9]+/g, '-')
                            .replace(/(^-|-$)/g, ''),
                        );
                      }
                    }}
                    placeholder="e.g. Autumn Season Markdown"
                    className="mt-1 w-full p-2.5 bg-[#fbf9f2] border border-[#deddd3] text-xs font-semibold text-[#1b1c18] focus:border-[#073a2d] outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#404945]">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="autumn-season-markdown"
                    className="mt-1 w-full p-2.5 bg-[#fbf9f2] border border-[#deddd3] text-xs font-mono text-[#1b1c18] focus:border-[#073a2d] outline-hidden"
                  />
                </div>
              </div>

              {/* Offer Type & Discount */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#404945]">
                    Offer Scope
                  </label>
                  <select
                    value={offerType}
                    onChange={(e) => setOfferType(e.target.value as OfferType)}
                    className="mt-1 w-full p-2.5 bg-[#fbf9f2] border border-[#deddd3] text-xs font-semibold text-[#1b1c18] focus:border-[#073a2d] outline-hidden cursor-pointer"
                  >
                    <option value="PRODUCT_DISCOUNT">Specific Products</option>
                    <option value="CATEGORY_DISCOUNT">Specific Categories</option>
                    <option value="STOREWIDE">Storewide (All Active)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#404945]">
                    Discount Type
                  </label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as OfferDiscountType)}
                    className="mt-1 w-full p-2.5 bg-[#fbf9f2] border border-[#deddd3] text-xs font-semibold text-[#1b1c18] focus:border-[#073a2d] outline-hidden cursor-pointer"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount (৳)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#404945]">
                    Discount Value <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    placeholder="20"
                    className="mt-1 w-full p-2.5 bg-[#fbf9f2] border border-[#deddd3] text-xs font-mono font-bold text-[#073a2d] focus:border-[#073a2d] outline-hidden"
                  />
                </div>
              </div>

              {/* Date Window */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#404945]">
                    Start Date <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="mt-1 w-full p-2.5 bg-[#fbf9f2] border border-[#deddd3] text-xs font-mono text-[#1b1c18] focus:border-[#073a2d] outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#404945]">
                    Expiry Date <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="mt-1 w-full p-2.5 bg-[#fbf9f2] border border-[#deddd3] text-xs font-mono text-[#1b1c18] focus:border-[#073a2d] outline-hidden"
                  />
                </div>
              </div>

              {/* Banner texts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#404945]">
                    Hero Banner Title
                  </label>
                  <input
                    type="text"
                    value={bannerTitle}
                    onChange={(e) => setBannerTitle(e.target.value)}
                    placeholder="Special Offers"
                    className="mt-1 w-full p-2.5 bg-[#fbf9f2] border border-[#deddd3] text-xs text-[#1b1c18]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#404945]">
                    Promotional Tagline / Message
                  </label>
                  <input
                    type="text"
                    value={bannerMessage}
                    onChange={(e) => setBannerMessage(e.target.value)}
                    placeholder="Up to 30% OFF"
                    className="mt-1 w-full p-2.5 bg-[#fbf9f2] border border-[#deddd3] text-xs text-[#1b1c18]"
                  />
                </div>
              </div>

              {/* Badge & Linked Coupon */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#404945]">
                    Product Badge Text
                  </label>
                  <input
                    type="text"
                    value={badgeText}
                    onChange={(e) => setBadgeText(e.target.value)}
                    placeholder="EXCLUSIVE DEAL"
                    className="mt-1 w-full p-2.5 bg-[#fbf9f2] border border-[#deddd3] text-xs text-[#1b1c18]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#404945]">
                    Linked Coupon Code
                  </label>
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="BESPOKE1000"
                    className="mt-1 w-full p-2.5 bg-[#fbf9f2] border border-[#deddd3] text-xs font-mono uppercase text-[#1b1c18]"
                  />
                </div>
                <div className="flex items-center gap-3 pt-6">
                  <input
                    type="checkbox"
                    id="offer-active"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 accent-[#073a2d] cursor-pointer"
                  />
                  <label
                    htmlFor="offer-active"
                    className="text-xs font-bold uppercase tracking-wider text-[#073a2d] cursor-pointer"
                  >
                    Active on Storefront
                  </label>
                </div>
              </div>

              {/* Scope Selection: Product Picker */}
              {offerType === 'PRODUCT_DISCOUNT' && (
                <div className="pt-2 border-t border-[#f5f4ed]">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#404945] mb-2">
                    Select Eligible Products ({selectedProductIds.length} selected)
                  </label>
                  <div className="max-h-40 overflow-y-auto border border-[#deddd3] p-2 bg-[#fbf9f2] space-y-1.5 divide-y divide-[#deddd3]/40">
                    {availableProducts.map((p) => {
                      const isChecked = selectedProductIds.includes(p.id);
                      return (
                        <label
                          key={p.id}
                          className="flex items-center gap-2 pt-1.5 text-xs text-[#1b1c18] cursor-pointer hover:bg-white/50 px-1"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedProductIds((prev) => [...prev, p.id]);
                              } else {
                                setSelectedProductIds((prev) => prev.filter((id) => id !== p.id));
                              }
                            }}
                            className="accent-[#073a2d]"
                          />
                          <span className="font-medium truncate">{p.name}</span>
                          <span className="text-[#717975] text-[10px] font-mono ml-auto shrink-0">
                            (৳{Number(p.price).toLocaleString()})
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Scope Selection: Category Picker */}
              {offerType === 'CATEGORY_DISCOUNT' && (
                <div className="pt-2 border-t border-[#f5f4ed]">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#404945] mb-2">
                    Select Eligible Categories ({selectedCategoryIds.length} selected)
                  </label>
                  <div className="max-h-40 overflow-y-auto border border-[#deddd3] p-2 bg-[#fbf9f2] space-y-1.5">
                    {availableCategories.map((c) => {
                      const isChecked = selectedCategoryIds.includes(c.id);
                      return (
                        <label
                          key={c.id}
                          className="flex items-center gap-2 text-xs text-[#1b1c18] cursor-pointer hover:bg-white/50 px-1 py-1"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedCategoryIds((prev) => [...prev, c.id]);
                              } else {
                                setSelectedCategoryIds((prev) => prev.filter((id) => id !== c.id));
                              }
                            }}
                            className="accent-[#073a2d]"
                          />
                          <span className="font-medium">{c.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="pt-4 border-t border-[#deddd3] flex justify-end gap-3">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-[#deddd3] text-xs font-bold uppercase tracking-wider text-[#717975] hover:text-[#1b1c18] cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2 bg-[#073a2d] hover:bg-[#0d4d3b] text-white text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingOffer ? 'Save Changes' : 'Create Offer'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: DELETE CONFIRMATION ================= */}
      {deleteConfirmOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-[#deddd3] shadow-2xl p-6">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <AlertTriangle className="w-6 h-6" />
              <h4 className="font-serif text-lg font-bold">Delete Offer Campaign</h4>
            </div>
            <p className="text-xs text-[#404945]">
              Are you sure you want to permanently delete promotional offer &quot;
              <strong>{deleteConfirmOffer.name}</strong>&quot;? Products linked to this offer will no longer show promotional discounts on the storefront.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                disabled={isDeleting}
                onClick={() => setDeleteConfirmOffer(null)}
                className="px-4 py-2 border border-[#deddd3] text-xs font-bold uppercase tracking-wider text-[#717975]"
              >
                Cancel
              </button>
              <button
                disabled={isDeleting}
                onClick={handleDelete}
                className="px-4 py-2 bg-[#ba1a1a] hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Offer</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
