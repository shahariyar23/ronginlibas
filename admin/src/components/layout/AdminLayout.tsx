'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { AdminProvider } from '@/context/AdminContext';
import { ToastProvider } from '@/context/ToastContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { CommandPalette } from '@/components/common/CommandPalette';
import { getStoredToken } from '@/lib/api';

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === '/login';

  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // If we're already on the login page, don't interfere
    if (isLoginPage) {
      setIsCheckingAuth(false);
      return;
    }

    const token = getStoredToken();
    if (!token) {
      setIsAuthenticated(false);
      setIsCheckingAuth(false);
      router.replace('/login');
    } else {
      setIsAuthenticated(true);
      setIsCheckingAuth(false);
    }
  }, [pathname, isLoginPage, router]);

  // If on login route, render children directly without dashboard shell
  if (isLoginPage) {
    return <>{children}</>;
  }

  // If checking authentication or unauthenticated, show Atelier security splash
  if (isCheckingAuth || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#fbf9f2] flex flex-col items-center justify-center p-6 text-center select-none">
        <div className="relative mb-6">
          <div className="w-16 h-16 bg-[#073a2d] border border-[#c79a45]/50 flex items-center justify-center p-3 shadow-lg">
            <Image
              src="/logo.svg"
              alt="Rongin Libas"
              width={40}
              height={40}
              className="w-full h-full object-contain brightness-200"
              priority
            />
          </div>
          <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#c79a45] opacity-75" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-[#c79a45]" />
          </span>
        </div>
        <h2 className="font-logo text-sm font-bold tracking-[0.2em] text-[#073a2d] uppercase">
          Rongin Libas Atelier
        </h2>
        <p className="mt-2 text-xs font-serif italic text-[#717975]">
          Verifying security clearance…
        </p>
      </div>
    );
  }

  return (
    <ToastProvider>
      <AdminProvider>
        <div className="flex min-h-screen bg-[#fbf9f2]">
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <Header />
            <main className="flex-1 overflow-x-hidden">{children}</main>
          </div>
        </div>
        <CommandPalette />
      </AdminProvider>
    </ToastProvider>
  );
}

