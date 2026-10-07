'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Search,
  Warehouse,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Download,
  Upload,
  Check,
  Truck,
  CreditCard,
  Building2,
  Phone,
  Globe,
  Share2,
} from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import { InventoryItem } from '@/data/adminData';

export default function InventoryPage() {
  const { inventory, updateInventoryStock, settings, updateSettings } = useAdmin();
  const [search, setSearch] = useState('');
  const [filterTab, setFilterTab] = useState<'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'>('ALL');
  const [stockEdits, setStockEdits] = useState<{ [id: string]: number }>({});

  // Settings form states
  const [storeName, setStoreName] = useState(settings.storeName);
  const [phone, setPhone] = useState(settings.phone);
  const [whatsapp, setWhatsapp] = useState(settings.whatsapp);
  const [website, setWebsite] = useState(settings.website);
  const [facebook, setFacebook] = useState(settings.facebook);
  const [dhakaCharge, setDhakaCharge] = useState(settings.dhakaDeliveryCharge.toString());
  const [outsideCharge, setOutsideCharge] = useState(settings.outsideDhakaDeliveryCharge.toString());
  const [threshold, setThreshold] = useState(settings.freeDeliveryThreshold.toString());
  const [cod, setCod] = useState(settings.codEnabled);
  const [bkash, setBkash] = useState(settings.bkashEnabled);
  const [bkashWallet, setBkashWallet] = useState(settings.bkashWallet);
  const [nagad, setNagad] = useState(settings.nagadEnabled);
  const [nagadWallet, setNagadWallet] = useState(settings.nagadWallet);

  // Compute stat counts
  const totalCount = inventory.length;
  const inStockCount = inventory.filter((i) => i.stock > 5).length;
  const lowStockCount = inventory.filter((i) => i.stock > 0 && i.stock <= 5).length;
  const outOfStockCount = inventory.filter((i) => i.stock === 0).length;

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase());
    const matchesTab =
      filterTab === 'ALL'
        ? true
        : filterTab === 'IN_STOCK'
        ? item.stock > 5
        : filterTab === 'LOW_STOCK'
        ? item.stock > 0 && item.stock <= 5
        : item.stock === 0;
    return matchesSearch && matchesTab;
  });

  const getStockValue = (item: InventoryItem) => {
    return stockEdits[item.id] !== undefined ? stockEdits[item.id] : item.stock;
  };

  const handleAdjust = (id: string, delta: number) => {
    const current = getStockValue(inventory.find((i) => i.id === id)!);
    setStockEdits((prev) => ({
      ...prev,
      [id]: Math.max(0, current + delta),
    }));
  };

  const handleSaveStock = (id: string) => {
    const updated = getStockValue(inventory.find((i) => i.id === id)!);
    updateInventoryStock(id, updated);
    setStockEdits((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
    alert('Atelier Suite: Stock level updated in live ledger.');
  };

  const handleSaveStoreInfo = () => {
    updateSettings({ storeName, phone, whatsapp, website, facebook });
    alert('Atelier Suite: Store information saved successfully.');
  };

  const handleSaveDelivery = () => {
    updateSettings({
      dhakaDeliveryCharge: parseFloat(dhakaCharge) || 80,
      outsideDhakaDeliveryCharge: parseFloat(outsideCharge) || 150,
      freeDeliveryThreshold: parseFloat(threshold) || 3000,
    });
    alert('Atelier Suite: Delivery configurations synchronized.');
  };

  const handleSavePayment = () => {
    updateSettings({
      codEnabled: cod,
      bkashEnabled: bkash,
      bkashWallet,
      nagadEnabled: nagad,
      nagadWallet,
    });
    alert('Atelier Suite: Payment gateways saved successfully.');
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10 pb-20">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#deddd3] pb-6">
        <div>
          <span className="text-[11px] font-bold tracking-widest uppercase text-[#717975]">
            STOCK LEDGER & OPERATIONAL CONTROLS
          </span>
          <div className="flex items-center gap-3 mt-1">
            <h1 className="text-3xl font-serif text-[#1b1c18] tracking-tight">
              Inventory & Settings
            </h1>
            <span className="text-xs bg-[#bcedda]/40 text-[#073a2d] border border-[#a1d1be] px-2.5 py-0.5 font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0d4d3b] animate-pulse" />
              Live Atelier Sync • Dhaka GMT+6
            </span>
          </div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white border border-[#deddd3] p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#717975]">
              ACTIVE CATALOG
            </p>
            <h3 className="text-2xl font-serif font-medium text-[#1b1c18] mt-1">
              128 <span className="text-xs font-sans text-[#717975]">SKUs</span>
            </h3>
          </div>
          <div className="w-10 h-10 bg-[#fbf9f2] border border-[#deddd3] flex items-center justify-center text-[#073a2d]">
            <Warehouse className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-[#deddd3] p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#717975]">
              IN STOCK READY
            </p>
            <h3 className="text-2xl font-serif font-medium text-[#073a2d] mt-1">
              110 <span className="text-xs font-sans text-[#0d4d3b]">Healthy</span>
            </h3>
          </div>
          <div className="w-10 h-10 bg-[#bcedda]/40 flex items-center justify-center text-[#0d4d3b]">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-[#deddd3] p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#717975]">
              LOW STOCK ALERT
            </p>
            <h3 className="text-2xl font-serif font-medium text-[#8c6722] mt-1">
              14 <span className="text-xs font-sans text-[#8c6722]">Restock soon</span>
            </h3>
          </div>
          <div className="w-10 h-10 bg-[#f5eedf] flex items-center justify-center text-[#8c6722]">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-[#deddd3] p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#717975]">
              STOCK OUT
            </p>
            <h3 className="text-2xl font-serif font-medium text-[#ba1a1a] mt-1">
              4 <span className="text-xs font-sans text-[#ba1a1a]">Replenish</span>
            </h3>
          </div>
          <div className="w-10 h-10 bg-[#ffdad6]/60 flex items-center justify-center text-[#ba1a1a]">
            <XCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Inventory & Stock Levels Table Section */}
      <div className="bg-white border border-[#deddd3] p-6 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-xl font-medium text-[#1b1c18]">
              Inventory & Stock Levels
            </h2>
            <p className="text-xs text-[#717975] mt-0.5">
              Real-time stock units and swift count updates across Dhaka atelier collections.
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-[#717975] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search inventory items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#fbf9f2] border border-[#deddd3] text-xs text-[#1b1c18] focus:border-[#073a2d] outline-hidden placeholder-[#717975]"
            />
          </div>
        </div>

        {/* Filter tabs & Legend */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#f0eee7] pb-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setFilterTab('ALL')}
              className={`px-3 py-1 font-bold tracking-wider uppercase transition-colors ${
                filterTab === 'ALL'
                  ? 'bg-[#00231a] text-white'
                  : 'text-[#404945] hover:text-[#1b1c18] bg-[#fbf9f2] border border-[#deddd3]'
              }`}
            >
              ALL PRODUCTS ({totalCount})
            </button>
            <button
              onClick={() => setFilterTab('IN_STOCK')}
              className={`px-3 py-1 font-bold tracking-wider uppercase transition-colors ${
                filterTab === 'IN_STOCK'
                  ? 'bg-[#00231a] text-white'
                  : 'text-[#073a2d] hover:text-[#1b1c18] bg-[#fbf9f2] border border-[#deddd3]'
              }`}
            >
              IN STOCK ({inStockCount})
            </button>
            <button
              onClick={() => setFilterTab('LOW_STOCK')}
              className={`px-3 py-1 font-bold tracking-wider uppercase transition-colors ${
                filterTab === 'LOW_STOCK'
                  ? 'bg-[#00231a] text-white'
                  : 'text-[#8c6722] hover:text-[#1b1c18] bg-[#fbf9f2] border border-[#deddd3]'
              }`}
            >
              LOW STOCK ({lowStockCount})
            </button>
            <button
              onClick={() => setFilterTab('OUT_OF_STOCK')}
              className={`px-3 py-1 font-bold tracking-wider uppercase transition-colors ${
                filterTab === 'OUT_OF_STOCK'
                  ? 'bg-[#00231a] text-white'
                  : 'text-[#ba1a1a] hover:text-[#1b1c18] bg-[#fbf9f2] border border-[#deddd3]'
              }`}
            >
              OUT OF STOCK ({outOfStockCount})
            </button>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-[#717975]">
            <span className="uppercase font-bold">LEGEND:</span>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#0d4d3b]" />
              <span>In Stock (&gt;5)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#c79a45]" />
              <span>Low Stock (1-5)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#ba1a1a]" />
              <span>Out of Stock (0)</span>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="border border-[#deddd3] overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[#deddd3] bg-[#fbf9f2] text-[#717975] uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4 font-semibold">PRODUCT</th>
                <th className="py-3 px-4 font-semibold">SKU</th>
                <th className="py-3 px-4 font-semibold">CATEGORY</th>
                <th className="py-3 px-4 font-semibold">CURRENT STOCK</th>
                <th className="py-3 px-4 font-semibold">STATUS BADGE</th>
                <th className="py-3 px-4 text-right font-semibold">QUICK STOCK UPDATE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0eee7]">
              {filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#717975]">
                    <Warehouse className="w-8 h-8 mx-auto mb-2 opacity-40 text-[#717975]" />
                    <p className="font-serif text-sm text-[#1b1c18]">No inventory entries found</p>
                    <p className="text-[11px] text-[#717975]">
                      Stock levels will synchronize automatically as products and variants are created.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredInventory.map((item) => {
                const currentStock = getStockValue(item);
                const isModified = stockEdits[item.id] !== undefined;

                return (
                  <tr key={item.id} className="hover:bg-[#fbf9f2] transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-14 bg-[#f0eee7] border border-[#deddd3] relative overflow-hidden shrink-0">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                        <div>
                          <p className="font-serif font-medium text-[#1b1c18] text-sm">
                            {item.name}
                          </p>
                          <p className="text-[11px] text-[#717975]">{item.subtitle}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-[#404945]">{item.sku}</td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 bg-[#f0eee7] text-[11px] border border-[#deddd3] text-[#404945]">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-serif font-bold text-sm text-[#1b1c18]">
                      {currentStock}
                    </td>
                    <td className="py-3 px-4">
                      {currentStock > 5 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#b0ecd3]/40 text-[#073a2d]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#0d4d3b]" />
                          IN STOCK
                        </span>
                      ) : currentStock > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#f5eedf] text-[#8c6722]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#c79a45]" />
                          LOW STOCK
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#ffdad6] text-[#ba1a1a]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a]" />
                          OUT OF STOCK
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleAdjust(item.id, -1)}
                          className="w-7 h-7 bg-[#f0eee7] border border-[#deddd3] text-sm font-bold text-[#1b1c18] hover:bg-[#e4e2dc]"
                        >
                          -
                        </button>
                        <span className="w-10 text-center font-mono font-bold text-xs text-[#1b1c18]">
                          {currentStock}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleAdjust(item.id, 1)}
                          className="w-7 h-7 bg-[#f0eee7] border border-[#deddd3] text-sm font-bold text-[#1b1c18] hover:bg-[#e4e2dc]"
                        >
                          +
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveStock(item.id)}
                          className={`ml-2 px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                            isModified
                              ? 'bg-[#073a2d] text-white hover:bg-[#0d4d3b]'
                              : 'bg-[#00231a] text-white hover:bg-[#073a2d]'
                          }`}
                        >
                          SAVE
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

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-[#717975] pt-2 gap-2">
          <span className="uppercase text-[10px] font-bold tracking-wider">
            DISPLAYING {filteredInventory.length} OF {inventory.length} PIECES
          </span>
          <div className="flex items-center gap-3">
            <span className="text-[#69726d]">Need batch import?</span>
            <button
              onClick={() => alert('Atelier Suite: Exporting Inventory Ledger (.CSV)...')}
              className="text-[#073a2d] font-bold hover:underline flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Ledger (.csv)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Basic Store Settings Section */}
      <div className="space-y-6">
        <div>
          <span className="text-[11px] font-bold tracking-widest uppercase text-[#717975]">
            PREFERENCES & INTEGRATION
          </span>
          <h2 className="text-2xl font-serif text-[#1b1c18] mt-1">Basic Store Settings</h2>
          <p className="text-xs text-[#69726d]">
            Configured for Bangladesh Regional Commerce & Tailoring Dispatch.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: Store Information */}
          <div className="bg-white border border-[#deddd3] p-6 shadow-xs flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 border-b border-[#f0eee7] pb-3">
                <Building2 className="w-5 h-5 text-[#073a2d]" />
                <div>
                  <h3 className="font-serif font-medium text-[#1b1c18]">Store Information</h3>
                  <p className="text-[11px] text-[#717975]">Public atelier contact & identity</p>
                </div>
              </div>

              {/* Logo / Emblem */}
              <div className="p-3 bg-[#fbf9f2] border border-[#deddd3] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#073a2d] border border-[#c79a45]/40 flex items-center justify-center p-1.5">
                    <Image
                      src="/logo.svg"
                      alt="Logo"
                      width={28}
                      height={28}
                      className="object-contain filter brightness-200"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#1b1c18]">Atelier Emblem</p>
                    <p className="text-[10px] text-[#717975]">PNG/SVG 512x512px</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => alert('Upload logo modal triggered.')}
                  className="px-2.5 py-1.5 border border-[#deddd3] text-[10px] font-bold uppercase tracking-wider bg-white hover:bg-[#f0eee7]"
                >
                  CHANGE LOGO
                </button>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#717975]">
                  STORE NAME
                </label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-[#fbf9f2] border border-[#deddd3] text-xs font-semibold text-[#1b1c18] focus:border-[#073a2d] outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#717975]">
                    PHONE
                  </label>
                  <div className="relative mt-1">
                    <Phone className="w-3.5 h-3.5 text-[#717975] absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-8 pr-2 py-2 bg-[#fbf9f2] border border-[#deddd3] text-xs text-[#1b1c18] font-mono focus:border-[#073a2d] outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#717975]">
                    WHATSAPP
                  </label>
                  <div className="relative mt-1">
                    <Phone className="w-3.5 h-3.5 text-[#0d4d3b] absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      className="w-full pl-8 pr-2 py-2 bg-[#fbf9f2] border border-[#deddd3] text-xs text-[#1b1c18] font-mono focus:border-[#073a2d] outline-hidden"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#717975]">
                  WEBSITE
                </label>
                <div className="relative mt-1">
                  <Globe className="w-3.5 h-3.5 text-[#717975] absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full pl-8 pr-2 py-2 bg-[#fbf9f2] border border-[#deddd3] text-xs text-[#1b1c18] focus:border-[#073a2d] outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#717975]">
                  FACEBOOK
                </label>
                <div className="relative mt-1">
                  <Share2 className="w-3.5 h-3.5 text-[#717975] absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={facebook}
                    onChange={(e) => setFacebook(e.target.value)}
                    className="w-full pl-8 pr-2 py-2 bg-[#fbf9f2] border border-[#deddd3] text-xs text-[#1b1c18] focus:border-[#073a2d] outline-hidden"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleSaveStoreInfo}
              className="w-full py-2.5 bg-[#00231a] hover:bg-[#073a2d] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>SAVE STORE INFO</span>
            </button>
          </div>

          {/* Column 2: Delivery Charges */}
          <div className="bg-white border border-[#deddd3] p-6 shadow-xs flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 border-b border-[#f0eee7] pb-3">
                <Truck className="w-5 h-5 text-[#073a2d]" />
                <div>
                  <h3 className="font-serif font-medium text-[#1b1c18]">Delivery Charges</h3>
                  <p className="text-[11px] text-[#717975]">Nationwide fulfillment rates</p>
                </div>
              </div>

              <div className="p-3 bg-[#fbf9f2] border border-[#deddd3] flex items-start gap-2.5 text-xs text-[#404945]">
                <Truck className="w-4 h-4 text-[#073a2d] shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-[#1b1c18]">Bangladesh Grid Routing</strong>
                  <span className="text-[11px] text-[#717975]">
                    Standard 24–48h Dhaka Metro, 72h Nationwide.
                  </span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#717975]">
                    DHAKA METRO DELIVERY
                  </label>
                  <span className="text-[10px] text-[#717975]">City Courier</span>
                </div>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#717975]">
                    ৳
                  </span>
                  <input
                    type="number"
                    value={dhakaCharge}
                    onChange={(e) => setDhakaCharge(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-[#fbf9f2] border border-[#deddd3] text-xs font-semibold text-[#1b1c18] font-mono focus:border-[#073a2d] outline-hidden"
                  />
                </div>
                <p className="text-[10px] text-[#717975] mt-1">
                  Applies to all thanas within Dhaka North & South.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#717975]">
                    OUTSIDE DHAKA DELIVERY
                  </label>
                  <span className="text-[10px] text-[#717975]">Divisions & Districts</span>
                </div>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#717975]">
                    ৳
                  </span>
                  <input
                    type="number"
                    value={outsideCharge}
                    onChange={(e) => setOutsideCharge(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-[#fbf9f2] border border-[#deddd3] text-xs font-semibold text-[#1b1c18] font-mono focus:border-[#073a2d] outline-hidden"
                  />
                </div>
                <p className="text-[10px] text-[#717975] mt-1">
                  Steadfast / REDX dispatch across 64 districts.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#717975]">
                    FREE DELIVERY THRESHOLD
                  </label>
                  <span className="text-[10px] text-[#0d4d3b] font-bold">Min. Order Value</span>
                </div>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#717975]">
                    ৳
                  </span>
                  <input
                    type="number"
                    value={threshold}
                    onChange={(e) => setThreshold(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-[#fbf9f2] border border-[#deddd3] text-xs font-semibold text-[#1b1c18] font-mono focus:border-[#073a2d] outline-hidden"
                  />
                </div>
                <p className="text-[10px] text-[#717975] mt-1">
                  Orders equal or above ৳3,000 qualify automatically.
                </p>
              </div>
            </div>

            <button
              onClick={handleSaveDelivery}
              className="w-full py-2.5 bg-[#00231a] hover:bg-[#073a2d] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
            >
              <Truck className="w-4 h-4" />
              <span>UPDATE DELIVERY SETTINGS</span>
            </button>
          </div>

          {/* Column 3: Payment Methods */}
          <div className="bg-white border border-[#deddd3] p-6 shadow-xs flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 border-b border-[#f0eee7] pb-3">
                <CreditCard className="w-5 h-5 text-[#073a2d]" />
                <div>
                  <h3 className="font-serif font-medium text-[#1b1c18]">Payment Methods</h3>
                  <p className="text-[11px] text-[#717975]">Gateways & collection accounts</p>
                </div>
              </div>

              {/* Cash on Delivery */}
              <div className="p-3 bg-[#fbf9f2] border border-[#deddd3] space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-[#1b1c18]">Cash on Delivery (COD)</h4>
                    <p className="text-[10px] text-[#717975]">Doorstep settlement</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={cod}
                    onChange={(e) => setCod(e.target.checked)}
                    className="w-4 h-4 accent-[#073a2d]"
                  />
                </div>
                <p className="text-[10px] text-[#0d4d3b] font-medium">
                  Status: <strong>Active</strong> • Available nationwide
                </p>
              </div>

              {/* bKash Merchant */}
              <div className="p-3 bg-[#fbf9f2] border border-[#deddd3] space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-[#1b1c18]">bKash Merchant Gateway</h4>
                    <p className="text-[10px] text-[#717975]">Automated API PGW</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={bkash}
                    onChange={(e) => setBkash(e.target.checked)}
                    className="w-4 h-4 accent-[#073a2d]"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-wider text-[#717975]">
                    MERCHANT WALLET
                  </label>
                  <input
                    type="text"
                    value={bkashWallet}
                    onChange={(e) => setBkashWallet(e.target.value)}
                    className="w-full mt-1 px-2.5 py-1.5 bg-white border border-[#deddd3] text-xs font-mono text-[#1b1c18] focus:border-[#073a2d] outline-hidden"
                  />
                </div>
              </div>

              {/* Nagad Merchant */}
              <div className="p-3 bg-[#fbf9f2] border border-[#deddd3] space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-[#1b1c18]">Nagad Merchant</h4>
                    <p className="text-[10px] text-[#717975]">Direct Mobile Settlement</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={nagad}
                    onChange={(e) => setNagad(e.target.checked)}
                    className="w-4 h-4 accent-[#073a2d]"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-wider text-[#717975]">
                    MERCHANT WALLET
                  </label>
                  <input
                    type="text"
                    value={nagadWallet}
                    onChange={(e) => setNagadWallet(e.target.value)}
                    className="w-full mt-1 px-2.5 py-1.5 bg-white border border-[#deddd3] text-xs font-mono text-[#1b1c18] focus:border-[#073a2d] outline-hidden"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleSavePayment}
              className="w-full py-2.5 bg-[#00231a] hover:bg-[#073a2d] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>SAVE PAYMENT SETTINGS</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
