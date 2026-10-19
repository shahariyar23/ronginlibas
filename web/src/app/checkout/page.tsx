'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { getWhatsAppUrl, useStorefront } from '@/context/StorefrontContext';
import {
  apiRequest,
  getCustomerAddresses,
  CustomerAddress,
  initiateUddoktaPaymentApi,
  cancelOrderApi,
} from '@/lib/api';
import { analytics } from '@/lib/analytics/client';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { OrderConfirmationModal } from '@/components/orders/OrderConfirmationModal';
import {
  ShieldCheck,
  PhoneCall,
  Truck,
  Plus,
  Minus,
  Trash2,
  Tag,
  CreditCard,
  Banknote,
  Smartphone,
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  Loader2,
  MapPin,
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
    cartId,
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

  // Track checkout initiation once items are present
  React.useEffect(() => {
    if (items.length > 0) {
      analytics.trackBeginCheckout({
        pagePath: '/checkout',
        value: total,
        currency: 'BDT',
        coupon: appliedCoupon || undefined,
        items: items.map((i) => ({
          item_id: i.product.id,
          item_name: i.product.name,
          item_category: i.product.categoryLabel,
          item_variant: `${i.selectedSize} / ${i.selectedColor}`,
          price: i.product.price,
          quantity: i.quantity,
          currency: 'BDT',
        })),
      });
    }
  }, [items.length > 0]);

  const syncCartContact = React.useCallback(
    async (emailVal?: string, phoneVal?: string, nameVal?: string) => {
      if (!cartId) return;
      const targetEmail = (emailVal !== undefined ? emailVal : formData.email)?.trim();
      const targetPhone = (phoneVal !== undefined ? phoneVal : formData.phone)?.replace(/\s/g, '');
      const targetName = (nameVal !== undefined ? nameVal : formData.fullName)?.trim();
      if (!targetEmail && !targetPhone && !targetName) return;
      try {
        await apiRequest('/cart/contact', {
          method: 'PATCH',
          body: JSON.stringify({
            cartId,
            email: targetEmail || undefined,
            phone: targetPhone || undefined,
            name: targetName || undefined,
          }),
        });
      } catch {
        // Non-blocking sync
      }
    },
    [cartId, formData.email, formData.phone, formData.fullName],
  );

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'COD' | 'UDDOKTAPAY'>('COD');
  const [couponInput, setCouponInput] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [updatingKey, setUpdatingKey] = useState<string | null>(null);
  const [removingKey, setRemovingKey] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gatewayCheckoutUrl, setGatewayCheckoutUrl] = useState<string | null>(null);
  const [isRedirectingToGateway, setIsRedirectingToGateway] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [orderStatus, setOrderStatus] = useState('Pending Confirmation');
  const [trackingToken, setTrackingToken] = useState('');
  const [savedAddresses, setSavedAddresses] = useState<CustomerAddress[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | 'new' | null>(null);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const sp = new URLSearchParams(window.location.search);
      if (sp.get('previewModal') === 'true') {
        setOrderId('RL45813971D3D4');
        setOrderStatus('Pending Confirmation');
        setOrderConfirmed(true);
      }
    }
  }, []);

  const applyAddressToForm = React.useCallback(
    (addr: CustomerAddress) => {
      const addrDivision = addr.division || '';
      const addrCity = addr.city || '';
      const districts = addrDivision ? getDistrictsByDivision(addrDivision) : [];
      const matchedDistrict = districts.find(
        (d) => d.name.toLowerCase() === addrCity.toLowerCase(),
      );
      const districtName = matchedDistrict ? matchedDistrict.name : addrCity;

      setFormData((prev) => ({
        ...prev,
        fullName: addr.fullName || user?.name || prev.fullName || '',
        phone: addr.phone || user?.phone || prev.phone || '',
        email: addr.email || user?.email || prev.email || '',
        division: addrDivision,
        district: districtName,
        thana: addr.area || '',
        customThana: '',
        address: addr.addressLine1 || '',
        postalCode: addr.postalCode || '',
        notes: addr.deliveryInstructions || prev.notes || '',
      }));
    },
    [user],
  );

  React.useEffect(() => {
    const handlePageShow = async () => {
      // Check if user returned from gateway via window.history.back() or cross icon
      const pendingOrderId = sessionStorage.getItem('rl_last_order_id');
      const pendingPhone = sessionStorage.getItem('rl_last_phone') || '';
      const pendingTrackingToken = sessionStorage.getItem('rl_last_tracking_token') || '';

      if (pendingOrderId) {
        sessionStorage.removeItem('rl_last_order_id');
        sessionStorage.removeItem('rl_last_order_uuid');
        sessionStorage.removeItem('rl_last_phone');
        sessionStorage.removeItem('rl_last_tracking_token');
        setIsRedirectingToGateway(false);
        setIsSubmitting(false);

        try {
          await cancelOrderApi(pendingOrderId, {
            phone: pendingPhone,
            trackingToken: pendingTrackingToken || undefined,
          });
          toast.info('Payment was cancelled or closed. Your bag has been kept intact.');
        } catch {
          // ignore
        }
      }
    };

    window.addEventListener('pageshow', handlePageShow);
    void handlePageShow();

    return () => {
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, []);

  React.useEffect(() => {
    if (!user) {
      setSavedAddresses([]);
      setSelectedAddressId('new');
      return;
    }

    let isMounted = true;
    setIsLoadingAddresses(true);

    getCustomerAddresses()
      .then((addrs) => {
        if (!isMounted) return;
        setSavedAddresses(addrs);

        if (addrs.length > 0) {
          // Pre-select the default address if available, or first saved address
          const defaultAddr = addrs.find((a) => a.isDefault) || addrs[0];
          setSelectedAddressId(defaultAddr.id);
          applyAddressToForm(defaultAddr);
        } else {
          setSelectedAddressId('new');
          const userDivision = user.address?.division || '';
          const userCity = user.address?.city || '';
          const districts = userDivision ? getDistrictsByDivision(userDivision) : [];
          const matchedDistrict = districts.find(
            (d) => d.name.toLowerCase() === userCity.toLowerCase(),
          );
          const districtName = matchedDistrict ? matchedDistrict.name : userCity;

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
        }
      })
      .catch((err) => {
        console.warn('Could not load saved addresses:', err);
        if (isMounted) setSelectedAddressId('new');
      })
      .finally(() => {
        if (isMounted) setIsLoadingAddresses(false);
      });

    return () => {
      isMounted = false;
    };
  }, [user, applyAddressToForm]);

  const handleSelectSavedAddress = (addr: CustomerAddress) => {
    setSelectedAddressId(addr.id);
    applyAddressToForm(addr);
  };

  const handleSelectNewAddress = () => {
    setSelectedAddressId('new');
    setFormData((prev) => ({
      ...prev,
      fullName: user?.name || prev.fullName || '',
      phone: user?.phone || prev.phone || '',
      email: user?.email || prev.email || '',
      division: '',
      district: '',
      thana: '',
      customThana: '',
      address: '',
      postalCode: '',
    }));
  };

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

    if (!formData.email?.trim()) {
      toast.error('Please enter your email address to receive order confirmation and tracking updates.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      toast.error('Please enter a valid email address.');
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

    const recipientEmail = formData.email.trim().toLowerCase();

    const checkoutAnalyticsItems = items.map((i) => ({
      item_id: i.product.id,
      item_name: i.product.name,
      item_category: i.product.categoryLabel,
      item_variant: `${i.selectedSize} / ${i.selectedColor}`,
      price: i.product.price,
      quantity: i.quantity,
      currency: 'BDT',
    }));

    analytics.trackAddShippingInfo({
      pagePath: '/checkout',
      currency: 'BDT',
      value: total,
      shippingTier: formData.division === 'DHAKA' ? 'Dhaka Express (48h)' : 'Nationwide Courier',
      items: checkoutAnalyticsItems,
    });

    analytics.trackAddPaymentInfo({
      pagePath: '/checkout',
      currency: 'BDT',
      value: total,
      paymentType: selectedPaymentMethod,
      items: checkoutAnalyticsItems,
    });

    setIsSubmitting(true);
    try {
      const order = await apiRequest<{
        id: string;
        orderNumber: string;
        guestTrackingToken?: string;
        status?: string;
      }>('/orders', {
        method: 'POST',
        body: JSON.stringify({
          items: orderItems,
          shippingAddress: {
            fullName: formData.fullName.trim(),
            phone: formData.phone.replace(/\s/g, ''),
            email: recipientEmail,
            division: formData.division,
            city: formData.district,
            area: effectiveThana,
            addressLine1: formData.address.trim(),
            postalCode: formData.postalCode.trim() || undefined,
            deliveryInstructions: formData.notes || undefined,
          },
          paymentMethod: selectedPaymentMethod,
          couponCode: appliedCoupon || undefined,
          customerNotes: formData.notes || undefined,
          guestName: formData.fullName.trim(),
          guestEmail: recipientEmail,
        }),
      });

      setOrderId(order.orderNumber);
      setTrackingToken(order.guestTrackingToken || '');
      if (order.status) {
        setOrderStatus(order.status);
      }

      // Only track purchase if the order state is immediately confirmed (e.g. COD)
      // Pending online payments via UddoktaPay are tracked upon successful payment confirmation at /payment/result
      if (selectedPaymentMethod === 'COD') {
        analytics.trackPurchase({
          pagePath: '/checkout',
          orderId: order.id,
          orderNumber: order.orderNumber,
          currency: 'BDT',
          value: total,
          deliveryCharge: shippingFee,
          coupon: appliedCoupon || undefined,
          paymentMethod: selectedPaymentMethod,
          items: items.map((i) => ({
            item_id: i.product.id,
            item_name: i.product.name,
            item_category: i.product.categoryLabel,
            item_variant: `${i.selectedSize} / ${i.selectedColor}`,
            price: i.product.price,
            quantity: i.quantity,
            currency: 'BDT',
          })),
        });
      } else if (selectedPaymentMethod === 'UDDOKTAPAY') {
        try {
          sessionStorage.setItem(
            `rl_pending_order_items_${order.orderNumber}`,
            JSON.stringify(
              items.map((i) => ({
                item_id: i.product.id,
                item_name: i.product.name,
                item_category: i.product.categoryLabel,
                item_variant: `${i.selectedSize} / ${i.selectedColor}`,
                price: i.product.price,
                quantity: i.quantity,
                currency: 'BDT',
              })),
            ),
          );
        } catch {
          // ignore
        }
      }

      if (selectedPaymentMethod === 'UDDOKTAPAY') {
        setIsRedirectingToGateway(true);
        toast.info(`Order placed! Initializing UddoktaPay checkout...`);
        try {
          const paymentSession = await initiateUddoktaPaymentApi({
            orderId: order.id,
            phone: formData.phone.replace(/\s/g, ''),
            trackingToken: order.guestTrackingToken || undefined,
          });

          const targetCheckoutUrl =
            paymentSession?.checkoutUrl || (paymentSession as any)?.data?.checkoutUrl;

          if (targetCheckoutUrl) {
            setGatewayCheckoutUrl(targetCheckoutUrl);
            try {
              sessionStorage.setItem('rl_last_order_id', order.orderNumber);
              sessionStorage.setItem('rl_last_order_uuid', order.id);
              if (order.guestTrackingToken) {
                sessionStorage.setItem('rl_last_tracking_token', order.guestTrackingToken);
              }
              sessionStorage.setItem('rl_last_phone', formData.phone.replace(/\s/g, ''));
            } catch {
              // ignore
            }

            // Attempt to open in a dedicated popup window to watch window closure
            const width = 520;
            const height = 750;
            const left = Math.max(0, window.screenX + (window.outerWidth - width) / 2);
            const top = Math.max(0, window.screenY + (window.outerHeight - height) / 2);
            let paymentWindow: Window | null = null;
            try {
              paymentWindow = window.open(
                targetCheckoutUrl,
                'UddoktaPayWindow',
                `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`,
              );
            } catch {
              paymentWindow = null;
            }

            if (paymentWindow && !paymentWindow.closed) {
              const checkClosedInterval = setInterval(async () => {
                if (paymentWindow && paymentWindow.closed) {
                  clearInterval(checkClosedInterval);
                  setIsRedirectingToGateway(false);
                  setIsSubmitting(false);
                  try {
                    await cancelOrderApi(order.orderNumber, {
                      phone: formData.phone.replace(/\s/g, ''),
                      trackingToken: order.guestTrackingToken || undefined,
                    });
                    toast.info('Payment was cancelled or closed. Your bag has been kept intact.');
                  } catch {
                    // ignore
                  }
                }
              }, 1000);
              return;
            }

            // Fallback for pop-up blockers or mobile
            try {
              window.location.href = targetCheckoutUrl;
            } catch {
              window.location.assign(targetCheckoutUrl);
            }
            return;
          }
        } catch (paymentErr: any) {
          setIsRedirectingToGateway(false);
          try {
            await cancelOrderApi(order.orderNumber, {
              phone: formData.phone.replace(/\s/g, ''),
              trackingToken: order.guestTrackingToken || undefined,
            });
          } catch {
            // ignore
          }
          toast.error(
            paymentErr?.message ||
              'Payment session could not be opened automatically. Please select another payment method or try again.',
          );
          setIsSubmitting(false);
          return;
        }
      }

      setOrderConfirmed(true);
      await clearCart(false);
      toast.success('Order created successfully!', {
        description: `Order reference ${order.orderNumber} placed. Status: Pending Confirmation.`,
      });
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
            href="/men"
            className="inline-flex items-center gap-1.5 text-xs font-sans uppercase tracking-widest text-[#717975] hover:text-[#073a2d] transition-colors mb-2 sm:mb-3"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Continue Shopping Men&apos;s Collection</span>
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
              href="/men"
              className={cn(
                buttonVariants({ variant: 'default' }),
                'bg-[#073a2d] hover:bg-[#0d4d3b] text-white font-sans text-xs uppercase tracking-widest px-8 h-10 inline-flex items-center justify-center'
              )}
            >
              Browse Men&apos;s Atelier
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12">
            {/* Left Form Canvas (7 Cols) */}
            <form onSubmit={handleSubmitOrder} className="lg:col-span-7 space-y-6 sm:space-y-10" data-clarity-mask="true">
              {/* Step 1: Cart Items Review */}
              <div className="bg-white border border-[#deddd3] p-4 sm:p-6 shadow-xs">
                <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-[#deddd3] mb-4 sm:mb-5">
                  <h3 className="font-serif text-base sm:text-lg font-semibold text-[#073a2d] flex items-center gap-2">
                    <span className="w-5.5 h-5.5 sm:w-6 sm:h-6 rounded-full bg-[#073a2d] text-white text-xs flex items-center justify-center font-sans font-bold">
                      1
                    </span>
                    <span>Review Cart Items ({items.length})</span>
                  </h3>
                  <Link href="/men" className="text-xs font-sans text-[#c79a45] hover:underline font-semibold">
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

                {/* Saved Addresses Selector (for logged-in patrons) */}
                {user && (
                  <div className="mb-6 p-4 bg-[#fbf9f2] border border-[#deddd3]">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3 border-b border-[#deddd3] gap-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[#073a2d]" />
                        <h4 className="font-serif text-sm font-bold text-[#073a2d]">
                          Saved Delivery Addresses ({savedAddresses.length}/5)
                        </h4>
                      </div>
                      <span className="text-[11px] text-[#717975]">
                        {selectedAddressId === 'new'
                          ? 'Entering custom delivery address'
                          : 'Previous/Default address active • Select another to switch'}
                      </span>
                    </div>

                    {isLoadingAddresses ? (
                      <div className="py-4 flex items-center justify-center gap-2 text-xs text-[#717975]">
                        <Loader2 className="w-4 h-4 animate-spin text-[#073a2d]" />
                        <span>Loading saved addresses...</span>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {savedAddresses.map((addr) => {
                          const isSelected = selectedAddressId === addr.id;
                          return (
                            <div
                              key={addr.id}
                              onClick={() => handleSelectSavedAddress(addr)}
                              className={cn(
                                'p-3.5 border transition-all cursor-pointer relative text-left bg-white',
                                isSelected
                                  ? 'border-[#073a2d] ring-2 ring-[#073a2d] shadow-xs'
                                  : 'border-[#deddd3] hover:border-[#c79a45]/80 hover:bg-[#faf9f5]',
                              )}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <input
                                    type="radio"
                                    name="addressOption"
                                    checked={isSelected}
                                    onChange={() => handleSelectSavedAddress(addr)}
                                    className="accent-[#073a2d] cursor-pointer"
                                  />
                                  <span className="font-serif font-bold text-[#073a2d] text-xs">
                                    {addr.fullName || user.name}
                                  </span>
                                </div>
                                {addr.isDefault && (
                                  <Badge className="bg-[#073a2d] text-[#fbf9f2] text-[9px] font-sans px-1.5 py-0 h-4 uppercase tracking-wider">
                                    DEFAULT
                                  </Badge>
                                )}
                              </div>

                              <p className="text-[11px] text-[#404945] font-sans mt-2 line-clamp-2">
                                {addr.addressLine1}
                                {addr.area ? `, ${addr.area}` : ''}
                                {addr.city ? `, ${addr.city}` : ''}
                                {addr.division ? `, ${addr.division}` : ''}
                                {addr.postalCode ? ` - ${addr.postalCode}` : ''}
                              </p>
                              <p className="text-[11px] text-[#717975] font-sans mt-1">
                                Mobile: {addr.phone}
                              </p>
                            </div>
                          );
                        })}

                        {/* Add / Use different address card */}
                        <div
                          onClick={savedAddresses.length >= 5 && selectedAddressId !== 'new' ? undefined : handleSelectNewAddress}
                          className={cn(
                            'p-3.5 border border-dashed transition-all cursor-pointer text-left flex flex-col justify-center bg-white',
                            selectedAddressId === 'new'
                              ? 'border-[#073a2d] ring-2 ring-[#073a2d] bg-[#faf9f5]'
                              : 'border-[#deddd3] hover:border-[#073a2d] hover:bg-[#faf9f5]',
                            savedAddresses.length >= 5 && selectedAddressId !== 'new' && 'opacity-60 cursor-not-allowed',
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="addressOption"
                              checked={selectedAddressId === 'new'}
                              disabled={savedAddresses.length >= 5 && selectedAddressId !== 'new'}
                              onChange={handleSelectNewAddress}
                              className="accent-[#073a2d] cursor-pointer"
                            />
                            <span className="font-serif font-bold text-[#073a2d] text-xs">
                              + Use Another Address
                            </span>
                          </div>
                          <p className="text-[11px] text-[#717975] font-sans mt-1.5">
                            {savedAddresses.length >= 5
                              ? 'Maximum 5 addresses saved. Select one or edit in profile.'
                              : 'Enter a new address below (auto-saved to your address book).'
                            }
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

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
                      onBlur={() => syncCartContact()}
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
                      onBlur={() => syncCartContact()}
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
                      Email Address *
                    </label>
                    <Input
                      type="email"
                      required
                      placeholder="e.g. yourname@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      onBlur={() => syncCartContact()}
                      className="bg-[#fbf9f2] rounded-none border-[#deddd3]"
                    />
                    <p className="text-[10px] text-[#717975] mt-1">
                      Order confirmation &amp; courier status tracking will be dispatched to this email.
                    </p>
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
                    onClick={() => setSelectedPaymentMethod('COD')}
                    className={`p-4 border flex items-start gap-3 cursor-pointer transition-all ${
                      selectedPaymentMethod === 'COD'
                        ? 'border-[#073a2d] bg-[#f0eee7]'
                        : 'border-[#deddd3] bg-white hover:border-[#073a2d]/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={selectedPaymentMethod === 'COD'}
                      onChange={() => setSelectedPaymentMethod('COD')}
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

                  {/* UddoktaPay */}
                  <label
                    onClick={() => setSelectedPaymentMethod('UDDOKTAPAY')}
                    className={`p-4 border flex items-start gap-3 cursor-pointer transition-all ${
                      selectedPaymentMethod === 'UDDOKTAPAY'
                        ? 'border-[#073a2d] bg-[#f0eee7]'
                        : 'border-[#deddd3] bg-white hover:border-[#073a2d]/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={selectedPaymentMethod === 'UDDOKTAPAY'}
                      onChange={() => setSelectedPaymentMethod('UDDOKTAPAY')}
                      className="mt-0.5 accent-[#073a2d]"
                    />
                    <div>
                      <div className="flex items-center gap-1.5 font-sans font-bold text-xs uppercase text-[#073a2d]">
                        <CreditCard className="w-4 h-4 text-[#c79a45]" />
                        <span>UddoktaPay (Cards & Mobile Banking)</span>
                      </div>
                      <p className="text-[11px] text-[#69726d] mt-1 font-sans">
                        Instant digital checkout via bKash, Nagad, Rocket, Visa, Mastercard & Internet Banking.
                      </p>
                    </div>
                  </label>

                </div>
                <div className="mt-4 flex items-center gap-2 text-xs text-[#69726d]">
                  <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Both Cash on Delivery and 256-bit encrypted Online Payments via UddoktaPay are supported.</span>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <Button
                  type="submit"
                  loading={isSubmitting}
                  loadingText={selectedPaymentMethod !== 'COD' ? 'PREPARING PAYMENT...' : 'PLACING ORDER...'}
                  disabled={isSubmitting}
                  className="w-full h-14 bg-[#073a2d] hover:bg-[#0d4d3b] text-[#fbf9f2] font-sans uppercase tracking-[0.18em] text-xs font-bold shadow-lg cursor-pointer"
                >
                  {selectedPaymentMethod !== 'COD'
                    ? `Proceed to Pay - ৳${effectiveGrandTotal.toLocaleString()}`
                    : `Place Order - ৳${effectiveGrandTotal.toLocaleString()}`}
                </Button>
                <p className="mt-2.5 text-center font-sans text-[11px] text-[#717975] leading-relaxed">
                  By placing an order, you agree to Rongin Libas&apos;s{' '}
                  <Link href="/terms" target="_blank" className="underline hover:text-[#073a2d]">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" target="_blank" className="underline hover:text-[#073a2d]">
                    Privacy Policy
                  </Link>.
                  All shipments include doorstep open-box inspection.
                </p>
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

      {/* UddoktaPay Immediate Redirect Screen */}
      {isRedirectingToGateway && (
        <div className="fixed inset-0 z-50 bg-[#073a2d]/95 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white border-2 border-[#c79a45] max-w-md w-full p-8 text-center space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 mx-auto rounded-full bg-purple-50 border-2 border-purple-600 flex items-center justify-center">
              <CreditCard className="w-8 h-8 text-purple-700 animate-pulse" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#c79a45]">
                Rongin Libas Atelier
              </span>
              <h3 className="font-serif text-2xl text-[#1b1c18]">
                Connecting to UddoktaPay
              </h3>
              <p className="text-xs text-[#717975] leading-relaxed">
                Order <strong>{orderId}</strong> created successfully. Transferring you to UddoktaPay secure gateway for cards, bKash & mobile wallets.
              </p>
            </div>

            {gatewayCheckoutUrl ? (
              <div className="pt-2 space-y-3">
                <a
                  href={gatewayCheckoutUrl}
                  className="w-full inline-flex items-center justify-center gap-2 bg-purple-700 hover:bg-purple-800 text-white font-sans uppercase tracking-wider text-xs h-12 font-bold shadow-md transition-all cursor-pointer"
                >
                  <span>Proceed to Payment Now (৳{effectiveGrandTotal.toLocaleString()})</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
                <Button
                  type="button"
                  variant="outline"
                  onClick={async () => {
                    setIsRedirectingToGateway(false);
                    setIsSubmitting(false);
                    if (orderId) {
                      try {
                        await cancelOrderApi(orderId, {
                          phone: formData.phone.replace(/\s/g, ''),
                          trackingToken: trackingToken || undefined,
                        });
                        toast.info('Payment cancelled. Your bag has been kept intact.');
                      } catch {
                        // ignore
                      }
                    }
                  }}
                  className="w-full border-red-300 text-red-700 hover:bg-red-50 text-xs font-semibold h-11 transition-colors cursor-pointer"
                >
                  Cancel Payment & Return to Bag
                </Button>
                <p className="text-[11px] text-[#717975]">
                  If your browser didn&apos;t redirect automatically, click the button above.
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 text-xs font-mono text-[#073a2d] py-3">
                <Loader2 className="w-4 h-4 animate-spin text-[#073a2d]" />
                <span>Preparing secure gateway session...</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Order Confirmation Modal */}
      <OrderConfirmationModal
        open={orderConfirmed}
        onOpenChange={setOrderConfirmed}
        orderNumber={orderId}
        orderStatus={orderStatus}
        phone={formData.phone}
        trackingToken={trackingToken}
        onContinueShopping={() => {
          setOrderConfirmed(false);
          router.push('/shop');
        }}
      />
    </div>
  );
}
