'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Download,
  Plus,
  ArrowUpRight,
  ShoppingBag,
  Users,
  Shirt,
  Banknote,
  Truck,
  Eye,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';

export default function DashboardPage() {
  const { orders, inventory, updateInventoryStock } = useAdmin();
  const [activeRange, setActiveRange] = useState<'7' | '30' | 'month'>('7');
  const [selectedRestockItem, setSelectedRestockItem] = useState<string | null>(null);
  const [restockAmount, setRestockAmount] = useState('10');

  // Low stock products from inventory
  const lowStockItems = inventory.filter((item) => item.stock <= 5);

  const handleRestock = (id: string) => {
    const item = inventory.find((i) => i.id === id);
    if (!item) return;
    const addCount = parseInt(restockAmount, 10) || 10;
    updateInventoryStock(id, item.stock + addCount);
    setSelectedRestockItem(null);
  };

  const handleExport = () => {
    alert('Atelier Suite: Exporting Sartorial Performance Ledger (.CSV)...');
  };

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
                ৳85,400
              </h3>
            </div>
            <div className="w-9 h-9 bg-[#fbf9f2] border border-[#deddd3] flex items-center justify-center text-[#073a2d]">
              <Banknote className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-[#0d4d3b] bg-[#b0ecd3]/40 px-1.5 py-0.5">
              <ArrowUpRight className="w-3 h-3" /> +12%
            </span>
            <span className="text-[11px] text-[#717975]">vs. last cycle</span>
          </div>
          <div className="mt-4 pt-3 border-t border-[#f0eee7] flex items-center justify-between text-[11px] text-[#69726d]">
            <span>Settled via bKash/SSL/COD</span>
            <ArrowUpRight className="w-3 h-3 text-[#c79a45]" />
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
                42
              </h3>
            </div>
            <div className="w-9 h-9 bg-[#fbf9f2] border border-[#deddd3] flex items-center justify-center text-[#073a2d]">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="inline-flex items-center text-[11px] font-semibold text-[#8c6722] bg-[#f5eedf] px-1.5 py-0.5">
              6 pending dispatch
            </span>
            <span className="text-[11px] text-[#717975]">Dhaka atelier</span>
          </div>
          <div className="mt-4 pt-3 border-t border-[#f0eee7] flex items-center justify-between text-[11px] text-[#69726d]">
            <span>Delivery rate: 94.3%</span>
            <Truck className="w-3 h-3 text-[#073a2d]" />
          </div>
        </div>

        {/* Catalog Silhouette */}
        <div className="bg-white border border-[#deddd3] p-5 shadow-xs relative overflow-hidden group hover:border-[#c79a45] transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#717975]">
                CATALOG SILHOUETTE
              </p>
              <h3 className="text-2xl font-serif font-medium text-[#1b1c18] mt-2">
                128
              </h3>
            </div>
            <div className="w-9 h-9 bg-[#fbf9f2] border border-[#deddd3] flex items-center justify-center text-[#073a2d]">
              <Shirt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="inline-flex items-center text-[11px] font-semibold text-[#073a2d] bg-[#bcedda]/50 px-1.5 py-0.5">
              Active in catalog
            </span>
            <span className="text-[11px] text-[#717975]">4 collections</span>
          </div>
          <div className="mt-4 pt-3 border-t border-[#f0eee7] flex items-center justify-between text-[11px] text-[#69726d]">
            <span>Handloom & Pure Silk</span>
            <Sparkles className="w-3 h-3 text-[#c79a45]" />
          </div>
        </div>

        {/* Clientele Roster */}
        <div className="bg-white border border-[#deddd3] p-5 shadow-xs relative overflow-hidden group hover:border-[#c79a45] transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#717975]">
                CLIENTELE ROSTER
              </p>
              <h3 className="text-2xl font-serif font-medium text-[#1b1c18] mt-2">
                326
              </h3>
            </div>
            <div className="w-9 h-9 bg-[#fbf9f2] border border-[#deddd3] flex items-center justify-center text-[#073a2d]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="inline-flex items-center text-[11px] font-semibold text-[#0d4d3b] bg-[#b0ecd3]/40 px-1.5 py-0.5">
              +14 new this month
            </span>
            <span className="text-[11px] text-[#717975]">82% repeat tier</span>
          </div>
          <div className="mt-4 pt-3 border-t border-[#f0eee7] flex items-center justify-between text-[11px] text-[#69726d]">
            <span>VIP Membership: 48</span>
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
              onClick={() => setActiveRange('7')}
              className={`px-3 py-1 text-xs font-semibold tracking-wider uppercase transition-colors ${
                activeRange === '7'
                  ? 'bg-[#00231a] text-white'
                  : 'text-[#404945] hover:text-[#1b1c18]'
              }`}
            >
              LAST 7 DAYS
            </button>
            <button
              onClick={() => setActiveRange('30')}
              className={`px-3 py-1 text-xs font-semibold tracking-wider uppercase transition-colors ${
                activeRange === '30'
                  ? 'bg-[#00231a] text-white'
                  : 'text-[#404945] hover:text-[#1b1c18]'
              }`}
            >
              LAST 30 DAYS
            </button>
            <button
              onClick={() => setActiveRange('month')}
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
              <span className="font-medium">Metropolitan Dhaka</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#c79a45]" />
              <span className="font-medium">National Division</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[#8c6722] bg-[#f5eedf] px-2.5 py-1 text-[11px] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#c79a45]" />
            <span>Peak: ৳18,200 on Thursday Atelier Showcase</span>
          </div>
        </div>

        {/* SVG Chart */}
        <div className="relative pt-6 pb-2">
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
              <text x="10" y="35" fontSize="10" fill="#717975" fontFamily="Plus Jakarta Sans">20k</text>
              <text x="10" y="85" fontSize="10" fill="#717975" fontFamily="Plus Jakarta Sans">15k</text>
              <text x="10" y="135" fontSize="10" fill="#717975" fontFamily="Plus Jakarta Sans">10k</text>
              <text x="10" y="185" fontSize="10" fill="#717975" fontFamily="Plus Jakarta Sans">5.0k</text>

              {/* Gold Bars (National Division) */}
              <rect x="75" y="140" width="16" height="40" fill="url(#barGrad)" />
              <rect x="165" y="110" width="16" height="70" fill="url(#barGrad)" />
              <rect x="255" y="130" width="16" height="50" fill="url(#barGrad)" />
              <rect x="345" y="90" width="16" height="90" fill="url(#barGrad)" />
              <rect x="435" y="75" width="16" height="105" fill="url(#barGrad)" />
              <rect x="525" y="45" width="16" height="135" fill="url(#barGrad)" />
              <rect x="615" y="100" width="16" height="80" fill="url(#barGrad)" />

              {/* Area spline path */}
              <path
                d="M 83 140 C 120 140, 140 100, 173 100 C 210 100, 230 135, 263 135 C 290 135, 330 95, 353 95 C 390 95, 420 75, 443 75 C 480 75, 510 38, 533 38 C 570 38, 600 85, 623 85 L 623 180 L 83 180 Z"
                fill="url(#salesGrad)"
              />

              {/* Line stroke */}
              <path
                d="M 83 140 C 120 140, 140 100, 173 100 C 210 100, 230 135, 263 135 C 290 135, 330 95, 353 95 C 390 95, 420 75, 443 75 C 480 75, 510 38, 533 38 C 570 38, 600 85, 623 85"
                fill="none"
                stroke="#073a2d"
                strokeWidth="2.5"
              />

              {/* Data points */}
              <circle cx="83" cy="140" r="3.5" fill="#073a2d" />
              <circle cx="173" cy="100" r="3.5" fill="#073a2d" />
              <circle cx="263" cy="135" r="3.5" fill="#073a2d" />
              <circle cx="353" cy="95" r="3.5" fill="#073a2d" />
              <circle cx="443" cy="75" r="3.5" fill="#073a2d" />
              <circle cx="533" cy="38" r="5" fill="#c79a45" stroke="#00231a" strokeWidth="2" />
              <circle cx="623" cy="85" r="3.5" fill="#073a2d" />

              {/* Peak Tooltip tag */}
              <g transform="translate(500, 12)">
                <rect x="0" y="0" width="66" height="20" fill="#073a2d" />
                <text x="33" y="14" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle">
                  ৳18,200
                </text>
              </g>

              {/* Day Labels */}
              <text x="83" y="205" fontSize="11" fill="#717975" textAnchor="middle">Sat</text>
              <text x="173" y="205" fontSize="11" fill="#717975" textAnchor="middle">Sun</text>
              <text x="263" y="205" fontSize="11" fill="#717975" textAnchor="middle">Mon</text>
              <text x="353" y="205" fontSize="11" fill="#717975" textAnchor="middle">Tue</text>
              <text x="443" y="205" fontSize="11" fill="#717975" textAnchor="middle">Wed</text>
              <text x="533" y="205" fontSize="11" fill="#073a2d" fontWeight="bold" textAnchor="middle">Thu</text>
              <text x="623" y="205" fontSize="11" fill="#717975" textAnchor="middle">Fri</text>
            </svg>
          </div>
        </div>

        {/* 3 Metric Pills below chart */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#f0eee7]">
          <div className="flex items-center gap-3 bg-[#fbf9f2] p-3.5 border border-[#deddd3]">
            <div className="w-8 h-8 bg-[#f0eee7] flex items-center justify-center text-[#073a2d]">
              <Banknote className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-semibold text-[#717975]">AVERAGE ORDER VALUE</p>
              <p className="text-base font-serif font-bold text-[#1b1c18]">৳ 2,033</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-[#fbf9f2] p-3.5 border border-[#deddd3]">
            <div className="w-8 h-8 bg-[#bcedda]/40 flex items-center justify-center text-[#0d4d3b]">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-semibold text-[#717975]">CONVERSION RATE</p>
              <p className="text-base font-serif font-bold text-[#1b1c18]">
                3.8% <span className="text-xs font-sans font-normal text-[#0d4d3b] ml-1">+0.6%</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-[#fbf9f2] p-3.5 border border-[#deddd3]">
            <div className="w-8 h-8 bg-[#f5eedf] flex items-center justify-center text-[#8c6722]">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-semibold text-[#717975]">FULFILLMENT VELOCITY</p>
              <p className="text-base font-serif font-bold text-[#1b1c18]">21.4 hrs</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2-Column Section: Recent Orders & Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Recent Orders (7 cols) */}
        <div className="lg:col-span-8 bg-white border border-[#deddd3] p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#deddd3]">
              <div>
                <h3 className="text-base font-serif font-medium text-[#1b1c18]">Recent Orders</h3>
                <p className="text-xs text-[#717975]">Real-time atelier purchases & COD bookings</p>
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
                    <th className="py-2.5 font-semibold text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0eee7]">
                  {orders.slice(0, 5).map((order) => {
                    const statusColor =
                      order.status === 'PENDING'
                        ? 'bg-[#f5eedf] text-[#8c6722]'
                        : order.status === 'SHIPPED'
                        ? 'bg-[#bcedda]/50 text-[#0d4d3b]'
                        : order.status === 'DELIVERED'
                        ? 'bg-[#b0ecd3]/50 text-[#073a2d]'
                        : order.status === 'PROCESSING'
                        ? 'bg-[#e4e2dc] text-[#404945]'
                        : 'bg-[#ffdad6] text-[#ba1a1a]';

                    return (
                      <tr key={order.id} className="hover:bg-[#fbf9f2] transition-colors">
                        <td className="py-3 font-semibold text-[#073a2d]">{order.id}</td>
                        <td className="py-3">
                          <span className="font-medium text-[#1b1c18]">{order.customerName}</span>
                          <span className="text-[11px] text-[#717975] block">
                            {order.customerLocation}
                          </span>
                        </td>
                        <td className="py-3 font-medium">
                          ৳{order.amount}
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
                        <td className="py-3 text-right">
                          <Link
                            href="/orders"
                            className="p-1.5 text-[#717975] hover:text-[#073a2d] inline-block"
                            title="View order details"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-[#f0eee7] flex items-center justify-between text-xs text-[#717975]">
            <span>Showing 5 of {orders.length} transactions</span>
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
                <h3 className="text-base font-serif font-medium text-[#1b1c18]">Low Stock Products</h3>
                <p className="text-xs text-[#717975]">Priority restocking needed for atelier loom</p>
              </div>
              <div className="w-7 h-7 bg-[#ffdad6]/60 text-[#ba1a1a] flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {lowStockItems.slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2.5 border border-[#deddd3] bg-[#fbf9f2] hover:border-[#c79a45] transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 bg-[#073a2d] text-white flex items-center justify-center shrink-0">
                      <Shirt className="w-5 h-5 text-[#bcedda]" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[#1b1c18] line-clamp-1">{item.name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[11px] text-[#717975]">Stock: {item.stock} units</span>
                        <span
                          className={`text-[9px] px-1 py-0.2 font-semibold uppercase ${
                            item.stock === 0
                              ? 'bg-[#ffdad6] text-[#ba1a1a]'
                              : 'bg-[#f5eedf] text-[#8c6722]'
                          }`}
                        >
                          {item.stock === 0 ? 'Out of Stock' : 'Low Stock'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedRestockItem(item.id)}
                    className="px-2.5 py-1.5 bg-[#00231a] hover:bg-[#073a2d] text-white text-[10px] font-semibold tracking-wider uppercase transition-colors shrink-0"
                  >
                    + RESTOCK
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-[#f0eee7] flex items-center justify-between text-xs text-[#717975]">
            <span>{lowStockItems.length} items require yarn requisition</span>
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
                onClick={() => setSelectedRestockItem(null)}
                className="px-4 py-2 border border-[#deddd3] text-xs font-medium text-[#717975] hover:bg-[#f0eee7]"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRestock(selectedRestockItem)}
                className="px-4 py-2 bg-[#073a2d] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#0d4d3b]"
              >
                Confirm Restock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Master Loom Synchronization Footer Bar */}
      <div className="p-4 bg-white border border-[#deddd3] flex flex-col sm:flex-row items-center justify-between text-xs text-[#717975] gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#0d4d3b]" />
          <span>Rongin Libas Atelier Suite • Master Loom Synchronization: <strong>99.8% Nominal</strong></span>
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
