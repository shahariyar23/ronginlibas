'use client';

import React from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { ProductCard } from '@/components/shop/ProductCard';
import { ArrowRight } from 'lucide-react';

interface ProductGridSectionProps {
  title: string;
  subtitle: string;
  tagline: string;
  products: Product[];
  viewAllLink?: string;
  bgLight?: boolean;
}

export const ProductGridSection: React.FC<ProductGridSectionProps> = ({
  title,
  subtitle,
  tagline,
  products,
  viewAllLink = '/shop',
  bgLight = true,
}) => {
  return (
    <section className={`w-full py-10 sm:py-20 ${bgLight ? 'bg-[#f5f4ed]' : 'bg-[#fbf9f2]'}`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-12 gap-3 sm:gap-4">
          <div>
            <span className="font-sans text-[11px] sm:text-xs uppercase tracking-[0.25em] text-[#c79a45] font-semibold block mb-1">
              {tagline}
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-normal text-[#073a2d]">
              {title}
            </h2>
            <p className="font-sans text-xs sm:text-sm text-[#69726d] mt-1 max-w-xl">
              {subtitle}
            </p>
          </div>

          <Link
            href={viewAllLink}
            className="font-sans text-xs uppercase tracking-widest text-[#073a2d] hover:text-[#0d4d3b] flex items-center gap-1.5 group font-semibold self-start sm:self-auto"
          >
            <span>VIEW ALL</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-[#c79a45]" />
          </Link>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {products.slice(0, 4).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
};
