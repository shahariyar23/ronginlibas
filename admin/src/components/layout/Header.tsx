'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Search, Bell, User, CheckCircle2, AlertTriangle, ShieldCheck, LogOut } from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import { adminApi } from '@/lib/api';

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { setIsSearchOpen, backendConnected, orders, inventory } = useAdmin();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [userEmail, setUserEmail] = useState('admin@ronginlibas.com');
  const [userRole, setUserRole] = useState('Super Admin');

  useEffect(() => {
    const user = adminApi.auth.getUser();
    if (user?.email) {
      setUserEmail(user.email);
      setUserRole(user.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Staff');
    }
  }, []);

  const handleSignOut = () => {
    adminApi.auth.logout();
    router.replace('/login');
  };

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
      {/* Breadcrumb & Live Status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#717975]">
          <span className="font-semibold text-[#073a2d]">ATELIER SUITE</span>
          <span className="text-[#deddd3]">/</span>
          <span className="text-[#1b1c18] font-bold">{getPageTitle()}</span>
        </div>

        {/* Live Backend Connection Indicator */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] tracking-wide font-medium border border-[#deddd3] bg-white shadow-xs">
          <span
            className={`w-2 h-2 rounded-full ${
              backendConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
            }`}
          />
          <span className="text-[#404945]">
            {backendConnected ? 'Cloud DB Live' : 'Local Cache'}
          </span>
        </div>
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
                  {orders.filter((o) => o.status === 'PENDING').length +
                    inventory.filter((i) => i.stock <= 5).length}{' '}
                  ALERTS
                </span>
              </div>
              <div className="space-y-3 text-xs max-h-72 overflow-y-auto">
                {orders.filter((o) => o.status === 'PENDING').length === 0 &&
                inventory.filter((i) => i.stock <= 5).length === 0 ? (
                  <p className="text-[11px] text-[#717975] py-2 text-center">
                    All atelier operations nominal. No pending alerts.
                  </p>
                ) : (
                  <>
                    {orders
                      .filter((o) => o.status === 'PENDING')
                      .slice(0, 3)
                      .map((o) => (
                        <div key={o.id} className="flex items-start gap-2.5 pb-2 border-b border-[#f0eee7]">
                          <CheckCircle2 className="w-4 h-4 text-[#0d4d3b] shrink-0 mt-0.5" />
                          <div>
                            <p className="font-semibold text-[#1b1c18]">Order {o.id} Pending</p>
                            <p className="text-[11px] text-[#69726d]">
                              {o.customerName} • ৳{o.amount.toLocaleString()} ({o.paymentMethod})
                            </p>
                            <span className="text-[10px] text-[#717975]">{o.dateStr}</span>
                          </div>
                        </div>
                      ))}

                    {inventory
                      .filter((i) => i.stock <= 5)
                      .slice(0, 3)
                      .map((i) => (
                        <div key={i.id} className="flex items-start gap-2.5">
                          <AlertTriangle className="w-4 h-4 text-[#c79a45] shrink-0 mt-0.5" />
                          <div>
                            <p className="font-semibold text-[#1b1c18]">Low Stock Alert</p>
                            <p className="text-[11px] text-[#69726d]">
                              {i.name} has only {i.stock} units remaining
                            </p>
                            <span className="text-[10px] text-[#717975]">SKU: {i.sku}</span>
                          </div>
                        </div>
                      ))}
                  </>
                )}
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
            <div className="absolute right-0 mt-2 w-60 bg-white border border-[#deddd3] shadow-lg py-2 z-50 text-xs">
              <div className="px-4 py-2 border-b border-[#deddd3]">
                <p className="font-bold text-[#073a2d]">Dhaka Flagship Atelier</p>
                <p className="text-[11px] text-[#69726d] truncate">{userEmail}</p>
              </div>
              <div className="py-1">
                <div className="px-4 py-2 text-[#404945] flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#073a2d]" />
                  <span>Clearance: {userRole}</span>
                </div>
              </div>
              <div className="border-t border-[#deddd3] pt-1">
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-2 text-[#ba1a1a] hover:bg-[#ba1a1a]/10 flex items-center gap-2 font-medium transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-[#ba1a1a]" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
