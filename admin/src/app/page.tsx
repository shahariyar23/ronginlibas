'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Download,
  Plus,
  ShoppingBag,
  Users,
  Shirt,
  Banknote,
  Eye,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import { DashboardSkeleton } from '@/components/common/Skeleton';

const ORDER_STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-[#fef3c7] text-[#92400e]',
  CONFIRMED: 'bg-[#dcfce7] text-[#166534]',
  PROCESSING: 'bg-[#dbeafe] text-[#1e40af]',
  SHIPPED: 'bg-[#ede9fe] text-[#5b21b6]',
  DELIVERED: 'bg-[#b0ecd3]/50 text-[#073a2d]',
  CANCELLED: 'bg-[#ffdad6] text-[#ba1a1a]',
  REJECTED: 'bg-[#ffdad6] text-[#ba1a1a]',
};

const formatAxisCurrency = (amount: number) =>
  `৳${new Intl.NumberFormat('en', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(amount)}`;

export default function DashboardPage() {
  const {
    inventory,
    updateInventoryStock,
    dashboardMetrics,
    dashboardLoading,
    dashboardError,
    refreshDashboard,
    isLoading,
  } = useAdmin();
  const [activeRange, setActiveRange] = useState<'7' | '30' | 'month'>('7');
  const [selectedRestockItem, setSelectedRestockItem] = useState<string | null>(null);
  const [restockAmount, setRestockAmount] = useState('10');
  const metrics = dashboardMetrics?.metrics;
  const salesOverview = dashboardMetrics?.salesOverview;
  const dailySales = dashboardMetrics?.dailySales;
  const kpis = salesOverview?.kpis;
  const totalSales = metrics?.totalSales ?? 0;
  const totalOrders = metrics?.totalOrders ?? 0;
  const activeProducts = metrics?.activeProducts ?? 0;
  const totalCustomers = metrics?.totalCustomers ?? 0;
  const deliveryRate = kpis?.deliveryRate === null || kpis?.deliveryRate === undefined
    ? '—'
    : `${kpis.deliveryRate}%`;
  const averageOrderValue = kpis?.averageOrderValue;
  const conversionRate = kpis?.conversionRate;
  const fulfillmentVelocityHours = kpis?.fulfillmentVelocityHours;
  const attention = dashboardMetrics?.needsAttention;
  const lowStockCount = attention?.lowStockVariants ?? 0;
  const stockoutCount = attention?.outOfStockVariants ?? 0;
  const daysData = (salesOverview?.chartData ?? []).map((item) => ({
    ...item,
    total: item.dhakaSales + item.nationalSales + item.unclassifiedSales,
  }));
  const hasSalesData = totalSales > 0;
  const peakPoint = salesOverview?.peakPoint;
  const maxDayTotal = Math.max(...daysData.map((day) => day.total), 1);
  const xCoords = daysData.map((_, index) =>
    daysData.length > 1 ? 83 + (540 * index) / (daysData.length - 1) : 353,
  );
  const barWidth = Math.min(12, 160 / Math.max(daysData.length, 1));
  const recentOrdersList = dashboardMetrics?.recentOrders ?? [];
  const lowStockList = dashboardMetrics?.lowStockProducts ?? [];
  const topSellingProducts = dashboardMetrics?.topSellingProducts ?? [];
  const maxDailySales = Math.max(
    ...(dailySales?.lastSevenDays.map((day) => day.total) ?? [0]),
    1,
  );

  const handleRangeChange = (range: '7' | '30' | 'month') => {
    setActiveRange(range);
    void refreshDashboard(range);
  };

  const [isRestocking, setIsRestocking] = useState(false);

  const handleRestock = async (idOrSku: string) => {
    const item = inventory.find((i) => i.id === idOrSku || i.sku === idOrSku);
    const addCount = parseInt(restockAmount, 10) || 10;
    if (!item || isRestocking) return;
    setIsRestocking(true);
    try {
      const success = await updateInventoryStock(
        item.id,
        item.stock + addCount,
        'RESTOCK',
        'Dashboard Loom Requisition',
      );
      if (success) {
        setSelectedRestockItem(null);
      }
    } finally {
      setIsRestocking(false);
    }
  };

  const handleExport = () => {
    const headers = ['Metric', 'Value'];
    const rows: Array<[string, string | number]> = [
      ['Selected Period', activeRange === 'month' ? 'This Month' : `Last ${activeRange} Days`],
      ['Total Sales (BDT)', totalSales],
      ['Total Orders', totalOrders],
      ['Active Products', activeProducts],
      ['Total Customers', totalCustomers],
      ['Average Order Value (BDT)', averageOrderValue ?? 'Unavailable'],
      ['Delivery Rate', deliveryRate],
      ['Conversion Rate', conversionRate ?? 'Analytics data unavailable'],
      ['Fulfillment Velocity (hours)', fulfillmentVelocityHours ?? 'Unavailable'],
      ['Pending Orders', attention?.pendingOrders ?? 0],
      ['Low Stock Variants', lowStockCount],
      ['Out of Stock Variants', stockoutCount],
      ['Pending Reviews', attention?.pendingReviews ?? 0],
      ['Failed Payments', attention?.failedPayments ?? 0],
    ];
    const toCsvCell = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`;
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers, ...rows].map((row) => row.map(toCsvCell).join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `rongin_libas_performance_${new Date().toISOString().split('T')[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading || dashboardLoading) {
    return <DashboardSkeleton />;
  }

  if (dashboardError || !dashboardMetrics) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="border border-[#deddd3] bg-white p-8 text-center">
          <AlertTriangle className="w-8 h-8 mx-auto mb-3 text-[#ba1a1a]" />
          <h1 className="font-serif text-xl text-[#1b1c18]">Dashboard data unavailable</h1>
          <p className="mt-2 text-sm text-[#717975]">
            {dashboardError || 'The dashboard did not return current data.'}
          </p>
          <button
            onClick={() => void refreshDashboard(activeRange)}
            className="mt-5 inline-flex items-center gap-2 bg-[#073a2d] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0d4d3b]"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Page Title & Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#deddd3] pb-6">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold tracking-widest uppercase text-[#0d4d3b]">
            <span className="w-2 h-2 rounded-full bg-[#0d4d3b] animate-pulse" />
            <span>ATELIER LIVE OPERATIONS • DHAKA</span>
          </div>
          <h1 className="text-3xl font-serif font-normal text-[#1b1c18] mt-1 tracking-tight">
            Bespoke Performance Ledger
          </h1>
          <p className="text-xs text-[#69726d] mt-1">
            Sartorial dispatch overview, inventory velocity, and digital boutique metrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => void refreshDashboard(activeRange)}
            className="flex items-center gap-2 px-4 py-2.5 border border-[#deddd3] text-xs font-semibold uppercase tracking-wider text-[#073a2d] hover:border-[#073a2d] transition-colors"
            title="Refresh dashboard data"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 border border-[#073a2d] text-xs font-semibold uppercase tracking-wider text-[#073a2d] hover:bg-[#073a2d] hover:text-white transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Ledger</span>
          </button>
          <Link
            href="/products/add"
            className="flex items-center gap-2 px-5 py-2.5 bg-[#073a2d] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#0d4d3b] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Consignment</span>
          </Link>
        </div>
      </div>

      <section className="bg-white border border-[#deddd3] p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 border-b border-[#deddd3] pb-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#717975]">
              BANGLADESH TIME · NON-CANCELLED ORDERS
            </p>
            <h2 className="text-xl font-serif text-[#1b1c18]">Daily Sales</h2>
            <p className="text-xs text-[#717975]">
              Today, yesterday, and each day in the last 7 days.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="min-w-36 border border-[#deddd3] bg-[#fbf9f2] px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#717975]">TODAY</p>
              <p className="mt-1 font-serif text-xl font-semibold text-[#073a2d]">
                {dailySales ? `৳${dailySales.today.total.toLocaleString()}` : '—'}
              </p>
              <p className="text-[11px] text-[#717975]">
                {dailySales ? `${dailySales.today.orderCount} orders` : 'Data unavailable'}
              </p>
            </div>
            <div className="min-w-36 border border-[#deddd3] bg-[#fbf9f2] px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#717975]">YESTERDAY</p>
              <p className="mt-1 font-serif text-xl font-semibold text-[#1b1c18]">
                {dailySales ? `৳${dailySales.yesterday.total.toLocaleString()}` : '—'}
              </p>
              <p className="text-[11px] text-[#717975]">
                {dailySales ? `${dailySales.yesterday.orderCount} orders` : 'Data unavailable'}
              </p>
            </div>
          </div>
        </div>

        {!dailySales ? (
          <p className="text-center text-xs text-[#ba1a1a]">
            Daily sales data is missing from the dashboard API. Restart/update the server and refresh.
          </p>
        ) : dailySales.lastSevenDays.every((day) => day.total === 0) ? (
          <p className="text-center text-xs text-[#717975]">
            No sales in the last 7 days. The graph below shows each day with zero sales.
          </p>
        ) : null}
        <div
          className="grid h-52 grid-cols-7 items-end gap-2 sm:gap-4"
          role="img"
          aria-label="Daily sales for the last seven days, including today"
        >
          {(dailySales?.lastSevenDays ?? []).map((day) => {
            const height = day.total > 0 ? Math.max((day.total / maxDailySales) * 100, 3) : 0;
            const isToday = day.date === dailySales?.today.date;
            return (
              <div
                key={day.date}
                className="flex h-full min-w-0 flex-col items-center justify-end gap-2"
                title={`${day.date}: ৳${day.total.toLocaleString()} from ${day.orderCount} orders`}
              >
                <span className="truncate text-[10px] font-semibold text-[#404945] sm:text-xs">
                  ৳{day.total.toLocaleString()}
                </span>
                <div
                  className="flex h-32 w-full items-end border-b border-[#deddd3]"
                  style={{
                    backgroundImage:
                      'linear-gradient(to top, transparent 24%, #deddd3 25%, transparent 26%, transparent 49%, #deddd3 50%, transparent 51%, transparent 74%, #deddd3 75%, transparent 76%)',
                  }}
                >
                  <div
                    className={`w-full transition-all ${isToday ? 'bg-[#073a2d]' : 'bg-[#c79a45]'} ${day.total ? '' : 'opacity-25'}`}
                    style={{ height: `${Math.max(height, 2)}%` }}
                  />
                </div>
                <span className={`text-[10px] sm:text-xs ${isToday ? 'font-bold text-[#073a2d]' : 'text-[#717975]'}`}>
                  {isToday ? 'Today' : day.day}
                </span>
                <span className="text-[9px] text-[#717975]">{day.date.slice(5)}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Top 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Sales */}
        <div className="bg-white border border-[#deddd3] p-5 shadow-xs relative overflow-hidden group hover:border-[#c79a45] transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#717975]">
                TOTAL SALES
              </p>
              <h3 className="text-2xl font-serif font-medium text-[#1b1c18] mt-2">
                ৳{totalSales.toLocaleString()}
              </h3>
            </div>
            <div className="w-9 h-9 bg-[#fbf9f2] border border-[#deddd3] flex items-center justify-center text-[#073a2d]">
              <Banknote className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 text-[11px] text-[#717975]">
            Selected period · excludes cancelled orders
          </div>
          <div className="mt-4 pt-3 border-t border-[#f0eee7] flex items-center justify-between text-[11px] text-[#69726d]">
            <span>Order totals including delivery charges</span>
            <Banknote className="w-3 h-3 text-[#c79a45]" />
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white border border-[#deddd3] p-5 shadow-xs relative overflow-hidden group hover:border-[#c79a45] transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#717975]">
                TOTAL ORDERS
              </p>
              <h3 className="text-2xl font-serif font-medium text-[#1b1c18] mt-2">
                {totalOrders}
              </h3>
            </div>
            <div className="w-9 h-9 bg-[#fbf9f2] border border-[#deddd3] flex items-center justify-center text-[#073a2d]">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 text-[11px] text-[#717975]">
            Orders placed in the selected period
          </div>
          <div className="mt-4 pt-3 border-t border-[#f0eee7] flex items-center justify-between text-[11px] text-[#69726d]">
            <span>Cancelled orders excluded</span>
            <ShoppingBag className="w-3 h-3 text-[#073a2d]" />
          </div>
        </div>

        {/* Active Products */}
        <div className="bg-white border border-[#deddd3] p-5 shadow-xs relative overflow-hidden group hover:border-[#c79a45] transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#717975]">
                ACTIVE PRODUCTS
              </p>
              <h3 className="text-2xl font-serif font-medium text-[#1b1c18] mt-2">
                {activeProducts}
              </h3>
            </div>
            <div className="w-9 h-9 bg-[#fbf9f2] border border-[#deddd3] flex items-center justify-center text-[#073a2d]">
              <Shirt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="inline-flex items-center text-[11px] font-semibold text-[#073a2d] bg-[#bcedda]/50 px-1.5 py-0.5">
              Current active listings
            </span>
          </div>
          <div className="mt-4 pt-3 border-t border-[#f0eee7] flex items-center justify-between text-[11px] text-[#69726d]">
            <span>Current catalog snapshot</span>
            <Shirt className="w-3 h-3 text-[#c79a45]" />
          </div>
        </div>

        {/* Total Customers */}
        <div className="bg-white border border-[#deddd3] p-5 shadow-xs relative overflow-hidden group hover:border-[#c79a45] transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#717975]">
                TOTAL CUSTOMERS
              </p>
              <h3 className="text-2xl font-serif font-medium text-[#1b1c18] mt-2">
                {totalCustomers}
              </h3>
            </div>
            <div className="w-9 h-9 bg-[#fbf9f2] border border-[#deddd3] flex items-center justify-center text-[#073a2d]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="inline-flex items-center text-[11px] font-semibold text-[#0d4d3b] bg-[#b0ecd3]/40 px-1.5 py-0.5">
              All registered customer accounts
            </span>
          </div>
          <div className="mt-4 pt-3 border-t border-[#f0eee7] flex items-center justify-between text-[11px] text-[#69726d]">
            <span>Current customer snapshot</span>
            <Users className="w-3 h-3 text-[#c79a45]" />
          </div>
        </div>
      </div>

      {/* Sales Overview / Revenue Architecture Chart */}
      <div className="bg-white border border-[#deddd3] p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#717975]">
              REVENUE ARCHITECTURE
            </span>
            <h2 className="text-xl font-serif text-[#1b1c18]">Sales Overview</h2>
          </div>

          <div className="flex items-center gap-1 bg-[#f0eee7] p-1 border border-[#deddd3]">
            <button
              onClick={() => handleRangeChange('7')}
              className={`px-3 py-1 text-xs font-semibold tracking-wider uppercase transition-colors ${
                activeRange === '7'
                  ? 'bg-[#00231a] text-white'
                  : 'text-[#404945] hover:text-[#1b1c18]'
              }`}
            >
              LAST 7 DAYS
            </button>
            <button
              onClick={() => handleRangeChange('30')}
              className={`px-3 py-1 text-xs font-semibold tracking-wider uppercase transition-colors ${
                activeRange === '30'
                  ? 'bg-[#00231a] text-white'
                  : 'text-[#404945] hover:text-[#1b1c18]'
              }`}
            >
              LAST 30 DAYS
            </button>
            <button
              onClick={() => handleRangeChange('month')}
              className={`px-3 py-1 text-xs font-semibold tracking-wider uppercase transition-colors ${
                activeRange === 'month'
                  ? 'bg-[#00231a] text-white'
                  : 'text-[#404945] hover:text-[#1b1c18]'
              }`}
            >
              THIS MONTH
            </button>
          </div>
        </div>

        {/* Legend bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-[#404945] border-b border-[#f0eee7] pb-3">
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1b1c18]" />
              <span className="font-medium">Dhaka Division</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#c79a45]" />
              <span className="font-medium">Other divisions</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#a8aaa4]" />
              <span className="font-medium">Unclassified location</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[#8c6722] bg-[#f5eedf] px-2.5 py-1 text-[11px] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#c79a45]" />
            <span>
              {peakPoint?.label || 'No sales data available'}
            </span>
          </div>
        </div>

        {/* SVG Chart */}
        <div className="relative pt-6 pb-2">
          {!hasSalesData ? (
            <div className="h-64 w-full flex flex-col items-center justify-center border border-dashed border-[#deddd3] bg-[#fbf9f2]/70 text-center p-6">
              <TrendingUp className="w-8 h-8 text-[#717975] mb-2 opacity-30" />
              <p className="font-serif text-sm font-medium text-[#1b1c18]">No sales data available</p>
            </div>
          ) : (
            <div className="h-64 w-full relative">
              <svg
                className="w-full h-full overflow-visible"
                viewBox="0 0 700 220"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#073a2d" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#073a2d" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#c79a45" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#c79a45" stopOpacity="0.05" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                <line x1="40" y1="30" x2="680" y2="30" stroke="#deddd3" strokeDasharray="3 3" />
                <line x1="40" y1="80" x2="680" y2="80" stroke="#deddd3" strokeDasharray="3 3" />
                <line x1="40" y1="130" x2="680" y2="130" stroke="#deddd3" strokeDasharray="3 3" />
                <line x1="40" y1="180" x2="680" y2="180" stroke="#deddd3" strokeDasharray="3 3" />

                {/* Axis labels */}
                <text x="10" y="35" fontSize="10" fill="#717975" fontFamily="Plus Jakarta Sans">{formatAxisCurrency(maxDayTotal)}</text>
                <text x="10" y="85" fontSize="10" fill="#717975" fontFamily="Plus Jakarta Sans">{formatAxisCurrency(maxDayTotal * 0.66)}</text>
                <text x="10" y="135" fontSize="10" fill="#717975" fontFamily="Plus Jakarta Sans">{formatAxisCurrency(maxDayTotal * 0.33)}</text>
                <text x="10" y="185" fontSize="10" fill="#717975" fontFamily="Plus Jakarta Sans">৳0</text>

                {/* Gold Bars (National Division) */}
                {daysData.map((day, index) => {
                  const x = xCoords[index];
                  const series = [
                    { key: 'dhaka', amount: day.dhakaSales, color: '#1b1c18' },
                    { key: 'other', amount: day.nationalSales, color: '#c79a45' },
                    { key: 'unknown', amount: day.unclassifiedSales, color: '#a8aaa4' },
                  ];
                  return series.map((item, seriesIndex) => {
                    const height = item.amount
                      ? Math.max(1, Math.round((item.amount / maxDayTotal) * 140))
                      : 0;
                    return (
                      <rect
                        key={`${item.key}-${day.date}`}
                        x={x - barWidth * 1.5 + seriesIndex * barWidth}
                        y={180 - height}
                        width={barWidth}
                        height={height}
                        fill={item.color}
                      >
                        <title>{`${day.date} · ${item.key}: ৳${item.amount.toLocaleString()}`}</title>
                      </rect>
                    );
                  });
                })}

                {/* Spline and Line */}
                {(() => {
                  const pts = daysData.map((d, idx) => ({
                    x: xCoords[idx],
                    y: 180 - Math.round((d.total / maxDayTotal) * 140),
                  }));
                  const pathD = pts.reduce((acc, pt, i) => (i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`), '');
                  const areaD = `${pathD} L ${xCoords[xCoords.length - 1]} 180 L ${xCoords[0]} 180 Z`;

                  return (
                    <>
                      <path d={areaD} fill="url(#salesGrad)" />
                      <path d={pathD} fill="none" stroke="#073a2d" strokeWidth="2.5" />
                      {pts.map((pt, idx) => {
                        const isPeak = peakPoint?.day === daysData[idx].date;
                        return (
                          <circle
                            key={`pt-${idx}`}
                            cx={pt.x}
                            cy={pt.y}
                            r={isPeak ? 5.5 : 3.5}
                            fill={isPeak ? '#c79a45' : '#073a2d'}
                          />
                        );
                      })}
                    </>
                  );
                })()}

                {/* Day Labels */}
                {daysData.map((day, idx) => (
                  <text key={`label-${day.date}`} x={xCoords[idx]} y="205" fontSize="11" fill="#717975" textAnchor="middle">
                    {day.day}
                  </text>
                ))}
              </svg>
            </div>
          )}
        </div>

        {/* 4 Metric KPI Pills below chart */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-[#f0eee7]">
          <div className="flex items-center gap-3 bg-[#fbf9f2] p-3.5 border border-[#deddd3]">
            <div className="w-8 h-8 bg-[#f0eee7] flex items-center justify-center text-[#073a2d]">
              <Banknote className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-semibold text-[#717975]">AVG ORDER VALUE</p>
              <p className="text-base font-serif font-bold text-[#1b1c18]">
                {averageOrderValue === null || averageOrderValue === undefined
                  ? '—'
                  : `৳ ${averageOrderValue.toLocaleString()}`}
              </p>
              <p className="text-[10px] text-[#717975]">Sales / non-cancelled orders</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-[#fbf9f2] p-3.5 border border-[#deddd3]">
            <div className="w-8 h-8 bg-[#bcedda]/40 flex items-center justify-center text-[#0d4d3b]">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-semibold text-[#717975]">DELIVERY RATE</p>
              <p className="text-base font-serif font-bold text-[#1b1c18]">
                {deliveryRate}
              </p>
              <p className="text-[10px] text-[#717975]">Delivered / non-cancelled orders</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-[#fbf9f2] p-3.5 border border-[#deddd3]">
            <div className="w-8 h-8 bg-[#b0ecd3]/40 flex items-center justify-center text-[#073a2d]">
              <Sparkles className="w-4 h-4 text-[#c79a45]" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-semibold text-[#717975]">CONVERSION RATE</p>
              <p className="text-base font-serif font-bold text-[#1b1c18]">{conversionRate ?? '—'}</p>
              <p className="text-[10px] text-[#717975]">Analytics data unavailable</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-[#fbf9f2] p-3.5 border border-[#deddd3]">
            <div className="w-8 h-8 bg-[#f5eedf] flex items-center justify-center text-[#8c6722]">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-semibold text-[#717975]">FULFILLMENT VELOCITY</p>
              <p className="text-base font-serif font-bold text-[#1b1c18]">
                {fulfillmentVelocityHours === null || fulfillmentVelocityHours === undefined
                  ? '—'
                  : `${fulfillmentVelocityHours.toLocaleString()} hrs`}
              </p>
              <p className="text-[10px] text-[#717975]">Order placed to delivery event</p>
            </div>
          </div>
        </div>
      </div>

      <section className="bg-white border border-[#deddd3] p-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-[#deddd3] pb-4">
          <div>
            <h2 className="text-base font-serif font-medium text-[#1b1c18]">Needs Attention</h2>
            <p className="text-xs text-[#717975]">Current operational counts from the database</p>
          </div>
          <AlertTriangle className="h-5 w-5 text-[#8c6722]" />
        </div>
        {Object.values(attention ?? {}).every((count) => count === 0) ? (
          <p className="py-6 text-center text-sm text-[#717975]">No pending actions</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-4">
            {[
              { label: 'Pending Orders', count: attention?.pendingOrders ?? 0, href: '/orders', icon: <ShoppingBag className="h-4 w-4" /> },
              { label: 'Low Stock Variants', count: attention?.lowStockVariants ?? 0, href: '/inventory', icon: <AlertTriangle className="h-4 w-4" /> },
              { label: 'Out of Stock Variants', count: attention?.outOfStockVariants ?? 0, href: '/inventory', icon: <Shirt className="h-4 w-4" /> },
              { label: 'Pending Reviews', count: attention?.pendingReviews ?? 0, href: '/reviews', icon: <Sparkles className="h-4 w-4" /> },
              { label: 'Failed Payments', count: attention?.failedPayments ?? 0, href: '/orders', icon: <Banknote className="h-4 w-4" /> },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center justify-between gap-3 border border-[#deddd3] bg-[#fbf9f2] p-3 hover:border-[#c79a45] transition-colors"
              >
                <span className="flex items-center gap-2 text-xs font-medium text-[#404945]">
                  {item.icon}
                  {item.label}
                </span>
                <span className="font-serif text-lg font-semibold text-[#1b1c18]">{item.count}</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 2-Column Section: Recent Orders & Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Recent Orders (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-[#deddd3] p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#deddd3]">
              <div>
                <h3 className="text-base font-serif font-medium text-[#1b1c18]">Recent Orders</h3>
                <p className="text-xs text-[#717975]">Orders created in the selected period</p>
              </div>
              <span className="text-[10px] font-bold tracking-widest text-[#0d4d3b] bg-[#bcedda]/50 px-2 py-0.5 uppercase">
                LIVE STREAM
              </span>
            </div>

            {/* Table */}
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-[#deddd3] text-[#717975] uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 font-semibold">ORDER ID</th>
                    <th className="py-2.5 font-semibold">CUSTOMER</th>
                    <th className="py-2.5 font-semibold">AMOUNT</th>
                    <th className="py-2.5 font-semibold">STATUS</th>
                    <th className="py-2.5 font-semibold">DATE</th>
                    <th className="py-2.5 font-semibold text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0eee7]">
                  {recentOrdersList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-[#717975]">
                        <ShoppingBag className="w-6 h-6 mx-auto mb-1.5 opacity-40 text-[#717975]" />
                        <p className="font-serif text-sm text-[#1b1c18]">No recent orders</p>
                      </td>
                    </tr>
                  ) : (
                    recentOrdersList.map((order) => {
                      const statusColor =
                        ORDER_STATUS_COLORS[order.status] || 'bg-[#e4e2dc] text-[#404945]';

                      return (
                        <tr key={order.id} className="hover:bg-[#fbf9f2] transition-colors">
                          <td className="py-3 font-semibold text-[#073a2d]">{order.orderNumber}</td>
                          <td className="py-3">
                            <span className="font-medium text-[#1b1c18]">{order.customerName}</span>
                            <span className="text-[11px] text-[#717975] block">
                              {order.customerLocation}
                            </span>
                          </td>
                          <td className="py-3 font-medium">
                            ৳{Number(order.amount || 0).toLocaleString()}
                            <span className="text-[10px] text-[#717975] block uppercase font-mono">
                              {order.paymentMethod}
                            </span>
                          </td>
                          <td className="py-3">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase ${statusColor}`}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-current" />
                              {order.status}
                            </span>
                          </td>
                          <td className="py-3 text-[#69726d]">
                            {new Date(order.createdAt).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </td>
                          <td className="py-3 text-right">
                            <Link
                              href={`/orders?orderId=${encodeURIComponent(order.id)}`}
                              className="p-1.5 text-[#717975] hover:text-[#073a2d] inline-block"
                              title="View order details"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-[#f0eee7] flex items-center justify-between text-xs text-[#717975]">
            <span>Showing {recentOrdersList.length} of {totalOrders} orders in this period</span>
            <Link
              href="/orders"
              className="text-[#073a2d] font-semibold hover:underline flex items-center gap-1"
            >
              <span>VIEW ALL ORDERS</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Right: Low Stock Products (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-[#deddd3] p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#deddd3]">
              <div>
                <h3 className="text-base font-serif font-medium text-[#1b1c18]">Low Stock Variants</h3>
                <p className="text-xs text-[#717975]">Active variants below their product stock threshold</p>
              </div>
              <div className="w-7 h-7 bg-[#ffdad6]/60 text-[#ba1a1a] flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {lowStockList.length === 0 ? (
                <div className="p-8 text-center border border-[#deddd3] bg-[#fbf9f2]">
                  <CheckCircle2 className="w-6 h-6 mx-auto mb-1.5 text-[#0d4d3b]" />
                  <p className="font-serif text-sm text-[#1b1c18]">No low-stock variants</p>
                </div>
              ) : (
                lowStockList.map((item, idx) => (
                  <div
                    key={item.variantId || item.sku || item.id || idx}
                    className="flex items-center justify-between p-2.5 border border-[#deddd3] bg-[#fbf9f2] hover:border-[#c79a45] transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 bg-[#073a2d] text-white flex items-center justify-center shrink-0">
                        <Shirt className="w-5 h-5 text-[#bcedda]" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-[#1b1c18] line-clamp-1">{item.name}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {item.sku && (
                            <span className="text-[10px] font-mono text-[#717975]">{item.sku}</span>
                          )}
                          <span className="text-[11px] text-[#717975]">• Stock: {item.stock}</span>
                          <span
                            className={`text-[9px] px-1 py-0.2 font-semibold uppercase ${
                              item.stock === 0 || item.status === 'Out of Stock'
                                ? 'bg-[#ffdad6] text-[#ba1a1a]'
                                : 'bg-[#f5eedf] text-[#8c6722]'
                            }`}
                          >
                            {item.status || (item.stock === 0 ? 'Out of Stock' : 'Low Stock')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedRestockItem(item.variantId || item.id || item.sku)}
                      className="px-2.5 py-1.5 bg-[#00231a] hover:bg-[#073a2d] text-white text-[10px] font-semibold tracking-wider uppercase transition-colors shrink-0"
                    >
                      + RESTOCK
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-[#f0eee7] flex items-center justify-between text-xs text-[#717975]">
            <span>
              {lowStockCount} low-stock · {stockoutCount} out of stock variants
            </span>
            <Link
              href="/inventory"
              className="text-[#073a2d] font-semibold hover:underline flex items-center gap-1 text-[11px]"
            >
              <span>OPEN INVENTORY MANAGER</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      <section className="bg-white border border-[#deddd3] p-6 shadow-xs">
        <div className="border-b border-[#deddd3] pb-4">
          <h2 className="text-base font-serif font-medium text-[#1b1c18]">Top Selling Products</h2>
          <p className="text-xs text-[#717975]">
            Units and item revenue for non-cancelled orders in the selected period
          </p>
        </div>
        {topSellingProducts.length === 0 ? (
          <p className="py-8 text-center text-sm text-[#717975]">No top-selling products</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="mt-3 w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#deddd3] text-[10px] uppercase tracking-wider text-[#717975]">
                  <th className="py-2.5 font-semibold">Product</th>
                  <th className="py-2.5 font-semibold">SKU</th>
                  <th className="py-2.5 font-semibold text-right">Units Sold</th>
                  <th className="py-2.5 font-semibold text-right">Item Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0eee7]">
                {topSellingProducts.map((product) => (
                  <tr key={`${product.productId}-${product.sku}`} className="hover:bg-[#fbf9f2]">
                    <td className="py-3 font-medium text-[#1b1c18]">{product.name}</td>
                    <td className="py-3 font-mono text-[#717975]">{product.sku}</td>
                    <td className="py-3 text-right text-[#404945]">{product.unitsSold}</td>
                    <td className="py-3 text-right font-semibold text-[#073a2d]">
                      ৳{product.revenue.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-2 text-[10px] text-[#717975]">
              Item revenue excludes delivery and order-level coupon discounts.
            </p>
          </div>
        )}
      </section>

      {/* Restock Modal */}
      {selectedRestockItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white border border-[#deddd3] shadow-2xl p-6 w-full max-w-sm">
            <h3 className="font-serif text-lg font-bold text-[#073a2d]">Atelier Loom Requisition</h3>
            <p className="text-xs text-[#69726d] mt-1">
              Specify quantity to replenish in the live atelier ledger:
            </p>
            <div className="mt-4">
              <label className="text-xs font-bold uppercase tracking-wider text-[#717975]">
                Units to Restock
              </label>
              <input
                type="number"
                value={restockAmount}
                onChange={(e) => setRestockAmount(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-[#deddd3] text-sm text-[#1b1c18] focus:border-[#073a2d] outline-hidden"
              />
            </div>
            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                disabled={isRestocking}
                onClick={() => !isRestocking && setSelectedRestockItem(null)}
                className="px-4 py-2 border border-[#deddd3] text-xs font-medium text-[#717975] hover:bg-[#f0eee7] transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isRestocking}
                aria-busy={isRestocking}
                onClick={() => handleRestock(selectedRestockItem)}
                className="px-4 py-2 bg-[#073a2d] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#0d4d3b] transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                {isRestocking ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Restocking...</span>
                  </>
                ) : (
                  <span>Confirm Restock</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Master Loom Synchronization Footer Bar */}
      <div className="p-4 bg-white border border-[#deddd3] flex flex-col sm:flex-row items-center justify-between text-xs text-[#717975] gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#0d4d3b]" />
          <span>Rongin Libas Atelier Suite • Dashboard metrics synchronized from the database</span>
        </div>
        <div className="flex items-center gap-4 text-[11px] uppercase tracking-wider">
          <span>DHAKA CENTRAL HUB</span>
          <span>•</span>
          <span className="text-[#073a2d] font-semibold">ENCRYPTED LEDGER</span>
        </div>
      </div>
    </div>
  );
}
