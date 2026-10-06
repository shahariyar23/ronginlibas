'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Search, Bell, User, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';

export function Header() {
  const pathname = usePathname();
  const { setIsSearchOpen } = useAdmin();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Keyboard shortcut for Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsSearchOpen]);

  const getPageTitle = () => {
    if (pathname === '/') return 'Overview';
    if (pathname.startsWith('/products/add')) return 'Add Product';
    if (pathname.startsWith('/products')) return 'Products';
    if (pathname.startsWith('/orders')) return 'Orders';
    if (pathname.startsWith('/inventory')) return 'Inventory';
    if (pathname.startsWith('/categories')) return 'Categories';
    if (pathname.startsWith('/customers')) return 'Customers';
    if (pathname.startsWith('/coupons')) return 'Coupons';
    if (pathname.startsWith('/reviews')) return 'Reviews';
    if (pathname.startsWith('/settings')) return 'Settings';
    return 'Overview';
  };

  return (
    <header className="h-16 bg-[#fbf9f2] border-b border-[#deddd3] px-8 flex items-center justify-between sticky top-0 z-30">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#717975]">
        <span className="font-semibold text-[#073a2d]">ATELIER SUITE</span>
        <span className="text-[#deddd3]">/</span>
        <span className="text-[#1b1c18] font-bold">{getPageTitle()}</span>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-5">
        {/* Quick Search */}
        <div
          onClick={() => setIsSearchOpen(true)}
          className="flex items-center gap-2.5 bg-[#f0eee7] hover:bg-[#e4e2dc] border border-[#deddd3] px-3.5 py-1.5 cursor-pointer text-xs text-[#717975] transition-colors w-64 select-none"
        >
          <Search className="w-3.5 h-3.5 text-[#073a2d]" />
          <span className="flex-1 truncate">Quick search (Cmd+K)</span>
          <kbd className="text-[10px] bg-white border border-[#deddd3] px-1.5 py-0.5 text-[#404945] font-mono">
            ⌘K
          </kbd>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className="relative p-2 text-[#404945] hover:text-[#073a2d] hover:bg-[#f0eee7] transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#c79a45] rounded-full ring-2 ring-[#fbf9f2]" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-[#deddd3] shadow-lg p-4 z-50">
              <div className="flex items-center justify-between border-b border-[#deddd3] pb-2 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#073a2d]">
                  Atelier Dispatch Feed
                </span>
                <span className="text-[10px] text-[#c79a45] font-semibold bg-[#f5eedf] px-1.5 py-0.5">
                  2 NEW
                </span>
              </div>
              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-2.5 pb-2 border-b border-[#f0eee7]">
                  <CheckCircle2 className="w-4 h-4 text-[#0d4d3b] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-[#1b1c18]">Order #RL1001 Confirmed</p>
                    <p className="text-[11px] text-[#69726d]">Rahim in Gulshan-2 booked COD delivery</p>
                    <span className="text-[10px] text-[#717975]">10m ago</span>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-[#c79a45] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-[#1b1c18]">Low Stock Alert</p>
                    <p className="text-[11px] text-[#69726d]">Royal Jamdani Panjabi has 2 units remaining</p>
                    <span className="text-[10px] text-[#717975]">2h ago</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2.5 pl-2 py-1 pr-1 text-xs text-[#1b1c18] hover:bg-[#f0eee7] transition-colors"
          >
            <span className="font-medium text-xs tracking-tight text-[#1b1c18]">
              Master Tailor Admin
            </span>
            <div className="w-8 h-8 rounded-full bg-[#073a2d] text-[#f8f6ef] flex items-center justify-center font-bold text-xs ring-1 ring-[#c79a45]/50">
              <User className="w-4 h-4 text-[#f8f6ef]" />
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-[#deddd3] shadow-lg py-2 z-50 text-xs">
              <div className="px-4 py-2 border-b border-[#deddd3]">
                <p className="font-bold text-[#073a2d]">Dhaka Flagship Atelier</p>
                <p className="text-[11px] text-[#69726d]">admin@ronginlibas.com</p>
              </div>
              <div className="py-1">
                <div className="px-4 py-2 text-[#404945] flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#073a2d]" />
                  <span>Security Clearance: Master</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
