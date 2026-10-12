'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Truck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  MapPin,
  Calculator,
  PackagePlus,
  Loader2,
  Store,
} from 'lucide-react';
import { adminApi } from '@/lib/api';
import { useToast } from '@/context/ToastContext';

interface PathaoStatusState {
  environment: 'sandbox';
  provider: 'Pathao';
  configured: boolean;
  connected: boolean;
  baseUrl: string;
  message?: string;
  defaultStoreId?: number | null;
  stores?: Array<{
    store_id: number;
    store_name: string;
    store_address: string;
  }>;
}

export function PathaoSandboxCard() {
  const { toast } = useToast();
  const [status, setStatus] = useState<PathaoStatusState | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [lastTestedAt, setLastTestedAt] = useState<string | null>(null);

  const fetchStatus = async () => {
    setIsLoadingStatus(true);
    try {
      const res = await adminApi.pathao.getStatus();
      if (res.success && res.data) {
        setStatus(res.data);
      }
    } catch (err: any) {
      console.error('Failed to load Pathao sandbox status:', err);
    } finally {
      setIsLoadingStatus(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    try {
      const res = await adminApi.pathao.testConnection();
      setLastTestedAt(new Date().toLocaleTimeString());

      if (res.success) {
        toast.success(res.message || 'Pathao Sandbox connection verified successfully!');
        await fetchStatus();
      } else {
        toast.error(res.message || 'Pathao Sandbox connection failed.');
        setStatus((prev) => (prev ? { ...prev, connected: false, message: res.message } : null));
      }
    } catch (err: any) {
      toast.error(err?.message || 'Error executing Pathao sandbox test connection.');
    } finally {
      setIsTestingConnection(false);
    }
  };

  return (
    <div className="bg-white border border-[#deddd3] p-6 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#f0eee7]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#fbf9f2] border border-[#deddd3] flex items-center justify-center text-[#c79a45]">
            <Truck className="w-5 h-5 text-[#8c6722]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-base font-bold text-[#1b1c18]">Pathao Courier Logistics</h2>
              <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-widest bg-[#c79a45]/15 text-[#8c6722] border border-[#c79a45]/30">
                SANDBOX / TEST
              </span>
            </div>
            <p className="text-xs text-[#69726d] mt-0.5">
              Official Pathao Aladdin Merchant API integration in testing mode.
            </p>
          </div>
        </div>

        {/* Live Status Badge */}
        <div className="flex items-center gap-2">
          {isLoadingStatus ? (
            <div className="flex items-center gap-1.5 text-xs text-[#717975] px-3 py-1 bg-[#fbf9f2] border border-[#deddd3]">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Checking sandbox...</span>
            </div>
          ) : status?.connected ? (
            <div className="flex items-center gap-1.5 text-xs text-[#073a2d] font-semibold px-3 py-1 bg-[#b0ecd3]/40 border border-[#336d59]/30">
              <span className="w-2 h-2 rounded-full bg-[#0d4d3b] animate-pulse" />
              <span>Connected to Sandbox</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-[#ba1a1a] font-semibold px-3 py-1 bg-[#fee2e2]/60 border border-[#ba1a1a]/30">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{status?.configured ? 'Not Connected' : 'Credentials Missing'}</span>
            </div>
          )}
        </div>
      </div>

      {/* Prominent Sandbox Notice */}
      <div className="p-3.5 bg-[#fbf9f2] border-l-4 border-[#c79a45] text-xs text-[#404945] flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 text-[#8c6722] flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-[#1b1c18]">
            Sandbox / Testing Mode — No real courier delivery will be created.
          </p>
          <p className="text-[#69726d] text-[11px] leading-relaxed">
            All requests target <code className="font-mono text-[#073a2d] bg-white px-1 py-0.5 border border-[#deddd3]">https://courier-api-sandbox.pathao.com</code>. Production credentials and live consignments are strictly prohibited.
          </p>
        </div>
      </div>

      {/* Diagnostics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="p-3.5 border border-[#deddd3] bg-[#fbfaf8] space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#717975] block">
            Target Environment
          </span>
          <p className="font-semibold text-[#1b1c18] font-mono uppercase">
            {status?.environment || 'SANDBOX'}
          </p>
          <p className="text-[10px] text-[#69726d] truncate" title={status?.baseUrl}>
            {status?.baseUrl || 'https://courier-api-sandbox.pathao.com'}
          </p>
        </div>

        <div className="p-3.5 border border-[#deddd3] bg-[#fbfaf8] space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#717975] block">
            Sandbox Credentials
          </span>
          <p className="font-semibold text-[#1b1c18]">
            {status?.configured ? 'Configured in Backend' : 'Incomplete in .env'}
          </p>
          <p className="text-[10px] text-[#69726d]">
            Client ID &amp; OAuth Password Grant
          </p>
        </div>

        <div className="p-3.5 border border-[#deddd3] bg-[#fbfaf8] space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#717975] block">
            Pickup Warehouses
          </span>
          <p className="font-semibold text-[#1b1c18] flex items-center gap-1.5">
            <Store className="w-3.5 h-3.5 text-[#073a2d]" />
            <span>{status?.stores?.length ?? 0} Sandbox Store(s)</span>
          </p>
          <p className="text-[10px] text-[#69726d] truncate">
            {status?.stores?.[0]?.store_name || 'No warehouse registered'}
          </p>
        </div>
      </div>

      {/* Actions Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#deddd3]">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={isTestingConnection}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#073a2d] hover:bg-[#0c4e3b] text-white text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
          >
            {isTestingConnection ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Testing Connection...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Test Connection</span>
              </>
            )}
          </button>

          {lastTestedAt && (
            <span className="text-[11px] text-[#717975] italic">
              Last tested: {lastTestedAt}
            </span>
          )}
        </div>

        {/* Links to Full Testing Suite */}
        <div className="flex items-center gap-2">
          <Link
            href="/settings/pathao-test"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-[#073a2d] bg-[#fbf9f2] hover:bg-[#073a2d] text-[#073a2d] hover:text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            <PackagePlus className="w-3.5 h-3.5" />
            <span>Open Sandbox Testing Suite</span>
            <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
          </Link>
        </div>
      </div>
    </div>
  );
}
