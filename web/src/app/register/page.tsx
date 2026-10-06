import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { LoginClient } from '../login/LoginClient';

export const metadata: Metadata = {
  title: 'Join Atelier | Claim ৳500 Welcome Key — Rongin Libas',
  description:
    'Enroll into the Rongin Libas Patron Sanctuary. Receive ৳500 inaugural credit, door-to-door master tailoring, and priority handloom access.',
};

export default function RegisterPage() {
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
