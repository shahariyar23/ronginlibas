import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, ArrowLeft, Lock, Database, Mail, Server, EyeOff, UserCheck, Phone } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy | Rongin Libas — Data Protection & Privacy Practices',
  description:
    'Rongin Libas Privacy Policy. Understand how your personal details, tailoring measurements, order history, and social authentication data (Google) are collected, protected, and processed.',
  alternates: {
    canonical: 'https://ronginlibas.com/privacy',
  },
  openGraph: {
    title: 'Privacy Policy | Rongin Libas',
    description:
      'Learn how Rongin Libas protects your personal information, bespoke measurements, and authentication data.',
    url: 'https://ronginlibas.com/privacy',
    siteName: 'Rongin Libas',
    type: 'website',
  },
};

export default function PrivacyPolicyPage() {
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
            <Lock className="w-3.5 h-3.5 text-[#c79a45]" />
            Patron Confidentiality &amp; Privacy Charter
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#073a2d] font-normal tracking-tight">
            Privacy Policy
          </h1>
          <p className="font-sans text-xs sm:text-sm text-[#69726d] mt-3 leading-relaxed">
            Effective Date &amp; Last Updated: <time dateTime="2026-10-12">{lastUpdated}</time>
          </p>
          <p className="font-sans text-xs sm:text-sm text-[#404945] mt-2 leading-relaxed">
            At Rongin Libas (<strong>ronginlibas.com</strong>), we honor the privacy of our patrons with the same rigorous care and dignity that we invest into our handloom weaves. This Privacy Policy details the exact personal information we collect, how it is secured, and which specialized processors assist us in fulfilling your bespoke orders.
          </p>
        </header>

        {/* Privacy Principles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          <div className="p-4 bg-white border border-[#deddd3] shadow-xs">
            <EyeOff className="w-5 h-5 text-[#073a2d] mb-2" />
            <h4 className="font-serif text-sm font-medium text-[#073a2d]">No Ad Tracking</h4>
            <p className="font-sans text-xs text-[#69726d] mt-1">
              We do not run third-party behavioral ad trackers or sell customer data to advertising networks.
            </p>
          </div>
          <div className="p-4 bg-white border border-[#deddd3] shadow-xs">
            <Lock className="w-5 h-5 text-[#073a2d] mb-2" />
            <h4 className="font-serif text-sm font-medium text-[#073a2d]">Fortified Authentication</h4>
            <p className="font-sans text-xs text-[#69726d] mt-1">
              Bcrypt-hashed passwords, secure HTTP-only refresh cookies, and verified Firebase OAuth claims.
            </p>
          </div>
          <div className="p-4 bg-white border border-[#deddd3] shadow-xs">
            <UserCheck className="w-5 h-5 text-[#073a2d] mb-2" />
            <h4 className="font-serif text-sm font-medium text-[#073a2d]">Full Data Rights</h4>
            <p className="font-sans text-xs text-[#69726d] mt-1">
              Self-service account deletion and complete data purge anytime in your Patron Sanctuary profile.
            </p>
          </div>
        </div>

        {/* Policy Sections */}
        <article className="prose prose-sm max-w-none text-[#404945] font-sans leading-relaxed space-y-8">
          {/* 1. Data Controller */}
          <section className="bg-white p-6 sm:p-8 border border-[#deddd3] space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl text-[#073a2d] font-normal border-b border-[#f0eee7] pb-3">
              1. Data Controller &amp; Scope
            </h2>
            <p>
              Rongin Libas acts as the <strong>Data Controller</strong> for all personal information collected through our web storefront (<code>https://ronginlibas.com</code>) and concierge services. Our studios and fulfillment center operate in Dhaka, Bangladesh.
            </p>
          </section>

          {/* 2. Personal Information Collected */}
          <section className="bg-white p-6 sm:p-8 border border-[#deddd3] space-y-4">
            <h2 className="font-serif text-xl sm:text-2xl text-[#073a2d] font-normal border-b border-[#f0eee7] pb-3">
              2. Personal Information We Collect
            </h2>
            <p>
              We collect only the data necessary to provide authentic menswear, tailor bespoke sizes, coordinate courier deliveries, and maintain your account:
            </p>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-[#fbf9f2] border border-[#deddd3]">
                <h4 className="font-semibold text-[#073a2d] text-sm mb-1">A. Identity &amp; Contact Credentials</h4>
                <p className="text-[#69726d]">
                  <strong>Full Name, Email Address, Primary Mobile Number, Secondary Phone</strong>, and optional Date of Birth. When creating an account via email, passwords are encrypted using one-way <strong>bcrypt hashing</strong> with salted keys; raw passwords are never stored or readable.
                </p>
              </div>

              <div className="p-3.5 bg-[#fbf9f2] border border-[#deddd3]">
                <h4 className="font-semibold text-[#073a2d] text-sm mb-1">B. Social Authentication Identifiers</h4>
                <p className="text-[#69726d]">
                  When signing in via <strong>Google</strong>, we receive and store provider-verified identity claims (Provider Name, Provider User ID, Verified Email, and Profile Photo URL). We <strong>never</strong> receive or store your social account passwords or third-party OAuth access tokens.
                </p>
              </div>

              <div className="p-3.5 bg-[#fbf9f2] border border-[#deddd3]">
                <h4 className="font-semibold text-[#073a2d] text-sm mb-1">C. Delivery Residences &amp; Addresses</h4>
                <p className="text-[#69726d]">
                  Recipient full name, phone number, address line, city, division (Dhaka, Chittagong, Sylhet, etc.), postal code, and specific courier delivery instructions.
                </p>
              </div>

              <div className="p-3.5 bg-[#fbf9f2] border border-[#deddd3]">
                <h4 className="font-semibold text-[#073a2d] text-sm mb-1">D. Bespoke Sartorial &amp; Tailoring Profile</h4>
                <p className="text-[#69726d]">
                  Optional custom garment measurements: <strong>chest, shoulder width, sleeve length, collar circumference, waist, trouser length, and preferred panjabi length</strong>, along with tailoring cut preferences (e.g. Slim Heritage Cut, Mandarin Collar).
                </p>
              </div>

              <div className="p-3.5 bg-[#fbf9f2] border border-[#deddd3]">
                <h4 className="font-semibold text-[#073a2d] text-sm mb-1">E. Purchase &amp; Transaction Information</h4>
                <p className="text-[#69726d]">
                  Order numbers, purchased items, quantities, size/color variant selections, pricing totals, delivery fee records, payment method (Cash on Delivery), and courier tracking consignment numbers.
                </p>
              </div>

              <div className="p-3.5 bg-[#fbf9f2] border border-[#deddd3]">
                <h4 className="font-semibold text-[#073a2d] text-sm mb-1">F. Bag, Wishlist &amp; Client Reflections</h4>
                <p className="text-[#69726d]">
                  Items saved in your active shopping bag, saved wishlist bookmarks, written product reviews, star ratings, and review photos.
                </p>
              </div>
            </div>
          </section>

          {/* 3. How We Use Your Data */}
          <section className="bg-white p-6 sm:p-8 border border-[#deddd3] space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl text-[#073a2d] font-normal border-b border-[#f0eee7] pb-3">
              3. Purpose &amp; Lawful Grounds for Processing
            </h2>
            <p>We process your personal information strictly for legitimate commercial and fulfillment objectives:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs">
              <li>
                <strong>Order Fulfillment &amp; Tailoring:</strong> Cutting bespoke panjabis to your specifications, packaging orders, and dispatching parcel consignments to your address.
              </li>
              <li>
                <strong>Customer Communication:</strong> Dispatching transactional order confirmations, tracking alerts, and courier verification updates.
              </li>
              <li>
                <strong>Account Maintenance:</strong> Permitting fast sign-in via Google or email, and syncing saved residences across devices.
              </li>
              <li>
                <strong>Fraud Prevention:</strong> Verifying order authenticity and phone numbers to prevent fraudulent Cash on Delivery consignments.
              </li>
              <li>
                <strong>Legal &amp; Tax Compliance:</strong> Maintaining statutory sales invoices, tax records, and audit ledgers.
              </li>
            </ul>
          </section>

          {/* 4. Third-Party Processors */}
          <section className="bg-white p-6 sm:p-8 border border-[#deddd3] space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl text-[#073a2d] font-normal border-b border-[#f0eee7] pb-3">
              4. Third-Party Service Processors
            </h2>
            <p>
              We do not sell, rent, or trade customer information. We share minimal necessary data with specialized technical processors who operate under strict confidentiality:
            </p>
            <div className="space-y-3 text-xs pt-2">
              <div className="border border-[#deddd3] p-3 bg-[#fbf9f2]">
                <span className="font-semibold text-[#073a2d]">Firebase Authentication (Google LLC):</span>
                <p className="text-[#69726d] mt-0.5">
                  Provides OAuth federated identity infrastructure for Google authentication. ID tokens are verified server-side on our NestJS backend using Firebase Admin SDK.
                </p>
              </div>
              <div className="border border-[#deddd3] p-3 bg-[#fbf9f2]">
                <span className="font-semibold text-[#073a2d]">Brevo (formerly Sendinblue):</span>
                <p className="text-[#69726d] mt-0.5">
                  Handles transactional SMTP email delivery for order receipts, password resets, welcome credits, and abandoned cart notices. Brevo processes recipient email addresses and order summaries.
                </p>
              </div>
              <div className="border border-[#deddd3] p-3 bg-[#fbf9f2]">
                <span className="font-semibold text-[#073a2d]">Cloudinary Ltd.:</span>
                <p className="text-[#69726d] mt-0.5">
                  Hosts optimized product catalog images and customer review photo uploads over secure CDN endpoints.
                </p>
              </div>
              <div className="border border-[#deddd3] p-3 bg-[#fbf9f2]">
                <span className="font-semibold text-[#073a2d]">Logistics Courier Partners (Pathao, Steadfast, RedX):</span>
                <p className="text-[#69726d] mt-0.5">
                  We transmit the recipient name, primary phone number, and physical address exclusively to generate shipping labels and dispatch riders for parcel delivery and COD collection.
                </p>
              </div>
              <div className="border border-[#deddd3] p-3 bg-[#fbf9f2]">
                <span className="font-semibold text-[#073a2d]">Neon Database &amp; Cloudflare:</span>
                <p className="text-[#69726d] mt-0.5">
                  Relational PostgreSQL database management with automated encryption at rest and in transit, and Cloudflare edge CDN distribution.
                </p>
              </div>
            </div>
          </section>

          {/* 5. Cookies & Local Storage */}
          <section className="bg-white p-6 sm:p-8 border border-[#deddd3] space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl text-[#073a2d] font-normal border-b border-[#f0eee7] pb-3">
              5. Cookies &amp; Storage Architecture
            </h2>
            <p>
              Our application uses strictly functional storage elements necessary for session security and navigation:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs">
              <li>
                <strong><code>rongin_libas_refresh</code> Cookie:</strong> An HTTP-only, secure, SameSite cookie scoped strictly to <code>/api/v1/auth/refresh</code> with a 7-day lifespan. It holds an encrypted refresh token to maintain your signed-in state without exposing credentials to client-side scripts.
              </li>
              <li>
                <strong>Browser LocalStorage:</strong> Used to temporarily store a short-lived (15-minute) JSON Web Token (<code>rongin_access_token</code>) for authorized API requests, and local guest shopping bag data prior to login.
              </li>
              <li>
                <strong>Tracking &amp; Analytics:</strong> We <strong>do not</strong> use third-party behavioral cookies, Google Analytics tracking tags, or Facebook tracking pixels on our storefront.
              </li>
            </ul>
          </section>

          {/* 6. Security Practices */}
          <section className="bg-white p-6 sm:p-8 border border-[#deddd3] space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl text-[#073a2d] font-normal border-b border-[#f0eee7] pb-3">
              6. Technical Security Measures
            </h2>
            <p>
              We implement comprehensive defense mechanisms to safeguard patron records:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs">
              <li>Mandatory HTTPS encryption across all browser and API communications.</li>
              <li>Server-side verification of all social login tokens using Firebase Admin SDK (preventing forged client assertions).</li>
              <li>Bcrypt cryptographic password hashing with adaptive salt work factors.</li>
              <li>Rate limiting and throttled endpoints to protect authentication against brute-force intrusion.</li>
              <li>Role-based access controls and administrative audit logging for all customer profile modifications.</li>
            </ul>
          </section>

          {/* 7. Data Retention & Account Deletion */}
          <section className="bg-white p-6 sm:p-8 border border-[#deddd3] space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl text-[#073a2d] font-normal border-b border-[#f0eee7] pb-3">
              7. Data Retention, Customer Rights &amp; Account Deletion
            </h2>
            <p>
              You maintain full sovereignty over your personal data:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs">
              <li>
                <strong>Access &amp; Rectification:</strong> You can review and update your name, phone, saved delivery residences, and tailoring measurements at any time directly in your{' '}
                <Link href="/profile" className="text-[#073a2d] font-semibold underline">
                  Patron Sanctuary Profile
                </Link>.
              </li>
              <li>
                <strong>Right to Erasure (Account Deletion):</strong> You may permanently delete your customer account at any time. Self-service deletion is available under the <em>Sanctuary Security</em> tab in your profile, or via our public{' '}
                <Link href="/data-deletion" className="text-[#073a2d] font-semibold underline">
                  Data Deletion Page
                </Link>.
              </li>
              <li>
                <strong>Impact of Deletion:</strong> Upon deletion, your customer record, saved delivery addresses, measurement profiles, shopping cart, and connected social identities (Google) are permanently removed from our active database. Completed purchase totals are preserved in an archived audit table to comply with statutory accounting and tax regulations.
              </li>
            </ul>
          </section>

          {/* 8. Contact Concierge */}
          <section className="bg-white p-6 sm:p-8 border border-[#deddd3] space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl text-[#073a2d] font-normal border-b border-[#f0eee7] pb-3">
              8. Privacy Concierge &amp; Inquiries
            </h2>
            <p>
              If you have questions regarding this Privacy Policy, wish to exercise your data rights, or need assistance removing your details, please reach out to our privacy officer:
            </p>
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              
              <div className="p-3 bg-[#fbf9f2] border border-[#deddd3] flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#073a2d] shrink-0" />
                <span>
                  WhatsApp:{' '}
                  <a
                    href="https://wa.me/8801352926067"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#073a2d] font-semibold hover:underline"
                  >
                    +8801352926067
                  </a>{' '}
                  (<a href="tel:+8801352926067" className="text-[#073a2d] hover:underline">Direct Tel</a>)
                </span>
              </div>
            </div>
           
          </section>
        </article>

        {/* Footer Navigation */}
        <div className="mt-12 pt-8 border-t border-[#deddd3] flex flex-wrap items-center justify-between gap-4 font-sans text-xs text-[#717975]">
          <span>© {new Date().getFullYear()} Rongin Libas Atelier.</span>
          <div className="flex items-center gap-6">
            <Link href="/terms" className="text-[#073a2d] font-semibold hover:underline">
              Terms of Service
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
