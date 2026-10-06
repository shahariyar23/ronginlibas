'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
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
} from 'lucide-react';
import { toast } from 'sonner';

export default function CheckoutPage() {
  const router = useRouter();
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

  // Form states
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    division: 'Dhaka',
    address: '',
    notes: '',
  });

  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bkash' | 'nagad' | 'card'>('cod');
  const [giftWrap, setGiftWrap] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [orderId, setOrderId] = useState('');

  const divisions = [
    'Dhaka',
    'Chattogram',
    'Sylhet',
    'Rajshahi',
    'Khulna',
    'Barishal',
    'Rangpur',
    'Mymensingh',
  ];

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    if (applyCoupon(couponInput)) {
      setCouponInput('');
    }
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      toast.error('Your sartorial bag is empty');
      return;
    }

    if (!formData.fullName.trim() || !formData.phone.trim() || !formData.address.trim()) {
      toast.error('Please complete your name, phone number, and delivery address.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const generatedId = `RL-${Math.floor(100000 + Math.random() * 900000)}`;
      setOrderId(generatedId);
      setIsSubmitting(false);
      setOrderConfirmed(true);
      clearCart();
    }, 1200);
  };

  return (
    <div className="w-full pt-28 pb-24 bg-[#fbf9f2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Breadcrumb */}
        <div className="mb-8">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-xs font-sans uppercase tracking-widest text-[#717975] hover:text-[#073a2d] transition-colors mb-3"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Continue Shopping</span>
          </Link>
          <h1 className="font-serif text-3xl sm:text-5xl font-normal text-[#073a2d]">
            Your Shopping Cart & Checkout
          </h1>
          <p className="font-sans text-xs sm:text-sm text-[#69726d] mt-2">
            Inspect your tailored selections and complete delivery details with open-box verification.
          </p>
        </div>

        {items.length === 0 && !orderConfirmed ? (
          <div className="p-16 bg-white border border-[#deddd3] text-center space-y-4">
            <h3 className="font-serif text-2xl text-[#073a2d]">Your Cart is Currently Empty</h3>
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left Form Canvas (7 Cols) */}
            <form onSubmit={handleSubmitOrder} className="lg:col-span-7 space-y-10">
              {/* Step 1: Cart Items Review */}
              <div className="bg-white border border-[#deddd3] p-6 shadow-xs">
                <div className="flex items-center justify-between pb-4 border-b border-[#deddd3] mb-5">
                  <h3 className="font-serif text-lg font-semibold text-[#073a2d] flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#073a2d] text-white text-xs flex items-center justify-center font-sans font-bold">
                      1
                    </span>
                    <span>Review Cart Items ({items.length})</span>
                  </h3>
                  <Link href="/shop" className="text-xs font-sans text-[#c79a45] hover:underline font-semibold">
                    + Add More Items
                  </Link>
                </div>

                <div className="space-y-4">
                  {items.map((item, idx) => (
                    <div
                      key={`${item.product.id}-${item.selectedSize}-${idx}`}
                      className="flex flex-col sm:flex-row gap-4 p-3 bg-[#fbf9f2] border border-[#deddd3]"
                    >
                      <div className="w-20 h-24 bg-white overflow-hidden flex-shrink-0">
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
                              onClick={() =>
                                removeFromCart(item.product.id, item.selectedSize, item.selectedColor)
                              }
                              className="text-[#717975] hover:text-[#ba1a1a]"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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
                              onClick={() =>
                                updateQuantity(
                                  item.product.id,
                                  item.selectedSize,
                                  item.selectedColor,
                                  item.quantity - 1
                                )
                              }
                              className="w-6 h-6 flex items-center justify-center text-xs"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-7 text-center text-xs font-bold tabular-nums">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(
                                  item.product.id,
                                  item.selectedSize,
                                  item.selectedColor,
                                  item.quantity + 1
                                )
                              }
                              className="w-6 h-6 flex items-center justify-center text-xs"
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
                  ))}
                </div>
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
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
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

                  <div>
                    <label className="block uppercase tracking-wider text-[#404945] font-semibold mb-1">
                      Division *
                    </label>
                    <select
                      value={formData.division}
                      onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                      className="w-full h-9 px-3 bg-[#fbf9f2] border border-[#deddd3] text-xs focus:outline-none focus:border-[#073a2d]"
                    >
                      {divisions.map((d) => (
                        <option key={d} value={d}>
                          {d} Division
                        </option>
                      ))}
                    </select>
                  </div>

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

                  <div className="sm:col-span-2">
                    <label className="block uppercase tracking-wider text-[#404945] font-semibold mb-1">
                      Street Address & Landmark *
                    </label>
                    <Input
                      required
                      placeholder="House No, Road No, Area, Thana / Postal Code"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="bg-[#fbf9f2] rounded-none border-[#deddd3]"
                    />
                  </div>

                  <div className="sm:col-span-2">
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
                    onClick={() => setPaymentMethod('cod')}
                    className={`p-4 border flex items-start gap-3 cursor-pointer transition-all ${
                      paymentMethod === 'cod'
                        ? 'border-[#073a2d] bg-[#f0eee7]'
                        : 'border-[#deddd3] bg-[#fbf9f2] hover:border-[#717975]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
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

                  {/* bKash */}
                  <label
                    onClick={() => setPaymentMethod('bkash')}
                    className={`p-4 border flex items-start gap-3 cursor-pointer transition-all ${
                      paymentMethod === 'bkash'
                        ? 'border-[#073a2d] bg-[#f0eee7]'
                        : 'border-[#deddd3] bg-[#fbf9f2] hover:border-[#717975]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'bkash'}
                      onChange={() => setPaymentMethod('bkash')}
                      className="mt-0.5 accent-[#073a2d]"
                    />
                    <div>
                      <div className="flex items-center gap-1.5 font-sans font-bold text-xs uppercase text-[#e2136e]">
                        <Smartphone className="w-4 h-4" />
                        <span>bKash Direct</span>
                      </div>
                      <p className="text-[11px] text-[#69726d] mt-1 font-sans">
                        Instant merchant transfer via bKash gateway.
                      </p>
                    </div>
                  </label>

                  {/* Nagad */}
                  <label
                    onClick={() => setPaymentMethod('nagad')}
                    className={`p-4 border flex items-start gap-3 cursor-pointer transition-all ${
                      paymentMethod === 'nagad'
                        ? 'border-[#073a2d] bg-[#f0eee7]'
                        : 'border-[#deddd3] bg-[#fbf9f2] hover:border-[#717975]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'nagad'}
                      onChange={() => setPaymentMethod('nagad')}
                      className="mt-0.5 accent-[#073a2d]"
                    />
                    <div>
                      <div className="flex items-center gap-1.5 font-sans font-bold text-xs uppercase text-[#f7941d]">
                        <Smartphone className="w-4 h-4" />
                        <span>Nagad Pay</span>
                      </div>
                      <p className="text-[11px] text-[#69726d] mt-1 font-sans">
                        Secured payment through official Nagad checkout.
                      </p>
                    </div>
                  </label>

                  {/* Cards */}
                  <label
                    onClick={() => setPaymentMethod('card')}
                    className={`p-4 border flex items-start gap-3 cursor-pointer transition-all ${
                      paymentMethod === 'card'
                        ? 'border-[#073a2d] bg-[#f0eee7]'
                        : 'border-[#deddd3] bg-[#fbf9f2] hover:border-[#717975]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                      className="mt-0.5 accent-[#073a2d]"
                    />
                    <div>
                      <div className="flex items-center gap-1.5 font-sans font-bold text-xs uppercase text-[#073a2d]">
                        <CreditCard className="w-4 h-4" />
                        <span>Credit / Debit Cards</span>
                      </div>
                      <p className="text-[11px] text-[#69726d] mt-1 font-sans">
                        Visa, Mastercard, AMEX with 3D Secure verification.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Submit CTA (Mobile / Form placement) */}
              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-14 bg-[#073a2d] hover:bg-[#0d4d3b] text-[#fbf9f2] font-sans uppercase tracking-[0.18em] text-xs font-bold shadow-lg"
                >
                  {isSubmitting ? 'Securing Sartorial Order...' : `Confirm Sartorial Order • ৳${total.toLocaleString()}`}
                </Button>
              </div>
            </form>

            {/* Right Summary Sidebar (5 Cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="p-6 bg-white border border-[#deddd3] shadow-xs space-y-5">
                <h3 className="font-serif text-lg font-semibold text-[#073a2d] pb-3 border-b border-[#deddd3]">
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
                        className="text-[11px] text-[#ba1a1a] hover:underline uppercase font-bold"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                      <Input
                        placeholder="Coupon (e.g. RONGINLAUNCH)"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        className="h-10 text-xs bg-[#fbf9f2] rounded-none border-[#deddd3]"
                      />
                      <Button
                        type="submit"
                        variant="outline"
                        className="h-10 px-4 text-xs font-sans uppercase tracking-wider border-[#073a2d] text-[#073a2d]"
                      >
                        Apply
                      </Button>
                    </form>
                  )}
                </div>

                {/* Gift Wrap Option */}
                <div className="p-3 bg-[#fbf9f2] border border-[#deddd3]">
                  <label className="flex items-center gap-3 cursor-pointer text-xs font-sans">
                    <Checkbox
                      checked={giftWrap}
                      onCheckedChange={(c) => setGiftWrap(!!c)}
                      className="rounded-none border-[#deddd3] data-[state=checked]:bg-[#073a2d]"
                    />
                    <div>
                      <span className="font-semibold text-[#073a2d]">
                        Artisanal Muslin Gift Wrap Packaging (Free)
                      </span>
                      <p className="text-[11px] text-[#717975]">
                        Tied with gilded Bengal cotton ribbons and a personalized note.
                      </p>
                    </div>
                  </label>
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

                  <div className="flex justify-between">
                    <span>Nationwide Delivery</span>
                    <span className="font-semibold tabular-nums text-[#1b1c18]">
                      {shippingFee === 0 ? (
                        <span className="text-[#073a2d] font-bold uppercase text-[10px]">
                          Free (Order &gt; ৳3,000)
                        </span>
                      ) : (
                        `৳${shippingFee}`
                      )}
                    </span>
                  </div>

                  <Separator className="my-3 bg-[#deddd3]" />

                  <div className="flex justify-between text-lg font-bold text-[#073a2d]">
                    <span className="font-serif">Grand Total</span>
                    <span className="tabular-nums">৳{total.toLocaleString()}</span>
                  </div>
                </div>

                {/* Guarantees Strip */}
                <div className="pt-4 border-t border-[#f0eee7] space-y-2.5 text-[11px] font-sans text-[#69726d]">
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

              {/* WhatsApp Human Concierge Card */}
              <div className="p-6 bg-[#073a2d] text-[#fbf9f2] border border-[#c79a45]/30 shadow-xs space-y-3">
                <span className="font-sans text-[10px] uppercase tracking-[0.25em] text-[#c79a45] font-semibold block">
                  BESPOKE ASSISTANCE
                </span>
                <h4 className="font-serif text-lg text-white">
                  Prefer Direct Human Support?
                </h4>
                <p className="font-sans text-xs text-[#c0c8c3] leading-relaxed">
                  Call or WhatsApp our Dhaka studio to confirm sizing, custom lengths, or arrange immediate urgent handover.
                </p>
                <a
                  href="https://wa.me/8801916664011?text=Hello%20Rongin%20Libas,%20I%20would%20like%20assistance%20with%20an%20order."
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-sans uppercase tracking-widest text-[#c79a45] hover:text-white font-bold pt-1"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>WhatsApp 01916664011</span>
                </a>
              </div>
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
              href={`https://wa.me/8801916664011?text=Hello%20Rongin%20Libas,%20I%20just%20placed%20order%20${orderId}.`}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-sans text-[#073a2d] hover:underline py-2"
            >
              Track on WhatsApp
            </a>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
