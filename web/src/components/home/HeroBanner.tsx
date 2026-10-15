import React from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowDown } from 'lucide-react';

export const HeroBanner: React.FC = () => {
  return (
    <section className="relative w-full min-h-[calc(100vh-92px)] min-h-[calc(100dvh-92px)] sm:min-h-[calc(100vh-108px)] sm:min-h-[calc(100dvh-108px)] sm:h-[calc(100vh-108px)] sm:h-[calc(100dvh-108px)] flex items-center overflow-hidden bg-[#00231a]">
      {/* 1. Full-bleed editorial background image from Stitch */}
      <div className="absolute inset-0 z-0">
        <img
          src="/hero-model.jpg"
          alt="Rongin Libas Sartorial Menswear Campaign"
          className="w-full h-full object-cover object-[75%_top] sm:object-[80%_top] lg:object-[82%_top]"
        />
        {/* Cinematic gradient veil: heavy dark emerald on left for text readability, atmospheric fade to right */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#00231a] via-[#00231a]/90 sm:via-[#00231a]/80 md:via-[#00231a]/70 lg:via-[#00231a]/60 to-transparent" />
        {/* Bottom subtle grounding vignette for metrics bar */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#00231a]/95 via-transparent to-transparent" />
      </div>

      {/* 2. Main Hero Content Canvas */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 flex flex-col justify-between h-full min-h-[calc(100vh-92px)] min-h-[calc(100dvh-92px)] sm:min-h-[calc(100vh-108px)] sm:min-h-[calc(100dvh-108px)]">
        {/* Top/Center Main Copy Section */}
        <div className="max-w-2xl pt-4 sm:pt-10">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 sm:gap-2.5 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-[#073a2d]/85 backdrop-blur-md border border-[#c79a45]/35 text-[#deddd3] text-[9.5px] sm:text-[11px] font-sans uppercase tracking-[0.16em] sm:tracking-[0.2em] mb-4 sm:mb-6 shadow-sm">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#c79a45] shadow-[0_0_8px_#c79a45]" />
            <span>LAUNCH COLLECTION 2025</span>
            <span className="text-[#c79a45]/70 hidden xs:inline">|</span>
            <span className="hidden xs:inline">DIGNITY IN FABRIC</span>
          </div>

          {/* Kicker Overline */}
          <p className="font-sans text-[11px] sm:text-xs tracking-[0.2em] sm:tracking-[0.24em] font-bold text-[#c79a45] uppercase mb-2 sm:mb-4">
            SARTORIAL MENSWEAR
          </p>

          {/* Headline */}
          <h1 className="font-serif text-4xl sm:text-7xl lg:text-8xl font-normal text-white tracking-tight leading-[1.05] sm:leading-[1.02] mb-4 sm:mb-6">
            <span className="sr-only">Rongin Libas — </span>
            CLOTH YOUR <br />
            <span className="italic font-light">IDENTITY</span>
          </h1>

          {/* Supporting Narrative */}
          <p className="font-sans text-xs sm:text-base text-[#deddd3] leading-relaxed max-w-xl mb-6 sm:mb-9 font-light">
            Modern menswear crafted for style, comfort and confidence. Hand-stitched tailoring meets contemporary silhouette architecture for everyday grandeur.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 sm:gap-8 mb-8 sm:mb-10">
            <Link
              href="/men"
              className="h-11 sm:h-12 px-8 sm:px-9 bg-white hover:bg-[#fbf9f2] text-[#073a2d] font-sans font-bold uppercase tracking-[0.16em] text-xs shadow-lg transition-all rounded-none inline-flex items-center justify-center hover:scale-[1.02] active:scale-[0.98]"
            >
              SHOP MEN
            </Link>
            <Link
              href="/collections/new-arrivals"
              className="font-sans text-xs uppercase tracking-[0.16em] font-bold text-white hover:text-[#c79a45] transition-colors inline-flex items-center justify-center sm:justify-start gap-2 group py-2"
            >
              <span>EXPLORE NEW ARRIVALS</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Bottom Metrics Strip & Scroll Indicator */}
        <div className="pt-6 sm:pt-8 border-t border-white/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 text-white">
          <div className="grid grid-cols-3 gap-3 w-full sm:w-auto sm:flex sm:items-center sm:gap-12">
            <div>
              <p className="font-serif text-xl sm:text-2xl font-bold text-white">100%</p>
              <p className="font-sans text-[9px] sm:text-[11px] uppercase tracking-wider text-[#c0c8c3] leading-tight">
                COTTON & SILK
              </p>
            </div>
            <div>
              <p className="font-serif text-xl sm:text-2xl font-bold text-white">3-Ply</p>
              <p className="font-sans text-[9px] sm:text-[11px] uppercase tracking-wider text-[#c0c8c3] leading-tight">
                STITCH SEAMS
              </p>
            </div>
            <div>
              <p className="font-serif text-xl sm:text-2xl font-bold text-white">৳ 3,000+</p>
              <p className="font-sans text-[9px] sm:text-[11px] uppercase tracking-wider text-[#c0c8c3] leading-tight">
                FREE SHIPPING
              </p>
            </div>
          </div>

          {/* Scroll to Atelier link */}
          <a
            href="#categories"
            className="font-sans text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-[#c79a45] hover:text-[#e0b75f] transition-all duration-300 hover:scale-105 inline-flex items-center gap-2 group self-end sm:self-auto pt-1 sm:pt-0"
          >
            <span>SCROLL TO ATELIER</span>
            <ArrowDown className="w-3.5 h-3.5 motion-safe:animate-bounce group-hover:translate-y-1 transition-transform" />
          </a>
        </div>
      </div>
    </section>
  );
};
