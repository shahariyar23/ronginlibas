'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import { Logo } from './Logo';
import {
  ShoppingCart,
  Heart,
  User,
  Menu,
  X,
  PhoneCall,
  Sparkles,
  ArrowRight,
  Package,
  Truck,
  Clock,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const Header: React.FC = () => {
  const { totalCount, setIsCartOpen } = useCart();
  const { wishlist } = useWishlist();
  const { user, isLoggedIn } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 left-0 right-0 z-40 bg-[#fbf9f2]/95 backdrop-blur-md shadow-[0_1px_8px_rgba(0,0,0,0.03)] transition-all">
        {/* Top Announcement Bar */}
        <div className="bg-[#073a2d] text-[#ffffff] py-1.5 text-center overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between font-sans text-[10.5px] tracking-[0.16em] uppercase">
            <span className="hidden md:inline-flex items-center gap-2 text-[#76a493]">
              <Sparkles className="w-3 h-3 text-[#c79a45]" />
              Haute Couture & Bespoke Menswear
            </span>
            <div className="flex-1 text-center truncate">
              <span className="font-semibold text-[#fbf9f2]">
                FREE DELIVERY ON ORDERS OVER ৳3000
              </span>
              <span className="mx-2 text-[#76a493] hidden sm:inline">|</span>
              <span className="text-[#c79a45] font-semibold hidden sm:inline">
                CODE: RONGINLAUNCH (15% OFF)
              </span>
              <span className="mx-2 text-[#76a493] hidden md:inline">|</span>
              <a
                href="https://wa.me/8801916664011"
                target="_blank"
                rel="noreferrer"
                className="hover:text-[#c79a45] transition-colors hidden md:inline font-bold"
              >
                WHATSAPP ORDER: 01916664011
              </a>
            </div>
          </div>
        </div>

        {/* Main Navigation Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between gap-4">
          {/* Left: Mobile hamburger & Logo */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open Navigation Menu"
              className="lg:hidden text-[#1b1c18] hover:text-[#073a2d] p-1.5 focus:outline-none"
            >
              <Menu className="w-6 h-6" />
            </button>
            <Logo className="h-9 sm:h-10 w-auto" />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 xl:gap-8 font-sans text-[13.5px] tracking-[0.12em] uppercase font-semibold text-[#404945]">
            <Link
              href="/shop"
              className="hover:text-[#073a2d] transition-colors py-2 relative group font-semibold"
            >
              <span>MEN</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#073a2d] transition-all group-hover:w-full" />
            </Link>
            <Link
              href="/shop?filter=new"
              className="hover:text-[#073a2d] transition-colors py-2 relative group font-semibold"
            >
              <span>NEW ARRIVALS</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#073a2d] transition-all group-hover:w-full" />
            </Link>
            <Link
              href="/shop"
              className="hover:text-[#073a2d] transition-colors py-2 relative group font-semibold"
            >
              <span>COLLECTIONS</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#073a2d] transition-all group-hover:w-full" />
            </Link>
            <Link
              href="/shop?filter=bestseller"
              className="hover:text-[#073a2d] transition-colors py-2 relative group font-semibold"
            >
              <span>BEST SELLERS</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#073a2d] transition-all group-hover:w-full" />
            </Link>
            <Link
              href="/shop?filter=offers"
              className="hover:text-[#073a2d] transition-colors py-2 relative group font-semibold text-[#c79a45]"
            >
              <span>OFFERS</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#c79a45] transition-all group-hover:w-full" />
            </Link>
            <div className="relative flex items-center font-semibold">
              <span className="text-[#404945]/60 cursor-not-allowed">WOMAN</span>
              <span className="ml-1.5 bg-[#eae8e1] text-[#073a2d] text-[9.5px] px-1.5 py-0.5 font-semibold uppercase tracking-wider rounded-xs">
                Soon
              </span>
            </div>
          </nav>

          {/* Right Action Icons: Wishlist & Cart to the left, Borderless Login button last */}
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Wishlist & Cart Container (no divider border) */}
            <div className="flex items-center gap-3 sm:gap-4">
              {/* 1. Wishlist Icon */}
              <Link
                href="/shop?wishlist=true"
                className="relative text-[#1b1c18] hover:text-[#073a2d] p-1.5 transition-colors group flex items-center justify-center"
                aria-label="Wishlist"
                title="Saved Wishlist"
              >
                <Heart className="w-5 h-5 text-[#1b1c18] group-hover:text-[#073a2d] transition-transform group-hover:scale-105" />
                <span className="absolute -top-1 -right-1.5 bg-[#073a2d] text-[#c79a45] text-[9.5px] font-sans font-bold min-w-4 h-4 px-1 rounded-full flex items-center justify-center shadow-xs">
                  {wishlist.length}
                </span>
              </Link>

              {/* 2. Shopping Cart Trigger */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative text-[#1b1c18] hover:text-[#073a2d] p-1.5 transition-colors cursor-pointer group flex items-center justify-center"
                aria-label="Shopping Cart"
                title="Shopping Cart"
              >
                <ShoppingCart className="w-5 h-5 text-[#1b1c18] group-hover:text-[#073a2d] transition-transform group-hover:scale-105" />
                <span className="absolute -top-1 -right-1.5 bg-[#073a2d] text-[#c79a45] text-[9.5px] font-sans font-bold min-w-4 h-4 px-1 rounded-full flex items-center justify-center shadow-xs">
                  {totalCount}
                </span>
              </button>
            </div>

            {/* 3. Luxury Login Button with radius and bigger icon */}
            <Link
              href={isLoggedIn ? "/profile" : "/login"}
              className="inline-flex items-center gap-2.5 px-4.5 sm:px-5 py-2.5 bg-[#073a2d] hover:bg-[#0c4e3b] text-[#fbf9f2] rounded-md border-0 transition-colors duration-300 group cursor-pointer"
              aria-label="Sign In / Patron Profile"
              title={isLoggedIn ? `Patron Sanctuary: ${user?.name}` : "Sign In to Patron Sanctuary"}
            >
              <div className="relative flex items-center justify-center">
                <User className="w-4.5 h-4.5 text-[#c79a45] transition-transform duration-300 group-hover:scale-110" />
                {isLoggedIn && (
                  <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-[#c79a45] animate-pulse" />
                )}
              </div>
              <span className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-[#fbf9f2] group-hover:text-white transition-colors">
                {isLoggedIn ? (user?.name?.split(' ')[0] || 'Patron') : 'Login'}
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Off-Canvas Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-4/5 max-w-sm bg-[#fbf9f2] border-r border-[#deddd3] p-6 flex flex-col justify-between z-10 shadow-2xl">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-[#deddd3]">
                <Logo className="h-9 w-auto" />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 text-[#717975] hover:text-[#1b1c18]"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <nav className="mt-8 flex flex-col space-y-4 font-serif text-lg font-bold text-[#073a2d]">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setIsCartOpen(true);
                  }}
                  className="flex items-center justify-between py-2 border-b border-[#f0eee7] text-left w-full cursor-pointer font-bold"
                >
                  <span className="flex items-center gap-2.5 font-sans text-sm font-bold uppercase tracking-wider">
                    <ShoppingCart className="w-4 h-4 text-[#073a2d]" />
                    <span>Shopping Cart</span>
                  </span>
                  <Badge variant="outline" className="text-xs bg-[#f5f4ed] text-[#073a2d] rounded-none font-bold">
                    {totalCount} items
                  </Badge>
                </button>
                <Link
                  href="/track-order"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between py-2 border-b border-[#f0eee7] text-sm text-[#073a2d] font-sans font-bold uppercase tracking-wider"
                >
                  <span className="flex items-center gap-2 font-bold">
                    <Truck className="w-4 h-4 text-[#c79a45]" />
                    <span>Track Consignment</span>
                  </span>
                  <Badge className="bg-[#073a2d] text-white text-[10px] font-bold">Active</Badge>
                </Link>
                <Link
                  href="/orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between py-2 border-b border-[#f0eee7] text-sm text-[#073a2d] font-sans font-bold uppercase tracking-wider"
                >
                  <span className="flex items-center gap-2 font-bold">
                    <Clock className="w-4 h-4 text-[#717975]" />
                    <span>Order History</span>
                  </span>
                  <ArrowRight className="w-4 h-4 text-[#c79a45]" />
                </Link>
                <Link
                  href={isLoggedIn ? "/profile" : "/login"}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between py-2 border-b border-[#f0eee7] text-sm text-[#073a2d] font-sans font-bold uppercase tracking-wider"
                >
                  <span className="flex items-center gap-2 font-bold">
                    <User className="w-4 h-4 text-[#717975]" />
                    <span>{isLoggedIn ? 'Patron Profile' : 'Sign In / Join Atelier'}</span>
                  </span>
                  <ArrowRight className="w-4 h-4 text-[#c79a45]" />
                </Link>
                <Link
                  href="/shop"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between py-2 border-b border-[#f0eee7] font-semibold"
                >
                  <span className="font-semibold">MEN</span>
                  <ArrowRight className="w-4 h-4 text-[#c79a45]" />
                </Link>
                <Link
                  href="/shop?filter=new"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between py-2 border-b border-[#f0eee7] font-semibold"
                >
                  <span className="font-semibold">NEW ARRIVALS</span>
                  <ArrowRight className="w-4 h-4 text-[#c79a45]" />
                </Link>
                <Link
                  href="/shop"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between py-2 border-b border-[#f0eee7] font-semibold"
                >
                  <span className="font-semibold">COLLECTIONS</span>
                  <ArrowRight className="w-4 h-4 text-[#c79a45]" />
                </Link>
                <Link
                  href="/shop?filter=bestseller"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between py-2 border-b border-[#f0eee7] font-semibold"
                >
                  <span className="font-semibold">BEST SELLERS</span>
                  <ArrowRight className="w-4 h-4 text-[#c79a45]" />
                </Link>
                <Link
                  href="/shop?filter=offers"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between py-2 border-b border-[#f0eee7] text-[#c79a45] font-semibold"
                >
                  <span className="font-semibold">OFFERS</span>
                  <ArrowRight className="w-4 h-4 text-[#c79a45]" />
                </Link>
                <div className="flex items-center justify-between py-2 border-b border-[#f0eee7] font-semibold">
                  <span className="text-[#404945]/60 font-semibold">WOMAN</span>
                  <span className="bg-[#eae8e1] text-[#073a2d] text-[10px] px-2 py-0.5 font-semibold uppercase tracking-wider rounded-xs">
                    Soon
                  </span>
                </div>
              </nav>
            </div>

            <div className="pt-6 border-t border-[#deddd3] space-y-3">
              <a
                href="https://wa.me/8801916664011"
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 bg-[#073a2d] text-[#fbf9f2] text-xs font-sans uppercase tracking-widest font-bold hover:bg-[#0d4d3b] transition-colors"
              >
                <PhoneCall className="w-4 h-4 text-[#c79a45]" />
                <span>WhatsApp Atelier (01916664011)</span>
              </a>
              <p className="text-[11px] text-center text-[#69726d] font-sans">
                Complimentary sizing advice & custom orders
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
