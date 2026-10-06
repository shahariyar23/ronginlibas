'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { ProductCard } from '@/components/shop/ProductCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0] || 'M');
  const [selectedColor, setSelectedColor] = useState<string>(product.colors[0]?.name || 'Standard');
  const [quantity, setQuantity] = useState(1);
  const [customNotes, setCustomNotes] = useState('');
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

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Product link copied to clipboard');
    }
  };

  return (
    <div className="w-full pt-36 sm:pt-40 pb-24 bg-[#fbf9f2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[11px] font-sans uppercase tracking-widest text-[#717975] mb-8">
          <Link href="/" className="hover:text-[#073a2d]">
            Home
          </Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-[#073a2d]">
            Men
          </Link>
          <span>/</span>
          <Link href={`/shop?category=${product.category}`} className="hover:text-[#073a2d]">
            {product.categoryLabel}
          </Link>
          <span>/</span>
          <span className="text-[#073a2d] font-semibold truncate max-w-xs">{product.name}</span>
        </nav>

        {/* Main 2-Column Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Left: Gallery & Zoom (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Main Interactive Zoom Canvas */}
            <div
              className="relative aspect-[3/4] w-full overflow-hidden bg-[#f5f4ed] border border-[#deddd3] cursor-crosshair group shadow-xs"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <img
                src={product.images[activeImageIndex] || product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-300"
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

              {/* Top Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10 pointer-events-none">
                {product.badge && (
                  <span className="bg-[#073a2d] text-[#fbf9f2] font-sans text-[10px] font-bold px-3 py-1 uppercase tracking-widest border border-[#c79a45]/40 shadow-sm">
                    {product.badge}
                  </span>
                )}
                {product.fabricOrigin && (
                  <span className="bg-white/90 text-[#073a2d] font-sans text-[10px] font-semibold px-2.5 py-0.5 uppercase tracking-wider backdrop-blur-xs border border-[#deddd3]">
                    {product.fabricOrigin}
                  </span>
                )}
              </div>

              {/* Magnifier tooltip cue */}
              <div className="absolute bottom-4 right-4 bg-black/60 text-white font-sans text-[10px] px-2.5 py-1 tracking-wider uppercase pointer-events-none group-hover:opacity-0 transition-opacity">
                Hover to Magnify Weave
              </div>
            </div>

            {/* Thumbnails Rail */}
            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImageIndex(i)}
                    className={`relative w-20 h-26 flex-shrink-0 bg-[#f5f4ed] border overflow-hidden transition-all ${
                      activeImageIndex === i
                        ? 'border-[#073a2d] ring-2 ring-[#073a2d] ring-offset-1'
                        : 'border-[#deddd3] opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`View ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Atelier Configuration & Purchase (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <span className="font-sans text-xs uppercase tracking-[0.25em] text-[#c79a45] font-semibold block mb-1">
                {product.categoryLabel}
              </span>
              <h1 className="font-serif text-2xl sm:text-4xl font-normal text-[#073a2d]">
                {product.name}
              </h1>

              {/* Price & Currency */}
              <div className="flex items-baseline gap-3 mt-3">
                <span className="font-sans font-bold text-2xl text-[#073a2d] tabular-nums">
                  ৳{product.price.toLocaleString()}
                </span>
                {product.originalPrice && (
                  <span className="font-sans text-base text-[#717975] line-through tabular-nums">
                    ৳{product.originalPrice.toLocaleString()}
                  </span>
                )}
                <span className="text-[11px] font-sans text-[#69726d]">
                  (Inclusive of all crafting taxes)
                </span>
              </div>
            </div>

            <p className="font-sans text-xs sm:text-sm text-[#404945] leading-relaxed font-light">
              {product.description}
            </p>

            <div className="w-full h-px bg-[#deddd3]" />

            {/* Color Selector */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <div className="flex items-center justify-between text-xs font-sans mb-2">
                  <span className="uppercase tracking-wider font-semibold text-[#1b1c18]">
                    Colorway: <strong className="text-[#073a2d]">{selectedColor}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  {product.colors.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => setSelectedColor(c.name)}
                      title={c.name}
                      className={`w-7 h-7 rounded-full border transition-all ${
                        selectedColor === c.name
                          ? 'ring-2 ring-[#073a2d] ring-offset-2 border-white'
                          : 'border-black/20 hover:scale-105'
                      }`}
                      style={{ backgroundColor: c.hex }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size Selector with Measurement Matrix Modal */}
            <div>
              <div className="flex items-center justify-between text-xs font-sans mb-2">
                <span className="uppercase tracking-wider font-semibold text-[#1b1c18]">
                  Select Sizing
                </span>

                {/* Sizing Matrix Dialog */}
                <Dialog>
                  <DialogTrigger
                    render={
                      <button className="flex items-center gap-1 text-[#073a2d] hover:text-[#c79a45] underline text-xs font-medium cursor-pointer">
                        <Ruler className="w-3.5 h-3.5" />
                        <span>Size Guide & Dimensions</span>
                      </button>
                    }
                  />
                  <DialogContent className="max-w-lg bg-[#fbf9f2] border border-[#deddd3] p-6">
                    <DialogHeader>
                      <DialogTitle className="font-serif text-xl text-[#073a2d]">
                        Sartorial Sizing Matrix (Inches / CM)
                      </DialogTitle>
                    </DialogHeader>
                    <div className="mt-4 overflow-x-auto text-xs font-sans">
                      <table className="w-full border-collapse border border-[#deddd3] bg-white text-center">
                        <thead className="bg-[#f0eee7] text-[#073a2d]">
                          <tr>
                            <th className="p-2 border border-[#deddd3]">Size</th>
                            <th className="p-2 border border-[#deddd3]">Chest (in)</th>
                            <th className="p-2 border border-[#deddd3]">Length (in)</th>
                            <th className="p-2 border border-[#deddd3]">Shoulder (in)</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="p-2 border border-[#deddd3] font-bold">S</td>
                            <td className="p-2 border border-[#deddd3]">38</td>
                            <td className="p-2 border border-[#deddd3]">40</td>
                            <td className="p-2 border border-[#deddd3]">17.5</td>
                          </tr>
                          <tr>
                            <td className="p-2 border border-[#deddd3] font-bold">M</td>
                            <td className="p-2 border border-[#deddd3]">40</td>
                            <td className="p-2 border border-[#deddd3]">42</td>
                            <td className="p-2 border border-[#deddd3]">18</td>
                          </tr>
                          <tr>
                            <td className="p-2 border border-[#deddd3] font-bold">L</td>
                            <td className="p-2 border border-[#deddd3]">42</td>
                            <td className="p-2 border border-[#deddd3]">44</td>
                            <td className="p-2 border border-[#deddd3]">18.5</td>
                          </tr>
                          <tr>
                            <td className="p-2 border border-[#deddd3] font-bold">XL</td>
                            <td className="p-2 border border-[#deddd3]">44</td>
                            <td className="p-2 border border-[#deddd3]">45</td>
                            <td className="p-2 border border-[#deddd3]">19.5</td>
                          </tr>
                          <tr>
                            <td className="p-2 border border-[#deddd3] font-bold">XXL</td>
                            <td className="p-2 border border-[#deddd3]">46</td>
                            <td className="p-2 border border-[#deddd3]">46</td>
                            <td className="p-2 border border-[#deddd3]">20.5</td>
                          </tr>
                        </tbody>
                      </table>
                      <p className="mt-3 text-[11px] text-[#69726d]">
                        * For custom sleeve length, chest adjustments, or bespoke sizing, please chat with our master cutter via WhatsApp.
                      </p>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Size Buttons */}
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`py-2.5 font-sans font-semibold text-xs border transition-all ${
                      selectedSize === s
                        ? 'bg-[#073a2d] text-white border-[#073a2d]'
                        : 'bg-white border-[#deddd3] text-[#1b1c18] hover:border-[#073a2d]'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity and Actions */}
            <div className="space-y-3 pt-2">
              <div className="flex gap-3">
                {/* Quantity */}
                <div className="flex items-center border border-[#deddd3] bg-white h-13 px-2">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-7 h-7 flex items-center justify-center text-[#1b1c18] hover:bg-[#f0eee7]"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-9 text-center font-sans font-bold text-sm tabular-nums">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-7 h-7 flex items-center justify-center text-[#1b1c18] hover:bg-[#f0eee7]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Add to Cart */}
                <Button
                  onClick={handleAddToCart}
                  className="flex-1 h-13 bg-[#073a2d] hover:bg-[#0d4d3b] text-[#fbf9f2] font-sans uppercase tracking-[0.16em] text-xs font-bold shadow-md flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Add To Cart</span>
                </Button>

                {/* Wishlist */}
                <button
                  onClick={() => toggleWishlist(product.id, product.name)}
                  aria-label="Wishlist"
                  className="w-13 h-13 border border-[#deddd3] bg-white flex items-center justify-center text-[#1b1c18] hover:border-[#073a2d] transition-colors"
                >
                  <Heart
                    className={`w-5 h-5 ${
                      isFavorite ? 'fill-[#ba1a1a] text-[#ba1a1a]' : 'text-[#1b1c18]'
                    }`}
                  />
                </button>
              </div>

              {/* Bespoke Tailoring Custom Notes */}
              <div>
                <input
                  type="text"
                  placeholder="Optional custom tailoring note (e.g. +1 inch sleeve)"
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  className="w-full h-10 px-3 bg-white border border-[#deddd3] text-xs font-sans placeholder:text-[#717975] focus:outline-none focus:border-[#073a2d]"
                />
              </div>
            </div>

            {/* Value Guarantees Strip */}
            <div className="p-4 bg-white border border-[#deddd3] space-y-2 text-xs font-sans text-[#404945]">
              <div className="flex items-center gap-2.5">
                <Truck className="w-4 h-4 text-[#073a2d]" />
                <span>Complimentary Delivery on orders over ৳3,000</span>
              </div>
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#073a2d]" />
                <span>Open-Box Parcel Inspection Before Payment</span>
              </div>
              <div className="flex items-center gap-2.5">
                <RotateCcw className="w-4 h-4 text-[#073a2d]" />
                <span>7-Day Doorstep Exchange Policy Across Bangladesh</span>
              </div>
            </div>

            {/* Technical Craftsmanship Accordion / Tabs */}
            <div className="pt-2">
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="w-full grid grid-cols-3 bg-[#f0eee7] rounded-none p-1">
                  <TabsTrigger value="details" className="text-xs font-sans uppercase rounded-none">
                    Fabric & Fit
                  </TabsTrigger>
                  <TabsTrigger value="care" className="text-xs font-sans uppercase rounded-none">
                    Artisan Care
                  </TabsTrigger>
                  <TabsTrigger value="concierge" className="text-xs font-sans uppercase rounded-none">
                    Bespoke
                  </TabsTrigger>
                </TabsList>
                <div className="p-4 bg-white border border-t-0 border-[#deddd3] text-xs font-sans text-[#404945] space-y-2">
                  <TabsContent value="details" className="space-y-2 mt-0">
                    <p>
                      <strong>Fabric:</strong> {product.fabric}
                    </p>
                    <p>
                      <strong>Origin:</strong> {product.fabricOrigin || 'Bespoke Bengal Atelier'}
                    </p>
                    <p>
                      <strong>Tailoring Cut:</strong> {product.fit}
                    </p>
                  </TabsContent>
                  <TabsContent value="care" className="space-y-1.5 mt-0">
                    {product.careGuide.map((c, i) => (
                      <p key={i} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#073a2d]" />
                        <span>{c}</span>
                      </p>
                    ))}
                  </TabsContent>
                  <TabsContent value="concierge" className="space-y-2 mt-0">
                    <p>
                      Need specific measurement tweaks or corporate event bulk orders?
                    </p>
                    <a
                      href={`https://wa.me/8801916664011?text=Hello%20Rongin%20Libas,%20I%20am%20inquiring%20about%20the%20${encodeURIComponent(product.name)}.`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-[#073a2d] hover:text-[#c79a45] font-semibold"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>WhatsApp Atelier Master</span>
                    </a>
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </div>
        </div>

        {/* Bottom Ensemble Rail ("Complete the Look") */}
        {relatedProducts.length > 0 && (
          <div className="mt-24 pt-16 border-t border-[#deddd3]">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
              <div>
                <span className="font-sans text-xs uppercase tracking-[0.25em] text-[#c79a45] font-semibold block mb-1">
                  CURATED ENSEMBLE
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-normal text-[#073a2d]">
                  Complete The Look
                </h3>
              </div>
              <Link
                href="/shop"
                className="text-xs font-sans uppercase tracking-widest text-[#073a2d] hover:underline font-semibold"
              >
                View Full Wardrobe →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
