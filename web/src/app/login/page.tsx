import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { LoginClient } from './LoginClient';
import { LogoLoader } from '@/components/common/LogoLoader';

export const metadata: Metadata = {
  title: 'Patron Sanctuary Portal | Sign In & Join Atelier — Rongin Libas',
  description:
    'Access your bespoke patron account, Dhaka doorstep tailoring ledger, and claim your inaugural ৳500 privilege key.',
};

export default function LoginPage() {
  return (
    <Suspense fallback={<LogoLoader />}>
      <LoginClient />
    </Suspense>
  );
}
