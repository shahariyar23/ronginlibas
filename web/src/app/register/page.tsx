import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { LoginClient } from '../login/LoginClient';
import { LogoLoader } from '@/components/common/LogoLoader';

export const metadata: Metadata = {
  title: 'Join Atelier | Claim ৳500 Welcome Key — Rongin Libas',
  description:
    'Enroll into the Rongin Libas Patron Sanctuary. Receive ৳500 inaugural credit, door-to-door master tailoring, and priority handloom access.',
};

export default function RegisterPage() {
  return (
    <Suspense fallback={<LogoLoader />}>
      <LoginClient />
    </Suspense>
  );
}
