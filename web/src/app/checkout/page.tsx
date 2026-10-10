'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { getWhatsAppUrl, useStorefront } from '@/context/StorefrontContext';
import { apiRequest } from '@/lib/api';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  ShieldCheck,
  PhoneCall,
  Truck,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  Tag,
  CreditCard,
  Banknote,
  Smartphone,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  BANGLADESH_DIVISIONS,
  getDistrictsByDivision,
  getThanasByDistrict,
} from '@/data/bangladeshGeo';

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { settings } = useStorefront();
  const whatsappUrl = getWhatsAppUrl(
    settings?.whatsapp || '',
    'Hello Rongin Libas, I would like assistance with an order.',
  );
  const {
    items,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    discount,
    shippingFee,
    total,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
  } = useCart();

  // Form states with hierarchical Bangladesh address structure
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    division: '',
    district: '',
    thana: '',
    customThana: '',
    address: '',
    postalCode: '',
    notes: '',
  });

  const paymentMethod = 'cod';
  const [couponInput, setCouponInput] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [updatingKey, setUpdatingKey] = useState<string | null>(null);
  const [removingKey, setRemovingKey] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [trackingToken, setTrackingToken] = useState('');

  React.useEffect(() => {
    if (!user) return;
    const userDivision = user.address?.division || '';
    const userCity = user.address?.city || '';
    const districts = userDivision ? getDistrictsByDivision(userDivision) : [];
    const matchedDistrict = districts.find(
      (d) => d.name.toLowerCase() === userCity.toLowerCase(),
    );
    const districtName = matchedDistrict ? matchedDistrict.name : '';

    setFormData((previous) => ({
      ...previous,
      fullName: previous.fullName || user.name || '',
      phone: previous.phone || user.phone || '',
      email: previous.email || user.email || '',
      division: previous.division || userDivision,
      district: previous.district || districtName,
      address: previous.address || user.address?.line1 || '',
      postalCode: previous.postalCode || user.address?.postalCode || '',
    }));
  }, [user]);

  const availableDistricts = React.useMemo(() => {
    if (!formData.division) return [];
    return getDistrictsByDivision(formData.division);
  }, [formData.division]);

  const availableThanas = React.useMemo(() => {
    if (!formData.division || !formData.district) return [];
    return getThanasByDistrict(formData.division, formData.district);
  }, [formData.division, formData.district]);

  // Delivery rate calculations from store settings
  const dhakaDeliveryCharge = Number(settings?.dhakaDeliveryCharge ?? 80);
  const outsideDhakaDeliveryCharge = Number(settings?.outsideDhakaDeliveryCharge ?? 150);
  const freeDeliveryThreshold = Number(settings?.freeDeliveryThreshold ?? 2999);
  const netSubtotal = Math.max(0, subtotal - discount);
  const isFreeDelivery =
    settings?.freeShippingEnabled !== false &&
    netSubtotal >= freeDeliveryThreshold;

  // Inside Dhaka check:
  // If District is chosen: is it 'Dhaka'? (Note: other districts in Dhaka division like Gazipur/Narayanganj are outside Dhaka)
  // If District is NOT chosen yet, but Division is 'Dhaka': treat as Dhaka
  const isDhakaLocation = React.useMemo(() => {
    const district = formData.district?.trim().toLowerCase();
    const division = formData.division?.trim().toLowerCase();
    if (district === 'dhaka') return true;
    if (!district && division === 'dhaka') return true;
    return false;
  }, [formData.district, formData.division]);

  const isLocationChosen = Boolean(formData.district || formData.division);

  const effectiveDeliveryFee = React.useMemo(() => {
    if (isFreeDelivery) return 0;
    if (!isLocationChosen) {
      return shippingFee || outsideDhakaDeliveryCharge;
    }
    return isDhakaLocation ? dhakaDeliveryCharge : outsideDhakaDeliveryCharge;
  }, [
    isFreeDelivery,
    isLocationChosen,
    isDhakaLocation,
    dhakaDeliveryCharge,
    outsideDhakaDeliveryCharge,
    shippingFee,
  ]);

  const effectiveGrandTotal = React.useMemo(() => {
    return Math.max(0, netSubtotal + effectiveDeliveryFee);
  }, [netSubtotal, effectiveDeliveryFee]);

  const deliveryLabel = React.useMemo(() => {
    if (isFreeDelivery) {
      return 'Complimentary Delivery';
    }
    if (formData.district) {
      return isDhakaLocation ? 'Inside Dhaka Delivery' : 'Outside Dhaka Delivery';
    }
    if (formData.division) {
      return isDhakaLocation ? 'Inside Dhaka Delivery' : 'Outside Dhaka Delivery';
    }
    return 'Nationwide Delivery';
  }, [isFreeDelivery, formData.district, formData.division, isDhakaLocation]);

  const handleDivisionChange = (newDivision: string) => {
    setFormData((prev) => ({
      ...prev,
      division: newDivision,
      district: '',
      thana: '',
      customThana: '',
    }));
  };

  const handleDistrictChange = (newDistrict: string) => {
    setFormData((prev) => ({
      ...prev,
      district: newDistrict,
      thana: '',
      customThana: '',
    }));
  };

  const getItemKey = (productId: string, size: string, color: string) =>
    `${productId}-${size}-${color}`;

  const handleUpdateQuantity = async (
    productId: string,
    size: string,
    color: string,
    newQty: number,
  ) => {
    const key = getItemKey(productId, size, color);
    if (updatingKey || removingKey || isSubmitting) return;
    setUpdatingKey(key);
    try {
      await updateQuantity(productId, size, color, newQty);
    } finally {
      setUpdatingKey(null);
    }
  };

  const handleRemoveItem = async (
    productId: string,
    size: string,
    color: string,
  ) => {
    const key = getItemKey(productId, size, color);
    if (updatingKey || removingKey || isSubmitting) return;
    setRemovingKey(key);
    try {
      await removeFromCart(productId, size, color);
    } finally {
      setRemovingKey(null);
    }
  };

  const handleApplyCoupon = async (e?: React.SyntheticEvent) => {
    if (e) e.preventDefault();
    if (!couponInput.trim() || isApplyingCoupon || isSubmitting) return;
    setIsApplyingCoupon(true);
    try {
      if (await applyCoupon(couponInput)) {
        setCouponInput('');
      }
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    if (items.length === 0) {
      toast.error('Your sartorial bag is empty');
      return;
    }

    if (!formData.fullName.trim() || !formData.phone.trim()) {
      toast.error('Please enter your recipient full name and phone number.');
      return;
    }

    if (!formData.division || !formData.district) {
      toast.error('Please select your Division and District.');
      return;
    }

    const effectiveThana =
      formData.thana === 'OTHER'
        ? formData.customThana.trim()
        : formData.thana.trim();

    if (!effectiveThana) {
      toast.error('Please select or specify your Thana / Upazila.');
      return;
    }

    if (!formData.address.trim()) {
      toast.error('Please enter your street address, house no, or road.');
      return;
    }

    const orderItems = items.map((item) => ({
      productId: item.product.id,
      variantId: item.variantId,
      quantity: item.quantity,
    }));
    if (orderItems.some((item) => !item.variantId)) {
      toast.error('A cart item is missing a valid product size. Remove it and add it again.');
      return;
    }

    setIsSubmitting(true);
    try {
      const order = await apiRequest<{
        orderNumber: string;
        guestTrackingToken?: string;
      }>('/orders', {
        method: 'POST',
        body: JSON.stringify({
          items: orderItems,
          shippingAddress: {
            fullName: formData.fullName.trim(),
            phone: formData.phone.replace(/\s/g, ''),
            email: formData.email || undefined,
            division: formData.division,
            city: formData.district,
            area: effectiveThana,
            addressLine1: formData.address.trim(),
            postalCode: formData.postalCode.trim() || undefined,
            deliveryInstructions: formData.notes || undefined,
          },
          paymentMethod: paymentMethod.toUpperCase(),
          couponCode: appliedCoupon || undefined,
          customerNotes: formData.notes || undefined,
          guestName: formData.fullName.trim(),
          guestEmail: formData.email?.trim() || user?.email || undefined,
        }),
      });
      setOrderId(order.orderNumber);
      setTrackingToken(order.guestTrackingToken || '');
      setOrderConfirmed(true);
      await clearCart();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not place your order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderOrderSummary = (isMobile = false) => (
    <div
      className={`p-5 sm:p-6 bg-white border border-[#deddd3] shadow-xs space-y-4 sm:space-y-5 ${
        isMobile ? 'my-4 sm:my-6' : ''
      }`}
    >
      <h3 className="font-serif text-base sm:text-lg font-semibold text-[#073a2d] pb-3 border-b border-[#deddd3]">
        Order Summary ({items.length} {items.length === 1 ? 'Item' : 'Items'})
      </h3>

      {/* Coupon Code Section */}
      <div>
        {appliedCoupon ? (
          <div className="flex items-center justify-between p-2.5 bg-[#f0eee7] border border-[#c79a45]/40 text-xs">
            <div className="flex items-center gap-2 text-[#073a2d]">
              <Tag className="w-3.5 h-3.5 text-[#c79a45]" />
              <span>
                Applied: <strong>{appliedCoupon}</strong>
              </span>
            </div>
            <button
              type="button"
              onClick={removeCoupon}
              className="text-[11px] text-[#ba1a1a] hover:underline uppercase font-bold cursor-pointer"
            >
              Remove
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Input
              placeholder="Coupon Code"
              value={couponInput}
              disabled={isApplyingCoupon}
              onChange={(e) => setCouponInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  void handleApplyCoupon(e);
                }
              }}
              className="h-10 text-xs bg-[#fbf9f2] rounded-none border-[#deddd3]"
            />
            <Button
              type="button"
              variant="outline"
              loading={isApplyingCoupon}
              loadingText="Applying..."
              disabled={isApplyingCoupon || !couponInput.trim()}
              onClick={handleApplyCoupon}
              className="h-10 px-4 text-xs font-sans uppercase tracking-wider border-[#073a2d] text-[#073a2d] cursor-pointer"
            >
              Apply
            </Button>
          </div>
        )}
      </div>

      {/* Calculations */}
      <div className="space-y-2 text-xs font-sans text-[#69726d] pt-2">
        <div className="flex justify-between">
          <span>Items Subtotal</span>
          <span className="font-semibold text-[#1b1c18] tabular-nums">
            ৳{subtotal.toLocaleString()}
          </span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between text-[#073a2d] font-semibold">
            <span>Voucher Discount</span>
            <span className="tabular-nums">-৳{discount.toLocaleString()}</span>
          </div>
        )}

        <div className="flex justify-between items-center">
          <span>{deliveryLabel}</span>
          <span className="font-semibold tabular-nums text-[#1b1c18]">
            {effectiveDeliveryFee === 0 ? (
              <span className="text-[#073a2d] font-bold uppercase text-[10px]">
                Free (Order ≥ ৳{freeDeliveryThreshold.toLocaleString()})
              </span>
            ) : (
              `৳${effectiveDeliveryFee.toLocaleString()}`
            )}
          </span>
        </div>

        <Separator className="my-3 bg-[#deddd3]" />

        <div className="flex justify-between text-base sm:text-lg font-bold text-[#073a2d]">
          <span className="font-serif">Grand Total</span>
          <span className="tabular-nums">৳{effectiveGrandTotal.toLocaleString()}</span>
        </div>
      </div>

      {/* Guarantees Strip */}
      <div className="pt-3 border-t border-[#f0eee7] space-y-2 text-[11px] font-sans text-[#69726d]">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#073a2d]" />
          <span>Open-Box Delivery Verification Guaranteed</span>
        </div>
        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4 text-[#073a2d]" />
          <span>48h Express Dispatch Across Bangladesh</span>
        </div>
      </div>
    </div>
  );

  const renderConciergeCard = () => (
    <div className="p-6 bg-[#073a2d] text-[#fbf9f2] border border-[#c79a45]/30 shadow-xs space-y-3">
      <span className="font-sans text-[10px] uppercase tracking-[0.25em] text-[#c79a45] font-semibold block">
        BESPOKE ASSISTANCE
      </span>
      <h4 className="font-serif text-lg text-white">Prefer Direct Human Support?</h4>
      <p className="font-sans text-xs text-[#c0c8c3] leading-relaxed">
        Call or WhatsApp our Dhaka studio to confirm sizing, custom lengths, or arrange immediate urgent handover.
      </p>
      {settings?.whatsappOrderEnabled && whatsappUrl && (
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-xs font-sans uppercase tracking-widest text-[#c79a45] hover:text-white font-bold pt-1"
        >
          <PhoneCall className="w-4 h-4" />
          <span>WhatsApp {settings.whatsapp}</span>
        </a>
      )}
    </div>
  );

  return (
    <div className="w-full pt-6 sm:pt-10 pb-20 sm:pb-24 bg-[#fbf9f2]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Header Breadcrumb */}
        <div className="mb-6 sm:mb-8">
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-xs font-sans uppercase tracking-widest text-[#717975] hover:text-[#073a2d] transition-colors mb-2 sm:mb-3"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Continue Shopping</span>
          </Link>
          <h1 className="font-serif text-2xl sm:text-5xl font-normal text-[#073a2d]">
            Your Shopping Cart & Checkout
          </h1>
          <p className="font-sans text-xs sm:text-sm text-[#69726d] mt-1.5 sm:mt-2">
            Inspect your tailored selections and complete delivery details with open-box verification.
          </p>
        </div>

        {items.length === 0 && !orderConfirmed ? (
          <div className="p-8 sm:p-16 bg-white border border-[#deddd3] text-center space-y-4">
            <h3 className="font-serif text-xl sm:text-2xl text-[#073a2d]">Your Cart is Currently Empty</h3>
            <p className="font-sans text-xs text-[#69726d] max-w-sm mx-auto">
              Please select pieces from our Panjabi, Shirt, or Polo collection to initiate checkout.
            </p>
            <Link
              href="/shop"
              className={cn(
                buttonVariants({ variant: 'default' }),
                'bg-[#073a2d] hover:bg-[#0d4d3b] text-white font-sans text-xs uppercase tracking-widest px-8 h-10 inline-flex items-center justify-center'
              )}
            >
              Browse Atelier
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12">
            {/* Left Form Canvas (7 Cols) */}
            <form onSubmit={handleSubmitOrder} className="lg:col-span-7 space-y-6 sm:space-y-10">
              {/* Step 1: Cart Items Review */}
              <div className="bg-white border border-[#deddd3] p-4 sm:p-6 shadow-xs">
                <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-[#deddd3] mb-4 sm:mb-5">
                  <h3 className="font-serif text-base sm:text-lg font-semibold text-[#073a2d] flex items-center gap-2">
                    <span className="w-5.5 h-5.5 sm:w-6 sm:h-6 rounded-full bg-[#073a2d] text-white text-xs flex items-center justify-center font-sans font-bold">
                      1
                    </span>
                    <span>Review Cart Items ({items.length})</span>
                  </h3>
                  <Link href="/shop" className="text-xs font-sans text-[#c79a45] hover:underline font-semibold">
                    + Add More Items
                  </Link>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  {items.map((item, idx) => {
                    const itemKey = getItemKey(item.product.id, item.selectedSize, item.selectedColor);
                    const isUpdating = updatingKey === itemKey;
                    const isRemoving = removingKey === itemKey;
                    const isItemBusy = isUpdating || isRemoving || isSubmitting;

                    return (
                      <div
                        key={`${item.product.id}-${item.selectedSize}-${idx}`}
                        className="flex gap-3 sm:gap-4 p-2.5 sm:p-3 bg-[#fbf9f2] border border-[#deddd3]"
                      >
                        <div className="w-16 h-20 sm:w-20 sm:h-24 bg-white overflow-hidden shrink-0">
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between">
                              <h4 className="font-serif text-sm font-semibold text-[#073a2d]">
                                {item.product.name}
                              </h4>
                              <button
                                type="button"
                                disabled={isItemBusy}
                                onClick={() =>
                                  handleRemoveItem(item.product.id, item.selectedSize, item.selectedColor)
                                }
                                aria-label="Remove item"
                                aria-busy={isRemoving ? 'true' : undefined}
                                className="text-[#717975] hover:text-[#ba1a1a] disabled:opacity-50 cursor-pointer disabled:cursor-wait"
                              >
                                {isRemoving ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#ba1a1a]" />
                                ) : (
                                  <Trash2 className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                            <p className="text-xs text-[#69726d] font-sans mt-0.5">
                              Size: <strong>{item.selectedSize}</strong> | Color:{' '}
                              <strong>{item.selectedColor}</strong>
                            </p>
                          </div>

                          <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#deddd3]/60">
                            {/* Qty */}
                            <div className="flex items-center border border-[#deddd3] bg-white">
                              <button
                                type="button"
                                disabled={isItemBusy}
                                onClick={() =>
                                  handleUpdateQuantity(
                                    item.product.id,
                                    item.selectedSize,
                                    item.selectedColor,
                                    item.quantity - 1
                                  )
                                }
                                className="w-6 h-6 flex items-center justify-center text-xs disabled:opacity-50 cursor-pointer disabled:cursor-wait"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-7 text-center text-xs font-bold tabular-nums flex items-center justify-center">
                                {isUpdating ? (
                                  <Loader2 className="w-3 h-3 animate-spin text-[#073a2d]" />
                                ) : (
                                  item.quantity
                                )}
                              </span>
                              <button
                                type="button"
                                disabled={isItemBusy}
                                onClick={() =>
                                  handleUpdateQuantity(
                                    item.product.id,
                                    item.selectedSize,
                                    item.selectedColor,
                                    item.quantity + 1
                                  )
                                }
                                className="w-6 h-6 flex items-center justify-center text-xs disabled:opacity-50 cursor-pointer disabled:cursor-wait"
                                aria-label="Increase quantity"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            <span className="font-sans font-bold text-sm text-[#073a2d] tabular-nums">
                              ৳{(item.product.price * item.quantity).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order Summary on Mobile: shown right after products on mobile devices */}
              <div className="block lg:hidden">
                {renderOrderSummary(true)}
              </div>

              {/* Step 2: Delivery Details */}
              <div className="bg-white border border-[#deddd3] p-6 shadow-xs">
                <div className="pb-4 border-b border-[#deddd3] mb-5">
                  <h3 className="font-serif text-lg font-semibold text-[#073a2d] flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#073a2d] text-white text-xs flex items-center justify-center font-sans font-bold">
                      2
                    </span>
                    <span>Delivery Address</span>
                  </h3>
                  <p className="font-sans text-[11px] text-[#717975] mt-1">
                    Select your administrative Division, District, and Thana/Upazila for verified doorstep delivery across Bangladesh.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                  {/* Recipient Full Name */}
                  <div>
                    <label className="block uppercase tracking-wider text-[#404945] font-semibold mb-1">
                      Recipient Full Name *
                    </label>
                    <Input
                      required
                      placeholder="e.g. Shahariyar Ahmed"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="bg-[#fbf9f2] rounded-none border-[#deddd3]"
                    />
                  </div>

                  {/* Mobile Number */}
                  <div>
                    <label className="block uppercase tracking-wider text-[#404945] font-semibold mb-1">
                      Mobile Number (+880) *
                    </label>
                    <Input
                      required
                      placeholder="01XXXXXXXXX"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="bg-[#fbf9f2] rounded-none border-[#deddd3]"
                    />
                  </div>

                  {/* Division Dropdown */}
                  <div>
                    <label className="block uppercase tracking-wider text-[#404945] font-semibold mb-1">
                      Division *
                    </label>
                    <select
                      value={formData.division}
                      onChange={(e) => handleDivisionChange(e.target.value)}
                      className="w-full h-9 px-3 bg-[#fbf9f2] border border-[#deddd3] text-xs font-sans text-[#1b1c18] focus:outline-none focus:border-[#073a2d]"
                    >
                      <option value="">Select Division</option>
                      {BANGLADESH_DIVISIONS.map((d) => (
                        <option key={d.name} value={d.name}>
                          {d.name} Division
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* District Dropdown (Cascades based on Division) */}
                  <div>
                    <label className="block uppercase tracking-wider text-[#404945] font-semibold mb-1">
                      District (Zilla) *
                    </label>
                    <select
                      value={formData.district}
                      disabled={!formData.division}
                      onChange={(e) => handleDistrictChange(e.target.value)}
                      className="w-full h-9 px-3 bg-[#fbf9f2] border border-[#deddd3] text-xs font-sans text-[#1b1c18] focus:outline-none focus:border-[#073a2d] disabled:opacity-50 disabled:bg-[#f0eee7] disabled:cursor-not-allowed"
                    >
                      <option value="">
                        {formData.division ? 'Select District (Zilla)' : 'Select Division first'}
                      </option>
                      {availableDistricts.map((dist) => (
                        <option key={dist.name} value={dist.name}>
                          {dist.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Thana / Upazila Dropdown (Cascades based on District) */}
                  <div>
                    <label className="block uppercase tracking-wider text-[#404945] font-semibold mb-1">
                      Thana / Upazila *
                    </label>
                    <select
                      value={formData.thana}
                      disabled={!formData.district}
                      onChange={(e) => setFormData({ ...formData, thana: e.target.value })}
                      className="w-full h-9 px-3 bg-[#fbf9f2] border border-[#deddd3] text-xs font-sans text-[#1b1c18] focus:outline-none focus:border-[#073a2d] disabled:opacity-50 disabled:bg-[#f0eee7] disabled:cursor-not-allowed"
                    >
                      <option value="">
                        {formData.district ? 'Select Thana / Upazila' : 'Select District first'}
                      </option>
                      {availableThanas.map((thana) => (
                        <option key={thana} value={thana}>
                          {thana}
                        </option>
                      ))}
                      {Boolean(formData.district) && (
                        <option value="OTHER">Other / Specify area...</option>
                      )}
                    </select>
                  </div>

                  {/* Email Address */}
                  <div>
                    <label className="block uppercase tracking-wider text-[#404945] font-semibold mb-1">
                      Email Address (Optional)
                    </label>
                    <Input
                      type="email"
                      placeholder="For order tracking receipt"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="bg-[#fbf9f2] rounded-none border-[#deddd3]"
                    />
                  </div>

                  {/* Custom Thana field if OTHER is selected */}
                  {formData.thana === 'OTHER' && (
                    <div className="sm:col-span-2">
                      <label className="block uppercase tracking-wider text-[#404945] font-semibold mb-1">
                        Specify Your Thana / Sub-district *
                      </label>
                      <Input
                        required
                        placeholder="e.g. Specific police station, cantonment, or local upazila"
                        value={formData.customThana}
                        onChange={(e) => setFormData({ ...formData, customThana: e.target.value })}
                        className="bg-[#fbf9f2] rounded-none border-[#deddd3]"
                      />
                    </div>
                  )}

                  {/* Street Address */}
                  <div className="sm:col-span-2">
                    <label className="block uppercase tracking-wider text-[#404945] font-semibold mb-1">
                      Street Address, House No &amp; Road *
                    </label>
                    <Input
                      required
                      placeholder="House No, Road No, Flat / Holding, Landmark (e.g. House 14, Road 7, Block C)"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="bg-[#fbf9f2] rounded-none border-[#deddd3]"
                    />
                  </div>

                  {/* Postal Code */}
                  <div>
                    <label className="block uppercase tracking-wider text-[#404945] font-semibold mb-1">
                      Postal Code (Optional)
                    </label>
                    <Input
                      placeholder="e.g. 1212"
                      value={formData.postalCode}
                      onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                      className="bg-[#fbf9f2] rounded-none border-[#deddd3]"
                    />
                  </div>

                  {/* Special Tailoring / Delivery Note */}
                  <div>
                    <label className="block uppercase tracking-wider text-[#404945] font-semibold mb-1">
                      Special Tailoring / Delivery Note
                    </label>
                    <Input
                      placeholder="e.g. Need sleeve altered by 0.5 inch, or leave with concierge"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="bg-[#fbf9f2] rounded-none border-[#deddd3]"
                    />
                  </div>
                </div>
              </div>

              {/* Step 3: Payment Method */}
              <div className="bg-white border border-[#deddd3] p-6 shadow-xs">
                <div className="pb-4 border-b border-[#deddd3] mb-5">
                  <h3 className="font-serif text-lg font-semibold text-[#073a2d] flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#073a2d] text-white text-xs flex items-center justify-center font-sans font-bold">
                      3
                    </span>
                    <span>Payment Method</span>
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* COD */}
                  <label
                    className="p-4 border flex items-start gap-3 border-[#073a2d] bg-[#f0eee7]"
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked
                      readOnly
                      className="mt-0.5 accent-[#073a2d]"
                    />
                    <div>
                      <div className="flex items-center gap-1.5 font-sans font-bold text-xs uppercase text-[#073a2d]">
                        <Banknote className="w-4 h-4 text-[#073a2d]" />
                        <span>Cash On Delivery</span>
                      </div>
                      <p className="text-[11px] text-[#69726d] mt-1 font-sans">
                        Pay upon parcel arrival with 100% open-box visual inspection guarantee.
                      </p>
                    </div>
                  </label>

                </div>
                <p className="mt-4 text-xs text-[#69726d]">
                  Online payments are not available yet. Cash on delivery is the currently supported method.
                </p>
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <Button
                  type="submit"
                  loading={isSubmitting}
                  loadingText="PLACING ORDER..."
                  disabled={isSubmitting}
                  className="w-full h-14 bg-[#073a2d] hover:bg-[#0d4d3b] text-[#fbf9f2] font-sans uppercase tracking-[0.18em] text-xs font-bold shadow-lg cursor-pointer"
                >
                  {`Place Order - ৳${effectiveGrandTotal.toLocaleString()}`}
                </Button>
              </div>

              {/* Mobile Concierge Card */}
              <div className="block lg:hidden pt-2">
                {renderConciergeCard()}
              </div>
            </form>

            {/* Right Summary Sidebar (5 Cols - Desktop only) */}
            <div className="hidden lg:block lg:col-span-5 space-y-6">
              {renderOrderSummary(false)}
              {renderConciergeCard()}
            </div>
          </div>
        )}
      </div>

      {/* Order Confirmation Modal */}
      <Dialog open={orderConfirmed} onOpenChange={setOrderConfirmed}>
        <DialogContent className="max-w-md p-8 bg-[#fbf9f2] border border-[#073a2d] text-center space-y-4">
          <div className="w-16 h-16 mx-auto flex items-center justify-center">
            <img src="/logo.svg" alt="Rongin Libas Logo" className="w-16 h-16 object-contain" />
          </div>

          <DialogHeader className="space-y-1">
            <span className="text-[11px] font-sans font-semibold uppercase tracking-[0.25em] text-[#c79a45]">
              Order Confirmed
            </span>
            <DialogTitle className="font-serif text-2xl text-[#073a2d]">
              Shukriya for Honoring Us
            </DialogTitle>
            <DialogDescription className="font-sans text-xs text-[#69726d]">
              Your order has been recorded in the atelier ledger under reference:
            </DialogDescription>
          </DialogHeader>

          <div className="p-3 bg-white border border-[#deddd3] text-sm font-mono font-bold text-[#073a2d]">
            {orderId}
          </div>

          <p className="text-xs font-sans text-[#404945] leading-relaxed">
            Our atelier dispatch team will contact you at <strong>{formData.phone || 'your mobile'}</strong> before departure for seamless delivery to {formData.division || 'your city'}.
          </p>

          <div className="pt-4 flex flex-col gap-2">
            <Button
              onClick={() => {
                setOrderConfirmed(false);
                router.push('/shop');
              }}
              className="w-full bg-[#073a2d] hover:bg-[#0d4d3b] text-white font-sans uppercase tracking-wider text-xs h-11"
            >
              Continue Exploring
            </Button>
            <a
              href={`/track-order?id=${encodeURIComponent(orderId)}${trackingToken ? `&phone=${encodeURIComponent(formData.phone)}&trackingToken=${encodeURIComponent(trackingToken)}` : ''}`}
              className="text-xs font-sans text-[#073a2d] hover:underline py-2"
            >
              Track this order
            </a>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
