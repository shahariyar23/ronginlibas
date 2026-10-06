'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
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
} from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Products', href: '/products', icon: Shirt },
  { name: 'Categories', href: '/categories', icon: Layers },
  { name: 'Orders', href: '/orders', icon: ShoppingBag },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Inventory', href: '/inventory', icon: Warehouse },
  { name: 'Coupons', href: '/coupons', icon: Ticket },
  { name: 'Reviews', href: '/reviews', icon: MessageSquare },
];

const PREF_ITEMS = [
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-64 bg-[#00231a] text-[#deddd3] flex flex-col min-h-screen border-r border-[#12503e]/40 shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-6 border-b border-[#12503e]/30 flex items-center gap-3">
        <div className="w-10 h-10 bg-[#073a2d] border border-[#c79a45]/40 flex items-center justify-center p-1.5 shrink-0">
          <Image
            src="/logo.svg"
            alt="Rongin Libas"
            width={28}
            height={28}
            className="w-full h-full object-contain filter brightness-200"
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

      {/* Navigation list */}
      <div className="flex-1 px-3 py-5 overflow-y-auto space-y-6">
        <div>
          <div className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-[#76a493]">
            NAVIGATION
          </div>
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
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

        <div>
          <div className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-[#76a493]">
            PREFERENCES
          </div>
          <nav className="space-y-1">
            {PREF_ITEMS.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
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
      </div>

      {/* Bottom Sign Out */}
      <div className="p-4 border-t border-[#12503e]/30">
        <button
          onClick={() => {
            alert('Atelier Suite: Master session active.');
          }}
          className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-[#76a493] hover:text-[#ffdad6] hover:bg-[#ba1a1a]/10 transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0 text-[#76a493]" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
