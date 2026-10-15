import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowLeft,
  RotateCcw,
  ShieldCheck,
  Clock,
  Package,
  AlertCircle,
  CheckCircle2,
  PhoneCall,
  FileText,
} from 'lucide-react';
import { SITE_CONFIG, getCanonicalUrl } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Return, Exchange & Order Cancellation Policy | Rongin Libas',
  description:
    'Review Rongin Libas return and exchange terms. Understand our 6-hour self-cancellation window, doorstep open-box inspection, and sizing exchange procedures.',
  alternates: {
    canonical: getCanonicalUrl('/returns'),
  },
  openGraph: {
    title: 'Return, Exchange & Cancellation Policy | Rongin Libas',
    description:
      'Clear return and exchange guidelines for Rongin Libas bespoke menswear. Learn about our 6-hour cancellation window and doorstep open-box verification.',
    url: getCanonicalUrl('/returns'),
    siteName: SITE_CONFIG.name,
    images: [{ url: `${SITE_CONFIG.url}/hero-model.jpg`, width: 1200, height: 1200, alt: 'Rongin Libas Returns Policy' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rongin Libas Return & Exchange Charter',
    description: 'Understand sizing exchanges, doorstep verification, and self-cancellation windows.',
    images: [`${SITE_CONFIG.url}/hero-model.jpg`],
  },
};

export default function ReturnsPage() {
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
              Client Protection Charter
            </span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#073a2d] leading-tight mb-4">
            Return, Exchange &amp; Order Cancellation Policy
          </h1>
          <p className="font-sans text-sm sm:text-base text-[#52605b] max-w-2xl leading-relaxed">
            We want every patron to be thoroughly pleased with their heirloom garment. We provide transparent safeguards regarding cancellations, open-box inspection, and sizing exchanges.
          </p>
        </header>

        {/* Main Content Sections */}
        <div className="space-y-10 font-sans text-[#404945] leading-relaxed">
          {/* Section 1: 6-Hour Self Cancellation */}
          <section className="bg-white p-6 sm:p-8 border border-[#deddd3] space-y-4 shadow-xs">
            <div className="flex items-center gap-2.5 text-[#073a2d]">
              <Clock className="w-5 h-5 text-[#c79a45]" />
              <h2 className="font-serif text-2xl font-normal">
                1. 6-Hour Self-Cancellation Window
              </h2>
            </div>
            <p className="text-sm">
              Patrons who place standard orders may self-cancel directly from their account sanctuary or order tracking page without contacting support:
            </p>
            <div className="bg-[#fbf9f2] p-5 border border-[#deddd3] space-y-2.5 text-xs text-[#52605b]">
              <p>
                • <strong>Eligible Order State:</strong> Self-cancellation is strictly active while your order status is marked as <strong>PENDING</strong>.
              </p>
              <p>
                • <strong>Time Limitation:</strong> You may cancel anytime within <strong>6 hours</strong> of order placement. Once an order is accepted, packaged, or handed to our courier, cancellation is closed.
              </p>
              <p>
                • <strong>Instant Stock Release:</strong> Reserved sizes and quantities are automatically released back to boutique inventory upon cancellation.
              </p>
              <p>
                • <strong>Zero Financial Liability:</strong> For Cash on Delivery orders, cancellation incurs zero fee. For prepaid orders (bKash/Nagad), our concierge verifies and initiates a refund.
              </p>
            </div>
          </section>

          {/* Section 2: Doorstep Open-Box Inspection */}
          <section className="bg-white p-6 sm:p-8 border border-[#deddd3] space-y-4 shadow-xs">
            <div className="flex items-center gap-2.5 text-[#073a2d]">
              <ShieldCheck className="w-5 h-5 text-[#c79a45]" />
              <h2 className="font-serif text-2xl font-normal">
                2. Doorstep Open-Box Verification
              </h2>
            </div>
            <p className="text-sm">
              Our premier protection safeguard takes place directly at your door:
            </p>
            <ul className="space-y-2.5 text-xs text-[#52605b]">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#073a2d] shrink-0 mt-0.5" />
                <span>
                  <strong>Inspect with Courier:</strong> Open the shipping parcel in the presence of the courier delivery officer across any of the 64 districts.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#073a2d] shrink-0 mt-0.5" />
                <span>
                  <strong>Instant Return on Discrepancy:</strong> If the fabric, color, or physical condition is not as expected, you may immediately refuse delivery without settling payment.
                </span>
              </li>
            </ul>
          </section>

          {/* Section 3: Sizing & Craftsmanship Exchanges */}
          <section className="bg-white p-6 sm:p-8 border border-[#deddd3] space-y-4 shadow-xs">
            <div className="flex items-center gap-2.5 text-[#073a2d]">
              <RotateCcw className="w-5 h-5 text-[#c79a45]" />
              <h2 className="font-serif text-2xl font-normal">
                3. Size &amp; Craftsmanship Exchanges
              </h2>
            </div>
            <p className="text-sm">
              If an accepted garment requires a different size for optimal fit:
            </p>
            <div className="space-y-3 text-xs text-[#52605b]">
              <p>
                1. <strong>Notification Within 24 Hours:</strong> Contact our atelier concierge via WhatsApp (<code>01916664011</code>) within 24 hours of parcel acceptance.
              </p>
              <p>
                2. <strong>Pristine Condition Required:</strong> The garment must be completely unworn, unwashed, unaltered, with original atelier tags and packaging intact.
              </p>
              <p>
                3. <strong>Replacement Dispatch:</strong> Upon receiving and verifying the returned piece at our Dhaka atelier, the requested alternative size will be promptly dispatched.
              </p>
            </div>
          </section>

          {/* Section 4: Bespoke Tailoring Exemption */}
          <section className="bg-white p-6 sm:p-8 border border-[#deddd3] space-y-4 shadow-xs">
            <div className="flex items-center gap-2.5 text-[#073a2d]">
              <AlertCircle className="w-5 h-5 text-[#c79a45]" />
              <h2 className="font-serif text-2xl font-normal">
                4. Custom-Tailored Garments Exemption
              </h2>
            </div>
            <p className="text-sm">
              Garments crafted according to patron-specified bespoke measurements (such as custom neck, chest, shoulder, or sleeve lengths) are cut uniquely for that individual patron.
            </p>
            <div className="p-4 bg-[#fbf9f2] border border-[#deddd3] text-xs text-[#52605b]">
              <p>
                Once cutting and tailoring have commenced, bespoke orders are non-refundable and cannot be exchanged for other sizes, except in the documented event of a verified craftsmanship or textile defect.
              </p>
            </div>
          </section>

          {/* Support Banner */}
          <div className="bg-[#073a2d] text-[#fbf9f2] p-8 border border-[#c79a45]/30 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
            <div className="space-y-1.5 text-center sm:text-left">
              <h3 className="font-serif text-xl text-white">Need Assistance With an Exchange?</h3>
              <p className="font-sans text-xs text-[#c0c8c3] max-w-md">
                Our concierge team is available to guide you through size selection or address craftsmanship inquiries.
              </p>
            </div>
            <Link
              href="/contact"
              className="px-5 py-2.5 bg-[#c79a45] hover:bg-[#b08436] text-[#073a2d] font-sans text-xs uppercase tracking-widest font-semibold transition-colors shrink-0"
            >
              Contact Concierge
            </Link>
          </div>

          {/* Related Links */}
          <div className="p-6 bg-[#f5f4ed] border border-[#deddd3] flex flex-wrap items-center justify-between gap-4 font-sans text-xs text-[#073a2d] font-semibold">
            <Link href="/shipping" className="hover:text-[#c79a45] underline">
              Nationwide Delivery Guidelines →
            </Link>
            <Link href="/faq" className="hover:text-[#c79a45] underline">
              Frequently Asked Questions →
            </Link>
            <Link href="/terms" className="hover:text-[#c79a45] underline">
              Full Terms of Service →
            </Link>
            <Link href="/men" className="hover:text-[#c79a45] underline">
              Explore Menswear Atelier →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
