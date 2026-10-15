import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowLeft,
  PhoneCall,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  Truck,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { SITE_CONFIG, getCanonicalUrl, generateContactPageJsonLd } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Contact Concierge & Customer Care | Rongin Libas Dhaka',
  description:
    'Connect with Rongin Libas customer concierge in Dhaka. Reach our support team via official WhatsApp at 01916664011, direct phone, or email for order and sizing assistance.',
  alternates: {
    canonical: getCanonicalUrl('/contact'),
  },
  openGraph: {
    title: 'Contact Concierge & Customer Care | Rongin Libas',
    description:
      'Official contact channels for Rongin Libas atelier in Dhaka. Reach our concierge via WhatsApp at 01916664011, phone, or direct email.',
    url: getCanonicalUrl('/contact'),
    siteName: SITE_CONFIG.name,
    images: [{ url: `${SITE_CONFIG.url}/hero-model.jpg`, width: 1200, height: 1200, alt: 'Contact Rongin Libas Concierge' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Rongin Libas Concierge',
    description: 'Direct WhatsApp and phone assistance for Rongin Libas bespoke menswear in Dhaka.',
    images: [`${SITE_CONFIG.url}/hero-model.jpg`],
  },
};

export default function ContactPage() {
  const contactSchema = generateContactPageJsonLd();
  const rawDigits = SITE_CONFIG.telephone.replace(/\D/g, '');
  const internationalPhone = rawDigits.startsWith('880')
    ? `+${rawDigits}`
    : rawDigits.startsWith('0')
      ? `+88${rawDigits}`
      : `+880${rawDigits}`;
  const whatsappUrl = `https://wa.me/8801916664011?text=${encodeURIComponent(
    'Assalamu Alaikum. I would like assistance with Rongin Libas garments and orders.',
  )}`;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactSchema) }}
      />
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
                Client Sanctuary &amp; Inquiries
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#073a2d] leading-tight mb-4">
              Contact Rongin Libas Concierge
            </h1>
            <p className="font-sans text-sm sm:text-base text-[#52605b] max-w-2xl leading-relaxed">
              Whether you need guidance on sizing, ceremonial panjabi styling, nationwide delivery timelines, or order tracking, our Dhaka atelier concierge is here to assist you.
            </p>
          </header>

          {/* Direct Communication Channels */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {/* WhatsApp Card */}
            <div className="bg-white p-6 border border-[#deddd3] shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="w-10 h-10 bg-[#073a2d]/10 flex items-center justify-center text-[#073a2d]">
                  <PhoneCall className="w-5 h-5 text-[#073a2d]" />
                </div>
                <h2 className="font-serif text-lg text-[#073a2d]">WhatsApp Concierge</h2>
                <p className="font-sans text-xs text-[#52605b] leading-relaxed">
                  Fastest response for sizing advice, order confirmation, and parcel status.
                </p>
                <p className="font-mono text-sm text-[#073a2d] font-semibold pt-1">
                  01916664011
                </p>
              </div>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#073a2d] hover:bg-[#0d4d3b] text-[#fbf9f2] text-xs font-sans uppercase tracking-widest font-semibold transition-colors"
              >
                <span>Chat on WhatsApp</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Direct Phone Call Card */}
            <div className="bg-white p-6 border border-[#deddd3] shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="w-10 h-10 bg-[#073a2d]/10 flex items-center justify-center text-[#073a2d]">
                  <PhoneCall className="w-5 h-5 text-[#073a2d]" />
                </div>
                <h2 className="font-serif text-lg text-[#073a2d]">Direct Telephone</h2>
                <p className="font-sans text-xs text-[#52605b] leading-relaxed">
                  Speak directly with an atelier representative regarding standard orders.
                </p>
                <p className="font-mono text-sm text-[#073a2d] font-semibold pt-1">
                  {SITE_CONFIG.telephone}
                </p>
              </div>
              <a
                href={`tel:${internationalPhone}`}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#fbf9f2] hover:bg-white text-[#073a2d] border border-[#073a2d] text-xs font-sans uppercase tracking-widest font-semibold transition-colors"
              >
                <span>Call Atelier</span>
              </a>
            </div>

            {/* Official Email Card */}
            <div className="bg-white p-6 border border-[#deddd3] shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="w-10 h-10 bg-[#073a2d]/10 flex items-center justify-center text-[#073a2d]">
                  <Mail className="w-5 h-5 text-[#073a2d]" />
                </div>
                <h2 className="font-serif text-lg text-[#073a2d]">Electronic Mail</h2>
                <p className="font-sans text-xs text-[#52605b] leading-relaxed">
                  For formal corporate inquiries, wholesale requests, and order documentation.
                </p>
                <p className="font-mono text-xs text-[#073a2d] font-semibold pt-1 truncate">
                  {SITE_CONFIG.email}
                </p>
              </div>
              <a
                href={`mailto:${SITE_CONFIG.email}`}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#fbf9f2] hover:bg-white text-[#073a2d] border border-[#073a2d] text-xs font-sans uppercase tracking-widest font-semibold transition-colors"
              >
                <span>Send Email</span>
              </a>
            </div>
          </div>

          {/* Location & Operating Guidelines */}
          <div className="bg-white p-6 sm:p-8 border border-[#deddd3] space-y-6 shadow-xs mb-10">
            <h2 className="font-serif text-2xl text-[#073a2d] font-normal border-b border-[#f0eee7] pb-3">
              Atelier Location &amp; Service Scope
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-[#52605b] leading-relaxed">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[#073a2d] font-semibold text-sm">
                  <MapPin className="w-4 h-4 text-[#c79a45]" />
                  <span>Dhaka Atelier Studio</span>
                </div>
                <p>
                  Rongin Libas maintains its creative design studio and central dispatch fulfillment center in <strong>Dhaka, Bangladesh</strong>. All garments undergo dual inspection before sealing into moisture-resistant protective packages.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[#073a2d] font-semibold text-sm">
                  <ShieldCheck className="w-4 h-4 text-[#c79a45]" />
                  <span>Doorstep Inspection on Delivery</span>
                </div>
                <p>
                  We prioritize complete consumer transparency. Every patron is encouraged to open the outer delivery box in the presence of the courier officer to verify craftsmanship, stitching, and fabric before settling payment.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Help Links */}
          <div className="p-6 bg-[#f5f4ed] border border-[#deddd3] space-y-3">
            <h3 className="font-serif text-base text-[#073a2d] font-semibold">
              Looking for Immediate Policy Guidance?
            </h3>
            <p className="font-sans text-xs text-[#52605b]">
              You can find instant answers to frequently asked customer questions in our self-service documentation:
            </p>
            <div className="flex flex-wrap gap-4 pt-2 font-sans text-xs font-semibold text-[#073a2d]">
              <Link href="/faq" className="hover:text-[#c79a45] underline">
                Browse FAQ &amp; Size Guide →
              </Link>
              <Link href="/shipping" className="hover:text-[#c79a45] underline">
                Delivery Timelines &amp; Rates →
              </Link>
              <Link href="/returns" className="hover:text-[#c79a45] underline">
                Return &amp; Exchange Policy →
              </Link>
              <Link href="/track-order" className="hover:text-[#c79a45] underline">
                Live Order Tracking →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
