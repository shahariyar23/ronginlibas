'use client';

import React from 'react';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { OffersManager } from '@/components/offers/OffersManager';
import { Tag } from 'lucide-react';

export default function OffersAdminPage() {
  return (
    <PermissionGuard permission={['offers', 'coupons']} moduleName="Promotional Offers">
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        <div className="border-b border-[#deddd3] pb-6">
          <span className="text-[11px] font-bold tracking-widest uppercase text-[#717975]">
            PROMOTIONAL ARCHITECTURE & CAMPAIGNS
          </span>
          <h1 className="text-3xl font-serif text-[#1b1c18] mt-1 tracking-tight flex items-center gap-3">
            <Tag className="w-7 h-7 text-[#c79a45]" />
            <span>Promotional Offers</span>
          </h1>
          <p className="text-xs text-[#69726d] mt-1">
            Configure dynamic seasonal offers, countdown campaigns, and discount markdown badges.
          </p>
        </div>

        <OffersManager />
      </div>
    </PermissionGuard>
  );
}
