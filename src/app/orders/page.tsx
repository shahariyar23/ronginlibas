import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { OrdersClient } from './OrdersClient';

export const metadata: Metadata = {
  title: 'Order History & Bespoke Commissions — Rongin Libas',
  description:
    'Review your past sartorial orders, download tax invoices, and track active Dhaka doorstep courier consignments.',
};

export default function OrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen pt-32 pb-20 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#073a2d] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <OrdersClient />
    </Suspense>
  );
}
