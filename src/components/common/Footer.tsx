import React from 'react';
import Link from 'next/link';
import { Logo } from './Logo';
import { PhoneCall, Mail, MapPin, ShieldCheck } from 'lucide-react';

const InstagramIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const FacebookIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
);

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#00231a] text-[#fbf9f2] pt-20 pb-12 border-t border-[#073a2d]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 pb-16 border-b border-[#073a2d]">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-6">
            <Logo className="h-10 w-auto" inverted />
            <p className="font-sans text-xs leading-relaxed text-[#c0c8c3] max-w-sm">
              Rongin Libas is an aristocratic Bangladeshi sartorial atelier dedicated to the revival of ancestral handloom weaves, bespoke tailoring precision, and modern understated elegance.
            </p>
            <div className="pt-2 flex items-center gap-4 text-xs font-sans text-[#c79a45]">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                Genuine Handloom Guarantee
              </span>
              <span>•</span>
              <span>Nationwide Delivery</span>
            </div>
            {/* WhatsApp Direct */}
            <div className="pt-2">
              <a
                href="https://wa.me/8801916664011"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2.5 px-4 py-2.5 bg-[#073a2d] hover:bg-[#0d4d3b] text-[#fbf9f2] text-xs font-sans uppercase tracking-widest transition-colors border border-[#76a493]/30"
              >
                <PhoneCall className="w-4 h-4 text-[#c79a45]" />
                <span>Concierge & Orders: 01916664011</span>
              </a>
            </div>
          </div>

          {/* Shop Column */}
          <div>
            <h4 className="font-serif text-sm tracking-widest text-[#fbf9f2] uppercase mb-5 font-semibold">
              The Collection
            </h4>
            <ul className="space-y-3 font-sans text-xs text-[#c0c8c3]">
              <li>
                <Link href="/shop?category=panjabi" className="hover:text-[#c79a45] transition-colors">
                  Imperial Panjabi
                </Link>
              </li>
              <li>
                <Link href="/shop?category=shirts" className="hover:text-[#c79a45] transition-colors">
                  Egyptian Cotton Shirts
                </Link>
              </li>
              <li>
                <Link href="/shop?category=polos" className="hover:text-[#c79a45] transition-colors">
                  Mercerized Polos
                </Link>
              </li>
              <li>
                <Link href="/shop?category=t-shirts" className="hover:text-[#c79a45] transition-colors">
                  Heavyweight T-Shirts
                </Link>
              </li>
              <li>
                <Link href="/shop?category=trousers" className="hover:text-[#c79a45] transition-colors">
                  Gurkha & Pleated Trousers
                </Link>
              </li>
              <li>
                <Link href="/shop?filter=new" className="text-[#c79a45] hover:underline">
                  Eid '25 Preview
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care Column */}
          <div>
            <h4 className="font-serif text-sm tracking-widest text-[#fbf9f2] uppercase mb-5 font-semibold">
              Customer Care
            </h4>
            <ul className="space-y-3 font-sans text-xs text-[#c0c8c3]">
              <li>
                <Link href="/shop" className="hover:text-[#c79a45] transition-colors">
                  Bespoke Sizing & Matrix
                </Link>
              </li>
              <li>
                <Link href="/checkout" className="hover:text-[#c79a45] transition-colors">
                  Delivery & Shipping Terms
                </Link>
              </li>
              <li>
                <span className="hover:text-[#c79a45] transition-colors cursor-pointer">
                  Easy Exchanges & Returns
                </span>
              </li>
              <li>
                <span className="hover:text-[#c79a45] transition-colors cursor-pointer">
                  Pure Silk & Muslin Care
                </span>
              </li>
              <li>
                <span className="hover:text-[#c79a45] transition-colors cursor-pointer">
                  Corporate & Wedding Gifting
                </span>
              </li>
            </ul>
          </div>

          {/* Atelier & Connect */}
          <div>
            <h4 className="font-serif text-sm tracking-widest text-[#fbf9f2] uppercase mb-5 font-semibold">
              Atelier
            </h4>
            <div className="space-y-4 font-sans text-xs text-[#c0c8c3]">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#c79a45] flex-shrink-0 mt-0.5" />
                <p>Banani & Dhanmondi Studios, Dhaka, Bangladesh</p>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#c79a45] flex-shrink-0" />
                <a href="mailto:atelier@ronginlibas.com" className="hover:text-[#c79a45]">
                  atelier@ronginlibas.com
                </a>
              </div>
              <div className="pt-2 flex items-center gap-3">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-none border border-[#76a493]/30 flex items-center justify-center text-[#fbf9f2] hover:text-[#c79a45] hover:border-[#c79a45] transition-colors"
                >
                  <InstagramIcon />
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-none border border-[#76a493]/30 flex items-center justify-center text-[#fbf9f2] hover:text-[#c79a45] hover:border-[#c79a45] transition-colors"
                >
                  <FacebookIcon />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-sans text-[11px] text-[#717975]">
          <p>© {new Date().getFullYear()} Rongin Libas. Cloth Your Identity. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Payment Partners: bKash • Nagad • Visa • Mastercard • Cash on Delivery</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
