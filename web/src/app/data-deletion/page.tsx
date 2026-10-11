import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ShieldAlert,
  ArrowLeft,
  Trash2,
  CheckCircle2,
  FileText,
  Mail,
  Lock,
  ExternalLink,
  Phone,
  HelpCircle,
  Database,
} from 'lucide-react';
import { DataDeletionClient } from './DataDeletionClient';

export const metadata: Metadata = {
  title: 'User Data Deletion Instructions | Rongin Libas — Account & Data Privacy',
  description:
    'Official instructions and submission portal for Rongin Libas customer data deletion and account erasure requests. Learn how personal data is purged and historical orders are retained.',
  alternates: {
    canonical: 'https://ronginlibas.com/data-deletion',
  },
  openGraph: {
    title: 'Data Deletion Instructions | Rongin Libas',
    description:
      'Official instructions and submission portal for Rongin Libas customer data deletion and account erasure requests.',
    url: 'https://ronginlibas.com/data-deletion',
    siteName: 'Rongin Libas',
    type: 'website',
  },
};

export default function DataDeletionPage() {
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
            <Trash2 className="w-3.5 h-3.5 text-[#c79a45]" />
            Privacy &amp; Account Compliance Portal
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#073a2d] font-normal tracking-tight">
            User Data Deletion Instructions
          </h1>
          <p className="font-sans text-xs sm:text-sm text-[#69726d] mt-3 leading-relaxed">
            Effective Date &amp; Last Updated: <time dateTime="2026-10-12">{lastUpdated}</time>
          </p>
          <p className="font-sans text-xs sm:text-sm text-[#404945] mt-2 leading-relaxed">
            In accordance with international privacy principles and Rongin Libas&apos;s patron privacy charter, every customer and social login user has the absolute right to request the permanent deletion of their customer profile and linked authentication data.
          </p>
        </header>

        {/* Highlights / Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <div className="p-4 bg-white border border-[#deddd3] shadow-xs">
            <ShieldAlert className="w-5 h-5 text-[#073a2d] mb-2" />
            <h2 className="font-serif text-sm font-semibold text-[#073a2d]">Complete Erasure</h2>
            <p className="font-sans text-xs text-[#69726d] mt-1 leading-relaxed">
              Customer profile, social logins, saved addresses, measurements, wishlist, and cart are permanently purged.
            </p>
          </div>
          <div className="p-4 bg-white border border-[#deddd3] shadow-xs">
            <FileText className="w-5 h-5 text-[#073a2d] mb-2" />
            <h2 className="font-serif text-sm font-semibold text-[#073a2d]">Order Safety</h2>
            <p className="font-sans text-xs text-[#69726d] mt-1 leading-relaxed">
              Historical commercial invoices are anonymized and retained solely for mandatory taxation and statutory audit laws.
            </p>
          </div>
          <div className="p-4 bg-white border border-[#deddd3] shadow-xs">
            <Lock className="w-5 h-5 text-[#073a2d] mb-2" />
            <h2 className="font-serif text-sm font-semibold text-[#073a2d]">Verified Receipt</h2>
            <p className="font-sans text-xs text-[#69726d] mt-1 leading-relaxed">
              Public and in-app requests produce a signed confirmation code (<code className="font-mono text-[11px] text-[#073a2d]">RL-DEL-XXXXXX</code>) to verify deletion status.
            </p>
          </div>
        </div>

        {/* Section 1: Data Purge vs. Retention Specification */}
        <section className="bg-white border border-[#deddd3] p-6 sm:p-8 mb-10 shadow-xs space-y-6">
          <h2 className="font-serif text-xl sm:text-2xl text-[#073a2d] font-normal border-b border-[#deddd3] pb-3">
            1. Scope of Data Deletion &amp; Retention Policy
          </h2>

          <div className="space-y-4 font-sans text-xs text-[#404945] leading-relaxed">
            <p>
              When a deletion request is executed, Rongin Libas securely purges your personal profile while adhering to essential commercial accounting laws:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="p-4 bg-emerald-50/50 border border-emerald-200">
                <h3 className="font-serif text-sm font-semibold text-emerald-950 flex items-center gap-1.5 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  Data Permanently Deleted:
                </h3>
                <ul className="space-y-1.5 list-disc list-inside text-emerald-900 text-xs">
                  <li>Primary customer account (<code className="font-mono text-[11px]">Customer</code> record)</li>
                  <li>Linked social auth identities (<code className="font-mono text-[11px]">Google</code> provider IDs)</li>
                  <li>Password hashes and active refresh session tokens</li>
                  <li>All saved physical delivery addresses (<code className="font-mono text-[11px]">Address</code> records)</li>
                  <li>Active shopping cart and saved wishlist items</li>
                  <li>Bespoke tailoring sizing &amp; collar measurement profiles</li>
                  <li>Customer reviews, comments, and submitted photo attachments</li>
                </ul>
              </div>

              <div className="p-4 bg-[#fbf9f2] border border-[#deddd3]">
                <h3 className="font-serif text-sm font-semibold text-[#073a2d] flex items-center gap-1.5 mb-2">
                  <Database className="w-4 h-4 text-[#c79a45]" />
                  Data Retained for Legal Compliance:
                </h3>
                <ul className="space-y-1.5 list-disc list-inside text-[#404945] text-xs">
                  <li>
                    <strong>Historical Orders &amp; Tax Invoices:</strong> Under Bangladeshi commercial legislation and accounting standards, financial transactions, parcel delivery slips, and sales tax invoices must be retained.
                  </li>
                  <li>
                    <strong>Account Decoupling:</strong> The historical order record is decoupled from your customer identity (the customer link is set to null), preventing any future authentication or profile access while safeguarding financial auditing integrity.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: How to Submit a Deletion Request */}
        <section className="bg-white border border-[#deddd3] p-6 sm:p-8 mb-10 shadow-xs space-y-8">
          <h2 className="font-serif text-xl sm:text-2xl text-[#073a2d] font-normal border-b border-[#deddd3] pb-3">
            2. Methods to Request Deletion
          </h2>

          {/* Option A: In-app */}
          <div className="space-y-3">
            <h3 className="font-serif text-base text-[#073a2d] font-semibold flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#073a2d] text-[#fbf9f2] text-xs flex items-center justify-center font-mono">
                A
              </span>
              <span>Self-Service in Patron Profile (Recommended for Active Accounts)</span>
            </h3>
            <p className="font-sans text-xs text-[#69726d] leading-relaxed">
              If you have access to your account, you can execute immediate, self-service deletion without manual review:
            </p>
            <ol className="list-decimal list-inside space-y-1.5 font-sans text-xs text-[#404945] pl-2">
              <li>
                Sign in to your account at{' '}
                <Link href="/login" className="text-[#073a2d] font-semibold underline hover:text-[#c79a45]">
                  ronginlibas.com/login
                </Link>
                .
              </li>
              <li>
                Navigate to your{' '}
                <Link href="/profile" className="text-[#073a2d] font-semibold underline hover:text-[#c79a45]">
                  Patron Profile
                </Link>{' '}
                and select the <strong>Sanctuary Security</strong> tab.
              </li>
              <li>
                Locate the <strong>Account &amp; Data Erasure</strong> section at the bottom.
              </li>
              <li>
                Click <strong>Permanently Delete Account</strong>, type <code className="font-mono bg-[#f5f4ed] px-1 py-0.5 text-red-700">DELETE</code> into the safety modal, and confirm.
              </li>
              <li>
                Your profile is immediately wiped and all session tokens are invalidated.
              </li>
            </ol>
          </div>

          {/* Option B: Direct Public Form */}
          <div className="border-t border-[#deddd3] pt-6 space-y-3">
            <h3 className="font-serif text-base text-[#073a2d] font-semibold flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#073a2d] text-[#fbf9f2] text-xs flex items-center justify-center font-mono">
                B
              </span>
              <span>Public Deletion Request Form (No Login Required)</span>
            </h3>
            <p className="font-sans text-xs text-[#69726d] leading-relaxed">
              Use the official interactive form below to register your deletion request. You will immediately receive a verified confirmation receipt code for tracking.
            </p>
          </div>
        </section>

        {/* Section 3: Interactive Public Submission Form */}
        <div className="mb-10">
          <DataDeletionClient />
        </div>

        {/* Section 4: Concierge & Verification Support */}
        <section className="bg-white border border-[#deddd3] p-6 sm:p-8 shadow-xs space-y-4">
          <h2 className="font-serif text-xl sm:text-2xl text-[#073a2d] font-normal border-b border-[#deddd3] pb-3">
            3. Verification &amp; Concierge Support
          </h2>
          <p className="font-sans text-xs text-[#404945] leading-relaxed">
            If you experience any difficulties or require status verification for an existing deletion request code (<code className="font-mono text-[11px] text-[#073a2d]">RL-DEL-XXXXXX</code>), our data protection concierges are available to assist:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            

            <div className="p-4 bg-[#fbf9f2] border border-[#deddd3]">
              <div className="flex items-center gap-2 text-[#073a2d] font-serif text-sm font-semibold mb-1">
                <Phone className="w-4 h-4 text-[#c79a45]" />
                <span> WhatsApp</span>
              </div>
              <p className="font-sans text-xs text-[#69726d]">
                Dhaka Atelier: +880 1711 000000
              </p>
              <p className="font-sans text-[11px] text-[#717975] mt-1">
                Sunday through Thursday, 10:00 AM – 8:00 PM BST
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-[#deddd3] flex items-center justify-between flex-wrap gap-4 text-xs font-sans text-[#717975]">
            <div className="flex items-center gap-4">
              <Link href="/terms" className="hover:text-[#073a2d] underline">
                Terms of Service
              </Link>
              <span>•</span>
              <Link href="/privacy" className="hover:text-[#073a2d] underline">
                Privacy Policy
              </Link>
            </div>
            <span>Rongin Libas · Cloth Your Identity</span>
          </div>
        </section>
      </div>
    </div>
  );
}
