'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  Clock,
  Eye,
  Filter,
  Globe,
  Layers,
  LineChart,
  PieChart,
  RefreshCw,
  Search,
  Shield,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  Laptop,
  Sparkles,
  Tag,
  TrendingDown,
  TrendingUp,
  User,
  Users,
  X,
  AlertTriangle,
  Calendar,
  ExternalLink,
  Compass,
  MousePointerClick,
  FileText,
  Monitor,
} from 'lucide-react';
import {
  adminApi,
  AnalyticsOverviewResponse,
  AnalyticsRealtimeResponse,
  AnalyticsProductsResponse,
  AnalyticsFunnelResponse,
  CustomerActivityResponse,
  AnalyticsTrafficResponse,
  AnalyticsCartsResponse,
  AnalyticsTopPagesResponse,
  AnalyticsSearchesResponse,
  AnalyticsDevicesResponse,
} from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { TablePageSkeleton } from '@/components/common/Skeleton';

type AnalyticsPeriod = 'today' | '7d' | '30d' | '90d' | 'all';
type AnalyticsTab =
  | 'overview'
  | 'traffic'
  | 'products'
  | 'funnel'
  | 'carts'
  | 'customers'
  | 'technical'
  | 'realtime'
  | 'retention';

export default function AnalyticsPage() {
  return (
    <PermissionGuard
      permission={['reports', 'dashboard', 'orders']}
      moduleName="User Analytics & Live Tracking"
    >
      <AnalyticsDashboard />
    </PermissionGuard>
  );
}

function AnalyticsDashboard() {
  const { toast } = useToast();
  const [period, setPeriod] = useState<AnalyticsPeriod>('30d');
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefreshRealtime, setAutoRefreshRealtime] = useState(false);

  // Data states
  const [overview, setOverview] = useState<AnalyticsOverviewResponse | null>(null);
  const [realtime, setRealtime] = useState<AnalyticsRealtimeResponse | null>(null);
  const [productsData, setProductsData] = useState<AnalyticsProductsResponse | null>(null);
  const [funnelData, setFunnelData] = useState<AnalyticsFunnelResponse | null>(null);
  const [trafficData, setTrafficData] = useState<AnalyticsTrafficResponse | null>(null);
  const [cartsData, setCartsData] = useState<AnalyticsCartsResponse | null>(null);
  const [searchesData, setSearchesData] = useState<AnalyticsSearchesResponse | null>(null);
  const [devicesData, setDevicesData] = useState<AnalyticsDevicesResponse | null>(null);
  const [topPagesData, setTopPagesData] = useState<AnalyticsTopPagesResponse | null>(null);

  // Customer journey states
  const [customerSearchId, setCustomerSearchId] = useState('');
  const [customerActivity, setCustomerActivity] = useState<CustomerActivityResponse | null>(null);
  const [isCustomerLoading, setIsCustomerLoading] = useState(false);

  // Retention cleanup states
  const [retentionDays, setRetentionDays] = useState(180);
  const [isPurging, setIsPurging] = useState(false);
  const [purgeResult, setPurgeResult] = useState<{ purgedEvents: number; purgedSessions: number } | null>(null);

  const loadAllAnalytics = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [ov, rt, prod, fun, traf, cart, srch, dev, topP] = await Promise.all([
        adminApi.analytics.getOverview({ period }).catch(() => null),
        adminApi.analytics.getRealtime().catch(() => null),
        adminApi.analytics.getProducts({ period }).catch(() => null),
        adminApi.analytics.getFunnel({ period }).catch(() => null),
        adminApi.analytics.getTraffic({ period }).catch(() => null),
        adminApi.analytics.getCarts({ period }).catch(() => null),
        adminApi.analytics.getSearches({ period }).catch(() => null),
        adminApi.analytics.getDevices({ period }).catch(() => null),
        adminApi.analytics.getTopPages({ period }).catch(() => null),
      ]);

      if (ov?.data) setOverview(ov.data);
      if (rt?.data) setRealtime(rt.data);
      if (prod?.data) setProductsData(prod.data);
      if (fun?.data) setFunnelData(fun.data);
      if (traf?.data) setTrafficData(traf.data);
      if (cart?.data) setCartsData(cart.data);
      if (srch?.data) setSearchesData(srch.data);
      if (dev?.data) setDevicesData(dev.data);
      if (topP?.data) setTopPagesData(topP.data);
    } catch {
      toast.error('Could not refresh all analytics metrics');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [period, toast]);

  useEffect(() => {
    void loadAllAnalytics();
  }, [loadAllAnalytics]);

  // Real-time polling when toggle is active
  useEffect(() => {
    if (!autoRefreshRealtime || activeTab !== 'realtime') return;
    const interval = setInterval(() => {
      adminApi.analytics
        .getRealtime()
        .then((rt) => {
          if (rt?.data) setRealtime(rt.data);
        })
        .catch(() => {});
    }, 12000);
    return () => clearInterval(interval);
  }, [autoRefreshRealtime, activeTab]);

  const handleLookupCustomer = async (id: string) => {
    if (!id.trim()) {
      toast.error('Please enter a valid Customer ID');
      return;
    }
    setIsCustomerLoading(true);
    try {
      const res = await adminApi.analytics.getCustomerActivity(id.trim());
      if (res?.data) {
        setCustomerActivity(res.data);
        setActiveTab('customers');
        setCustomerSearchId(id);
      } else {
        toast.error('Customer has no recorded tracking events');
      }
    } catch {
      toast.error('Could not find customer activity history');
    } finally {
      setIsCustomerLoading(false);
    }
  };

  const handleRunCleanup = async () => {
    if (!confirm(`Are you sure you want to permanently delete raw tracking events older than ${retentionDays} days?`)) {
      return;
    }
    setIsPurging(true);
    try {
      const res = await adminApi.analytics.cleanupRetention(retentionDays);
      if (res?.data) {
        setPurgeResult(res.data);
        toast.success(`Purged ${res.data.purgedEvents} events and ${res.data.purgedSessions} sessions`);
      }
    } catch {
      toast.error('Retention purge operation failed');
    } finally {
      setIsPurging(false);
    }
  };

  if (isLoading && !overview) {
    return (
      <div className="p-6 space-y-6">
        <TablePageSkeleton />
      </div>
    );
  }

  const metrics = overview?.metrics;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 sm:p-6 border border-[#deddd3] shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-serif text-xl sm:text-2xl font-bold text-[#073a2d] tracking-wide">
              Patron & Storefront Analytics
            </h1>
            <span className="flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Pulse
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#717975] mt-1">
            Unified telemetry across internal PostgreSQL event store, Google Analytics 4, and Microsoft Clarity.
          </p>
        </div>

        {/* Date Filter & Refresh */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center bg-[#f5f4ed] border border-[#deddd3] p-0.5 text-xs">
            {(['today', '7d', '30d', '90d', 'all'] as AnalyticsPeriod[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 font-medium transition-colors cursor-pointer ${
                  period === p
                    ? 'bg-[#073a2d] text-white shadow-xs'
                    : 'text-[#1b1c18] hover:text-[#073a2d]'
                }`}
              >
                {p === 'today'
                  ? 'Today'
                  : p === '7d'
                  ? '7 Days'
                  : p === '30d'
                  ? '30 Days'
                  : p === '90d'
                  ? '90 Days'
                  : 'All Time'}
              </button>
            ))}
          </div>

          <button
            onClick={() => void loadAllAnalytics()}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#073a2d] bg-white border border-[#deddd3] hover:bg-[#f5f4ed] transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh All"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Cards */}
      {metrics && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <div className="bg-white p-4 border border-[#deddd3] shadow-xs">
            <span className="text-[11px] font-medium text-[#717975] uppercase tracking-wider block">
              Unique Visitors
            </span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="font-serif text-xl sm:text-2xl font-bold text-[#073a2d]">
                {metrics.uniqueVisitors.toLocaleString()}
              </span>
              <Users className="w-4 h-4 text-[#717975]" />
            </div>
            <span className="text-[10px] text-[#717975] mt-1 block">
              {metrics.totalSessions} total sessions
            </span>
          </div>

          <div className="bg-white p-4 border border-[#deddd3] shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-[#717975] uppercase tracking-wider block">
                Live Active
              </span>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
            </div>
            <div className="flex items-baseline justify-between mt-2">
              <span className="font-serif text-xl sm:text-2xl font-bold text-emerald-700">
                {metrics.activeSessions}
              </span>
              <Activity className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="text-[10px] text-emerald-700 font-medium mt-1 block">
              Active in last 30m
            </span>
          </div>

          <div className="bg-white p-4 border border-[#deddd3] shadow-xs">
            <span className="text-[11px] font-medium text-[#717975] uppercase tracking-wider block">
              Product Views
            </span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="font-serif text-xl sm:text-2xl font-bold text-[#073a2d]">
                {metrics.productViews.toLocaleString()}
              </span>
              <Eye className="w-4 h-4 text-[#717975]" />
            </div>
            <span className="text-[10px] text-[#717975] mt-1 block">
              {metrics.pageViews.toLocaleString()} total pageviews
            </span>
          </div>

          <div className="bg-white p-4 border border-[#deddd3] shadow-xs">
            <span className="text-[11px] font-medium text-[#717975] uppercase tracking-wider block">
              Cart Additions
            </span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="font-serif text-xl sm:text-2xl font-bold text-[#073a2d]">
                {metrics.cartAdditions.toLocaleString()}
              </span>
              <ShoppingCart className="w-4 h-4 text-[#717975]" />
            </div>
            <span className="text-[10px] text-[#717975] mt-1 block">
              {metrics.checkoutInitiations} began checkout
            </span>
          </div>

          <div className="bg-white p-4 border border-[#deddd3] shadow-xs">
            <span className="text-[11px] font-medium text-[#717975] uppercase tracking-wider block">
              Conversion Rate
            </span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="font-serif text-xl sm:text-2xl font-bold text-[#c79a45]">
                {metrics.conversionRate}%
              </span>
              <TrendingUp className="w-4 h-4 text-[#c79a45]" />
            </div>
            <span className="text-[10px] text-[#717975] mt-1 block">
              {metrics.confirmedPurchases} orders placed
            </span>
          </div>

          <div className="bg-white p-4 border border-[#deddd3] shadow-xs">
            <span className="text-[11px] font-medium text-[#717975] uppercase tracking-wider block">
              Verified Revenue
            </span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="font-serif text-xl sm:text-2xl font-bold text-[#073a2d]">
                ৳{metrics.revenue.toLocaleString()}
              </span>
              <ShoppingBag className="w-4 h-4 text-[#073a2d]" />
            </div>
            <span className="text-[10px] text-amber-700 font-medium mt-1 block">
              {metrics.cartAbandonment}% cart drop-off
            </span>
          </div>
        </div>
      )}

      {/* Analytics Ecosystem Cards: PostgreSQL vs GA4 vs Clarity */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 border border-[#deddd3] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#073a2d] uppercase tracking-wider">
                Internal PostgreSQL Store
              </span>
              <span className="px-1.5 py-0.5 text-[9px] font-semibold bg-emerald-100 text-emerald-800 rounded-xs">
                Active Source
              </span>
            </div>
            <p className="text-xs text-[#717975] mt-1.5 leading-relaxed">
              Powers the metrics below: verified order revenue, funnel dropoffs, pseudonymous customer sessions, and cart abandonment diagnostics.
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#deddd3] text-[11px] text-[#073a2d] font-medium flex items-center justify-between">
            <span>First-Party Telemetry</span>
            <span className="font-mono text-[10px] text-[#717975]">Table: analytics_events</span>
          </div>
        </div>

        <div className="bg-white p-4 border border-[#deddd3] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#073a2d] uppercase tracking-wider">
                Google Analytics 4
              </span>
              <span className="px-1.5 py-0.5 text-[9px] font-semibold bg-blue-100 text-blue-800 rounded-xs">
                Acquisition & Attribution
              </span>
            </div>
            <p className="text-xs text-[#717975] mt-1.5 leading-relaxed">
              Realtime traffic acquisition, channel attribution, demographic insights, and global e-commerce reporting.
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#deddd3] flex items-center justify-between">
            <span className="text-[11px] font-mono text-[#717975]">Configured via GA4 tag</span>
            <a
              href="https://analytics.google.com"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold text-[#073a2d] hover:text-[#c79a45] inline-flex items-center gap-1 transition-colors"
            >
              Open GA4 Console <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        <div className="bg-white p-4 border border-[#deddd3] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#073a2d] uppercase tracking-wider">
                Microsoft Clarity
              </span>
              <span className="px-1.5 py-0.5 text-[9px] font-semibold bg-purple-100 text-purple-800 rounded-xs">
                UX & Recordings
              </span>
            </div>
            <p className="text-xs text-[#717975] mt-1.5 leading-relaxed">
              Session replays, heatmaps, scroll depth, and friction detection (dead clicks, rage clicks) with customer PII masking.
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#deddd3] flex items-center justify-between">
            <span className="text-[11px] font-mono text-[#717975]">ID: ywwyppipq6</span>
            <a
              href="https://clarity.microsoft.com"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold text-[#073a2d] hover:text-[#c79a45] inline-flex items-center gap-1 transition-colors"
            >
              Open Clarity Studio <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-[#deddd3] bg-white px-4 pt-2 gap-2 sm:gap-4 overflow-x-auto text-xs sm:text-sm">
        {[
          { id: 'overview', label: 'Overview & Trends', icon: BarChart3 },
          { id: 'traffic', label: 'Traffic & Sources', icon: Compass },
          { id: 'products', label: 'Product Intelligence', icon: Tag },
          { id: 'funnel', label: 'Conversion Funnel', icon: Filter },
          { id: 'carts', label: 'Cart Abandonment', icon: ShoppingCart },
          { id: 'customers', label: 'Customer Journey', icon: User },
          { id: 'technical', label: 'Devices & Pages', icon: Monitor },
          { id: 'realtime', label: `Live Atelier (${realtime?.activeCount ?? 0})`, icon: Activity },
          { id: 'retention', label: 'Privacy & Retention', icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AnalyticsTab)}
              className={`flex items-center gap-1.5 py-3 px-2 border-b-2 font-medium whitespace-nowrap transition-colors cursor-pointer ${
                isActive
                  ? 'border-[#073a2d] text-[#073a2d] font-semibold'
                  : 'border-transparent text-[#717975] hover:text-[#1b1c18]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Overview & Trend Chart */}
      {activeTab === 'overview' && overview && (
        <div className="space-y-6">
          <div className="bg-white p-5 sm:p-6 border border-[#deddd3] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#deddd3]">
              <div>
                <h3 className="font-serif text-base sm:text-lg font-bold text-[#073a2d]">
                  Storefront Activity Volume Trends
                </h3>
                <p className="text-xs text-[#717975]">
                  Daily breakdown of page views, product examinations, and cart actions across the selected period.
                </p>
              </div>
            </div>

            {overview.trends.length === 0 ? (
              <div className="p-12 text-center text-[#717975] text-xs">
                No tracking event volume recorded in this time range yet.
              </div>
            ) : (
              <div className="space-y-3 pt-2">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#f5f4ed] text-[#717975] uppercase text-[10px] tracking-wider border-b border-[#deddd3]">
                      <tr>
                        <th className="p-3">Date</th>
                        <th className="p-3">Page Views</th>
                        <th className="p-3">Product Views</th>
                        <th className="p-3">Cart Additions</th>
                        <th className="p-3">View-to-Cart Ratio</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#deddd3]/60">
                      {overview.trends.map((t) => {
                        const ratio =
                          t.productViews > 0
                            ? ((t.cartAdditions / t.productViews) * 100).toFixed(1)
                            : '0.0';
                        return (
                          <tr key={t.date} className="hover:bg-[#faf9f5]">
                            <td className="p-3 font-medium text-[#1b1c18]">{t.date}</td>
                            <td className="p-3 text-[#073a2d] font-semibold">
                              {t.pageViews.toLocaleString()}
                            </td>
                            <td className="p-3 text-[#1b1c18] font-medium">
                              {t.productViews.toLocaleString()}
                            </td>
                            <td className="p-3 text-[#c79a45] font-semibold">
                              {t.cartAdditions.toLocaleString()}
                            </td>
                            <td className="p-3 text-[#717975]">{ratio}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Traffic & Sources */}
      {activeTab === 'traffic' && trafficData && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Referrers */}
            <div className="bg-white p-5 border border-[#deddd3] shadow-xs space-y-4">
              <div>
                <h3 className="font-serif text-base font-bold text-[#073a2d]">
                  Top Referral Sources
                </h3>
                <p className="text-xs text-[#717975]">
                  Channels and websites sending visitors to the atelier.
                </p>
              </div>

              {trafficData.topReferrers.length === 0 ? (
                <p className="text-xs text-[#717975] py-4">No external referral sources recorded.</p>
              ) : (
                <div className="space-y-2.5">
                  {trafficData.topReferrers.map((r) => (
                    <div key={r.referrer} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium text-[#1b1c18]">{r.referrer}</span>
                        <span className="font-mono text-[#717975]">
                          {r.count} sessions ({r.percentage}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-[#f5f4ed] overflow-hidden">
                        <div
                          className="h-full bg-[#073a2d]"
                          style={{ width: `${Math.min(r.percentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Top Landing Pages */}
            <div className="bg-white p-5 border border-[#deddd3] shadow-xs space-y-4">
              <div>
                <h3 className="font-serif text-base font-bold text-[#073a2d]">
                  Top Landing Pages
                </h3>
                <p className="text-xs text-[#717975]">
                  Initial entry points where visitors begin their storefront experience.
                </p>
              </div>

              {trafficData.topLandingPages.length === 0 ? (
                <p className="text-xs text-[#717975] py-4">No landing page data logged.</p>
              ) : (
                <div className="space-y-2.5">
                  {trafficData.topLandingPages.map((lp) => (
                    <div key={lp.path} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-mono text-[#1b1c18] text-[11px] truncate max-w-xs">{lp.path}</span>
                        <span className="font-mono text-[#717975]">
                          {lp.count} visits ({lp.percentage}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-[#f5f4ed] overflow-hidden">
                        <div
                          className="h-full bg-[#c79a45]"
                          style={{ width: `${Math.min(lp.percentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Products */}
      {activeTab === 'products' && productsData && (
        <div className="bg-white border border-[#deddd3] shadow-xs space-y-4 p-5 sm:p-6">
          <div>
            <h3 className="font-serif text-base sm:text-lg font-bold text-[#073a2d]">
              Garment Engagement & Commercial Performance
            </h3>
            <p className="text-xs text-[#717975]">
              Detailed visitor views, size & color preferences, and view-to-order conversion metrics.
            </p>
          </div>

          {productsData.products.length === 0 ? (
            <div className="p-12 text-center text-[#717975] text-xs">
              No product interaction events logged for this timeframe.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#f5f4ed] text-[#717975] uppercase text-[10px] tracking-wider border-b border-[#deddd3]">
                  <tr>
                    <th className="p-3">Garment</th>
                    <th className="p-3">Price</th>
                    <th className="p-3">Views</th>
                    <th className="p-3">Cart Adds</th>
                    <th className="p-3">Purchases</th>
                    <th className="p-3">View-to-Cart</th>
                    <th className="p-3">Popular Sizes</th>
                    <th className="p-3">Popular Colors</th>
                    <th className="p-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#deddd3]/60">
                  {productsData.products.map((p) => (
                    <tr key={p.id} className="hover:bg-[#faf9f5]">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          {p.image ? (
                            <img
                              src={p.image}
                              alt={p.name}
                              className="w-9 h-11 object-cover border border-[#deddd3] shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-11 bg-[#deddd3] flex items-center justify-center shrink-0 text-[#717975]">
                              <Tag className="w-4 h-4" />
                            </div>
                          )}
                          <div>
                            <span className="font-semibold text-[#073a2d] block line-clamp-1">
                              {p.name}
                            </span>
                            <span className="text-[10px] text-[#717975]">
                              {p.category}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 font-semibold text-[#1b1c18]">
                        ৳{p.price.toLocaleString()}
                      </td>
                      <td className="p-3 font-bold text-[#073a2d]">
                        {p.views.toLocaleString()}
                      </td>
                      <td className="p-3 font-medium text-[#1b1c18]">
                        {p.cartAdditions.toLocaleString()}
                      </td>
                      <td className="p-3 font-bold text-[#c79a45]">
                        {p.purchases.toLocaleString()}
                      </td>
                      <td className="p-3 font-medium text-[#717975]">
                        {p.viewToCartRate}%
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {p.topSizes.map((s) => (
                            <span
                              key={s.size}
                              className="px-1.5 py-0.5 bg-[#f5f4ed] border border-[#deddd3] text-[10px] text-[#1b1c18]"
                            >
                              {s.size} ({s.count})
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {p.topColors.map((c) => (
                            <span
                              key={c.color}
                              className="px-1.5 py-0.5 bg-[#f5f4ed] border border-[#deddd3] text-[10px] text-[#1b1c18]"
                            >
                              {c.color}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-3 text-right">
                        {p.isHighInterestLowConversion && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-300">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            High Interest / Low Conversion
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Funnel */}
      {activeTab === 'funnel' && funnelData && (
        <div className="bg-white p-5 sm:p-6 border border-[#deddd3] shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#deddd3]">
            <div>
              <h3 className="font-serif text-base sm:text-lg font-bold text-[#073a2d]">
                E-Commerce Progression Funnel
              </h3>
              <p className="text-xs text-[#717975]">
                Step-by-step visitor progression from discovery to order confirmation.
              </p>
            </div>
            <div className="text-right">
              <span className="text-[11px] uppercase tracking-wider text-[#717975] block">
                Overall Storefront Conversion
              </span>
              <span className="font-serif text-xl sm:text-2xl font-bold text-[#c79a45]">
                {funnelData.overallConversionRate}%
              </span>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            {funnelData.steps.map((step, idx) => {
              const maxCount = Math.max(funnelData.steps[0].count, 1);
              const barWidth = Math.max(Math.round((step.count / maxCount) * 100), 4);
              return (
                <div key={step.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[#1b1c18] flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#073a2d] text-white flex items-center justify-center text-[10px] font-bold">
                        {idx + 1}
                      </span>
                      {step.name}
                    </span>
                    <div className="flex items-center gap-4 text-xs font-mono">
                      <span className="font-bold text-[#073a2d]">
                        {step.count.toLocaleString()}
                      </span>
                      <span className="text-[#717975] w-16 text-right">
                        {step.conversionRate}%
                      </span>
                      {idx > 0 && (
                        <span className="text-rose-600 w-20 text-right font-medium">
                          -{step.dropoffRate}% drop
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="w-full h-6 bg-[#f5f4ed] border border-[#deddd3] relative overflow-hidden">
                    <div
                      className="h-full bg-[#073a2d] transition-all duration-500"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 5: Carts & Abandonment */}
      {activeTab === 'carts' && cartsData && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 border border-[#deddd3] shadow-xs">
              <span className="text-[11px] font-medium text-[#717975] uppercase tracking-wider block">
                Cart Additions
              </span>
              <span className="font-serif text-2xl font-bold text-[#073a2d] block mt-1">
                {cartsData.metrics.cartAdditions}
              </span>
              <span className="text-[10px] text-[#717975]">
                {cartsData.metrics.uniqueCartVisitors} unique shoppers
              </span>
            </div>

            <div className="bg-white p-4 border border-[#deddd3] shadow-xs">
              <span className="text-[11px] font-medium text-[#717975] uppercase tracking-wider block">
                Cart Removals
              </span>
              <span className="font-serif text-2xl font-bold text-rose-700 block mt-1">
                {cartsData.metrics.cartRemovals}
              </span>
              <span className="text-[10px] text-[#717975]">
                Items taken out of bag
              </span>
            </div>

            <div className="bg-white p-4 border border-[#deddd3] shadow-xs">
              <span className="text-[11px] font-medium text-[#717975] uppercase tracking-wider block">
                Cart Abandonment
              </span>
              <span className="font-serif text-2xl font-bold text-amber-700 block mt-1">
                {cartsData.metrics.cartAbandonmentRate}%
              </span>
              <span className="text-[10px] text-[#717975]">
                Add to cart without purchase
              </span>
            </div>

            <div className="bg-white p-4 border border-[#deddd3] shadow-xs">
              <span className="text-[11px] font-medium text-[#717975] uppercase tracking-wider block">
                Checkout Abandonment
              </span>
              <span className="font-serif text-2xl font-bold text-rose-600 block mt-1">
                {cartsData.metrics.checkoutAbandonmentRate}%
              </span>
              <span className="text-[10px] text-[#717975]">
                Began checkout without order
              </span>
            </div>
          </div>

          {/* Top Carted Products */}
          <div className="bg-white p-5 border border-[#deddd3] shadow-xs space-y-4">
            <h3 className="font-serif text-base font-bold text-[#073a2d]">
              Most Frequently Added to Bag
            </h3>
            {cartsData.topCartProducts.length === 0 ? (
              <p className="text-xs text-[#717975] py-4">No cart addition records in this timeframe.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#f5f4ed] text-[#717975] uppercase text-[10px] tracking-wider border-b border-[#deddd3]">
                    <tr>
                      <th className="p-3">Garment</th>
                      <th className="p-3">Price</th>
                      <th className="p-3">Bag Additions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#deddd3]/60">
                    {cartsData.topCartProducts.map((item) => (
                      <tr key={item.productId} className="hover:bg-[#faf9f5]">
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="w-8 h-10 object-cover border border-[#deddd3]" />
                            ) : (
                              <div className="w-8 h-10 bg-[#deddd3] flex items-center justify-center">
                                <ShoppingCart className="w-4 h-4 text-[#717975]" />
                              </div>
                            )}
                            <span className="font-medium text-[#073a2d]">{item.name}</span>
                          </div>
                        </td>
                        <td className="p-3 font-semibold text-[#1b1c18]">৳{item.price.toLocaleString()}</td>
                        <td className="p-3 font-bold text-[#073a2d]">{item.additionsCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 6: Customer Activity & Searches */}
      {activeTab === 'customers' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Search Lookup */}
            <div className="bg-white p-5 border border-[#deddd3] shadow-xs space-y-4">
              <h3 className="font-serif text-base font-bold text-[#073a2d]">
                Customer Journey Timeline
              </h3>
              <p className="text-xs text-[#717975]">
                Look up a patron's chronological actions (views, cart adds, orders).
              </p>

              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Enter Customer ID..."
                  value={customerSearchId}
                  onChange={(e) => setCustomerSearchId(e.target.value)}
                  className="flex-1 px-3 py-2 border border-[#deddd3] text-xs font-mono focus:outline-none focus:border-[#073a2d]"
                />
                <button
                  onClick={() => handleLookupCustomer(customerSearchId)}
                  disabled={isCustomerLoading}
                  className="px-4 py-2 bg-[#073a2d] hover:bg-[#0b4d3c] text-white text-xs font-medium transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Search</span>
                </button>
              </div>
            </div>

            {/* Storefront Search Keywords */}
            <div className="bg-white p-5 border border-[#deddd3] shadow-xs space-y-4">
              <h3 className="font-serif text-base font-bold text-[#073a2d]">
                Top Storefront Search Queries
              </h3>
              <p className="text-xs text-[#717975]">
                Keywords patrons and visitors look for in the atelier search bar.
              </p>

              {!searchesData || searchesData.searches.length === 0 ? (
                <p className="text-xs text-[#717975] py-4">No search queries recorded yet.</p>
              ) : (
                <div className="flex flex-wrap gap-2 pt-1">
                  {searchesData.searches.map((s) => (
                    <span
                      key={s.term}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#f5f4ed] border border-[#deddd3] text-xs font-medium text-[#073a2d]"
                    >
                      <span>{s.term}</span>
                      <span className="text-[10px] bg-white px-1.5 py-0.2 border border-[#deddd3] rounded-xs font-mono text-[#717975]">
                        {s.count}
                      </span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {customerActivity && (
            <div className="bg-white p-5 sm:p-6 border border-[#deddd3] shadow-xs space-y-6">
              {/* Customer Profile Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#deddd3] gap-3">
                <div>
                  <h4 className="font-serif text-lg font-bold text-[#073a2d]">
                    {customerActivity.customer.firstName} {customerActivity.customer.lastName || ''}
                  </h4>
                  <span className="text-xs text-[#717975] font-mono">
                    {customerActivity.customer.email || 'No email'} · {customerActivity.customer.phone || 'No phone'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-[#717975] block">
                    Total Tracked Events
                  </span>
                  <span className="font-serif text-xl font-bold text-[#073a2d]">
                    {customerActivity.totalEvents}
                  </span>
                </div>
              </div>

              {/* Timeline */}
              <div className="space-y-4">
                <h5 className="text-xs font-semibold uppercase tracking-wider text-[#717975]">
                  Chronological Journey
                </h5>

                {customerActivity.timeline.length === 0 ? (
                  <p className="text-xs text-[#717975] py-4">No events found for this customer.</p>
                ) : (
                  <div className="relative border-l border-[#deddd3] ml-3 pl-4 space-y-4">
                    {customerActivity.timeline.map((item) => (
                      <div key={item.id} className="relative group text-xs">
                        <div className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-[#073a2d] border-2 border-white" />
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[#073a2d] uppercase tracking-wide">
                            {item.eventType.replace(/_/g, ' ')}
                          </span>
                          <span className="text-[#717975] text-[10px]">
                            {new Date(item.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <div className="text-[#1b1c18] mt-0.5">
                          Page: <span className="font-mono text-[11px]">{item.pagePath}</span>
                        </div>
                        {item.product && (
                          <div className="text-[#c79a45] font-medium mt-0.5">
                            Garment: {item.product.name}
                          </div>
                        )}
                        {item.properties && Object.keys(item.properties).length > 0 && (
                          <div className="text-[10px] text-[#717975] mt-1 font-mono bg-[#f5f4ed] p-2 border border-[#deddd3] rounded-xs max-w-xl">
                            {JSON.stringify(item.properties)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 7: Technical & Devices */}
      {activeTab === 'technical' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Devices Breakdown */}
            <div className="bg-white p-5 border border-[#deddd3] shadow-xs space-y-4">
              <h3 className="font-serif text-base font-bold text-[#073a2d]">
                Device Breakdown
              </h3>
              <p className="text-xs text-[#717975]">
                Sessions categorized by client viewport and device type.
              </p>

              {!devicesData || devicesData.breakdown.length === 0 ? (
                <p className="text-xs text-[#717975] py-4">No device records available.</p>
              ) : (
                <div className="space-y-3 pt-1">
                  {devicesData.breakdown.map((dev) => (
                    <div key={dev.deviceType} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium text-[#1b1c18] flex items-center gap-1.5">
                          {dev.deviceType === 'Mobile' ? (
                            <Smartphone className="w-3.5 h-3.5 text-[#073a2d]" />
                          ) : (
                            <Laptop className="w-3.5 h-3.5 text-[#073a2d]" />
                          )}
                          {dev.deviceType}
                        </span>
                        <span className="font-mono text-[#717975]">
                          {dev.sessions} sessions ({dev.percentage}%)
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-[#f5f4ed] overflow-hidden">
                        <div
                          className="h-full bg-[#073a2d]"
                          style={{ width: `${Math.min(dev.percentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Most Visited Pages */}
            <div className="bg-white p-5 border border-[#deddd3] shadow-xs space-y-4">
              <h3 className="font-serif text-base font-bold text-[#073a2d]">
                Top Visited Storefront Pages
              </h3>
              <p className="text-xs text-[#717975]">
                Pages ranked by total views and average dwell duration.
              </p>

              {!topPagesData || topPagesData.pages.length === 0 ? (
                <p className="text-xs text-[#717975] py-4">No pageview data logged.</p>
              ) : (
                <div className="space-y-2.5 max-h-80 overflow-y-auto">
                  {topPagesData.pages.slice(0, 10).map((pg) => (
                    <div key={pg.pagePath} className="p-2.5 bg-[#faf9f5] border border-[#deddd3] flex justify-between text-xs">
                      <div>
                        <span className="font-mono text-[11px] font-semibold text-[#073a2d] block">{pg.pagePath}</span>
                        <span className="text-[10px] text-[#717975]">
                          Avg duration: {pg.avgDurationSeconds}s
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-[#1b1c18] block">{pg.views} views</span>
                        <span className="text-[10px] text-[#717975]">{pg.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 8: Real-time Live Visitors */}
      {activeTab === 'realtime' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 border border-[#deddd3] shadow-xs">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
              </span>
              <div>
                <h3 className="font-serif text-base font-bold text-[#073a2d]">
                  Active Storefront Sessions ({realtime?.activeCount ?? 0})
                </h3>
                <p className="text-xs text-[#717975]">
                  Visitors and patrons with active interactions in the past 30 minutes.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs text-[#1b1c18] cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoRefreshRealtime}
                  onChange={(e) => setAutoRefreshRealtime(e.target.checked)}
                  className="accent-[#073a2d]"
                />
                Auto-refresh (12s)
              </label>
              <button
                onClick={() => {
                  adminApi.analytics.getRealtime().then((rt) => {
                    if (rt?.data) setRealtime(rt.data);
                  });
                }}
                className="px-3 py-1.5 bg-[#f5f4ed] hover:bg-[#eae8e1] border border-[#deddd3] text-xs font-medium text-[#073a2d] transition-colors cursor-pointer"
              >
                Refresh Now
              </button>
            </div>
          </div>

          <div className="bg-white border border-[#deddd3] shadow-xs overflow-hidden">
            {!realtime || realtime.activeVisitors.length === 0 ? (
              <div className="p-12 text-center text-[#717975] text-xs">
                No active browsing sessions right now. Active sessions update automatically when visitors navigate the storefront.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#f5f4ed] text-[#717975] uppercase text-[10px] tracking-wider border-b border-[#deddd3]">
                    <tr>
                      <th className="p-3">Visitor / Patron</th>
                      <th className="p-3">Current Location</th>
                      <th className="p-3">Device & Referrer</th>
                      <th className="p-3">Duration</th>
                      <th className="p-3">Recent Garment</th>
                      <th className="p-3">Last Active</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#deddd3]/60">
                    {realtime.activeVisitors.map((v) => (
                      <tr key={v.sessionId} className="hover:bg-[#faf9f5]">
                        <td className="p-3">
                          {v.isCustomer ? (
                            <div>
                              <span className="font-semibold text-[#073a2d] block">
                                {v.customerName || 'Verified Patron'}
                              </span>
                              <span className="text-[10px] text-[#717975]">
                                {v.customerEmail}
                              </span>
                            </div>
                          ) : (
                            <div>
                              <span className="font-medium text-[#717975] flex items-center gap-1">
                                <Globe className="w-3 h-3" />
                                Anonymous Visitor
                              </span>
                              <span className="text-[10px] text-[#a0a8a4] font-mono">
                                {v.visitorToken}
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="p-3 font-mono text-[11px] text-[#1b1c18]">
                          {v.currentPage}
                        </td>
                        <td className="p-3">
                          <span className="text-[#1b1c18] font-medium block">
                            {v.deviceType}
                          </span>
                          <span className="text-[10px] text-[#717975]">
                            {v.referrer}
                          </span>
                        </td>
                        <td className="p-3 text-[#717975]">
                          {Math.floor(v.durationSeconds / 60)}m {v.durationSeconds % 60}s
                        </td>
                        <td className="p-3">
                          {v.recentProduct ? (
                            <span className="font-medium text-[#073a2d]">
                              {v.recentProduct.name}
                            </span>
                          ) : (
                            <span className="text-[#a0a8a4]">—</span>
                          )}
                        </td>
                        <td className="p-3 text-[#717975]">
                          {new Date(v.lastActiveAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}
                        </td>
                        <td className="p-3 text-right">
                          {v.customerId && (
                            <button
                              onClick={() => handleLookupCustomer(v.customerId!)}
                              className="px-2.5 py-1 text-[11px] font-medium text-[#073a2d] bg-[#f5f4ed] hover:bg-[#eae8e1] border border-[#deddd3] transition-colors cursor-pointer"
                            >
                              View Journey
                            </button>
                          )}
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

      {/* Tab 9: Privacy & Retention */}
      {activeTab === 'retention' && (
        <div className="bg-white p-5 sm:p-6 border border-[#deddd3] shadow-xs space-y-6 max-w-3xl">
          <div className="flex items-start gap-3 pb-4 border-b border-[#deddd3]">
            <div className="p-2.5 bg-[#f5f4ed] rounded-full text-[#073a2d]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#073a2d]">
                Privacy Safeguards & Retention Policy
              </h3>
              <p className="text-xs text-[#717975] mt-1 leading-relaxed">
                Rongin Libas adheres to strict privacy and data-minimization standards. We store pseudonymous
                visitor IDs, never store unhashed payment cards or credentials, and provide automated retention
                purging workflows.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-[#f5f4ed] border border-[#deddd3] rounded-xs space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#073a2d]">
                Automated Retention Window
              </h4>
              <p className="text-xs text-[#717975] leading-relaxed">
                Raw browsing events and stale anonymous sessions older than the retention threshold
                are purged to ensure database cleanliness and protect customer privacy.
              </p>

              <div className="flex items-center gap-3 pt-2">
                <label className="text-xs font-medium text-[#1b1c18]">
                  Retention Threshold (Days):
                </label>
                <select
                  value={retentionDays}
                  onChange={(e) => setRetentionDays(Number(e.target.value))}
                  className="px-3 py-1.5 border border-[#deddd3] text-xs bg-white cursor-pointer"
                >
                  <option value={90}>90 Days</option>
                  <option value={180}>180 Days (Recommended)</option>
                  <option value={365}>365 Days (1 Year)</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleRunCleanup}
              disabled={isPurging}
              className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold rounded-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              {isPurging ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Purging Stale Analytics...</span>
                </>
              ) : (
                <span>Execute Retention Purge</span>
              )}
            </button>

            {purgeResult && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>
                  Purge Complete: {purgeResult.purgedEvents} raw events and {purgeResult.purgedSessions} sessions removed.
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
