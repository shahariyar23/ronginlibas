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
  Check,
  Truck,
  CreditCard,
  Building2,
  Phone,
  Globe,
  Share2,
  History,
  X,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  RotateCcw,
  FileText,
} from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import { InventoryItem, InventoryTransactionRecord } from '@/data/adminData';
import { TablePageSkeleton } from '@/components/common/Skeleton';

function getInventoryStatus(
  item: InventoryItem,
  stock = item.available,
): InventoryItem['status'] {
  if (stock <= 0) return 'OUT OF STOCK';
  return stock <= (item.alertThreshold ?? 5) ? 'LOW STOCK' : 'IN STOCK';
}

const ADJUSTMENT_REASONS = [
  { value: 'RESTOCK', label: 'RESTOCK — Inventory replenishment / batch receipt' },
  { value: 'SALE', label: 'SALE — Direct / manual counter sale deduction' },
  { value: 'RETURN', label: 'RETURN — Customer return restocked to inventory' },
  { value: 'EXCHANGE', label: 'EXCHANGE — Variant size / color exchange' },
  { value: 'DAMAGED', label: 'DAMAGED — Atelier defect / fabric damage write-off' },
  { value: 'LOST', label: 'LOST — Inventory count discrepancy / shrinkage' },
  { value: 'MANUAL_ADJUSTMENT', label: 'MANUAL_ADJUSTMENT — Physical cycle count reconciliation' },
  { value: 'ORDER_CANCELLED', label: 'ORDER_CANCELLED — Restocked from cancelled order' },
];

export default function InventoryPage() {
  const {
    inventory,
    updateInventoryStock,
    getVariantHistory,
    settings,
    updateSettings,
    isLoading,
    inventoryLoadError,
    refreshData,
  } = useAdmin();

  const [search, setSearch] = useState('');
  const [filterTab, setFilterTab] = useState<'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'>('ALL');
  const [stockEdits, setStockEdits] = useState<{ [id: string]: number }>({});
  const [savingStockId, setSavingStockId] = useState<string | null>(null);

  // Adjustment Modal State
  const [adjustModalItem, setAdjustModalItem] = useState<InventoryItem | null>(null);
  const [adjustTargetStock, setAdjustTargetStock] = useState<number>(0);
  const [adjustDelta, setAdjustDelta] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState<string>('RESTOCK');
  const [adjustNote, setAdjustNote] = useState<string>('');
  const [isSubmittingAdjust, setIsSubmittingAdjust] = useState<boolean>(false);

  // History Ledger Modal State
  const [historyModalItem, setHistoryModalItem] = useState<InventoryItem | null>(null);
  const [historyRecords, setHistoryRecords] = useState<InventoryTransactionRecord[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);

  // Settings saving states
  const [isSavingStoreInfo, setIsSavingStoreInfo] = useState<boolean>(false);
  const [isSavingDelivery, setIsSavingDelivery] = useState<boolean>(false);
  const [isSavingPayment, setIsSavingPayment] = useState<boolean>(false);

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

  // Compute stat counts from real inventory values
  const totalCount = inventory.length;
  const inStockCount = inventory.filter((item) => getInventoryStatus(item) === 'IN STOCK').length;
  const lowStockCount = inventory.filter((item) => getInventoryStatus(item) === 'LOW STOCK').length;
  const outOfStockCount = inventory.filter((item) => getInventoryStatus(item) === 'OUT OF STOCK').length;

  const filteredInventory = inventory.filter((item) => {
    const query = search.trim().toLowerCase();
    const matchesSearch =
      !query ||
      item.name.toLowerCase().includes(query) ||
      item.sku.toLowerCase().includes(query) ||
      (item.category && item.category.toLowerCase().includes(query)) ||
      (item.size && item.size.toLowerCase().includes(query)) ||
      (item.color && item.color.toLowerCase().includes(query));

    const status = getInventoryStatus(item);
    const matchesTab = filterTab === 'ALL' || status === filterTab.replaceAll('_', ' ');
    return matchesSearch && matchesTab;
  });

  const getStockValue = (item: InventoryItem) => {
    return stockEdits[item.id] !== undefined ? stockEdits[item.id] : item.available;
  };

  const handleAdjust = (id: string, delta: number) => {
    const item = inventory.find((i) => i.id === id);
    if (!item) return;
    const current = getStockValue(item);
    const updated = Math.max(0, current + delta);
    setStockEdits((prev) => ({
      ...prev,
      [id]: updated,
    }));
  };

  const handleOpenAdjustModal = (item: InventoryItem) => {
    const targetStock = getStockValue(item);
    const delta = targetStock - item.available;
    if (delta === 0) return;

    setAdjustModalItem(item);
    setAdjustTargetStock(targetStock);
    setAdjustDelta(delta);
    setAdjustReason(delta > 0 ? 'RESTOCK' : 'MANUAL_ADJUSTMENT');
    setAdjustNote('');
  };

  const handleConfirmAdjust = async () => {
    if (!adjustModalItem) return;
    setIsSubmittingAdjust(true);
    setSavingStockId(adjustModalItem.id);

    try {
      const saved = await updateInventoryStock(
        adjustModalItem.id,
        adjustTargetStock,
        adjustReason,
        adjustNote.trim() || undefined,
      );

      if (saved) {
        setStockEdits((prev) => {
          const copy = { ...prev };
          delete copy[adjustModalItem.id];
          return copy;
        });
        setAdjustModalItem(null);
      }
    } finally {
      setIsSubmittingAdjust(false);
      setSavingStockId(null);
    }
  };

  const handleOpenHistoryModal = async (item: InventoryItem) => {
    setHistoryModalItem(item);
    setIsLoadingHistory(true);
    try {
      const records = await getVariantHistory(item.variantId || item.id);
      setHistoryRecords(records);
    } catch {
      setHistoryRecords([]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleExportCsv = () => {
    const headers = [
      'Product',
      'SKU',
      'Category',
      'Size',
      'Color',
      'On Hand',
      'Reserved',
      'Available',
      'Alert Threshold',
      'Status',
    ];
    const rows = filteredInventory.map((item) => [
      `"${item.name.replace(/"/g, '""')}"`,
      `"${item.sku}"`,
      `"${item.category || ''}"`,
      `"${item.size || ''}"`,
      `"${item.color || ''}"`,
      item.onHand,
      item.reserved,
      item.available,
      item.alertThreshold ?? 5,
      `"${item.status}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `rongin_libas_inventory_ledger_${new Date().toISOString().split('T')[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveStoreInfo = async () => {
    setIsSavingStoreInfo(true);
    try {
      await updateSettings({ storeName, phone, whatsapp, website, facebook });
    } finally {
      setIsSavingStoreInfo(false);
    }
  };

  const handleSaveDelivery = async () => {
    setIsSavingDelivery(true);
    try {
      await updateSettings({
        dhakaDeliveryCharge: parseFloat(dhakaCharge) || 80,
        outsideDhakaDeliveryCharge: parseFloat(outsideCharge) || 150,
        freeDeliveryThreshold: parseFloat(threshold) || 3000,
      });
    } finally {
      setIsSavingDelivery(false);
    }
  };

  const handleSavePayment = async () => {
    setIsSavingPayment(true);
    try {
      await updateSettings({
        codEnabled: cod,
        bkashEnabled: bkash,
        bkashWallet,
        nagadEnabled: nagad,
        nagadWallet,
      });
    } finally {
      setIsSavingPayment(false);
    }
  };

  if (isLoading) {
    return (
      <TablePageSkeleton
        title="Atelier Inventory & Warehousing"
        showAddButton={false}
        rowCount={8}
      />
    );
  }

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
              {totalCount} <span className="text-xs font-sans text-[#717975]">variants</span>
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
              {inStockCount} <span className="text-xs font-sans text-[#0d4d3b]">Healthy</span>
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
              {lowStockCount} <span className="text-xs font-sans text-[#8c6722]">Restock soon</span>
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
              {outOfStockCount} <span className="text-xs font-sans text-[#ba1a1a]">Replenish</span>
            </h3>
          </div>
          <div className="w-10 h-10 bg-[#ffdad6]/60 flex items-center justify-center text-[#ba1a1a]">
            <XCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Inventory & Stock Levels Table Section */}
      <div className="bg-white border border-[#deddd3] p-6 shadow-xs space-y-6">
        {inventoryLoadError && (
          <div
            role="alert"
            className="flex flex-col gap-2 border border-[#ba1a1a]/20 bg-[#ba1a1a]/5 px-4 py-3 text-sm text-[#9b1c1c] sm:flex-row sm:items-center sm:justify-between"
          >
            <span>{inventoryLoadError}</span>
            <button
              type="button"
              onClick={refreshData}
              className="self-start font-semibold underline sm:self-auto cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-xl font-medium text-[#1b1c18]">
              Variant-Level Inventory & Ledger
            </h2>
            <p className="text-xs text-[#717975] mt-0.5">
              Real-time physical on-hand, reserved orders, and available saleable stock across Dhaka atelier.
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-[#717975] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by product, SKU, size, color..."
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
              className={`px-3 py-1 font-bold tracking-wider uppercase transition-colors cursor-pointer ${
                filterTab === 'ALL'
                  ? 'bg-[#00231a] text-white'
                  : 'text-[#404945] hover:text-[#1b1c18] bg-[#fbf9f2] border border-[#deddd3]'
              }`}
            >
              ALL PRODUCTS ({totalCount})
            </button>
            <button
              onClick={() => setFilterTab('IN_STOCK')}
              className={`px-3 py-1 font-bold tracking-wider uppercase transition-colors cursor-pointer ${
                filterTab === 'IN_STOCK'
                  ? 'bg-[#00231a] text-white'
                  : 'text-[#073a2d] hover:text-[#1b1c18] bg-[#fbf9f2] border border-[#deddd3]'
              }`}
            >
              IN STOCK ({inStockCount})
            </button>
            <button
              onClick={() => setFilterTab('LOW_STOCK')}
              className={`px-3 py-1 font-bold tracking-wider uppercase transition-colors cursor-pointer ${
                filterTab === 'LOW_STOCK'
                  ? 'bg-[#00231a] text-white'
                  : 'text-[#8c6722] hover:text-[#1b1c18] bg-[#fbf9f2] border border-[#deddd3]'
              }`}
            >
              LOW STOCK ({lowStockCount})
            </button>
            <button
              onClick={() => setFilterTab('OUT_OF_STOCK')}
              className={`px-3 py-1 font-bold tracking-wider uppercase transition-colors cursor-pointer ${
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
              <span>In Stock (&gt; threshold)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#c79a45]" />
              <span>Low Stock (≤ threshold)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#ba1a1a]" />
              <span>Out of Stock (0)</span>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="border border-[#deddd3] overflow-x-auto">
          <table className="w-full text-xs text-left min-w-[980px]">
            <thead>
              <tr className="border-b border-[#deddd3] bg-[#fbf9f2] text-[#717975] uppercase text-[10px] tracking-wider">
                <th className="py-3 px-3 font-semibold">PRODUCT</th>
                <th className="py-3 px-3 font-semibold">SKU</th>
                <th className="py-3 px-3 font-semibold">CATEGORY</th>
                <th className="py-3 px-3 font-semibold">SIZE</th>
                <th className="py-3 px-3 font-semibold">COLOR</th>
                <th className="py-3 px-3 text-center font-semibold">ON HAND</th>
                <th className="py-3 px-3 text-center font-semibold">RESERVED</th>
                <th className="py-3 px-3 text-center font-semibold">AVAILABLE</th>
                <th className="py-3 px-3 font-semibold">STATUS</th>
                <th className="py-3 px-3 text-center font-semibold">QUICK STOCK UPDATE</th>
                <th className="py-3 px-3 text-center font-semibold">LEDGER</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0eee7]">
              {filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-[#717975]">
                    <Warehouse className="w-8 h-8 mx-auto mb-2 opacity-40 text-[#717975]" />
                    <p className="font-serif text-sm text-[#1b1c18]">No inventory entries found</p>
                    <p className="text-[11px] text-[#717975]">
                      Stock levels will synchronize automatically as products and variants are created.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredInventory.map((item) => {
                  const currentAvailable = getStockValue(item);
                  const isModified = stockEdits[item.id] !== undefined;
                  const currentStatus = getInventoryStatus(item, currentAvailable);

                  return (
                    <tr key={item.id} className="hover:bg-[#fbf9f2] transition-colors">
                      {/* Product Thumbnail & Name */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-12 bg-[#f0eee7] border border-[#deddd3] relative overflow-hidden shrink-0">
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                          <div className="min-w-0 max-w-[200px]">
                            <p className="font-serif font-medium text-[#1b1c18] text-xs truncate">
                              {item.name}
                            </p>
                            <p className="text-[10px] text-[#717975] truncate">
                              Threshold: {item.alertThreshold ?? 5} units
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* SKU */}
                      <td className="py-3 px-3 font-mono font-medium text-[#404945] whitespace-nowrap">
                        {item.sku}
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 bg-[#f0eee7] text-[10px] border border-[#deddd3] text-[#404945]">
                          {item.category || 'Atelier'}
                        </span>
                      </td>

                      {/* Size */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 bg-[#fbf9f2] text-[10px] font-mono font-bold border border-[#deddd3] text-[#1b1c18]">
                          {item.size || 'Standard'}
                        </span>
                      </td>

                      {/* Color */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-white text-[10px] border border-[#deddd3] text-[#404945]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#073a2d]/70" />
                          {item.color || 'Standard'}
                        </span>
                      </td>

                      {/* On Hand */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <div className="font-mono font-bold text-xs text-[#1b1c18]">
                          {item.onHand}
                        </div>
                        <span className="text-[9px] text-[#717975] uppercase">Warehouse</span>
                      </td>

                      {/* Reserved */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        {item.reserved > 0 ? (
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-[#f5eedf] text-[#8c6722] text-[10px] font-mono font-bold border border-[#e8dbbf]">
                            {item.reserved}
                          </span>
                        ) : (
                          <span className="font-mono text-xs text-[#717975]">0</span>
                        )}
                        <span className="block text-[9px] text-[#717975] uppercase">Pending</span>
                      </td>

                      {/* Available */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <div
                          className={`font-serif font-bold text-sm ${
                            currentAvailable <= 0
                              ? 'text-[#ba1a1a]'
                              : currentAvailable <= (item.alertThreshold ?? 5)
                              ? 'text-[#8c6722]'
                              : 'text-[#073a2d]'
                          }`}
                        >
                          {currentAvailable}
                        </div>
                        <span className="text-[9px] text-[#717975] uppercase">Saleable</span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {currentStatus === 'IN STOCK' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-[#b0ecd3]/40 text-[#073a2d] border border-[#a1d1be]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#0d4d3b]" />
                            IN STOCK
                          </span>
                        ) : currentStatus === 'LOW STOCK' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-[#f5eedf] text-[#8c6722] border border-[#e8dbbf]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#c79a45]" />
                            LOW STOCK
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-[#ffdad6] text-[#ba1a1a] border border-[#f5b8b8]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a]" />
                            OUT OF STOCK
                          </span>
                        )}
                      </td>

                      {/* Quick Stock Update */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <div className="inline-flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleAdjust(item.id, -1)}
                            disabled={savingStockId === item.id}
                            className="w-6 h-6 bg-[#f0eee7] border border-[#deddd3] text-xs font-bold text-[#1b1c18] hover:bg-[#e4e2dc] transition-colors cursor-pointer disabled:opacity-50"
                            title="Decrease available stock"
                          >
                            -
                          </button>
                          <span
                            className={`w-8 text-center font-mono font-bold text-xs ${
                              isModified ? 'text-[#073a2d] bg-[#bcedda]/30 py-0.5' : 'text-[#1b1c18]'
                            }`}
                          >
                            {currentAvailable}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleAdjust(item.id, 1)}
                            disabled={savingStockId === item.id}
                            className="w-6 h-6 bg-[#f0eee7] border border-[#deddd3] text-xs font-bold text-[#1b1c18] hover:bg-[#e4e2dc] transition-colors cursor-pointer disabled:opacity-50"
                            title="Increase available stock"
                          >
                            +
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenAdjustModal(item)}
                            disabled={!isModified || savingStockId === item.id}
                            className={`ml-1.5 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1 ${
                              isModified && savingStockId !== item.id
                                ? 'bg-[#073a2d] text-white hover:bg-[#0d4d3b] shadow-xs'
                                : 'bg-[#deddd3] text-[#717975] cursor-not-allowed'
                            }`}
                          >
                            {savingStockId === item.id ? (
                              <>
                                <Loader2 className="w-2.5 h-2.5 animate-spin" />
                                <span>SAVING</span>
                              </>
                            ) : (
                              'SAVE'
                            )}
                          </button>
                          {isModified && (
                            <button
                              type="button"
                              onClick={() => {
                                setStockEdits((prev) => {
                                  const copy = { ...prev };
                                  delete copy[item.id];
                                  return copy;
                                });
                              }}
                              className="text-[#717975] hover:text-[#ba1a1a] p-1 cursor-pointer"
                              title="Reset changes"
                            >
                              <RotateCcw className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Stock History Ledger Button */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleOpenHistoryModal(item)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-semibold text-[#073a2d] hover:text-[#00231a] bg-[#fbf9f2] hover:bg-[#f0eee7] border border-[#deddd3] transition-colors cursor-pointer"
                          title="View variant stock movement history"
                        >
                          <History className="w-3 h-3 text-[#073a2d]" />
                          <span>Ledger</span>
                        </button>
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
            DISPLAYING {filteredInventory.length} OF {inventory.length} VARIANTS
          </span>
          <div className="flex items-center gap-3">
            <span className="text-[#69726d]">Audit documentation?</span>
            <button
              onClick={handleExportCsv}
              className="text-[#073a2d] font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Ledger (.csv)</span>
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          MODAL: QUICK STOCK ADJUSTMENT WITH REASON
         ========================================================================= */}
      {adjustModalItem && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border border-[#deddd3] max-w-lg w-full shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-[#deddd3] bg-[#fbf9f2] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#717975]">
                  STOCK ADJUSTMENT AUDIT
                </span>
                <h3 className="text-lg font-serif font-medium text-[#1b1c18] mt-0.5">
                  Confirm Stock Change
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setAdjustModalItem(null)}
                className="text-[#717975] hover:text-[#1b1c18] p-1.5 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {/* Variant Details Card */}
              <div className="p-3 bg-[#fbf9f2] border border-[#deddd3] flex items-center gap-3">
                <div className="w-12 h-14 bg-white border border-[#deddd3] relative overflow-hidden shrink-0">
                  <Image
                    src={adjustModalItem.image}
                    alt={adjustModalItem.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="min-w-0">
                  <h4 className="font-serif font-medium text-sm text-[#1b1c18] truncate">
                    {adjustModalItem.name}
                  </h4>
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-[#404945]">
                    <span className="font-mono bg-white px-1.5 py-0.5 border border-[#deddd3]">
                      SKU: {adjustModalItem.sku}
                    </span>
                    <span className="bg-white px-1.5 py-0.5 border border-[#deddd3]">
                      Size: {adjustModalItem.size}
                    </span>
                    <span className="bg-white px-1.5 py-0.5 border border-[#deddd3]">
                      Color: {adjustModalItem.color}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stock Movement Preview Grid */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-[#fbf9f2] border border-[#deddd3]">
                  <span className="text-[9px] uppercase font-bold text-[#717975]">Current Available</span>
                  <div className="text-lg font-serif font-bold text-[#404945] mt-0.5">
                    {adjustModalItem.available}
                  </div>
                  <span className="text-[9px] text-[#717975]">units</span>
                </div>
                <div className="p-3 bg-[#fbf9f2] border border-[#deddd3]">
                  <span className="text-[9px] uppercase font-bold text-[#717975]">Net Change</span>
                  <div
                    className={`text-lg font-serif font-bold mt-0.5 flex items-center justify-center gap-0.5 ${
                      adjustDelta > 0 ? 'text-[#0d4d3b]' : 'text-[#ba1a1a]'
                    }`}
                  >
                    {adjustDelta > 0 ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" />
                    )}
                    {adjustDelta > 0 ? `+${adjustDelta}` : adjustDelta}
                  </div>
                  <span className="text-[9px] text-[#717975]">units</span>
                </div>
                <div className="p-3 bg-[#fbf9f2] border border-[#deddd3]">
                  <span className="text-[9px] uppercase font-bold text-[#717975]">New Available</span>
                  <div className="text-lg font-serif font-bold text-[#073a2d] mt-0.5">
                    {adjustTargetStock}
                  </div>
                  <span className="text-[9px] text-[#717975]">
                    On Hand: {adjustTargetStock + adjustModalItem.reserved}
                  </span>
                </div>
              </div>

              {/* Reason Selection */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#717975] mb-1">
                  ADJUSTMENT REASON *
                </label>
                <select
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full px-3 py-2 bg-[#fbf9f2] border border-[#deddd3] text-xs font-semibold text-[#1b1c18] focus:border-[#073a2d] outline-hidden cursor-pointer"
                >
                  {ADJUSTMENT_REASONS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-[#717975] mt-1">
                  Required for inventory audit trail and stock ledger recording.
                </p>
              </div>

              {/* Note / Reference */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#717975] mb-1">
                  REFERENCE / AUDIT NOTE (OPTIONAL)
                </label>
                <input
                  type="text"
                  placeholder="e.g. PO-1029, Physical audit count, Customer exchange..."
                  value={adjustNote}
                  onChange={(e) => setAdjustNote(e.target.value)}
                  className="w-full px-3 py-2 bg-[#fbf9f2] border border-[#deddd3] text-xs text-[#1b1c18] focus:border-[#073a2d] outline-hidden placeholder-[#717975]"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 border-t border-[#deddd3] bg-[#fbf9f2] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setAdjustModalItem(null)}
                disabled={isSubmittingAdjust}
                className="px-4 py-2 border border-[#deddd3] bg-white text-xs font-bold uppercase tracking-wider text-[#404945] hover:bg-[#f0eee7] transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAdjust}
                disabled={isSubmittingAdjust}
                className="px-5 py-2 bg-[#00231a] hover:bg-[#073a2d] text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmittingAdjust ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>RECORDING...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>CONFIRM & APPLY</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: VARIANT STOCK HISTORY / TRANSACTION LEDGER
         ========================================================================= */}
      {historyModalItem && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border border-[#deddd3] max-w-3xl w-full shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-[#deddd3] bg-[#fbf9f2] flex items-center justify-between shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#073a2d]" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#717975]">
                    VARIANT INVENTORY LEDGER
                  </span>
                </div>
                <h3 className="text-lg font-serif font-medium text-[#1b1c18] mt-0.5">
                  Stock Movement History
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setHistoryModalItem(null)}
                className="text-[#717975] hover:text-[#1b1c18] p-1.5 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sub-header Variant Info */}
            <div className="p-4 bg-[#f0eee7]/60 border-b border-[#deddd3] flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
              <div>
                <p className="font-serif font-bold text-sm text-[#1b1c18]">
                  {historyModalItem.name}
                </p>
                <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[#717975]">
                  <span className="font-mono">SKU: {historyModalItem.sku}</span>
                  <span>•</span>
                  <span>Size: {historyModalItem.size}</span>
                  <span>•</span>
                  <span>Color: {historyModalItem.color}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[9px] uppercase font-bold text-[#717975] block">On Hand</span>
                  <span className="font-mono font-bold text-xs text-[#1b1c18]">
                    {historyModalItem.onHand}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] uppercase font-bold text-[#717975] block">Reserved</span>
                  <span className="font-mono font-bold text-xs text-[#8c6722]">
                    {historyModalItem.reserved}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] uppercase font-bold text-[#717975] block">Available</span>
                  <span className="font-mono font-bold text-xs text-[#073a2d]">
                    {historyModalItem.available}
                  </span>
                </div>
              </div>
            </div>

            {/* Ledger Content */}
            <div className="overflow-y-auto p-5 flex-1 space-y-4">
              {isLoadingHistory ? (
                <div className="py-16 text-center text-[#717975]">
                  <Loader2 className="w-7 h-7 mx-auto animate-spin text-[#073a2d] mb-2" />
                  <p className="text-xs">Loading transaction ledger from database...</p>
                </div>
              ) : historyRecords.length === 0 ? (
                <div className="py-16 text-center text-[#717975]">
                  <History className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="font-serif text-sm text-[#1b1c18]">No stock transactions logged yet</p>
                  <p className="text-xs text-[#717975] mt-1">
                    Direct sales, restocks, returns, and manual adjustments will appear here automatically.
                  </p>
                </div>
              ) : (
                <div className="border border-[#deddd3] overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-[#deddd3] bg-[#fbf9f2] text-[#717975] uppercase text-[9px] tracking-wider">
                        <th className="py-2.5 px-3 font-semibold">DATE & TIME</th>
                        <th className="py-2.5 px-3 text-center font-semibold">CHANGE</th>
                        <th className="py-2.5 px-3 font-semibold">REASON</th>
                        <th className="py-2.5 px-3 text-center font-semibold">STOCK FLOW</th>
                        <th className="py-2.5 px-3 font-semibold">REFERENCE / NOTE</th>
                        <th className="py-2.5 px-3 font-semibold">ACTOR</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f0eee7]">
                      {historyRecords.map((tx) => {
                        const dateStr = new Date(tx.createdAt).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        });

                        const actorName = tx.user
                          ? `${tx.user.firstName || ''} ${tx.user.lastName || ''}`.trim() || tx.user.email
                          : 'Admin System';

                        const reasonDisplay = tx.reason || tx.type;

                        return (
                          <tr key={tx.id} className="hover:bg-[#fbf9f2] transition-colors">
                            <td className="py-2.5 px-3 text-[#404945] whitespace-nowrap">
                              {dateStr}
                            </td>
                            <td className="py-2.5 px-3 text-center whitespace-nowrap">
                              <span
                                className={`inline-flex items-center gap-0.5 font-mono font-bold text-xs ${
                                  tx.quantityChange > 0
                                    ? 'text-[#0d4d3b]'
                                    : tx.quantityChange < 0
                                    ? 'text-[#ba1a1a]'
                                    : 'text-[#404945]'
                                }`}
                              >
                                {tx.quantityChange > 0 ? (
                                  <ArrowUpRight className="w-3.5 h-3.5" />
                                ) : tx.quantityChange < 0 ? (
                                  <ArrowDownRight className="w-3.5 h-3.5" />
                                ) : null}
                                {tx.quantityChange > 0 ? `+${tx.quantityChange}` : tx.quantityChange}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 whitespace-nowrap">
                              <span
                                className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border ${
                                  reasonDisplay === 'RESTOCK'
                                    ? 'bg-[#bcedda]/40 text-[#073a2d] border-[#a1d1be]'
                                    : reasonDisplay === 'SALE'
                                    ? 'bg-[#e2eafc] text-[#1e3a8a] border-[#bfdbfe]'
                                    : reasonDisplay === 'RETURN' || reasonDisplay === 'ORDER_CANCELLED'
                                    ? 'bg-[#f3e8ff] text-[#6b21a8] border-[#e9d5ff]'
                                    : reasonDisplay === 'DAMAGED' || reasonDisplay === 'LOST'
                                    ? 'bg-[#fee2e2] text-[#991b1b] border-[#fecaca]'
                                    : 'bg-[#f5eedf] text-[#8c6722] border-[#e8dbbf]'
                                }`}
                              >
                                {reasonDisplay}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-center font-mono text-[11px] text-[#404945] whitespace-nowrap">
                              {tx.previousStock} &rarr; {tx.newStock}
                            </td>
                            <td className="py-2.5 px-3 text-[#404945] max-w-[220px] truncate" title={tx.note || tx.reference || ''}>
                              {tx.reference ? (
                                <span className="font-semibold text-[#1b1c18] mr-1">
                                  {tx.reference}:
                                </span>
                              ) : null}
                              {tx.note || '—'}
                            </td>
                            <td className="py-2.5 px-3 text-[#717975] whitespace-nowrap">
                              {actorName}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#deddd3] bg-[#fbf9f2] flex items-center justify-between shrink-0">
              <span className="text-[10px] text-[#717975] uppercase">
                {historyRecords.length} RECORDED TRANSACTIONS
              </span>
              <button
                type="button"
                onClick={() => setHistoryModalItem(null)}
                className="px-4 py-1.5 border border-[#deddd3] bg-white text-xs font-bold uppercase tracking-wider text-[#404945] hover:bg-[#f0eee7] transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

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
                  className="px-2.5 py-1.5 border border-[#deddd3] text-[10px] font-bold uppercase tracking-wider bg-white hover:bg-[#f0eee7] cursor-pointer"
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
              type="button"
              disabled={isSavingStoreInfo}
              aria-busy={isSavingStoreInfo}
              onClick={handleSaveStoreInfo}
              className="w-full py-2.5 bg-[#00231a] hover:bg-[#073a2d] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSavingStoreInfo ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>SAVING STORE INFO...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>SAVE STORE INFO</span>
                </>
              )}
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
              type="button"
              disabled={isSavingDelivery}
              aria-busy={isSavingDelivery}
              onClick={handleSaveDelivery}
              className="w-full py-2.5 bg-[#00231a] hover:bg-[#073a2d] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSavingDelivery ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>UPDATING DELIVERY...</span>
                </>
              ) : (
                <>
                  <Truck className="w-4 h-4" />
                  <span>UPDATE DELIVERY SETTINGS</span>
                </>
              )}
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
                    className="w-4 h-4 accent-[#073a2d] cursor-pointer"
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
                    className="w-4 h-4 accent-[#073a2d] cursor-pointer"
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
                    className="w-4 h-4 accent-[#073a2d] cursor-pointer"
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
              type="button"
              disabled={isSavingPayment}
              aria-busy={isSavingPayment}
              onClick={handleSavePayment}
              className="w-full py-2.5 bg-[#00231a] hover:bg-[#073a2d] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSavingPayment ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>SAVING PAYMENT SETTINGS...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>SAVE PAYMENT SETTINGS</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
