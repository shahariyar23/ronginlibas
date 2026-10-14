'use client';

import React, { Suspense, useState } from 'react';
import {
  Search,
  Printer,
  Download,
  Calendar,
  CreditCard,
  FileText,
  HelpCircle,
  Banknote,
  Clock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  X,
  ShoppingBag,
  Phone,
  Mail,
  MapPin,
  User,
  Package,
  Scissors,
  Truck,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Plus,
  ExternalLink,
  RefreshCw,
  Copy,
  Check,
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAdmin } from '@/context/AdminContext';
import { adminApi } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { AdminOrder } from '@/data/adminData';
import { TablePageSkeleton } from '@/components/common/Skeleton';
import { printParcelSlip } from '@/utils/printParcelSlip';
import { PermissionGuard } from '@/components/auth/PermissionGuard';


// Deterministic SVG Barcode graphic for courier shipping labels
function BarcodeGraphic({ value }: { value: string }) {
  const cleanVal = (value || 'RL-PARCEL-001').toUpperCase().replace(/[^A-Z0-9]/g, '');
  const pattern: number[] = [2, 1, 3, 1, 1, 2, 3, 2];
  for (let i = 0; i < cleanVal.length; i++) {
    const code = cleanVal.charCodeAt(i);
    pattern.push((code % 3) + 1.2);
    pattern.push(((code * 3) % 2) + 1);
    pattern.push(((code * 7) % 3) + 1.2);
    pattern.push(1);
  }
  pattern.push(3, 1, 2, 1, 3);

  let currentX = 0;
  const bars: { x: number; width: number }[] = [];
  pattern.forEach((width, index) => {
    if (index % 2 === 0) {
      bars.push({ x: currentX, width });
    }
    currentX += width;
  });

  return (
    <div className="flex flex-col items-center">
      <svg
        viewBox={`0 0 ${currentX} 36`}
        className="h-9 w-full max-w-[220px]"
        preserveAspectRatio="none"
      >
        {bars.map((bar, i) => (
          <rect key={i} x={bar.x} y={0} width={bar.width} height={36} fill="#000000" />
        ))}
      </svg>
      <span className="font-mono text-[10px] font-bold tracking-widest text-black mt-0.5">
        *{value}*
      </span>
    </div>
  );
}


function OrdersPageContent() {
  const { orders, updateOrderStatus, isLoading, refreshData } = useAdmin();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const focusedOrderId = searchParams.get('orderId')?.trim() || '';
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('ALL');
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<AdminOrder | null>(null);
  const [receiptMode, setReceiptMode] = useState<'PARCEL_SLIP' | 'DOSSIER'>('PARCEL_SLIP');
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [targetStatus, setTargetStatus] = useState<string | null>(null);
  const [showFlowGuide, setShowFlowGuide] = useState(false);
  const [isSyncingPayment, setIsSyncingPayment] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSyncPayment = async (orderId: string) => {
    setIsSyncingPayment(true);
    try {
      const res = await adminApi.orders.getPaymentStatus(orderId);
      if (res && res.data) {
        toast.success(`Gateway Status: ${res.data.paymentStatus || 'CHECKED'}`);
        await refreshData();
        const updated = await adminApi.orders.getById(orderId);
        if (updated && updated.data) {
          setSelectedOrderForInvoice((prev) =>
            prev
              ? {
                  ...prev,
                  paymentStatus: updated.data.paymentStatus,
                  paidAmount:
                    updated.data.paidAmount !== null && updated.data.paidAmount !== undefined
                      ? Number(updated.data.paidAmount)
                      : prev.paidAmount,
                  paymentReference: updated.data.paymentReference || prev.paymentReference,
                  payments: Array.isArray(updated.data.payments)
                    ? updated.data.payments.map((p: any) => ({
                        id: p.id,
                        provider: p.provider,
                        providerOrderId: p.providerOrderId,
                        providerTransactionId: p.providerTransactionId,
                        amount: Number(p.amount) || 0,
                        currency: p.currency || 'BDT',
                        status: p.status,
                        failureReason: p.failureReason,
                        paidAt: p.paidAt,
                        createdAt: p.createdAt,
                      }))
                    : prev.payments,
                }
              : null,
          );
        }
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to check payment status with gateway');
    } finally {
      setIsSyncingPayment(false);
    }
  };

  // Pathao Courier Sandbox States
  const [isBookingPathao, setIsBookingPathao] = useState(false);
  const [isRefreshingPathao, setIsRefreshingPathao] = useState(false);

  const handleBookPathaoParcel = async (orderId: string) => {
    setIsBookingPathao(true);
    try {
      const res = await adminApi.pathao.createParcelFromOrder(orderId);
      if (res.success && res.data) {
        const payload = res.data;
        toast.success(`Pathao Sandbox parcel created! Consignment #${payload.parcel.consignment_id}`);
        const consignmentId = payload.parcel.consignment_id;
        const trackingUrl = `https://pathao.com/courier/track?consignment_id=${consignmentId}`;

        setSelectedOrderForInvoice((prev: any) =>
          prev
            ? {
                ...prev,
                courierName: 'Pathao',
                courierProvider: 'Pathao',
                courierConsignmentId: consignmentId,
                trackingNumber: consignmentId,
                courierStatus: payload.order?.courierStatus || payload.parcel.order_status,
                courierStatusRaw: payload.order?.courierStatusRaw || payload.parcel.order_status,
                courierLastSyncedAt: new Date().toISOString(),
                trackingUrl,
              }
            : null,
        );
        await refreshData();
      } else {
        toast.error(res.error || 'Failed to create Pathao sandbox parcel');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Error creating Pathao sandbox parcel');
    } finally {
      setIsBookingPathao(false);
    }
  };

  const handleRefreshPathaoStatus = async (orderId: string) => {
    setIsRefreshingPathao(true);
    try {
      const res = await adminApi.pathao.refreshStatus(orderId);
      if (res.success && res.data) {
        const payload = res.data;
        toast.success(`Pathao status updated: ${payload.courierStatus}`);
        setSelectedOrderForInvoice((prev: any) =>
          prev
            ? {
                ...prev,
                courierStatus: payload.courierStatus,
                courierStatusRaw: payload.courierStatusRaw,
                courierLastSyncedAt: payload.lastSyncedAt,
              }
            : null,
        );
        await refreshData();
      } else {
        toast.error(res.error || 'Failed to refresh Pathao status');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Error refreshing Pathao status');
    } finally {
      setIsRefreshingPathao(false);
    }
  };

  // Tab counts
  const pendingCount = orders.filter((o) => o.status === 'PENDING').length;
  const confirmedCount = orders.filter((o) => o.status === 'CONFIRMED').length;
  const processingCount = orders.filter((o) => o.status === 'PROCESSING').length;
  const shippedCount = orders.filter((o) => o.status === 'SHIPPED').length;
  const deliveredCount = orders.filter((o) => o.status === 'DELIVERED').length;
  const cancelledCount = orders.filter((o) => o.status === 'CANCELLED').length;

  const filteredOrders = orders.filter((order) => {
    const matchesFocusedOrder =
      !focusedOrderId ||
      order.id === focusedOrderId ||
      order.orderNumber === focusedOrderId;
    const matchesTab = activeTab === 'ALL' || order.status === activeTab;
    const matchesSearch =
      order.id.toLowerCase().includes(search.toLowerCase()) ||
      order.customerName.toLowerCase().includes(search.toLowerCase()) ||
      order.phone.includes(search) ||
      Boolean(order.paymentReference && order.paymentReference.toLowerCase().includes(search.toLowerCase()));
    const matchesPayment = paymentFilter === 'ALL' || order.paymentMethod === paymentFilter;
    const matchesPaymentStatus =
      paymentStatusFilter === 'ALL' ||
      (order.paymentStatus || 'PENDING') === paymentStatusFilter;
    return matchesFocusedOrder && matchesTab && matchesSearch && matchesPayment && matchesPaymentStatus;
  });

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  React.useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, search, paymentFilter, paymentStatusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const paginatedOrders = filteredOrders.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize
  );
  const startEntry = filteredOrders.length === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1;
  const endEntry = Math.min(safeCurrentPage * pageSize, filteredOrders.length);

  const handlePrintInvoice = (order: AdminOrder) => {
    printParcelSlip(order);
  };

  const handleViewOrderDetails = (order: AdminOrder) => {
    setSelectedOrderForInvoice(order);
    setReceiptMode('DOSSIER');
  };


  if (isLoading) {
    return (
      <TablePageSkeleton
        title="Atelier Orders & Fulfillment"
        showAddButton={false}
        rowCount={8}
      />
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#deddd3] pb-6">
        <div>
          <span className="text-[11px] font-bold tracking-widest uppercase text-[#717975]">
            ATELIER COMMERCE • LIVE DISPATCH STREAM
          </span>
          <div className="flex items-center gap-3 mt-1">
            <h1 className="text-3xl font-serif text-[#1b1c18] tracking-tight">Orders</h1>
            <span className="text-xs bg-[#bcedda]/40 text-[#073a2d] border border-[#a1d1be] px-2.5 py-0.5 font-semibold">
              {orders.length} Total Orders
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-[#deddd3] px-3.5 py-2 text-xs">
            <div className="w-6 h-6 bg-[#b0ecd3]/40 flex items-center justify-center text-[#0d4d3b]">
              <Banknote className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-[9px] uppercase font-bold text-[#717975]">GROSS SALES</p>
              <p className="font-serif font-bold text-[#073a2d]">
                ৳ {orders.reduce((sum, o) => sum + (o.amount || 0), 0).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white border border-[#deddd3] px-3.5 py-2 text-xs">
            <div className="w-6 h-6 bg-[#f5eedf] flex items-center justify-center text-[#8c6722]">
              <Clock className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-[9px] uppercase font-bold text-[#717975]">AWAITING CONFIRM</p>
              <p className="font-serif font-bold text-[#8c6722]">{pendingCount} Queued</p>
            </div>
          </div>

          <Link
            href="/orders/create"
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-[#073a2d] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#00231a] transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 text-[#c79a45]" />
            <span>CREATE ORDER</span>
          </Link>

          <button
            onClick={() => setShowFlowGuide(!showFlowGuide)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-[#00231a] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#073a2d] transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#c79a45]" />
            <span>FLOW GUIDE</span>
          </button>
        </div>
      </div>

      {focusedOrderId && (
        <div className="flex flex-col gap-2 border border-[#a1d1be] bg-[#bcedda]/20 px-4 py-3 text-xs sm:flex-row sm:items-center sm:justify-between">
          <span>
            Showing order <strong className="font-mono">{focusedOrderId}</strong>
          </span>
          <Link href="/orders" className="font-bold text-[#073a2d] underline">
            View all orders
          </Link>
        </div>
      )}

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#deddd3] pb-2 text-xs">
        <button
          onClick={() => setActiveTab('ALL')}
          className={`px-3 py-1.5 font-bold uppercase tracking-wider transition-colors ${
            activeTab === 'ALL'
              ? 'bg-[#00231a] text-white'
              : 'text-[#404945] hover:text-[#1b1c18] bg-white border border-[#deddd3]'
          }`}
        >
          ALL <span className="ml-1 opacity-80">{orders.length}</span>
        </button>

        <button
          onClick={() => setActiveTab('PENDING')}
          className={`px-3 py-1.5 font-semibold uppercase tracking-wider transition-colors ${
            activeTab === 'PENDING'
              ? 'bg-[#00231a] text-white'
              : 'text-[#8c6722] hover:text-[#1b1c18] bg-white border border-[#deddd3]'
          }`}
        >
          PENDING <span className="ml-1 font-bold">{pendingCount}</span>
        </button>

        <button
          onClick={() => setActiveTab('CONFIRMED')}
          className={`px-3 py-1.5 font-semibold uppercase tracking-wider transition-colors ${
            activeTab === 'CONFIRMED'
              ? 'bg-[#00231a] text-white'
              : 'text-[#073a2d] hover:text-[#1b1c18] bg-white border border-[#deddd3]'
          }`}
        >
          CONFIRMED <span className="ml-1 font-bold">{confirmedCount}</span>
        </button>

        <button
          onClick={() => setActiveTab('PROCESSING')}
          className={`px-3 py-1.5 font-semibold uppercase tracking-wider transition-colors ${
            activeTab === 'PROCESSING'
              ? 'bg-[#00231a] text-white'
              : 'text-[#404945] hover:text-[#1b1c18] bg-white border border-[#deddd3]'
          }`}
        >
          PROCESSING <span className="ml-1 font-bold">{processingCount}</span>
        </button>

        <button
          onClick={() => setActiveTab('SHIPPED')}
          className={`px-3 py-1.5 font-semibold uppercase tracking-wider transition-colors ${
            activeTab === 'SHIPPED'
              ? 'bg-[#00231a] text-white'
              : 'text-[#0d4d3b] hover:text-[#1b1c18] bg-white border border-[#deddd3]'
          }`}
        >
          SHIPPED <span className="ml-1 font-bold">{shippedCount}</span>
        </button>

        <button
          onClick={() => setActiveTab('DELIVERED')}
          className={`px-3 py-1.5 font-semibold uppercase tracking-wider transition-colors ${
            activeTab === 'DELIVERED'
              ? 'bg-[#00231a] text-white'
              : 'text-[#073a2d] hover:text-[#1b1c18] bg-white border border-[#deddd3]'
          }`}
        >
          DELIVERED <span className="ml-1 font-bold">{deliveredCount}</span>
        </button>

        <button
          onClick={() => setActiveTab('CANCELLED')}
          className={`px-3 py-1.5 font-semibold uppercase tracking-wider transition-colors ${
            activeTab === 'CANCELLED'
              ? 'bg-[#00231a] text-white'
              : 'text-[#ba1a1a] hover:text-[#1b1c18] bg-white border border-[#deddd3]'
          }`}
        >
          CANCELLED <span className="ml-1 font-bold">{cancelledCount}</span>
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white border border-[#deddd3] p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-[#717975] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Order ID, customer phone, name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#fbf9f2] border border-[#deddd3] text-xs text-[#1b1c18] focus:border-[#073a2d] outline-hidden placeholder-[#717975]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Date Range */}
          <div className="flex items-center gap-1.5 px-3 py-2 bg-[#fbf9f2] border border-[#deddd3] text-xs text-[#404945]">
            <Calendar className="w-3.5 h-3.5 text-[#073a2d]" />
            <span className="font-medium">Today: Oct 24</span>
          </div>

          {/* Payment Method filter */}
          <div className="flex items-center gap-1.5 bg-[#fbf9f2] border border-[#deddd3] px-2.5 py-1 text-xs">
            <CreditCard className="w-3.5 h-3.5 text-[#073a2d]" />
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="bg-transparent text-xs py-1 text-[#404945] focus:outline-hidden cursor-pointer"
            >
              <option value="ALL">All Payment Methods</option>
              <option value="COD">COD</option>
              <option value="WAITMARK_PAY">Waitmark Pay</option>
              <option value="BKASH">bKash</option>
              <option value="NAGAD">Nagad</option>
            </select>
          </div>

          {/* Payment Status filter */}
          <div className="flex items-center gap-1.5 bg-[#fbf9f2] border border-[#deddd3] px-2.5 py-1 text-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-[#073a2d]" />
            <select
              value={paymentStatusFilter}
              onChange={(e) => setPaymentStatusFilter(e.target.value)}
              className="bg-transparent text-xs py-1 text-[#404945] focus:outline-hidden cursor-pointer"
            >
              <option value="ALL">All Payment Statuses</option>
              <option value="PAID">PAID (Settled)</option>
              <option value="PENDING">UNPAID (Pending)</option>
              <option value="FAILED">FAILED</option>
            </select>
          </div>

          <button
            onClick={() => window.print()}
            className="p-2 border border-[#deddd3] bg-[#fbf9f2] hover:bg-[#e4e2dc] text-[#404945]"
            title="Print Manifest"
          >
            <Printer className="w-4 h-4" />
          </button>

          <button
            onClick={() => alert('Exporting live dispatch ledger (.XLSX)...')}
            className="p-2 border border-[#deddd3] bg-[#fbf9f2] hover:bg-[#e4e2dc] text-[#404945]"
            title="Download CSV"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-[#deddd3] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[#deddd3] bg-[#fbf9f2] text-[#717975] uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4 font-semibold">ORDER ID</th>
                <th className="py-3 px-4 font-semibold">DATE & TIME</th>
                <th className="py-3 px-4 font-semibold">CUSTOMER</th>
                <th className="py-3 px-4 font-semibold">PHONE</th>
                <th className="py-3 px-4 font-semibold">AMOUNT</th>
                <th className="py-3 px-4 font-semibold">PAYMENT</th>
                <th className="py-3 px-4 font-semibold">STATUS</th>
                <th className="py-3 px-4 text-right font-semibold">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0eee7]">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#717975]">
                    <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-40 text-[#717975]" />
                    <p className="font-serif text-sm text-[#1b1c18]">No orders found</p>
                    <p className="text-[11px] text-[#717975]">
                      Patron orders will stream here live as checkout transactions complete.
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order) => {
                const statusColor =
                  order.status === 'PENDING'
                    ? 'bg-[#f5eedf] text-[#8c6722]'
                    : order.status === 'SHIPPED'
                    ? 'bg-[#bcedda]/50 text-[#0d4d3b]'
                    : order.status === 'DELIVERED'
                    ? 'bg-[#b0ecd3]/50 text-[#073a2d]'
                    : order.status === 'CONFIRMED'
                    ? 'bg-[#bcedda]/40 text-[#073a2d]'
                    : order.status === 'PROCESSING'
                    ? 'bg-[#e4e2dc] text-[#404945]'
                    : 'bg-[#ffdad6] text-[#ba1a1a]';

                return (
                  <tr
                    key={order.id}
                    onClick={() => handleViewOrderDetails(order)}
                    className="hover:bg-[#fbf9f2] transition-colors group cursor-pointer"
                  >

                    <td className="py-3.5 px-4 font-semibold text-[#073a2d] whitespace-nowrap">
                      <span className="flex items-center gap-1.5 group-hover:underline">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#c79a45]" />
                        {order.orderNumber || order.id}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-[#1b1c18]">{order.dateStr}</p>
                      <p className="text-[11px] text-[#717975]">{order.timeDetail}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#f0eee7] border border-[#deddd3] flex items-center justify-center font-bold text-[10px] text-[#073a2d]">
                          {order.customerName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-[#1b1c18]">{order.customerName}</p>
                          <p className="text-[11px] text-[#717975]">{order.customerLocation}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[#404945]">{order.phone}</td>
                    <td className="py-3.5 px-4 font-serif font-bold text-sm text-[#1b1c18]">
                      ৳{order.amount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-1 items-start">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-mono font-bold border ${
                            order.paymentMethod === 'WAITMARK_PAY'
                              ? 'bg-purple-50 text-purple-800 border-purple-200'
                              : 'bg-[#f0eee7] text-[#404945] border-[#deddd3]'
                          }`}
                        >
                          {order.paymentMethod === 'WAITMARK_PAY' ? 'WAITMARK PAY' : order.paymentMethod}
                        </span>
                        <div>
                          {order.paymentStatus === 'PAID' ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                              PAID
                            </span>
                          ) : order.paymentStatus === 'FAILED' ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
                              <AlertCircle className="w-2.5 h-2.5 text-rose-600" />
                              FAILED
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
                              <Clock className="w-2.5 h-2.5 text-amber-600" />
                              UNPAID
                            </span>
                          )}
                        </div>
                        {order.paymentReference && (
                          <span
                            className="font-mono text-[9px] text-[#555e5a] truncate max-w-[130px] bg-[#f0eee7] px-1 py-0.2"
                            title={`Transaction: ${order.paymentReference}`}
                          >
                            Trx: {order.paymentReference}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase ${statusColor}`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2 text-xs">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setUpdatingOrderId(order.id);
                          }}
                          className="px-2.5 py-1 border border-[#deddd3] bg-white hover:bg-[#073a2d] hover:text-white text-[10px] font-bold uppercase tracking-wider transition-colors"
                        >
                          STAGE
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePrintInvoice(order);
                          }}
                          className="p-1.5 text-[#717975] hover:text-[#073a2d] hover:bg-[#f0eee7]"
                          title="Print Parcel Shipping Slip"
                        >
                          <Printer className="w-4 h-4 text-[#073a2d]" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewOrderDetails(order);
                          }}
                          className="p-1.5 text-[#717975] hover:text-[#073a2d] hover:bg-[#f0eee7]"
                          title="View Full Order Dossier & Items"
                        >
                          <FileText className="w-4 h-4" />
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

        {/* Pagination footer */}
        <div className="p-4 bg-[#fbf9f2] border-t border-[#deddd3] flex flex-col sm:flex-row items-center justify-between text-xs text-[#717975] gap-3">
          <span>
            {filteredOrders.length === 0
              ? 'Showing 0 atelier entries'
              : `Showing ${startEntry} to ${endEntry} of ${filteredOrders.length} atelier entries`}
          </span>

          <div className="flex items-center gap-1 font-mono text-xs">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safeCurrentPage <= 1}
              className={`px-2 py-1 border border-[#deddd3] bg-white transition-colors ${
                safeCurrentPage <= 1
                  ? 'opacity-40 cursor-not-allowed text-[#717975]'
                  : 'hover:bg-[#f0eee7] text-[#1b1c18] cursor-pointer'
              }`}
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => setCurrentPage(page)}
                className={`w-6 h-6 flex items-center justify-center font-bold text-xs transition-colors cursor-pointer ${
                  page === safeCurrentPage
                    ? 'bg-[#073a2d] text-white'
                    : 'border border-[#deddd3] bg-white hover:bg-[#f0eee7] text-[#1b1c18]'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safeCurrentPage >= totalPages}
              className={`px-2 py-1 border border-[#deddd3] bg-white transition-colors ${
                safeCurrentPage >= totalPages
                  ? 'opacity-40 cursor-not-allowed text-[#717975]'
                  : 'hover:bg-[#f0eee7] text-[#1b1c18] cursor-pointer'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Sartorial Order Lifecycle Flow Section */}
      <div className="bg-white border border-[#deddd3] p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#f0eee7] pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#073a2d]" />
            <h3 className="font-serif text-lg font-medium text-[#1b1c18]">
              Sartorial Order Lifecycle Flow
            </h3>
          </div>
          <span className="text-xs text-[#717975]">
            STANDARD TAT: <strong>24 – 48 Hours Across Bangladesh</strong>
          </span>
        </div>
        <p className="text-xs text-[#69726d]">
          Standardized stage-gate workflow from Panjabi cut verification to final doorstep delivery.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 pt-2">
          {/* Stage 01 */}
          <div className="border border-[#deddd3] bg-[#fbf9f2] p-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[9px] uppercase font-bold text-[#717975]">STAGE 01</span>
              <span className="w-2 h-2 rounded-full bg-[#c79a45]" />
            </div>
            <h4 className="text-xs font-bold text-[#8c6722]">Pending</h4>
            <p className="text-[11px] text-[#69726d] leading-normal">
              Client checkout submitted; awaiting phone call or SMS OTP confirmation.
            </p>
          </div>

          {/* Stage 02 */}
          <div className="border border-[#deddd3] bg-[#fbf9f2] p-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[9px] uppercase font-bold text-[#717975]">STAGE 02</span>
              <span className="w-2 h-2 rounded-full bg-[#0d4d3b]" />
            </div>
            <h4 className="text-xs font-bold text-[#073a2d]">Confirmed</h4>
            <p className="text-[11px] text-[#69726d] leading-normal">
              Address verified & payment authorized. Slip printed for atelier floor.
            </p>
          </div>

          {/* Stage 03 */}
          <div className="border border-[#deddd3] bg-[#fbf9f2] p-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[9px] uppercase font-bold text-[#717975]">STAGE 03</span>
              <span className="w-2 h-2 rounded-full bg-[#76a493]" />
            </div>
            <h4 className="text-xs font-bold text-[#404945]">Processing</h4>
            <p className="text-[11px] text-[#69726d] leading-normal">
              Garment tailoring, fabric steam-pressing, and luxury gift-box packaging.
            </p>
          </div>

          {/* Stage 04 */}
          <div className="border border-[#deddd3] bg-[#fbf9f2] p-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[9px] uppercase font-bold text-[#717975]">STAGE 04</span>
              <span className="w-2 h-2 rounded-full bg-[#0d4d3b]" />
            </div>
            <h4 className="text-xs font-bold text-[#0d4d3b]">Shipped</h4>
            <p className="text-[11px] text-[#69726d] leading-normal">
              Handed to courier (Steadfast/Pathao); consignment tracking dispatched.
            </p>
          </div>

          {/* Stage 05 */}
          <div className="border border-[#deddd3] bg-[#fbf9f2] p-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[9px] uppercase font-bold text-[#717975]">STAGE 05</span>
              <span className="w-2 h-2 rounded-full bg-[#073a2d]" />
            </div>
            <h4 className="text-xs font-bold text-[#073a2d]">Delivered</h4>
            <p className="text-[11px] text-[#69726d] leading-normal">
              Successfully received by customer; cash collected or reconciled.
            </p>
          </div>

          {/* Exception */}
          <div className="border border-[#deddd3] bg-[#fbf9f2] p-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[9px] uppercase font-bold text-[#ba1a1a]">EXCEPTION</span>
              <span className="w-2 h-2 rounded-full bg-[#717975]" />
            </div>
            <h4 className="text-xs font-bold text-[#717975]">Cancelled</h4>
            <p className="text-[11px] text-[#69726d] leading-normal">
              Unresponsive customer or stock shortage. Inventory instantly restored.
            </p>
          </div>
        </div>
      </div>

      {/* Update Status Modal */}
      {updatingOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white border border-[#deddd3] shadow-2xl p-6 w-full max-w-sm">
            <h3 className="font-serif text-lg font-bold text-[#073a2d]">
              Update Order Status:{' '}
              {orders.find((o) => o.id === updatingOrderId)?.orderNumber || updatingOrderId}
            </h3>
            <p className="text-xs text-[#717975] mt-1">
              Select the next lifecycle stage for this customer consignment:
            </p>
            <div className="mt-4 space-y-2">
              {(
                ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const
              ).map((st) => {
                const isSelectedLoading = isUpdatingStatus && targetStatus === st;
                return (
                  <button
                    key={st}
                    type="button"
                    disabled={isUpdatingStatus}
                    aria-busy={isSelectedLoading}
                    onClick={async () => {
                      if (isUpdatingStatus || !updatingOrderId) return;
                      setIsUpdatingStatus(true);
                      setTargetStatus(st);
                      try {
                        const success = await updateOrderStatus(updatingOrderId, st);
                        if (success) {
                          setUpdatingOrderId(null);
                        }
                      } finally {
                        setIsUpdatingStatus(false);
                        setTargetStatus(null);
                      }
                    }}
                    className="w-full text-left px-3 py-2 border border-[#deddd3] hover:border-[#073a2d] hover:bg-[#fbf9f2] text-xs font-semibold text-[#1b1c18] transition-colors flex items-center justify-between cursor-pointer disabled:opacity-50"
                  >
                    <span>{isSelectedLoading ? `Transitioning to ${st}...` : st}</span>
                    {isSelectedLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#073a2d]" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#073a2d]" />
                    )}
                  </button>
                );
              })}
            </div>
            <div className="mt-4 text-right">
              <button
                type="button"
                disabled={isUpdatingStatus}
                onClick={() => !isUpdatingStatus && setUpdatingOrderId(null)}
                className="px-4 py-2 border border-[#deddd3] text-xs text-[#717975] hover:bg-[#f0eee7] transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comprehensive Order Consignment Dossier & Parcel Shipping Label Modal */}
      {selectedOrderForInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white border border-[#deddd3] shadow-2xl p-5 sm:p-8 w-full max-w-3xl my-auto relative animate-in fade-in-0 rounded-none">
            {/* Modal Screen-Only Controls Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-5 border-b border-[#deddd3]">
              {/* Tab Selector */}
              <div className="flex items-center gap-1.5 bg-[#f0eee7] p-1 border border-[#deddd3]">
                <button
                  type="button"
                  onClick={() => setReceiptMode('DOSSIER')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                    receiptMode === 'DOSSIER'
                      ? 'bg-[#073a2d] text-white shadow-xs'
                      : 'text-[#404945] hover:text-[#1b1c18]'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-[#c79a45]" />
                  <span>Order Details & Consignment</span>
                </button>
                <button
                  type="button"
                  onClick={() => setReceiptMode('PARCEL_SLIP')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                    receiptMode === 'PARCEL_SLIP'
                      ? 'bg-[#073a2d] text-white shadow-xs'
                      : 'text-[#404945] hover:text-[#1b1c18]'
                  }`}
                >
                  <Package className="w-3.5 h-3.5 text-[#c79a45]" />
                  <span>Courier Parcel Slip Preview</span>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => printParcelSlip(selectedOrderForInvoice)}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-[#073a2d] hover:bg-[#0d4d3b] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-xs cursor-pointer"
                  title="Print Slip for Courier (Steadfast/Pathao/RedX)"
                >
                  <Printer className="w-3.5 h-3.5 text-[#c79a45]" />
                  <span>Print Slip</span>
                </button>
                <button
                  onClick={() => setSelectedOrderForInvoice(null)}
                  className="p-1.5 text-[#717975] hover:text-[#1b1c18] hover:bg-[#f0eee7] transition-colors"
                  title="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* TAB 1: FULL ORGANIZED ORDER DETAILS & CONSIGNMENT (DEFAULT) */}
            {receiptMode === 'DOSSIER' && (
              <div className="space-y-6">
                {/* Brand & Order Meta Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-[#deddd3] pb-4">
                  <div>
                    <h2 className="font-serif text-2xl font-bold tracking-tight text-[#073a2d]">
                      RONGIN LIBAS
                    </h2>
                    <p className="text-[10px] tracking-widest uppercase font-bold text-[#c79a45] mt-0.5">
                      Haute Couture & Bespoke Menswear • Dispatch Dossier
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <div className="flex items-center sm:justify-end gap-2">
                      <span className="font-mono text-sm font-bold text-[#073a2d]">
                        {selectedOrderForInvoice.orderNumber || selectedOrderForInvoice.id}
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          selectedOrderForInvoice.status === 'PENDING'
                            ? 'bg-[#f5eedf] text-[#8c6722]'
                            : selectedOrderForInvoice.status === 'DELIVERED'
                            ? 'bg-[#b0ecd3]/60 text-[#073a2d]'
                            : selectedOrderForInvoice.status === 'SHIPPED'
                            ? 'bg-[#bcedda]/50 text-[#0d4d3b]'
                            : selectedOrderForInvoice.status === 'CONFIRMED'
                            ? 'bg-[#bcedda]/40 text-[#073a2d]'
                            : selectedOrderForInvoice.status === 'CANCELLED'
                            ? 'bg-[#ffdad6] text-[#ba1a1a]'
                            : 'bg-[#e4e2dc] text-[#404945]'
                        }`}
                      >
                        {selectedOrderForInvoice.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#717975] mt-1">
                      Ordered: {selectedOrderForInvoice.dateStr} at {selectedOrderForInvoice.timeDetail}
                    </p>
                    {selectedOrderForInvoice.source && (
                      <p className="text-[10px] font-bold text-[#073a2d] mt-0.5">
                        Channel: {selectedOrderForInvoice.source}
                        {selectedOrderForInvoice.createdByName && ` • Created by ${selectedOrderForInvoice.createdByName}`}
                      </p>
                    )}
                  </div>
                </div>

                {/* Customer & Delivery Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Client Profile */}
                  <div className="bg-[#fbf9f2] border border-[#deddd3] p-4 space-y-2">
                    <div className="flex items-center justify-between border-b border-[#deddd3]/60 pb-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#717975] flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-[#073a2d]" />
                        Client Profile
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 bg-white border border-[#deddd3] font-bold text-[#073a2d]">
                        {selectedOrderForInvoice.paymentMethod} • {selectedOrderForInvoice.paymentStatus || 'PENDING'}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-serif text-sm font-bold text-[#1b1c18]">
                        {selectedOrderForInvoice.customerName}
                      </h4>
                      <div className="mt-1 space-y-1 text-xs text-[#404945]">
                        {selectedOrderForInvoice.phone && (
                          <p className="flex items-center gap-2 font-mono">
                            <Phone className="w-3.5 h-3.5 text-[#717975] flex-shrink-0" />
                            <a
                              href={`tel:${selectedOrderForInvoice.phone}`}
                              className="hover:text-[#073a2d] hover:underline"
                            >
                              {selectedOrderForInvoice.phone}
                            </a>
                          </p>
                        )}
                        {selectedOrderForInvoice.customerEmail && (
                          <p className="flex items-center gap-2">
                            <Mail className="w-3.5 h-3.5 text-[#717975] flex-shrink-0" />
                            <a
                              href={`mailto:${selectedOrderForInvoice.customerEmail}`}
                              className="hover:text-[#073a2d] hover:underline"
                            >
                              {selectedOrderForInvoice.customerEmail}
                            </a>
                          </p>
                        )}
                        {selectedOrderForInvoice.paymentReference && (
                          <p className="text-[11px] font-mono text-[#073a2d] font-semibold pt-1 border-t border-[#deddd3]/60">
                            Txn / Ref: {selectedOrderForInvoice.paymentReference}
                            {selectedOrderForInvoice.paidAmount !== undefined && ` • Paid: ৳${selectedOrderForInvoice.paidAmount.toLocaleString()}`}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Delivery Destination */}
                  <div className="bg-[#fbf9f2] border border-[#deddd3] p-4 space-y-2">
                    <div className="flex items-center justify-between border-b border-[#deddd3]/60 pb-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#717975] flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#c79a45]" />
                        Delivery Destination
                      </span>
                      <span className="text-[10px] font-bold text-[#073a2d] uppercase">
                        {selectedOrderForInvoice.fullAddress?.division || 'Nationwide'}
                      </span>
                    </div>
                    <div className="text-xs text-[#404945] space-y-1">
                      <p className="font-semibold text-[#1b1c18]">
                        {selectedOrderForInvoice.fullAddress?.addressLine1 || selectedOrderForInvoice.customerLocation}
                      </p>
                      {selectedOrderForInvoice.fullAddress?.addressLine2 && (
                        <p>{selectedOrderForInvoice.fullAddress.addressLine2}</p>
                      )}
                      <p className="text-[#717975]">
                        {[
                          selectedOrderForInvoice.fullAddress?.city,
                          selectedOrderForInvoice.fullAddress?.division,
                          'Bangladesh',
                        ]
                          .filter(Boolean)
                          .join(', ')}
                      </p>
                      {(selectedOrderForInvoice.fullAddress?.deliveryInstructions || selectedOrderForInvoice.customerNotes) && (
                        <div className="mt-2 pt-2 border-t border-[#deddd3]/60 text-[11px] bg-white p-2 border border-[#deddd3]">
                          <span className="font-bold text-[#8c6722] uppercase text-[9px] block">
                            Special Patron Instructions:
                          </span>
                          <p className="italic text-[#404945]">
                            &ldquo;{selectedOrderForInvoice.fullAddress?.deliveryInstructions || selectedOrderForInvoice.customerNotes}&rdquo;
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Payment & Gateway Settlement Dossier */}
                <div className="bg-[#fbf9f2] border border-[#deddd3] p-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#deddd3]/60 pb-2.5">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-[#073a2d]" />
                      <span className="text-xs uppercase font-bold tracking-wider text-[#1b1c18]">
                        Payment & Gateway Settlement Dossier
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSyncPayment(selectedOrderForInvoice.orderNumber || selectedOrderForInvoice.id)}
                        disabled={isSyncingPayment}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-[#deddd3] hover:border-[#073a2d] text-[10px] font-bold uppercase tracking-wider text-[#073a2d] transition-colors disabled:opacity-50 cursor-pointer"
                        title="Query Waitmark Gateway live status for this order"
                      >
                        <RefreshCw className={`w-3 h-3 ${isSyncingPayment ? 'animate-spin' : ''}`} />
                        <span>{isSyncingPayment ? 'Syncing...' : 'Check Gateway Status'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Payment Settlement Status Banner */}
                  {selectedOrderForInvoice.paymentStatus === 'PAID' ? (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xs flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <div className="space-y-0.5 flex-1">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="font-bold text-xs uppercase tracking-wider text-emerald-800">
                            Payment Settled & Verified (PAID)
                          </span>
                          <span className="font-mono text-xs font-bold bg-white px-2 py-0.5 border border-emerald-300 text-emerald-700">
                            ৳{(selectedOrderForInvoice.paidAmount || selectedOrderForInvoice.amount).toLocaleString()} BDT
                          </span>
                        </div>
                        <p className="text-[11px] text-emerald-700">
                          Customer successfully completed payment via {selectedOrderForInvoice.paymentMethod === 'WAITMARK_PAY' ? 'Waitmark Pay Gateway' : selectedOrderForInvoice.paymentMethod}.
                        </p>
                      </div>
                    </div>
                  ) : selectedOrderForInvoice.paymentStatus === 'FAILED' ? (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-900 rounded-xs flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                      <div className="space-y-0.5 flex-1">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="font-bold text-xs uppercase tracking-wider text-rose-800">
                            Payment Failed or Declined
                          </span>
                          <span className="font-mono text-xs font-bold bg-white px-2 py-0.5 border border-rose-300 text-rose-700">
                            Due: ৳{selectedOrderForInvoice.amount.toLocaleString()} BDT
                          </span>
                        </div>
                        <p className="text-[11px] text-rose-700">
                          The gateway reported that this payment was not completed or failed. The customer may retry or request another payment method.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xs flex items-start gap-3">
                      <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div className="space-y-0.5 flex-1">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="font-bold text-xs uppercase tracking-wider text-amber-800">
                            Awaiting Customer Payment (UNPAID)
                          </span>
                          <span className="font-mono text-xs font-bold bg-white px-2 py-0.5 border border-amber-300 text-amber-700">
                            Due: ৳{selectedOrderForInvoice.amount.toLocaleString()} BDT
                          </span>
                        </div>
                        <p className="text-[11px] text-amber-700">
                          {selectedOrderForInvoice.paymentMethod === 'WAITMARK_PAY'
                            ? 'Customer selected Waitmark Pay. No completed payment has been confirmed by the gateway yet.'
                            : 'Order placed with Cash on Delivery (COD). Payment to be collected upon courier delivery.'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* 4-Metric Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                    <div className="bg-white p-2.5 border border-[#deddd3]">
                      <span className="text-[9px] uppercase font-bold text-[#717975] block">Payment Channel</span>
                      <span className="font-mono text-xs font-bold text-[#073a2d]">
                        {selectedOrderForInvoice.paymentMethod === 'WAITMARK_PAY' ? 'Waitmark Pay' : selectedOrderForInvoice.paymentMethod}
                      </span>
                    </div>

                    <div className="bg-white p-2.5 border border-[#deddd3]">
                      <span className="text-[9px] uppercase font-bold text-[#717975] block">Payment Status</span>
                      <span
                        className={`text-xs font-bold uppercase ${
                          selectedOrderForInvoice.paymentStatus === 'PAID'
                            ? 'text-emerald-700'
                            : selectedOrderForInvoice.paymentStatus === 'FAILED'
                            ? 'text-rose-700'
                            : 'text-amber-700'
                        }`}
                      >
                        {selectedOrderForInvoice.paymentStatus || 'PENDING'}
                      </span>
                    </div>

                    <div className="bg-white p-2.5 border border-[#deddd3]">
                      <span className="text-[9px] uppercase font-bold text-[#717975] block">Total Payable</span>
                      <span className="font-serif text-xs font-bold text-[#1b1c18]">
                        ৳{selectedOrderForInvoice.amount.toLocaleString()}
                      </span>
                    </div>

                    <div className="bg-white p-2.5 border border-[#deddd3]">
                      <span className="text-[9px] uppercase font-bold text-[#717975] block">Verified Paid</span>
                      <span className="font-serif text-xs font-bold text-emerald-800">
                        ৳{(selectedOrderForInvoice.paidAmount || (selectedOrderForInvoice.paymentStatus === 'PAID' ? selectedOrderForInvoice.amount : 0)).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Gateway Identifiers: TrxID & Attempt ID */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    <div className="bg-white p-2.5 border border-[#deddd3] flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <span className="text-[9px] uppercase font-bold text-[#717975] block">
                          Verified TrxID (Transaction ID)
                        </span>
                        <span className="font-mono text-xs font-bold text-[#073a2d] truncate block">
                          {selectedOrderForInvoice.paymentReference ||
                            selectedOrderForInvoice.payments?.find((p) => p.providerTransactionId)?.providerTransactionId ||
                            '— (Not captured)'}
                        </span>
                      </div>
                      {(selectedOrderForInvoice.paymentReference ||
                        selectedOrderForInvoice.payments?.find((p) => p.providerTransactionId)?.providerTransactionId) && (
                        <button
                          onClick={() =>
                            handleCopy(
                              selectedOrderForInvoice.paymentReference ||
                                selectedOrderForInvoice.payments?.find((p) => p.providerTransactionId)?.providerTransactionId ||
                                '',
                              'trxId',
                            )
                          }
                          className="p-1 hover:bg-[#f0eee7] text-[#717975] hover:text-[#073a2d] cursor-pointer"
                          title="Copy Transaction ID"
                        >
                          {copiedKey === 'trxId' ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                    </div>

                    <div className="bg-white p-2.5 border border-[#deddd3] flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <span className="text-[9px] uppercase font-bold text-[#717975] block">
                          Waitmark Attempt Reference
                        </span>
                        <span className="font-mono text-xs font-bold text-[#404945] truncate block">
                          {selectedOrderForInvoice.payments?.[0]?.providerOrderId ||
                            `WMPAY-${(selectedOrderForInvoice.orderNumber || selectedOrderForInvoice.id).replace(/[^A-Za-z0-9]/g, '')}`}
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          handleCopy(
                            selectedOrderForInvoice.payments?.[0]?.providerOrderId ||
                              `WMPAY-${(selectedOrderForInvoice.orderNumber || selectedOrderForInvoice.id).replace(/[^A-Za-z0-9]/g, '')}`,
                            'attemptId',
                          )
                        }
                        className="p-1 hover:bg-[#f0eee7] text-[#717975] hover:text-[#073a2d] cursor-pointer"
                        title="Copy Attempt Reference"
                      >
                        {copiedKey === 'attemptId' ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Payment Attempts History (Multi-Attempt Audit Log) */}
                  {selectedOrderForInvoice.payments && selectedOrderForInvoice.payments.length > 0 && (
                    <div className="pt-2 border-t border-[#deddd3]/60">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#717975] block mb-1.5">
                        Payment Gateway Attempts History ({selectedOrderForInvoice.payments.length})
                      </span>
                      <div className="bg-white border border-[#deddd3] divide-y divide-[#f0eee7] max-h-40 overflow-y-auto">
                        {selectedOrderForInvoice.payments.map((pmt, pIdx) => (
                          <div key={pmt.id || pIdx} className="p-2 flex items-center justify-between text-xs gap-2">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-[11px] font-semibold text-[#1b1c18] truncate">
                                  {pmt.providerOrderId}
                                </span>
                                <span
                                  className={`px-1.5 py-0.2 text-[9px] font-bold uppercase rounded-xs border ${
                                    pmt.status === 'PAID'
                                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                      : pmt.status === 'FAILED'
                                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                                      : 'bg-amber-50 text-amber-800 border-amber-200'
                                  }`}
                                >
                                  {pmt.status}
                                </span>
                              </div>
                              <div className="text-[10px] text-[#717975] flex items-center gap-2 mt-0.5">
                                <span>{new Date(pmt.createdAt).toLocaleString()}</span>
                                {pmt.providerTransactionId && (
                                  <span className="font-mono text-[#073a2d] font-bold">
                                    Trx: {pmt.providerTransactionId}
                                  </span>
                                )}
                                {pmt.failureReason && (
                                  <span className="text-rose-600 italic truncate max-w-[200px]">
                                    ({pmt.failureReason})
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0 font-serif font-bold text-xs text-[#1b1c18]">
                              ৳{pmt.amount.toLocaleString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Consignment Items Table with Real Photos */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#1b1c18] flex items-center gap-1.5">
                      <ShoppingBag className="w-3.5 h-3.5 text-[#073a2d]" />
                      Consignment Items ({selectedOrderForInvoice.itemCount} Total Units)
                    </h3>
                  </div>

                  <div className="border border-[#deddd3] divide-y divide-[#f0eee7] max-h-72 overflow-y-auto">
                    {selectedOrderForInvoice.items && selectedOrderForInvoice.items.length > 0 ? (
                      selectedOrderForInvoice.items.map((item, idx) => (
                        <div
                          key={item.id || idx}
                          className="p-3 flex items-center justify-between gap-4 bg-white hover:bg-[#fbf9f2] transition-colors"
                        >
                          {/* Photo Thumbnail */}
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-14 h-16 bg-[#f0eee7] border border-[#deddd3] overflow-hidden flex-shrink-0 flex items-center justify-center">
                              {item.image ? (
                                <img
                                  src={item.image}
                                  alt={item.productName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <ShoppingBag className="w-6 h-6 text-[#717975] opacity-40" />
                              )}
                            </div>

                            <div className="min-w-0">
                              <h4 className="font-serif text-sm font-semibold text-[#1b1c18] truncate">
                                {item.productName}
                              </h4>
                              <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[11px] text-[#717975]">
                                {item.size && (
                                  <span className="px-1.5 py-0.5 bg-[#f0eee7] font-semibold text-[#1b1c18] border border-[#deddd3]">
                                    Size: {item.size}
                                  </span>
                                )}
                                {item.color && (
                                  <span className="px-1.5 py-0.5 bg-[#f0eee7] text-[#404945] border border-[#deddd3]">
                                    {item.color}
                                  </span>
                                )}
                                {item.sku && (
                                  <span className="font-mono text-[10px] text-[#717975]">
                                    SKU: {item.sku}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Pricing & Quantity */}
                          <div className="text-right flex-shrink-0">
                            <div className="text-xs text-[#717975]">
                              ৳{item.unitPrice.toLocaleString()} ×{' '}
                              <strong className="text-[#1b1c18] font-mono">{item.quantity}</strong>
                            </div>
                            <p className="font-serif font-bold text-sm text-[#073a2d] mt-0.5">
                              ৳{item.subtotal.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-xs text-[#717975]">
                        <span>{selectedOrderForInvoice.itemsSummary}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="bg-[#fbf9f2] border border-[#deddd3] p-4">
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-[#717975]">
                      <span>Items Subtotal</span>
                      <span className="font-mono font-medium text-[#1b1c18]">
                        ৳{(selectedOrderForInvoice.subtotal || selectedOrderForInvoice.amount).toLocaleString()}
                      </span>
                    </div>

                    {Boolean(
                      selectedOrderForInvoice.discountAmount &&
                        selectedOrderForInvoice.discountAmount > 0
                    ) && (
                      <div className="flex justify-between text-[#8c6722]">
                        <span>Voucher / Coupon Discount</span>
                        <span className="font-mono font-medium">
                          -৳{selectedOrderForInvoice.discountAmount?.toLocaleString()}
                        </span>
                      </div>
                    )}

                    {Boolean(
                      selectedOrderForInvoice.manualDiscountAmount &&
                        selectedOrderForInvoice.manualDiscountAmount > 0
                    ) && (
                      <div className="flex justify-between text-[#8c6722]">
                        <span>Manual Admin Concession</span>
                        <span className="font-mono font-medium">
                          -৳{selectedOrderForInvoice.manualDiscountAmount?.toLocaleString()}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between text-[#717975]">
                      <span>Nationwide Express Delivery</span>
                      <span className="font-mono font-medium text-[#1b1c18]">
                        {selectedOrderForInvoice.deliveryCharge === 0
                          ? 'FREE'
                          : `৳${(selectedOrderForInvoice.deliveryCharge || 80).toLocaleString()}`}
                      </span>
                    </div>

                    <div className="border-t border-[#deddd3] pt-2 mt-2 flex justify-between items-baseline">
                      <div>
                        <span className="font-serif text-sm font-bold uppercase text-[#1b1c18]">
                          Total Payable
                        </span>
                        <span className="block text-[10px] text-[#717975]">
                          All taxes & atelier packaging included
                        </span>
                      </div>
                      <span className="font-serif text-2xl font-bold text-[#073a2d]">
                        ৳{selectedOrderForInvoice.amount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Pathao Courier Sandbox Dispatch Section */}
                <div className="bg-[#fbf9f2] border border-[#deddd3] p-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#deddd3]/60 pb-2">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-[#8c6722]" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#1b1c18]">
                        Pathao Courier Logistics
                      </h4>
                      <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-[#c79a45]/20 text-[#8c6722] border border-[#c79a45]/40">
                        SANDBOX / TEST
                      </span>
                    </div>

                    <p className="text-[10px] text-[#717975] italic">
                      Testing Mode — No real delivery will be created.
                    </p>
                  </div>

                  {selectedOrderForInvoice.courierConsignmentId ? (
                    <div className="bg-white border border-[#deddd3] p-3 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#717975] block">
                            Sandbox Consignment ID
                          </span>
                          <span className="font-mono text-sm font-black text-[#073a2d]">
                            #{selectedOrderForInvoice.courierConsignmentId}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-1 text-xs font-semibold border ${
                              selectedOrderForInvoice.courierStatus === 'UNKNOWN'
                                ? 'bg-amber-100/60 border-amber-400 text-amber-900 font-bold'
                                : selectedOrderForInvoice.courierStatus === 'DELIVERED'
                                  ? 'bg-[#b0ecd3]/50 border-[#0d4d3b]/40 text-[#073a2d]'
                                  : 'bg-[#b0ecd3]/40 border-[#0d4d3b]/30 text-[#073a2d]'
                            }`}
                          >
                            {selectedOrderForInvoice.courierStatus || 'Pending'}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleRefreshPathaoStatus(selectedOrderForInvoice.id)}
                            disabled={isRefreshingPathao}
                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-[#deddd3] hover:bg-[#fbf9f2] text-xs font-medium text-[#404945] transition-colors disabled:opacity-50 cursor-pointer"
                          >
                            {isRefreshingPathao ? (
                              <Loader2 className="w-3 h-3 animate-spin text-[#073a2d]" />
                            ) : (
                              <RefreshCw className="w-3 h-3 text-[#717975]" />
                            )}
                            <span>{isRefreshingPathao ? 'Syncing...' : 'Refresh Status'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Unknown Status Warning Notice (Requirement 14) */}
                      {selectedOrderForInvoice.courierStatus === 'UNKNOWN' && (
                        <div className="p-2.5 bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <div className="space-y-0.5">
                            <p className="font-bold text-amber-900">
                              Pathao reported a status that is not currently mapped.
                            </p>
                            <p className="text-[11px] text-amber-800">
                              Provider Status:{' '}
                              <code className="font-mono bg-white/80 px-1 py-0.5 border border-amber-300">
                                {selectedOrderForInvoice.courierStatusRaw || 'unknown'}
                              </code>
                              . No automated order completion or stock changes have occurred.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Courier Diagnostics / Status Breakdown */}
                      <div className="bg-[#fbf9f2] border border-[#deddd3] p-2.5 space-y-1 text-xs">
                        <div className="flex items-center justify-between text-[11px] text-[#717975]">
                          <span>Courier:</span>
                          <span className="font-semibold text-[#1b1c18]">Pathao Express (Sandbox)</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-[#717975]">
                          <span>Normalized Status:</span>
                          <span className="font-mono font-bold text-[#073a2d]">
                            {selectedOrderForInvoice.courierStatus || 'PENDING'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-[#717975]">
                          <span>Raw Provider Status:</span>
                          <span className="font-mono text-[#404945]">
                            {selectedOrderForInvoice.courierStatusRaw || selectedOrderForInvoice.courierStatus || 'Pending'}
                          </span>
                        </div>
                        {selectedOrderForInvoice.courierLastSyncedAt && (
                          <div className="flex items-center justify-between text-[11px] text-[#717975]">
                            <span>Last Synced:</span>
                            <span className="text-[#404945]">
                              {new Date(selectedOrderForInvoice.courierLastSyncedAt).toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="pt-2 border-t border-[#f0eee7] flex flex-wrap items-center justify-between gap-2 text-xs text-[#717975]">
                        <span>Carrier: <strong>Pathao Express (Sandbox)</strong></span>
                        <div className="flex items-center gap-2">
                          <a
                            href={`https://merchant.pathao.com/tracking?consignment_id=${selectedOrderForInvoice.courierConsignmentId}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[#073a2d] hover:underline font-semibold"
                          >
                            <span>Pathao Portal</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                      <p className="text-[10px] text-[#717975] italic">
                        Note: Sandbox test parcels exist only in the Pathao Sandbox API. Click &quot;Refresh Status&quot; above to sync live test updates.
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-[#deddd3] p-3 text-xs">
                      <div>
                        <p className="font-semibold text-[#1b1c18]">Ready for Sandbox Courier Booking</p>
                        <p className="text-[11px] text-[#69726d] mt-0.5">
                          Collect: ৳
                          {selectedOrderForInvoice.paymentStatus === 'PAID'
                            ? 0
                            : Math.max(
                                0,
                                selectedOrderForInvoice.amount - (selectedOrderForInvoice.paidAmount || 0),
                              ).toLocaleString()}{' '}
                          • Units: {selectedOrderForInvoice.itemCount} Total Garment(s)
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleBookPathaoParcel(selectedOrderForInvoice.id)}
                        disabled={isBookingPathao}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#073a2d] hover:bg-[#0c4e3b] text-white text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer shadow-xs whitespace-nowrap"
                      >
                        {isBookingPathao ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Booking Sandbox Parcel...</span>
                          </>
                        ) : (
                          <>
                            <Truck className="w-3.5 h-3.5 text-[#c79a45]" />
                            <span>Book Pathao Sandbox Parcel</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: COURIER PARCEL SHIPPING SLIP PREVIEW */}
            {receiptMode === 'PARCEL_SLIP' && (
              <div className="space-y-4">
                <div className="bg-[#fbf9f2] border border-[#c79a45]/40 p-2.5 flex items-start gap-2.5 text-xs text-[#69726d]">
                  <Truck className="w-4 h-4 text-[#8c6722] flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#1b1c18]">Courier Dispatch Format:</strong> Ready for QSR / Steadfast / Pathao / RedX / Paperfly. Click <strong>Print Slip</strong> to print this label and tape it onto the parcel pouch.
                  </div>
                </div>

                {/* High-Contrast Courier Label Preview */}
                <div className="bg-white border-2 border-black p-5 text-black space-y-4">
                  {/* Top Barcode & Header */}
                  <div className="border-b-2 border-black pb-3 flex flex-col sm:flex-row justify-between items-start gap-3">
                    <div>
                      <h3 className="font-serif text-xl font-black text-black">RONGIN LIBAS</h3>
                      <p className="text-[10px] font-bold uppercase text-black/70">
                        Haute Couture Menswear • Dispatch Hub
                      </p>
                      <p className="text-[10px] text-black/60 mt-1">
                        Hotline: +880 1700-000000 | Hub: Uttara, Dhaka-1230
                      </p>
                    </div>

                    <div className="text-right flex flex-col items-start sm:items-end">
                      <div className="bg-black text-white px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider mb-1">
                        COURIER DISPATCH AIRWAY BILL
                      </div>
                      <BarcodeGraphic value={selectedOrderForInvoice.orderNumber || selectedOrderForInvoice.id} />
                      <span className="text-[9px] text-black/70 mt-1">
                        Booked: {selectedOrderForInvoice.dateStr} • {selectedOrderForInvoice.timeDetail}
                      </span>
                    </div>
                  </div>

                  {/* 2-Column Recipient & COD */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="border-2 border-black p-3 space-y-1.5">
                      <div className="flex justify-between items-center border-b border-black/30 pb-1">
                        <span className="text-[10px] font-black uppercase text-black">
                          DELIVER TO / CONSIGNEE:
                        </span>
                        <span className="text-[9px] font-black bg-black text-white px-1.5 py-0.5">
                          {selectedOrderForInvoice.fullAddress?.division?.toUpperCase() || 'DHAKA'}
                        </span>
                      </div>
                      <div className="text-sm font-black uppercase text-black">
                        {selectedOrderForInvoice.customerName}
                      </div>
                      {/* Big Phone Box */}
                      <div className="bg-black/5 border border-black p-1.5">
                        <span className="text-[9px] font-bold uppercase text-black/70 block">
                          Rider Call Contact:
                        </span>
                        <div className="text-lg font-mono font-black text-black tracking-wider flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-black" />
                          <span>{selectedOrderForInvoice.phone}</span>
                        </div>
                      </div>
                      <div className="text-xs text-black">
                        <p className="font-bold">{selectedOrderForInvoice.fullAddress?.addressLine1 || selectedOrderForInvoice.customerLocation}</p>
                        {selectedOrderForInvoice.fullAddress?.addressLine2 && <p>{selectedOrderForInvoice.fullAddress.addressLine2}</p>}
                        <p className="font-semibold text-black/80">
                          {[selectedOrderForInvoice.fullAddress?.city, selectedOrderForInvoice.fullAddress?.division, 'Bangladesh'].filter(Boolean).join(', ')}
                        </p>
                      </div>
                    </div>

                    <div className="border-2 border-black p-3 bg-black/[0.02] flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-center border-b border-black/30 pb-1">
                          <span className="text-[10px] font-black uppercase text-black">
                            COD CASH COLLECTION
                          </span>
                          <span className="text-[9px] font-black border border-black px-1.5 py-0.5 bg-black text-white">
                            {selectedOrderForInvoice.paymentMethod === 'COD' ? 'CASH ON DELIVERY' : 'PREPAID'}
                          </span>
                        </div>
                        <div className="border-2 border-black bg-white p-2.5 my-2 text-center">
                          <span className="text-[9px] font-black uppercase text-black/70 block">
                            COLLECT FROM RECIPIENT:
                          </span>
                          <div className="text-2xl sm:text-3xl font-mono font-black text-black my-1">
                            {selectedOrderForInvoice.paymentMethod === 'COD'
                              ? `৳ ${selectedOrderForInvoice.amount.toLocaleString()}`
                              : '৳ 0.00 (PAID)'}
                          </div>
                          <span className="text-[9px] font-bold uppercase bg-black text-white px-2 py-0.5 inline-block">
                            {selectedOrderForInvoice.paymentMethod === 'COD'
                              ? '⚠️ Collect Cash Before Handover'
                              : '✅ Paid Online • Zero Cash'}
                          </span>
                        </div>
                      </div>
                      <div className="text-[9px] text-black/70 border-t border-black/20 pt-1">
                        <strong>Package:</strong> &lt; 1.0 KG • Fragile Luxury Menswear
                      </div>
                    </div>
                  </div>

                  {/* Dotted Cut Line */}
                  <div className="my-3 border-t-2 border-dashed border-black relative flex items-center justify-center">
                    <span className="bg-white px-2 text-[9px] font-bold uppercase text-black flex items-center gap-1 -mt-2">
                      <Scissors className="w-3 h-3 text-black" /> FOLD OR CUT HERE TO ATTACH TO PARCEL POUCH
                    </span>
                  </div>

                  {/* Manifest Preview */}
                  <div className="border border-black p-2 bg-black/[0.01]">
                    <span className="text-[10px] font-black uppercase block mb-1">
                      Packing Manifest ({selectedOrderForInvoice.itemCount} Units)
                    </span>
                    <div className="text-xs divide-y divide-black/20">
                      {selectedOrderForInvoice.items?.map((it, i) => (
                        <div key={i} className="py-1 flex justify-between items-center">
                          <span>{it.productName} ({it.size || '-'}) × {it.quantity}</span>
                          <span className="font-mono font-bold">৳{it.subtotal.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t-2 border-black pt-1 mt-1 flex justify-between font-bold text-xs">
                      <span>Total Payable:</span>
                      <span className="font-mono">৳{selectedOrderForInvoice.amount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Footer Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 mt-5 border-t border-[#deddd3]">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs text-[#717975] font-semibold">Stage:</span>
                <div className="flex items-center gap-1.5">
                  <select
                    value={selectedOrderForInvoice.status}
                    disabled={isUpdatingStatus}
                    aria-busy={isUpdatingStatus}
                    onChange={async (e) => {
                      const newStatus = e.target.value as AdminOrder['status'];
                      if (newStatus === selectedOrderForInvoice.status || isUpdatingStatus) return;
                      setIsUpdatingStatus(true);
                      try {
                        const success = await updateOrderStatus(selectedOrderForInvoice.id, newStatus);
                        if (success) {
                          setSelectedOrderForInvoice((prev) =>
                            prev ? { ...prev, status: newStatus } : null
                          );
                        }
                      } finally {
                        setIsUpdatingStatus(false);
                      }
                    }}
                    className="px-2.5 py-1.5 border border-[#deddd3] bg-white text-xs font-bold uppercase tracking-wider text-[#073a2d] cursor-pointer disabled:opacity-50"
                  >
                    {(
                      ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const
                    ).map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                  {isUpdatingStatus && (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#073a2d]" />
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedOrderForInvoice(null)}
                  className="px-4 py-2 border border-[#deddd3] text-xs font-bold uppercase tracking-wider text-[#717975] hover:bg-[#f0eee7] transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => printParcelSlip(selectedOrderForInvoice)}
                  className="flex items-center gap-1.5 px-5 py-2 bg-[#073a2d] hover:bg-[#0d4d3b] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-xs cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-[#c79a45]" />
                  <span>Print Slip</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  return (
    <PermissionGuard permission="orders" moduleName="Orders">
      <Suspense
        fallback={
          <TablePageSkeleton
            title="Atelier Orders & Fulfillment"
            showAddButton={false}
            rowCount={8}
          />
        }
      >
        <OrdersPageContent />
      </Suspense>
    </PermissionGuard>
  );
}
