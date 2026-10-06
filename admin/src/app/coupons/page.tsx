'use client';

import React, { useState } from 'react';
import { Ticket, Plus, Trash2, Calendar, Tag, CheckCircle2 } from 'lucide-react';

interface Coupon {
  id: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED' | 'FREE_DELIVERY';
  value: number;
  minSpend: number;
  usageCount: number;
  expiryDate: string;
  status: 'ACTIVE' | 'EXPIRED';
}

const INITIAL_COUPONS: Coupon[] = [
  {
    id: 'c-1',
    code: 'EID2026',
    discountType: 'PERCENTAGE',
    value: 15,
    minSpend: 5000,
    usageCount: 142,
    expiryDate: '2026-11-30',
    status: 'ACTIVE',
  },
  {
    id: 'c-2',
    code: 'BESPOKE1000',
    discountType: 'FIXED',
    value: 1000,
    minSpend: 8000,
    usageCount: 38,
    expiryDate: '2026-12-31',
    status: 'ACTIVE',
  },
  {
    id: 'c-3',
    code: 'FIRSTPATRON',
    discountType: 'FREE_DELIVERY',
    value: 0,
    minSpend: 2000,
    usageCount: 89,
    expiryDate: '2026-12-31',
    status: 'ACTIVE',
  },
];

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>(INITIAL_COUPONS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newDiscount, setNewDiscount] = useState('10');
  const [newMinSpend, setNewMinSpend] = useState('3000');

  const handleAdd = () => {
    if (!newCode) return;
    const item: Coupon[] = [
      ...coupons,
      {
        id: `c-${Date.now()}`,
        code: newCode.toUpperCase(),
        discountType: 'PERCENTAGE',
        value: parseInt(newDiscount, 10) || 10,
        minSpend: parseInt(newMinSpend, 10) || 3000,
        usageCount: 0,
        expiryDate: '2026-12-31',
        status: 'ACTIVE',
      },
    ];
    setCoupons(item);
    setShowAddModal(false);
    setNewCode('');
  };

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
                  {coupon.status}
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
                <p>Expires: <span className="font-mono">{coupon.expiryDate}</span></p>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-[#f0eee7] flex items-center justify-end">
              <button
                onClick={() => setCoupons(coupons.filter((c) => c.id !== coupon.id))}
                className="text-xs text-[#ba1a1a] hover:underline flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Revoke Voucher</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white border border-[#deddd3] shadow-2xl p-6 w-full max-w-sm">
            <h3 className="font-serif text-lg font-bold text-[#073a2d]">Create Atelier Voucher</h3>
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
                  className="w-full mt-1 px-3 py-2 border border-[#deddd3] text-xs font-mono font-bold uppercase text-[#1b1c18] focus:border-[#073a2d] outline-hidden"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#717975]">
                  Discount %
                </label>
                <input
                  type="number"
                  value={newDiscount}
                  onChange={(e) => setNewDiscount(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-[#deddd3] text-xs text-[#1b1c18] focus:border-[#073a2d] outline-hidden font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#717975]">
                  Minimum Spend (BDT ৳)
                </label>
                <input
                  type="number"
                  value={newMinSpend}
                  onChange={(e) => setNewMinSpend(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-[#deddd3] text-xs text-[#1b1c18] focus:border-[#073a2d] outline-hidden font-mono"
                />
              </div>
            </div>
            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border border-[#deddd3] text-xs text-[#717975] hover:bg-[#f0eee7]"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                className="px-4 py-2 bg-[#00231a] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#073a2d]"
              >
                Save Voucher
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
