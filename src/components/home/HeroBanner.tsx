import React from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const HeroBanner: React.FC = () => {
  return (
    <section className="relative w-full bg-[#00231a] overflow-hidden py-10 sm:py-14 lg:py-20">
      {/* Ambient background atmosphere with golden warmth & royal emerald depth */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-[#073a2d]/40 blur-3xl" />
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#c79a45]/10 blur-[140px]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#00231a] via-[#00231a]/95 to-[#00231a]/80" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Regal Atelier Copy & Actions */}
          <div className="lg:col-span-7 xl:col-span-7 flex flex-col justify-center">
            {/* Collection Badge */}
            <div className="inline-flex items-center gap-2 self-start px-3.5 py-1.5 bg-[#073a2d] border border-[#c79a45]/40 text-[#c79a45] text-[11px] font-sans font-medium uppercase tracking-[0.22em] mb-6 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c79a45] animate-pulse" />
              <span>Spring / Festive Collection '25 • Dhaka Atelier</span>
            </div>

            {/* Headline */}
            <h1 className="font-serif text-4xl sm:text-6xl xl:text-7xl font-normal text-[#fbf9f2] tracking-tight leading-[1.08] mb-6">
              CLOTH YOUR <br />
              <span className="italic font-light text-[#c79a45]">IDENTITY</span>
            </h1>

            {/* Narrative description */}
            <p className="font-sans text-sm sm:text-base text-[#deddd3] leading-relaxed max-w-xl mb-8 font-light">
              Bespoke Bengal panjabis, mercerized knitwear, and structured casual tailoring engineered with aristocratic dignity and contemporary minimalism.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 mb-10">
              <Link
                href="/shop"
                className={cn(
                  buttonVariants({ variant: 'default' }),
                  'h-12 px-8 bg-[#c79a45] hover:bg-[#b08535] text-[#073a2d] font-sans font-bold uppercase tracking-[0.16em] text-xs shadow-lg transition-all inline-flex items-center justify-center'
                )}
              >
                SHOP MEN
              </Link>
              <Link
                href="/shop?filter=new"
                className={cn(
                  buttonVariants({ variant: 'outline' }),
                  'h-12 px-8 bg-white/10 hover:bg-white/20 text-[#fbf9f2] border-white/30 hover:border-white font-sans uppercase tracking-[0.16em] text-xs backdrop-blur-sm group inline-flex items-center justify-center gap-2'
                )}
              >
                <span>EXPLORE NEW ARRIVALS</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Craftsmanship Metrics */}
            <div className="pt-8 border-t border-white/15 flex flex-wrap items-center gap-6 sm:gap-10 text-[#fbf9f2]">
              <div>
                <p className="font-serif text-2xl font-bold text-[#c79a45]">100%</p>
                <p className="font-sans text-[11px] uppercase tracking-wider text-[#c0c8c3]">
                  Combed Cotton & Silk
                </p>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div>
                <p className="font-serif text-2xl font-bold text-[#c79a45]">3-Ply</p>
                <p className="font-sans text-[11px] uppercase tracking-wider text-[#c0c8c3]">
                  Artisanal Stitch Seams
                </p>
              </div>
              <div className="w-px h-8 bg-white/20 hidden sm:block" />
              <div className="hidden sm:block">
                <p className="font-serif text-2xl font-bold text-[#c79a45]">৳ 3,000+</p>
                <p className="font-sans text-[11px] uppercase tracking-wider text-[#c0c8c3]">
                  Complimentary Shipping
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Complete Editorial Portrait Showcase (100% Full Visibility) */}
          <div className="lg:col-span-5 xl:col-span-5 flex justify-center lg:justify-end">
            <div className="relative group w-full max-w-[430px]">
              {/* Subtle royal glow behind image frame */}
              <div className="absolute -inset-1.5 bg-gradient-to-tr from-[#c79a45]/40 via-[#073a2d]/60 to-[#c79a45]/20 rounded-sm blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-700" />

              {/* High-fashion Portrait Frame */}
              <div className="relative rounded-sm overflow-hidden border border-[#c79a45]/40 bg-[#073a2d] shadow-[0_25px_60px_rgba(0,0,0,0.7)]">
                <div className="aspect-[3/4] w-full relative overflow-hidden bg-[#001711]">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuA-PIsbLozCP5fnpvyZ-k60kSTLBh4QX1LmsfLPxmt-js88mmKtE2qsMWHQRxTclOzk2nH_Edm1dm6DiBTlzgwzjmEcVhTDrp9Z-lWVGQ_H6ybcjFhK-CKWG5fqds4Zg3GI_epoqzp89xlIJoGPexlm7WJtsBd-gLnyAfwvodB74CkRDWpiY_khKFKpNLI3ZeK7GK2_EaNpmgAxyp1vNVSOo90BFu53oKE_Cc7rG3rsCZ4kwW1HJcC7kQ"
                    alt="Rongin Libas Signature Royal Silk Panjabi in Deep Emerald"
                    className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  {/* Subtle inner lighting gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80" />
                </div>

                {/* Floating Provenance & Quick Shop Card */}
                <div className="absolute bottom-4 left-4 right-4 p-3.5 bg-[#00231a]/95 backdrop-blur-md border border-[#c79a45]/30 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-sans uppercase tracking-[0.2em] text-[#c79a45] block">
                      Tangail Silk • 1445 Edition
                    </span>
                    <h4 className="text-sm font-serif font-medium text-[#fbf9f2]">
                      Royal Emerald Panjabi
                    </h4>
                  </div>
                  <Link
                    href="/product/1"
                    className="text-[11px] font-sans uppercase tracking-widest bg-[#c79a45] hover:bg-[#b08535] text-[#073a2d] font-bold px-3 py-1.5 transition-colors"
                  >
                    View
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
