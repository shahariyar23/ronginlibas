import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft, Compass, ShoppingBag } from 'lucide-react';
import { CANONICAL_BASE_URL } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Page Not Found (404) | Rongin Libas',
  description: 'The requested garment or page could not be located in the Rongin Libas atelier catalogue.',
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-[#fbf9f2] px-4 py-16 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full text-center space-y-8">
        <div className="space-y-3">
          <span className="font-mono text-xs tracking-widest uppercase text-[#c79a45] bg-[#c79a45]/10 px-3 py-1">
            Status 404 — Garment Relocated
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-normal text-[#073a2d] tracking-tight pt-2">
            Archive Not Located
          </h1>
          <p className="font-sans text-sm text-[#505a54] max-w-md mx-auto leading-relaxed">
            The page, collection, or bespoke garment you are seeking is either unavailable, has been renamed, or has moved within the atelier.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/men"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#073a2d] hover:bg-[#00231a] text-[#fbf9f2] font-sans text-xs uppercase tracking-widest transition-colors shadow-xs"
          >
            <ShoppingBag className="w-4 h-4 text-[#c79a45]" />
            <span>Explore Men&apos;s Collection</span>
          </Link>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-transparent hover:bg-white text-[#073a2d] border border-[#deddd3] font-sans text-xs uppercase tracking-widest transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Sanctuary</span>
          </Link>
        </div>

        <div className="pt-8 border-t border-[#deddd3] text-xs text-[#717975] flex items-center justify-center gap-6">
          <Link href="/collections/new-arrivals" className="hover:text-[#073a2d] hover:underline">
            New Arrivals
          </Link>
          <span>•</span>
          <Link href="/collections/bestsellers" className="hover:text-[#073a2d] hover:underline">
            Bestsellers
          </Link>
          <span>•</span>
          <Link href="/track-order" className="hover:text-[#073a2d] hover:underline">
            Track Order
          </Link>
        </div>
      </div>
    </div>
  );
}
