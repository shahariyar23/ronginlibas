import React from 'react';
import Link from 'next/link';
import { CATEGORIES } from '@/data/categories';
import { ArrowRight } from 'lucide-react';

export const CategoryGrid: React.FC = () => {
  return (
    <section id="categories" className="w-full py-10 sm:py-24 bg-[#fbf9f2] scroll-mt-20">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-16 gap-3 sm:gap-4">
          <div>
            <span className="font-sans text-[11px] sm:text-xs uppercase tracking-[0.25em] text-[#c79a45] font-semibold block mb-1 sm:mb-2">
              CURATED WARDROBE
            </span>
            <h2 className="font-serif text-2xl sm:text-5xl font-normal text-[#073a2d]">
              SHOP MEN
            </h2>
            <p className="font-sans text-xs sm:text-sm text-[#69726d] mt-1 sm:mt-2 max-w-xl">
              Explore essential menswear crafted with precision, structured lines, and understated Bangladeshi panache.
            </p>
          </div>
          <Link
            href="/shop"
            className="font-sans text-xs uppercase tracking-widest text-[#073a2d] hover:text-[#0d4d3b] flex items-center gap-1.5 group font-semibold self-start sm:self-auto"
          >
            <span>VIEW FULL CATALOGUE</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-[#c79a45]" />
          </Link>
        </div>

        {/* 6 Grid Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-8">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              className="group relative bg-[#f5f4ed] border border-[#deddd3] overflow-hidden transition-all duration-500 hover:shadow-xl flex flex-col"
            >
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#eae8e1]">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#00231a]/90 via-black/30 to-transparent opacity-85 group-hover:opacity-95 transition-opacity" />

                {cat.tag && (
                  <div className="absolute top-2.5 left-2.5 sm:top-4 sm:left-4 bg-white text-[#073a2d] px-2 sm:px-3 py-0.5 sm:py-1 font-sans text-[8.5px] sm:text-[10px] font-bold uppercase tracking-wider sm:tracking-widest border border-[#deddd3]">
                    {cat.tag}
                  </div>
                )}

                <div className="absolute bottom-3 left-3 right-3 sm:bottom-6 sm:left-6 sm:right-6 text-[#fbf9f2]">
                  <p className="font-sans text-[9px] sm:text-[11px] uppercase tracking-widest text-[#c79a45] mb-0.5 sm:mb-1 font-medium">
                    {cat.sub}
                  </p>
                  <h3 className="font-serif text-sm sm:text-2xl font-normal mb-0.5 sm:mb-1 leading-tight">
                    {cat.name}
                  </h3>
                  <p className="hidden sm:block font-sans text-xs text-[#c0c8c3] line-clamp-1 mb-4 font-light">
                    {cat.desc}
                  </p>
                  <Link
                    href={cat.path}
                    className="inline-flex items-center gap-1.5 sm:gap-2 font-sans text-[10px] sm:text-xs uppercase tracking-wider text-[#fbf9f2] hover:text-[#c79a45] transition-colors font-semibold"
                  >
                    <span>Shop {cat.name}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
