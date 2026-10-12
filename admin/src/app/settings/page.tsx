'use client';

import React, { useState, useEffect } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { Settings, Save, CheckCircle2, Shield, Phone, Globe, CreditCard, Truck, RefreshCw, Tag } from 'lucide-react';
import { SettingsSkeleton } from '@/components/common/Skeleton';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { PathaoSandboxCard } from '@/components/settings/PathaoSandboxCard';

function SettingsContent() {
  const { settings, updateSettings, backendConnected, refreshData, isLoading } = useAdmin();
  const [form, setForm] = useState(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await updateSettings(form);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update settings:', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <SettingsSkeleton />;
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#deddd3] pb-6">
        <div>
          <span className="text-[11px] font-bold tracking-widest uppercase text-[#717975] flex items-center gap-1.5">
            <Settings className="w-3.5 h-3.5 text-[#073a2d]" />
            ATELIER CONFIGURATION & PROTOCOLS
          </span>
          <h1 className="text-3xl font-serif text-[#1b1c18] mt-1 tracking-tight">Store Settings</h1>
          <p className="text-xs text-[#69726d] mt-1">
            Configure boutique identity, regional shipping rates, and digital payment gateways.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={isSyncing || isSaving}
            aria-busy={isSyncing}
            onClick={async () => {
              setIsSyncing(true);
              try {
                await refreshData();
              } finally {
                setIsSyncing(false);
              }
            }}
            className="flex items-center gap-2 px-3 py-2 border border-[#deddd3] bg-white text-xs font-semibold text-[#404945] hover:text-[#1b1c18] transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-[#073a2d]' : ''}`} />
            <span>{isSyncing ? 'Reloading...' : 'Reload'}</span>
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#073a2d] hover:bg-[#0d4d3b] text-white text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-50"
          >
            {isSaving ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : saveSuccess ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-[#b0ecd3]" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>{isSaving ? 'Synchronizing...' : saveSuccess ? 'Saved' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-[#b0ecd3]/30 border border-[#0d4d3b]/30 flex items-center gap-2 text-xs text-[#073a2d] font-semibold">
          <CheckCircle2 className="w-4 h-4 text-[#0d4d3b]" />
          <span>Atelier configuration synchronized successfully to Cloud PostgreSQL.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* Boutique Identity */}
        <div className="bg-white border border-[#deddd3] p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-[#f0eee7]">
            <Globe className="w-4 h-4 text-[#073a2d]" />
            <h2 className="font-serif text-base font-medium text-[#1b1c18]">Boutique Identity</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#717975] mb-1.5">
                Boutique / Store Name
              </label>
              <input
                type="text"
                value={form.storeName || ''}
                onChange={(e) => handleChange('storeName', e.target.value)}
                className="w-full px-3 py-2 bg-[#fbf9f2] border border-[#deddd3] text-xs text-[#1b1c18] focus:border-[#073a2d] outline-hidden font-medium"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#717975] mb-1.5">
                Public Website Domain
              </label>
              <input
                type="url"
                value={form.website || ''}
                onChange={(e) => handleChange('website', e.target.value)}
                className="w-full px-3 py-2 bg-[#fbf9f2] border border-[#deddd3] text-xs text-[#1b1c18] focus:border-[#073a2d] outline-hidden font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#717975] mb-1.5">
                Customer Care Phone
              </label>
              <input
                type="text"
                value={form.phone || ''}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full px-3 py-2 bg-[#fbf9f2] border border-[#deddd3] text-xs text-[#1b1c18] focus:border-[#073a2d] outline-hidden font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#717975] mb-1.5">
                VIP Concierge WhatsApp
              </label>
              <input
                type="text"
                value={form.whatsapp || ''}
                onChange={(e) => handleChange('whatsapp', e.target.value)}
                className="w-full px-3 py-2 bg-[#fbf9f2] border border-[#deddd3] text-xs text-[#1b1c18] focus:border-[#073a2d] outline-hidden font-mono"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#717975] mb-1.5">
                Official Facebook Page URL
              </label>
              <input
                type="url"
                value={form.facebook || ''}
                onChange={(e) => handleChange('facebook', e.target.value)}
                placeholder="https://facebook.com/ronginlibasofficial"
                className="w-full px-3 py-2 bg-[#fbf9f2] border border-[#deddd3] text-xs text-[#1b1c18] focus:border-[#073a2d] outline-hidden font-mono"
              />
              <span className="text-[10px] text-[#717975] mt-1 block">
                Linked in storefront header, footer, and community editorial gallery
              </span>
            </div>
          </div>
        </div>

        {/* Dispatch & Delivery Charges */}
        <div className="bg-white border border-[#deddd3] p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-[#f0eee7]">
            <Truck className="w-4 h-4 text-[#073a2d]" />
            <h2 className="font-serif text-base font-medium text-[#1b1c18]">Shipping & Delivery Tariffs</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#717975] mb-1.5">
                Dhaka Metropolitan (৳)
              </label>
              <input
                type="number"
                value={form.dhakaDeliveryCharge ?? 80}
                onChange={(e) => handleChange('dhakaDeliveryCharge', Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#fbf9f2] border border-[#deddd3] text-xs text-[#1b1c18] focus:border-[#073a2d] outline-hidden font-mono font-bold"
              />
              <span className="text-[10px] text-[#717975] mt-1 block">Default: ৳80 inside Dhaka</span>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#717975] mb-1.5">
                National Divisions (৳)
              </label>
              <input
                type="number"
                value={form.outsideDhakaDeliveryCharge ?? 150}
                onChange={(e) => handleChange('outsideDhakaDeliveryCharge', Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#fbf9f2] border border-[#deddd3] text-xs text-[#1b1c18] focus:border-[#073a2d] outline-hidden font-mono font-bold"
              />
              <span className="text-[10px] text-[#717975] mt-1 block">Default: ৳150 outside Dhaka</span>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#717975] mb-1.5">
                Complimentary Shipping Minimum (৳)
              </label>
              <input
                type="number"
                value={form.freeDeliveryThreshold ?? 3000}
                onChange={(e) => handleChange('freeDeliveryThreshold', Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#fbf9f2] border border-[#deddd3] text-xs text-[#1b1c18] focus:border-[#073a2d] outline-hidden font-mono font-bold"
              />
              <span className="text-[10px] text-[#717975] mt-1 block">Free delivery above this cart value</span>
            </div>
          </div>
        </div>

        {/* Storefront Announcements */}
        <div className="bg-white border border-[#deddd3] p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-[#f0eee7]">
            <Tag className="w-4 h-4 text-[#073a2d]" />
            <div>
              <h2 className="font-serif text-base font-medium text-[#1b1c18]">Storefront Announcements</h2>
              <p className="text-[11px] text-[#717975] mt-0.5">
                Control which store offers and contact links appear in the customer site header.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="flex items-center justify-between gap-4 p-3.5 border border-[#deddd3] bg-[#fbf9f2] cursor-pointer">
              <span>
                <span className="block text-xs font-semibold text-[#1b1c18]">Free shipping announcement</span>
                <span className="block text-[11px] text-[#717975] mt-1">
                  Uses the threshold configured in Shipping &amp; Delivery Tariffs.
                </span>
              </span>
              <input
                type="checkbox"
                checked={form.freeShippingEnabled}
                onChange={(e) => handleChange('freeShippingEnabled', e.target.checked)}
                className="h-4 w-4 accent-[#073a2d]"
              />
            </label>

            <label className="flex items-center justify-between gap-4 p-3.5 border border-[#deddd3] bg-[#fbf9f2] cursor-pointer">
              <span>
                <span className="block text-xs font-semibold text-[#1b1c18]">Promotion announcement</span>
                <span className="block text-[11px] text-[#717975] mt-1">
                  The coupon system still validates and calculates the discount.
                </span>
              </span>
              <input
                type="checkbox"
                checked={form.promoEnabled}
                onChange={(e) => handleChange('promoEnabled', e.target.checked)}
                className="h-4 w-4 accent-[#073a2d]"
              />
            </label>

            <label className="flex items-center justify-between gap-4 p-3.5 border border-[#deddd3] bg-[#fbf9f2] cursor-pointer">
              <span>
                <span className="block text-xs font-semibold text-[#1b1c18]">WhatsApp order link</span>
                <span className="block text-[11px] text-[#717975] mt-1">
                  Uses the VIP Concierge WhatsApp number above.
                </span>
              </span>
              <input
                type="checkbox"
                checked={form.whatsappOrderEnabled}
                onChange={(e) => handleChange('whatsappOrderEnabled', e.target.checked)}
                className="h-4 w-4 accent-[#073a2d]"
              />
            </label>
          </div>

          {form.promoEnabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#717975] mb-1.5">
                  Announcement Coupon Code
                </label>
                <input
                  type="text"
                  value={form.promoCode || ''}
                  onChange={(e) => handleChange('promoCode', e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 bg-[#fbf9f2] border border-[#deddd3] text-xs text-[#1b1c18] focus:border-[#073a2d] outline-hidden font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#717975] mb-1.5">
                  Discount Display Text
                </label>
                <input
                  type="text"
                  value={form.promoDiscountText || ''}
                  onChange={(e) => handleChange('promoDiscountText', e.target.value)}
                  placeholder="For example, 15% OFF"
                  className="w-full px-3 py-2 bg-[#fbf9f2] border border-[#deddd3] text-xs text-[#1b1c18] focus:border-[#073a2d] outline-hidden"
                />
              </div>
            </div>
          )}
        </div>

        {/* Payment Gateways */}
        <div className="bg-white border border-[#deddd3] p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-[#f0eee7]">
            <CreditCard className="w-4 h-4 text-[#073a2d]" />
            <h2 className="font-serif text-base font-medium text-[#1b1c18]">Payment Gateways & Wallets</h2>
          </div>

          <div className="space-y-4">
            {/* COD */}
            <div className="flex items-center justify-between p-3.5 border border-[#deddd3] bg-[#fbf9f2]">
              <div>
                <p className="text-xs font-semibold text-[#1b1c18]">Cash on Delivery (COD)</p>
                <p className="text-[11px] text-[#717975]">Allow patrons to pay upon receiving bespoke parcels.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.codEnabled}
                  onChange={(e) => handleChange('codEnabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-[#deddd3] peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#073a2d]"></div>
              </label>
            </div>

            {/* bKash */}
            <div className="p-3.5 border border-[#deddd3] bg-[#fbf9f2] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-[#1b1c18]">bKash Merchant / Personal Gateway</p>
                  <p className="text-[11px] text-[#717975]">Direct bKash payment verification during checkout.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.bkashEnabled}
                    onChange={(e) => handleChange('bkashEnabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-[#deddd3] peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#073a2d]"></div>
                </label>
              </div>
              {form.bkashEnabled && (
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#717975] mb-1">
                    bKash Wallet Number
                  </label>
                  <input
                    type="text"
                    value={form.bkashWallet || ''}
                    onChange={(e) => handleChange('bkashWallet', e.target.value)}
                    placeholder="e.g. 01711-223344"
                    className="w-full md:w-64 px-3 py-1.5 bg-white border border-[#deddd3] text-xs font-mono"
                  />
                </div>
              )}
            </div>

            {/* Nagad */}
            <div className="p-3.5 border border-[#deddd3] bg-[#fbf9f2] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-[#1b1c18]">Nagad Digital Gateway</p>
                  <p className="text-[11px] text-[#717975]">Direct Nagad wallet checkout.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.nagadEnabled}
                    onChange={(e) => handleChange('nagadEnabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-[#deddd3] peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#073a2d]"></div>
                </label>
              </div>
              {form.nagadEnabled && (
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#717975] mb-1">
                    Nagad Wallet Number
                  </label>
                  <input
                    type="text"
                    value={form.nagadWallet || ''}
                    onChange={(e) => handleChange('nagadWallet', e.target.value)}
                    placeholder="e.g. 01822-554499"
                    className="w-full md:w-64 px-3 py-1.5 bg-white border border-[#deddd3] text-xs font-mono"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Pathao Logistics Courier Integration (Sandbox Testing) */}
        <PathaoSandboxCard />

        {/* Database Sync Status */}
        <div className="p-4 bg-[#fbf9f2] border border-[#deddd3] flex items-center justify-between text-xs text-[#717975]">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                backendConnected ? 'bg-[#0d4d3b]' : 'bg-[#c79a45]'
              }`}
            />
            <span>
              Cloud Neon PostgreSQL Status:{' '}
              <strong className="text-[#1b1c18]">
                {backendConnected ? 'Connected & Synchronized' : 'Offline Mode'}
              </strong>
            </span>
          </div>
          <button
            type="submit"
            disabled={isSaving}
            aria-busy={isSaving}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#073a2d] hover:bg-[#0d4d3b] text-white text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Saving Settings...</span>
              </>
            ) : (
              <span>Save Settings</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <PermissionGuard permission="settings" moduleName="Store Settings">
      <SettingsContent />
    </PermissionGuard>
  );
}
