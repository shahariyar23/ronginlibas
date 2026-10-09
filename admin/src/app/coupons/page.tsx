'use client';

import React, { useState, useEffect } from 'react';
import { Ticket, Plus, Calendar, CheckCircle2, Trash2, Loader2 } from 'lucide-react';
import { adminApi } from '@/lib/api';
import type { AdminCoupon, CouponDiscountType, CreateCouponPayload } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { TablePageSkeleton } from '@/components/common/Skeleton';
import { PermissionGuard } from '@/components/auth/PermissionGuard';

interface Coupon {
  id: string;
  code: string;
  discountType: CouponDiscountType;
  value: number;
  minSpend: number;
  usageCount: number;
  startDate: string;
  expiryDate: string;
  isActive: boolean;
}

const INITIAL_COUPONS: Coupon[] = [];

function toDateInputValue(value: string | Date): string {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function toLocalDateStart(value: string): string {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day).toISOString();
}

function toLocalDateEnd(value: string): string {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day, 23, 59, 59, 999).toISOString();
}

function mapCoupon(coupon: AdminCoupon): Coupon {
  return {
    id: coupon.id,
    code: coupon.code,
    discountType: coupon.type,
    value: Number(coupon.value),
    minSpend: Number(coupon.minimumOrderAmount),
    usageCount: coupon.usageCount,
    startDate: coupon.startDate,
    expiryDate: coupon.expiryDate,
    isActive: coupon.isActive,
  };
}

function CouponsContent() {
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>(INITIAL_COUPONS);
  const [isLoadingCoupons, setIsLoadingCoupons] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteConfirmCoupon, setDeleteConfirmCoupon] = useState<Coupon | null>(null);
  const [newCode, setNewCode] = useState('');
  const [newDiscount, setNewDiscount] = useState('');
  const [newMinSpend, setNewMinSpend] = useState('');
  const [newDiscountType, setNewDiscountType] = useState<CouponDiscountType>('PERCENTAGE');
  const [newStartDate, setNewStartDate] = useState(() => toDateInputValue(new Date()));
  const [newExpiryDate, setNewExpiryDate] = useState('');
  const [newIsActive, setNewIsActive] = useState(true);
  const [isSavingCoupon, setIsSavingCoupon] = useState(false);
  const [savingCouponId, setSavingCouponId] = useState<string | null>(null);
  const [deletingCouponId, setDeletingCouponId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState('');
  const [mutationError, setMutationError] = useState('');
  const [loadAttempt, setLoadAttempt] = useState(0);

  useEffect(() => {
    async function loadCoupons() {
      try {
        const res = await adminApi.coupons.getAll();
        if (!res.success || !res.data) {
          setLoadError(res.error || 'Unable to load vouchers.');
          return;
        }

        setCoupons(res.data.map(mapCoupon));
        setLoadError('');
      } catch {
        setLoadError('Unable to load vouchers. Check your connection and try again.');
      } finally {
        setIsLoadingCoupons(false);
      }
    }
    loadCoupons();
  }, [loadAttempt]);

  const handleAdd = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formattedCode = newCode.toUpperCase().trim();
    if (newStartDate > newExpiryDate) {
      setMutationError('Expiry date must be on or after the start date.');
      return;
    }

    const payload: CreateCouponPayload = {
      code: formattedCode,
      type: newDiscountType,
      value: Number(newDiscount),
      minimumOrderAmount: Number(newMinSpend),
      startDate: toLocalDateStart(newStartDate),
      expiryDate: toLocalDateEnd(newExpiryDate),
      isActive: newIsActive,
    };

    setIsSavingCoupon(true);
    setMutationError('');
    try {
      const res = await adminApi.coupons.create(payload);
      if (!res.success || !res.data) {
        const err = res.error || 'Unable to save this voucher.';
        setMutationError(err);
        toast.error(err);
        return;
      }

      const createdCoupon = res.data;
      setCoupons((prev) => [mapCoupon(createdCoupon), ...prev]);
      setShowAddModal(false);
      setNewCode('');
      setNewDiscount('');
      setNewMinSpend('');
      setNewDiscountType('PERCENTAGE');
      setNewStartDate(toDateInputValue(new Date()));
      setNewExpiryDate('');
      setNewIsActive(true);
      toast.success(`Voucher "${createdCoupon.code}" created successfully`, 'VOUCHER CREATED');
    } catch {
      const err = 'Unable to save this voucher. Check your connection and try again.';
      setMutationError(err);
      toast.error(err);
    } finally {
      setIsSavingCoupon(false);
    }
  };

  const handleActiveChange = async (coupon: Coupon) => {
    setSavingCouponId(coupon.id);
    setMutationError('');
    try {
      const res = await adminApi.coupons.update(coupon.id, { isActive: !coupon.isActive });
      if (!res.success || !res.data) {
        const err = res.error || `Unable to update ${coupon.code}.`;
        setMutationError(err);
        toast.error(err);
        return;
      }
      const updatedCoupon = res.data;
      setCoupons((prev) =>
        prev.map((item) => item.id === coupon.id ? mapCoupon(updatedCoupon) : item),
      );
      toast.success(
        `Voucher ${coupon.code} ${!coupon.isActive ? 'activated' : 'deactivated'} successfully`,
        'VOUCHER UPDATED',
      );
    } catch {
      const err = `Unable to update ${coupon.code}. Check your connection and try again.`;
      setMutationError(err);
      toast.error(err);
    } finally {
      setSavingCouponId(null);
    }
  };

  const handleDelete = async (coupon: Coupon) => {
    setDeletingCouponId(coupon.id);
    setMutationError('');
    try {
      const res = await adminApi.coupons.delete(coupon.id);
      if (!res.success) {
        const err = res.error || `Unable to delete ${coupon.code}.`;
        setMutationError(err);
        toast.error(err);
        return;
      }
      setCoupons((prev) => prev.filter((item) => item.id !== coupon.id));
      setDeleteConfirmCoupon(null);
      toast.success(`Voucher ${coupon.code} deleted successfully`, 'VOUCHER DELETED');
    } catch {
      const err = `Unable to delete ${coupon.code}. Check your connection and try again.`;
      setMutationError(err);
      toast.error(err);
    } finally {
      setDeletingCouponId(null);
    }
  };

  if (isLoadingCoupons) {
    return (
      <TablePageSkeleton
        title="Promotional Atelier Coupons"
        showAddButton={true}
        rowCount={6}
      />
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#deddd3] pb-6">
        <div>
          <span className="text-[11px] font-bold tracking-widest uppercase text-[#717975]">
            PROMOTIONAL ARCHITECTURE & VOUCHERS
          </span>
          <h1 className="text-3xl font-serif text-[#1b1c18] mt-1 tracking-tight">Coupons & Privileges</h1>
          <p className="text-xs text-[#69726d] mt-1">
            Configure seasonal campaign vouchers, exclusive VIP patron privileges, and thresholds.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#00231a] hover:bg-[#073a2d] text-white text-xs font-semibold uppercase tracking-wider transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ CREATE VOUCHER</span>
        </button>
      </div>

      {(loadError || mutationError) && (
        <div
          role="alert"
          className="flex items-center justify-between gap-4 border border-[#ba1a1a]/20 bg-[#ba1a1a]/5 px-4 py-3 text-sm text-[#9b1c1c]"
        >
          <span>{mutationError || loadError}</span>
          {loadError && !mutationError && (
            <button
              type="button"
              onClick={() => {
                setIsLoadingCoupons(true);
                setLoadAttempt((attempt) => attempt + 1);
              }}
              className="font-semibold underline"
            >
              Retry
            </button>
          )}
        </div>
      )}

      {coupons.length === 0 ? (
        <div className="bg-white border border-[#deddd3] p-12 text-center space-y-3">
          <Ticket className="w-8 h-8 text-[#717975] mx-auto opacity-40" />
          <h3 className="font-serif text-lg text-[#1b1c18]">No Active Vouchers</h3>
          <p className="text-xs text-[#717975] max-w-sm mx-auto">
            Create promotional discount codes and privileges for your patrons.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-[#073a2d] text-white text-xs font-semibold uppercase tracking-wider"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ CREATE VOUCHER</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {coupons.map((coupon) => (
            <div
              key={coupon.id}
              className="bg-white border border-[#deddd3] p-5 shadow-xs flex flex-col justify-between hover:border-[#c79a45] transition-all relative overflow-hidden"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#073a2d] bg-[#bcedda]/40 px-2 py-0.5 font-mono">
                    {coupon.discountType}
                  </span>
                  <span className="text-[10px] font-semibold text-[#0d4d3b] flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    {!coupon.isActive
                      ? 'INACTIVE'
                      : new Date(coupon.expiryDate) < new Date()
                      ? 'EXPIRED'
                      : new Date(coupon.startDate) > new Date()
                      ? 'SCHEDULED'
                      : 'ACTIVE'}
                  </span>
                </div>

                <div>
                  <h3 className="font-mono text-xl font-bold tracking-wider text-[#073a2d]">
                    {coupon.code}
                  </h3>
                  <p className="text-xs text-[#1b1c18] font-medium mt-1">
                    {coupon.discountType === 'PERCENTAGE'
                      ? `${coupon.value}% OFF total consignment`
                      : coupon.discountType === 'FIXED'
                      ? `৳${coupon.value} OFF total consignment`
                      : 'Complimentary Nationwide Delivery'}
                  </p>
                </div>

                <div className="pt-2 text-xs text-[#717975] space-y-1">
                  <p>Minimum Order: <strong className="text-[#1b1c18]">৳{coupon.minSpend}</strong></p>
                  <p>Redeemed: <strong className="text-[#1b1c18]">{coupon.usageCount} times</strong></p>
                  <p className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Starts: <span className="font-mono">{toDateInputValue(coupon.startDate)}</span>
                  </p>
                  <p className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Expires: <span className="font-mono">{toDateInputValue(coupon.expiryDate)}</span>
                  </p>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-[#f0eee7] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleActiveChange(coupon)}
                  disabled={savingCouponId === coupon.id || deletingCouponId === coupon.id}
                  className="inline-flex items-center gap-1 text-xs text-[#073a2d] hover:underline disabled:opacity-50 cursor-pointer font-semibold"
                >
                  {savingCouponId === coupon.id ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : coupon.isActive ? (
                    'Deactivate Voucher'
                  ) : (
                    'Activate Voucher'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteConfirmCoupon(coupon)}
                  disabled={savingCouponId === coupon.id || deletingCouponId === coupon.id}
                  className="inline-flex items-center gap-1 text-xs text-[#ba1a1a] hover:underline disabled:opacity-50 cursor-pointer font-semibold"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <form
            onSubmit={handleAdd}
            className="bg-white border border-[#deddd3] shadow-2xl p-6 w-full max-w-sm max-h-[90vh] overflow-y-auto"
          >
            <h3 className="font-serif text-lg font-bold text-[#073a2d]">Create Atelier Voucher</h3>
            {mutationError && (
              <p role="alert" className="mt-3 text-xs text-[#9b1c1c]">
                {mutationError}
              </p>
            )}
            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#717975]">
                  Coupon Code
                </label>
                <input
                  type="text"
                  placeholder="e.g. MONSOON2026"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  required
                  className="w-full mt-1 px-3 py-2 border border-[#deddd3] text-xs font-mono font-bold uppercase text-[#1b1c18] focus:border-[#073a2d] outline-hidden"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#717975]">
                  Discount Type
                </label>
                <select
                  value={newDiscountType}
                  onChange={(e) => setNewDiscountType(e.target.value as CouponDiscountType)}
                  className="w-full mt-1 px-3 py-2 border border-[#deddd3] text-xs text-[#1b1c18] focus:border-[#073a2d] outline-hidden"
                >
                  <option value="PERCENTAGE">Percentage</option>
                  <option value="FIXED">Fixed Amount (BDT ৳)</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#717975]">
                  Discount Value{newDiscountType === 'PERCENTAGE' ? ' (%)' : ' (BDT ৳)'}
                </label>
                <input
                  type="number"
                  placeholder={newDiscountType === 'PERCENTAGE' ? 'e.g. 15' : 'e.g. 500'}
                  value={newDiscount}
                  onChange={(e) => setNewDiscount(e.target.value)}
                  min="0"
                  step="0.01"
                  required
                  className="w-full mt-1 px-3 py-2 border border-[#deddd3] text-xs text-[#1b1c18] focus:border-[#073a2d] outline-hidden font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#717975]">
                  Minimum Spend (BDT ৳)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 2500"
                  value={newMinSpend}
                  onChange={(e) => setNewMinSpend(e.target.value)}
                  min="0"
                  step="0.01"
                  required
                  className="w-full mt-1 px-3 py-2 border border-[#deddd3] text-xs text-[#1b1c18] focus:border-[#073a2d] outline-hidden font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#717975]">
                  Start Date
                </label>
                <input
                  type="date"
                  value={newStartDate}
                  onChange={(e) => setNewStartDate(e.target.value)}
                  required
                  className="w-full mt-1 px-3 py-2 border border-[#deddd3] text-xs text-[#1b1c18] focus:border-[#073a2d] outline-hidden font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#717975]">
                  Expiry Date
                </label>
                <input
                  type="date"
                  value={newExpiryDate}
                  onChange={(e) => setNewExpiryDate(e.target.value)}
                  min={newStartDate}
                  required
                  className="w-full mt-1 px-3 py-2 border border-[#deddd3] text-xs text-[#1b1c18] focus:border-[#073a2d] outline-hidden font-mono"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#717975]">Active</span>
                <div
                  role="group"
                  aria-label="Voucher active status"
                  className="inline-flex rounded border border-[#deddd3] bg-[#f7f6f1] p-0.5"
                >
                  <button
                    type="button"
                    aria-pressed={newIsActive}
                    onClick={() => setNewIsActive(true)}
                    className={`min-w-12 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                      newIsActive
                        ? 'bg-[#073a2d] text-white shadow-sm'
                        : 'text-[#717975] hover:bg-white'
                    }`}
                  >
                    On
                  </button>
                  <button
                    type="button"
                    aria-pressed={!newIsActive}
                    onClick={() => setNewIsActive(false)}
                    className={`min-w-12 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                      !newIsActive
                        ? 'bg-[#717975] text-white shadow-sm'
                        : 'text-[#717975] hover:bg-white'
                    }`}
                  >
                    Off
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                disabled={isSavingCoupon}
                onClick={() => !isSavingCoupon && setShowAddModal(false)}
                className="px-4 py-2 border border-[#deddd3] text-xs text-[#717975] hover:bg-[#f0eee7] transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSavingCoupon}
                aria-busy={isSavingCoupon}
                className="px-4 py-2 bg-[#00231a] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#073a2d] transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                {isSavingCoupon ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Creating Voucher...</span>
                  </>
                ) : (
                  <span>Save Voucher</span>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-[#deddd3] shadow-2xl p-6 w-full max-w-sm">
            <h3 className="font-serif text-base font-bold text-[#ba1a1a]">Confirm Voucher Deletion</h3>
            <p className="text-xs text-[#69726d] mt-2">
              Are you sure you want to permanently delete voucher <strong className="font-mono text-[#1b1c18]">{deleteConfirmCoupon.code}</strong>? This action cannot be undone.
            </p>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                disabled={deletingCouponId === deleteConfirmCoupon.id}
                onClick={() => setDeleteConfirmCoupon(null)}
                className="px-4 py-2 border border-[#deddd3] text-xs font-medium text-[#717975] hover:bg-[#f0eee7] transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deletingCouponId === deleteConfirmCoupon.id}
                aria-busy={deletingCouponId === deleteConfirmCoupon.id}
                onClick={() => handleDelete(deleteConfirmCoupon)}
                className="px-4 py-2 bg-[#ba1a1a] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#93000a] transition-colors cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
              >
                {deletingCouponId === deleteConfirmCoupon.id ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Voucher</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CouponsPage() {
  return (
    <PermissionGuard permission="coupons" moduleName="Coupons & Privileges">
      <CouponsContent />
    </PermissionGuard>
  );
}
