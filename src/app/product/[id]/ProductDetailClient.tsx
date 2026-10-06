'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { ProductCard } from '@/components/shop/ProductCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Heart,
  ShoppingCart,
  Ruler,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  PhoneCall,
  Plus,
  Minus,
  Check,
  Share2,
  Star,
  ChevronDown,
  ChevronUp,
  Package,
  Layers,
  Camera,
  CheckCircle2,
  ExternalLink,
  Crown,
  Scissors,
  ArrowRight,
} from 'lucide-react';
import { toast } from 'sonner';

interface ProductDetailClientProps {
  product: Product;
  relatedProducts: Product[];
}

export const ProductDetailClient: React.FC<ProductDetailClientProps> = ({
  product,
  relatedProducts,
}) => {
  const router = useRouter();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0] || 'L');
  const [selectedColor, setSelectedColor] = useState<string>(product.colors[0]?.name || 'Forest Emerald (Signature)');
  const [quantity, setQuantity] = useState(1);
  const [customNotes, setCustomNotes] = useState('');
  const [measurementUnit, setMeasurementUnit] = useState<'in' | 'cm'>('in');
  const [sizeModalOpen, setSizeModalOpen] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>('accordion-1');
  const [reviewFilter, setReviewFilter] = useState<'all' | 'photos' | '5stars'>('all');

  const [zoomStyle, setZoomStyle] = useState<{ backgroundPosition: string; display: string }>({
    backgroundPosition: '0% 0%',
    display: 'none',
  });

  const isFavorite = isInWishlist(product.id);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      backgroundPosition: `${x}% ${y}%`,
      display: 'block',
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle((prev) => ({ ...prev, display: 'none' }));
  };

  const handleAddToCart = () => {
    addToCart(product, selectedSize, selectedColor, quantity, customNotes);
  };

  const handleBuyNow = () => {
    addToCart(product, selectedSize, selectedColor, quantity, customNotes);
    router.push('/checkout');
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Product link copied to clipboard');
    }
  };

  const toggleAccordionItem = (id: string) => {
    setOpenAccordion((prev) => (prev === id ? null : id));
  };

  // Add ensemble items to cart
  const handleAddEnsembleItem = (name: string, price: number, image: string, cat: string) => {
    const ensembleProduct: Product = {
      id: `ens_${Date.now()}`,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      category: 'accessories',
      categoryLabel: cat,
      price,
      images: [image],
      description: `Artisanal companion piece for ${product.name}.`,
      fabric: 'Handcrafted Heritage Material',
      fit: 'Regular',
      careGuide: ['Dry clean only'],
      sizes: ['Standard'],
      colors: [{ name: 'Classic', hex: '#c79a45' }],
      inStock: true,
      stockCount: 15,
    };
    addToCart(ensembleProduct, 'Standard', 'Classic', 1);
  };

  const handleAddFullEnsemble = () => {
    // Add primary item + 3 companions with bundle discount
    addToCart(product, selectedSize, selectedColor, quantity);
    handleAddEnsembleItem(
      'Handcrafted Peshawari Leather Sandals',
      2450,
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDFUnAfZAWiZvTkzuqO6GCK5YrV0cw_mIn79Rr3nRT2ZhO524O2bZLCL7iQLI5D3tEj5OB3FyJfhhwE3DU_M4kjVL5XAfCMLwkzXxSrc4qkWN-tD6oPer44AGtYgfUN8BcF1L_NYhDlnjPw4HfsrEGeVmK7MChIMtINXJp61LdiKpnt8_1FVY2U69piP4ODYqaA4R4dFIZoHg0yOZrWwmOAwouPrRpwgshGnh2A38j1Ts1ikisE4u0gfQ',
      'Footwear'
    );
    handleAddEnsembleItem(
      'Tailored Aligarh Churidar / Pajama',
      1250,
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCO5z6B1H0tbDdLO-JNCDG3tCUDVjWtqNKbKW5RKN3sMO2atiz4I8KvNnonsHLbV0vZoVKdiBMsiysU-lZh9hzVku8RuOZy3h3CCr82PqT0_m4x2AUQ1S4ifL35A0RNEI7ek5xQUS-TmTZLOBbGBz-7O0fGRUQqARVIyK7Hu9-CCSDbxxOfiEBKIDGX7iH28nYAlUaojesqHoHvz8Cxb6d34oRJb1WR_qQ78G7blORRzlQtCfgQdx3AGg',
      'Bottomwear'
    );
    handleAddEnsembleItem(
      'Mother-of-Pearl Gilded Cufflinks',
      1250,
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCznR_c0O7wQgo-S9rOcBTP8jy-Ih_Ji8ybbFfT66oCZDuT0DT_3FHS6LuV0PS1T4i7wE0afp41XMGj-bkleNRIXEJ8x0a1mbIFk4mSvcHLIXoWgsBhwmBm-_Y8lZHVR7skEIpJnpTe-bGoG8d2ej05Rqu1Ij_fBMTTTYVtL62rBzbYJwNwqHlovQhHiN9uG0DQywlVphtdOnXaA_t0exEmyMwED6H1Tfdw2iYanW2I5MojnCBjbQ-uZA',
      'Accessories'
    );
    toast.success('Complete 4-Piece Ensemble added to Cart', {
      description: '10% Bundle Privilege applied to your order.',
    });
  };

  return (
    <div className="w-full pt-36 sm:pt-40 pb-24 bg-[#fbf9f2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Subtle Breadcrumb & Artisan Reference Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-sans uppercase tracking-wider text-[#717975] pb-2 border-b border-[#deddd3]/60">
          <nav className="flex items-center gap-2">
            <Link href="/" className="hover:text-[#073a2d] transition-colors">
              Home
            </Link>
            <span className="text-[#deddd3]">/</span>
            <Link href="/shop" className="hover:text-[#073a2d] transition-colors">
              Men
            </Link>
            <span className="text-[#deddd3]">/</span>
            <Link href={`/shop?category=${product.category}`} className="hover:text-[#073a2d] transition-colors">
              {product.categoryLabel}
            </Link>
            <span className="text-[#deddd3]">/</span>
            <span className="text-[#073a2d] font-semibold truncate max-w-xs">{product.name}</span>
          </nav>

          <div className="hidden sm:flex items-center gap-2 bg-[#f0eee7] px-3 py-1 text-[#073a2d] font-sans text-[11px] font-semibold border border-[#deddd3]">
            <Crown className="w-3.5 h-3.5 text-[#c79a45]" />
            <span>Atelier Ref: RL-PANJ-098 • Handloom 1445 Collection</span>
          </div>
        </div>

        {/* Main 2-Column Product Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* LEFT COLUMN: Visual Gallery & Vertical Thumbs (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4">
            {/* Vertical Thumbnail Strip */}
            <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-visible shrink-0 pb-2 md:pb-0">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative w-20 h-28 bg-[#f5f4ed] overflow-hidden border transition-all cursor-pointer ${
                    activeImageIndex === idx
                      ? 'border-[#073a2d] ring-1 ring-[#073a2d] opacity-100 shadow-xs'
                      : 'border-[#deddd3] opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`${product.name} - view ${idx + 1}`} className="w-full h-full object-cover object-top" />
                </button>
              ))}
            </div>

            {/* Main Interactive Zoom Canvas */}
            <div className="relative flex-1 bg-[#f5f4ed] border border-[#deddd3] overflow-hidden group shadow-xs min-h-[500px] md:min-h-[640px]">
              {/* Floating Badges */}
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                <span className="bg-[#073a2d] text-white font-sans text-[10px] uppercase px-3 py-1.5 tracking-widest font-bold shadow-sm">
                  {product.badge || 'Bespoke Handloom'}
                </span>
                <span className="bg-white/95 text-[#073a2d] border border-[#deddd3] font-sans text-[10px] uppercase px-2.5 py-1 tracking-wider shadow-sm font-bold">
                  Best Seller • 1445
                </span>
              </div>

              {/* Wishlist & Share Action Floating */}
              <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                <button
                  onClick={() => toggleWishlist(product.id, product.name)}
                  aria-label="Wishlist"
                  className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md text-[#1b1c18] hover:text-[#ba1a1a] flex items-center justify-center shadow-md transition-transform active:scale-95 cursor-pointer"
                >
                  <Heart className={`w-5 h-5 ${isFavorite ? 'fill-[#ba1a1a] text-[#ba1a1a]' : ''}`} />
                </button>
                <button
                  onClick={handleShare}
                  aria-label="Share"
                  className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md text-[#1b1c18] hover:text-[#073a2d] flex items-center justify-center shadow-md transition-transform active:scale-95 cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>

              {/* Main Image with Zoom */}
              <div
                className="w-full h-full overflow-hidden cursor-crosshair flex items-center justify-center"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              >
                <img
                  src={product.images[activeImageIndex] || product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                />

                {/* Magnifier lens result */}
                <div
                  className="absolute inset-0 pointer-events-none transition-opacity duration-150"
                  style={{
                    ...zoomStyle,
                    backgroundImage: `url(${product.images[activeImageIndex] || product.images[0]})`,
                    backgroundSize: '250%',
                    backgroundRepeat: 'no-repeat',
                  }}
                />
              </div>

              {/* Bottom Visual Tag */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 text-[#404945] font-sans text-[10px] tracking-widest uppercase flex items-center gap-1.5 shadow-xs border border-[#deddd3]">
                  <Sparkles className="w-3.5 h-3.5 text-[#c79a45]" />
                  <span>Inspect Raw Slub Weave</span>
                </div>
                <div className="bg-[#073a2d]/90 text-white px-3 py-1.5 font-sans text-[10px] tracking-widest uppercase font-semibold">
                  {product.fabric || '180 GSM Subtropical Silk'}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Specifications & Purchase (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Header & Heritage Tag */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-sans text-[11px] uppercase tracking-widest text-[#c79a45] font-bold">
                  Rongin Libas Atelier • Dhaka
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#073a2d]" />
                <span className="font-sans text-[11px] uppercase tracking-wider text-[#073a2d] font-semibold">
                  In Stock
                </span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl text-[#073a2d] font-normal leading-tight">
                {product.name}
              </h1>

              {/* Patron Rating Row */}
              <div className="flex items-center gap-3 pt-1">
                <div className="flex text-[#c79a45]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#c79a45] text-[#c79a45]" />
                  ))}
                </div>
                <span className="font-sans text-xs font-bold text-[#1b1c18]">4.9 / 5.0</span>
                <span className="text-[#deddd3]">•</span>
                <a
                  href="#patron-reviews"
                  className="font-sans text-xs uppercase tracking-wider text-[#717975] hover:text-[#073a2d] underline underline-offset-4 font-semibold"
                >
                  128 Dhaka &amp; Chittagong Patrons
                </a>
              </div>
            </div>

            {/* Pricing Card Panel */}
            <div className="bg-[#f5f4ed] p-5 border border-[#deddd3] space-y-2">
              <div className="flex items-baseline gap-3">
                <span className="font-serif text-3xl font-bold text-[#073a2d]">
                  ৳ {product.price.toLocaleString()}
                </span>
                {product.originalPrice && (
                  <span className="font-sans text-sm text-[#717975] line-through">
                    ৳ {product.originalPrice.toLocaleString()}
                  </span>
                )}
                {product.originalPrice && (
                  <Badge className="bg-[#c79a45] text-[#073a2d] font-sans text-[10px] font-bold uppercase px-2 py-0.5 rounded-none">
                    Launch Privilege (Save ৳ {(product.originalPrice - product.price).toLocaleString()})
                  </Badge>
                )}
              </div>
              <p className="font-sans text-xs text-[#69726d] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#073a2d]" />
                <span>Inclusive of all Dhaka VAT &amp; regional handloom luxury duties.</span>
              </p>
            </div>

            {/* Color Hue Selection */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <label className="font-sans text-xs uppercase tracking-wider text-[#1b1c18] font-bold">
                  Color Hue:{' '}
                  <span className="font-normal text-[#69726d]">{selectedColor}</span>
                </label>
                <span className="font-sans text-[10px] uppercase text-[#c79a45] font-semibold tracking-wider">
                  Heritage Dye
                </span>
              </div>
              <div className="flex items-center gap-3">
                {product.colors.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setSelectedColor(c.name)}
                    title={c.name}
                    className={`w-9 h-9 rounded-full transition-transform cursor-pointer border ${
                      selectedColor === c.name
                        ? 'ring-2 ring-[#073a2d] ring-offset-2 scale-110'
                        : 'hover:scale-105 border-[#deddd3]'
                    }`}
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>
            </div>

            {/* Size Selection & Sizing Matrix Trigger */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="font-sans text-xs uppercase tracking-wider text-[#1b1c18] font-bold">
                  Select Size:{' '}
                  <span className="font-semibold text-[#073a2d]">{selectedSize}</span>
                </label>
                <button
                  type="button"
                  onClick={() => setSizeModalOpen(true)}
                  className="flex items-center gap-1 font-sans text-xs text-[#073a2d] hover:text-[#c79a45] underline underline-offset-4 cursor-pointer font-semibold"
                >
                  <Ruler className="w-3.5 h-3.5 text-[#c79a45]" />
                  <span>Measurement Matrix</span>
                </button>
              </div>

              {/* Dual-Pill Size Options */}
              <div className="grid grid-cols-5 gap-2">
                {[
                  { label: 'S', code: '38' },
                  { label: 'M', code: '40' },
                  { label: 'L', code: '42' },
                  { label: 'XL', code: '44' },
                  { label: 'XXL', code: '46' },
                ].map((s) => (
                  <button
                    key={s.label}
                    type="button"
                    onClick={() => setSelectedSize(s.label)}
                    className={`h-12 border flex flex-col items-center justify-center transition-colors cursor-pointer ${
                      selectedSize === s.label
                        ? 'bg-[#073a2d] text-white border-[#073a2d] shadow-xs'
                        : 'bg-[#f5f4ed] hover:bg-[#eae8e1] text-[#1b1c18] border-[#deddd3]'
                    }`}
                  >
                    <span className="font-sans text-xs font-bold">{s.label}</span>
                    <span className={`text-[10px] ${selectedSize === s.label ? 'text-[#c79a45]' : 'text-[#717975]'}`}>
                      {s.code}
                    </span>
                  </button>
                ))}
              </div>

              {/* Stock Urgency Note */}
              <div className="flex items-center justify-between text-xs font-sans">
                <span className="text-[#c79a45] font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#c79a45] animate-pulse" />
                  <span>Only 3 pieces left in Size {selectedSize} (Dhaka Atelier)</span>
                </span>
                <span className="text-[#717975] text-[11px]">Regular Tailored Fit</span>
              </div>
            </div>

            {/* Custom Tailoring Notes (Optional) */}
            <div className="space-y-1.5 pt-1">
              <label className="font-sans text-[11px] uppercase tracking-wider text-[#404945] flex items-center justify-between">
                <span>Bespoke Tailoring Instructions</span>
                <span className="text-[#717975] lowercase">(optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. +1 inch sleeve length, high mandarin collar"
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                className="w-full bg-[#fbf9f2] border border-[#deddd3] px-3.5 py-2.5 text-xs text-[#1b1c18] focus:outline-none focus:border-[#073a2d]"
              />
            </div>

            {/* Quantity & CTAs */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                {/* Quantity Counter */}
                <div className="flex items-center bg-[#f0eee7] border border-[#deddd3] h-13 px-3 w-32 justify-between">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-7 h-7 flex items-center justify-center text-[#1b1c18] hover:bg-[#deddd3] transition-colors cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-serif text-base font-bold text-[#073a2d]">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-7 h-7 flex items-center justify-center text-[#1b1c18] hover:bg-[#deddd3] transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Primary Add to Cart */}
                <Button
                  onClick={handleAddToCart}
                  className="flex-1 h-13 bg-[#073a2d] hover:bg-[#0d4d3b] text-white font-sans uppercase tracking-[0.16em] text-xs font-bold shadow-md flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <ShoppingCart className="w-4 h-4 text-[#c79a45]" />
                  <span>Add To Cart</span>
                </Button>
              </div>

              {/* Buy It Now (Cash on Delivery) */}
              <Button
                variant="outline"
                onClick={handleBuyNow}
                className="w-full h-12 bg-white hover:bg-[#f5f4ed] text-[#073a2d] border-[#073a2d] font-sans text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <Truck className="w-4 h-4 text-[#073a2d]" />
                <span>Buy It Now (Cash on Delivery)</span>
              </Button>

              {/* WhatsApp Concierge Stylist CTA */}
              <a
                href={`https://wa.me/8801916664011?text=Salam,%20I%20am%20interested%20in%20${encodeURIComponent(product.name)}%20(SKU:%20RL-PANJ-098).`}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-[#0d4d3b] hover:bg-[#073a2d] text-[#fbf9f2] p-3.5 border border-[#0d4d3b] flex items-center justify-between transition-colors shadow-xs group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#1b6b54] flex items-center justify-center text-[#c79a45]">
                    <PhoneCall className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="font-sans text-xs uppercase tracking-wider font-bold text-white">
                      Order Via WhatsApp Stylist
                    </p>
                    <p className="font-sans text-[11px] text-[#76a493]">
                      01916664011 • Fast Dhaka sizing &amp; instant reservation
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#c79a45] group-hover:translate-x-1 transition-transform" />
              </a>
            </div>

            {/* Trust Assurances */}
            <div className="bg-[#f5f4ed] p-4 border border-[#deddd3] space-y-3">
              <div className="flex items-start gap-3">
                <Truck className="w-5 h-5 text-[#073a2d] shrink-0 mt-0.5" />
                <div>
                  <p className="font-sans text-xs uppercase tracking-wider text-[#1b1c18] font-bold">
                    Complimentary Nationwide Transit
                  </p>
                  <p className="font-sans text-[11px] text-[#69726d]">
                    Inside Dhaka within 48 Hours | All 64 Districts within 3-5 days via Steadfast Express.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-[#073a2d] shrink-0 mt-0.5" />
                <div>
                  <p className="font-sans text-xs uppercase tracking-wider text-[#1b1c18] font-bold">
                    Open-Box Inspection Privilege
                  </p>
                  <p className="font-sans text-[11px] text-[#69726d]">
                    Examine silk weave, collar embroidery &amp; fit before tendering Cash on Delivery to rider.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <RotateCcw className="w-5 h-5 text-[#073a2d] shrink-0 mt-0.5" />
                <div>
                  <p className="font-sans text-xs uppercase tracking-wider text-[#1b1c18] font-bold">
                    7-Day Doorstep Size Exchange
                  </p>
                  <p className="font-sans text-[11px] text-[#69726d]">
                    Effortless exchange pickup right from your residence or Dhaka atelier salon.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Complete The Look / Bespoke Sartorial Ensemble Rail */}
        <section className="w-full bg-[#f5f4ed] p-6 sm:p-10 border border-[#deddd3] space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="font-sans text-xs uppercase tracking-widest text-[#c79a45] font-bold">
                Curated Ensemble
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl text-[#073a2d] font-normal tracking-tight mt-1">
                Complete The Aristocratic Look
              </h2>
            </div>
            <p className="font-sans text-xs text-[#69726d] max-w-md">
              Harmonized by Dhaka atelier stylists for wedding banquets, Eid celebrations, and dignified evening gatherings.
            </p>
          </div>

          {/* 3 Companion Cards Bento */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Companion 1: Peshawari Sandals */}
            <div className="bg-white p-4 border border-[#deddd3] flex flex-col justify-between group shadow-xs">
              <div>
                <div className="relative w-full h-56 bg-[#f5f4ed] overflow-hidden mb-3 border border-[#deddd3]">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDFUnAfZAWiZvTkzuqO6GCK5YrV0cw_mIn79Rr3nRT2ZhO524O2bZLCL7iQLI5D3tEj5OB3FyJfhhwE3DU_M4kjVL5XAfCMLwkzXxSrc4qkWN-tD6oPer44AGtYgfUN8BcF1L_NYhDlnjPw4HfsrEGeVmK7MChIMtINXJp61LdiKpnt8_1FVY2U69piP4ODYqaA4R4dFIZoHg0yOZrWwmOAwouPrRpwgshGnh2A38j1Ts1ikisE4u0gfQ"
                    alt="Handcrafted Peshawari Leather Sandals"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-2 left-2 bg-white/95 px-2 py-0.5 font-sans text-[9px] uppercase font-bold border border-[#deddd3]">
                    Full Grain Cowhide
                  </span>
                </div>
                <h3 className="font-serif text-base text-[#073a2d] font-semibold">
                  Handcrafted Peshawari Leather Sandals
                </h3>
                <p className="font-sans text-xs text-[#69726d] mt-1">
                  Deep mahogany, hand-stitched welt sole for South Asian walking comfort.
                </p>
              </div>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#f0eee7]">
                <span className="font-serif text-base font-bold text-[#073a2d]">৳ 2,450</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleAddEnsembleItem(
                      'Handcrafted Peshawari Leather Sandals',
                      2450,
                      'https://lh3.googleusercontent.com/aida-public/AB6AXuDFUnAfZAWiZvTkzuqO6GCK5YrV0cw_mIn79Rr3nRT2ZhO524O2bZLCL7iQLI5D3tEj5OB3FyJfhhwE3DU_M4kjVL5XAfCMLwkzXxSrc4qkWN-tD6oPer44AGtYgfUN8BcF1L_NYhDlnjPw4HfsrEGeVmK7MChIMtINXJp61LdiKpnt8_1FVY2U69piP4ODYqaA4R4dFIZoHg0yOZrWwmOAwouPrRpwgshGnh2A38j1Ts1ikisE4u0gfQ',
                      'Footwear'
                    )
                  }
                  className="font-sans text-[11px] uppercase tracking-wider border-[#deddd3] hover:bg-[#073a2d] hover:text-white cursor-pointer"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  <span>Add To Ensemble</span>
                </Button>
              </div>
            </div>

            {/* Companion 2: Churidar Pajama */}
            <div className="bg-white p-4 border border-[#deddd3] flex flex-col justify-between group shadow-xs">
              <div>
                <div className="relative w-full h-56 bg-[#f5f4ed] overflow-hidden mb-3 border border-[#deddd3]">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCO5z6B1H0tbDdLO-JNCDG3tCUDVjWtqNKbKW5RKN3sMO2atiz4I8KvNnonsHLbV0vZoVKdiBMsiysU-lZh9hzVku8RuOZy3h3CCr82PqT0_m4x2AUQ1S4ifL35A0RNEI7ek5xQUS-TmTZLOBbGBz-7O0fGRUQqARVIyK7Hu9-CCSDbxxOfiEBKIDGX7iH28nYAlUaojesqHoHvz8Cxb6d34oRJb1WR_qQ78G7blORRzlQtCfgQdx3AGg"
                    alt="Tailored Aligarh Churidar / Pajama"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-2 left-2 bg-white/95 px-2 py-0.5 font-sans text-[9px] uppercase font-bold border border-[#deddd3]">
                    100% Egyptian Cotton
                  </span>
                </div>
                <h3 className="font-serif text-base text-[#073a2d] font-semibold">
                  Tailored Aligarh Churidar / Pajama
                </h3>
                <p className="font-sans text-xs text-[#69726d] mt-1">
                  Refined taper leg in warm off-white, designed specifically for long Panjabis.
                </p>
              </div>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#f0eee7]">
                <span className="font-serif text-base font-bold text-[#073a2d]">৳ 1,250</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleAddEnsembleItem(
                      'Tailored Aligarh Churidar / Pajama',
                      1250,
                      'https://lh3.googleusercontent.com/aida-public/AB6AXuCO5z6B1H0tbDdLO-JNCDG3tCUDVjWtqNKbKW5RKN3sMO2atiz4I8KvNnonsHLbV0vZoVKdiBMsiysU-lZh9hzVku8RuOZy3h3CCr82PqT0_m4x2AUQ1S4ifL35A0RNEI7ek5xQUS-TmTZLOBbGBz-7O0fGRUQqARVIyK7Hu9-CCSDbxxOfiEBKIDGX7iH28nYAlUaojesqHoHvz8Cxb6d34oRJb1WR_qQ78G7blORRzlQtCfgQdx3AGg',
                      'Bottomwear'
                    )
                  }
                  className="font-sans text-[11px] uppercase tracking-wider border-[#deddd3] hover:bg-[#073a2d] hover:text-white cursor-pointer"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  <span>Add To Ensemble</span>
                </Button>
              </div>
            </div>

            {/* Companion 3: Gilded Cufflinks */}
            <div className="bg-white p-4 border border-[#deddd3] flex flex-col justify-between group shadow-xs">
              <div>
                <div className="relative w-full h-56 bg-[#f5f4ed] overflow-hidden mb-3 border border-[#deddd3]">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCznR_c0O7wQgo-S9rOcBTP8jy-Ih_Ji8ybbFfT66oCZDuT0DT_3FHS6LuV0PS1T4i7wE0afp41XMGj-bkleNRIXEJ8x0a1mbIFk4mSvcHLIXoWgsBhwmBm-_Y8lZHVR7skEIpJnpTe-bGoG8d2ej05Rqu1Ij_fBMTTTYVtL62rBzbYJwNwqHlovQhHiN9uG0DQywlVphtdOnXaA_t0exEmyMwED6H1Tfdw2iYanW2I5MojnCBjbQ-uZA"
                    alt="Mother-of-Pearl Gilded Cufflinks"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-2 left-2 bg-white/95 px-2 py-0.5 font-sans text-[9px] uppercase font-bold border border-[#deddd3]">
                    24k Gilded Brass
                  </span>
                </div>
                <h3 className="font-serif text-base text-[#073a2d] font-semibold">
                  Mother-of-Pearl Gilded Cufflinks
                </h3>
                <p className="font-sans text-xs text-[#69726d] mt-1">
                  Natural iridescent shell with antique warm gold bezels for french-cuff panjabis.
                </p>
              </div>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#f0eee7]">
                <span className="font-serif text-base font-bold text-[#073a2d]">৳ 1,250</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleAddEnsembleItem(
                      'Mother-of-Pearl Gilded Cufflinks',
                      1250,
                      'https://lh3.googleusercontent.com/aida-public/AB6AXuCznR_c0O7wQgo-S9rOcBTP8jy-Ih_Ji8ybbFfT66oCZDuT0DT_3FHS6LuV0PS1T4i7wE0afp41XMGj-bkleNRIXEJ8x0a1mbIFk4mSvcHLIXoWgsBhwmBm-_Y8lZHVR7skEIpJnpTe-bGoG8d2ej05Rqu1Ij_fBMTTTYVtL62rBzbYJwNwqHlovQhHiN9uG0DQywlVphtdOnXaA_t0exEmyMwED6H1Tfdw2iYanW2I5MojnCBjbQ-uZA',
                      'Accessories'
                    )
                  }
                  className="font-sans text-[11px] uppercase tracking-wider border-[#deddd3] hover:bg-[#073a2d] hover:text-white cursor-pointer"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  <span>Add To Ensemble</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Bundle Total Bar */}
          <div className="bg-[#073a2d] text-white p-6 border-l-4 border-[#c79a45] flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#c79a45] text-[#073a2d] flex items-center justify-center shrink-0">
                <Crown className="w-6 h-6" />
              </div>
              <div>
                <p className="font-serif text-lg text-white font-semibold">
                  Purchase Complete 4-Piece Ensemble
                </p>
                <p className="font-sans text-xs text-[#76a493]">
                  Panjabi + Peshawari Leather Sandals + Churidar Pajama + Gilded Cufflinks
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="font-serif text-xl font-bold text-white">
                  ৳ 7,920 <span className="font-sans text-xs text-[#76a493] line-through font-normal">৳ 8,800</span>
                </p>
                <p className="font-sans text-[10px] text-[#c79a45] uppercase tracking-wider font-semibold">
                  Instant 10% Bundle Privilege
                </p>
              </div>
              <Button
                onClick={handleAddFullEnsemble}
                className="bg-[#c79a45] hover:bg-[#d6a953] text-[#073a2d] font-sans text-xs uppercase tracking-wider font-bold px-6 h-12 shadow-sm cursor-pointer whitespace-nowrap"
              >
                Add All 4 Pieces
              </Button>
            </div>
          </div>
        </section>

        {/* Editorial Specifications & Artisan Accordions */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 py-6">
          {/* Left Narrative Column */}
          <div className="lg:col-span-4 space-y-4">
            <span className="font-sans text-xs uppercase tracking-widest text-[#c79a45] font-bold">
              Atelier Craft
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-[#073a2d] font-normal leading-tight">
              The Anatomy of Bengal Sartorial Dignity
            </h2>
            <p className="font-sans text-xs text-[#69726d] leading-relaxed">
              Each Rongin Libas Panjabi takes over forty-six hours of specialized handloom tensioning, individual panel washing in sub-tropical alkaline river waters, and final needlework executed by generational master karigars in Mirpur and Narayanganj.
            </p>

            <div className="p-5 bg-[#f5f4ed] border border-[#deddd3] space-y-2">
              <p className="font-sans text-xs uppercase tracking-wider font-bold text-[#073a2d]">
                Sartorial Master Note:
              </p>
              <p className="font-serif text-xs italic text-[#404945] leading-relaxed">
                &ldquo;We chose a blended Mulberry silk and combed Egyptian cotton warp because pure silk suffocates in monsoon heat, while pure cotton lacks the regal luminescence required for nocturnal festivity.&rdquo;
              </p>
              <p className="font-sans text-[10px] text-[#c79a45] uppercase tracking-widest font-semibold pt-1">
                — Ustad Kabirul, Chief Cutter
              </p>
            </div>
          </div>

          {/* Right Accordions Column */}
          <div className="lg:col-span-8 space-y-3">
            {[
              {
                id: 'accordion-1',
                title: 'Sartorial Details, Cut & Silhouette',
                icon: Scissors,
                content: (
                  <ul className="list-disc list-inside space-y-1.5 text-xs font-sans text-[#404945]">
                    <li>Hand-loomed Egyptian combed cotton blended with Rajshahi Mulberry silk for breathability and shine.</li>
                    <li>Stiffened architectural mandarin band collar engineered not to wilt under Dhaka humidity.</li>
                    <li>Hand-stitched concealed button placket adorned with bespoke oyster mother-of-pearl shank buttons.</li>
                    <li>Deep side-slit hem with bar-tack reinforcement to withstand dynamic sitting posture during formal banquets.</li>
                    <li>Ergonomic double-needle armhole sleeve construction providing complete ease when driving or gesturing.</li>
                  </ul>
                ),
              },
              {
                id: 'accordion-2',
                title: 'Fabric & Material Heritage (180 GSM)',
                icon: Layers,
                content: (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs font-sans">
                    <div className="p-3 bg-[#f5f4ed] border border-[#deddd3]">
                      <span className="text-[10px] uppercase text-[#717975] block">Composition</span>
                      <span className="font-bold text-[#073a2d]">65% Rajshahi Silk • 35% Combed Cotton</span>
                    </div>
                    <div className="p-3 bg-[#f5f4ed] border border-[#deddd3]">
                      <span className="text-[10px] uppercase text-[#717975] block">Fabric Weight</span>
                      <span className="font-bold text-[#073a2d]">180 GSM Subtropical All-Weather Weave</span>
                    </div>
                    <div className="p-3 bg-[#f5f4ed] border border-[#deddd3]">
                      <span className="text-[10px] uppercase text-[#717975] block">Weave Pattern</span>
                      <span className="font-bold text-[#073a2d]">Subtle Slub Plain Handloom Texture</span>
                    </div>
                    <div className="p-3 bg-[#f5f4ed] border border-[#deddd3]">
                      <span className="text-[10px] uppercase text-[#717975] block">Dye Standard</span>
                      <span className="font-bold text-[#073a2d]">Azo-Free Low-Impact Forest Emerald</span>
                    </div>
                  </div>
                ),
              },
              {
                id: 'accordion-3',
                title: 'Size, Posture & Model Proportions',
                icon: Ruler,
                content: (
                  <div className="space-y-2 text-xs font-sans text-[#404945]">
                    <p>
                      Our model stands at <strong>6&apos;1&quot; (185 cm)</strong> with a 40&quot; chest and wears <strong>Size L (42)</strong> for a relaxed, dignified drape.
                    </p>
                    <p>
                      If your chest measures 40-41 inches, we recommend Size L (42) so the fabric gracefully clears your chest and shoulder blade curvature without pulling at the placket buttons.
                    </p>
                  </div>
                ),
              },
              {
                id: 'accordion-4',
                title: 'Care & Garment Longevity',
                icon: Sparkles,
                content: (
                  <ul className="list-disc list-inside space-y-1 text-xs font-sans text-[#404945]">
                    <li>First 2 cleans: Professional eco dry clean recommended to protect natural handloom silk luster.</li>
                    <li>Subsequent care: Gentle cold hand wash using pH-neutral silk detergent; do not wring or tumble dry.</li>
                    <li>Pressing: Warm iron on reverse side under a damp cotton pressing cloth.</li>
                    <li>Storage: Hang on broad cedarwood hanger inside complimentary breathable Rongin Libas cotton dust bag.</li>
                  </ul>
                ),
              },
              {
                id: 'accordion-5',
                title: 'Doorstep Transit, COD & 7-Day Returns',
                icon: Truck,
                content: (
                  <p className="text-xs font-sans text-[#404945]">
                    We operate daily express logistics covering Gulshan, Banani, Dhanmondi, Uttara, Mirpur, and all major Dhaka sectors via our dedicated courier fleet. Cash on Delivery is gladly accepted across Bangladesh with open-box verification.
                  </p>
                ),
              },
            ].map((acc) => {
              const Icon = acc.icon;
              const isOpen = openAccordion === acc.id;
              return (
                <div key={acc.id} className="bg-white border border-[#deddd3] overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleAccordionItem(acc.id)}
                    className="w-full p-4 flex items-center justify-between text-left hover:bg-[#fbf9f2] transition-colors cursor-pointer"
                  >
                    <span className="font-serif text-base text-[#073a2d] flex items-center gap-3">
                      <Icon className="w-4 h-4 text-[#c79a45]" />
                      <span>{acc.title}</span>
                    </span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-[#073a2d]" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[#717975]" />
                    )}
                  </button>
                  {isOpen && <div className="px-5 pb-5 pt-1 border-t border-[#f0eee7]">{acc.content}</div>}
                </div>
              );
            })}
          </div>
        </section>

        {/* Interactive Measurement Matrix Section / Sizing Table */}
        <section className="bg-white p-6 sm:p-10 border border-[#deddd3] shadow-xs space-y-6" id="size-guide-section">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="font-sans text-xs uppercase tracking-widest text-[#c79a45] font-bold">
                Precision Fitting Guide
              </span>
              <h2 className="font-serif text-2xl text-[#073a2d] font-normal">
                Bengali Sartorial Measurement Matrix
              </h2>
            </div>
            <div className="flex items-center gap-1 bg-[#f5f4ed] p-1 border border-[#deddd3]">
              <button
                type="button"
                onClick={() => setMeasurementUnit('in')}
                className={`px-3 py-1 font-sans text-xs uppercase font-bold transition-colors cursor-pointer ${
                  measurementUnit === 'in' ? 'bg-[#073a2d] text-white' : 'text-[#717975] hover:text-[#073a2d]'
                }`}
              >
                Inches (in)
              </button>
              <button
                type="button"
                onClick={() => setMeasurementUnit('cm')}
                className={`px-3 py-1 font-sans text-xs uppercase font-bold transition-colors cursor-pointer ${
                  measurementUnit === 'cm' ? 'bg-[#073a2d] text-white' : 'text-[#717975] hover:text-[#073a2d]'
                }`}
              >
                Centimeters (cm)
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-xs">
              <thead>
                <tr className="bg-[#f5f4ed] text-[#073a2d] uppercase tracking-wider font-bold border-b border-[#deddd3]">
                  <th className="p-3">Size Designation</th>
                  <th className="p-3">Chest Circumference</th>
                  <th className="p-3">Garment Length</th>
                  <th className="p-3">Shoulder Span</th>
                  <th className="p-3">Sleeve Length</th>
                  <th className="p-3">Collar Fit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0eee7]">
                {[
                  { size: 'S', code: '38', chest: 38, len: 40.5, sh: 17.5, slv: 24.5, col: 15.0 },
                  { size: 'M', code: '40', chest: 40, len: 41.5, sh: 18.0, slv: 25.0, col: 15.5 },
                  { size: 'L', code: '42', chest: 42, len: 42.5, sh: 18.5, slv: 25.5, col: 16.0 },
                  { size: 'XL', code: '44', chest: 44, len: 43.5, sh: 19.0, slv: 26.0, col: 16.5 },
                  { size: 'XXL', code: '46', chest: 46, len: 44.5, sh: 19.5, slv: 26.5, col: 17.0 },
                ].map((row) => {
                  const isSelected = selectedSize === row.size;
                  const formatVal = (val: number) =>
                    measurementUnit === 'in' ? `${val.toFixed(1)}"` : `${Math.round(val * 2.54)} cm`;
                  return (
                    <tr
                      key={row.size}
                      className={`transition-colors ${
                        isSelected ? 'bg-[#f5f4ed] font-bold text-[#073a2d]' : 'hover:bg-[#fbf9f2]'
                      }`}
                    >
                      <td className="p-3 font-serif">
                        <span className="font-bold">{row.size} ({row.code})</span>
                        {isSelected && (
                          <span className="ml-2 text-[9px] bg-[#073a2d] text-white px-1.5 py-0.5 uppercase tracking-wider font-sans">
                            Selected
                          </span>
                        )}
                      </td>
                      <td className="p-3">{formatVal(row.chest)}</td>
                      <td className="p-3">{formatVal(row.len)}</td>
                      <td className="p-3">{formatVal(row.sh)}</td>
                      <td className="p-3">{formatVal(row.slv)}</td>
                      <td className="p-3">{formatVal(row.col)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="font-sans text-[11px] text-[#717975]">
            *Measurements are taken flat across garments. For tailored customization, contact our master cutter via WhatsApp at 01916664011.
          </p>
        </section>

        {/* Patron Reviews & Testimonials Section */}
        <section className="space-y-8 py-6" id="patron-reviews">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="font-sans text-xs uppercase tracking-widest text-[#c79a45] font-bold">
                Patron Reviews &amp; Testimonials
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl text-[#073a2d] font-normal tracking-tight mt-1">
                Voices of Discerning Patrons
              </h2>
              <p className="font-sans text-xs text-[#69726d] mt-1">
                Authentic accounts from gentleman patrons across Dhaka, Chittagong, Sylhet, and abroad.
              </p>
            </div>

            <Button
              onClick={() => toast.info('Patron Review Portal', { description: 'Please complete your purchase to submit verified review feedback.' })}
              className="bg-[#073a2d] hover:bg-[#0d4d3b] text-white font-sans text-xs uppercase tracking-wider px-5 h-11 cursor-pointer"
            >
              Write a Patron Review
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Rating Summary Card (4 Cols) */}
            <div className="lg:col-span-4 bg-white p-6 border border-[#deddd3] flex flex-col justify-between space-y-6">
              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="font-serif text-5xl font-bold text-[#073a2d] leading-none">4.9</span>
                  <span className="font-sans text-sm text-[#717975]">/ 5.0</span>
                </div>
                <div className="flex text-[#c79a45]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-[#c79a45] text-[#c79a45]" />
                  ))}
                </div>
                <p className="font-sans text-xs uppercase tracking-wider text-[#404945] font-semibold">
                  Based on 128 Verified Atelier Purchases
                </p>
              </div>

              {/* Progress Breakdown Bars */}
              <div className="space-y-2 font-sans text-xs">
                {[
                  { star: '5 Stars', pct: 92 },
                  { star: '4 Stars', pct: 6 },
                  { star: '3 Stars', pct: 2 },
                  { star: '2 Stars', pct: 0 },
                  { star: '1 Star', pct: 0 },
                ].map((b) => (
                  <div key={b.star} className="flex items-center gap-2">
                    <span className="w-14 text-[11px] text-[#404945] font-medium">{b.star}</span>
                    <div className="flex-1 h-2 bg-[#f0eee7] overflow-hidden">
                      <div className="bg-[#073a2d] h-full" style={{ width: `${b.pct}%` }} />
                    </div>
                    <span className="w-8 text-[11px] text-right text-[#717975]">{b.pct}%</span>
                  </div>
                ))}
              </div>

              {/* Verified Metrics Strip */}
              <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-[#f0eee7]">
                <div className="p-2 bg-[#f5f4ed]">
                  <span className="text-[9px] uppercase tracking-wider text-[#717975] block">Fit Accuracy</span>
                  <span className="font-serif text-sm font-bold text-[#073a2d]">98%</span>
                  <span className="text-[9px] text-[#0d4d3b] font-semibold block">True to Size</span>
                </div>
                <div className="p-2 bg-[#f5f4ed]">
                  <span className="text-[9px] uppercase tracking-wider text-[#717975] block">Silk Feel</span>
                  <span className="font-serif text-sm font-bold text-[#073a2d]">4.9/5</span>
                  <span className="text-[9px] text-[#0d4d3b] font-semibold block">Exceptional</span>
                </div>
                <div className="p-2 bg-[#f5f4ed]">
                  <span className="text-[9px] uppercase tracking-wider text-[#717975] block">Luster</span>
                  <span className="font-serif text-sm font-bold text-[#073a2d]">5.0/5</span>
                  <span className="text-[9px] text-[#0d4d3b] font-semibold block">Deep Dye</span>
                </div>
              </div>
            </div>

            {/* Patron Styling Moments Gallery Strip (8 Cols) */}
            <div className="lg:col-span-8 bg-white p-6 border border-[#deddd3] flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-[#073a2d]" />
                    <h3 className="font-sans text-xs uppercase tracking-wider font-bold text-[#073a2d]">
                      Patron Styling Moments (42 Photos)
                    </h3>
                  </div>
                  <span className="font-sans text-[11px] text-[#717975]">From Weddings &amp; Soirées</span>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {[
                    { loc: 'Tanzim • Gulshan', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAbKFoOOtlagDwzcYDnxXvniQzbARJlxOUwkcgwN5zO5GpwwhIJPiwjSKxJjBebcu9cpNG1UWQ5Da1-Ml_87fMVpXLw9dEquhak16BWycGPLsI1-CdQUkRRP4k_CDKCQubSfx41r1uJAuyBOcY4HQ9x9dum1AQKVjcJXQjeWY1iGkAuHAWuFcMVmXVuMsxgQGVTAs-KT5THFHpnZMBId6uGKCpMzFRdtXtTWY372sGMRnPObWwzPhRhGw' },
                    { loc: 'Naveed • Uttara', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDpIcJ1uOP3vXlD0eBns7MEr3wKvay-T3Hl7KdyOSctbTkaZvSQJDETRcfNiW8vI-8rfhBXYf7rYpJad1Uj05u-iUp0JGtgg9wxQQrfvBx3GeYKfrK45anqbGNkU-2wdOB0mMSulv1i98hVKWzGybd1ODtHW9xZhLWFWapanm5gZChTTbDuT8TddWbvtZtBGJZzxPxIzmOHAzjiEKRs_4v_D3rkCe_B8YeGq_4BCwq9dwxx24D2D1ZLcw' },
                    { loc: 'Shahriar • Dhanmondi', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBY8XNraEr1Hko-MxgmyvtaxaBBviIQZYP8hnug2k-NN3hqoipkCAmkgpyUM2LJiepJwQfBwlE93_YGWgmwqrKPnLfRAH5NAzTU3ahUbgCQtnZ9sn3OHu-9QUQPoXn6BvnAb6U_NyquLfEY7EG8Tqql6oRxI2ar5QUZIo5twS2R6Zyloey_y8KXTUPh9LM67BafjPHWoEvxuTau_niCQn1xbsAnx2cK_jBtkn4GFpQUMA8234tIzt2xuQ' },
                    { loc: 'Farhan • Ctg', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC4fn_0RPLHrG9yo80Lwz8_QosE1hoiGhVojbaYvy90SIhx_jZTqJGmmMOE0nbAxdaDJu-JZ1t0tqTuGTlnTRo6bImBYfxf_8zvNW5ST5oRaIjZ1VyKmQyOQvLknclIyIDy-LB_F4a0PkljUusXZc3TgzF-s4QBwANmQ9_QwSpEhgGMOz8844rHA1wp-Z0ZO_URmgzfD8ch7TvtN51FkyD65blvAjblZ0zQPHEoSM-a4wyBB4ZphB7WBQ' },
                    { loc: 'Kamran • Sylhet', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDrFIUNW-kICUXsP00Lg6wK288ausqdHqee4zWZ7ZWBR56CwGxvORAUwMcyFCRKHxgO2jg050XXyTvsIe2DTQcS93VfwOL4gQnhux8_IxpSXk8AJDpe9kLT4VM9rUQ_uqbHghQcfOIDztTCZmc20XN_s8m9m53sQtNv9m2i4LX83Y0WxtFrkwIsjdWDZ2CyEyoPiJbV8RjSlHH17hOsbB4gfB6DHUmgavRf1xVpaunIBnMYRlan9zQLvA' },
                    { loc: '+36 More', img: '' },
                  ].map((p, idx) => (
                    <div key={idx} className="relative aspect-[3/4] bg-[#f5f4ed] overflow-hidden border border-[#deddd3] group">
                      {p.img ? (
                        <>
                          <img src={p.img} alt={p.loc} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                          <div className="absolute bottom-0 inset-x-0 bg-[#073a2d]/90 text-white text-[8px] font-sans uppercase px-1 py-0.5 text-center truncate">
                            {p.loc}
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center bg-[#f0eee7]">
                          <Camera className="w-4 h-4 text-[#073a2d] mb-1" />
                          <span className="font-sans text-[10px] font-bold text-[#073a2d]">+36 More</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-[#f5f4ed] border border-[#deddd3] flex items-center justify-between text-xs font-sans text-[#404945]">
                <span className="flex items-center gap-1.5 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#073a2d]" />
                  <span>All photos submitted directly by patrons after open-box home delivery verification.</span>
                </span>
                <span className="text-[#073a2d] font-bold uppercase text-[10px] tracking-wider">
                  Verified Gallery
                </span>
              </div>
            </div>
          </div>

          {/* Individual Reviews Feed */}
          <div className="space-y-4">
            {/* Review 1 */}
            <div className="bg-white p-6 border border-[#deddd3] shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#073a2d] text-white flex items-center justify-center font-bold text-xs font-sans">
                    TA
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-sans text-sm uppercase tracking-wider font-bold text-[#1b1c18]">
                        Tanzim Ahmed
                      </h4>
                      <Badge className="bg-[#b0ecd3]/40 text-[#073a2d] text-[9px] px-1.5 py-0 font-bold uppercase border-0 rounded-none">
                        Verified Patron
                      </Badge>
                    </div>
                    <p className="font-sans text-[11px] text-[#717975]">
                      Gulshan-2, Dhaka • Attended Walima at Gulshan Club
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[#c79a45]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-[#c79a45] text-[#c79a45]" />
                  ))}
                  <span className="font-sans text-[11px] text-[#717975] ml-1">October 18, 2026</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-1 font-sans text-[10px] uppercase">
                <span className="bg-[#f5f4ed] px-2 py-0.5 border border-[#deddd3]">Size: L (42)</span>
                <span className="bg-[#f5f4ed] px-2 py-0.5 border border-[#deddd3]">Height: 5ft 11in</span>
                <span className="bg-[#f5f4ed] px-2 py-0.5 border border-[#deddd3] text-[#073a2d] font-bold">
                  Fit: Perfect Dignified Drape
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="font-serif text-base text-[#073a2d] font-semibold">
                  &ldquo;Breathable Silk with Impeccable Fall Under Chandelier Lighting&rdquo;
                </h3>
                <p className="font-sans text-xs text-[#404945] leading-relaxed">
                  Wore this for an evening walima at Gulshan Club. The signature emerald green color under ambient ballroom lighting looks far richer and more refined than off-the-rack designer brands. Size 42 cleared my shoulders comfortably without pulling at the concealed chest placket. The open-box verification rider arrived in Gulshan promptly within 24 hours.
                </p>
              </div>

              {/* Atelier Official Response */}
              <div className="p-3 bg-[#f5f4ed] border border-[#deddd3] space-y-1 mt-2">
                <div className="flex items-center gap-2">
                  <span className="font-sans text-[10px] uppercase font-bold text-[#073a2d]">
                    Rongin Libas Atelier Response:
                  </span>
                  <span className="text-[10px] text-[#717975]">October 19, 2026</span>
                </div>
                <p className="font-serif text-xs italic text-[#404945]">
                  &ldquo;Thank you Tanzim. Ustad Kabirul and our Narayanganj handloom team specifically tensioned this warp so the Mulberry silk reflects warm light while allowing monsoon humidity circulation. We are honored to be part of your walima gathering.&rdquo;
                </p>
              </div>
            </div>

            {/* Review 2 */}
            <div className="bg-white p-6 border border-[#deddd3] shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#0d4d3b] text-white flex items-center justify-center font-bold text-xs font-sans">
                    NR
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-sans text-sm uppercase tracking-wider font-bold text-[#1b1c18]">
                        Naveed Rahman
                      </h4>
                      <Badge className="bg-[#b0ecd3]/40 text-[#073a2d] text-[9px] px-1.5 py-0 font-bold uppercase border-0 rounded-none">
                        Verified Patron
                      </Badge>
                    </div>
                    <p className="font-sans text-[11px] text-[#717975]">
                      Sector 4, Uttara, Dhaka • Open-Box Delivery Checked
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[#c79a45]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-[#c79a45] text-[#c79a45]" />
                  ))}
                  <span className="font-sans text-[11px] text-[#717975] ml-1">October 11, 2026</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-1 font-sans text-[10px] uppercase">
                <span className="bg-[#f5f4ed] px-2 py-0.5 border border-[#deddd3]">Size: M (40)</span>
                <span className="bg-[#f5f4ed] px-2 py-0.5 border border-[#deddd3]">Height: 5ft 9in</span>
                <span className="bg-[#f5f4ed] px-2 py-0.5 border border-[#deddd3] text-[#073a2d] font-bold">
                  Fit: Crisp Architectural Collar
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="font-serif text-base text-[#073a2d] font-semibold">
                  &ldquo;Collar Holds Architectural Firmness Under High Humidity&rdquo;
                </h3>
                <p className="font-sans text-xs text-[#404945] leading-relaxed">
                  Most panjabi collars fold limp after two hours under humid Dhaka conditions. The fused craftsmanship in this mandarin band collar is exceptional. The delivery agent arrived at our residence in Uttara with full open-box inspection privilege, allowing me to check the silk thread density and mother-of-pearl buttons before paying cash.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* You May Also Admire Section */}
        {relatedProducts.length > 0 && (
          <section className="space-y-6 pt-6 border-t border-[#deddd3]">
            <div className="flex items-end justify-between">
              <div>
                <span className="font-sans text-xs uppercase tracking-widest text-[#c79a45] font-bold">
                  Complementary Wardrobe
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl text-[#073a2d] font-normal tracking-tight mt-1">
                  You May Also Admire
                </h2>
              </div>
              <Link
                href="/shop"
                className="font-sans text-xs uppercase tracking-wider text-[#073a2d] hover:text-[#c79a45] font-bold underline underline-offset-4"
              >
                View Atelier Catalogue &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.slice(0, 4).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Sizing Matrix Dialog Modal */}
      <Dialog open={sizeModalOpen} onOpenChange={setSizeModalOpen}>
        <DialogContent className="max-w-2xl bg-white p-6 sm:p-8 border border-[#deddd3] shadow-2xl">
          <DialogHeader className="pb-4 border-b border-[#deddd3]">
            <div className="flex items-center gap-2 text-[#c79a45] font-sans text-xs uppercase tracking-widest font-bold">
              <Ruler className="w-4 h-4" />
              <span>Bespoke Fit Master</span>
            </div>
            <DialogTitle className="font-serif text-2xl text-[#073a2d] font-normal mt-1">
              How to Measure Your Perfect Panjabi
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 font-sans text-xs text-[#404945] py-2">
            <p><strong>1. Chest:</strong> Wrap the tape measure smoothly around the fullest part of your chest, keeping tape horizontal under your armpits.</p>
            <p><strong>2. Collar:</strong> Measure around the base of your neck where the band collar sits, inserting one index finger for breathing comfort.</p>
            <p><strong>3. Length:</strong> Measure from the highest point of your shoulder seam down to just below the knee (standard 41&quot;-44&quot;).</p>
            <p><strong>4. Sleeve:</strong> From shoulder seam down to the base of your thumb knuckle.</p>
          </div>

          <div className="p-4 bg-[#f5f4ed] border border-[#deddd3] flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4">
            <div>
              <p className="font-sans text-xs uppercase font-bold text-[#073a2d]">Need Bespoke Customization?</p>
              <p className="font-sans text-[11px] text-[#69726d]">We tailor custom chest, armhole and length alterations at no extra charge.</p>
            </div>
            <a
              href="https://wa.me/8801916664011"
              target="_blank"
              rel="noreferrer"
              className="bg-[#073a2d] hover:bg-[#0d4d3b] text-white font-sans text-xs uppercase tracking-wider px-4 py-2 font-bold whitespace-nowrap inline-flex items-center justify-center shadow-xs"
            >
              Talk to Master Cutter
            </a>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
