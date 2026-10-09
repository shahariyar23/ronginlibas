'use client';

import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import Link from 'next/link';
import { adminApi } from '@/lib/api';
import { TablePageSkeleton } from '@/components/common/Skeleton';

interface Patron {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  tier: 'VIP Patron' | 'Atelier Regular' | 'New Client';
  ordersCount: number;
  totalSpent: number;
  lastOrder: string;
}

export default function CustomersPage() {
  const [patrons, setPatrons] = useState<Patron[]>([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(true);
  const [search, setSearch] = useState('');

  // Customer Details Drawer state
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [customerDetail, setCustomerDetail] = useState<any | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'reviews'>('profile');

  useEffect(() => {
    async function loadCustomers() {
      try {
        const res = await adminApi.customers.getAll();
        if (res.success && res.data?.items?.length > 0) {
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
              location: address,
              tier: ordersCount >= 5 ? 'VIP Patron' : ordersCount > 0 ? 'Atelier Regular' : 'New Client',
              ordersCount,
              totalSpent,
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
        }
      } catch (err) {
        console.warn('Customers API fetch fallback:', err);
      } finally {
        setIsLoadingCustomers(false);
      }
    }
    loadCustomers();
  }, []);

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

  const filtered = patrons.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase()) ||
      p.phone.includes(search),
  );

  const handleExportCSV = () => {
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Location', 'Tier', 'Orders', 'Total Spend', 'Last Order'];
    const rows = filtered.map((p) => [
      p.id,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.email}"`,
      `"${p.phone}"`,
      `"${p.location.replace(/"/g, '""')}"`,
      `"${p.tier}"`,
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

  if (isLoadingCustomers) {
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
            Registered patrons, VIP bespoke clientele, orders history, and product reviews.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2.5 border border-[#073a2d] text-xs font-semibold uppercase tracking-wider text-[#073a2d] hover:bg-[#073a2d] hover:text-white transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Roster</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white border border-[#deddd3] p-4 flex items-center justify-between shadow-xs">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-[#717975] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search patrons by name, phone, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#fbf9f2] border border-[#deddd3] text-xs text-[#1b1c18] focus:border-[#073a2d] outline-hidden placeholder-[#717975]"
          />
        </div>
      </div>

      {/* Patrons Table */}
      <div className="bg-white border border-[#deddd3] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[#deddd3] bg-[#fbf9f2] text-[#717975] uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4 font-semibold">PATRON</th>
                <th className="py-3 px-4 font-semibold">CONTACT & LOCATION</th>
                <th className="py-3 px-4 font-semibold">TIER STATUS</th>
                <th className="py-3 px-4 font-semibold">ORDERS</th>
                <th className="py-3 px-4 font-semibold">LIFETIME SPEND</th>
                <th className="py-3 px-4 font-semibold">LAST PURCHASE</th>
                <th className="py-3 px-4 text-right font-semibold">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0eee7]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#717975]">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-40 text-[#717975]" />
                    <p className="font-serif text-sm text-[#1b1c18]">No patrons found</p>
                    <p className="text-[11px] text-[#717975]">Clientele records will appear here as orders are placed.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((patron) => (
                  <tr
                    key={patron.id}
                    onClick={() => handleOpenCustomer(patron.id)}
                    className="hover:bg-[#fbf9f2] transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#073a2d] text-white flex items-center justify-center font-bold text-xs shrink-0 group-hover:scale-105 transition-transform">
                          {patron.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-[#1b1c18] group-hover:text-[#073a2d] transition-colors">
                            {patron.name}
                          </p>
                          <p className="text-[11px] font-mono text-[#717975]">{patron.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 space-y-0.5">
                      <div className="flex items-center gap-1.5 text-[#404945]">
                        <Phone className="w-3 h-3 text-[#717975] shrink-0" />
                        <span className="font-mono text-[11px]">{patron.phone}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[#69726d]">
                        <MapPin className="w-3 h-3 text-[#717975] shrink-0" />
                        <span className="truncate max-w-[200px]">{patron.location}</span>
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
                    <td className="py-3.5 px-4 font-bold text-[#1b1c18]">{patron.ordersCount} orders</td>
                    <td className="py-3.5 px-4 font-serif font-bold text-sm text-[#073a2d]">
                      ৳{patron.totalSpent.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-[#717975]">{patron.lastOrder}</td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenCustomer(patron.id);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-[#073a2d] bg-[#fbf9f2] border border-[#deddd3] group-hover:border-[#073a2d] group-hover:bg-[#073a2d] group-hover:text-white transition-all cursor-pointer"
                      >
                        <span>View Dossier</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Full Dossier Drawer Modal */}
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
                            {customerDetail.completedOrders || 0} delivered to date
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
                              customerDetail.isActive
                                ? 'bg-[#bcedda]/40 text-[#073a2d]'
                                : 'bg-[#deddd3] text-[#717975]'
                            }`}
                          >
                            {customerDetail.isActive ? 'Active Account' : 'Inactive'}
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
                          {customerDetail.preferredFit && (
                            <div>
                              <span className="text-[10px] font-bold uppercase text-[#717975]">Preferred Cut / Fit</span>
                              <p className="font-semibold text-[#073a2d] mt-0.5">{customerDetail.preferredFit}</p>
                            </div>
                          )}
                          {customerDetail.preferredSize && (
                            <div>
                              <span className="text-[10px] font-bold uppercase text-[#717975]">Preferred Size</span>
                              <p className="font-semibold text-[#073a2d] mt-0.5">{customerDetail.preferredSize}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Delivery Addresses (Saved + Order Shipping Addresses) */}
                      {(() => {
                        const savedAddrs = (customerDetail.addresses || []).map((a: any) => ({
                          ...a,
                          source: a.source || 'SAVED_PROFILE',
                        }));

                        const orderAddrs = (customerDetail.orders || [])
                          .filter(
                            (o: any) =>
                              o.shippingAddress &&
                              typeof o.shippingAddress === 'object' &&
                              (o.shippingAddress.addressLine1 || o.shippingAddress.city),
                          )
                          .map((o: any) => ({
                            id: `order-ship-${o.id}`,
                            source: 'ORDER_DESTINATION',
                            orderNumber: o.orderNumber || o.id,
                            fullName:
                              o.shippingAddress.fullName ||
                              `${customerDetail.firstName || ''} ${customerDetail.lastName || ''}`.trim(),
                            phone: o.shippingAddress.phone || customerDetail.phone,
                            addressLine1: o.shippingAddress.addressLine1 || '',
                            addressLine2: o.shippingAddress.addressLine2 || null,
                            city: o.shippingAddress.city || '',
                            division: o.shippingAddress.division || '',
                            postalCode: o.shippingAddress.postalCode || '',
                            area: o.shippingAddress.area || null,
                            deliveryInstructions: o.shippingAddress.deliveryInstructions || null,
                            isDefault: false,
                          }));

                        const combinedList = [...savedAddrs];
                        for (const oa of orderAddrs) {
                          if (
                            !combinedList.some(
                              (sa) =>
                                sa.addressLine1?.toLowerCase().trim() === oa.addressLine1?.toLowerCase().trim() &&
                                sa.city?.toLowerCase().trim() === oa.city?.toLowerCase().trim(),
                            )
                          ) {
                            combinedList.push(oa);
                          }
                        }

                        return (
                          <div className="bg-white border border-[#deddd3] p-5 shadow-2xs space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#f0eee7] pb-3">
                              <h3 className="font-serif text-base font-bold text-[#1b1c18] flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-[#073a2d]" />
                                Delivery Addresses ({combinedList.length})
                              </h3>
                              <span className="text-[10px] text-[#717975] font-medium">
                                {combinedList.some((a) => a.source === 'ORDER_DESTINATION' || a.orderNumber)
                                  ? 'Includes active consignment shipping destinations'
                                  : 'Saved profile addresses'}
                              </span>
                            </div>

                            {combinedList.length === 0 ? (
                              <div className="py-6 text-center text-[#717975]">
                                <MapPin className="w-6 h-6 mx-auto mb-1 opacity-40 text-[#717975]" />
                                <p className="text-xs">No address records logged for this patron.</p>
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {combinedList.map((addr: any) => {
                                  const isOrderAddr = addr.source === 'ORDER_DESTINATION' || addr.orderNumber;
                                  return (
                                    <div
                                      key={addr.id}
                                      className={`border p-4 text-xs space-y-1.5 relative ${
                                        addr.isDefault
                                          ? 'border-[#073a2d] bg-[#fbf9f2]'
                                          : isOrderAddr
                                          ? 'border-[#073a2d]/30 bg-[#fbf9f2]/70'
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
                                        ) : addr.orderNumber ? (
                                          <span className="px-2 py-0.5 text-[9px] font-bold uppercase bg-[#bcedda]/60 text-[#073a2d] border border-[#073a2d]/20 shrink-0 flex items-center gap-1">
                                            <Truck className="w-2.5 h-2.5" />
                                            Order {addr.orderNumber}
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
                                  );
                                })}
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
                            <p className="text-[10px] text-[#717975] mt-0.5">
                              Measurements will appear when logged via storefront bespoke profile or custom orders.
                            </p>
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
                                <span className="font-bold uppercase tracking-wider text-[10px]">Master Tailor Notes:</span>
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
                            {/* Order Header */}
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
                                  Consignment Items ({order.items.length} Products):
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

                            {/* Order Shipping Destination */}
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
                              {/* Product Info Card */}
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

                              {/* Star Rating Display */}
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

                              {/* Review Comment Quote */}
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
    </div>
  );
}
