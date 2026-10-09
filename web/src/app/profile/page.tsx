import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { ProfileClient } from './ProfileClient';
import { LogoLoader } from '@/components/common/LogoLoader';

export const metadata: Metadata = {
  title: 'Patron Profile & Bespoke Identity — Rongin Libas',
  description:
    'Manage your sartorial measurements, Banani delivery residence, and bespoke Bengal tailoring profile.',
};

export default function ProfilePage() {
  return (
    <Suspense fallback={<LogoLoader />}>
      <ProfileClient />
    </Suspense>
  );
}
