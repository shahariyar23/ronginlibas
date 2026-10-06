'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import { AdminOrder } from '@/data/adminData';

export default function OrdersPage() {
  const { orders, updateOrderStatus } = useAdmin();
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<AdminOrder | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [showFlowGuide, setShowFlowGuide] = useState(false);

  // Tab counts
  const pendingCount = orders.filter((o) => o.status === 'PENDING').length;
  const confirmedCount = orders.filter((o) => o.status === 'CONFIRMED').length;
  const processingCount = orders.filter((o) => o.status === 'PROCESSING').length;
  const shippedCount = orders.filter((o) => o.status === 'SHIPPED').length;
  const deliveredCount = orders.filter((o) => o.status === 'DELIVERED').length;
  const cancelledCount = orders.filter((o) => o.status === 'CANCELLED').length;

  const filteredOrders = orders.filter((order) => {
    const matchesTab = activeTab === 'ALL' || order.status === activeTab;
    const matchesSearch =
      order.id.toLowerCase().includes(search.toLowerCase()) ||
      order.customerName.toLowerCase().includes(search.toLowerCase()) ||
      order.phone.includes(search);
    const matchesPayment = paymentFilter === 'ALL' || order.paymentMethod === paymentFilter;
    return matchesTab && matchesSearch && matchesPayment;
  });

  const handlePrintInvoice = (order: AdminOrder) => {
    setSelectedOrderForInvoice(order);
  };

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
              42 Total Orders Today
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
              <p className="font-serif font-bold text-[#073a2d]">৳ 1,42,850</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white border border-[#deddd3] px-3.5 py-2 text-xs">
            <div className="w-6 h-6 bg-[#f5eedf] flex items-center justify-center text-[#8c6722]">
              <Clock className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-[9px] uppercase font-bold text-[#717975]">AWAITING CONFIRM</p>
              <p className="font-serif font-bold text-[#8c6722]">8 Queued</p>
            </div>
          </div>

          <button
            onClick={() => setShowFlowGuide(!showFlowGuide)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-[#00231a] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#073a2d] transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#c79a45]" />
            <span>FLOW GUIDE</span>
          </button>
        </div>
      </div>

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
              <option value="BKASH">bKash</option>
              <option value="NAGAD">Nagad</option>
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
              {filteredOrders.map((order) => {
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
                  <tr key={order.id} className="hover:bg-[#fbf9f2] transition-colors group">
                    <td className="py-3.5 px-4 font-semibold text-[#073a2d] whitespace-nowrap">
                      <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#c79a45]" />
                        {order.id}
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
                      <span className="px-2 py-0.5 bg-[#f0eee7] text-[10px] font-mono font-bold text-[#404945] border border-[#deddd3]">
                        {order.paymentMethod}
                      </span>
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
                          onClick={() => setUpdatingOrderId(order.id)}
                          className="px-2.5 py-1 border border-[#deddd3] bg-white hover:bg-[#073a2d] hover:text-white text-[10px] font-bold uppercase tracking-wider transition-colors"
                        >
                          UPDATE
                        </button>
                        <button
                          onClick={() => handlePrintInvoice(order)}
                          className="p-1.5 text-[#717975] hover:text-[#073a2d] hover:bg-[#f0eee7]"
                          title="View Invoice"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        <div className="p-4 bg-[#fbf9f2] border-t border-[#deddd3] flex flex-col sm:flex-row items-center justify-between text-xs text-[#717975] gap-3">
          <span>
            Showing {filteredOrders.length} of {orders.length} atelier entries
          </span>

          <div className="flex items-center gap-1 font-mono text-xs">
            <span className="px-2 text-[#717975]">Previous</span>
            <span className="w-6 h-6 flex items-center justify-center bg-[#073a2d] text-white font-bold">
              1
            </span>
            <button className="w-6 h-6 flex items-center justify-center border border-[#deddd3] bg-white hover:bg-[#f0eee7] text-[#1b1c18]">
              2
            </button>
            <button className="w-6 h-6 flex items-center justify-center border border-[#deddd3] bg-white hover:bg-[#f0eee7] text-[#1b1c18]">
              3
            </button>
            <span className="px-1 text-[#717975]">...</span>
            <button className="w-6 h-6 flex items-center justify-center border border-[#deddd3] bg-white hover:bg-[#f0eee7] text-[#1b1c18]">
              7
            </button>
            <span className="px-2 text-[#1b1c18] font-medium cursor-pointer">Next</span>
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
              Update Order Status: {updatingOrderId}
            </h3>
            <p className="text-xs text-[#717975] mt-1">
              Select the next lifecycle stage for this customer consignment:
            </p>
            <div className="mt-4 space-y-2">
              {(
                ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const
              ).map((st) => (
                <button
                  key={st}
                  onClick={() => {
                    updateOrderStatus(updatingOrderId, st);
                    setUpdatingOrderId(null);
                  }}
                  className="w-full text-left px-3 py-2 border border-[#deddd3] hover:border-[#073a2d] hover:bg-[#fbf9f2] text-xs font-semibold text-[#1b1c18] transition-colors flex items-center justify-between"
                >
                  <span>{st}</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#073a2d]" />
                </button>
              ))}
            </div>
            <div className="mt-4 text-right">
              <button
                onClick={() => setUpdatingOrderId(null)}
                className="px-4 py-2 border border-[#deddd3] text-xs text-[#717975] hover:bg-[#f0eee7]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Receipt Modal */}
      {selectedOrderForInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white border border-[#deddd3] shadow-2xl p-8 w-full max-w-lg relative animate-in fade-in-0">
            <button
              onClick={() => setSelectedOrderForInvoice(null)}
              className="absolute top-4 right-4 text-[#717975] hover:text-[#1b1c18]"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="border-b border-[#deddd3] pb-4 mb-4 flex justify-between items-start">
              <div>
                <h2 className="font-logo font-bold text-lg text-[#073a2d]">RONGIN LIBAS</h2>
                <p className="text-[10px] tracking-widest uppercase text-[#c79a45]">
                  Bespoke Atelier Invoice
                </p>
              </div>
              <div className="text-right text-xs">
                <p className="font-bold text-[#073a2d]">{selectedOrderForInvoice.id}</p>
                <p className="text-[11px] text-[#717975]">{selectedOrderForInvoice.timeDetail}</p>
              </div>
            </div>

            <div className="text-xs space-y-3">
              <div className="grid grid-cols-2 gap-4 pb-3 border-b border-[#f0eee7]">
                <div>
                  <p className="text-[10px] uppercase font-bold text-[#717975]">Client Details</p>
                  <p className="font-semibold text-[#1b1c18]">
                    {selectedOrderForInvoice.customerName}
                  </p>
                  <p className="text-[#69726d]">{selectedOrderForInvoice.customerLocation}</p>
                  <p className="font-mono text-[#717975]">{selectedOrderForInvoice.phone}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-[#717975]">Payment</p>
                  <p className="font-semibold text-[#1b1c18]">
                    Method: {selectedOrderForInvoice.paymentMethod}
                  </p>
                  <p className="text-[#0d4d3b] font-semibold">
                    Status: {selectedOrderForInvoice.status}
                  </p>
                </div>
              </div>

              <div className="py-2">
                <p className="text-[10px] uppercase font-bold text-[#717975] mb-2">Item Consignment</p>
                <div className="flex justify-between font-medium">
                  <span>{selectedOrderForInvoice.itemsSummary}</span>
                  <span className="font-serif font-bold text-[#073a2d]">
                    ৳{selectedOrderForInvoice.amount.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="border-t border-[#deddd3] pt-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase text-[#1b1c18]">Total Payable</p>
                  <p className="text-[10px] text-[#717975]">Includes VAT & Atelier Packaging</p>
                </div>
                <p className="text-xl font-serif font-bold text-[#073a2d]">
                  ৳{selectedOrderForInvoice.amount.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-[#073a2d] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#0d4d3b]"
              >
                Print Slip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
