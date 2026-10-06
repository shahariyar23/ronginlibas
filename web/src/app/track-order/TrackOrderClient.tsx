'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  Search,
  MapPin,
  Phone,
  ShieldCheck,
  User,
  ExternalLink,
  Crown,
  ChevronRight,
  PhoneCall,
  Calendar,
  Sparkles,
} from 'lucide-react';

export const TrackOrderClient: React.FC = () => {
  const searchParams = useSearchParams();
  const initialId = searchParams.get('id') || 'RL-84920';

  const [searchOrderId, setSearchOrderId] = useState(initialId);
  const [activeOrderId, setActiveOrderId] = useState(initialId);

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchOrderId.trim()) {
      setActiveOrderId(searchOrderId.trim().toUpperCase());
    }
  };

  return (
    <div className="min-h-screen pt-8 sm:pt-10 pb-24 bg-[#fbf9f2]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-sans uppercase tracking-widest text-[#717975]">
          <Link href="/" className="hover:text-[#073a2d] transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/orders" className="hover:text-[#073a2d] transition-colors">
            Orders
          </Link>
          <span>/</span>
          <span className="text-[#073a2d] font-semibold">Live Consignment Tracking</span>
        </nav>

        {/* Header Hero Banner */}
        <div className="bg-[#073a2d] text-[#fbf9f2] p-6 sm:p-10 shadow-md border-l-4 border-[#c79a45] flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="font-sans text-[11px] uppercase tracking-[0.25em] text-[#c79a45] font-semibold flex items-center gap-1.5 mb-1">
              <Truck className="w-3.5 h-3.5" />
              Automated 64-District Courier Dispatch
            </span>
            <h1 className="font-serif text-2xl sm:text-4xl font-normal text-white">
              Live Consignment Tracking
            </h1>
            <p className="font-sans text-xs sm:text-sm text-[#76a493] mt-2 max-w-xl">
              Real-time synchronization with Pathao & Steadfast courier hubs with doorstep open-box inspection.
            </p>
          </div>

          {/* Quick Search */}
          <form
            onSubmit={handleTrackSubmit}
            className="flex items-center bg-white p-1.5 shadow-sm max-w-md w-full"
          >
            <Input
              type="text"
              placeholder="e.g. RL-84920"
              value={searchOrderId}
              onChange={(e) => setSearchOrderId(e.target.value)}
              className="border-0 bg-transparent text-[#1b1c18] font-mono text-xs focus-visible:ring-0 shadow-none uppercase"
            />
            <Button
              type="submit"
              className="bg-[#073a2d] hover:bg-[#0d4d3b] text-white font-sans text-xs uppercase tracking-wider px-5 h-9 shrink-0 cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 mr-1" />
              <span>Track</span>
            </Button>
          </form>
        </div>

        {/* Consignment Main Card */}
        <div className="bg-white border border-[#deddd3] shadow-sm overflow-hidden">
          {/* Status Header Bar */}
          <div className="p-6 sm:p-8 bg-[#fbf9f2] border-b border-[#deddd3] flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="font-sans text-[11px] uppercase tracking-wider text-[#717975] block mb-0.5">
                Consignment Reference
              </span>
              <div className="flex items-center gap-3">
                <span className="font-serif text-2xl font-bold text-[#073a2d]">
                  #{activeOrderId}
                </span>
                <Badge className="bg-[#073a2d] text-white font-sans text-xs uppercase tracking-wider px-3 py-1 rounded-none flex items-center gap-1.5 font-bold">
                  <span className="w-2 h-2 rounded-full bg-[#c79a45] animate-ping" />
                  <span>In Transit</span>
                </Badge>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="font-sans text-[11px] uppercase tracking-wider text-[#717975] block mb-0.5">
                Estimated Delivery Window
              </span>
              <span className="font-serif text-lg text-[#073a2d] font-bold block">
                Tomorrow • Dhaka Metro (by 4:00 PM)
              </span>
              <span className="font-sans text-xs text-[#69726d]">
                Courier: Pathao Express • Tracking #PTH-982410-RL
              </span>
            </div>
          </div>

          {/* 4-Step Animated Progress Stepper */}
          <div className="p-6 sm:p-10 border-b border-[#deddd3] bg-white">
            <h3 className="font-serif text-lg text-[#073a2d] mb-8 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#c79a45]" />
              <span>Atelier Dispatch Milestone Progress</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
              {/* Step 1: Confirmed */}
              <div className="flex md:flex-col items-center md:items-start gap-4 md:gap-3 relative">
                <div className="w-10 h-10 rounded-full bg-[#073a2d] text-white flex items-center justify-center shrink-0 shadow-sm z-10">
                  <CheckCircle2 className="w-5 h-5 text-[#c79a45]" />
                </div>
                <div>
                  <span className="font-sans text-xs uppercase tracking-wider text-[#073a2d] font-bold block">
                    1. Confirmed
                  </span>
                  <span className="font-sans text-[11px] text-[#404945] block mt-0.5">
                    Order Placed & bKash Verified
                  </span>
                  <span className="font-mono text-[10px] text-[#717975] block mt-0.5">
                    04 Oct • 11:30 AM
                  </span>
                </div>
              </div>

              {/* Step 2: Tailoring & QC */}
              <div className="flex md:flex-col items-center md:items-start gap-4 md:gap-3 relative">
                <div className="w-10 h-10 rounded-full bg-[#073a2d] text-white flex items-center justify-center shrink-0 shadow-sm z-10">
                  <CheckCircle2 className="w-5 h-5 text-[#c79a45]" />
                </div>
                <div>
                  <span className="font-sans text-xs uppercase tracking-wider text-[#073a2d] font-bold block">
                    2. Tailoring & QC
                  </span>
                  <span className="font-sans text-[11px] text-[#404945] block mt-0.5">
                    Master Artisan Inspection Complete
                  </span>
                  <span className="font-mono text-[10px] text-[#717975] block mt-0.5">
                    05 Oct • 03:15 PM
                  </span>
                </div>
              </div>

              {/* Step 3: In Transit (Active) */}
              <div className="flex md:flex-col items-center md:items-start gap-4 md:gap-3 relative">
                <div className="w-10 h-10 rounded-full bg-[#073a2d] text-[#c79a45] ring-4 ring-[#c79a45]/30 flex items-center justify-center shrink-0 shadow-md z-10">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-sans text-xs uppercase tracking-wider text-[#073a2d] font-bold block flex items-center gap-1.5">
                    <span>3. In Transit</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#c79a45] animate-pulse" />
                  </span>
                  <span className="font-sans text-[11px] text-[#073a2d] font-semibold block mt-0.5">
                    Dispatched with Pathao Express
                  </span>
                  <span className="font-mono text-[10px] text-[#717975] block mt-0.5">
                    Tejgaon Hub • 06 Oct, 09:40 AM
                  </span>
                </div>
              </div>

              {/* Step 4: Open-Box Check */}
              <div className="flex md:flex-col items-center md:items-start gap-4 md:gap-3 relative opacity-60">
                <div className="w-10 h-10 rounded-full bg-[#f5f4ed] border-2 border-dashed border-[#deddd3] text-[#717975] flex items-center justify-center shrink-0 z-10">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-sans text-xs uppercase tracking-wider text-[#717975] font-bold block">
                    4. Open-Box Check
                  </span>
                  <span className="font-sans text-[11px] text-[#717975] block mt-0.5">
                    Doorstep Fitting & Handover
                  </span>
                  <span className="font-mono text-[10px] text-[#717975] block mt-0.5">
                    Pending Arrival
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Rider & Courier Info Strip */}
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#deddd3] border-b border-[#deddd3] bg-[#fbf9f2]">
            <div className="p-6 space-y-1.5">
              <span className="font-sans text-[10px] uppercase tracking-wider text-[#717975] block">
                Designated Courier Rider
              </span>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#073a2d] text-white flex items-center justify-center font-bold text-xs">
                  RI
                </div>
                <div>
                  <h4 className="font-serif text-sm font-bold text-[#073a2d]">
                    Md. Rafiqul Islam
                  </h4>
                  <p className="font-sans text-xs text-[#69726d]">
                    Pathao Prime Fleet Rider
                  </p>
                </div>
              </div>
              <a
                href="tel:01823998877"
                className="inline-flex items-center gap-1.5 text-xs font-sans text-[#073a2d] hover:underline font-semibold pt-1"
              >
                <Phone className="w-3 h-3 text-[#c79a45]" />
                <span>Call Rider (01823-998877)</span>
              </a>
            </div>

            <div className="p-6 space-y-1.5">
              <span className="font-sans text-[10px] uppercase tracking-wider text-[#717975] block">
                Destination Residence
              </span>
              <div className="flex items-start gap-2 text-xs font-sans text-[#1b1c18]">
                <MapPin className="w-4 h-4 text-[#073a2d] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block">Mahfuzur Rahman Chowdhury</span>
                  <span className="text-[#69726d] block">
                    House 42, Road 11, Block D, Banani, Dhaka Metro
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-1.5">
              <span className="font-sans text-[10px] uppercase tracking-wider text-[#717975] block">
                Doorstep Verification Protocol
              </span>
              <div className="flex items-start gap-2 text-xs font-sans text-[#073a2d]">
                <ShieldCheck className="w-4 h-4 text-[#c79a45] shrink-0 mt-0.5" />
                <p className="text-[#404945]">
                  Open-box policy applies. You may inspect the fabric slub weave and stitching before concluding the delivery.
                </p>
              </div>
            </div>
          </div>

          {/* Consignment Items Review */}
          <div className="p-6 sm:p-10 space-y-6">
            <h3 className="font-serif text-lg text-[#073a2d] pb-3 border-b border-[#f0eee7]">
              Commissioned Garments in this Consignment (2 Pieces)
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4 p-4 bg-[#fbf9f2] border border-[#deddd3]">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-20 bg-white overflow-hidden shrink-0 border border-[#deddd3]">
                    <img
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuAbKFoOOtlagDwzcYDnxXvniQzbARJlxOUwkcgwN5zO5GpwwhIJPiwjSKxJjBebcu9cpNG1UWQ5Da1-Ml_87fMVpXLw9dEquhak16BWycGPLsI1-CdQUkRRP4k_CDKCQubSfx41r1uJAuyBOcY4HQ9x9dum1AQKVjcJXQjeWY1iGkAuHAWuFcMVmXVuMsxgQGVTAs-KT5THFHpnZMBId6uGKCpMzFRdtXtTWY372sGMRnPObWwzPhRhGw"
                      alt="The Royal Heritage Silk-Cotton Panjabi"
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  <div>
                    <span className="font-sans text-[10px] uppercase tracking-widest text-[#717975]">
                      Panjabi
                    </span>
                    <h4 className="font-serif text-base text-[#073a2d] font-semibold">
                      The Royal Heritage Silk-Cotton Panjabi
                    </h4>
                    <span className="font-sans text-xs text-[#69726d] block mt-0.5">
                      Hue: Forest Emerald • Size: 40 • Qty: 1
                    </span>
                  </div>
                </div>
                <span className="font-sans text-sm font-bold text-[#073a2d]">৳ 3,850</span>
              </div>

              <div className="flex items-center justify-between gap-4 p-4 bg-[#fbf9f2] border border-[#deddd3]">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-20 bg-white overflow-hidden shrink-0 border border-[#deddd3]">
                    <img
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCH0Y4iP3r07gM-q_4FwG2277d01h6oB_l_XfC0-x0xKkX2n_Y1m_4b3A2qZ5y7g9e4f6d8c0b2a4e6f8d0b2c4e6f8a0b2c4e6"
                      alt="Mercerized Silk-Blend Pique Polo"
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  <div>
                    <span className="font-sans text-[10px] uppercase tracking-widest text-[#717975]">
                      Polo
                    </span>
                    <h4 className="font-serif text-base text-[#073a2d] font-semibold">
                      Mercerized Silk-Blend Pique Polo
                    </h4>
                    <span className="font-sans text-xs text-[#69726d] block mt-0.5">
                      Hue: Alabaster Ivory • Size: L • Qty: 1
                    </span>
                  </div>
                </div>
                <span className="font-sans text-sm font-bold text-[#073a2d]">৳ 2,450</span>
              </div>
            </div>

            <div className="p-4 bg-[#f5f4ed] border border-[#deddd3] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-sans">
              <span className="text-[#69726d]">
                Total Consignment Value: <strong className="text-[#073a2d]">৳ 6,300</strong> (Prepaid via bKash • Zero Due)
              </span>
              <a
                href="https://wa.me/8801916664011"
                target="_blank"
                rel="noreferrer"
                className="text-[#073a2d] hover:text-[#c79a45] uppercase tracking-wider font-bold inline-flex items-center gap-1.5"
              >
                <PhoneCall className="w-3.5 h-3.5 text-[#c79a45]" />
                <span>Contact Dispatch Concierge (01916664011)</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
