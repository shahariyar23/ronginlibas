'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import { ProductCard } from '@/components/shop/ProductCard';
import {
  getProduct,
  getRelatedProducts,
  getProductReviews,
  checkReviewEligibility,
  submitProductReview,
  voteReviewHelpful,
  ProductReview,
  ProductReviewsResponse,
  ReviewEligibilityResponse,
} from '@/lib/api';
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
  Share2,
  Star,
  ChevronDown,
  ChevronUp,
  Layers,
  Crown,
  Scissors,
  ArrowRight,
  Loader2,
  MessageSquare,
} from 'lucide-react';
import { toast } from 'sonner';
import { getWhatsAppUrl, useStorefront } from '@/context/StorefrontContext';

function getMeasurementEntries(
  variant: NonNullable<Product['variants']>[number] | undefined,
  displayUnit: 'in' | 'cm',
): Array<{ label: string; value: string }> {
  if (!variant?.measurements) return [];
  const sourceUnit = variant.measurements.unit === 'CM' ? 'cm' : 'in';
  return Object.entries(variant.measurements)
    .filter((entry): entry is [string, number] => entry[0] !== 'unit' && typeof entry[1] === 'number')
    .map(([key, rawValue]) => {
      const converted =
        sourceUnit === displayUnit
          ? rawValue
          : displayUnit === 'cm'
            ? rawValue * 2.54
            : rawValue / 2.54;
      return {
        label: key.replace(/([A-Z])/g, ' $1').replace(/^./, (letter) => letter.toUpperCase()),
        value: displayUnit === 'in' ? `${converted.toFixed(1)}"` : `${converted.toFixed(1)} cm`,
      };
    });
}

interface ProductDetailClientProps {
  product?: Product;
  relatedProducts?: Product[];
  initialReviews?: ProductReviewsResponse;
  productId?: string;
}

export const ProductDetailClient: React.FC<ProductDetailClientProps> = ({
  product: initialProduct,
  relatedProducts: initialRelatedProducts = [],
  initialReviews,
  productId,
}) => {
  const [product, setProduct] = useState(initialProduct);
  const [relatedProducts, setRelatedProducts] = useState(initialRelatedProducts);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    if (!productId) return;
    let active = true;
    const relatedProductsRequest = getRelatedProducts(productId).catch((error: unknown) => {
      console.error('Could not load related products.', error);
      return [];
    });
    Promise.all([getProduct(productId), relatedProductsRequest])
      .then(([loadedProduct, related]) => {
        if (!active) return;
        setProduct(loadedProduct);
        setRelatedProducts(related);
      })
      .catch((error: unknown) => {
        if (active) setLoadError(error instanceof Error ? error.message : 'Could not load this product.');
      });
    return () => {
      active = false;
    };
  }, [productId]);

  if (!product) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center bg-[#fbf9f2]">
        <p className="font-sans text-sm text-[#69726d]">
          {loadError || 'Loading product details...'}
        </p>
      </div>
    );
  }

  return (
    <ProductDetailView
      product={product}
      relatedProducts={relatedProducts}
      initialReviews={initialReviews}
    />
  );
};

function getVariantSize(
  variant: { sizeLabel?: string | null; size?: string } | undefined | null,
): string {
  if (!variant) return '';
  return (variant.sizeLabel || variant.size || '').trim();
}

const ProductDetailView: React.FC<{
  product: Product;
  relatedProducts: Product[];
  initialReviews?: ProductReviewsResponse;
}> = ({
  product,
  relatedProducts,
  initialReviews,
}) => {
  const router = useRouter();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist, isItemLoading } = useWishlist();
  const { settings } = useStorefront();
  const whatsappUrl = getWhatsAppUrl(settings?.whatsapp || '');
  const productWhatsAppUrl = getWhatsAppUrl(
    settings?.whatsapp || '',
    `Salam, I am interested in ${product.name}.`,
  );

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const initialColor =
    product.colors[0]?.name ||
    product.variants?.[0]?.color ||
    '';
  const [selectedColor, setSelectedColor] = useState<string>(initialColor);

  const colorVariants =
    product.variants?.filter(
      (variant) => variant.isActive !== false && (!selectedColor || variant.color === selectedColor),
    ) ?? [];
  const availableSizeLabels = product.variants?.length
    ? [
        ...new Set(
          colorVariants
            .map((variant) => getVariantSize(variant))
            .filter((size): size is string => Boolean(size)),
        ),
      ]
    : product.sizes;

  const [selectedSize, setSelectedSize] = useState<string>(() => {
    const matchingVariant = product.variants?.find(
      (variant) =>
        variant.isActive !== false &&
        variant.color === initialColor &&
        getVariantSize(variant),
    );
    return (
      (matchingVariant ? getVariantSize(matchingVariant) : '') ||
      product.sizes[0] ||
      ''
    );
  });

  const [quantity, setQuantity] = useState(1);
  const [customNotes, setCustomNotes] = useState('');
  const [measurementUnit, setMeasurementUnit] = useState<'in' | 'cm'>('in');
  const [sizeModalOpen, setSizeModalOpen] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>('accordion-1');
  const [showMobileDetails, setShowMobileDetails] = useState(false);
  const [reviews, setReviews] = useState<ProductReview[]>(initialReviews?.items || []);
  const [totalReviews, setTotalReviews] = useState(
    initialReviews?.total ?? (initialReviews?.items?.length || 0),
  );
  const [averageRating, setAverageRating] = useState(initialReviews?.averageRating ?? 0);
  const [ratingDistribution, setRatingDistribution] = useState<Record<number, number>>(
    initialReviews?.ratingDistribution || {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    },
  );
  const [reviewEligibility, setReviewEligibility] = useState<ReviewEligibilityResponse | null>(null);
  const [votedReviews, setVotedReviews] = useState<Record<string, 'yes' | 'no'>>({});
  const [votingReviewId, setVotingReviewId] = useState<string | null>(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);
  const [isReviewSubmitting, setIsReviewSubmitting] = useState(false);
  const [zoomStyle, setZoomStyle] = useState<{ backgroundPosition: string; display: string }>({
    backgroundPosition: '0% 0%',
    display: 'none',
  });

  const isFavorite = isInWishlist(product.id);
  const isWishlistBusy = isItemLoading(product.id);
  const selectedVariant = colorVariants.find(
    (variant) => getVariantSize(variant) === selectedSize,
  );
  const canSelectSize = Boolean(selectedSize) &&
    (product.variants?.length ? Boolean(selectedVariant) : true);

  const activeSku = selectedVariant?.sku || product.sku || product.slug;
  const currentPrice =
    selectedVariant?.priceOverride !== undefined &&
    selectedVariant?.priceOverride !== null
      ? Number(selectedVariant.priceOverride)
      : product.price;
  const referencePrice =
    product.originalPrice && product.originalPrice > currentPrice
      ? product.originalPrice
      : product.price > currentPrice
        ? product.price
        : undefined;
  const hasDiscount = Boolean(referencePrice && referencePrice > currentPrice);
  const originalPrice = hasDiscount ? referencePrice : undefined;
  const savingsAmount =
    originalPrice !== undefined ? originalPrice - currentPrice : 0;

  const measurementRows = colorVariants
    .filter(
      (variant) =>
        getVariantSize(variant) &&
        getMeasurementEntries(variant, measurementUnit).length,
    )
    .filter(
      (variant, index, variants) =>
        variants.findIndex(
          (candidate) => getVariantSize(candidate) === getVariantSize(variant),
        ) === index,
    );
  const measurementColumns = [
    ...new Set(
      measurementRows.flatMap((variant) =>
        Object.keys(variant.measurements ?? {}).filter((key) => key !== 'unit'),
      ),
    ),
  ];

  const selectColor = (color: string) => {
    setSelectedColor(color);
    const colorSizes = (product.variants ?? [])
      .filter((variant) => variant.isActive !== false && variant.color === color)
      .map((variant) => getVariantSize(variant))
      .filter((size): size is string => Boolean(size));
    if (colorSizes.length && !colorSizes.includes(selectedSize)) {
      setSelectedSize(colorSizes[0]);
    }
  };

  const loadReviews = React.useCallback(async () => {
    try {
      const data = await getProductReviews(product.slug || product.id);
      setReviews(data.items || []);
      setTotalReviews(data.total ?? (data.items?.length || 0));
      setAverageRating(data.averageRating ?? 0);
      setRatingDistribution(data.ratingDistribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
    } catch (error) {
      console.error('Could not load product reviews', error);
    }
  }, [product.slug, product.id]);

  const refreshEligibility = React.useCallback(async () => {
    if (!user) {
      setReviewEligibility(null);
      return;
    }
    try {
      const res = await checkReviewEligibility(product.slug || product.id);
      setReviewEligibility(res);
    } catch {
      setReviewEligibility(null);
    }
  }, [user, product.slug, product.id]);

  useEffect(() => {
    let active = true;
    getProductReviews(product.slug || product.id)
      .then((data) => {
        if (!active) return;
        setReviews(data.items || []);
        setTotalReviews(data.total ?? (data.items?.length || 0));
        setAverageRating(data.averageRating ?? 0);
        setRatingDistribution(data.ratingDistribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
      })
      .catch((error: unknown) => {
        console.error('Could not load product reviews', error);
      });
    return () => {
      active = false;
    };
  }, [product.slug, product.id]);

  useEffect(() => {
    if (!user) return;
    let active = true;
    checkReviewEligibility(product.slug || product.id)
      .then((res) => {
        if (!active) return;
        setReviewEligibility(res);
      })
      .catch(() => {
        if (!active) return;
        setReviewEligibility(null);
      });
    return () => {
      active = false;
    };
  }, [user, product.slug, product.id]);

  const handleOpenReviewForm = () => {
    if (!user) {
      toast.error('First login please', {
        description: 'Please login first to submit a review.',
        action: {
          label: 'Login',
          onClick: () => router.push(`/login?next=${encodeURIComponent(`/product/${product.slug}#patron-reviews`)}`),
        },
      });
      return;
    }
    if (!reviewEligibility?.canReview) {
      if (reviewEligibility?.reason === 'ALREADY_REVIEWED') {
        if (reviewEligibility?.existingReview?.status === 'PENDING') {
          toast.info('Your review has been submitted and is currently awaiting atelier moderation.');
        } else {
          toast.info('You have already submitted a review for this purchase.');
        }
      } else if (reviewEligibility?.reason === 'NO_DELIVERED_PURCHASE') {
        toast.error('Review submission requires a verified, delivered order of this product.');
      } else {
        toast.error('You are not eligible to review this garment yet.');
      }
      return;
    }
    setIsReviewFormOpen((open) => !open);
  };

  const submitReview = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) {
      toast.error('First login please', {
        description: 'Please login first to submit a review.',
      });
      router.push(`/login?next=${encodeURIComponent(`/product/${product.slug}#patron-reviews`)}`);
      return;
    }
    if (!reviewEligibility?.canReview) {
      if (reviewEligibility?.reason === 'ALREADY_REVIEWED') {
        toast.info('You have already submitted a review for this purchase.');
      } else if (reviewEligibility?.reason === 'NO_DELIVERED_PURCHASE') {
        toast.error('Review submission requires a verified, delivered order of this product.');
      } else {
        toast.error('You are not eligible to review this garment yet.');
      }
      return;
    }
    if (!reviewComment.trim()) {
      toast.error('Please write a comment for your review.');
      return;
    }
    setIsReviewSubmitting(true);
    try {
      await submitProductReview(product.slug || product.id, reviewRating, reviewComment.trim());
      setReviewComment('');
      setIsReviewFormOpen(false);
      toast.success('Your review has been submitted for moderation. It will appear once approved by the atelier.');
      await refreshEligibility();
      await loadReviews();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not submit your review.');
    } finally {
      setIsReviewSubmitting(false);
    }
  };

  const handleVoteHelpful = async (reviewId: string, helpful: boolean) => {
    if (votingReviewId) return;
    if (!user) {
      toast.error('First login please', {
        description: 'Please login to vote on patron reviews.',
        action: {
          label: 'Login',
          onClick: () => router.push(`/login?next=${encodeURIComponent(`/product/${product.slug}#patron-reviews`)}`),
        },
      });
      return;
    }
    if (votedReviews[reviewId]) {
      toast.info('You have already voted on this review.');
      return;
    }
    setVotingReviewId(reviewId);
    try {
      await voteReviewHelpful(reviewId, helpful);
      setVotedReviews((prev) => ({ ...prev, [reviewId]: helpful ? 'yes' : 'no' }));
      setReviews((prev) =>
        prev.map((r) => {
          if (r.id === reviewId) {
            return {
              ...r,
              helpfulYes: helpful ? r.helpfulYes + 1 : r.helpfulYes,
              helpfulNo: !helpful ? r.helpfulNo + 1 : r.helpfulNo,
            };
          }
          return r;
        })
      );
      toast.success('Thank you for your feedback.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not record your vote.');
    } finally {
      setVotingReviewId(null);
    }
  };

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

  const handleAddToCart = async () => {
    if (isAddingToCart || isBuyingNow) return;
    if (!user) {
      toast.error('First login please', {
        description: 'Please login first to add items to your cart.',
        action: {
          label: 'Login',
          onClick: () => router.push(`/login?next=${encodeURIComponent(`/product/${product.slug}`)}`),
        },
      });
      return;
    }
    if (!selectedSize) {
      toast.error('Please select a size before adding to your bag.');
      return;
    }
    if (selectedVariant && selectedVariant.stock <= 0) {
      toast.error(`Size ${selectedSize} is currently out of stock.`);
      return;
    }
    setIsAddingToCart(true);
    try {
      await addToCart(product, selectedSize, selectedColor, quantity, customNotes);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (isAddingToCart || isBuyingNow) return;
    if (!user) {
      toast.error('First login please', {
        description: 'Please login first to proceed to checkout.',
        action: {
          label: 'Login',
          onClick: () => router.push(`/login?next=${encodeURIComponent(`/product/${product.slug}`)}`),
        },
      });
      return;
    }
    if (!selectedSize) {
      toast.error('Please select a size before proceeding to checkout.');
      return;
    }
    if (selectedVariant && selectedVariant.stock <= 0) {
      toast.error(`Size ${selectedSize} is currently out of stock.`);
      return;
    }
    setIsBuyingNow(true);
    try {
      const added = await addToCart(product, selectedSize, selectedColor, quantity, customNotes);
      if (added) {
        router.push('/checkout');
      }
    } finally {
      setIsBuyingNow(false);
    }
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

  return (
    <div className="w-full pt-6 sm:pt-10 pb-28 md:pb-24 bg-[#fbf9f2]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
        {/* Subtle Breadcrumb & Artisan Reference Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-sans uppercase tracking-wider text-[#717975] pb-2 border-b border-[#deddd3]/60">
          <nav className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <Link href="/" className="hover:text-[#073a2d] transition-colors">
              Home
            </Link>
            <span className="text-[#deddd3]">/</span>
            <Link href={`/shop?gender=${product.gender || 'MEN'}`} className="hover:text-[#073a2d] transition-colors">
              {product.gender === 'WOMEN' ? 'Women' : product.gender === 'UNISEX' ? 'Unisex' : 'Men'}
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
            <span>Atelier Ref: {activeSku} • {product.categoryLabel} Collection</span>
          </div>
        </div>

        {/* Main 2-Column Product Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-start">
          {/* LEFT COLUMN: Visual Gallery & Vertical Thumbs (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-3 sm:gap-4">
            {/* Vertical Thumbnail Strip */}
            <div className="flex md:flex-col gap-2.5 sm:gap-3 overflow-x-auto md:overflow-visible shrink-0 pb-2 md:pb-0">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative w-16 h-22 sm:w-20 sm:h-28 bg-[#f5f4ed] overflow-hidden border transition-all cursor-pointer ${
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
            <div className="relative flex-1 bg-[#f5f4ed] border border-[#deddd3] overflow-hidden group shadow-xs min-h-[380px] sm:min-h-[500px] md:min-h-[640px]">
              {/* Floating Badges */}
              <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10 flex flex-col gap-1.5 sm:gap-2">
                {product.badge && (
                  <span className="bg-[#073a2d] text-white font-sans text-[10px] uppercase px-3 py-1.5 tracking-widest font-bold shadow-sm">
                    {product.badge}
                  </span>
                )}
                {product.isBestSeller && !product.badge?.includes('Best Seller') && (
                  <span className="bg-[#c79a45] text-[#073a2d] font-sans text-[10px] uppercase px-2.5 py-1 tracking-wider shadow-sm font-bold">
                    Best Seller
                  </span>
                )}
                {product.isNewArrival && !product.badge?.includes('New') && (
                  <span className="bg-white/95 text-[#073a2d] border border-[#deddd3] font-sans text-[10px] uppercase px-2.5 py-1 tracking-wider shadow-sm font-bold">
                    New Arrival
                  </span>
                )}
                {product.isExpressAvailable && (
                  <span className="bg-[#073a2d] text-[#c79a45] border border-[#c79a45]/40 font-sans text-[9px] uppercase px-2.5 py-1 tracking-widest font-bold flex items-center gap-1 shadow-xs">
                    <Sparkles className="w-3 h-3 text-[#c79a45]" />
                    <span>Express Available</span>
                  </span>
                )}
              </div>

              {/* Wishlist & Share Action Floating */}
              <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                <button
                  disabled={isWishlistBusy}
                  onClick={() => toggleWishlist(product.id, product.name)}
                  aria-label={isWishlistBusy ? 'Updating wishlist' : 'Wishlist'}
                  aria-busy={isWishlistBusy ? 'true' : undefined}
                  className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md text-[#1b1c18] hover:text-[#ba1a1a] flex items-center justify-center shadow-md transition-transform active:scale-95 cursor-pointer disabled:opacity-75 disabled:cursor-wait"
                >
                  {isWishlistBusy ? (
                    <Loader2 className="w-5 h-5 animate-spin text-[#073a2d]" />
                  ) : (
                    <Heart className={`w-5 h-5 ${isFavorite ? 'fill-[#ba1a1a] text-[#ba1a1a]' : ''}`} />
                  )}
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
                  <span>Inspect Artisan Finish</span>
                </div>
                <div className="bg-[#073a2d]/90 text-white px-3 py-1.5 font-sans text-[10px] tracking-widest uppercase font-semibold">
                  {product.fabric || (product.gsm ? `${product.gsm} GSM Fabric` : 'Bespoke Handloom')}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Specifications & Purchase (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Header & Heritage Tag */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-sans text-[11px] uppercase tracking-widest text-[#c79a45] font-bold">
                  Rongin Libas Atelier • Dhaka
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#073a2d]" />
                <span className="font-sans text-[11px] uppercase tracking-wider text-[#073a2d] font-semibold">
                  {selectedVariant ? (selectedVariant.stock > 0 ? 'In Stock' : 'Out of Stock') : (product.inStock ? 'In Stock' : 'Out of Stock')}
                </span>
                {product.gender && (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#deddd3]" />
                    <span className="font-sans text-[11px] uppercase tracking-wider text-[#717975] font-semibold">
                      {product.gender}
                    </span>
                  </>
                )}
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl text-[#073a2d] font-normal leading-tight">
                {product.name}
              </h1>

              {/* Short Description */}
              {product.shortDescription && (
                <p className="font-serif italic text-sm text-[#404945] leading-relaxed pt-1">
                  {product.shortDescription}
                </p>
              )}

              {/* Patron Rating Row - Only shown when product has reviews */}
              {totalReviews > 0 && (
                <div className="flex items-center gap-3 pt-1">
                  <div className="flex text-[#c79a45]">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.round(averageRating)
                            ? 'fill-[#c79a45] text-[#c79a45]'
                            : 'text-[#deddd3]'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-sans text-xs font-bold text-[#1b1c18]">
                    {averageRating.toFixed(1)} / 5.0
                  </span>
                  <span className="text-[#deddd3]">•</span>
                  <a
                    href="#patron-reviews"
                    className="font-sans text-xs uppercase tracking-wider text-[#717975] hover:text-[#073a2d] underline underline-offset-4 font-semibold"
                  >
                    {totalReviews} Verified Patron {totalReviews === 1 ? 'Review' : 'Reviews'}
                  </a>
                </div>
              )}
            </div>

            {/* Pricing Card Panel */}
            <div className="bg-[#f5f4ed] p-5 border border-[#deddd3] space-y-2">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="font-serif text-3xl font-bold text-[#073a2d]">
                  ৳ {currentPrice.toLocaleString()}
                </span>
                {originalPrice && (
                  <span className="font-sans text-sm text-[#717975] line-through">
                    ৳ {originalPrice.toLocaleString()}
                  </span>
                )}
                {savingsAmount > 0 && (
                  <Badge className="bg-[#c79a45] text-[#073a2d] font-sans text-[10px] font-bold uppercase px-2 py-0.5 rounded-none">
                    Privilege Savings (Save ৳ {savingsAmount.toLocaleString()})
                  </Badge>
                )}
              </div>
              <p className="font-sans text-xs text-[#69726d] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#073a2d]" />
                <span>Inclusive of all Dhaka VAT &amp; regional handloom luxury duties.</span>
              </p>
            </div>

            {/* Garment Narrative / Full Description */}
            {product.description && (
              <div className="bg-[#fbf9f2] p-4 border border-[#deddd3] space-y-1.5">
                <p className="font-sans text-[11px] uppercase tracking-wider text-[#073a2d] font-bold">
                  Garment Silhouette &amp; Craft Narrative
                </p>
                <p className="font-sans text-xs text-[#404945] leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* Tags from Database */}
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-white border border-[#deddd3] px-2.5 py-1 text-[10px] font-sans uppercase tracking-wider text-[#717975] font-semibold"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Color Hue Selection */}
            {product.colors.length > 0 && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <label className="font-sans text-xs uppercase tracking-wider text-[#1b1c18] font-bold">
                    Color Hue:{' '}
                    <span className="font-normal text-[#69726d]">
                      {selectedColor || product.colors[0]?.name}
                    </span>
                  </label>
                  <span className="font-sans text-[10px] uppercase text-[#c79a45] font-semibold tracking-wider">
                    Heritage Dye
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {product.colors.map((c) => {
                    const isLight =
                      !c.hex ||
                      ['#ffffff', '#fff', '#fbf9f2', '#f5f4ed', '#fafafa', '#f8fafc'].includes(c.hex.toLowerCase()) ||
                      c.name.toLowerCase().includes('white');

                    return (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => selectColor(c.name)}
                        title={c.name}
                        className={`w-9 h-9 rounded-full transition-transform cursor-pointer border ${
                          isLight
                            ? 'border-neutral-400 shadow-[0_2px_6px_rgba(0,0,0,0.3)] ring-1 ring-black/10'
                            : 'border-[#deddd3]'
                        } ${
                          selectedColor === c.name
                            ? 'ring-2 ring-[#073a2d] ring-offset-2 scale-110'
                            : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: c.hex }}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size Selection & Sizing Matrix Trigger */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="font-sans text-xs uppercase tracking-wider text-[#1b1c18] font-bold">
                  Select Size:{' '}
                  <span className="font-semibold text-[#073a2d]">{selectedSize || 'Select a size'}</span>
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
                {availableSizeLabels.map((sizeLabel) => {
                  const variant = colorVariants.find(
                    (item) => getVariantSize(item) === sizeLabel,
                  );
                  const summary = getMeasurementEntries(variant, measurementUnit)
                    .map((measurement) => `${measurement.label} ${measurement.value}`)
                    .join(' · ');
                  const inStock = (variant?.stock ?? 0) > 0;
                  return (
                    <button
                      key={sizeLabel}
                      type="button"
                      onClick={() => setSelectedSize(sizeLabel)}
                      className={`h-12 border flex flex-col items-center justify-center transition-colors cursor-pointer ${
                        selectedSize === sizeLabel
                          ? 'bg-[#073a2d] text-white border-[#073a2d] shadow-xs'
                          : inStock
                            ? 'bg-[#f5f4ed] hover:bg-[#eae8e1] text-[#1b1c18] border-[#deddd3]'
                            : 'bg-[#faf9f5] opacity-60 text-[#717975] border-[#deddd3]'
                      }`}
                    >
                      <span className="font-sans text-xs font-bold">{sizeLabel}</span>
                      <span className={`text-[9px] truncate max-w-full px-1 ${selectedSize === sizeLabel ? 'text-[#c79a45]' : 'text-[#717975]'}`}>
                        {summary || (variant?.stock ? `${variant.stock} in stock` : 'Out')}
                      </span>
                    </button>
                  );
                })}
              </div>
              {!availableSizeLabels.length && (
                <p className="text-xs text-[#69726d] bg-[#f5f4ed] p-3 border border-[#deddd3]">
                  One standard artisanal size fits all.
                </p>
              )}

              {/* Stock Urgency Note */}
              <div className="flex items-center justify-between text-xs font-sans">
                <span className="text-[#c79a45] font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#c79a45] animate-pulse" />
                  <span>
                    {selectedVariant
                      ? selectedVariant.stock > 0
                        ? selectedVariant.stock <= 5
                          ? `Only ${selectedVariant.stock} left in stock for Size ${selectedSize}`
                          : `In Stock (${selectedVariant.stock} available in Size ${selectedSize})`
                        : `Size ${selectedSize} is currently out of stock`
                      : selectedSize
                        ? `Selected size: ${selectedSize}`
                        : 'Please choose an available size'}
                  </span>
                </span>
                <span className="text-[#717975] text-[11px] font-semibold">
                  {product.fit || 'Regular Tailored Fit'}
                </span>
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
                  loading={isAddingToCart}
                  loadingText="Adding To Cart..."
                  disabled={isAddingToCart || isBuyingNow}
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
                loading={isBuyingNow}
                loadingText="Preparing Checkout..."
                disabled={isAddingToCart || isBuyingNow}
                onClick={handleBuyNow}
                className="w-full h-12 bg-white hover:bg-[#f5f4ed] text-[#073a2d] border-[#073a2d] font-sans text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <Truck className="w-4 h-4 text-[#073a2d]" />
                <span>Buy It Now (Cash on Delivery)</span>
              </Button>

              {/* WhatsApp Concierge Stylist CTA */}
              {settings?.whatsappOrderEnabled && productWhatsAppUrl && (
              <a
                href={productWhatsAppUrl}
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
                      {settings.whatsapp} • Fast Dhaka sizing &amp; instant reservation
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#c79a45] group-hover:translate-x-1 transition-transform" />
              </a>
              )}
            </div>

            {/* Trust Assurances */}
            <div className="bg-[#f5f4ed] p-4 border border-[#deddd3] space-y-3">
              {product.isExpressAvailable && (
                <div className="flex items-start gap-3 bg-[#e8f3ef] p-3 border border-[#073a2d]/20">
                  <Sparkles className="w-5 h-5 text-[#073a2d] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-sans text-xs uppercase tracking-wider text-[#073a2d] font-bold">
                      Express Atelier Dispatch Available
                    </p>
                    <p className="font-sans text-[11px] text-[#2d5f50]">
                      Guaranteed priority dispatch within 24 hours inside Dhaka metropolitan sectors.
                    </p>
                  </div>
                </div>
              )}

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

        {/* Mobile View All Details Toggle (Only visible on mobile) */}
        <div className="lg:hidden pt-2 pb-2">
          <button
            type="button"
            onClick={() => setShowMobileDetails((prev) => !prev)}
            className="w-full py-3.5 px-4 bg-white hover:bg-[#f5f4ed] border border-[#deddd3] text-[#073a2d] font-sans text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
          >
            <span>{showMobileDetails ? 'Hide Details' : 'View All Details'}</span>
            <ChevronDown
              className={`w-4 h-4 text-[#c79a45] transition-transform duration-300 ${
                showMobileDetails ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>

        {/* Editorial Specifications & Garment Dimensions (Always visible on desktop, toggled on mobile) */}
        <div className={showMobileDetails ? 'block space-y-6' : 'hidden lg:block lg:space-y-6'}>
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
              Each Rongin Libas {product.categoryLabel.toLowerCase()} is crafted with meticulous attention to tailoring, seam tensioning, and finish executed by master karigars in our Dhaka atelier.
            </p>

            <div className="p-5 bg-[#f5f4ed] border border-[#deddd3] space-y-2">
              <p className="font-sans text-xs uppercase tracking-wider font-bold text-[#073a2d]">
                Sartorial Master Note:
              </p>
              <p className="font-serif text-xs italic text-[#404945] leading-relaxed">
                &ldquo;{product.description || 'Crafted for discerning patrons seeking timeless elegance and uncompromising comfort in South Asian celebrations and formal assemblies.'}&rdquo;
              </p>
              <p className="font-sans text-[10px] text-[#c79a45] uppercase tracking-widest font-semibold pt-1">
                — Rongin Libas Atelier, Dhaka
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
                  <div className="space-y-3 text-xs font-sans text-[#404945]">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pb-2 border-b border-[#deddd3]">
                      <div>
                        <span className="text-[10px] uppercase text-[#717975] block">Silhouette &amp; Cut</span>
                        <span className="font-bold text-[#073a2d]">{product.fit || 'Regular Cut'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-[#717975] block">Garment SKU</span>
                        <span className="font-bold text-[#073a2d]">{activeSku}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-[#717975] block">Category</span>
                        <span className="font-bold text-[#073a2d]">{product.categoryLabel}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-[#717975] block">Gender</span>
                        <span className="font-bold text-[#073a2d]">{product.gender || 'MEN'}</span>
                      </div>
                    </div>
                    {product.description && (
                      <p className="leading-relaxed text-[#404945]">{product.description}</p>
                    )}
                    <ul className="list-disc list-inside space-y-1.5 text-xs font-sans text-[#404945]">
                      <li>Hand-finished architectural collar and placket engineered for South Asian formal and celebration occasions.</li>
                      <li>Double-needle armhole and side seams providing dynamic range of motion, ergonomic drape, and comfort.</li>
                      <li>Bespoke shank placket buttons designed to endure repeated laundering with dignified luster.</li>
                    </ul>
                  </div>
                ),
              },
              {
                id: 'accordion-2',
                title: `Fabric & Material Heritage ${product.gsm ? `(${product.gsm} GSM)` : ''}`,
                icon: Layers,
                content: (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs font-sans">
                    <div className="p-3 bg-[#f5f4ed] border border-[#deddd3]">
                      <span className="text-[10px] uppercase text-[#717975] block">Fabric Composition</span>
                      <span className="font-bold text-[#073a2d]">{product.fabric || 'Atelier Specification'}</span>
                    </div>
                    <div className="p-3 bg-[#f5f4ed] border border-[#deddd3]">
                      <span className="text-[10px] uppercase text-[#717975] block">Fabric Weight</span>
                      <span className="font-bold text-[#073a2d]">
                        {product.gsm ? `${product.gsm} GSM Subtropical Weave` : 'Subtropical All-Weather Weave'}
                      </span>
                    </div>
                    <div className="p-3 bg-[#f5f4ed] border border-[#deddd3]">
                      <span className="text-[10px] uppercase text-[#717975] block">Fabric Origin / Mill</span>
                      <span className="font-bold text-[#073a2d]">{product.fabricOrigin || 'Heritage Atelier Weave'}</span>
                    </div>
                    <div className="p-3 bg-[#f5f4ed] border border-[#deddd3]">
                      <span className="text-[10px] uppercase text-[#717975] block">Dye Standard</span>
                      <span className="font-bold text-[#073a2d]">Azo-Free Low-Impact Heritage Dye</span>
                    </div>
                  </div>
                ),
              },
              {
                id: 'accordion-3',
                title: 'Size & Garment Measurements',
                icon: Ruler,
                content: (
                  <div className="space-y-2 text-xs font-sans text-[#404945]">
                    <p>
                      Available sizes for this garment: <strong>{availableSizeLabels.join(', ') || 'Standard'}</strong>.
                    </p>
                    <p>
                      Select your preferred size label from the selector above or reference the Precision Fitting Guide below for detailed garment dimensions.
                    </p>
                  </div>
                ),
              },
              {
                id: 'accordion-4',
                title: 'Care & Garment Longevity',
                icon: Sparkles,
                content: (
                  <div className="space-y-2 text-xs font-sans text-[#404945]">
                    {product.careInstructions && (
                      <div className="p-3 bg-[#f5f4ed] border border-[#deddd3] mb-2 font-medium text-[#073a2d]">
                        <span className="text-[10px] uppercase text-[#717975] block font-normal">Garment Care Advice</span>
                        {product.careInstructions}
                      </div>
                    )}
                    <ul className="list-disc list-inside space-y-1 text-xs font-sans text-[#404945]">
                      <li>First 2 cleans: Professional eco dry clean recommended to protect natural luster and texture.</li>
                      <li>Subsequent care: Gentle cold hand wash using pH-neutral gentle detergent; do not wring or tumble dry.</li>
                      <li>Pressing: Warm iron on reverse side under a damp cotton pressing cloth.</li>
                      <li>Storage: Hang on broad hanger inside complimentary breathable garment bag.</li>
                    </ul>
                  </div>
                ),
              },
              {
                id: 'accordion-5',
                title: 'Doorstep Transit, COD & 7-Day Returns',
                icon: Truck,
                content: (
                  <p className="text-xs font-sans text-[#404945]">
                    We operate daily express logistics covering Gulshan, Banani, Dhanmondi, Uttara, Mirpur, and all major Dhaka sectors via dedicated couriers. Inside Dhaka: ৳{settings?.dhakaDeliveryCharge ?? 80} (within 48 Hours) | Outside Dhaka: ৳{settings?.outsideDhakaDeliveryCharge ?? 150} (within 3-5 days via Steadfast Express). Cash on Delivery is gladly accepted across Bangladesh with open-box verification.
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

        {/* Product-specific measurements are kept separate from canonical size labels. */}
        <section className="bg-white p-6 sm:p-10 border border-[#deddd3] shadow-xs space-y-6" id="size-guide-section">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="font-sans text-xs uppercase tracking-widest text-[#c79a45] font-bold">
                Precision Fitting Guide
              </span>
              <h2 className="font-serif text-2xl text-[#073a2d] font-normal">
                {product.name} Size Measurements
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
                  <th className="p-3">Size Label</th>
                  {measurementColumns.map((column) => (
                    <th key={column} className="p-3">
                      {column.replace(/([A-Z])/g, ' $1')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0eee7]">
                {measurementRows.map((variant) => (
                  <tr
                    key={variant.id}
                    className={`transition-colors ${
                      selectedSize === getVariantSize(variant)
                        ? 'bg-[#f5f4ed] font-bold text-[#073a2d]'
                        : 'hover:bg-[#fbf9f2]'
                    }`}
                  >
                    <td className="p-3 font-serif font-bold">{getVariantSize(variant)}</td>
                    {measurementColumns.map((column) => {
                      const value = variant.measurements?.[column];
                      if (typeof value !== 'number') {
                        return <td key={column} className="p-3">—</td>;
                      }
                      const sourceUnit = variant.measurements?.unit === 'CM' ? 'cm' : 'in';
                      const converted =
                        sourceUnit === measurementUnit
                          ? value
                          : measurementUnit === 'cm'
                            ? value * 2.54
                            : value / 2.54;
                      return (
                        <td key={column} className="p-3">
                          {measurementUnit === 'in'
                            ? `${converted.toFixed(1)}"`
                            : `${converted.toFixed(1)} cm`}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
            {!measurementRows.length && (
              <p className="p-5 text-center text-xs text-[#717975]">
                Product-specific measurements have not been configured.
              </p>
            )}
          </div>
          <p className="font-sans text-[11px] text-[#717975]">
            Size labels and garment measurements are separate.{' '}
            {settings?.whatsappOrderEnabled && whatsappUrl
              ? <>For tailored customization, <a href={whatsappUrl} target="_blank" rel="noreferrer" className="text-[#073a2d] underline">contact our master cutter via WhatsApp ({settings.whatsapp})</a>.</>
              : 'Product-specific measurements are available above.'}
          </p>
        </section>
        </div>

        {/* Patron Reviews & Testimonials Section */}
        {(totalReviews > 0 || reviewEligibility?.canReview || isReviewFormOpen || reviewEligibility?.existingReview) && (
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
              onClick={handleOpenReviewForm}
              className="bg-[#073a2d] hover:bg-[#0d4d3b] text-white font-sans text-xs uppercase tracking-wider px-5 h-11 cursor-pointer"
            >
              Write a Patron Review
            </Button>
          </div>

          {isReviewFormOpen && (
            <form onSubmit={submitReview} className="space-y-4 border border-[#deddd3] bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between pb-2 border-b border-[#deddd3]">
                <h3 className="font-serif text-lg text-[#073a2d]">Write a Patron Reflection</h3>
                <span className="font-sans text-xs text-[#c79a45] uppercase tracking-wider font-semibold">
                  Verified Purchase: {reviewEligibility?.orderNumber || 'Delivered Order'}
                </span>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#404945] uppercase tracking-wider">
                  Rating
                </label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-1 focus:outline-none cursor-pointer"
                    >
                      <Star
                        className={`w-6 h-6 transition-colors ${
                          star <= reviewRating
                            ? 'fill-[#c79a45] text-[#c79a45]'
                            : 'text-[#deddd3]'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 font-sans text-xs font-bold text-[#073a2d]">
                    {reviewRating} of 5 Stars
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#404945] uppercase tracking-wider">
                  Garment Reflections &amp; Craftsmanship Experience
                </label>
                <textarea
                  required
                  rows={4}
                  maxLength={3000}
                  placeholder="Reflect upon the fabric drape, collar stiffness, breathability, and doorstep open-box inspection..."
                  value={reviewComment}
                  onChange={(event) => setReviewComment(event.target.value)}
                  className="mt-1 block w-full border border-[#deddd3] bg-[#fbf9f2] p-3 text-sm font-sans focus:outline-none focus:border-[#073a2d]"
                />
              </div>
              <div className="flex items-center gap-3">
                <Button
                  type="submit"
                  loading={isReviewSubmitting}
                  loadingText="Submitting Reflection..."
                  disabled={isReviewSubmitting}
                  className="bg-[#073a2d] hover:bg-[#0d4d3b] text-white font-sans text-xs uppercase tracking-wider px-6 h-11 cursor-pointer"
                >
                  Submit Reflection
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isReviewSubmitting}
                  onClick={() => setIsReviewFormOpen(false)}
                  className="font-sans text-xs uppercase tracking-wider border-[#deddd3] cursor-pointer"
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}

          {/* Real Rating Summary & Distribution */}
          {totalReviews > 0 ? (
            <div className="bg-white p-6 sm:p-8 border border-[#deddd3] grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              {/* Average Rating Block */}
              <div className="md:col-span-5 flex flex-col items-center md:items-start text-center md:text-left space-y-2 border-b md:border-b-0 md:border-r border-[#deddd3] pb-6 md:pb-0 md:pr-8">
                <div className="flex items-baseline gap-2">
                  <span className="font-serif text-5xl font-bold text-[#073a2d] leading-none">
                    {averageRating.toFixed(1)}
                  </span>
                  <span className="font-sans text-sm text-[#717975]">/ 5.0</span>
                </div>
                <div className="flex text-[#c79a45] gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${
                        star <= Math.round(averageRating)
                          ? 'fill-[#c79a45] text-[#c79a45]'
                          : 'text-[#deddd3]'
                      }`}
                    />
                  ))}
                </div>
                <p className="font-sans text-xs uppercase tracking-wider text-[#404945] font-semibold">
                  Based on {totalReviews} Verified Atelier {totalReviews === 1 ? 'Review' : 'Reviews'}
                </p>
              </div>

              {/* Progress Breakdown Bars */}
              <div className="md:col-span-7 space-y-2 font-sans text-xs">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = ratingDistribution[star] || 0;
                  const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
                  return (
                    <div key={star} className="flex items-center gap-3">
                      <span className="w-16 text-[11px] text-[#404945] font-medium flex items-center gap-1">
                        <span>{star}</span>
                        <Star className="w-3 h-3 fill-[#c79a45] text-[#c79a45]" />
                      </span>
                      <div className="flex-1 h-2.5 bg-[#f0eee7] overflow-hidden">
                        <div
                          className="bg-[#073a2d] h-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-14 text-[11px] text-right text-[#717975]">
                        {count} ({pct}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="bg-white p-6 border border-[#deddd3] text-center space-y-2">
              <h3 className="font-serif text-xl text-[#073a2d]">Be the First to Review</h3>
              <p className="font-sans text-xs text-[#69726d] max-w-md mx-auto">
                Share your reflections on the craftsmanship, fit, and handloom texture of this garment.
              </p>
            </div>
          )}

          {/* User Review Status Notice if awaiting moderation */}
          {reviewEligibility?.existingReview?.status === 'PENDING' && (
            <div className="bg-[#fbf9f2] border border-[#c79a45] p-4 flex items-center justify-between text-xs text-[#1b1c18]">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-[#c79a45] fill-[#c79a45]" />
                <span>
                  Your review ({reviewEligibility.existingReview.rating} of 5 Stars) submitted on{' '}
                  {new Date(reviewEligibility.existingReview.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}{' '}
                  is currently awaiting atelier moderation.
                </span>
              </div>
              <span className="font-sans text-[10px] uppercase tracking-wider font-bold text-[#c79a45] bg-[#073a2d] px-2.5 py-1">
                Awaiting Moderation
              </span>
            </div>
          )}

          {/* Real Reviews Feed */}
          {reviews.length > 0 && (
            <div className="space-y-4">
              {reviews.map((review) => {
                const initials = review.customerName
                  ? review.customerName
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase()
                  : 'VP';
                const isVoted = votedReviews[review.id];

                return (
                  <article
                    key={review.id}
                    className="bg-white p-6 border border-[#deddd3] shadow-xs space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#073a2d] text-white flex items-center justify-center font-bold text-xs font-sans shrink-0">
                          {initials}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-sans text-sm uppercase tracking-wider font-bold text-[#1b1c18]">
                              {review.customerName || 'Verified Patron'}
                            </h4>
                            {review.verifiedPurchase && (
                              <Badge className="bg-[#b0ecd3]/40 text-[#073a2d] text-[9px] px-1.5 py-0 font-bold uppercase border-0 rounded-none">
                                Verified Purchase
                              </Badge>
                            )}
                          </div>
                          <time className="font-sans text-[11px] text-[#717975] block mt-0.5">
                            {new Date(review.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </time>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-[#c79a45]" aria-label={`${review.rating} out of 5 stars`}>
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating ? 'fill-[#c79a45] text-[#c79a45]' : 'text-[#deddd3]'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <p className="font-sans text-xs text-[#404945] leading-relaxed pt-1">
                      {review.comment}
                    </p>

                    {review.images && review.images.length > 0 && (
                      <div className="flex flex-wrap gap-2.5 pt-2">
                        {review.images.map((imgUrl, imgIdx) => (
                          <a
                            key={imgIdx}
                            href={imgUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="w-16 h-20 sm:w-20 sm:h-24 rounded border border-[#deddd3] overflow-hidden hover:opacity-90 hover:border-[#c79a45] transition-all shrink-0 bg-[#fbf9f2]"
                            title="View full patron photo"
                          >
                            <img
                              src={imgUrl}
                              alt={`Patron photo ${imgIdx + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </a>
                        ))}
                      </div>
                    )}

                    {/* Official Atelier Response */}
                    {review.adminFeedback && (
                      <div className="bg-[#fbf9f2] border-l-2 border-[#073a2d] p-3.5 space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-sans font-semibold text-[#073a2d] uppercase tracking-wider flex items-center gap-1.5">
                            <MessageSquare className="w-3.5 h-3.5 text-[#073a2d]" />
                            <span>Rongin Libas Atelier Response</span>
                          </span>
                          {review.adminFeedbackAt && (
                            <span className="font-sans text-[10px] text-[#717975]">
                              {new Date(review.adminFeedbackAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                          )}
                        </div>
                        <p className="font-sans text-xs text-[#1b1c18] italic leading-relaxed pt-0.5">
                          &ldquo;{review.adminFeedback}&rdquo;
                        </p>
                      </div>
                    )}

                    {/* Helpful voting bar */}
                    <div className="pt-3 border-t border-[#f0eee7] flex items-center justify-between text-xs text-[#717975]">
                      <span className="font-sans text-[11px]">Was this reflection helpful?</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={Boolean(isVoted) || Boolean(votingReviewId)}
                          onClick={() => handleVoteHelpful(review.id, true)}
                          className={`px-2.5 py-1 text-[11px] font-sans border transition-colors cursor-pointer inline-flex items-center gap-1.5 ${
                            isVoted === 'yes'
                              ? 'bg-[#073a2d] text-white border-[#073a2d]'
                              : 'border-[#deddd3] text-[#404945] hover:border-[#073a2d] hover:text-[#073a2d]'
                          } ${isVoted ? 'cursor-default' : ''} disabled:opacity-50`}
                        >
                          {votingReviewId === review.id && <Loader2 className="w-3 h-3 animate-spin shrink-0" />}
                          <span>Yes ({review.helpfulYes})</span>
                        </button>
                        <button
                          type="button"
                          disabled={Boolean(isVoted) || Boolean(votingReviewId)}
                          onClick={() => handleVoteHelpful(review.id, false)}
                          className={`px-2.5 py-1 text-[11px] font-sans border transition-colors cursor-pointer inline-flex items-center gap-1.5 ${
                            isVoted === 'no'
                              ? 'bg-[#ba1a1a] text-white border-[#ba1a1a]'
                              : 'border-[#deddd3] text-[#404945] hover:border-[#ba1a1a] hover:text-[#ba1a1a]'
                          } ${isVoted ? 'cursor-default' : ''} disabled:opacity-50`}
                        >
                          {votingReviewId === review.id && <Loader2 className="w-3 h-3 animate-spin shrink-0" />}
                          <span>No ({review.helpfulNo})</span>
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
        )}

        {/* You May Also Admire Section */}
        <section className="space-y-6 pt-6 border-t border-[#deddd3]">
          <div className="flex items-end justify-between">
            <div>
              <span className="font-sans text-xs uppercase tracking-widest text-[#c79a45] font-bold">
                Complementary Wardrobe
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl text-[#073a2d] font-normal tracking-tight mt-1">
                More products you may like
              </h2>
            </div>
            <Link
              href="/shop"
              className="font-sans text-xs uppercase tracking-wider text-[#073a2d] hover:text-[#c79a45] font-bold underline underline-offset-4"
            >
              All products &rarr;
            </Link>
          </div>

          {relatedProducts.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              {relatedProducts.slice(0, 4).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="border border-[#deddd3] bg-white p-8 text-center text-xs text-[#69726d]">
              No related garments currently available in this collection.
            </div>
          )}
        </section>
      </div>

      {/* Sticky Mobile Add To Cart / Buy Bar */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-[#fbf9f2]/95 backdrop-blur-md border-t border-[#deddd3] p-3 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="font-serif font-bold text-base text-[#073a2d] block leading-tight">
              ৳{currentPrice.toLocaleString()}
            </span>
            <span className="text-[10px] text-[#717975] uppercase tracking-wider block truncate">
              {selectedSize ? `Size: ${selectedSize}` : 'Select Size'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              loading={isAddingToCart}
              loadingText="Adding..."
              disabled={isAddingToCart || isBuyingNow}
              onClick={handleAddToCart}
              className="h-9 px-3.5 bg-[#073a2d] hover:bg-[#0d4d3b] text-white font-sans text-xs uppercase tracking-wider font-bold shadow-xs cursor-pointer"
            >
              <ShoppingCart className="w-3.5 h-3.5 mr-1 text-[#c79a45]" />
              Add
            </Button>
            <Button
              loading={isBuyingNow}
              loadingText="Preparing..."
              disabled={isAddingToCart || isBuyingNow}
              onClick={handleBuyNow}
              className="h-9 px-3.5 bg-[#c79a45] hover:bg-[#b58b3a] text-[#073a2d] font-sans text-xs uppercase tracking-wider font-bold shadow-xs cursor-pointer"
            >
              Buy Now
            </Button>
          </div>
        </div>
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
              How to Use This Garment&apos;s Measurements
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 font-sans text-xs text-[#404945] py-2">
            <p><strong>1. Choose the size label:</strong> The label (such as L or 34) is the selectable product size.</p>
            <p><strong>2. Compare measurements:</strong> When listed, measurement values are garment dimensions and remain separate from the size label.</p>
            <p><strong>3. Check the unit:</strong> Use the inches or centimeters control to view the product measurements in your preferred unit.</p>
          </div>

          <div className="p-4 bg-[#f5f4ed] border border-[#deddd3] flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4">
            <div>
              <p className="font-sans text-xs uppercase font-bold text-[#073a2d]">Need Bespoke Customization?</p>
              <p className="font-sans text-[11px] text-[#69726d]">Contact our atelier if you need help selecting a size or interpreting its measurements.</p>
            </div>
            {settings?.whatsappOrderEnabled && whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="bg-[#073a2d] hover:bg-[#0d4d3b] text-white font-sans text-xs uppercase tracking-wider px-4 py-2 font-bold whitespace-nowrap inline-flex items-center justify-center shadow-xs"
              >
                Talk to Master Cutter
              </a>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
