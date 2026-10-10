import { Metadata } from 'next';
import { Suspense } from 'react';
import { ResetPasswordClient } from './ResetPasswordClient';

export const metadata: Metadata = {
  title: 'Reset Password | Rongin Libas Sanctuary',
  description: 'Set a new secure password for your Rongin Libas patron account.',
};

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#fbf9f2] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#073a2d] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ResetPasswordClient />
    </Suspense>
  );
}
