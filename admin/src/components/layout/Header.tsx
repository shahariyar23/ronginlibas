'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Search, Bell, User, CheckCircle2, AlertTriangle, ShieldCheck, LogOut, CheckCheck, KeyRound, Lock, X, Menu } from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import { useToast } from '@/context/ToastContext';
import { adminApi } from '@/lib/api';

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const {
    setIsSearchOpen,
    backendConnected,
    orders,
    inventory,
    openMobileSidebar,
    setIsPasswordModalOpen,
  } = useAdmin();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [userEmail, setUserEmail] = useState('admin@ronginlibas.com');
  const [userRole, setUserRole] = useState('Super Admin');
  const [readTimestamp, setReadTimestamp] = useState<number | null>(null);

  const notificationRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const pendingOrders = orders.filter((o) => o.status === 'PENDING');
  const lowStockItems = inventory.filter((i) => i.stock <= 5);
  const totalAlerts = pendingOrders.length + lowStockItems.length;

  useEffect(() => {
    try {
      const saved = localStorage.getItem('rongin_admin_notifications_read_at');
      if (saved) {
        setReadTimestamp(Number(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  const isMarkedRead = readTimestamp !== null;
  const unreadCount = isMarkedRead ? 0 : totalAlerts;

  const handleMarkAllAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    const now = Date.now();
    setReadTimestamp(now);
    try {
      localStorage.setItem('rongin_admin_notifications_read_at', String(now));
    } catch {
      // ignore
    }
  };

  const handleMarkAllAsUnread = (e: React.MouseEvent) => {
    e.stopPropagation();
    setReadTimestamp(null);
    try {
      localStorage.removeItem('rongin_admin_notifications_read_at');
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const { toast } = useToast();
  const [userName, setUserName] = useState('Master Tailor Admin');
  const [mustChangePassword, setMustChangePassword] = useState(false);

  useEffect(() => {
    const user = adminApi.auth.getUser();
    if (user?.email) {
      setUserEmail(user.email);
      setUserRole(
        user.role === 'SUPER_ADMIN'
          ? 'Super Admin'
          : user.role === 'ADMIN'
          ? 'Administrator'
          : 'Staff Manager',
      );
      if (user.firstName || user.lastName) {
        setUserName(`${user.firstName || ''} ${user.lastName || ''}`.trim());
      }
      if (user.mustChangePassword) {
        setMustChangePassword(true);
      }
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
    if (pathname.startsWith('/carts')) return 'Abandoned Carts';
    if (pathname.startsWith('/inventory')) return 'Inventory';
    if (pathname.startsWith('/categories')) return 'Categories';
    if (pathname.startsWith('/customers')) return 'Customers';
    if (pathname.startsWith('/coupons')) return 'Coupons';
    if (pathname.startsWith('/reviews')) return 'Reviews';
    if (pathname.startsWith('/settings')) return 'Settings';
    return 'Overview';
  };

  return (
    <header className="h-16 bg-[#fbf9f2] border-b border-[#deddd3] px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
      {/* Breadcrumb & Live Status */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={openMobileSidebar}
          className="lg:hidden p-1.5 -ml-1 text-[#073a2d] hover:bg-[#f0eee7] rounded-md transition-colors cursor-pointer"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#717975] truncate">
          <span className="hidden sm:inline font-semibold text-[#073a2d]">ATELIER SUITE</span>
          <span className="hidden sm:inline text-[#deddd3]">/</span>
          <span className="text-[#1b1c18] font-bold truncate max-w-[150px] sm:max-w-none">{getPageTitle()}</span>
        </div>

        {/* Live Backend Connection Indicator */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] tracking-wide font-medium border border-[#deddd3] bg-white shadow-xs">
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
      <div className="flex items-center gap-3 sm:gap-5">
        {/* Quick Search */}
        <div
          onClick={() => setIsSearchOpen(true)}
          className="hidden md:flex items-center gap-2.5 bg-[#f0eee7] hover:bg-[#e4e2dc] border border-[#deddd3] px-3.5 py-1.5 cursor-pointer text-xs text-[#717975] transition-colors w-44 lg:w-64 select-none"
        >
          <Search className="w-3.5 h-3.5 text-[#073a2d]" />
          <span className="flex-1 truncate">Quick search</span>
          <kbd className="text-[10px] bg-white border border-[#deddd3] px-1.5 py-0.5 text-[#404945] font-mono">
            ⌘K
          </kbd>
        </div>

        {/* Notifications */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className="relative p-2 text-[#404945] hover:text-[#073a2d] hover:bg-[#f0eee7] transition-colors"
            title={unreadCount > 0 ? `${unreadCount} new alerts` : '0 notifications'}
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span
              className={`absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 text-[10px] font-bold font-sans rounded-full flex items-center justify-center leading-none ring-2 ring-[#fbf9f2] shadow-xs select-none transition-colors ${
                unreadCount > 0
                  ? 'bg-[#ba1a1a] text-white'
                  : 'bg-[#deddd3] text-[#555e5a]'
              }`}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-96 bg-white border border-[#deddd3] shadow-lg p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-[#deddd3] pb-2.5 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#073a2d]">
                    Atelier Dispatch Feed
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.5 ${
                      unreadCount > 0
                        ? 'bg-[#ffdad6] text-[#ba1a1a]'
                        : 'bg-[#e4e2dc] text-[#555e5a]'
                    }`}
                  >
                    {unreadCount} ALERTS
                  </span>
                </div>
                {unreadCount > 0 ? (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-[11px] text-[#073a2d] hover:text-[#ba1a1a] hover:underline font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                    title="Mark all notifications as read"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Mark Read</span>
                  </button>
                ) : (
                  <button
                    onClick={handleMarkAllAsUnread}
                    className="text-[10px] text-[#717975] hover:text-[#073a2d] hover:underline font-normal cursor-pointer transition-colors"
                    title="Reset to unread count"
                  >
                    <span>Mark Unread</span>
                  </button>
                )}
              </div>
              <div className="space-y-1.5 text-xs max-h-80 overflow-y-auto pr-1">
                {totalAlerts === 0 ? (
                  <p className="text-[11px] text-[#717975] py-6 text-center">
                    All atelier operations nominal. No pending alerts.
                  </p>
                ) : (
                  <>
                    {pendingOrders.map((o) => (
                      <div
                        key={o.id}
                        onClick={() => {
                          setShowNotifications(false);
                          router.push('/orders');
                        }}
                        className={`flex items-start gap-2.5 p-2 rounded-xs hover:bg-[#fbf9f2] border-b border-[#f0eee7] transition-all cursor-pointer ${
                          isMarkedRead ? 'opacity-65' : ''
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4 text-[#0d4d3b] shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-[#1b1c18] truncate">
                            Order {o.id} Pending
                          </p>
                          <p className="text-[11px] text-[#69726d] truncate">
                            {o.customerName} • ৳{o.amount.toLocaleString()} ({o.paymentMethod})
                          </p>
                          <span className="text-[10px] text-[#717975]">{o.dateStr}</span>
                        </div>
                      </div>
                    ))}

                    {lowStockItems.map((i) => (
                      <div
                        key={i.id}
                        onClick={() => {
                          setShowNotifications(false);
                          router.push('/inventory');
                        }}
                        className={`flex items-start gap-2.5 p-2 rounded-xs hover:bg-[#fbf9f2] border-b border-[#f0eee7] transition-all cursor-pointer ${
                          isMarkedRead ? 'opacity-65' : ''
                        }`}
                      >
                        <AlertTriangle className="w-4 h-4 text-[#c79a45] shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-[#1b1c18] truncate">Low Stock Alert</p>
                          <p className="text-[11px] text-[#69726d] truncate">
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
        <div className="relative" ref={profileMenuRef}>
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2.5 pl-2 py-1 pr-1 text-xs text-[#1b1c18] hover:bg-[#f0eee7] transition-colors cursor-pointer"
          >
            <span className="font-medium text-xs tracking-tight text-[#1b1c18]">
              {userName}
            </span>
            <div className="w-8 h-8 rounded-full bg-[#073a2d] text-[#f8f6ef] flex items-center justify-center font-bold text-xs ring-1 ring-[#c79a45]/50">
              <User className="w-4 h-4 text-[#f8f6ef]" />
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-[#deddd3] shadow-xl py-2 z-50 text-xs">
              <div className="px-4 py-2 border-b border-[#deddd3]">
                <p className="font-bold text-[#073a2d]">{userName}</p>
                <p className="text-[11px] text-[#69726d] truncate">{userEmail}</p>
              </div>

              {mustChangePassword && (
                <div className="m-2 p-2 bg-[#fff8e1] border border-[#ffe082] text-[#8d6e63] text-[11px] rounded-xs">
                  <p className="font-semibold text-[#6d4c41]">Password Update Required</p>
                  <p>Please update your default password to secure your account.</p>
                </div>
              )}

              <div className="py-1">
                <div className="px-4 py-2 text-[#404945] flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#073a2d]" />
                  <span>Clearance: {userRole}</span>
                </div>
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    setIsPasswordModalOpen(true);
                  }}
                  className="w-full text-left px-4 py-2 text-[#073a2d] hover:bg-[#f0eee7] flex items-center gap-2 font-medium transition-colors cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5 text-[#c79a45]" />
                  <span>Change Password</span>
                </button>
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
