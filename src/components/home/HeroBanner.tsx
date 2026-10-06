import React from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const HeroBanner: React.FC = () => {
  return (
    <section className="relative w-full min-h-[calc(100vh-114px)] flex items-center justify-start overflow-hidden bg-[#00231a] py-8 sm:py-12 lg:py-16">
      {/* Background Hero Image with atmospheric overlays */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuA-PIsbLozCP5fnpvyZ-k60kSTLBh4QX1LmsfLPxmt-js88mmKtE2qsMWHQRxTclOzk2nH_Edm1dm6DiBTlzgwzjmEcVhTDrp9Z-lWVGQ_H6ybcjFhK-CKWG5fqds4Zg3GI_epoqzp89xlIJoGPexlm7WJtsBd-gLnyAfwvodB74CkRDWpiY_khKFKpNLI3ZeK7GK2_EaNpmgAxyp1vNVSOo90BFu53oKE_Cc7rG3rsCZ4kwW1HJcC7kQ"
          alt="Rongin Libas Aristocratic Panjabi Atelier"
          className="w-full h-full object-cover object-[center_top] sm:object-[center_5%] opacity-85 scale-100 transition-transform duration-1000 ease-out"
        />
        {/* Editorial gradient scrims */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#00231a] via-[#00231a]/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#00231a] via-transparent to-black/30" />
      </div>

      {/* Hero Content Canvas */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 w-full flex flex-col justify-between min-h-[calc(100vh-200px)]">
        <div className="max-w-2xl mt-4 sm:mt-6 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#073a2d]/80 border border-[#c79a45]/40 text-[#c79a45] text-xs font-sans uppercase tracking-[0.25em] mb-6 backdrop-blur-sm">
            <span>Spring / Festive Collection '25</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-normal text-[#fbf9f2] tracking-tight leading-[1.08] mb-6">
            CLOTH YOUR <br />
            <span className="italic font-light text-[#c79a45]">IDENTITY</span>
          </h1>

          <p className="font-sans text-sm sm:text-base text-[#e4e2dc] leading-relaxed max-w-lg mb-8 font-light">
            Bespoke Bengal panjabis, mercerized knitwear, and structured casual tailoring engineered with aristocratic dignity and contemporary minimalism.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/shop"
              className={cn(
                buttonVariants({ variant: 'default' }),
                'h-13 px-8 bg-[#c79a45] hover:bg-[#b08535] text-[#073a2d] font-sans font-bold uppercase tracking-[0.16em] text-xs shadow-lg transition-all inline-flex items-center justify-center'
              )}
            >
              SHOP MEN
            </Link>
            <Link
              href="/shop?filter=new"
              className={cn(
                buttonVariants({ variant: 'outline' }),
                'h-13 px-8 bg-white/10 hover:bg-white/20 text-[#fbf9f2] border-white/30 hover:border-white font-sans uppercase tracking-[0.16em] text-xs backdrop-blur-sm group inline-flex items-center justify-center gap-2'
              )}
            >
              <span>EXPLORE NEW ARRIVALS</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Bottom Hero Stats Strip */}
        <div className="pt-12 border-t border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-6 sm:gap-10 text-[#fbf9f2]">
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

          <div className="flex items-center gap-2 text-xs font-sans uppercase tracking-widest text-[#c0c8c3]">
            <span>Scroll To Atelier</span>
            <ChevronDown className="w-4 h-4 animate-bounce text-[#c79a45]" />
          </div>
        </div>
      </div>
    </section>
  );
};
