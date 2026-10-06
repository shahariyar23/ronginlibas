import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { LoginClient } from './LoginClient';

export const metadata: Metadata = {
  title: 'Patron Sanctuary Portal | Sign In & Join Atelier — Rongin Libas',
  description:
    'Access your bespoke patron account, Dhaka doorstep tailoring ledger, and claim your inaugural ৳500 privilege key.',
};

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen pt-32 pb-20 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#073a2d] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginClient />
    </Suspense>
  );
}
