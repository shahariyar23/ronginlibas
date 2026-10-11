'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft, Lock } from 'lucide-react';
import { adminApi, AdminUser } from '@/lib/api';

interface PermissionGuardProps {
  permission: string | string[];
  moduleName?: string;
  children: React.ReactNode;
}

export function PermissionGuard({
  permission,
  moduleName,
  children,
}: PermissionGuardProps) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const stored = adminApi.auth.getUser();
    if (stored) {
      setUser(stored);
      setIsChecking(false);
    } else {
      setIsChecking(false);
      return;
    }

    // Refresh live in background if authenticated
    if (adminApi.auth.isAuthenticated()) {
      adminApi.auth
        .refreshUser()
        .then((live) => {
          if (live) setUser(live);
        })
        .catch((err) => {
          console.warn('[PermissionGuard] Unable to refresh user:', err);
        })
        .finally(() => {
          setIsChecking(false);
        });
    }
  }, []);

  if (isChecking && !user) {
    return (
      <div className="flex h-96 w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#12503e] border-t-[#c79a45]" />
      </div>
    );
  }

  // Super Admin always has full unrestricted access
  if (user?.role === 'SUPER_ADMIN') {
    return <>{children}</>;
  }

  // Check granular module permission
  const userPermissions = (user?.permissions || []).map((p) => p.toLowerCase());
  const requiredPermissions = Array.isArray(permission)
    ? permission.map((p) => p.toLowerCase())
    : permission.split(',').map((p) => p.trim().toLowerCase());
  const hasAccess = requiredPermissions.some((req) => userPermissions.includes(req));

  if (!hasAccess) {
    const primaryPermission = Array.isArray(permission) ? permission[0] : permission;
    const displayTitle = moduleName || primaryPermission.charAt(0).toUpperCase() + primaryPermission.slice(1);

    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center p-6 text-center">
        <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-[#c79a45]/30 bg-[#00231a] shadow-xl">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-[#12503e]/40 to-[#c79a45]/10" />
          <ShieldAlert className="relative h-10 w-10 text-[#c79a45]" />
        </div>

        <div className="inline-flex items-center gap-1.5 rounded-full border border-[#c79a45]/30 bg-[#c79a45]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#c79a45] mb-3">
          <Lock className="h-3 w-3" />
          Clearance Restriction
        </div>

        <h2 className="font-serif text-2xl font-bold text-[#00231a] sm:text-3xl">
          {displayTitle} Module Restricted
        </h2>

        <p className="mt-3 max-w-md text-sm text-[#4b5563] leading-relaxed">
          Your administrative account does not possess the clearance permissions required
          to view or modify this atelier module. Please contact the Atelier Super Administrator
          to adjust your delegated clearance permissions.
        </p>

        <div className="mt-8 flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg bg-[#00231a] px-5 py-2.5 text-xs font-semibold tracking-wider text-[#deddd3] uppercase hover:bg-[#12503e] transition-colors shadow-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
