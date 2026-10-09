import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { TrackOrderClient } from './TrackOrderClient';
import { LogoLoader } from '@/components/common/LogoLoader';

export const metadata: Metadata = {
  title: 'Live Consignment Tracking | Pathao & Steadfast Sync — Rongin Libas',
  description:
    'Track your tailored menswear order in real-time across 64 districts in Bangladesh with open-box verification status.',
};

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<LogoLoader />}>
      <TrackOrderClient />
    </Suspense>
  );
}
