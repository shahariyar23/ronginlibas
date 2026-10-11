'use client';

import React, { useEffect, useState } from 'react';
import {
  Activity,
  ChevronLeft,
  ChevronRight,
  Clock3,
  RefreshCw,
  Shield,
} from 'lucide-react';
import {
  adminApi,
  type AdminAuditEvent,
  type AdminAuditListResponse,
  type AdminUser,
} from '@/lib/api';

const MODULES = [
  'staff',
  'customers',
  'orders',
  'settings',
  'products',
  'categories',
  'inventory',
  'coupons',
  'reviews',
];

const ACTIONS = [
  'STAFF_CREATED',
  'STAFF_UPDATED',
  'STAFF_DELETED',
  'STAFF_PASSWORD_RESET',
  'STAFF_PASSWORD_CHANGED',
  'CUSTOMER_PASSWORD_RESET_SENT',
  'CUSTOMER_BANNED',
  'CUSTOMER_ACTIVATED',
  'CUSTOMER_ARCHIVED',
  'CUSTOMER_RESTORED',
  'CUSTOMER_PERMANENTLY_DELETED',
  'ORDER_STATUS_CHANGED',
  'ORDER_UPDATED',
  'SETTINGS_UPDATED',
  'PRODUCT_CREATED',
  'PRODUCT_UPDATED',
  'PRODUCT_ARCHIVED',
  'PRODUCT_RESTORED',
  'PRODUCT_DELETED',
  'PRODUCT_IMAGE_UPLOADED',
  'PRODUCT_IMAGE_DELETED',
  'CATEGORY_CREATED',
  'STOCK_ADJUSTED',
  'COUPON_CREATED',
  'COUPON_UPDATED',
  'COUPON_DELETED',
  'REVIEW_STATUS_CHANGED',
  'REVIEW_FEEDBACK_UPDATED',
];

function prettyAction(action: string) {
  return action
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function ChangeDetails({ event }: { event: AdminAuditEvent }) {
  if (event.before == null && event.after == null) {
    return <span className="text-xs text-[#717975]">No field-level details recorded.</span>;
  }

  return (
    <details className="mt-2">
      <summary className="w-fit cursor-pointer text-xs font-semibold text-[#073a2d] underline">
        View recorded changes
      </summary>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        {event.before != null && (
          <div>
            <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-[#717975]">
              Before
            </p>
            <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-words border border-[#deddd3] bg-[#fbf9f2] p-3 text-[11px]">
              {JSON.stringify(event.before, null, 2)}
            </pre>
          </div>
        )}
        {event.after != null && (
          <div>
            <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-[#717975]">
              After
            </p>
            <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-words border border-[#deddd3] bg-[#fbf9f2] p-3 text-[11px]">
              {JSON.stringify(event.after, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </details>
  );
}

export default function ActivityPage() {
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const [events, setEvents] = useState<AdminAuditEvent[]>([]);
  const [pageData, setPageData] = useState<AdminAuditListResponse | null>(null);
  const [page, setPage] = useState(1);
  const [module, setModule] = useState('');
  const [action, setAction] = useState('');
  const [actor, setActor] = useState('');
  const [search, setSearch] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [reloadCount, setReloadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    adminApi.auth
      .refreshUser()
      .then((live) => {
        if (cancelled) return;
        setCurrentUser(live ?? adminApi.auth.getUser());
        setIsCheckingAccess(false);
      })
      .catch(() => {
        if (cancelled) return;
        setCurrentUser(adminApi.auth.getUser());
        setIsCheckingAccess(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (isCheckingAccess || !currentUser) return;
    let cancelled = false;

    async function loadEvents() {
      setIsLoading(true);
      setLoadError(null);
      try {
        const response = await adminApi.activity.getAll({
          page,
          limit: 20,
          module,
          action,
          actor: actor.trim(),
          search: search.trim(),
          from,
          to,
        });
        if (!response.success || !response.data) {
          throw new Error(response.error || 'Unable to load admin activity');
        }
        if (!cancelled) {
          setPageData(response.data);
          setEvents(response.data.items);
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(error instanceof Error ? error.message : 'Unable to load admin activity');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void loadEvents();
    return () => {
      cancelled = true;
    };
  }, [action, actor, currentUser, from, isCheckingAccess, module, page, reloadCount, search, to]);

  const handleFilterChange = (update: () => void) => {
    update();
    setPage(1);
  };

  if (isCheckingAccess) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <RefreshCw className="h-7 w-7 animate-spin text-[#073a2d]" />
      </div>
    );
  }

  if (currentUser?.role !== 'SUPER_ADMIN' && currentUser?.role !== 'ADMIN') {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center p-8 text-center">
        <Shield className="mb-4 h-10 w-10 text-[#8c6722]" />
        <h1 className="font-serif text-2xl text-[#1b1c18]">Activity access restricted</h1>
        <p className="mt-2 text-sm text-[#717975]">
          Admin Activity is available to Super Admins and Admins.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-8">
      <div className="flex flex-col justify-between gap-4 border-b border-[#deddd3] pb-6 md:flex-row md:items-end">
        <div>
          <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-[#717975]">
            <Activity className="h-3.5 w-3.5 text-[#073a2d]" />
            ADMINISTRATION • ACCOUNTABILITY
          </span>
          <h1 className="mt-1 font-serif text-3xl tracking-tight text-[#1b1c18]">
            Admin Activity
          </h1>
          <p className="mt-1 text-xs text-[#69726d]">
            Review who changed orders, permissions, settings, and other admin-managed records.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setReloadCount((count) => count + 1)}
          disabled={isLoading}
          className="flex items-center justify-center gap-2 border border-[#deddd3] bg-white px-4 py-2.5 text-xs font-semibold text-[#404945] hover:text-[#073a2d] disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <section className="grid gap-3 border border-[#deddd3] bg-white p-4 md:grid-cols-2 xl:grid-cols-3">
        <label className="space-y-1 text-[10px] font-bold uppercase tracking-wider text-[#717975]">
          Staff member
          <input
            type="search"
            value={actor}
            onChange={(event) => handleFilterChange(() => setActor(event.target.value))}
            placeholder="Name or email"
            className="w-full border border-[#deddd3] bg-[#fbf9f2] px-3 py-2 text-xs font-normal normal-case tracking-normal text-[#1b1c18] outline-none focus:border-[#073a2d]"
          />
        </label>
        <label className="space-y-1 text-[10px] font-bold uppercase tracking-wider text-[#717975]">
          Area
          <select
            value={module}
            onChange={(event) => handleFilterChange(() => setModule(event.target.value))}
            className="w-full border border-[#deddd3] bg-[#fbf9f2] px-3 py-2 text-xs font-normal text-[#1b1c18] outline-none focus:border-[#073a2d]"
          >
            <option value="">All areas</option>
            {MODULES.map((item) => (
              <option key={item} value={item}>
                {prettyAction(item)}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-[10px] font-bold uppercase tracking-wider text-[#717975]">
          Action
          <select
            value={action}
            onChange={(event) => handleFilterChange(() => setAction(event.target.value))}
            className="w-full border border-[#deddd3] bg-[#fbf9f2] px-3 py-2 text-xs font-normal text-[#1b1c18] outline-none focus:border-[#073a2d]"
          >
            <option value="">All actions</option>
            {ACTIONS.map((item) => (
              <option key={item} value={item}>
                {prettyAction(item)}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-[10px] font-bold uppercase tracking-wider text-[#717975]">
          Affected record
          <input
            type="search"
            value={search}
            onChange={(event) => handleFilterChange(() => setSearch(event.target.value))}
            placeholder="Order, item, or change summary"
            className="w-full border border-[#deddd3] bg-[#fbf9f2] px-3 py-2 text-xs font-normal normal-case tracking-normal text-[#1b1c18] outline-none focus:border-[#073a2d]"
          />
        </label>
        <label className="space-y-1 text-[10px] font-bold uppercase tracking-wider text-[#717975]">
          From
          <input
            type="date"
            value={from}
            onChange={(event) => handleFilterChange(() => setFrom(event.target.value))}
            className="w-full border border-[#deddd3] bg-[#fbf9f2] px-3 py-2 text-xs font-normal text-[#1b1c18] outline-none focus:border-[#073a2d]"
          />
        </label>
        <label className="space-y-1 text-[10px] font-bold uppercase tracking-wider text-[#717975]">
          To
          <input
            type="date"
            value={to}
            onChange={(event) => handleFilterChange(() => setTo(event.target.value))}
            className="w-full border border-[#deddd3] bg-[#fbf9f2] px-3 py-2 text-xs font-normal text-[#1b1c18] outline-none focus:border-[#073a2d]"
          />
        </label>
      </section>

      {loadError ? (
        <div role="alert" className="space-y-3 border border-red-200 bg-white p-8 text-center">
          <h2 className="text-sm font-semibold text-red-800">Could not load admin activity</h2>
          <p className="text-xs text-red-700">{loadError}</p>
          <button
            type="button"
            onClick={() => setReloadCount((count) => count + 1)}
            className="text-xs font-semibold text-[#073a2d] underline"
          >
            Try again
          </button>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto border border-[#deddd3] bg-white">
            <table className="w-full min-w-[850px] border-collapse text-left">
              <thead className="bg-[#f4f1e8]">
                <tr className="text-[10px] font-bold uppercase tracking-wider text-[#717975]">
                  <th className="px-4 py-3">Staff member</th>
                  <th className="px-4 py-3">Activity</th>
                  <th className="px-4 py-3">Affected record</th>
                  <th className="px-4 py-3">When</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0eee7]">
                {events.map((event) => (
                  <tr key={event.id} className="align-top hover:bg-[#fbf9f2]/70">
                    <td className="px-4 py-4">
                      <p className="text-xs font-semibold text-[#1b1c18]">{event.actorName}</p>
                      <p className="mt-0.5 text-[11px] text-[#717975]">{event.actorEmail}</p>
                      <span className="mt-1 inline-block border border-[#deddd3] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#717975]">
                        {prettyAction(event.actorRole)}
                      </span>
                    </td>
                    <td className="max-w-lg px-4 py-4">
                      <div className="mb-1 flex flex-wrap gap-1.5">
                        <span className="bg-[#bcedda]/40 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#073a2d]">
                          {prettyAction(event.module)}
                        </span>
                        <span className="bg-[#f5eedf] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#8c6722]">
                          {prettyAction(event.action)}
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed text-[#404945]">{event.summary}</p>
                      <ChangeDetails event={event} />
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-xs font-semibold text-[#1b1c18]">
                        {event.entityLabel || event.entityType}
                      </p>
                      {event.entityId && (
                        <p className="mt-0.5 break-all font-mono text-[10px] text-[#717975]">
                          {event.entityId}
                        </p>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-xs text-[#404945]">
                      <span className="flex items-center gap-1.5">
                        <Clock3 className="h-3.5 w-3.5 text-[#717975]" />
                        {new Date(event.createdAt).toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))}
                {!isLoading && events.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-16 text-center">
                      <Activity className="mx-auto mb-3 h-7 w-7 text-[#717975] opacity-50" />
                      <p className="font-serif text-lg text-[#1b1c18]">No activity found</p>
                      <p className="mt-1 text-xs text-[#717975]">
                        Try changing the filters or check again after an admin update.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {isLoading && (
              <div className="flex items-center justify-center gap-2 border-t border-[#f0eee7] p-5 text-xs text-[#717975]">
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                Loading activity…
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 text-xs sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[#717975]">
              {pageData?.total ?? 0} recorded actions
              {pageData ? ` • Page ${pageData.page} of ${pageData.totalPages}` : ''}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={!pageData || pageData.page <= 1 || isLoading}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                className="flex items-center gap-1 border border-[#deddd3] bg-white px-3 py-2 font-semibold text-[#404945] disabled:opacity-40"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Previous
              </button>
              <button
                type="button"
                disabled={!pageData || pageData.page >= pageData.totalPages || isLoading}
                onClick={() => setPage((current) => current + 1)}
                className="flex items-center gap-1 border border-[#deddd3] bg-white px-3 py-2 font-semibold text-[#404945] disabled:opacity-40"
              >
                Next
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
