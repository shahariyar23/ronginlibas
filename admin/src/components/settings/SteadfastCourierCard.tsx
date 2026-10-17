'use client';

import React, { useState, useEffect } from 'react';
import {
  Truck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Wallet,
  Loader2,
} from 'lucide-react';
import { adminApi } from '@/lib/api';
import { useToast } from '@/context/ToastContext';

interface CourierHealthState {
  enabled: boolean;
  mode: 'mock' | 'live';
  provider: string;
  configured: boolean;
  connected: boolean;
  message: string;
  baseUrl?: string;
  details?: Record<string, unknown>;
}

export function SteadfastCourierCard() {
  const { toast } = useToast();
  const [health, setHealth] = useState<CourierHealthState | null>(null);
  const [balance, setBalance] = useState<{ currentBalance: number; currency?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTesting, setIsTesting] = useState(false);
  const [lastCheckedAt, setLastCheckedAt] = useState<string | null>(null);

  const fetchHealthAndBalance = async () => {
    setIsLoading(true);
    try {
      const [healthRes, balanceRes] = await Promise.allSettled([
        adminApi.courier.getHealth(),
        adminApi.courier.getBalance(),
      ]);

      if (healthRes.status === 'fulfilled' && healthRes.value.success && healthRes.value.data) {
        setHealth(healthRes.value.data);
      }
      if (balanceRes.status === 'fulfilled' && balanceRes.value.success && balanceRes.value.data) {
        setBalance(balanceRes.value.data);
      }
      setLastCheckedAt(new Date().toLocaleTimeString());
    } catch (err: any) {
      console.error('Failed to load courier health/balance:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthAndBalance();
  }, []);

  const handleTestConnection = async () => {
    setIsTesting(true);
    try {
      const res = await adminApi.courier.getHealth();
      setLastCheckedAt(new Date().toLocaleTimeString());

      if (res.success && res.data) {
        setHealth(res.data);
        if (res.data.connected) {
          toast.success(res.data.message || 'Steadfast connection verified successfully!');
        } else {
          toast.error(res.data.message || 'Steadfast connection verification failed.');
        }
      }
      const bal = await adminApi.courier.getBalance();
      if (bal.success && bal.data) {
        setBalance(bal.data);
      }
    } catch (err: any) {
      toast.error(err?.message || 'Error testing Steadfast gateway connection.');
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="bg-white border border-[#deddd3] shadow-xs">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-[#deddd3] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-sm bg-[#073a2d]/10 flex items-center justify-center shrink-0 border border-[#073a2d]/20">
            <Truck className="w-5 h-5 text-[#073a2d]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-base font-bold text-[#1b1c18]">Steadfast Courier Integration</h2>
              <span
                className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-wider border ${
                  health?.mode === 'live'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-[#c79a45]/20 text-[#8c6722] border-[#c79a45]/40'
                }`}
              >
                {health?.mode === 'live' ? 'LIVE GATEWAY' : 'MOCK SIMULATION'}
              </span>
            </div>
            <p className="text-xs text-[#717975] mt-0.5">
              Provider-agnostic courier architecture • 64-district nationwide automated fulfillment.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleTestConnection}
          disabled={isTesting || isLoading}
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-[#deddd3] hover:bg-[#fbf9f2] text-[#404945] text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer self-start sm:self-auto"
        >
          {isTesting ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#073a2d]" />
              <span>Verifying...</span>
            </>
          ) : (
            <>
              <RefreshCw className="w-3.5 h-3.5 text-[#073a2d]" />
              <span>Test Connection</span>
            </>
          )}
        </button>
      </div>

      {/* Body Diagnostics */}
      <div className="p-4 sm:p-5 space-y-4">
        {/* Status Callout Banner */}
        <div
          className={`p-3 border text-xs flex items-start gap-2.5 ${
            health?.connected
              ? 'bg-[#b0ecd3]/20 border-[#0d4d3b]/30 text-[#073a2d]'
              : 'bg-amber-50 border-amber-300 text-amber-900'
          }`}
        >
          {health?.connected ? (
            <CheckCircle2 className="w-4 h-4 text-[#0d4d3b] shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          )}
          <div className="flex-1 space-y-0.5">
            <p className="font-bold">
              {health?.connected
                ? `Steadfast Gateway is Online (${health.mode.toUpperCase()} MODE)`
                : 'Steadfast Gateway Attention Required'}
            </p>
            <p className="text-[11px] text-[#404945]">
              {health?.message || 'Checking status...'}
            </p>
          </div>
        </div>

        {/* 3-Column Diagnostic Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-[#fbf9f2] border border-[#deddd3] space-y-1">
            <div className="flex items-center justify-between text-[#717975] text-[11px]">
              <span className="uppercase font-medium">Active Mode</span>
              <ShieldCheck className="w-3.5 h-3.5 text-[#073a2d]" />
            </div>
            <p className="font-bold text-[#1b1c18] uppercase">
              {health?.mode || 'MOCK'}
            </p>
            <span className="text-[10px] text-[#717975] block">
              {health?.mode === 'live'
                ? 'Consignments booked with real courier'
                : 'Deterministic test simulation'}
            </span>
          </div>

          <div className="p-3 bg-[#fbf9f2] border border-[#deddd3] space-y-1">
            <div className="flex items-center justify-between text-[#717975] text-[11px]">
              <span className="uppercase font-medium">Merchant Balance</span>
              <Wallet className="w-3.5 h-3.5 text-[#073a2d]" />
            </div>
            <p className="font-serif text-base font-bold text-[#073a2d]">
              ৳{balance ? balance.currentBalance.toLocaleString() : '---'}
            </p>
            <span className="text-[10px] text-[#717975] block">
              Steadfast Remittance Balance
            </span>
          </div>

          <div className="p-3 bg-[#fbf9f2] border border-[#deddd3] space-y-1">
            <div className="flex items-center justify-between text-[#717975] text-[11px]">
              <span className="uppercase font-medium">API Endpoint</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#717975]" />
            </div>
            <p className="font-mono text-[11px] font-semibold text-[#1b1c18] truncate">
              {health?.baseUrl || 'https://api.steadfast.com.bd/v1'}
            </p>
            <span className="text-[10px] text-[#717975] block">
              Last Verified: {lastCheckedAt || 'Just now'}
            </span>
          </div>
        </div>

        {/* Webhook Configuration Note */}
        <div className="p-3 bg-white border border-[#deddd3] text-xs space-y-1.5">
          <span className="font-bold text-[#1b1c18] block uppercase text-[11px]">
            Webhook Delivery Synchronization
          </span>
          <p className="text-[11px] text-[#69726d]">
            Configure this Webhook URL in your Steadfast merchant dashboard to receive real-time delivery status updates:
          </p>
          <div className="flex items-center gap-2">
            <code className="font-mono text-[11px] bg-[#fbf9f2] px-2 py-1 border border-[#deddd3] text-[#073a2d] select-all">
              https://api.ronginlibas.com/api/v1/webhooks/steadfast
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}
