'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ShoppingCart,
  Search,
  RefreshCw,
  Mail,
  Send,
  Clock,
  AlertTriangle,
  Coins,
  CheckCircle2,
  Eye,
  X,
  Phone,
  ChevronLeft,
  ChevronRight,
  Loader2,
  MailCheck,
} from 'lucide-react';
import { adminApi } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { PermissionGuard } from '@/components/auth/PermissionGuard';

interface CartItemData {
  id: string;
  productId: string;
  productName: string;
  slug: string;
  image: string | null;
  variantId: string;
  size: string;
  color: string;
  stock: number;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

interface CartData {
  id: string;
  guestId?: string | null;
  customerId?: string | null;
  isRegistered: boolean;
  customerName: string;
  email: string | null;
  phone: string | null;
  hasEmail: boolean;
  itemsCount: number;
  totalQuantity: number;
  subtotal: number;
  isAbandoned: boolean;
  lastReminderSentAt: string | null;
  reminderCount: number;
  createdAt: string;
  updatedAt: string;
  items: CartItemData[];
}

interface StatsData {
  totalCartsWithItems: number;
  totalAbandonedCount: number;
  totalPotentialRevenue: number;
  totalRemindersSent: number;
}

export default function AbandonedCartsPage() {
  const { toast } = useToast();

  const [carts, setCarts] = useState<CartData[]>([]);
  const [stats, setStats] = useState<StatsData>({
    totalCartsWithItems: 0,
    totalAbandonedCount: 0,
    totalPotentialRevenue: 0,
    totalRemindersSent: 0,
  });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState<'ALL' | 'WITH_ITEMS' | 'ABANDONED' | 'HAS_EMAIL' | 'REMINDED'>('WITH_ITEMS');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  // Selected cart for inspection modal
  const [inspectCart, setInspectCart] = useState<CartData | null>(null);

  // Target cart for sending reminder email modal
  const [reminderCart, setReminderCart] = useState<CartData | null>(null);
  const [customNote, setCustomNote] = useState('');
  const [isSending, setIsSending] = useState(false);

  const fetchCarts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminApi.carts.getAll({
        page,
        limit: 15,
        filter,
        search,
      });

      if (res && res.data) {
        setCarts(res.data.carts || []);
        if (res.data.pagination) {
          setTotalPages(res.data.pagination.totalPages || 1);
        }
        if (res.data.stats) {
          setStats(res.data.stats);
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load customer carts', 'Error');
    } finally {
      setLoading(false);
    }
  }, [page, filter, search, toast]);

  useEffect(() => {
    fetchCarts();
  }, [fetchCarts]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  };

  const handleResetSearch = () => {
    setSearchInput('');
    setSearch('');
    setPage(1);
  };

  const handleSendReminder = async () => {
    if (!reminderCart) return;
    try {
      setIsSending(true);
      await adminApi.carts.sendReminder(reminderCart.id, customNote.trim() || undefined);
      toast.success(
        `Abandoned cart awareness email dispatched to ${reminderCart.email}!`,
        'EMAIL DISPATCHED'
      );
      setReminderCart(null);
      setCustomNote('');
      fetchCarts();
    } catch (err: any) {
      toast.error(err.message || 'Could not dispatch reminder email', 'DISPATCH FAILED');
    } finally {
      setIsSending(false);
    }
  };

  const formatRelativeTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    } catch {
      return 'Unknown';
    }
  };

  return (
    <PermissionGuard permission="orders">
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        {/* Page Header (Exact match with Categories style) */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#deddd3] pb-6">
          <div>
            <span className="text-[11px] font-bold tracking-widest uppercase text-[#717975]">
              BAG RETENTION &amp; CONCIERGE • DHAKA ATELIER
            </span>
            <h1 className="text-3xl font-serif text-[#1b1c18] mt-1 tracking-tight">
              Abandoned Carts
            </h1>
            <p className="text-xs text-[#69726d] mt-1">
              Curated patron shopping bags, abandoned checkout surveillance, and editorial recovery.
            </p>
          </div>

          <button
            onClick={fetchCarts}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#00231a] hover:bg-[#073a2d] text-white text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>REFRESH CARTS</span>
          </button>
        </div>

        {/* Top Metric Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white border border-[#deddd3] p-5 shadow-xs flex flex-col justify-between hover:border-[#c79a45] transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#717975]">
                Carts With Items
              </span>
              <span className="text-xs font-mono font-bold bg-[#f0eee7] px-2 py-0.5 text-[#073a2d]">
                BAGS
              </span>
            </div>
            <div className="mt-2 font-serif text-2xl font-bold text-[#1b1c18]">
              {stats.totalCartsWithItems}
            </div>
            <p className="text-xs text-[#69726d] mt-1 font-sans">
              Currently holding items in bags
            </p>
          </div>

          <div className="bg-white border border-[#deddd3] p-5 shadow-xs flex flex-col justify-between hover:border-[#c79a45] transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-800">
                Abandoned Carts
              </span>
              <span className="text-xs font-mono font-bold bg-amber-50 px-2 py-0.5 text-amber-800 border border-amber-200">
                &gt;1H
              </span>
            </div>
            <div className="mt-2 font-serif text-2xl font-bold text-amber-900">
              {stats.totalAbandonedCount}
            </div>
            <p className="text-xs text-[#69726d] mt-1 font-sans">
              Inactive for more than 1 hour
            </p>
          </div>

          <div className="bg-white border border-[#deddd3] p-5 shadow-xs flex flex-col justify-between hover:border-[#c79a45] transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#c79a45]">
                Potential Revenue
              </span>
              <span className="text-xs font-mono font-bold bg-[#f0eee7] px-2 py-0.5 text-[#073a2d]">
                BDT
              </span>
            </div>
            <div className="mt-2 font-serif text-2xl font-bold text-[#1b1c18]">
              ৳{stats.totalPotentialRevenue.toLocaleString('en-BD')}
            </div>
            <p className="text-xs text-[#69726d] mt-1 font-sans">
              Recoverable value in patrons&apos; bags
            </p>
          </div>

          <div className="bg-white border border-[#deddd3] p-5 shadow-xs flex flex-col justify-between hover:border-[#c79a45] transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-800">
                Reminders Sent
              </span>
              <span className="text-xs font-mono font-bold bg-emerald-50 px-2 py-0.5 text-emerald-800 border border-emerald-200">
                EMAILS
              </span>
            </div>
            <div className="mt-2 font-serif text-2xl font-bold text-emerald-900">
              {stats.totalRemindersSent}
            </div>
            <p className="text-xs text-[#69726d] mt-1 font-sans">
              Dispatched recovery awareness emails
            </p>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-white border border-[#deddd3] p-5 shadow-xs space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 text-xs font-sans">
              {[
                { key: 'WITH_ITEMS', label: 'With Items' },
                { key: 'ABANDONED', label: 'Abandoned (>1h)' },
                { key: 'HAS_EMAIL', label: 'Contactable (Has Email)' },
                { key: 'REMINDED', label: 'Reminded' },
                { key: 'ALL', label: 'All Carts' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => {
                    setFilter(tab.key as any);
                    setPage(1);
                  }}
                  className={`px-4 py-2 font-semibold uppercase tracking-wider text-xs whitespace-nowrap transition-colors cursor-pointer ${
                    filter === tab.key
                      ? 'bg-[#00231a] text-white'
                      : 'bg-white border border-[#deddd3] text-[#717975] hover:text-[#1b1c18] hover:border-[#073a2d]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
              <div className="relative w-full sm:w-72">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#838e87]" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search patron, email, phone..."
                  className="w-full pl-9 pr-8 py-2 text-xs font-sans bg-[#fbf9f2] border border-[#deddd3] focus:border-[#073a2d] focus:outline-none rounded-none text-[#1b1c18]"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={handleResetSearch}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold bg-[#00231a] hover:bg-[#073a2d] text-white uppercase tracking-wider transition-colors cursor-pointer"
              >
                Search
              </button>
            </form>
          </div>
        </div>

        {/* Carts Table */}
        <div className="bg-white border border-[#deddd3] shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-16 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-[#073a2d] animate-spin mx-auto" />
              <p className="text-xs font-sans text-[#69726d]">Loading customer shopping bags...</p>
            </div>
          ) : carts.length === 0 ? (
            <div className="p-16 text-center space-y-3">
              <ShoppingCart className="w-8 h-8 text-[#717975] mx-auto opacity-40" />
              <h3 className="font-serif text-lg text-[#1b1c18]">No Carts Found</h3>
              <p className="text-xs text-[#717975] max-w-sm mx-auto">
                No customer carts matched your current filter or search criteria.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans border-collapse">
                <thead>
                  <tr className="bg-[#f7f6ef] border-b border-[#deddd3] text-[#073a2d] uppercase tracking-wider text-[11px] font-bold">
                    <th className="py-3.5 px-5">Patron Details</th>
                    <th className="py-3.5 px-5">Reserved Items</th>
                    <th className="py-3.5 px-5">Cart Total</th>
                    <th className="py-3.5 px-5">Status &amp; Activity</th>
                    <th className="py-3.5 px-5">Reminder Status</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ebe9de]">
                  {carts.map((cart) => (
                    <tr key={cart.id} className="hover:bg-[#faf9f5] transition-colors">
                      {/* Patron details */}
                      <td className="py-4 px-5 align-top">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-serif font-medium text-base text-[#1b1c18]">
                              {cart.customerName}
                            </span>
                            {cart.isRegistered ? (
                              <span className="text-[9px] font-bold uppercase tracking-wider bg-[#00231a] text-white px-2 py-0.5">
                                Registered
                              </span>
                            ) : (
                              <span className="text-[9px] font-bold uppercase tracking-wider bg-[#f0eee7] text-[#717975] border border-[#deddd3] px-2 py-0.5">
                                Guest
                              </span>
                            )}
                          </div>
                          {cart.email ? (
                            <div className="flex items-center gap-1.5 text-xs text-[#404945]">
                              <Mail className="w-3.5 h-3.5 text-[#c79a45]" />
                              <span>{cart.email}</span>
                            </div>
                          ) : (
                            <div className="text-[11px] text-[#838e87] italic">No email attached yet</div>
                          )}
                          {cart.phone && (
                            <div className="flex items-center gap-1.5 text-xs text-[#69726d]">
                              <Phone className="w-3.5 h-3.5 text-gray-400" />
                              <span>{cart.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Items */}
                      <td className="py-4 px-5 align-top">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            {cart.items.slice(0, 3).map((item, idx) => (
                              <div
                                key={idx}
                                className="w-10 h-13 bg-[#f0eee7] overflow-hidden border border-[#deddd3] shrink-0"
                                title={`${item.productName} (${item.size})`}
                              >
                                {item.image ? (
                                  <img
                                    src={item.image}
                                    alt={item.productName}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                                    👔
                                  </div>
                                )}
                              </div>
                            ))}
                            {cart.items.length > 3 && (
                              <span className="text-xs font-mono font-bold bg-[#f0eee7] px-2 py-1 text-[#073a2d]">
                                +{cart.items.length - 3} more
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-[#69726d]">
                            <span className="font-mono font-bold text-[#073a2d]">{cart.totalQuantity}</span> pcs in {cart.itemsCount} garment{cart.itemsCount === 1 ? '' : 's'}
                          </div>
                        </div>
                      </td>

                      {/* Cart Value */}
                      <td className="py-4 px-5 align-top">
                        <div className="font-serif font-bold text-base text-[#073a2d]">
                          ৳{cart.subtotal.toLocaleString('en-BD')}
                        </div>
                      </td>

                      {/* Activity */}
                      <td className="py-4 px-5 align-top">
                        <div className="space-y-1">
                          {cart.isAbandoned ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-900 border border-amber-300">
                              <AlertTriangle className="w-3 h-3 text-amber-600" /> Abandoned
                            </span>
                          ) : cart.itemsCount > 0 ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-900 border border-emerald-300">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active Cart
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-semibold text-gray-500 bg-gray-100">
                              Empty
                            </span>
                          )}
                          <div className="text-xs text-[#717975]">
                            Updated: {formatRelativeTime(cart.updatedAt)}
                          </div>
                        </div>
                      </td>

                      {/* Reminder status */}
                      <td className="py-4 px-5 align-top">
                        {cart.reminderCount > 0 ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-900 border border-blue-300">
                              <MailCheck className="w-3 h-3 text-blue-600" /> Sent ({cart.reminderCount}x)
                            </span>
                            {cart.lastReminderSentAt && (
                              <div className="text-[11px] text-[#717975]">
                                Last: {formatRelativeTime(cart.lastReminderSentAt)}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-[#838e87]">Not sent yet</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 align-top text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setInspectCart(cart)}
                            className="px-3.5 py-1.5 bg-white border border-[#deddd3] hover:border-[#073a2d] hover:bg-[#f0eee7] text-[#1b1c18] text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5"
                            title="Inspect Cart Items"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Inspect</span>
                          </button>

                          {cart.hasEmail ? (
                            <button
                              onClick={() => {
                                setReminderCart(cart);
                                setCustomNote('');
                              }}
                              className="px-4 py-1.5 bg-[#00231a] hover:bg-[#073a2d] text-white text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                              title="Send Abandoned Cart Reminder Email"
                            >
                              <Send className="w-3.5 h-3.5 text-[#c79a45]" />
                              <span>Remind</span>
                            </button>
                          ) : (
                            <span
                              className="px-3 py-1.5 text-[10px] font-semibold text-gray-400 border border-dashed border-gray-300 cursor-not-allowed uppercase tracking-wider"
                              title="Customer hasn't provided an email yet"
                            >
                              No Email
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-[#deddd3] bg-[#faf9f5] flex items-center justify-between text-xs font-sans">
              <span className="text-[#69726d]">
                Page <strong>{page}</strong> of <strong>{totalPages}</strong>
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-4 py-2 bg-white border border-[#deddd3] text-xs font-semibold uppercase tracking-wider disabled:opacity-40 cursor-pointer hover:border-[#073a2d] transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5 inline mr-1" /> Prev
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-4 py-2 bg-white border border-[#deddd3] text-xs font-semibold uppercase tracking-wider disabled:opacity-40 cursor-pointer hover:border-[#073a2d] transition-colors"
                >
                  Next <ChevronRight className="w-3.5 h-3.5 inline ml-1" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal: Inspect Cart Items */}
        {inspectCart && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-[#fbf9f2] border border-[#073a2d] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              {/* Modal Header */}
              <div className="p-6 border-b border-[#deddd3] bg-white flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold tracking-widest uppercase text-[#717975] block">
                    CART REQUISITION INSPECTION
                  </span>
                  <h3 className="font-serif text-xl font-medium text-[#1b1c18] mt-0.5">
                    {inspectCart.customerName}&apos;s Atelier Bag
                  </h3>
                  <div className="text-xs text-[#69726d] mt-1">
                    {inspectCart.email ? `Email: ${inspectCart.email}` : 'No email attached'}
                    {inspectCart.phone ? ` • Mobile: ${inspectCart.phone}` : ''}
                  </div>
                </div>
                <button
                  onClick={() => setInspectCart(null)}
                  className="text-gray-400 hover:text-gray-700 p-1 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Items List */}
              <div className="p-6 overflow-y-auto space-y-3 flex-1 bg-[#fbf9f2]">
                {inspectCart.items.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 bg-white border border-[#deddd3] flex gap-4 items-center shadow-xs"
                  >
                    <div className="w-16 h-20 bg-[#f0eee7] overflow-hidden shrink-0 border border-[#deddd3]">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.productName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-lg">👔</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-serif font-medium text-base text-[#1b1c18] truncate">
                        {item.productName}
                      </h4>
                      <div className="text-xs text-[#69726d] mt-1 flex items-center gap-2">
                        <span>Size: <strong>{item.size}</strong></span>
                        {item.color && <span>• Color: <strong>{item.color}</strong></span>}
                        <span>• Stock: <strong>{item.stock} left</strong></span>
                      </div>
                      <div className="text-xs text-[#404945] mt-1.5 font-mono">
                        {item.quantity} × ৳{item.unitPrice.toLocaleString('en-BD')} = <strong className="text-[#073a2d]">৳{item.lineTotal.toLocaleString('en-BD')}</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Modal Footer */}
              <div className="p-5 border-t border-[#deddd3] bg-white flex items-center justify-between">
                <div>
                  <span className="text-xs text-[#717975] block uppercase tracking-wider">Bag Subtotal:</span>
                  <span className="font-serif text-xl font-bold text-[#073a2d]">
                    ৳{inspectCart.subtotal.toLocaleString('en-BD')}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {inspectCart.hasEmail && (
                    <button
                      onClick={() => {
                        const target = inspectCart;
                        setInspectCart(null);
                        setReminderCart(target);
                        setCustomNote('');
                      }}
                      className="px-5 py-2.5 bg-[#00231a] hover:bg-[#073a2d] text-white text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-2 shadow-xs"
                    >
                      <Send className="w-3.5 h-3.5 text-[#c79a45]" />
                      <span>Send Reminder Email</span>
                    </button>
                  )}
                  <button
                    onClick={() => setInspectCart(null)}
                    className="px-5 py-2.5 bg-white border border-[#deddd3] hover:border-gray-400 text-[#404945] text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Send Reminder Awareness Email */}
        {reminderCart && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-[#fbf9f2] border border-[#073a2d] w-full max-w-lg shadow-2xl overflow-hidden space-y-5 p-6">
              <div className="flex items-start justify-between border-b border-[#deddd3] pb-4">
                <div>
                  <span className="text-[11px] font-bold tracking-widest uppercase text-[#717975] block">
                    EDITORIAL PATRON AWARENESS
                  </span>
                  <h3 className="font-serif text-xl font-medium text-[#1b1c18] mt-0.5">
                    Send Cart Recovery Email
                  </h3>
                  <p className="text-xs font-sans text-[#69726d] mt-1">
                    Send awareness email to patron for items in their shopping bag.
                  </p>
                </div>
                <button
                  onClick={() => setReminderCart(null)}
                  className="text-gray-400 hover:text-gray-700 cursor-pointer p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Recipient Details */}
              <div className="p-4 bg-white border border-[#deddd3] space-y-2 text-xs font-sans shadow-xs">
                <div className="flex justify-between">
                  <span className="text-[#717975]">Recipient:</span>
                  <span className="font-serif font-medium text-[#1b1c18]">{reminderCart.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#717975]">Email Address:</span>
                  <span className="font-mono font-bold text-[#073a2d]">{reminderCart.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#717975]">Reserved Bag Total:</span>
                  <span className="font-serif font-bold text-[#c79a45]">৳{reminderCart.subtotal.toLocaleString('en-BD')} ({reminderCart.totalQuantity} items)</span>
                </div>
                {reminderCart.reminderCount > 0 && (
                  <div className="flex justify-between text-amber-800 text-[11px] pt-2 border-t border-dashed border-[#ebe9de]">
                    <span>Prior Reminders:</span>
                    <span>Sent {reminderCart.reminderCount} time(s)</span>
                  </div>
                )}
              </div>

              {/* Items Preview */}
              <div className="space-y-1.5 text-xs font-sans">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#404945]">
                  Items Included in Awareness Email:
                </label>
                <div className="p-3 bg-white border border-[#deddd3] max-h-32 overflow-y-auto space-y-1.5">
                  {reminderCart.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between text-xs text-[#404945]">
                      <span className="truncate pr-2">• {it.productName} ({it.size}) × {it.quantity}</span>
                      <span className="shrink-0 font-mono font-semibold">৳{it.lineTotal.toLocaleString('en-BD')}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom Concierge Note (Optional) */}
              <div className="space-y-1.5 text-xs font-sans">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#404945]">
                  Custom Concierge Note or Special Privilege (Optional):
                </label>
                <textarea
                  rows={3}
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  placeholder="e.g. As a valued patron, use code BENGAL10 at checkout for an exclusive 10% privilege on this bag."
                  className="w-full p-3 bg-white border border-[#deddd3] focus:border-[#073a2d] focus:outline-none text-xs rounded-none text-[#1b1c18]"
                />
                <p className="text-[11px] text-[#717975]">
                  This personalized note will be prominently highlighted in the patron&apos;s recovery email.
                </p>
              </div>

              {/* Modal Actions */}
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#deddd3]">
                <button
                  type="button"
                  onClick={() => setReminderCart(null)}
                  disabled={isSending}
                  className="px-5 py-2.5 bg-white border border-[#deddd3] text-xs font-semibold uppercase tracking-wider text-[#404945] cursor-pointer hover:border-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSendReminder}
                  disabled={isSending}
                  className="px-6 py-2.5 bg-[#00231a] hover:bg-[#073a2d] text-white text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending Email...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5 text-[#c79a45]" />
                      <span>Dispatch Recovery Email</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PermissionGuard>
  );
}
