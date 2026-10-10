'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Search,
  Award,
  Phone,
  MapPin,
  Download,
  X,
  Calendar,
  CreditCard,
  Package,
  Star,
  Scissors,
  Mail,
  ExternalLink,
  Clock,
  CheckCircle2,
  ShoppingBag,
  ChevronRight,
  Loader2,
  Sparkles,
  Ruler,
  MessageSquare,
  FileText,
  User,
  ShieldCheck,
  Truck,
  AlertCircle,
  KeyRound,
  Ban,
  Trash2,
  Archive,
  RotateCcw,
  AlertTriangle,
  History,
  ShieldAlert,
  Info,
} from 'lucide-react';
import Link from 'next/link';
import { adminApi } from '@/lib/api';
import { TablePageSkeleton } from '@/components/common/Skeleton';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { useToast } from '@/context/ToastContext';

interface Patron {
  id: string;
  name: string;
  email: string;
  phone: string;
  secondaryPhone?: string;
  location: string;
  tier: 'VIP Patron' | 'Atelier Regular' | 'New Client';
  ordersCount: number;
  totalSpent: number;
  lastOrder: string;
  isActive: boolean;
  banReason?: string | null;
  bannedAt?: string | null;
  deletedAt?: string | null;
}

interface CustomerArchiveItem {
  id: string;
  originalId: string;
  firstName: string;
  lastName?: string | null;
  email?: string | null;
  phone: string;
  secondaryPhone?: string | null;
  addresses?: any;
  measurements?: any;
  ordersSnapshot?: any;
  totalSpent: number | string;
  totalOrders: number;
  deletedBy?: string | null;
  deleteReason?: string | null;
  deletedAt: string;
}

function CustomersContent() {
  const { toast } = useToast();

  const [patrons, setPatrons] = useState<Patron[]>([]);
  const [archives, setArchives] = useState<CustomerArchiveItem[]>([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(true);
  const [isLoadingArchives, setIsLoadingArchives] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'active' | 'banned' | 'archived' | 'permanent_archives'
  >('active');

  // Customer Details Drawer state
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [customerDetail, setCustomerDetail] = useState<any | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'reviews'>('profile');

  // Archive Snapshot Viewer Drawer state
  const [selectedArchive, setSelectedArchive] = useState<CustomerArchiveItem | null>(null);

  // Management Action Modals
  const [banModalPatron, setBanModalPatron] = useState<Patron | null>(null);
  const [banReason, setBanReason] = useState('');
  const [isSubmittingBan, setIsSubmittingBan] = useState(false);

  const [permanentDeleteModalPatron, setPermanentDeleteModalPatron] = useState<Patron | null>(null);
  const [confirmPermanentMark, setConfirmPermanentMark] = useState(false);
  const [permanentDeleteReason, setPermanentDeleteReason] = useState('');
  const [isDeletingPermanently, setIsDeletingPermanently] = useState(false);

  const [resetPasswordLoadingId, setResetPasswordLoadingId] = useState<string | null>(null);
  const [softDeleteLoadingId, setSoftDeleteLoadingId] = useState<string | null>(null);
  const [restoreLoadingId, setRestoreLoadingId] = useState<string | null>(null);

  const loadCustomers = useCallback(async () => {
    try {
      setIsLoadingCustomers(true);
      const res = await adminApi.customers.getAll({
        status: statusFilter === 'permanent_archives' ? 'all' : statusFilter,
      });

      if (res.success && Array.isArray(res.data?.items)) {
        const mapped: Patron[] = res.data.items.map((c: any) => {
          const name = `${c.firstName || ''} ${c.lastName || ''}`.trim() || 'Patron Client';
          const orders = c.orders || [];
          const ordersCount = c._count?.orders ?? orders.length ?? 0;
          const totalSpent =
            c.totalSpent ??
            orders.reduce((sum: number, o: any) => sum + (Number(o.totalAmount) || 0), 0);

          const defaultAddress = c.addresses?.find((a: any) => a.isDefault) || c.addresses?.[0];
          const orderWithAddress = orders.find(
            (o: any) => o.shippingAddress && (o.shippingAddress.addressLine1 || o.shippingAddress.city),
          );
          const orderAddr = orderWithAddress?.shippingAddress;
          const address =
            c.location ||
            (defaultAddress
              ? [defaultAddress.city, defaultAddress.division].filter(Boolean).join(', ') ||
                defaultAddress.addressLine1
              : orderAddr
              ? [orderAddr.addressLine1, orderAddr.city, orderAddr.division].filter(Boolean).join(', ') ||
                orderAddr.city
              : '—');

          return {
            id: c.id,
            name,
            email: c.email || '—',
            phone: c.phone || '—',
            secondaryPhone: c.secondaryPhone,
            location: address,
            tier: ordersCount >= 5 ? 'VIP Patron' : ordersCount > 0 ? 'Atelier Regular' : 'New Client',
            ordersCount,
            totalSpent,
            isActive: c.isActive,
            banReason: c.banReason,
            bannedAt: c.bannedAt,
            deletedAt: c.deletedAt,
            lastOrder:
              c.lastOrderDate || c.orders?.[0]?.createdAt
                ? new Date(c.lastOrderDate || c.orders[0].createdAt).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })
                : 'Active Ledger',
          };
        });
        setPatrons(mapped);
      } else {
        setPatrons([]);
      }
    } catch (err) {
      console.warn('Customers API fetch error:', err);
    } finally {
      setIsLoadingCustomers(false);
    }
  }, [statusFilter]);

  const loadArchives = useCallback(async () => {
    try {
      setIsLoadingArchives(true);
      const res = await adminApi.customers.getArchives();
      if (res.success && Array.isArray(res.data?.items)) {
        setArchives(res.data.items);
      } else {
        setArchives([]);
      }
    } catch (err) {
      console.warn('Archives fetch error:', err);
    } finally {
      setIsLoadingArchives(false);
    }
  }, []);

  useEffect(() => {
    if (statusFilter === 'permanent_archives') {
      loadArchives();
    } else {
      loadCustomers();
    }
  }, [statusFilter, loadCustomers, loadArchives]);

  const handleOpenCustomer = async (id: string) => {
    setSelectedCustomerId(id);
    setIsLoadingDetail(true);
    setActiveTab('profile');
    try {
      const res = await adminApi.customers.getById(id);
      if (res.success && res.data) {
        setCustomerDetail(res.data);
      } else {
        setCustomerDetail(null);
      }
    } catch (err) {
      console.error('Failed to load customer profile details:', err);
      setCustomerDetail(null);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleCloseCustomer = () => {
    setSelectedCustomerId(null);
    setCustomerDetail(null);
  };

  // Password Reset Link Handler
  const handleSendResetPassword = async (patronId: string, email: string, name?: string) => {
    if (!email || email === '—') {
      toast.error('This customer does not have an email address associated with their account.');
      return;
    }

    setResetPasswordLoadingId(patronId);
    try {
      const res = await adminApi.customers.sendResetPassword(patronId);
      toast.success(
        res.message || `Password reset link dispatched successfully to ${email}`,
        'PASSWORD RESET LINK DISPATCHED',
      );
    } catch (err: any) {
      toast.error(err.message || 'Failed to dispatch password reset link');
    } finally {
      setResetPasswordLoadingId(null);
    }
  };

  // Open Ban Prompt Modal
  const handleOpenBanModal = (patron: Patron) => {
    setBanModalPatron(patron);
    setBanReason('');
  };

  // Confirm Ban Submission
  const handleConfirmBan = async () => {
    if (!banModalPatron) return;
    if (!banReason.trim()) {
      toast.error('A reason must be provided when banning or suspending a customer.');
      return;
    }

    setIsSubmittingBan(true);
    try {
      const res = await adminApi.customers.updateStatus(banModalPatron.id, {
        isActive: false,
        reason: banReason.trim(),
      });
      toast.success(
        res.message || `Customer "${banModalPatron.name}" has been banned and notice email dispatched.`,
        'ACCOUNT SUSPENDED',
      );
      setBanModalPatron(null);
      setBanReason('');
      await loadCustomers();
      if (selectedCustomerId === banModalPatron.id) {
        await handleOpenCustomer(banModalPatron.id);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to suspend customer account');
    } finally {
      setIsSubmittingBan(false);
    }
  };

  // Reactivate / Unban Customer
  const handleActivateCustomer = async (patron: Patron) => {
    try {
      const res = await adminApi.customers.updateStatus(patron.id, {
        isActive: true,
      });
      toast.success(
        res.message || `Customer "${patron.name}" account reactivated successfully.`,
        'ACCOUNT REACTIVATED',
      );
      await loadCustomers();
      if (selectedCustomerId === patron.id) {
        await handleOpenCustomer(patron.id);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to reactivate customer account');
    }
  };

  // Soft Delete Customer
  const handleSoftDelete = async (patron: Patron) => {
    const confirmed = window.confirm(
      `Are you sure you want to soft-delete (archive) customer "${patron.name}"?\n\nThey will be removed from the active roster, but their orders and measurements will remain intact and can be restored at any time.`,
    );
    if (!confirmed) return;

    setSoftDeleteLoadingId(patron.id);
    try {
      const res = await adminApi.customers.softDelete(patron.id);
      toast.success(res.message || 'Customer soft-deleted successfully', 'CUSTOMER ARCHIVED');
      await loadCustomers();
      if (selectedCustomerId === patron.id) {
        handleCloseCustomer();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to soft delete customer');
    } finally {
      setSoftDeleteLoadingId(null);
    }
  };

  // Restore Soft-Deleted Customer
  const handleRestoreCustomer = async (patron: Patron) => {
    setRestoreLoadingId(patron.id);
    try {
      const res = await adminApi.customers.restore(patron.id);
      toast.success(res.message || 'Customer restored to active clientele roster', 'CUSTOMER RESTORED');
      await loadCustomers();
      if (selectedCustomerId === patron.id) {
        await handleOpenCustomer(patron.id);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to restore customer');
    } finally {
      setRestoreLoadingId(null);
    }
  };

  // Open Permanent Delete Warning Modal
  const handleOpenPermanentDeleteModal = (patron: Patron) => {
    setPermanentDeleteModalPatron(patron);
    setConfirmPermanentMark(false);
    setPermanentDeleteReason('');
  };

  // Confirm Permanent Delete Submission
  const handleConfirmPermanentDelete = async () => {
    if (!permanentDeleteModalPatron) return;
    if (!confirmPermanentMark) {
      toast.error('You must confirm the permanent deletion warning checkbox.');
      return;
    }

    setIsDeletingPermanently(true);
    try {
      const res = await adminApi.customers.permanentDelete(permanentDeleteModalPatron.id, {
        confirm: true,
        reason: permanentDeleteReason.trim() || undefined,
      });
      toast.success(
        res.message ||
          'Customer permanently deleted. Complete purchase history snapshot preserved in archive.',
        'PERMANENT DELETION COMPLETE',
      );
      setPermanentDeleteModalPatron(null);
      setConfirmPermanentMark(false);
      setPermanentDeleteReason('');
      if (selectedCustomerId === permanentDeleteModalPatron.id) {
        handleCloseCustomer();
      }
      await loadCustomers();
    } catch (err: any) {
      toast.error(err.message || 'Failed to permanently delete customer');
    } finally {
      setIsDeletingPermanently(false);
    }
  };

  const filtered = patrons.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase()) ||
      p.phone.includes(search),
  );

  const filteredArchives = archives.filter(
    (a) =>
      `${a.firstName} ${a.lastName || ''}`.toLowerCase().includes(search.toLowerCase()) ||
      (a.email && a.email.toLowerCase().includes(search.toLowerCase())) ||
      a.phone.includes(search),
  );

  const handleExportCSV = () => {
    const headers = [
      'ID',
      'Name',
      'Email',
      'Phone',
      'Location',
      'Tier',
      'Status',
      'Orders',
      'Total Spend',
      'Last Order',
    ];
    const rows = filtered.map((p) => [
      p.id,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.email}"`,
      `"${p.phone}"`,
      `"${p.location.replace(/"/g, '""')}"`,
      `"${p.tier}"`,
      `"${p.deletedAt ? 'Archived' : !p.isActive ? 'Banned' : 'Active'}"`,
      p.ordersCount,
      p.totalSpent,
      `"${p.lastOrder}"`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `rongin_libas_clientele_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoadingCustomers && patrons.length === 0 && statusFilter !== 'permanent_archives') {
    return (
      <TablePageSkeleton
        title="Atelier Patrons & Clientele"
        showAddButton={false}
        rowCount={8}
      />
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#deddd3] pb-6">
        <div>
          <span className="text-[11px] font-bold tracking-widest uppercase text-[#717975]">
            ATELIER CLIENTELE ROSTER • BANGLADESH
          </span>
          <h1 className="text-3xl font-serif text-[#1b1c18] mt-1 tracking-tight">Customers</h1>
          <p className="text-xs text-[#69726d] mt-1">
            Registered patrons, bespoke tailoring clientele, access security, and lifetime purchase audit records.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 border border-[#073a2d] text-xs font-semibold uppercase tracking-wider text-[#073a2d] hover:bg-[#073a2d] hover:text-white transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Roster</span>
          </button>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-[#deddd3] pb-px text-xs font-semibold uppercase tracking-wider">
        <button
          type="button"
          onClick={() => setStatusFilter('active')}
          className={`px-4 py-2.5 border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            statusFilter === 'active'
              ? 'border-[#073a2d] text-[#073a2d]'
              : 'border-transparent text-[#717975] hover:text-[#1b1c18]'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-[#073a2d]" />
          <span>Active Clientele</span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('banned')}
          className={`px-4 py-2.5 border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            statusFilter === 'banned'
              ? 'border-[#ba1a1a] text-[#ba1a1a]'
              : 'border-transparent text-[#717975] hover:text-[#1b1c18]'
          }`}
        >
          <Ban className="w-3.5 h-3.5 text-[#ba1a1a]" />
          <span>Suspended / Banned</span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('archived')}
          className={`px-4 py-2.5 border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            statusFilter === 'archived'
              ? 'border-[#8c6722] text-[#8c6722]'
              : 'border-transparent text-[#717975] hover:text-[#1b1c18]'
          }`}
        >
          <Archive className="w-3.5 h-3.5 text-[#8c6722]" />
          <span>Archived (Soft Deleted)</span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('permanent_archives')}
          className={`px-4 py-2.5 border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            statusFilter === 'permanent_archives'
              ? 'border-[#073a2d] text-[#073a2d]'
              : 'border-transparent text-[#717975] hover:text-[#1b1c18]'
          }`}
        >
          <History className="w-3.5 h-3.5 text-[#c79a45]" />
          <span>Permanent Purchase Snapshots</span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('all')}
          className={`px-4 py-2.5 border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            statusFilter === 'all'
              ? 'border-[#1b1c18] text-[#1b1c18]'
              : 'border-transparent text-[#717975] hover:text-[#1b1c18]'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>All Patrons</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-[#deddd3] p-4 flex items-center justify-between shadow-xs">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-[#717975] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={
              statusFilter === 'permanent_archives'
                ? 'Search permanent purchase archives by name, phone, email...'
                : 'Search patrons by name, phone, email...'
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#fbf9f2] border border-[#deddd3] text-xs text-[#1b1c18] focus:border-[#073a2d] outline-hidden placeholder-[#717975]"
          />
        </div>
        <span className="text-xs text-[#717975]">
          {statusFilter === 'permanent_archives'
            ? `${filteredArchives.length} preserved archive snapshots`
            : `${filtered.length} patrons listed`}
        </span>
      </div>

      {/* MAIN VIEW: Patrons Table vs Permanent Archives Table */}
      {statusFilter === 'permanent_archives' ? (
        /* Permanent Customer Archives Table */
        <div className="bg-white border border-[#deddd3] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#deddd3] bg-[#fbf9f2] text-[#717975] uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4 font-semibold">PERMANENTLY DELETED PATRON</th>
                  <th className="py-3 px-4 font-semibold">CONTACT DETAILS</th>
                  <th className="py-3 px-4 font-semibold">PRESERVED ORDERS</th>
                  <th className="py-3 px-4 font-semibold">LIFETIME PURCHASES</th>
                  <th className="py-3 px-4 font-semibold">DELETED BY & REASON</th>
                  <th className="py-3 px-4 font-semibold">DELETED DATE</th>
                  <th className="py-3 px-4 text-right font-semibold">AUDIT SNAPSHOT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0eee7]">
                {isLoadingArchives ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-[#717975]">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-[#073a2d]" />
                      <p className="text-xs">Loading preserved customer purchase archives...</p>
                    </td>
                  </tr>
                ) : filteredArchives.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-[#717975]">
                      <History className="w-8 h-8 mx-auto mb-2 opacity-40 text-[#717975]" />
                      <p className="font-serif text-sm text-[#1b1c18]">No archive snapshots found</p>
                      <p className="text-[11px] text-[#717975]">
                        When customers are permanently deleted, snapshots of their purchase records will appear here.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredArchives.map((archive) => {
                    const fullName =
                      `${archive.firstName || ''} ${archive.lastName || ''}`.trim() || 'Patron Client';
                    return (
                      <tr
                        key={archive.id}
                        onClick={() => setSelectedArchive(archive)}
                        className="hover:bg-[#fbf9f2] transition-colors cursor-pointer group"
                      >
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#717975] text-white flex items-center justify-center font-bold text-xs shrink-0">
                              {fullName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-[#1b1c18] group-hover:text-[#073a2d] transition-colors">
                                {fullName}
                              </p>
                              <p className="text-[10px] font-mono text-[#717975]">
                                Orig ID: {archive.originalId}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 space-y-0.5">
                          <div className="flex items-center gap-1.5 text-[#404945]">
                            <Phone className="w-3 h-3 text-[#717975] shrink-0" />
                            <span className="font-mono text-[11px]">{archive.phone}</span>
                          </div>
                          {archive.email && (
                            <div className="flex items-center gap-1.5 text-[#69726d]">
                              <Mail className="w-3 h-3 text-[#717975] shrink-0" />
                              <span className="truncate max-w-[180px]">{archive.email}</span>
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-[#1b1c18]">
                            {archive.totalOrders} order{archive.totalOrders === 1 ? '' : 's'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-serif font-bold text-sm text-[#073a2d]">
                          ৳{Number(archive.totalSpent).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 max-w-[200px]">
                          <p className="font-semibold text-[#1b1c18] truncate">
                            {archive.deletedBy || 'Shop Admin'}
                          </p>
                          <p className="text-[11px] text-[#717975] italic truncate">
                            {archive.deleteReason || 'Permanent deletion'}
                          </p>
                        </td>
                        <td className="py-3.5 px-4 text-[#717975]">
                          {new Date(archive.deletedAt).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedArchive(archive);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-[#073a2d] bg-[#fbf9f2] border border-[#deddd3] group-hover:border-[#073a2d] group-hover:bg-[#073a2d] group-hover:text-white transition-all cursor-pointer"
                          >
                            <span>Inspect Snapshot</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Active Patrons Table */
        <div className="bg-white border border-[#deddd3] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#deddd3] bg-[#fbf9f2] text-[#717975] uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4 font-semibold">PATRON</th>
                  <th className="py-3 px-4 font-semibold">STATUS</th>
                  <th className="py-3 px-4 font-semibold">CONTACT & LOCATION</th>
                  <th className="py-3 px-4 font-semibold">TIER STATUS</th>
                  <th className="py-3 px-4 font-semibold">ORDERS</th>
                  <th className="py-3 px-4 font-semibold">LIFETIME SPEND</th>
                  <th className="py-3 px-4 font-semibold">LAST PURCHASE</th>
                  <th className="py-3 px-4 text-right font-semibold">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0eee7]">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-[#717975]">
                      <Users className="w-8 h-8 mx-auto mb-2 opacity-40 text-[#717975]" />
                      <p className="font-serif text-sm text-[#1b1c18]">No patrons found</p>
                      <p className="text-[11px] text-[#717975]">
                        Clientele records matching the selected status will appear here.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((patron) => {
                    const isBanned = !patron.isActive && !patron.deletedAt;
                    const isArchived = !!patron.deletedAt;

                    return (
                      <tr
                        key={patron.id}
                        onClick={() => handleOpenCustomer(patron.id)}
                        className="hover:bg-[#fbf9f2] transition-colors cursor-pointer group"
                      >
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 group-hover:scale-105 transition-transform ${
                                isBanned
                                  ? 'bg-[#ba1a1a] text-white'
                                  : isArchived
                                  ? 'bg-[#8c6722] text-white'
                                  : 'bg-[#073a2d] text-white'
                              }`}
                            >
                              {patron.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-[#1b1c18] group-hover:text-[#073a2d] transition-colors">
                                {patron.name}
                              </p>
                              <p className="text-[10px] font-mono text-[#717975]">{patron.id}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          {isBanned ? (
                            <span
                              title={patron.banReason || 'Suspended by admin'}
                              className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-[#ffdad6] text-[#ba1a1a] rounded-xs"
                            >
                              <Ban className="w-2.5 h-2.5" />
                              Suspended
                            </span>
                          ) : isArchived ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-[#fef3c7] text-[#92400e] rounded-xs">
                              <Archive className="w-2.5 h-2.5" />
                              Archived
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-[#bcedda]/40 text-[#073a2d] rounded-xs">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              Active
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 space-y-0.5">
                          <div className="flex items-center gap-1.5 text-[#404945]">
                            <Phone className="w-3 h-3 text-[#717975] shrink-0" />
                            <span className="font-mono text-[11px]">{patron.phone}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[#69726d]">
                            <MapPin className="w-3 h-3 text-[#717975] shrink-0" />
                            <span className="truncate max-w-[180px]">{patron.location}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                              patron.tier === 'VIP Patron'
                                ? 'bg-[#f5eedf] text-[#8c6722]'
                                : patron.tier === 'Atelier Regular'
                                ? 'bg-[#bcedda]/40 text-[#073a2d]'
                                : 'bg-[#f0eee7] text-[#404945]'
                            }`}
                          >
                            <Award className="w-3 h-3" />
                            {patron.tier}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-bold text-[#1b1c18]">
                          {patron.ordersCount} orders
                        </td>

                        <td className="py-3.5 px-4 font-serif font-bold text-sm text-[#073a2d]">
                          ৳{patron.totalSpent.toLocaleString()}
                        </td>

                        <td className="py-3.5 px-4 text-[#717975]">{patron.lastOrder}</td>

                        <td className="py-3.5 px-4 text-right">
                          <div
                            className="inline-flex items-center gap-1.5"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {/* Reset Password Button */}
                            <button
                              type="button"
                              title="Send Password Reset Link"
                              disabled={resetPasswordLoadingId === patron.id}
                              onClick={() => handleSendResetPassword(patron.id, patron.email, patron.name)}
                              className="p-1.5 text-[#073a2d] bg-[#fbf9f2] border border-[#deddd3] hover:border-[#073a2d] hover:bg-[#073a2d] hover:text-white transition-colors cursor-pointer disabled:opacity-50"
                            >
                              {resetPasswordLoadingId === patron.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <KeyRound className="w-3.5 h-3.5" />
                              )}
                            </button>

                            {/* Ban or Activate Button */}
                            {isBanned ? (
                              <button
                                type="button"
                                title="Reactivate Account"
                                onClick={() => handleActivateCustomer(patron)}
                                className="p-1.5 text-[#073a2d] bg-[#bcedda]/30 border border-[#bcedda] hover:bg-[#073a2d] hover:text-white transition-colors cursor-pointer"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <button
                                type="button"
                                title="Suspend / Ban Customer"
                                onClick={() => handleOpenBanModal(patron)}
                                className="p-1.5 text-[#ba1a1a] bg-[#ffdad6]/40 border border-[#ffdad6] hover:bg-[#ba1a1a] hover:text-white transition-colors cursor-pointer"
                              >
                                <Ban className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* View Dossier Button */}
                            <button
                              type="button"
                              onClick={() => handleOpenCustomer(patron.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-[#073a2d] bg-[#fbf9f2] border border-[#deddd3] hover:border-[#073a2d] hover:bg-[#073a2d] hover:text-white transition-all cursor-pointer"
                            >
                              <span>Dossier</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CUSTOMER FULL DOSSIER DRAWER MODAL */}
      {selectedCustomerId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-end bg-black/50 backdrop-blur-xs transition-opacity animate-fade-in"
          onClick={handleCloseCustomer}
        >
          <div
            className="bg-white w-full max-w-4xl h-full shadow-2xl flex flex-col border-l border-[#deddd3] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="p-6 border-b border-[#deddd3] bg-[#fbf9f2] flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold tracking-widest uppercase text-[#717975] flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-[#c79a45]" />
                  ATELIER CLIENTELE ROSTER • PATRON DOSSIER
                </span>
                <h2 className="text-2xl font-serif text-[#1b1c18] mt-1 font-bold">
                  {isLoadingDetail
                    ? 'Loading Patron Record...'
                    : customerDetail
                    ? `${customerDetail.firstName || ''} ${customerDetail.lastName || ''}`.trim() || 'Patron Client'
                    : 'Customer Details'}
                </h2>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-[#717975]">
                  <span className="font-mono text-[11px]">ID: {selectedCustomerId}</span>
                  {customerDetail?.createdAt && (
                    <span>
                      • Patron Since:{' '}
                      {new Date(customerDetail.createdAt).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  )}
                  {customerDetail && (
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-xs ${
                        customerDetail.ordersCount >= 5
                          ? 'bg-[#f5eedf] text-[#8c6722]'
                          : customerDetail.ordersCount > 0
                          ? 'bg-[#bcedda]/40 text-[#073a2d]'
                          : 'bg-[#f0eee7] text-[#404945]'
                      }`}
                    >
                      <Award className="w-2.5 h-2.5" />
                      {customerDetail.ordersCount >= 5
                        ? 'VIP Patron'
                        : customerDetail.ordersCount > 0
                        ? 'Atelier Regular'
                        : 'New Client'}
                    </span>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={handleCloseCustomer}
                className="p-2 border border-[#deddd3] hover:border-[#1b1c18] text-[#717975] hover:text-[#1b1c18] bg-white transition-colors cursor-pointer"
                title="Close Dossier"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* ALERT BANNER: Banned or Soft-Deleted Warning */}
            {customerDetail && !customerDetail.isActive && !customerDetail.deletedAt && (
              <div className="bg-[#fff8f6] border-b border-[#fecdd3] p-4 flex items-start gap-3">
                <Ban className="w-5 h-5 text-[#ba1a1a] shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs">
                  <p className="font-bold text-[#ba1a1a] uppercase tracking-wider text-[11px]">
                    Customer Account Is Currently Suspended / Banned
                  </p>
                  <p className="text-[#1b1c18]">
                    <strong>Stated Reason:</strong> &ldquo;{customerDetail.banReason || 'Administrative suspension'}&rdquo;
                  </p>
                  {customerDetail.bannedAt && (
                    <p className="text-[10px] text-[#717975]">
                      Suspended on: {new Date(customerDetail.bannedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            )}

            {customerDetail && customerDetail.deletedAt && (
              <div className="bg-[#fef3c7] border-b border-[#fde68a] p-4 flex items-start gap-3">
                <Archive className="w-5 h-5 text-[#92400e] shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs">
                  <p className="font-bold text-[#92400e] uppercase tracking-wider text-[11px]">
                    Customer Soft-Deleted / Archived from Active Roster
                  </p>
                  <p className="text-[#92400e]">
                    Soft-deleted on: {new Date(customerDetail.deletedAt).toLocaleString()}. You can restore this customer record at any time.
                  </p>
                </div>
              </div>
            )}

            {/* ACTION TOOLBAR: Password Reset, Ban/Activate, Soft/Permanent Delete */}
            {customerDetail && (
              <div className="bg-white border-b border-[#deddd3] px-6 py-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Send Password Reset */}
                  <button
                    type="button"
                    disabled={resetPasswordLoadingId === customerDetail.id}
                    onClick={() =>
                      handleSendResetPassword(
                        customerDetail.id,
                        customerDetail.email,
                        customerDetail.firstName,
                      )
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#073a2d] text-xs font-semibold text-[#073a2d] bg-[#fbf9f2] hover:bg-[#073a2d] hover:text-white transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {resetPasswordLoadingId === customerDetail.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <KeyRound className="w-3.5 h-3.5" />
                    )}
                    <span>Send Password Reset Link</span>
                  </button>

                  {/* Ban or Reactivate */}
                  {!customerDetail.isActive && !customerDetail.deletedAt ? (
                    <button
                      type="button"
                      onClick={() => handleActivateCustomer(customerDetail)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#073a2d] text-xs font-semibold text-[#073a2d] bg-[#bcedda]/30 hover:bg-[#073a2d] hover:text-white transition-colors cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Reactivate Customer</span>
                    </button>
                  ) : !customerDetail.deletedAt ? (
                    <button
                      type="button"
                      onClick={() => handleOpenBanModal(customerDetail)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#ba1a1a] text-xs font-semibold text-[#ba1a1a] bg-[#ffdad6]/30 hover:bg-[#ba1a1a] hover:text-white transition-colors cursor-pointer"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>Suspend / Ban Customer</span>
                    </button>
                  ) : null}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Soft Delete or Restore */}
                  {customerDetail.deletedAt ? (
                    <button
                      type="button"
                      disabled={restoreLoadingId === customerDetail.id}
                      onClick={() => handleRestoreCustomer(customerDetail)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#073a2d] text-xs font-semibold text-[#073a2d] bg-[#fbf9f2] hover:bg-[#073a2d] hover:text-white transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {restoreLoadingId === customerDetail.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <RotateCcw className="w-3.5 h-3.5" />
                      )}
                      <span>Restore Customer</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={softDeleteLoadingId === customerDetail.id}
                      onClick={() => handleSoftDelete(customerDetail)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#deddd3] text-xs font-semibold text-[#717975] hover:text-[#1b1c18] hover:border-[#1b1c18] transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {softDeleteLoadingId === customerDetail.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Archive className="w-3.5 h-3.5" />
                      )}
                      <span>Archive (Soft Delete)</span>
                    </button>
                  )}

                  {/* Permanent Delete */}
                  <button
                    type="button"
                    onClick={() => handleOpenPermanentDeleteModal(customerDetail)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#ba1a1a] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#93000a] transition-colors cursor-pointer shadow-2xs"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Permanently</span>
                  </button>
                </div>
              </div>
            )}

            {/* Navigation Tabs */}
            <div className="flex items-center border-b border-[#deddd3] bg-white px-6 gap-6">
              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                className={`py-3.5 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === 'profile'
                    ? 'border-[#073a2d] text-[#073a2d]'
                    : 'border-transparent text-[#717975] hover:text-[#1b1c18]'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>1. Customer Profile</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('orders')}
                className={`py-3.5 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === 'orders'
                    ? 'border-[#073a2d] text-[#073a2d]'
                    : 'border-transparent text-[#717975] hover:text-[#1b1c18]'
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>2. Orders ({customerDetail?.orders?.length || 0})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('reviews')}
                className={`py-3.5 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === 'reviews'
                    ? 'border-[#073a2d] text-[#073a2d]'
                    : 'border-transparent text-[#717975] hover:text-[#1b1c18]'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>3. Product Reviews ({customerDetail?.reviews?.length || 0})</span>
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#fbf9f2]/40">
              {isLoadingDetail ? (
                <div className="py-24 text-center space-y-3">
                  <Loader2 className="w-8 h-8 animate-spin text-[#073a2d] mx-auto" />
                  <p className="text-xs font-semibold text-[#717975] uppercase tracking-wider">
                    Retrieving customer ledger, consignments, and product reviews...
                  </p>
                </div>
              ) : !customerDetail ? (
                <div className="py-24 text-center space-y-2">
                  <AlertCircle className="w-8 h-8 text-[#ba1a1a] mx-auto" />
                  <p className="font-serif text-sm text-[#1b1c18]">Unable to load customer record</p>
                  <p className="text-xs text-[#717975]">The customer record may not exist or could not be loaded.</p>
                </div>
              ) : (
                <>
                  {/* TAB 1: Customer Profile */}
                  {activeTab === 'profile' && (
                    <div className="space-y-6">
                      {/* Metric Summary Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-white border border-[#deddd3] p-4 shadow-2xs">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#717975] flex items-center gap-1.5">
                            <CreditCard className="w-3 h-3 text-[#073a2d]" />
                            Lifetime Acquisition Spend
                          </span>
                          <p className="font-serif text-2xl font-bold text-[#073a2d] mt-1">
                            ৳{(customerDetail.totalSpent || 0).toLocaleString()}
                          </p>
                          <p className="text-[10px] text-[#717975] mt-0.5">
                            Cumulative luxury orders value
                          </p>
                        </div>

                        <div className="bg-white border border-[#deddd3] p-4 shadow-2xs">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#717975] flex items-center gap-1.5">
                            <ShoppingBag className="w-3 h-3 text-[#073a2d]" />
                            Total Orders Placed
                          </span>
                          <p className="font-serif text-2xl font-bold text-[#1b1c18] mt-1">
                            {customerDetail.ordersCount || customerDetail.orders?.length || 0} orders
                          </p>
                          <p className="text-[10px] text-[#717975] mt-0.5">
                            Consignments logged to date
                          </p>
                        </div>

                        <div className="bg-white border border-[#deddd3] p-4 shadow-2xs">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#717975] flex items-center gap-1.5">
                            <Star className="w-3 h-3 text-[#c79a45]" />
                            Product Reviews Logged
                          </span>
                          <p className="font-serif text-2xl font-bold text-[#1b1c18] mt-1">
                            {customerDetail.reviewsCount || customerDetail.reviews?.length || 0} reviews
                          </p>
                          <p className="text-[10px] text-[#717975] mt-0.5">
                            Active sartorial client feedback
                          </p>
                        </div>
                      </div>

                      {/* Contact & Personal Information */}
                      <div className="bg-white border border-[#deddd3] p-5 shadow-2xs space-y-4">
                        <div className="flex items-center justify-between border-b border-[#f0eee7] pb-3">
                          <h3 className="font-serif text-base font-bold text-[#1b1c18] flex items-center gap-2">
                            <User className="w-4 h-4 text-[#073a2d]" />
                            Personal & Contact Information
                          </h3>
                          <span
                            className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                              customerDetail.deletedAt
                                ? 'bg-[#fef3c7] text-[#92400e]'
                                : !customerDetail.isActive
                                ? 'bg-[#ffdad6] text-[#ba1a1a]'
                                : 'bg-[#bcedda]/40 text-[#073a2d]'
                            }`}
                          >
                            {customerDetail.deletedAt
                              ? 'Archived Record'
                              : !customerDetail.isActive
                              ? 'Suspended Account'
                              : 'Active Account'}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                          <div>
                            <span className="text-[10px] font-bold uppercase text-[#717975]">Full Name</span>
                            <p className="font-semibold text-[#1b1c18] mt-0.5">
                              {`${customerDetail.firstName || ''} ${customerDetail.lastName || ''}`.trim() || '—'}
                            </p>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase text-[#717975]">Primary Phone</span>
                            <p className="font-mono font-semibold text-[#1b1c18] mt-0.5 flex items-center gap-1">
                              <Phone className="w-3 h-3 text-[#717975]" />
                              {customerDetail.phone || '—'}
                            </p>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase text-[#717975]">Email Address</span>
                            <p className="font-mono text-[#1b1c18] mt-0.5 flex items-center gap-1">
                              <Mail className="w-3 h-3 text-[#717975]" />
                              {customerDetail.email || '—'}
                            </p>
                          </div>
                          {customerDetail.secondaryPhone && (
                            <div>
                              <span className="text-[10px] font-bold uppercase text-[#717975]">Secondary Phone</span>
                              <p className="font-mono text-[#1b1c18] mt-0.5">{customerDetail.secondaryPhone}</p>
                            </div>
                          )}
                          <div>
                            <span className="text-[10px] font-bold uppercase text-[#717975]">Preferred Size</span>
                            <p className="font-semibold text-[#073a2d] mt-0.5">
                              {customerDetail.preferredSize || 'Not Specified'}
                            </p>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase text-[#717975]">Preferred Silhouette Cut</span>
                            <p className="font-semibold text-[#073a2d] mt-0.5">
                              {customerDetail.preferredFit || 'Standard Atelier Fit'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Saved Delivery Addresses */}
                      {(() => {
                        const addresses = customerDetail.addresses || [];
                        const orderAddresses = (customerDetail.orders || [])
                          .map((o: any) => o.shippingAddress)
                          .filter(Boolean);

                        const combinedList = [...addresses];
                        orderAddresses.forEach((oAddr: any, idx: number) => {
                          const isAlreadyInList = combinedList.some(
                            (a) =>
                              (a.addressLine1 &&
                                oAddr.addressLine1 &&
                                a.addressLine1.toLowerCase() === oAddr.addressLine1.toLowerCase()) ||
                              (a.phone && oAddr.phone && a.phone === oAddr.phone),
                          );
                          if (!isAlreadyInList) {
                            combinedList.push({
                              id: `order-addr-${idx}`,
                              ...oAddr,
                              isDefault: false,
                              source: 'ORDER_DESTINATION',
                            });
                          }
                        });

                        return (
                          <div className="bg-white border border-[#deddd3] p-5 shadow-2xs space-y-4">
                            <div className="flex items-center justify-between border-b border-[#f0eee7] pb-3">
                              <h3 className="font-serif text-base font-bold text-[#1b1c18] flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-[#073a2d]" />
                                Delivery Addresses ({combinedList.length})
                              </h3>
                              <span className="text-[10px] text-[#717975]">
                                Saved profile and order destinations
                              </span>
                            </div>

                            {combinedList.length === 0 ? (
                              <div className="py-6 text-center text-[#717975]">
                                <MapPin className="w-6 h-6 mx-auto mb-1 opacity-40 text-[#717975]" />
                                <p className="text-xs">No address records logged for this patron.</p>
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {combinedList.map((addr: any) => (
                                  <div
                                    key={addr.id}
                                    className={`border p-4 text-xs space-y-1.5 relative ${
                                      addr.isDefault
                                        ? 'border-[#073a2d] bg-[#fbf9f2]'
                                        : 'border-[#deddd3] bg-white'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="font-bold text-[#1b1c18]">
                                        {addr.fullName ||
                                          `${customerDetail.firstName || ''} ${customerDetail.lastName || ''}`}
                                      </span>
                                      {addr.isDefault ? (
                                        <span className="px-2 py-0.5 text-[9px] font-bold uppercase bg-[#073a2d] text-white shrink-0">
                                          Default Delivery
                                        </span>
                                      ) : (
                                        <span className="px-2 py-0.5 text-[9px] font-bold uppercase bg-[#f0eee7] text-[#404945] shrink-0">
                                          Saved Address
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[#404945] font-semibold text-xs">{addr.addressLine1}</p>
                                    {addr.addressLine2 && <p className="text-[#69726d]">{addr.addressLine2}</p>}
                                    <p className="text-[#69726d]">
                                      {[addr.area, addr.city, addr.division, addr.postalCode]
                                        .filter(Boolean)
                                        .join(', ')}
                                    </p>
                                    <div className="flex items-center gap-1.5 text-[#717975] pt-1">
                                      <Phone className="w-3 h-3" />
                                      <span className="font-mono text-[11px]">
                                        {addr.phone || customerDetail.phone}
                                      </span>
                                    </div>
                                    {addr.deliveryInstructions && (
                                      <div className="mt-2 text-[11px] bg-[#f0eee7] p-2 italic text-[#404945]">
                                        Note: &ldquo;{addr.deliveryInstructions}&rdquo;
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })()}

                      {/* Bespoke Tailoring Measurements */}
                      <div className="bg-white border border-[#deddd3] p-5 shadow-2xs space-y-4">
                        <div className="flex items-center justify-between border-b border-[#f0eee7] pb-3">
                          <h3 className="font-serif text-base font-bold text-[#1b1c18] flex items-center gap-2">
                            <Ruler className="w-4 h-4 text-[#c79a45]" />
                            Bespoke Tailoring Measurement Profile
                          </h3>
                          {customerDetail.measurements?.updatedAt && (
                            <span className="text-[10px] text-[#717975]">
                              Logged:{' '}
                              {new Date(customerDetail.measurements.updatedAt).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                          )}
                        </div>

                        {!customerDetail.measurements ? (
                          <div className="py-6 text-center text-[#717975]">
                            <Scissors className="w-6 h-6 mx-auto mb-1 opacity-40 text-[#717975]" />
                            <p className="text-xs">No bespoke tailoring measurements recorded yet for this client.</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                              <div className="border border-[#deddd3] p-3 bg-[#fbf9f2]">
                                <span className="text-[10px] font-bold uppercase text-[#717975]">Chest</span>
                                <p className="font-serif text-lg font-bold text-[#073a2d]">
                                  {customerDetail.measurements.chest || '—'}&quot;
                                </p>
                              </div>
                              <div className="border border-[#deddd3] p-3 bg-[#fbf9f2]">
                                <span className="text-[10px] font-bold uppercase text-[#717975]">Shoulder</span>
                                <p className="font-serif text-lg font-bold text-[#073a2d]">
                                  {customerDetail.measurements.shoulder || '—'}&quot;
                                </p>
                              </div>
                              <div className="border border-[#deddd3] p-3 bg-[#fbf9f2]">
                                <span className="text-[10px] font-bold uppercase text-[#717975]">Sleeve Length</span>
                                <p className="font-serif text-lg font-bold text-[#073a2d]">
                                  {customerDetail.measurements.sleeveLength || '—'}&quot;
                                </p>
                              </div>
                              <div className="border border-[#deddd3] p-3 bg-[#fbf9f2]">
                                <span className="text-[10px] font-bold uppercase text-[#717975]">Collar</span>
                                <p className="font-serif text-lg font-bold text-[#073a2d]">
                                  {customerDetail.measurements.collar || '—'}&quot;
                                </p>
                              </div>
                              <div className="border border-[#deddd3] p-3 bg-[#fbf9f2]">
                                <span className="text-[10px] font-bold uppercase text-[#717975]">Waist</span>
                                <p className="font-serif text-lg font-bold text-[#073a2d]">
                                  {customerDetail.measurements.waist || '—'}&quot;
                                </p>
                              </div>
                              <div className="border border-[#deddd3] p-3 bg-[#fbf9f2]">
                                <span className="text-[10px] font-bold uppercase text-[#717975]">Trouser Length</span>
                                <p className="font-serif text-lg font-bold text-[#073a2d]">
                                  {customerDetail.measurements.trouserLength || '—'}&quot;
                                </p>
                              </div>
                              <div className="border border-[#deddd3] p-3 bg-[#fbf9f2]">
                                <span className="text-[10px] font-bold uppercase text-[#717975]">Garment Length</span>
                                <p className="font-serif text-lg font-bold text-[#073a2d]">
                                  {customerDetail.measurements.garmentLength || '—'}&quot;
                                </p>
                              </div>
                              <div className="border border-[#deddd3] p-3 bg-[#fbf9f2]">
                                <span className="text-[10px] font-bold uppercase text-[#717975]">Fit Cut</span>
                                <p className="font-semibold text-[#073a2d] truncate">
                                  {customerDetail.preferredFit || 'Standard Fit'}
                                </p>
                              </div>
                            </div>
                            {customerDetail.measurements.tailoringNotes && (
                              <div className="bg-[#f5eedf]/50 border border-[#c79a45]/30 p-3 text-xs text-[#8c6722]">
                                <span className="font-bold uppercase tracking-wider text-[10px]">
                                  Master Tailor Notes:
                                </span>
                                <p className="mt-0.5">{customerDetail.measurements.tailoringNotes}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB 2: Customer Orders */}
                  {activeTab === 'orders' && (
                    <div className="space-y-4">
                      {!customerDetail.orders || customerDetail.orders.length === 0 ? (
                        <div className="bg-white border border-[#deddd3] p-12 text-center text-[#717975] shadow-2xs">
                          <Package className="w-10 h-10 mx-auto mb-2 opacity-40 text-[#717975]" />
                          <h4 className="font-serif text-base text-[#1b1c18] font-bold">No Consignments Placed</h4>
                          <p className="text-xs text-[#717975] mt-1">
                            This patron has not booked any purchase orders yet.
                          </p>
                        </div>
                      ) : (
                        customerDetail.orders.map((order: any) => (
                          <div
                            key={order.id}
                            className="bg-white border border-[#deddd3] shadow-2xs p-5 space-y-4 hover:border-[#073a2d] transition-colors"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#f0eee7] pb-3">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-bold text-sm text-[#073a2d]">
                                    {order.orderNumber || order.id}
                                  </span>
                                  <span
                                    className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                                      order.status === 'DELIVERED'
                                        ? 'bg-[#bcedda]/40 text-[#073a2d]'
                                        : order.status === 'SHIPPED'
                                        ? 'bg-[#e0e7ff] text-[#3730a3]'
                                        : order.status === 'CONFIRMED'
                                        ? 'bg-[#fef3c7] text-[#92400e]'
                                        : order.status === 'CANCELLED'
                                        ? 'bg-[#fee2e2] text-[#991b1b]'
                                        : 'bg-[#f0eee7] text-[#404945]'
                                    }`}
                                  >
                                    {order.status}
                                  </span>
                                  <span
                                    className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                                      order.paymentStatus === 'PAID'
                                        ? 'bg-[#bcedda]/40 text-[#073a2d]'
                                        : 'bg-[#fef3c7] text-[#92400e]'
                                    }`}
                                  >
                                    {order.paymentMethod} • {order.paymentStatus}
                                  </span>
                                </div>
                                <p className="text-[11px] text-[#717975] mt-1 flex items-center gap-1.5">
                                  <Calendar className="w-3 h-3" />
                                  Placed:{' '}
                                  {new Date(order.createdAt).toLocaleDateString('en-GB', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </p>
                              </div>

                              <div className="text-right flex items-center gap-3">
                                <div>
                                  <span className="text-[10px] uppercase text-[#717975] font-bold block">
                                    Total Amount
                                  </span>
                                  <span className="font-serif font-bold text-base text-[#073a2d]">
                                    ৳{Number(order.totalAmount).toLocaleString()}
                                  </span>
                                </div>
                                <Link
                                  href={`/orders?id=${order.id}`}
                                  className="px-2.5 py-1.5 border border-[#deddd3] hover:border-[#073a2d] text-[11px] font-semibold text-[#073a2d] hover:bg-[#073a2d] hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                                >
                                  <span>Open Order</span>
                                  <ExternalLink className="w-3 h-3" />
                                </Link>
                              </div>
                            </div>

                            {/* Consignment Items */}
                            {order.items && order.items.length > 0 && (
                              <div className="space-y-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#717975] block">
                                  Purchased Garments ({order.items.length} Items):
                                </span>
                                <div className="divide-y divide-[#f0eee7] border border-[#f0eee7]">
                                  {order.items.map((item: any) => {
                                    const imgUrl =
                                      item.productImage ||
                                      item.product?.images?.[0]?.url ||
                                      '/placeholder.png';
                                    return (
                                      <div
                                        key={item.id}
                                        className="p-2.5 flex items-center justify-between gap-3 text-xs bg-[#fbf9f2]/30"
                                      >
                                        <div className="flex items-center gap-3">
                                          {/* eslint-disable-next-line @next/next/no-img-element */}
                                          <img
                                            src={imgUrl}
                                            alt={item.productName}
                                            className="w-10 h-10 object-cover border border-[#deddd3] bg-white shrink-0"
                                            onError={(e) => {
                                              (e.target as HTMLElement).style.display = 'none';
                                            }}
                                          />
                                          <div>
                                            <p className="font-semibold text-[#1b1c18]">{item.productName}</p>
                                            <p className="text-[10px] text-[#717975] space-x-2">
                                              {item.size && <span>Size: {item.size}</span>}
                                              {item.color && <span>• Color: {item.color}</span>}
                                              {item.sku && <span>• SKU: {item.sku}</span>}
                                            </p>
                                          </div>
                                        </div>

                                        <div className="text-right shrink-0">
                                          <p className="font-mono text-[#1b1c18]">
                                            {item.quantity} × ৳{Number(item.unitPrice).toLocaleString()}
                                          </p>
                                          <p className="font-serif font-bold text-[#073a2d]">
                                            ৳{Number(item.subtotal).toLocaleString()}
                                          </p>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {order.shippingAddress && (
                              <div className="text-[11px] text-[#69726d] bg-[#fbf9f2] p-2.5 border border-[#deddd3]/60 flex items-center gap-2">
                                <Truck className="w-3.5 h-3.5 text-[#073a2d] shrink-0" />
                                <span>
                                  Delivering to:{' '}
                                  <strong className="text-[#1b1c18]">
                                    {order.shippingAddress.addressLine1 || order.shippingAddress.city}
                                  </strong>
                                  {order.shippingAddress.city ? `, ${order.shippingAddress.city}` : ''}
                                  {order.shippingAddress.division ? `, ${order.shippingAddress.division}` : ''}
                                </span>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* TAB 3: Product Reviews */}
                  {activeTab === 'reviews' && (
                    <div className="space-y-4">
                      {!customerDetail.reviews || customerDetail.reviews.length === 0 ? (
                        <div className="bg-white border border-[#deddd3] p-12 text-center text-[#717975] shadow-2xs">
                          <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-40 text-[#717975]" />
                          <h4 className="font-serif text-base text-[#1b1c18] font-bold">No Product Reviews Submitted</h4>
                          <p className="text-xs text-[#717975] mt-1">
                            This patron has not written any product testimonials or ratings yet.
                          </p>
                        </div>
                      ) : (
                        customerDetail.reviews.map((rev: any) => {
                          const prodImg = rev.product?.images?.[0]?.url;
                          return (
                            <div
                              key={rev.id}
                              className="bg-white border border-[#deddd3] shadow-2xs p-5 space-y-3 hover:border-[#073a2d] transition-colors"
                            >
                              <div className="flex items-center justify-between border-b border-[#f0eee7] pb-3">
                                <div className="flex items-center gap-3">
                                  {prodImg && (
                                    /* eslint-disable-next-line @next/next/no-img-element */
                                    <img
                                      src={prodImg}
                                      alt={rev.product?.name || 'Product'}
                                      className="w-12 h-12 object-cover border border-[#deddd3] bg-[#fbf9f2] shrink-0"
                                      onError={(e) => {
                                        (e.target as HTMLElement).style.display = 'none';
                                      }}
                                    />
                                  )}
                                  <div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#717975] block">
                                      Reviewed Luxury Piece:
                                    </span>
                                    <h4 className="font-serif font-bold text-sm text-[#1b1c18]">
                                      {rev.product?.name || 'Bespoke Atelier Garment'}
                                    </h4>
                                    {rev.product?.price && (
                                      <p className="text-[11px] font-serif text-[#073a2d] font-bold">
                                        ৳{Number(rev.product.price).toLocaleString()}
                                      </p>
                                    )}
                                  </div>
                                </div>

                                <div className="text-right">
                                  <span
                                    className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                                      rev.status === 'APPROVED'
                                        ? 'bg-[#bcedda]/40 text-[#073a2d]'
                                        : rev.status === 'PENDING'
                                        ? 'bg-[#fef3c7] text-[#92400e]'
                                        : 'bg-[#fee2e2] text-[#991b1b]'
                                    }`}
                                  >
                                    {rev.status}
                                  </span>
                                  <p className="text-[10px] text-[#717975] mt-1">
                                    {new Date(rev.createdAt).toLocaleDateString('en-GB', {
                                      day: '2-digit',
                                      month: 'short',
                                      year: 'numeric',
                                    })}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-0.5">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={`w-4 h-4 ${
                                        star <= (rev.rating || 5)
                                          ? 'fill-[#c79a45] text-[#c79a45]'
                                          : 'text-[#deddd3]'
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-xs font-bold text-[#1b1c18]">
                                  {rev.rating || 5} out of 5 stars
                                </span>
                              </div>

                              <div className="bg-[#fbf9f2] border-l-2 border-[#073a2d] p-3 text-xs italic text-[#1b1c18] font-serif leading-relaxed">
                                &ldquo;{rev.comment}&rdquo;
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-[#deddd3] bg-white flex items-center justify-between">
              <span className="text-[11px] text-[#717975]">
                {customerDetail ? `Viewing dossier for ${customerDetail.firstName || 'Patron'}` : ''}
              </span>
              <button
                type="button"
                onClick={handleCloseCustomer}
                className="px-4 py-2 border border-[#deddd3] hover:border-[#073a2d] text-xs font-semibold uppercase tracking-wider text-[#1b1c18] hover:bg-[#073a2d] hover:text-white transition-colors cursor-pointer"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PERMANENT ARCHIVE SNAPSHOT VIEWER DRAWER */}
      {selectedArchive && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-end bg-black/50 backdrop-blur-xs transition-opacity animate-fade-in"
          onClick={() => setSelectedArchive(null)}
        >
          <div
            className="bg-white w-full max-w-4xl h-full shadow-2xl flex flex-col border-l border-[#deddd3] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-[#deddd3] bg-[#fbf9f2] flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold tracking-widest uppercase text-[#ba1a1a] flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-[#ba1a1a]" />
                  PERMANENT ARCHIVE SNAPSHOT • DELETED CUSTOMER RECORD
                </span>
                <h2 className="text-2xl font-serif text-[#1b1c18] mt-1 font-bold">
                  {`${selectedArchive.firstName || ''} ${selectedArchive.lastName || ''}`.trim() || 'Patron'}
                </h2>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-[#717975]">
                  <span className="font-mono text-[11px]">Orig ID: {selectedArchive.originalId}</span>
                  <span>• Archive ID: {selectedArchive.id}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedArchive(null)}
                className="p-2 border border-[#deddd3] hover:border-[#1b1c18] text-[#717975] hover:text-[#1b1c18] bg-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Permanent deletion metadata banner */}
            <div className="bg-[#fff8f6] border-b border-[#fecdd3] p-4 text-xs space-y-1">
              <p className="font-bold text-[#ba1a1a] uppercase text-[11px]">
                Immutable Snapshot Record
              </p>
              <p className="text-[#1b1c18]">
                <strong>Deleted By:</strong> {selectedArchive.deletedBy || 'Shop Admin'} •{' '}
                <strong>Date:</strong> {new Date(selectedArchive.deletedAt).toLocaleString()}
              </p>
              <p className="text-[#1b1c18]">
                <strong>Deletion Reason:</strong> &ldquo;{selectedArchive.deleteReason || 'Permanent deletion'}&rdquo;
              </p>
            </div>

            {/* Snapshot Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#fbf9f2]/40">
              {/* Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white border border-[#deddd3] p-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#717975]">
                    Preserved Lifetime Purchases
                  </span>
                  <p className="font-serif text-2xl font-bold text-[#073a2d] mt-1">
                    ৳{Number(selectedArchive.totalSpent).toLocaleString()}
                  </p>
                </div>
                <div className="bg-white border border-[#deddd3] p-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#717975]">
                    Preserved Total Orders
                  </span>
                  <p className="font-serif text-2xl font-bold text-[#1b1c18] mt-1">
                    {selectedArchive.totalOrders} Orders Placed
                  </p>
                </div>
              </div>

              {/* Personal contact snapshot */}
              <div className="bg-white border border-[#deddd3] p-5 space-y-3">
                <h3 className="font-serif text-sm font-bold text-[#1b1c18]">Preserved Contact Info</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#717975]">Primary Phone</span>
                    <p className="font-mono mt-0.5">{selectedArchive.phone}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#717975]">Email Address</span>
                    <p className="font-mono mt-0.5">{selectedArchive.email || '—'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#717975]">Secondary Phone</span>
                    <p className="font-mono mt-0.5">{selectedArchive.secondaryPhone || '—'}</p>
                  </div>
                </div>
              </div>

              {/* Preserved Orders and Purchased Products */}
              <div className="bg-white border border-[#deddd3] p-5 space-y-4">
                <h3 className="font-serif text-base font-bold text-[#1b1c18] flex items-center gap-2">
                  <Package className="w-4 h-4 text-[#073a2d]" />
                  Preserved Purchase History &amp; Products Bought (
                  {Array.isArray(selectedArchive.ordersSnapshot) ? selectedArchive.ordersSnapshot.length : 0})
                </h3>

                {!Array.isArray(selectedArchive.ordersSnapshot) ||
                selectedArchive.ordersSnapshot.length === 0 ? (
                  <p className="text-xs text-[#717975] py-4 text-center">
                    No order consignments were recorded for this patron prior to deletion.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {selectedArchive.ordersSnapshot.map((order: any, idx: number) => (
                      <div
                        key={order.orderId || idx}
                        className="border border-[#deddd3] p-4 bg-[#fbf9f2]/30 space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#f0eee7] pb-2 text-xs">
                          <div>
                            <span className="font-mono font-bold text-[#073a2d]">
                              Order #{order.orderNumber}
                            </span>
                            <span className="ml-2 text-[#717975]">
                              {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : ''}
                            </span>
                            <span className="ml-2 px-1.5 py-0.5 text-[9px] font-bold uppercase bg-[#bcedda]/40 text-[#073a2d]">
                              {order.status}
                            </span>
                          </div>
                          <div className="font-serif font-bold text-[#073a2d] text-sm">
                            ৳{Number(order.totalAmount).toLocaleString()}
                          </div>
                        </div>

                        {/* Items in this order */}
                        <div className="space-y-2">
                          <span className="text-[10px] font-bold uppercase text-[#717975]">
                            Items Purchased:
                          </span>
                          <div className="divide-y divide-[#f0eee7] border border-[#f0eee7] bg-white">
                            {(order.items || []).map((item: any, itemIdx: number) => (
                              <div
                                key={item.id || itemIdx}
                                className="p-2.5 flex items-center justify-between gap-3 text-xs"
                              >
                                <div>
                                  <p className="font-semibold text-[#1b1c18]">{item.productName}</p>
                                  <p className="text-[10px] text-[#717975] space-x-2">
                                    {item.size && <span>Size: {item.size}</span>}
                                    {item.color && <span>• Color: {item.color}</span>}
                                    {item.sku && <span>• SKU: {item.sku}</span>}
                                  </p>
                                </div>
                                <div className="text-right shrink-0">
                                  <p className="font-mono text-[#1b1c18]">
                                    {item.quantity} × ৳{Number(item.unitPrice).toLocaleString()}
                                  </p>
                                  <p className="font-serif font-bold text-[#073a2d]">
                                    ৳{Number(item.subtotal).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {order.shippingAddress && (
                          <div className="text-[11px] text-[#717975] pt-1">
                            Delivered to: {order.shippingAddress.addressLine1 || order.shippingAddress.city},{' '}
                            {order.shippingAddress.city}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-[#deddd3] bg-white text-right">
              <button
                type="button"
                onClick={() => setSelectedArchive(null)}
                className="px-4 py-2 border border-[#deddd3] text-xs font-semibold uppercase tracking-wider text-[#1b1c18] hover:bg-[#1b1c18] hover:text-white transition-colors cursor-pointer"
              >
                Close Snapshot
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BAN CUSTOMER MODAL WITH MANDATORY REASON PROMPT */}
      {banModalPatron && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white border border-[#deddd3] shadow-2xl p-6 w-full max-w-lg space-y-4 animate-in fade-in-0 duration-150">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-full bg-[#ffdad6] flex items-center justify-center text-[#ba1a1a] shrink-0">
                <Ban className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-[#ba1a1a]">
                  Suspend Customer Account
                </h3>
                <p className="text-xs text-[#717975] font-mono mt-0.5">
                  {banModalPatron.name} ({banModalPatron.phone})
                </p>
              </div>
            </div>

            <div className="bg-[#fff8f6] border border-[#fecdd3] p-3 text-xs text-[#1b1c18] leading-relaxed space-y-2">
              <p>
                Suspending this customer will revoke active login sessions and prevent future orders.
              </p>
              <p className="text-[#ba1a1a] font-semibold flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-[#ba1a1a] shrink-0" />
                <span>
                  An official notice email containing your stated reason will be automatically dispatched to{' '}
                  <strong>{banModalPatron.email || 'customer email'}</strong>.
                </span>
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1b1c18]">
                Mandatory Reason for Suspension <span className="text-[#ba1a1a]">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="e.g. Repeated fraudulent COD rejections at delivery, abusive conduct towards concierge staff, policy violation..."
                className="w-full p-2.5 bg-[#fbf9f2] border border-[#deddd3] text-xs text-[#1b1c18] focus:border-[#ba1a1a] outline-hidden placeholder-[#717975]"
              />
              <span className="text-[10px] text-[#717975]">
                This explanation will appear verbatim in the email sent to the customer.
              </span>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={isSubmittingBan}
                onClick={() => setBanModalPatron(null)}
                className="px-4 py-2 border border-[#deddd3] text-xs font-medium text-[#717975] hover:bg-[#f0eee7] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmittingBan || !banReason.trim()}
                onClick={handleConfirmBan}
                className="px-4 py-2 bg-[#ba1a1a] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#93000a] transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                {isSubmittingBan ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Suspending...</span>
                  </>
                ) : (
                  <span>Confirm Ban &amp; Dispatch Email</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PERMANENT DELETE WARNING MODAL WITH MANDATORY CONFIRMATION MARK */}
      {permanentDeleteModalPatron && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white border border-[#deddd3] shadow-2xl p-6 w-full max-w-lg space-y-4 animate-in fade-in-0 duration-150">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-full bg-[#ffdad6] flex items-center justify-center text-[#ba1a1a] shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-[#ba1a1a]">
                  Irreversible Permanent Customer Deletion
                </h3>
                <p className="text-xs text-[#717975] font-mono mt-0.5">
                  {permanentDeleteModalPatron.name} ({permanentDeleteModalPatron.phone})
                </p>
              </div>
            </div>

            <div className="bg-[#fbf9f2] border border-[#deddd3] p-3 text-xs text-[#404945] leading-relaxed space-y-2">
              <p>
                This action will permanently delete this customer&apos;s account and login credentials.
              </p>
              <p className="text-[#073a2d] font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#073a2d] shrink-0" />
                <span>
                  A complete snapshot of all {permanentDeleteModalPatron.ordersCount} purchase orders (totaling ৳
                  {permanentDeleteModalPatron.totalSpent.toLocaleString()}), measurements, and addresses will be
                  preserved permanently in the Customer Archive Snapshot ledger.
                </span>
              </p>
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#717975]">
                Administrative Reason / Ticket Note (Optional)
              </label>
              <input
                type="text"
                value={permanentDeleteReason}
                onChange={(e) => setPermanentDeleteReason(e.target.value)}
                placeholder="e.g. Customer requested complete GDPR/privacy erasure, duplicate account..."
                className="w-full p-2 bg-[#fbf9f2] border border-[#deddd3] text-xs text-[#1b1c18] focus:border-[#ba1a1a] outline-hidden placeholder-[#717975]"
              />
            </div>

            {/* MANDATORY CONFIRMATION CHECKMARK */}
            <label className="flex items-start gap-3 p-3 border-2 border-[#ba1a1a]/60 bg-[#fff8f6] cursor-pointer rounded-xs select-none hover:bg-[#fff2ef] transition-colors">
              <input
                type="checkbox"
                checked={confirmPermanentMark}
                onChange={(e) => setConfirmPermanentMark(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-[#ba1a1a] text-[#ba1a1a] focus:ring-[#ba1a1a] cursor-pointer"
              />
              <span className="text-xs font-bold text-[#ba1a1a] leading-tight">
                I understand that this deletion is IRREVERSIBLE. I confirm that I want to permanently delete this customer account.
              </span>
            </label>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={isDeletingPermanently}
                onClick={() => setPermanentDeleteModalPatron(null)}
                className="px-4 py-2 border border-[#deddd3] text-xs font-medium text-[#717975] hover:bg-[#f0eee7] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingPermanently || !confirmPermanentMark}
                onClick={handleConfirmPermanentDelete}
                className="px-4 py-2 bg-[#ba1a1a] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#93000a] transition-colors cursor-pointer disabled:opacity-40 flex items-center gap-1.5 shadow-xs"
              >
                {isDeletingPermanently ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting &amp; Archiving Snapshot...</span>
                  </>
                ) : (
                  <span>Delete Permanently &amp; Preserve Snapshot</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CustomersPage() {
  return (
    <PermissionGuard permission="customers" moduleName="Clientele">
      <CustomersContent />
    </PermissionGuard>
  );
}
