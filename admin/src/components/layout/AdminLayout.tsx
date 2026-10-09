'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { AdminProvider, useAdmin } from '@/context/AdminContext';
import { ToastProvider } from '@/context/ToastContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { CommandPalette } from '@/components/common/CommandPalette';
import { PasswordPortalModal } from '@/components/auth/PasswordPortalModal';
import { getStoredToken, adminApi, AdminUser } from '@/lib/api';

function AdminLayoutShell({ children }: { children: React.ReactNode }) {
  const { isPasswordModalOpen, setIsPasswordModalOpen } = useAdmin();
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    const user = adminApi.auth.getUser();
    if (user) {
      setCurrentUser(user);
    }

    adminApi.auth.refreshUser().then((live) => {
      if (live) setCurrentUser(live);
    });
  }, []);

  const mustChangePassword = Boolean(currentUser?.mustChangePassword);

  return (
    <>
      <div className="flex h-screen overflow-hidden bg-[#fbf9f2]">
        <Sidebar />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          {/* Security Alert Banner for Default Password */}
          {mustChangePassword && (
            <div className="bg-[#00231a] border-b border-[#c79a45]/40 px-4 py-2.5 flex items-center justify-between gap-3 text-xs text-[#deddd3] shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <span className="flex h-2 w-2 rounded-full bg-[#c79a45] animate-ping shrink-0" />
                <span className="truncate">
                  <strong className="text-[#c79a45]">Default Password Active:</strong> Your administrative account is using a default password. Please update your credentials.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsPasswordModalOpen(true)}
                className="shrink-0 px-3 py-1 bg-[#c79a45] hover:bg-[#d6aa53] text-[#00231a] font-bold uppercase tracking-wider text-[10px] rounded transition-colors cursor-pointer"
              >
                Change Password Now
              </button>
            </div>
          )}

          <Header />
          <main className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain">
            {children}
          </main>
        </div>
      </div>

      <CommandPalette />

      {/* Global Password Portal Modal */}
      <PasswordPortalModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        mustChangePassword={mustChangePassword}
        onSuccess={() => {
          if (currentUser) {
            setCurrentUser({ ...currentUser, mustChangePassword: false });
          }
        }}
      />
    </>
  );
}

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
        <AdminLayoutShell>{children}</AdminLayoutShell>
      </AdminProvider>
    </ToastProvider>
  );
}
