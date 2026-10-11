'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  ShoppingBag,
  DollarSign,
  Package,
  Users,
  Ticket,
  Tag,
  Calendar,
  AlertCircle,
  RefreshCw,
  ArrowUpRight,
  ShieldCheck,
  Percent,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
} from 'lucide-react';
import { adminApi, AdminReportsResponse } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { TablePageSkeleton } from '@/components/common/Skeleton';

type ReportPeriod = '7d' | '30d' | '90d' | '1y' | 'all';

export default function ReportsAdminPage() {
  return (
    <PermissionGuard
      permission={['reports', 'dashboard', 'orders']}
      moduleName="Reports & Analytics"
    >
      <ReportsContent />
    </PermissionGuard>
  );
}

function ReportsContent() {
  const { toast } = useToast();
  const [period, setPeriod] = useState<ReportPeriod>('30d');
  const [reports, setReports] = useState<AdminReportsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'sales' | 'orders' | 'products' | 'customers' | 'coupons'>('sales');

  const fetchReports = async (selectedPeriod: ReportPeriod) => {
    setIsLoading(true);
    try {
      const res = await adminApi.reports.get(selectedPeriod);
      if (res.success && res.data) {
        setReports(res.data);
      } else {
        toast.error(res.error || 'Failed to fetch business reports');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Server error loading reporting intelligence');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports(period);
  }, [period]);

  const handlePeriodChange = (p: ReportPeriod) => {
    setPeriod(p);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="border-b border-[#deddd3] pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold tracking-widest uppercase text-[#717975]">
            BUSINESS INTELLIGENCE & AUDITED METRICS
          </span>
          <h1 className="text-3xl font-serif text-[#1b1c18] mt-1 tracking-tight flex items-center gap-3">
            <BarChart3 className="w-7 h-7 text-[#c79a45]" />
            <span>Business Reports</span>
          </h1>
          <p className="text-xs text-[#69726d] mt-1">
            Real-time multi-dimensional ledger analytics queried directly from live database transactions.
          </p>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex items-center gap-2 bg-[#f2efe9] p-1 rounded-md self-start md:self-auto">
          {(
            [
              { id: '7d', label: '7 Days' },
              { id: '30d', label: '30 Days' },
              { id: '90d', label: '90 Days' },
              { id: '1y', label: '1 Year' },
              { id: 'all', label: 'All Time' },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              onClick={() => handlePeriodChange(item.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors cursor-pointer ${
                period === item.id
                  ? 'bg-[#00231a] text-white shadow-xs'
                  : 'text-[#424945] hover:text-[#00231a]'
              }`}
            >
              {item.label}
            </button>
          ))}
          <button
            onClick={() => fetchReports(period)}
            title="Refresh Data"
            disabled={isLoading}
            className="p-1.5 text-[#424945] hover:text-[#00231a] rounded transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {isLoading || !reports ? (
        <TablePageSkeleton />
      ) : (
        <>
          {/* Top KPI Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-[#deddd3] rounded-lg p-5 shadow-xs">
              <div className="flex items-center justify-between text-[#717975] text-[11px] font-semibold uppercase tracking-wider">
                <span>Total Net Revenue</span>
                <DollarSign className="w-4 h-4 text-[#c79a45]" />
              </div>
              <div className="text-2xl font-serif font-bold text-[#1b1c18] mt-2">
                ৳{reports.sales.totalNetSales.toLocaleString()}
              </div>
              <div className="text-[11px] text-[#69726d] mt-1 flex items-center justify-between">
                <span>Gross: ৳{reports.sales.totalGrossSales.toLocaleString()}</span>
                <span className="text-[#0f5c40]">AOV: ৳{reports.sales.averageOrderValue.toLocaleString()}</span>
              </div>
            </div>

            <div className="bg-white border border-[#deddd3] rounded-lg p-5 shadow-xs">
              <div className="flex items-center justify-between text-[#717975] text-[11px] font-semibold uppercase tracking-wider">
                <span>Orders Placed</span>
                <ShoppingBag className="w-4 h-4 text-[#00231a]" />
              </div>
              <div className="text-2xl font-serif font-bold text-[#1b1c18] mt-2">
                {reports.orders.totalOrders.toLocaleString()}
              </div>
              <div className="text-[11px] text-[#69726d] mt-1 flex items-center justify-between">
                <span>Delivered: {reports.sales.completedOrdersCount}</span>
                <span className="text-[#ba1a1a]">Cancelled: {reports.sales.cancelledOrdersCount}</span>
              </div>
            </div>

            <div className="bg-white border border-[#deddd3] rounded-lg p-5 shadow-xs">
              <div className="flex items-center justify-between text-[#717975] text-[11px] font-semibold uppercase tracking-wider">
                <span>Discounts Delivered</span>
                <Percent className="w-4 h-4 text-[#c79a45]" />
              </div>
              <div className="text-2xl font-serif font-bold text-[#1b1c18] mt-2">
                ৳{reports.sales.totalDiscounts.toLocaleString()}
              </div>
              <div className="text-[11px] text-[#69726d] mt-1 flex items-center justify-between">
                <span>Discounted Orders: {reports.coupons.ordersWithDiscounts}</span>
                <span>Shipping: ৳{reports.sales.totalShipping.toLocaleString()}</span>
              </div>
            </div>

            <div className="bg-white border border-[#deddd3] rounded-lg p-5 shadow-xs">
              <div className="flex items-center justify-between text-[#717975] text-[11px] font-semibold uppercase tracking-wider">
                <span>Audited Patrons</span>
                <Users className="w-4 h-4 text-[#00231a]" />
              </div>
              <div className="text-2xl font-serif font-bold text-[#1b1c18] mt-2">
                {reports.customers.totalCustomers.toLocaleString()}
              </div>
              <div className="text-[11px] text-[#69726d] mt-1 flex items-center justify-between">
                <span>New in Period: {reports.customers.newCustomersInPeriod}</span>
                <span>Active: {reports.customers.activePatronsInPeriod}</span>
              </div>
            </div>
          </div>

          {/* Report Section Tabs */}
          <div className="border-b border-[#deddd3] flex items-center gap-6 text-xs font-semibold">
            {[
              { id: 'sales', label: 'Sales & Revenue Ledger' },
              { id: 'orders', label: 'Orders & Fulfillment' },
              { id: 'products', label: 'Products & Inventory' },
              { id: 'customers', label: 'Patrons & Retention' },
              { id: 'coupons', label: 'Discounts & Campaigns' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-3 -mb-px transition-colors cursor-pointer uppercase tracking-wider ${
                  activeTab === tab.id
                    ? 'border-b-2 border-[#c79a45] text-[#00231a] font-bold'
                    : 'text-[#717975] hover:text-[#1b1c18]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: SALES & REVENUE */}
          {activeTab === 'sales' && (
            <div className="space-y-6">
              {/* Completed vs Cancelled vs Refunded Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#fbf9f2] border border-[#c79a45]/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-[#0f5c40] text-xs font-semibold uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Completed / Paid Orders</span>
                  </div>
                  <div className="text-xl font-bold font-serif text-[#1b1c18] mt-2">
                    ৳{reports.sales.completedOrdersTotal.toLocaleString()}
                  </div>
                  <p className="text-[11px] text-[#69726d] mt-0.5">
                    {reports.sales.completedOrdersCount} successful patron transactions
                  </p>
                </div>

                <div className="bg-[#fbf9f2] border border-[#deddd3] rounded-lg p-4">
                  <div className="flex items-center gap-2 text-[#ba1a1a] text-xs font-semibold uppercase tracking-wider">
                    <XCircle className="w-4 h-4" />
                    <span>Cancelled Orders</span>
                  </div>
                  <div className="text-xl font-bold font-serif text-[#1b1c18] mt-2">
                    ৳{reports.sales.cancelledOrdersTotal.toLocaleString()}
                  </div>
                  <p className="text-[11px] text-[#69726d] mt-0.5">
                    {reports.sales.cancelledOrdersCount} cancelled orders (excluded from gross)
                  </p>
                </div>

                <div className="bg-[#fbf9f2] border border-[#deddd3] rounded-lg p-4">
                  <div className="flex items-center gap-2 text-[#717975] text-xs font-semibold uppercase tracking-wider">
                    <Clock className="w-4 h-4" />
                    <span>Refunded Orders</span>
                  </div>
                  <div className="text-xl font-bold font-serif text-[#1b1c18] mt-2">
                    ৳{reports.sales.refundedOrdersTotal.toLocaleString()}
                  </div>
                  <p className="text-[11px] text-[#69726d] mt-0.5">
                    {reports.sales.refundedOrdersCount} refunded transactions
                  </p>
                </div>
              </div>

              {/* Daily Revenue Table */}
              <div className="bg-white border border-[#deddd3] rounded-lg overflow-hidden">
                <div className="p-4 bg-[#fbf9f2] border-b border-[#deddd3] flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-sm font-bold text-[#1b1c18]">Daily Revenue Timeline</h3>
                    <p className="text-[11px] text-[#69726d]">Audit of daily transactions in this interval</p>
                  </div>
                  <span className="font-mono text-xs text-[#717975]">
                    {reports.sales.revenueByDate.length} {reports.sales.revenueByDate.length === 1 ? 'day recorded' : 'days recorded'}
                  </span>
                </div>

                {reports.sales.revenueByDate.length === 0 ? (
                  <div className="p-8 text-center text-xs text-[#717975]">
                    No recorded order transactions within this date interval.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#fbf9f2] border-b border-[#deddd3] text-[#717975] uppercase text-[10px] tracking-wider">
                        <tr>
                          <th className="py-2.5 px-4 font-semibold">Date (Dhaka Time)</th>
                          <th className="py-2.5 px-4 font-semibold text-center">Orders</th>
                          <th className="py-2.5 px-4 font-semibold text-right">Gross Subtotal</th>
                          <th className="py-2.5 px-4 font-semibold text-right">Net Revenue</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#deddd3]">
                        {reports.sales.revenueByDate.map((row) => (
                          <tr key={row.date} className="hover:bg-[#fbf9f2]/50">
                            <td className="py-2.5 px-4 font-mono text-[#1b1c18] font-medium">{row.date}</td>
                            <td className="py-2.5 px-4 text-center font-mono">{row.orderCount}</td>
                            <td className="py-2.5 px-4 text-right font-mono text-[#717975]">
                              ৳{row.gross.toLocaleString()}
                            </td>
                            <td className="py-2.5 px-4 text-right font-mono font-bold text-[#0f5c40]">
                              ৳{row.revenue.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: ORDERS & FULFILLMENT */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Status Breakdown */}
                <div className="bg-white border border-[#deddd3] rounded-lg p-5">
                  <h3 className="font-serif text-sm font-bold text-[#1b1c18] mb-4">
                    Order Status Distribution
                  </h3>
                  <div className="space-y-2.5">
                    {Object.entries(reports.orders.statusBreakdown).map(([status, count]) => (
                      <div key={status} className="flex items-center justify-between text-xs">
                        <span className="font-medium text-[#424945]">{status}</span>
                        <span className="font-mono bg-[#f2efe9] px-2.5 py-0.5 rounded text-[#1b1c18] font-bold">
                          {count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment Breakdown */}
                <div className="space-y-6">
                  <div className="bg-white border border-[#deddd3] rounded-lg p-5">
                    <h3 className="font-serif text-sm font-bold text-[#1b1c18] mb-4">
                      Payment Status
                    </h3>
                    <div className="space-y-2.5">
                      {Object.entries(reports.orders.paymentStatusBreakdown).map(([status, count]) => (
                        <div key={status} className="flex items-center justify-between text-xs">
                          <span className="font-medium text-[#424945]">{status}</span>
                          <span className="font-mono bg-[#f2efe9] px-2.5 py-0.5 rounded text-[#1b1c18] font-bold">
                            {count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white border border-[#deddd3] rounded-lg p-5">
                    <h3 className="font-serif text-sm font-bold text-[#1b1c18] mb-4">
                      Payment Method Share
                    </h3>
                    <div className="space-y-2.5">
                      {Object.entries(reports.orders.paymentMethodBreakdown).map(([method, count]) => (
                        <div key={method} className="flex items-center justify-between text-xs">
                          <span className="font-medium text-[#424945]">{method}</span>
                          <span className="font-mono bg-[#f2efe9] px-2.5 py-0.5 rounded text-[#1b1c18] font-bold">
                            {count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PRODUCTS & INVENTORY */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              {/* Stock Alerts Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-[#fbf9f2] border border-[#deddd3] rounded-lg p-4">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#717975]">Active Variants</span>
                  <div className="text-xl font-bold font-mono text-[#1b1c18] mt-1">
                    {reports.products.totalActiveVariants}
                  </div>
                </div>
                <div className="bg-[#fbe9e7] border border-[#ffdad6] rounded-lg p-4">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#ba1a1a]">Out of Stock</span>
                  <div className="text-xl font-bold font-mono text-[#ba1a1a] mt-1">
                    {reports.products.outOfStockCount}
                  </div>
                </div>
                <div className="bg-[#fff8e1] border border-[#ffe082] rounded-lg p-4">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#b78103]">Low Stock (≤ 5 units)</span>
                  <div className="text-xl font-bold font-mono text-[#b78103] mt-1">
                    {reports.products.lowStockCount}
                  </div>
                </div>
              </div>

              {/* Top Selling vs Lowest Selling */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Selling */}
                <div className="bg-white border border-[#deddd3] rounded-lg p-5">
                  <h3 className="font-serif text-sm font-bold text-[#1b1c18] mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#0f5c40]" />
                    <span>Top-Selling Garments</span>
                  </h3>
                  {reports.products.topSellingProducts.length === 0 ? (
                    <p className="text-xs text-[#717975] py-4">No product purchases recorded in period.</p>
                  ) : (
                    <div className="space-y-3">
                      {reports.products.topSellingProducts.map((p, idx) => (
                        <div key={p.id} className="flex items-center justify-between text-xs pb-2 border-b border-[#deddd3]/50 last:border-0">
                          <div>
                            <div className="font-semibold text-[#1b1c18]">
                              {idx + 1}. {p.name}
                            </div>
                            <span className="text-[10px] font-mono text-[#717975]">
                              {p.sku} • {p.categoryName}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="font-mono font-bold text-[#0f5c40]">{p.unitsSold} units</span>
                            <div className="text-[10px] text-[#717975]">৳{p.revenue.toLocaleString()}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Lowest Selling */}
                <div className="bg-white border border-[#deddd3] rounded-lg p-5">
                  <h3 className="font-serif text-sm font-bold text-[#1b1c18] mb-3 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#ba1a1a]" />
                    <span>Lowest-Selling Products</span>
                  </h3>
                  {reports.products.lowestSellingProducts.length === 0 ? (
                    <p className="text-xs text-[#717975] py-4">No product purchases recorded in period.</p>
                  ) : (
                    <div className="space-y-3">
                      {reports.products.lowestSellingProducts.map((p, idx) => (
                        <div key={p.id} className="flex items-center justify-between text-xs pb-2 border-b border-[#deddd3]/50 last:border-0">
                          <div>
                            <div className="font-semibold text-[#1b1c18]">
                              {idx + 1}. {p.name}
                            </div>
                            <span className="text-[10px] font-mono text-[#717975]">
                              {p.sku} • {p.categoryName}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="font-mono text-[#717975]">{p.unitsSold} units</span>
                            <div className="text-[10px] text-[#717975]">৳{p.revenue.toLocaleString()}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Category, Size, Color Aggregation */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-[#deddd3] rounded-lg p-5">
                  <h4 className="font-serif text-xs font-bold uppercase tracking-wider text-[#717975] mb-3">
                    Category Performance
                  </h4>
                  {reports.products.categoryPerformance.length === 0 ? (
                    <p className="text-xs text-[#717975]">No data</p>
                  ) : (
                    <div className="space-y-2">
                      {reports.products.categoryPerformance.map((c) => (
                        <div key={c.categoryName} className="flex justify-between text-xs">
                          <span className="text-[#424945]">{c.categoryName}</span>
                          <span className="font-mono font-bold text-[#1b1c18]">৳{c.revenue.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-white border border-[#deddd3] rounded-lg p-5">
                  <h4 className="font-serif text-xs font-bold uppercase tracking-wider text-[#717975] mb-3">
                    Best-Selling Sizes
                  </h4>
                  {reports.products.bestSellingSizes.length === 0 ? (
                    <p className="text-xs text-[#717975]">No size data recorded</p>
                  ) : (
                    <div className="space-y-2">
                      {reports.products.bestSellingSizes.map((s) => (
                        <div key={s.size} className="flex justify-between text-xs">
                          <span className="font-mono font-semibold text-[#424945]">{s.size}</span>
                          <span className="font-mono text-[#0f5c40]">{s.units} units</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-white border border-[#deddd3] rounded-lg p-5">
                  <h4 className="font-serif text-xs font-bold uppercase tracking-wider text-[#717975] mb-3">
                    Best-Selling Colors
                  </h4>
                  {reports.products.bestSellingColors.length === 0 ? (
                    <p className="text-xs text-[#717975]">No color data recorded</p>
                  ) : (
                    <div className="space-y-2">
                      {reports.products.bestSellingColors.map((c) => (
                        <div key={c.color} className="flex justify-between text-xs">
                          <span className="text-[#424945]">{c.color}</span>
                          <span className="font-mono text-[#0f5c40]">{c.units} units</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PATRONS & RETENTION */}
          {activeTab === 'customers' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border border-[#deddd3] rounded-lg p-5">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#717975]">Total Customer Base</span>
                  <div className="text-2xl font-bold font-serif text-[#1b1c18] mt-1">
                    {reports.customers.totalCustomers}
                  </div>
                  <p className="text-[11px] text-[#69726d] mt-1">All verified customer accounts registered</p>
                </div>

                <div className="bg-white border border-[#deddd3] rounded-lg p-5">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#717975]">New Patrons Acquired</span>
                  <div className="text-2xl font-bold font-serif text-[#0f5c40] mt-1">
                    {reports.customers.newCustomersInPeriod}
                  </div>
                  <p className="text-[11px] text-[#69726d] mt-1">Registered within selected interval</p>
                </div>

                <div className="bg-white border border-[#deddd3] rounded-lg p-5">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#717975]">Returning Patrons</span>
                  <div className="text-2xl font-bold font-serif text-[#c79a45] mt-1">
                    {reports.customers.returningPatronsInPeriod}
                  </div>
                  <p className="text-[11px] text-[#69726d] mt-1">Ordered more than once in this timeframe</p>
                </div>
              </div>

              {/* Order Frequency Buckets */}
              <div className="bg-white border border-[#deddd3] rounded-lg p-5">
                <h3 className="font-serif text-sm font-bold text-[#1b1c18] mb-3">
                  Patron Order Frequency
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#424945]">Single Order Patrons (1 order)</span>
                    <span className="font-mono font-bold bg-[#f2efe9] px-2.5 py-0.5 rounded">
                      {reports.customers.orderFrequencyBuckets.singleOrder}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#424945]">Repeat Patrons (2 - 3 orders)</span>
                    <span className="font-mono font-bold bg-[#e7f5ef] text-[#0f5c40] px-2.5 py-0.5 rounded">
                      {reports.customers.orderFrequencyBuckets.twoToThreeOrders}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#424945]">VIP Patrons (4+ orders)</span>
                    <span className="font-mono font-bold bg-[#fbf9f2] text-[#c79a45] px-2.5 py-0.5 rounded border border-[#c79a45]/30">
                      {reports.customers.orderFrequencyBuckets.fourOrMoreOrders}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: COUPONS & CAMPAIGNS */}
          {activeTab === 'coupons' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border border-[#deddd3] rounded-lg p-5">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#717975]">Active Coupons</span>
                  <div className="text-2xl font-bold font-serif text-[#1b1c18] mt-1">
                    {reports.coupons.activeCouponsCount}
                  </div>
                </div>
                <div className="bg-white border border-[#deddd3] rounded-lg p-5">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#717975]">Orders with Discounts</span>
                  <div className="text-2xl font-bold font-serif text-[#00231a] mt-1">
                    {reports.coupons.ordersWithDiscounts}
                  </div>
                </div>
                <div className="bg-white border border-[#deddd3] rounded-lg p-5">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#717975]">Total Discount Delivered</span>
                  <div className="text-2xl font-bold font-serif text-[#c79a45] mt-1">
                    ৳{reports.coupons.totalDiscountDelivered.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Top Coupons Table */}
              <div className="bg-white border border-[#deddd3] rounded-lg overflow-hidden">
                <div className="p-4 bg-[#fbf9f2] border-b border-[#deddd3]">
                  <h3 className="font-serif text-sm font-bold text-[#1b1c18]">Top Performing Coupons</h3>
                </div>
                {reports.coupons.topCoupons.length === 0 ? (
                  <p className="p-6 text-xs text-[#717975]">No coupon redemptions recorded.</p>
                ) : (
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#fbf9f2] border-b border-[#deddd3] text-[#717975] uppercase text-[10px]">
                      <tr>
                        <th className="py-2.5 px-4 font-semibold">Code</th>
                        <th className="py-2.5 px-4 font-semibold">Type</th>
                        <th className="py-2.5 px-4 font-semibold">Value</th>
                        <th className="py-2.5 px-4 font-semibold text-right">Redemptions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#deddd3]">
                      {reports.coupons.topCoupons.map((c) => (
                        <tr key={c.id}>
                          <td className="py-2.5 px-4 font-mono font-bold text-[#00231a]">{c.code}</td>
                          <td className="py-2.5 px-4">{c.discountType}</td>
                          <td className="py-2.5 px-4 font-mono">
                            {c.discountType === 'PERCENTAGE' ? `${c.discountValue}%` : `৳${c.discountValue}`}
                          </td>
                          <td className="py-2.5 px-4 text-right font-mono font-bold">{c.usedCount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Active Promotional Offers Overview */}
              <div className="bg-white border border-[#deddd3] rounded-lg overflow-hidden">
                <div className="p-4 bg-[#fbf9f2] border-b border-[#deddd3]">
                  <h3 className="font-serif text-sm font-bold text-[#1b1c18]">Promotional Campaign Status</h3>
                  <p className="text-[11px] text-[#69726d]">{reports.offers.trackingNote}</p>
                </div>
                <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-[#deddd3]">
                  <div>
                    <span className="text-[11px] text-[#717975]">Active Campaigns:</span>
                    <span className="font-bold font-mono ml-2 text-[#0f5c40]">{reports.offers.activeOffersCount}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-[#717975]">Scheduled:</span>
                    <span className="font-bold font-mono ml-2 text-[#b78103]">{reports.offers.scheduledOffersCount}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-[#717975]">Expired:</span>
                    <span className="font-bold font-mono ml-2 text-[#ba1a1a]">{reports.offers.expiredOffersCount}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
