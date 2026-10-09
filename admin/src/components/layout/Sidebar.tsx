'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Shirt,
  Layers,
  ShoppingBag,
  Users,
  Warehouse,
  Ticket,
  MessageSquare,
  Settings,
  LogOut,
  UserCog,
  Activity,
  X,
} from 'lucide-react';
import { adminApi, AdminUser } from '@/lib/api';
import { useAdmin } from '@/context/AdminContext';

interface NavItemDef {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  permissionKey?: string;
  adminRoleOnly?: boolean;
}

const NAV_ITEMS: NavItemDef[] = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Products', href: '/products', icon: Shirt, permissionKey: 'products' },
  { name: 'Categories', href: '/categories', icon: Layers, permissionKey: 'categories' },
  { name: 'Orders', href: '/orders', icon: ShoppingBag, permissionKey: 'orders' },
  { name: 'Customers', href: '/customers', icon: Users, permissionKey: 'customers' },
  { name: 'Inventory', href: '/inventory', icon: Warehouse, permissionKey: 'inventory' },
  { name: 'Coupons', href: '/coupons', icon: Ticket, permissionKey: 'coupons' },
  { name: 'Reviews', href: '/reviews', icon: MessageSquare, permissionKey: 'reviews' },
  { name: 'Staff & Roles', href: '/staff', icon: UserCog, permissionKey: 'staff' },
  { name: 'Admin Activity', href: '/activity', icon: Activity, adminRoleOnly: true },
];

const PREF_ITEMS: NavItemDef[] = [
  { name: 'Settings', href: '/settings', icon: Settings, permissionKey: 'settings' },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isMobileSidebarOpen, closeMobileSidebar } = useAdmin();
  const [currentUser, setCurrentUser] = React.useState<AdminUser | null>(null);

  React.useEffect(() => {
    const stored = adminApi.auth.getUser();
    if (stored) {
      setCurrentUser(stored);
    }
    // Refresh live profile in background to keep permissions strictly synchronized
    adminApi.auth.refreshUser().then((live) => {
      if (live) setCurrentUser(live);
    });
  }, []);

  // Close mobile sidebar on route change
  React.useEffect(() => {
    closeMobileSidebar();
  }, [pathname, closeMobileSidebar]);

  const hasAccess = (item: NavItemDef) => {
    if (item.adminRoleOnly) {
      return currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'ADMIN';
    }
    if (!item.permissionKey) return true;
    if (!currentUser) return false;
    if (currentUser.role === 'SUPER_ADMIN') return true;
    const permissions = (currentUser.permissions || []).map((p) => p.toLowerCase());
    return permissions.includes(item.permissionKey.toLowerCase());
  };

  const visibleNavItems = NAV_ITEMS.filter(hasAccess);
  const visiblePrefItems = PREF_ITEMS.filter(hasAccess);

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  const renderNavContent = (isMobile = false) => (
    <div className="flex h-full w-full flex-col overflow-hidden">
      {/* Brand Header */}
      <div className="p-6 border-b border-[#12503e]/30 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white border border-[#c79a45]/40 flex items-center justify-center p-1 shrink-0">
            <Image
              src="/logo.svg"
              alt="Rongin Libas"
              width={40}
              height={40}
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h1 className="font-logo text-sm font-bold tracking-wider text-[#f8f6ef] leading-tight">
              RONGIN LIBAS
            </h1>
            <span className="text-[10px] uppercase tracking-widest text-[#c79a45] font-semibold">
              ADMIN PANEL
            </span>
          </div>
        </div>

        {isMobile && (
          <button
            type="button"
            onClick={closeMobileSidebar}
            className="p-1.5 rounded text-[#76a493] hover:text-white hover:bg-[#12503e] transition-colors cursor-pointer"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation list */}
      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain px-3 py-5">
        <div>
          <div className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-[#76a493]">
            NAVIGATION
          </div>
          <nav className="space-y-1">
            {visibleNavItems.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => {
                    if (isMobile) closeMobileSidebar();
                  }}
                  className={`flex items-center gap-3 px-3.5 py-2.5 text-xs font-medium tracking-wide transition-colors ${
                    active
                      ? 'bg-[#12503e] text-white border-l-2 border-[#c79a45] shadow-sm font-semibold'
                      : 'text-[#a1d1be] hover:text-white hover:bg-[#073a2d]/60'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      active ? 'text-[#c79a45]' : 'text-[#76a493]'
                    }`}
                  />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {visiblePrefItems.length > 0 && (
          <div>
            <div className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-[#76a493]">
              PREFERENCES
            </div>
            <nav className="space-y-1">
              {visiblePrefItems.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => {
                      if (isMobile) closeMobileSidebar();
                    }}
                    className={`flex items-center gap-3 px-3.5 py-2.5 text-xs font-medium tracking-wide transition-colors ${
                      active
                        ? 'bg-[#12503e] text-white border-l-2 border-[#c79a45] shadow-sm font-semibold'
                        : 'text-[#a1d1be] hover:text-white hover:bg-[#073a2d]/60'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        active ? 'text-[#c79a45]' : 'text-[#76a493]'
                      }`}
                    />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </div>

      {/* Bottom Sign Out */}
      <div className="p-4 border-t border-[#12503e]/30">
        <button
          onClick={() => {
            adminApi.auth.logout();
            router.replace('/login');
          }}
          className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-[#76a493] hover:text-[#ffdad6] hover:bg-[#ba1a1a]/20 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4 shrink-0 text-[#76a493]" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (visible on lg screens and up) */}
      <aside className="hidden lg:flex h-full w-64 shrink-0 flex-col overflow-hidden border-r border-[#12503e]/40 bg-[#00231a] text-[#deddd3] select-none">
        {renderNavContent(false)}
      </aside>

      {/* Mobile Sidebar (Drawer overlay when hamburger is open) */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={closeMobileSidebar}
          />
          {/* Slide-out Drawer */}
          <aside className="relative z-50 flex h-full w-72 max-w-[85vw] flex-col overflow-hidden border-r border-[#12503e]/40 bg-[#00231a] text-[#deddd3] select-none shadow-2xl animate-in slide-in-from-left duration-200">
            {renderNavContent(true)}
          </aside>
        </div>
      )}
    </>
  );
}
