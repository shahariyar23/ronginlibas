import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowLeft,
  HelpCircle,
  ChevronDown,
  ShoppingBag,
  Truck,
  RotateCcw,
  Sparkles,
  PhoneCall,
  ShieldCheck,
} from 'lucide-react';
import { SITE_CONFIG, getCanonicalUrl, generateFaqJsonLd } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions (FAQ) | Rongin Libas Atelier',
  description:
    'Find answers to common questions about ordering, custom sizing, fabric care, Cash on Delivery, nationwide shipping, open-box inspection, and exchanges at Rongin Libas.',
  alternates: {
    canonical: getCanonicalUrl('/faq'),
  },
  openGraph: {
    title: 'Frequently Asked Questions (FAQ) | Rongin Libas',
    description:
      'Answers to common questions regarding ordering, sizing, Cash on Delivery, nationwide shipping, and open-box verification by Rongin Libas.',
    url: getCanonicalUrl('/faq'),
    siteName: SITE_CONFIG.name,
    images: [{ url: `${SITE_CONFIG.url}/hero-model.jpg`, width: 1200, height: 1200, alt: 'Rongin Libas FAQ' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rongin Libas FAQ | Client Guidance',
    description: 'Frequently asked questions about sizes, shipping, and bespoke menswear in Bangladesh.',
    images: [`${SITE_CONFIG.url}/hero-model.jpg`],
  },
};

const FAQ_ITEMS = [
  {
    category: 'Ordering & Custom Sizing',
    question: 'How do I place an order on Rongin Libas?',
    answer:
      'You can select any garment from our Men\'s Collection, choose your preferred size, and complete your order via our secure online checkout. Alternatively, you may place an order directly with our Dhaka concierge via official WhatsApp at 01916664011.',
    link: { href: '/men', label: 'Explore the full Men\'s Collection' },
  },
  {
    category: 'Ordering & Custom Sizing',
    question: 'How do I choose the right size for a polo shirt or panjabi?',
    answer:
      'Every product page features a detailed size chart with chest, shoulder, and length measurements in inches. If you prefer tailored guidance or fall between two sizes, read our dedicated sizing guide or message our atelier concierge on WhatsApp.',
    link: { href: '/journal/mens-polo-shirt-size-and-fit-guide', label: 'Read our Men\'s Polo Shirt Size & Fit Guide' },
  },
  {
    category: 'Ordering & Custom Sizing',
    question: 'Can I request bespoke or custom-tailored dimensions?',
    answer:
      'Yes. For royal panjabis and wedding ensembles, our master cutting team accepts custom chest, collar, and garment length specifications. Contact our concierge team with your measurements before placing your order.',
    link: { href: '/contact', label: 'Contact our Bespoke Concierge' },
  },
  {
    category: 'Payment & Cash on Delivery',
    question: 'What payment methods does Rongin Libas accept?',
    answer:
      'We support full Cash on Delivery (COD) across all 64 districts in Bangladesh with zero advance fee. We also accept direct mobile payments via bKash and Nagad through our checkout or concierge confirmation.',
    link: { href: '/shipping', label: 'Learn more about delivery options' },
  },
  {
    category: 'Shipping & Delivery',
    question: 'What are the delivery charges and timelines across Bangladesh?',
    answer:
      'Deliveries inside Dhaka Metropolitan arrive in 24 to 48 hours (standard charge ৳0 to ৳80). Deliveries outside Dhaka to all 64 districts take 2 to 4 business days at a flat rate of ৳120. All orders over ৳2,999 qualify for complimentary nationwide shipping.',
    link: { href: '/shipping', label: 'Review full Shipping & Delivery Guidelines' },
  },
  {
    category: 'Shipping & Delivery',
    question: 'What is the Doorstep Open-Box Inspection Policy?',
    answer:
      'We allow and encourage all patrons to open the outer consignment box in the presence of the courier delivery officer. You can inspect the fabric quality, stitching, and visual sizing before settling the Cash on Delivery amount.',
    link: { href: '/shipping', label: 'Read our Doorstep Verification Charter' },
  },
  {
    category: 'Returns & Cancellations',
    question: 'Can I cancel my order after placing it?',
    answer:
      'Yes. Standard orders can be self-cancelled directly from your account or order tracking page within 6 hours of placement, as long as the status is PENDING. Once an order is processed or handed to the courier, self-cancellation is closed.',
    link: { href: '/returns', label: 'Review our 6-Hour Cancellation Window' },
  },
  {
    category: 'Returns & Cancellations',
    question: 'How do I exchange an item if the size does not fit?',
    answer:
      'If you need a different size, notify our concierge via WhatsApp (01916664011) within 24 hours of delivery. The garment must remain unworn and unwashed with original atelier tags intact. We will coordinate a swift size exchange.',
    link: { href: '/returns', label: 'Review the Size Exchange Procedure' },
  },
  {
    category: 'Fabrics & Garment Care',
    question: 'How should I care for double-mercerized polos and royal panjabis?',
    answer:
      'For fine double-mercerized knitwear and ancestral Bengal handlooms, we recommend gentle hand-washing in cool water with mild ph-neutral detergent, or dry cleaning. Always dry flat in the shade away from direct tropical sunlight, and never wring.',
    link: { href: '/journal/mens-luxury-fabrics-for-tropical-weather', label: 'Explore our Tropical Fabric Care Guide' },
  },
];

export default function FaqPage() {
  const faqSchema = generateFaqJsonLd(
    FAQ_ITEMS.map((item) => ({
      question: item.question,
      answer: item.answer,
    })),
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
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
                Client Sanctuary Support
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#073a2d] leading-tight mb-4">
              Frequently Asked Questions
            </h1>
            <p className="font-sans text-sm sm:text-base text-[#52605b] max-w-2xl leading-relaxed">
              Find detailed guidance regarding orders, sizing, Cash on Delivery, open-box verification, and fabric preservation.
            </p>
          </header>

          {/* FAQ Accordion List using Semantic HTML5 details/summary */}
          <div className="space-y-4 mb-12">
            {FAQ_ITEMS.map((faq, index) => (
              <details
                key={index}
                className="group bg-white border border-[#deddd3] p-5 sm:p-6 shadow-xs transition-colors open:bg-[#fbf9f2]/60 open:border-[#073a2d]/30"
              >
                <summary className="flex items-center justify-between cursor-pointer list-none select-none gap-4">
                  <div className="space-y-1">
                    <span className="font-sans text-[10px] uppercase tracking-wider text-[#c79a45] font-semibold block">
                      {faq.category}
                    </span>
                    <h2 className="font-serif text-base sm:text-lg text-[#073a2d] font-semibold group-hover:text-[#0d4d3b]">
                      {faq.question}
                    </h2>
                  </div>
                  <ChevronDown className="w-5 h-5 text-[#073a2d] shrink-0 transition-transform duration-300 group-open:rotate-180" />
                </summary>
                <div className="pt-4 mt-3 border-t border-[#f0eee7] font-sans text-xs sm:text-sm text-[#52605b] leading-relaxed space-y-3">
                  <p>{faq.answer}</p>
                  {faq.link && (
                    <p className="pt-1">
                      <Link
                        href={faq.link.href}
                        className="inline-flex items-center gap-1.5 font-semibold text-[#073a2d] hover:text-[#c79a45] transition-colors underline"
                      >
                        <span>{faq.link.label}</span>
                        <span>→</span>
                      </Link>
                    </p>
                  )}
                </div>
              </details>
            ))}
          </div>

          {/* Concierge Help Banner */}
          <div className="bg-[#073a2d] text-[#fbf9f2] p-8 border border-[#c79a45]/30 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
            <div className="space-y-1.5 text-center sm:text-left">
              <span className="font-sans text-[11px] uppercase tracking-[0.25em] text-[#c79a45] font-semibold block">
                Direct Assistance
              </span>
              <h3 className="font-serif text-xl text-white">Have a Specific Tailoring Question?</h3>
              <p className="font-sans text-xs text-[#c0c8c3] max-w-md">
                Our master cutting consultants in Dhaka are ready to assist you on WhatsApp with size selection and outfit coordination.
              </p>
            </div>
            <Link
              href="/contact"
              className="px-5 py-2.5 bg-[#c79a45] hover:bg-[#b08436] text-[#073a2d] font-sans text-xs uppercase tracking-widest font-semibold transition-colors shrink-0"
            >
              Contact Atelier
            </Link>
          </div>

          {/* Quick Policy Links */}
          <div className="mt-10 p-6 bg-[#f5f4ed] border border-[#deddd3] flex flex-wrap items-center justify-between gap-4 font-sans text-xs text-[#073a2d] font-semibold">
            <Link href="/shipping" className="hover:text-[#c79a45] underline">
              Shipping Guidelines →
            </Link>
            <Link href="/returns" className="hover:text-[#c79a45] underline">
              Return &amp; Exchange Policy →
            </Link>
            <Link href="/about" className="hover:text-[#c79a45] underline">
              About Rongin Libas →
            </Link>
            <Link href="/men" className="hover:text-[#c79a45] underline">
              Browse Menswear →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
