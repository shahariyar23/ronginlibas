import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { ForgotPasswordClient } from './ForgotPasswordClient';
import { LogoLoader } from '@/components/common/LogoLoader';

export const metadata: Metadata = {
  title: 'Forgot Password | Patron Account Recovery — Rongin Libas',
  description:
    'Recover your Rongin Libas patron sanctuary account. Request a secure password reset link to access your tailoring ledger and bespoke orders.',
};

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<LogoLoader />}>
      <ForgotPasswordClient />
    </Suspense>
  );
}
