import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowLeft,
  Truck,
  ShieldCheck,
  Clock,
  Package,
  MapPin,
  CheckCircle2,
  HelpCircle,
  PhoneCall,
} from 'lucide-react';
import { SITE_CONFIG, getCanonicalUrl } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Nationwide Shipping & Delivery Guidelines | Rongin Libas',
  description:
    'Learn about Rongin Libas shipping options, delivery timelines across all 64 districts in Bangladesh, rates, complimentary delivery over ৳2,999, and open-box inspection.',
  alternates: {
    canonical: getCanonicalUrl('/shipping'),
  },
  openGraph: {
    title: 'Nationwide Shipping & Delivery Guidelines | Rongin Libas',
    description:
      'Delivery rates, timelines, and open-box doorstep verification across all 64 districts of Bangladesh by Rongin Libas.',
    url: getCanonicalUrl('/shipping'),
    siteName: SITE_CONFIG.name,
    images: [{ url: `${SITE_CONFIG.url}/hero-model.jpg`, width: 1200, height: 1200, alt: 'Rongin Libas Delivery' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rongin Libas Shipping & Delivery Guidelines',
    description: 'Fast nationwide courier fulfillment with open-box verification across Bangladesh.',
    images: [`${SITE_CONFIG.url}/hero-model.jpg`],
  },
};

export default function ShippingPage() {
  return (
    <div className="bg-[#fbf9f2] min-h-screen py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-sans text-xs uppercase tracking-wider text-[#717975] hover:text-[#073a2d] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Boutique</span>
          </Link>
        </div>

        {/* Hero Header */}
        <header className="mb-12 border-b border-[#deddd3] pb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="h-px w-8 bg-[#c79a45]" />
            <span className="font-sans text-xs uppercase tracking-[0.25em] text-[#c79a45] font-semibold">
              Fulfillment &amp; Logistics
            </span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#073a2d] leading-tight mb-4">
            Shipping &amp; Delivery Guidelines Across Bangladesh
          </h1>
          <p className="font-sans text-sm sm:text-base text-[#52605b] max-w-2xl leading-relaxed">
            Every garment from our Dhaka atelier is sealed in protective moisture-resistant packaging and dispatched via trusted logistics couriers with full doorstep verification.
          </p>
        </header>

        {/* Rates & Timelines Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {/* Inside Dhaka */}
          <div className="bg-white p-6 sm:p-8 border border-[#deddd3] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#f0eee7] pb-3">
              <div className="flex items-center gap-2 text-[#073a2d]">
                <MapPin className="w-5 h-5 text-[#c79a45]" />
                <h2 className="font-serif text-xl font-semibold">Dhaka Metropolitan Area</h2>
              </div>
              <span className="font-mono text-sm font-bold text-[#073a2d] bg-[#fbf9f2] px-2.5 py-1 border border-[#deddd3]">
                ৳0 – ৳80
              </span>
            </div>
            <ul className="space-y-2.5 text-xs text-[#52605b] leading-relaxed">
              <li className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-[#073a2d] shrink-0 mt-0.5" />
                <span>
                  <strong>Delivery Timeline:</strong> 24 to 48 hours following atelier dispatch confirmation.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#073a2d] shrink-0 mt-0.5" />
                <span>
                  <strong>Complimentary Delivery:</strong> Orders exceeding <strong>৳2,999</strong> receive automatic free delivery.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Truck className="w-4 h-4 text-[#073a2d] shrink-0 mt-0.5" />
                <span>
                  <strong>Couriers:</strong> Handled by premium express logistics partners (Pathao, Steadfast, RedX).
                </span>
              </li>
            </ul>
          </div>

          {/* Outside Dhaka / Nationwide */}
          <div className="bg-white p-6 sm:p-8 border border-[#deddd3] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#f0eee7] pb-3">
              <div className="flex items-center gap-2 text-[#073a2d]">
                <Truck className="w-5 h-5 text-[#c79a45]" />
                <h2 className="font-serif text-xl font-semibold">Outside Dhaka (64 Districts)</h2>
              </div>
              <span className="font-mono text-sm font-bold text-[#073a2d] bg-[#fbf9f2] px-2.5 py-1 border border-[#deddd3]">
                ৳120
              </span>
            </div>
            <ul className="space-y-2.5 text-xs text-[#52605b] leading-relaxed">
              <li className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-[#073a2d] shrink-0 mt-0.5" />
                <span>
                  <strong>Delivery Timeline:</strong> 2 to 4 business days to divisional headquarters and upazilas.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#073a2d] shrink-0 mt-0.5" />
                <span>
                  <strong>Complimentary Delivery:</strong> Free shipping threshold applies nationwide for orders over <strong>৳2,999</strong>.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Package className="w-4 h-4 text-[#073a2d] shrink-0 mt-0.5" />
                <span>
                  <strong>Cash on Delivery (COD):</strong> Full COD available nationwide with zero advance payment requirements.
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Doorstep Open-Box Inspection Policy */}
        <section className="bg-white p-6 sm:p-8 border border-[#deddd3] space-y-4 shadow-xs mb-10">
          <div className="flex items-center gap-2.5 text-[#073a2d]">
            <ShieldCheck className="w-6 h-6 text-[#c79a45]" />
            <h2 className="font-serif text-2xl font-normal">
              Doorstep Open-Box Inspection Charter
            </h2>
          </div>
          <p className="font-sans text-sm text-[#404945] leading-relaxed">
            At Rongin Libas, we hold unwavering confidence in the quality of our textiles, collar stance, and artisan tailoring. To ensure total transparency and customer satisfaction, we uphold a strict <strong>Open-Box Doorstep Verification Policy</strong> across all 64 districts:
          </p>
          <div className="bg-[#fbf9f2] p-5 border border-[#deddd3] space-y-3 font-sans text-xs text-[#404945] leading-relaxed">
            <p>
              1. <strong>Open in Courier Presence:</strong> You are entitled to open the outer delivery box before handing over payment to the courier delivery officer.
            </p>
            <p>
              2. <strong>Inspect Visual Quality:</strong> Verify that the garment fabric, color tone, size label, and embroidery match your expectations.
            </p>
            <p>
              3. <strong>Immediate Refusal if Dissatisfied:</strong> In the rare event that the garment appears defective or does not match your ordered specifications, you may immediately return it to the courier officer without paying the Cash on Delivery amount.
            </p>
          </div>
        </section>

        {/* Packaging & Handling Standards */}
        <section className="bg-white p-6 sm:p-8 border border-[#deddd3] space-y-4 shadow-xs mb-10">
          <h2 className="font-serif text-2xl text-[#073a2d] font-normal border-b border-[#f0eee7] pb-3">
            Garment Packaging &amp; Handling Standards
          </h2>
          <p className="font-sans text-sm text-[#404945] leading-relaxed">
            Fine double-mercerized polos, royal panjabis, and tailored poplin shirts demand protective care during transit:
          </p>
          <ul className="space-y-2.5 font-sans text-xs text-[#52605b] leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="font-bold text-[#073a2d]">•</span>
              <span>
                <strong>Moisture Barrier:</strong> Each folded garment is encased in a protective poly barrier to prevent dust and humidity damage during monsoon journeys.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-[#073a2d]">•</span>
              <span>
                <strong>Collar Stance Protection:</strong> Bandhgala collars and polo necklines are packed with structural support to preserve upright symmetry.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-[#073a2d]">•</span>
              <span>
                <strong>Live Consignment Tracking:</strong> Once dispatched, a real-time tracking consignment number is linked to your order.
              </span>
            </li>
          </ul>
        </section>

        {/* Track Order & Help Banner */}
        <div className="bg-[#073a2d] text-[#fbf9f2] p-8 border border-[#c79a45]/30 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
          <div className="space-y-1.5 text-center sm:text-left">
            <h3 className="font-serif text-xl text-white">Have an Active Order in Transit?</h3>
            <p className="font-sans text-xs text-[#c0c8c3] max-w-md">
              Track your parcel status in real time across Pathao and Steadfast courier networks using your order number.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/track-order"
              className="px-5 py-2.5 bg-[#c79a45] hover:bg-[#b08436] text-[#073a2d] font-sans text-xs uppercase tracking-widest font-semibold transition-colors"
            >
              Track Order
            </Link>
            <Link
              href="/contact"
              className="px-5 py-2.5 bg-transparent hover:bg-white/10 text-white border border-[#76a493]/40 font-sans text-xs uppercase tracking-widest transition-colors"
            >
              Contact Support
            </Link>
          </div>
        </div>

        {/* Related Policy Links */}
        <div className="mt-10 p-6 bg-[#f5f4ed] border border-[#deddd3] flex flex-wrap items-center justify-between gap-4 font-sans text-xs text-[#073a2d] font-semibold">
          <Link href="/returns" className="hover:text-[#c79a45] underline">
            Review Returns &amp; Exchange Policy →
          </Link>
          <Link href="/faq" className="hover:text-[#c79a45] underline">
            Frequently Asked Questions →
          </Link>
          <Link href="/men" className="hover:text-[#c79a45] underline">
            Explore Men&apos;s Collection →
          </Link>
        </div>
      </div>
    </div>
  );
}
