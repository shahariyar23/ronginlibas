import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { OrdersClient } from './OrdersClient';
import { LogoLoader } from '@/components/common/LogoLoader';

export const metadata: Metadata = {
  title: 'Order History & Bespoke Commissions — Rongin Libas',
  description:
    'Review your past sartorial orders, download tax invoices, and track active Dhaka doorstep courier consignments.',
};

export default function OrdersPage() {
  return (
    <Suspense fallback={<LogoLoader />}>
      <OrdersClient />
    </Suspense>
  );
}
