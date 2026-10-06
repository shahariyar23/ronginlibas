'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import { Logo } from './Logo';
import {
  Search,
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
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      <header className="sticky top-0 left-0 right-0 z-40 bg-[#fbf9f2]/95 backdrop-blur-md border-b border-[#deddd3]/80 shadow-[0_1px_8px_rgba(0,0,0,0.03)] transition-all">
        {/* Top Announcement Bar */}
        <div className="bg-[#073a2d] text-[#ffffff] py-1.5 px-4 text-center overflow-hidden">
          <div className="max-w-7xl mx-auto flex items-center justify-between font-sans text-[10.5px] tracking-[0.16em] uppercase">
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
                className="hover:text-[#c79a45] transition-colors hidden md:inline"
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
          <nav className="hidden lg:flex items-center gap-8 font-sans text-xs tracking-[0.15em] uppercase font-bold text-[#404945]">
            <Link
              href="/shop"
              className="hover:text-[#073a2d] transition-colors py-2 relative group"
            >
              <span>MEN</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#073a2d] transition-all group-hover:w-full" />
            </Link>
            <Link
              href="/shop?filter=new"
              className="hover:text-[#073a2d] transition-colors py-2 relative group"
            >
              <span>NEW ARRIVALS</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#073a2d] transition-all group-hover:w-full" />
            </Link>
            <Link
              href="/shop?category=panjabi"
              className="hover:text-[#073a2d] transition-colors py-2 relative group"
            >
              <span>PANJABI</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#073a2d] transition-all group-hover:w-full" />
            </Link>
            <Link
              href="/shop?category=shirts"
              className="hover:text-[#073a2d] transition-colors py-2 relative group"
            >
              <span>SHIRTS</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#073a2d] transition-all group-hover:w-full" />
            </Link>
            <Link
              href="/shop?category=polos"
              className="hover:text-[#073a2d] transition-colors py-2 relative group"
            >
              <span>POLOS</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#073a2d] transition-all group-hover:w-full" />
            </Link>
            <div className="relative flex items-center">
              <span className="text-[#404945]/60 cursor-not-allowed">WOMEN</span>
              <span className="ml-1.5 bg-[#eae8e1] text-[#073a2d] text-[9px] px-1.5 py-0.5 font-bold uppercase tracking-wider">
                Soon
              </span>
            </div>
          </nav>

          {/* Right Action Icons & Search */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Desktop Search Bar */}
            <form onSubmit={handleSearch} className="hidden md:flex items-center relative">
              <input
                type="text"
                placeholder="Search bespoke atelier..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 lg:w-60 bg-white text-[#1b1c18] font-sans text-xs pl-9 pr-4 py-2 border border-[#deddd3] focus:outline-none focus:border-[#073a2d] placeholder:text-[#717975] transition-all"
              />
              <Search className="w-4 h-4 text-[#717975] absolute left-3 pointer-events-none" />
            </form>

            {/* Mobile Search Button */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="md:hidden text-[#1b1c18] hover:text-[#073a2d] p-1.5"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Patron Sanctuary Profile / Sign In */}
            <Link
              href={isLoggedIn ? "/profile" : "/login"}
              className="relative text-[#1b1c18] hover:text-[#073a2d] p-1.5 transition-colors"
              aria-label="Patron Sanctuary"
              title={isLoggedIn ? `Patron: ${user?.name}` : "Sign In to Patron Sanctuary"}
            >
              <User className="w-5 h-5" />
              {isLoggedIn && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#c79a45] ring-1 ring-white" />
              )}
            </Link>

            {/* Wishlist Icon */}
            <Link
              href="/shop?wishlist=true"
              className="relative text-[#1b1c18] hover:text-[#073a2d] p-1.5 transition-colors"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <Badge
                  variant="default"
                  className="absolute -top-1.5 -right-1.5 bg-[#073a2d] text-white text-[10px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center font-bold p-0 border-0"
                >
                  {wishlist.length}
                </Badge>
              )}
            </Link>

            {/* Shopping Cart Trigger using shadcn Button & Badge */}
            <Button
              variant="ghost"
              onClick={() => setIsCartOpen(true)}
              className="relative text-[#1b1c18] hover:text-[#073a2d] hover:bg-[#073a2d]/5 p-2 h-auto rounded-none transition-colors flex items-center gap-2 group cursor-pointer"
              aria-label="Shopping Cart"
            >
              <div className="relative flex items-center">
                <ShoppingCart className="size-5 text-[#073a2d] transition-transform group-hover:scale-110" />
                {totalCount > 0 && (
                  <Badge
                    variant="default"
                    className="absolute -top-2 -right-2 bg-[#073a2d] text-white text-[10px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center font-bold p-0 border-0"
                  >
                    {totalCount}
                  </Badge>
                )}
              </div>
              <span className="font-sans text-xs uppercase tracking-wider font-semibold text-[#073a2d]">
                Cart {totalCount > 0 && `(${totalCount})`}
              </span>
            </Button>
          </div>
        </div>

        {/* Mobile Search Overlay */}
        {searchOpen && (
          <div className="md:hidden p-3 bg-white border-t border-[#deddd3]">
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                autoFocus
                placeholder="Search panjabis, polos, shirts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-[#fbf9f2] text-xs px-3 py-2 border border-[#deddd3] focus:outline-none focus:border-[#073a2d]"
              />
              <Button type="submit" size="sm" className="bg-[#073a2d] text-xs px-4">
                Search
              </Button>
            </form>
          </div>
        )}
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

              <nav className="mt-8 flex flex-col space-y-4 font-serif text-lg text-[#073a2d]">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setIsCartOpen(true);
                  }}
                  className="flex items-center justify-between py-2 border-b border-[#f0eee7] text-left w-full cursor-pointer"
                >
                  <span className="flex items-center gap-2.5 font-sans text-sm font-semibold uppercase tracking-wider">
                    <ShoppingCart className="w-4 h-4 text-[#073a2d]" />
                    <span>Shopping Cart</span>
                  </span>
                  <Badge variant="outline" className="text-xs bg-[#f5f4ed] text-[#073a2d] rounded-none">
                    {totalCount} items
                  </Badge>
                </button>
                <Link
                  href="/track-order"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between py-2 border-b border-[#f0eee7] text-sm text-[#073a2d] font-sans font-semibold uppercase tracking-wider"
                >
                  <span className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-[#c79a45]" />
                    <span>Track Consignment</span>
                  </span>
                  <Badge className="bg-[#073a2d] text-white text-[10px]">Active</Badge>
                </Link>
                <Link
                  href="/orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between py-2 border-b border-[#f0eee7] text-sm text-[#073a2d] font-sans font-semibold uppercase tracking-wider"
                >
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#717975]" />
                    <span>Order History</span>
                  </span>
                  <ArrowRight className="w-4 h-4 text-[#c79a45]" />
                </Link>
                <Link
                  href={isLoggedIn ? "/profile" : "/login"}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between py-2 border-b border-[#f0eee7] text-sm text-[#073a2d] font-sans font-semibold uppercase tracking-wider"
                >
                  <span className="flex items-center gap-2">
                    <User className="w-4 h-4 text-[#717975]" />
                    <span>{isLoggedIn ? 'Patron Profile' : 'Sign In / Join Atelier'}</span>
                  </span>
                  <ArrowRight className="w-4 h-4 text-[#c79a45]" />
                </Link>
                <Link
                  href="/shop"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between py-2 border-b border-[#f0eee7]"
                >
                  <span>All Men's Collection</span>
                  <ArrowRight className="w-4 h-4 text-[#c79a45]" />
                </Link>
                <Link
                  href="/shop?category=panjabi"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between py-2 border-b border-[#f0eee7]"
                >
                  <span>Panjabi & Silk Weaves</span>
                  <ArrowRight className="w-4 h-4 text-[#c79a45]" />
                </Link>
                <Link
                  href="/shop?category=shirts"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between py-2 border-b border-[#f0eee7]"
                >
                  <span>Tailored Shirts</span>
                  <ArrowRight className="w-4 h-4 text-[#c79a45]" />
                </Link>
                <Link
                  href="/shop?category=polos"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between py-2 border-b border-[#f0eee7]"
                >
                  <span>Mercerized Polos</span>
                  <ArrowRight className="w-4 h-4 text-[#c79a45]" />
                </Link>
                <Link
                  href="/shop?category=trousers"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between py-2 border-b border-[#f0eee7]"
                >
                  <span>Gurkha & Chino Trousers</span>
                  <ArrowRight className="w-4 h-4 text-[#c79a45]" />
                </Link>
                <Link
                  href="/shop?filter=new"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between py-2 border-b border-[#f0eee7] text-[#c79a45]"
                >
                  <span>Fresh Off The Loom (New)</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </nav>
            </div>

            <div className="pt-6 border-t border-[#deddd3] space-y-3">
              <a
                href="https://wa.me/8801916664011"
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 bg-[#073a2d] text-[#fbf9f2] text-xs font-sans uppercase tracking-widest font-semibold hover:bg-[#0d4d3b] transition-colors"
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
