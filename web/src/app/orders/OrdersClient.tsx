'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { products } from '@/data/products';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Package,
  Clock,
  CheckCircle2,
  Truck,
  Search,
  ArrowRight,
  Download,
  RotateCcw,
  Scissors,
  Crown,
  ChevronRight,
  Calendar,
  CreditCard,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';

interface OrderItem {
  name: string;
  category: string;
  image: string;
  color: string;
  size: string;
  qty: number;
  price: number;
}

interface OrderRecord {
  id: string;
  date: string;
  status: 'In Transit' | 'Delivered' | 'Cancelled';
  statusLabel: string;
  deliveryEta?: string;
  courier: string;
  trackingId: string;
  address: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: string;
}

const initialOrders: OrderRecord[] = [
  {
    id: 'RL-84920',
    date: '4 October 2026',
    status: 'In Transit',
    statusLabel: 'In Transit with Courier',
    deliveryEta: 'Tomorrow by 4:00 PM',
    courier: 'Pathao Express Courier',
    trackingId: 'PTH-982410-RL',
    address: 'House 42, Road 11, Block D, Banani, Dhaka Metro',
    items: [
      {
        name: 'The Royal Heritage Silk-Cotton Panjabi',
        category: 'Panjabi',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAbKFoOOtlagDwzcYDnxXvniQzbARJlxOUwkcgwN5zO5GpwwhIJPiwjSKxJjBebcu9cpNG1UWQ5Da1-Ml_87fMVpXLw9dEquhak16BWycGPLsI1-CdQUkRRP4k_CDKCQubSfx41r1uJAuyBOcY4HQ9x9dum1AQKVjcJXQjeWY1iGkAuHAWuFcMVmXVuMsxgQGVTAs-KT5THFHpnZMBId6uGKCpMzFRdtXtTWY372sGMRnPObWwzPhRhGw',
        color: 'Forest Emerald',
        size: '40',
        qty: 1,
        price: 3850,
      },
      {
        name: 'Mercerized Silk-Blend Pique Polo',
        category: 'Polo',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCH0Y4iP3r07gM-q_4FwG2277d01h6oB_l_XfC0-x0xKkX2n_Y1m_4b3A2qZ5y7g9e4f6d8c0b2a4e6f8d0b2c4e6f8a0b2c4e6',
        color: 'Alabaster Ivory',
        size: 'L',
        qty: 1,
        price: 2450,
      },
    ],
    subtotal: 6300,
    deliveryFee: 0,
    total: 6300,
    paymentMethod: 'bKash Merchant Pay (Verified)',
  },
  {
    id: 'RL-2026-90412',
    date: '18 September 2026',
    status: 'Delivered',
    statusLabel: 'Delivered & Open-Box Checked',
    courier: 'Steadfast Courier Dhaka',
    trackingId: 'STF-841920-RL',
    address: 'House 42, Road 11, Block D, Banani, Dhaka Metro',
    items: [
      {
        name: 'Aristocratic Jacquard Silk Panjabi',
        category: 'Panjabi',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC1a7o8b_29e37_mQ80n73vL_5x9b3a0c2e4f6d8a0b2c4e6f8d0b2c4e6f8a0b2c4e6',
        color: 'Midnight Sapphire',
        size: '42',
        qty: 1,
        price: 4250,
      },
    ],
    subtotal: 4250,
    deliveryFee: 0,
    total: 4250,
    paymentMethod: 'Cash on Doorstep Delivery (COD)',
  },
  {
    id: 'RL-2026-88401',
    date: '28 August 2026',
    status: 'Delivered',
    statusLabel: 'Delivered & Confirmed',
    courier: 'Pathao Courier Dhaka',
    trackingId: 'PTH-772091-RL',
    address: 'Apartment 5B, Road 68, Gulshan 2, Dhaka',
    items: [
      {
        name: 'Signature Tailored Oxford Cotton Shirt',
        category: 'Shirt',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB2c4e6f8a0b2c4e6f8d0b2c4e6f8a0b2c4e6d8c0b2a4e6f8d0b2c4e6f8a0b2c4e6',
        color: 'Classic White',
        size: 'M',
        qty: 2,
        price: 2850,
      },
    ],
    subtotal: 5700,
    deliveryFee: 0,
    total: 5700,
    paymentMethod: 'Visa / Mastercard Online',
  },
];

export const OrdersClient: React.FC = () => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [filter, setFilter] = useState<'all' | 'in-transit' | 'delivered'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOrders = initialOrders.filter((order) => {
    const matchesFilter =
      filter === 'all'
        ? true
        : filter === 'in-transit'
        ? order.status === 'In Transit'
        : order.status === 'Delivered';

    const matchesSearch =
      searchQuery.trim() === ''
        ? true
        : order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.items.some((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  const handleDownloadInvoice = (orderId: string) => {
    toast.success(`Tax Invoice Downloaded for #${orderId}`, {
      description: 'Official Rongin Libas Mushak-6.3 VAT invoice saved to your device.',
    });
  };

  const handleReOrder = (item: OrderItem) => {
    const matchedProduct = products.find((p) => p.name === item.name) || products[0];
    addToCart(matchedProduct, item.size, item.color, 1);
    toast.success(`Re-ordered ${item.name}`, {
      description: `Added size ${item.size} (${item.color}) to your cart.`,
    });
  };

  return (
    <div className="min-h-screen pt-8 sm:pt-10 pb-24 bg-[#fbf9f2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb & Navigation */}
        <nav className="flex items-center gap-2 text-xs font-sans uppercase tracking-widest text-[#717975]">
          <Link href="/" className="hover:text-[#073a2d] transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/profile" className="hover:text-[#073a2d] transition-colors">
            Patron Sanctuary
          </Link>
          <span>/</span>
          <span className="text-[#073a2d] font-semibold">Order History</span>
        </nav>

        {/* Top Header Card */}
        <div className="bg-[#073a2d] text-[#fbf9f2] p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-md border-l-4 border-[#c79a45]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Crown className="w-4 h-4 text-[#c79a45]" />
              <span className="font-sans text-[11px] uppercase tracking-[0.2em] text-[#c79a45] font-semibold">
                Atelier Ledger & Archives
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-4xl text-white font-normal">
              Order History & Bespoke Commissions
            </h1>
            <p className="font-sans text-xs sm:text-sm text-[#76a493] mt-2 max-w-2xl">
              Inspect past completed sartorial orders, download tax invoices, and track active Dhaka doorstep courier consignments.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/track-order"
              className="inline-flex items-center gap-2 px-5 py-3 bg-[#c79a45] hover:bg-[#d6a953] text-[#073a2d] font-sans text-xs uppercase tracking-wider font-bold transition-colors shadow-sm"
            >
              <Truck className="w-4 h-4" />
              <span>Track Live Consignment</span>
            </Link>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white border border-[#deddd3] p-4 sm:p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 font-sans text-xs uppercase tracking-wider font-semibold transition-colors cursor-pointer ${
                filter === 'all'
                  ? 'bg-[#073a2d] text-white'
                  : 'bg-[#f5f4ed] text-[#404945] hover:bg-[#eae8e1]'
              }`}
            >
              All Orders ({initialOrders.length})
            </button>
            <button
              onClick={() => setFilter('in-transit')}
              className={`px-4 py-2 font-sans text-xs uppercase tracking-wider font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                filter === 'in-transit'
                  ? 'bg-[#073a2d] text-white'
                  : 'bg-[#f5f4ed] text-[#404945] hover:bg-[#eae8e1]'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#c79a45] animate-pulse" />
              <span>In Transit (1)</span>
            </button>
            <button
              onClick={() => setFilter('delivered')}
              className={`px-4 py-2 font-sans text-xs uppercase tracking-wider font-semibold transition-colors cursor-pointer ${
                filter === 'delivered'
                  ? 'bg-[#073a2d] text-white'
                  : 'bg-[#f5f4ed] text-[#404945] hover:bg-[#eae8e1]'
              }`}
            >
              Completed ({initialOrders.filter((o) => o.status === 'Delivered').length})
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Input
              type="text"
              placeholder="Search order ref or garment..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#fbf9f2] border-[#deddd3] h-10 pl-9 text-xs focus:border-[#073a2d]"
            />
            <Search className="w-4 h-4 text-[#717975] absolute left-3 top-3 pointer-events-none" />
          </div>
        </div>

        {/* Orders Listing Grid */}
        <div className="space-y-6">
          {filteredOrders.length === 0 ? (
            <div className="bg-white border border-[#deddd3] p-16 text-center space-y-3">
              <Package className="w-12 h-12 text-[#717975] mx-auto" />
              <h3 className="font-serif text-xl text-[#073a2d]">No Orders Match Your Query</h3>
              <p className="font-sans text-xs text-[#69726d]">
                Clear your search or filter to view past atelier commissions.
              </p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white border border-[#deddd3] shadow-xs overflow-hidden transition-all hover:border-[#073a2d]/40"
              >
                {/* Order Top Bar */}
                <div className="p-5 sm:p-6 bg-[#fbf9f2] border-b border-[#deddd3] flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                    <div>
                      <span className="font-sans text-[10px] uppercase tracking-wider text-[#717975] block">
                        Order Reference
                      </span>
                      <span className="font-serif text-lg font-bold text-[#073a2d]">
                        #{order.id}
                      </span>
                    </div>

                    <div className="hidden sm:block h-8 w-px bg-[#deddd3]" />

                    <div>
                      <span className="font-sans text-[10px] uppercase tracking-wider text-[#717975] block">
                        Commission Date
                      </span>
                      <span className="font-sans text-xs text-[#1b1c18] font-medium flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3.5 h-3.5 text-[#717975]" />
                        {order.date}
                      </span>
                    </div>

                    <div className="hidden sm:block h-8 w-px bg-[#deddd3]" />

                    <div>
                      <span className="font-sans text-[10px] uppercase tracking-wider text-[#717975] block">
                        Total Investment
                      </span>
                      <span className="font-sans text-xs text-[#073a2d] font-bold mt-0.5 block">
                        ৳{order.total.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {order.status === 'In Transit' ? (
                      <Badge className="bg-[#073a2d] text-white text-xs px-3 py-1 font-sans uppercase tracking-wider flex items-center gap-1.5 rounded-none">
                        <span className="w-2 h-2 rounded-full bg-[#c79a45] animate-ping" />
                        <span>In Transit</span>
                      </Badge>
                    ) : (
                      <Badge className="bg-[#f5f4ed] text-[#073a2d] border border-[#deddd3] text-xs px-3 py-1 font-sans uppercase tracking-wider flex items-center gap-1.5 rounded-none font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#073a2d]" />
                        <span>Delivered</span>
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Order Items Body */}
                <div className="p-6 sm:p-8 space-y-6">
                  <div className="divide-y divide-[#f0eee7]">
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-20 bg-[#f5f4ed] overflow-hidden shrink-0 border border-[#deddd3]">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover object-top"
                            />
                          </div>
                          <div>
                            <span className="font-sans text-[10px] uppercase tracking-wider text-[#717975]">
                              {item.category}
                            </span>
                            <h4 className="font-serif text-base text-[#073a2d] font-semibold">
                              {item.name}
                            </h4>
                            <div className="flex items-center gap-3 font-sans text-xs text-[#69726d] mt-1">
                              <span>Color: <strong>{item.color}</strong></span>
                              <span>•</span>
                              <span>Size: <strong>{item.size}</strong></span>
                              <span>•</span>
                              <span>Qty: <strong>{item.qty}</strong></span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-6 pt-2 sm:pt-0">
                          <span className="font-sans text-sm font-bold text-[#073a2d]">
                            ৳{(item.price * item.qty).toLocaleString()}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReOrder(item)}
                            className="font-sans text-[11px] uppercase tracking-wider border-[#deddd3] text-[#073a2d] hover:bg-[#f5f4ed] cursor-pointer"
                          >
                            <RotateCcw className="w-3 h-3 mr-1" />
                            <span>Re-Order</span>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Courier & Details Footer Strip */}
                  <div className="p-4 bg-[#fbf9f2] border border-[#deddd3] flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs font-sans">
                    <div className="space-y-1 text-[#69726d]">
                      <div className="flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-[#073a2d]" />
                        <span>Courier: <strong>{order.courier}</strong> (Consignment #{order.trackingId})</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <MapPin className="w-3.5 h-3.5 text-[#717975]" />
                        <span>Destination: {order.address}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      {order.status === 'In Transit' && (
                        <Link
                          href={`/track-order?id=${order.id}`}
                          className="px-4 py-2 bg-[#073a2d] hover:bg-[#0d4d3b] text-white text-xs font-sans uppercase tracking-wider font-semibold inline-flex items-center gap-1.5 transition-colors shadow-xs"
                        >
                          <span>Live Tracking</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadInvoice(order.id)}
                        className="text-xs uppercase tracking-wider font-semibold border-[#deddd3] text-[#404945] hover:bg-white cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5 mr-1" />
                        <span>Invoice</span>
                      </Button>
                      <a
                        href="https://wa.me/8801916664011"
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-[#073a2d] hover:text-[#c79a45] uppercase tracking-wider font-semibold inline-flex items-center gap-1"
                      >
                        <Scissors className="w-3.5 h-3.5" />
                        <span>Alteration Support</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
