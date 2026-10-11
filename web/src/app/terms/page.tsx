import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, ArrowLeft, Truck, Package, RotateCcw, Clock, Mail, Phone } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service | Rongin Libas — Atelier Conditions & Client Charter',
  description:
    'Official Terms of Service for Rongin Libas. Review ordering policies, Cash on Delivery terms, nationwide shipping rates, open-box inspection, and bespoke tailoring charters.',
  alternates: {
    canonical: 'https://ronginlibas.com/terms',
  },
  openGraph: {
    title: 'Terms of Service | Rongin Libas',
    description:
      'Official Terms of Service for Rongin Libas. Authentic handloom guarantees, Cash on Delivery, and bespoke atelier charters.',
    url: 'https://ronginlibas.com/terms',
    siteName: 'Rongin Libas',
    type: 'website',
  },
};

export default function TermsOfServicePage() {
  const lastUpdated = 'October 12, 2026';

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
        <header className="border-b border-[#deddd3] pb-8 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#073a2d]/10 text-[#073a2d] font-sans text-[11px] font-semibold uppercase tracking-[0.2em] mb-4">
            <ShieldCheck className="w-3.5 h-3.5 text-[#c79a45]" />
            Client Charter &amp; Legal Agreement
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#073a2d] font-normal tracking-tight">
            Terms of Service
          </h1>
          <p className="font-sans text-xs sm:text-sm text-[#69726d] mt-3 leading-relaxed">
            Effective Date &amp; Last Updated: <time dateTime="2026-10-12">{lastUpdated}</time>
          </p>
          <p className="font-sans text-xs sm:text-sm text-[#404945] mt-2 leading-relaxed">
            Welcome to Rongin Libas (<strong>ronginlibas.com</strong>). By exploring our digital boutique, enrolling in our Patron Sanctuary, or placing an order for our aristocratic menswear, you enter into a legally binding agreement under these terms.
          </p>
        </header>

        {/* Core Quick Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          <div className="p-4 bg-white border border-[#deddd3] shadow-xs">
            <Truck className="w-5 h-5 text-[#073a2d] mb-2" />
            <h4 className="font-serif text-sm font-medium text-[#073a2d]">Nationwide Delivery</h4>
            <p className="font-sans text-xs text-[#69726d] mt-1">
              ৳80 within Dhaka Metro, ৳120 across 64 districts. Complimentary shipping for orders over ৳3,000.
            </p>
          </div>
          <div className="p-4 bg-white border border-[#deddd3] shadow-xs">
            <Package className="w-5 h-5 text-[#073a2d] mb-2" />
            <h4 className="font-serif text-sm font-medium text-[#073a2d]">Cash on Delivery</h4>
            <p className="font-sans text-xs text-[#69726d] mt-1">
              Payment upon doorstep parcel arrival with our 100% open-box visual inspection guarantee.
            </p>
          </div>
          <div className="p-4 bg-white border border-[#deddd3] shadow-xs">
            <RotateCcw className="w-5 h-5 text-[#073a2d] mb-2" />
            <h4 className="font-serif text-sm font-medium text-[#073a2d]">1-Day Exchange Window</h4>
            <p className="font-sans text-xs text-[#69726d] mt-1">
              Hassle-free size and product exchanges for unworn garments with original atelier tags attached.
            </p>
          </div>
        </div>

        {/* Content Sections */}
        <article className="prose prose-sm max-w-none text-[#404945] font-sans leading-relaxed space-y-8">
          {/* 1. About Rongin Libas */}
          <section className="bg-white p-6 sm:p-8 border border-[#deddd3] space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl text-[#073a2d] font-normal border-b border-[#f0eee7] pb-3">
              1. About Rongin Libas
            </h2>
            <p>
              Rongin Libas is an aristocratic Bangladeshi sartorial atelier specializing in bespoke panjabis, mercerized knitwear, and ancestral Bengal weaves. Our primary operations and atelier studios are located in Dhaka, Bangladesh, serving patrons nationwide and internationally through{' '}
              <a href="https://ronginlibas.com" className="text-[#073a2d] font-semibold underline">
                https://ronginlibas.com
              </a>.
            </p>
          </section>

          {/* 2. Account Registration & Patron Sanctuary */}
          <section className="bg-white p-6 sm:p-8 border border-[#deddd3] space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl text-[#073a2d] font-normal border-b border-[#f0eee7] pb-3">
              2. Account Registration &amp; Patron Security
            </h2>
            <p>
              Patrons may browse and purchase garments as guests or establish an authenticated Patron Sanctuary account using:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs">
              <li>Direct Email &amp; Password credentials</li>
              <li>Google Social Authentication</li>
            </ul>
          </section>

          {/* 3. Products, Sizing & Bespoke Tailoring */}
          <section className="bg-white p-6 sm:p-8 border border-[#deddd3] space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl text-[#073a2d] font-normal border-b border-[#f0eee7] pb-3">
              3. Product Information, Sizing &amp; Bespoke Tailoring
            </h2>
            <p>
              Every garment displayed in our collections is crafted with curated fabrics (including ancestral handlooms, Egyptian Giza cottons, and mercerized yarns). We endeavor to present authentic color tones and exact texture representations; however, natural handloom dye variations and screen calibration differences may occur.
            </p>
            <p>
              <strong>Bespoke Custom Measurements:</strong> Patrons who save customized body measurements (such as chest, shoulder, sleeve, collar, and garment length) acknowledge that custom-tailored panjabis are precision-cut specifically for the individual patron. Once tailoring has commenced, bespoke orders cannot be cancelled or exchanged, except in cases of verified craftsmanship defect.
            </p>
          </section>

          {/* 4. Pricing, Currency & Promotions */}
          <section className="bg-white p-6 sm:p-8 border border-[#deddd3] space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl text-[#073a2d] font-normal border-b border-[#f0eee7] pb-3">
              4. Pricing, Currency &amp; Promotional Coupons
            </h2>
            <p>
              All prices listed on the store are denominated in <strong>Bangladeshi Taka (BDT / ৳)</strong> and include applicable duties. Delivery charges are calculated and displayed transparently prior to order confirmation.
            </p>
            <p>
              Promotional coupon codes, seasonal discount bands, and initial welcome gift credits (e.g. ৳500 inaugural credit) are subject to specific minimum order thresholds, expiry dates, and usage limits specified at issue. Coupons cannot be redeemed for cash or combined retroactively once an order has been dispatched.
            </p>
          </section>

          {/* 5. Orders, Acceptance & Payment Terms */}
          <section className="bg-white p-6 sm:p-8 border border-[#deddd3] space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl text-[#073a2d] font-normal border-b border-[#f0eee7] pb-3">
              5. Orders, Acceptance &amp; Payment Methods
            </h2>
            <p>
              Submission of an order through our digital checkout constitutes an offer to purchase. Rongin Libas reserves the right to accept or decline orders in cases of stock exhaustion, typographical pricing errors, or unverified contact details.
            </p>
            <div className="p-4 bg-[#fbf9f2] border border-[#deddd3] space-y-2 text-xs">
              <p className="font-semibold text-[#073a2d]">Supported Payment Channels:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <strong>Cash on Delivery (COD):</strong> Available across all 64 districts of Bangladesh. Patrons settle the exact invoice amount with the courier delivery officer upon parcel receipt.
                </li>
                <li>
                  <strong>Direct WhatsApp Concierge:</strong> Patrons may coordinate private order assistance and manual payment confirmation directly via official WhatsApp (<code>+880 1916-664011</code>).
                </li>
              </ul>
            </div>
          </section>

          {/* 6. Shipping, Delivery & Inspection */}
          <section className="bg-white p-6 sm:p-8 border border-[#deddd3] space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl text-[#073a2d] font-normal border-b border-[#f0eee7] pb-3">
              6. Shipping, Delivery &amp; Doorstep Open-Box Inspection
            </h2>
            <p>
              Orders are packaged in moisture-resistant protective packaging and dispatched via contracted logistics courier partners (including Pathao, Steadfast, and RedX).
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs">
              <li>
                <strong>Dhaka Metropolitan Delivery:</strong> Standard charge ৳80. Estimated fulfillment: 24 to 48 hours.
              </li>
              <li>
                <strong>Outside Dhaka / Nationwide Delivery:</strong> Standard charge ৳120. Estimated fulfillment: 2 to 4 business days.
              </li>
              <li>
                <strong>Complimentary Delivery:</strong> Orders exceeding ৳3,000 qualify for free nationwide shipping.
              </li>
              <li>
                <strong>Doorstep Open-Box Inspection:</strong> Patrons may open the outer consignment in the presence of the courier delivery officer to inspect the visual condition, fabric, and size before final COD payment.
              </li>
            </ul>
          </section>

          {/* 7. Returns, Exchanges & Cancellations */}
          <section className="bg-white p-6 sm:p-8 border border-[#deddd3] space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl text-[#073a2d] font-normal border-b border-[#f0eee7] pb-3">
              7. Returns, Exchanges &amp; Order Cancellation
            </h2>
            <p>
              We want every patron to be thoroughly pleased with their heirloom garment. We offer a <strong>1-Day Exchange Policy</strong> from the date of recorded courier delivery:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs">
              <li>
                Garments must be unworn, unwashed, unaltered, and returned in their original packaging with all atelier brand tags intact.
              </li>
              <li>
                Size exchanges are accommodated subject to available atelier stock.
              </li>
              <li>
                Orders may be cancelled free of charge at any time prior to courier dispatch by contacting our concierge team. Once dispatched, return courier shipping costs may apply for non-defective cancellations.
              </li>
            </ul>
          </section>

          {/* 8. Client Reviews & Community Conduct */}
          <section className="bg-white p-6 sm:p-8 border border-[#deddd3] space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl text-[#073a2d] font-normal border-b border-[#f0eee7] pb-3">
              8. Client Reflections &amp; Product Reviews
            </h2>
            <p>
              Verified patrons who have purchased garments may submit ratings, written reflections, and garment photos. By submitting reviews, you grant Rongin Libas a non-exclusive license to display this content on our storefront. We reserve the right to moderate, hide, or remove reviews that contain abusive language, spam, or misleading claims.
            </p>
          </section>

          {/* 9. Intellectual Property */}
          <section className="bg-white p-6 sm:p-8 border border-[#deddd3] space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl text-[#073a2d] font-normal border-b border-[#f0eee7] pb-3">
              9. Intellectual Property
            </h2>
            <p>
              All trademarks, product names, bespoke patterns, photographic imagery, logo assets, and digital design architecture on <strong>ronginlibas.com</strong> are the exclusive intellectual property of Rongin Libas. Unauthorized copying, scraping, reproduction, or commercial re-distribution is strictly prohibited.
            </p>
          </section>

          {/* 10. Limitation of Liability */}
          <section className="bg-white p-6 sm:p-8 border border-[#deddd3] space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl text-[#073a2d] font-normal border-b border-[#f0eee7] pb-3">
              10. Limitation of Liability
            </h2>
            <p>
              To the fullest extent permitted by applicable law, Rongin Libas shall not be liable for indirect, incidental, or consequential damages resulting from website downtime, courier logistics delays beyond our reasonable control, or misuse of products. Our total liability for any claim arising from a purchase shall not exceed the total price paid for the specific order.
            </p>
          </section>

          {/* 11. Amendments & Governing Law */}
          <section className="bg-white p-6 sm:p-8 border border-[#deddd3] space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl text-[#073a2d] font-normal border-b border-[#f0eee7] pb-3">
              11. Modifications to Terms &amp; Governing Law
            </h2>
            <p>
              We reserve the right to revise these Terms of Service as our atelier grows. Updated terms become effective immediately upon publication on this page with an updated timestamp. These Terms are governed by and construed in accordance with the laws of the People&apos;s Republic of Bangladesh.
            </p>
          </section>

          {/* 12. Contact Details */}
          <section className="bg-white p-6 sm:p-8 border border-[#deddd3] space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl text-[#073a2d] font-normal border-b border-[#f0eee7] pb-3">
              12. Atelier Concierge &amp; Legal Notices
            </h2>
            <p>
              For inquiries regarding these Terms of Service or order assistance, our atelier concierge is at your service:
            </p>
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-[#fbf9f2] border border-[#deddd3] flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#073a2d] shrink-0" />
                <span> WhatsApp: <a href="tel:+8801916664011" className="text-[#073a2d] font-semibold">+880 1916-664011</a></span>
              </div>
            </div>
            
          </section>
        </article>

        {/* Footer Navigation */}
        <div className="mt-12 pt-8 border-t border-[#deddd3] flex flex-wrap items-center justify-between gap-4 font-sans text-xs text-[#717975]">
          <span>© {new Date().getFullYear()} Rongin Libas Atelier.</span>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-[#073a2d] font-semibold hover:underline">
              Privacy Policy
            </Link>
            <Link href="/data-deletion" className="text-[#073a2d] font-semibold hover:underline">
              Data Deletion
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
