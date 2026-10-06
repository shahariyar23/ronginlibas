import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { ProfileClient } from './ProfileClient';

export const metadata: Metadata = {
  title: 'Patron Profile & Bespoke Identity — Rongin Libas',
  description:
    'Manage your sartorial measurements, Banani delivery residence, and bespoke Bengal tailoring profile.',
};

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen pt-32 pb-20 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#073a2d] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ProfileClient />
    </Suspense>
  );
}
