'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Search,
  User,
  MapPin,
  ShoppingBag,
  CreditCard,
  Truck,
  Tag,
  Percent,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Phone,
  Mail,
  ShieldCheck,
  Package,
  Layers,
  ChevronRight,
  Info,
} from 'lucide-react';
import { adminApi, CreateAdminOrderPayload, AdminCoupon } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { useAdmin } from '@/context/AdminContext';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import {
  BANGLADESH_DIVISIONS,
  getDistrictsByDivision,
  getThanasByDistrict,
} from '@/data/bangladeshGeo';

interface SelectedOrderItem {
  productId: string;
  productName: string;
  productSku: string;
  variantId: string;
  variantSku: string;
  color: string;
  size: string;
  sizeLabel?: string | null;
  stock: number;
  unitPrice: number;
  quantity: number;
  image?: string;
}

interface CustomerOption {
  id: string;
  firstName: string;
  lastName?: string;
  email?: string;
  phone: string;
  addresses?: Array<{
    id: string;
    division: string;
    district: string;
    thana: string;
    streetAddress: string;
    postalCode?: string;
    isDefault?: boolean;
    name?: string;
    phone?: string;
  }>;
}

export default function CreateOrderPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { refreshData } = useAdmin();

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  // SECTION A: Customer State
  const [customerMode, setCustomerMode] = useState<'EXISTING' | 'NEW'>('EXISTING');
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [customerSearchResults, setCustomerSearchResults] = useState<CustomerOption[]>([]);
  const [isSearchingCustomers, setIsSearchingCustomers] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerOption | null>(null);

  // New Customer Fields
  const [newCustomerFirstName, setNewCustomerFirstName] = useState('');
  const [newCustomerLastName, setNewCustomerLastName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [newCustomerEmail, setNewCustomerEmail] = useState('');

  // SECTION B: Delivery Address State
  const [addressMode, setAddressMode] = useState<'SAVED' | 'NEW'>('NEW');
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [receiverName, setReceiverName] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');
  const [division, setDivision] = useState('Dhaka');
  const [district, setDistrict] = useState('Dhaka');
  const [thana, setThana] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [addressNotes, setAddressNotes] = useState('');

  // SECTION C: Products / Variants State
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [productSearchResults, setProductSearchResults] = useState<any[]>([]);
  const [isSearchingProducts, setIsSearchingProducts] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1);
  const [orderItems, setOrderItems] = useState<SelectedOrderItem[]>([]);

  // SECTION D: Pricing, Coupons & Discounts
  const [coupons, setCoupons] = useState<AdminCoupon[]>([]);
  const [isLoadingCoupons, setIsLoadingCoupons] = useState(false);
  const [selectedCouponCode, setSelectedCouponCode] = useState<string>('');
  const [appliedCoupon, setAppliedCoupon] = useState<AdminCoupon | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  const [hasManualDiscount, setHasManualDiscount] = useState(false);
  const [manualDiscountType, setManualDiscountType] = useState<'FIXED' | 'PERCENTAGE'>('FIXED');
  const [manualDiscountValue, setManualDiscountValue] = useState<number>(0);

  // SECTION E: Payment State
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'BKASH' | 'NAGAD' | 'CARD' | 'WAITMARK_PAY'>('COD');
  const [paymentStatus, setPaymentStatus] = useState<'UNPAID' | 'PAID' | 'PARTIALLY_PAID'>('UNPAID');
  const [paymentReference, setPaymentReference] = useState('');
  const [paidAmount, setPaidAmount] = useState<number>(0);

  // SECTION F: Shipping / Courier State
  const [courierProvider, setCourierProvider] = useState('Steadfast');
  const [shippingMethod, setShippingMethod] = useState('STANDARD');
  const [deliveryCharge, setDeliveryCharge] = useState<number>(80);
  const [isCustomDeliveryCharge, setIsCustomDeliveryCharge] = useState(false);

  // SECTION G: Order Source & Notes
  const [orderSource, setOrderSource] = useState<'ADMIN' | 'PHONE' | 'WHATSAPP' | 'FACEBOOK' | 'WALK_IN'>('ADMIN');
  const [customerNotes, setCustomerNotes] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  // Location helpers
  const availableDistricts = useMemo(() => getDistrictsByDivision(division), [division]);
  const availableThanas = useMemo(() => getThanasByDistrict(division, district), [division, district]);

  // Load available coupons on mount
  useEffect(() => {
    setIsLoadingCoupons(true);
    adminApi.coupons.getAll()
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setCoupons(res.data.filter((c) => c.isActive));
        }
      })
      .catch((err) => console.error('Failed to load coupons:', err))
      .finally(() => setIsLoadingCoupons(false));
  }, []);

  // Sync delivery charge when division changes (unless manual override was checked)
  useEffect(() => {
    if (!isCustomDeliveryCharge) {
      if (division.toLowerCase() === 'dhaka') {
        setDeliveryCharge(80);
      } else {
        setDeliveryCharge(130);
      }
    }
  }, [division, isCustomDeliveryCharge]);

  // Reset district and thana when division changes
  const handleDivisionChange = (newDivision: string) => {
    setDivision(newDivision);
    const districts = getDistrictsByDivision(newDivision);
    const firstDistrict = districts[0]?.name || '';
    setDistrict(firstDistrict);
    const thanas = getThanasByDistrict(newDivision, firstDistrict);
    setThana(thanas[0] || '');
  };

  const handleDistrictChange = (newDistrict: string) => {
    setDistrict(newDistrict);
    const thanas = getThanasByDistrict(division, newDistrict);
    setThana(thanas[0] || '');
  };

  // Search Customers with Debounce
  useEffect(() => {
    if (!customerSearchQuery.trim() || customerMode !== 'EXISTING') {
      setCustomerSearchResults([]);
      return;
    }
    const timer = setTimeout(() => {
      setIsSearchingCustomers(true);
      adminApi.customers.getAll({ search: customerSearchQuery.trim(), limit: 10 })
        .then((res) => {
          if (res.success && Array.isArray(res.data?.customers)) {
            setCustomerSearchResults(res.data.customers);
          } else if (res.success && Array.isArray(res.data?.items)) {
            setCustomerSearchResults(res.data.items);
          } else if (res.success && Array.isArray(res.data)) {
            setCustomerSearchResults(res.data);
          }
        })
        .catch((err) => console.error('Customer search error:', err))
        .finally(() => setIsSearchingCustomers(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [customerSearchQuery, customerMode]);

  // Customer selection handler
  const handleSelectCustomer = async (cust: CustomerOption) => {
    setSelectedCustomer(cust);
    setCustomerSearchQuery('');
    setCustomerSearchResults([]);

    // Set receiver defaults
    const fullName = [cust.firstName, cust.lastName].filter(Boolean).join(' ');
    setReceiverName(fullName);
    setReceiverPhone(cust.phone || '');

    // Fetch customer's full address list
    try {
      const fullCustRes = await adminApi.customers.getById(cust.id);
      if (fullCustRes.success && fullCustRes.data) {
        const fullCust = fullCustRes.data;
        setSelectedCustomer(fullCust);
        if (fullCust.addresses && fullCust.addresses.length > 0) {
          setAddressMode('SAVED');
          const defaultAddr = fullCust.addresses.find((a: any) => a.isDefault) || fullCust.addresses[0];
          setSelectedAddressId(defaultAddr.id);
        } else {
          setAddressMode('NEW');
        }
      }
    } catch {
      setAddressMode('NEW');
    }
  };

  // Search Products with Debounce
  useEffect(() => {
    if (!productSearchQuery.trim()) {
      setProductSearchResults([]);
      return;
    }
    const timer = setTimeout(() => {
      setIsSearchingProducts(true);
      adminApi.products.getAll({ search: productSearchQuery.trim(), limit: 10 })
        .then((res) => {
          if (res.success && Array.isArray(res.data?.items)) {
            setProductSearchResults(res.data.items);
          }
        })
        .catch((err) => console.error('Product search error:', err))
        .finally(() => setIsSearchingProducts(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [productSearchQuery]);

  // Handle selecting a product from search
  const handleSelectProduct = (prod: any) => {
    setSelectedProduct(prod);
    setProductSearchQuery('');
    setProductSearchResults([]);
    setSelectedQuantity(1);

    // Pick first available variant
    if (prod.variants && prod.variants.length > 0) {
      const activeVariant = prod.variants.find((v: any) => v.isActive !== false && v.stock > 0) || prod.variants[0];
      setSelectedVariantId(activeVariant.id);
    } else {
      setSelectedVariantId('');
    }
  };

  // Currently chosen variant object
  const currentVariant = useMemo(() => {
    if (!selectedProduct || !selectedProduct.variants) return null;
    return selectedProduct.variants.find((v: any) => v.id === selectedVariantId) || null;
  }, [selectedProduct, selectedVariantId]);

  // Add Item to Order
  const handleAddOrderItem = () => {
    if (!selectedProduct) return;
    if (!currentVariant) {
      toast.error('Please select a product variant before adding.');
      return;
    }

    if (currentVariant.stock <= 0) {
      toast.error('This variant is currently out of stock.');
      return;
    }

    if (selectedQuantity > currentVariant.stock) {
      toast.error(`Quantity cannot exceed available stock (${currentVariant.stock}).`);
      return;
    }

    // Check if already in orderItems
    const existingIndex = orderItems.findIndex((it) => it.variantId === currentVariant.id);
    if (existingIndex > -1) {
      const existing = orderItems[existingIndex];
      const newQty = existing.quantity + selectedQuantity;
      if (newQty > currentVariant.stock) {
        toast.error(`Total quantity (${newQty}) exceeds available stock (${currentVariant.stock}).`);
        return;
      }
      const updated = [...orderItems];
      updated[existingIndex] = { ...existing, quantity: newQty };
      setOrderItems(updated);
      toast.success(`Updated ${selectedProduct.name} quantity to ${newQty}.`);
    } else {
      const unitPrice =
        currentVariant.priceOverride !== undefined && currentVariant.priceOverride !== null
          ? Number(currentVariant.priceOverride)
          : Number(selectedProduct.price);

      const primaryImg =
        selectedProduct.images?.find((img: any) => img.isPrimary)?.url ||
        selectedProduct.images?.[0]?.url ||
        selectedProduct.image;

      const newItem: SelectedOrderItem = {
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        productSku: selectedProduct.sku,
        variantId: currentVariant.id,
        variantSku: currentVariant.sku,
        color: currentVariant.color || 'Standard',
        size: currentVariant.size || 'Free',
        sizeLabel: currentVariant.sizeLabel,
        stock: currentVariant.stock,
        unitPrice,
        quantity: selectedQuantity,
        image: primaryImg,
      };

      setOrderItems((prev) => [...prev, newItem]);
      toast.success(`Added ${selectedProduct.name} to order.`);
    }

    // Reset product picker
    setSelectedProduct(null);
    setSelectedVariantId('');
    setSelectedQuantity(1);
  };

  // Modify quantity of line item
  const handleUpdateItemQuantity = (variantId: string, newQty: number) => {
    if (newQty <= 0) return;
    setOrderItems((prev) =>
      prev.map((item) => {
        if (item.variantId === variantId) {
          if (newQty > item.stock) {
            toast.error(`Maximum available stock is ${item.stock}.`);
            return item;
          }
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  // Remove line item
  const handleRemoveOrderItem = (variantId: string) => {
    setOrderItems((prev) => prev.filter((it) => it.variantId !== variantId));
  };

  // Calculation of Pricing & Summary
  const subtotal = useMemo(() => {
    return orderItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  }, [orderItems]);

  // Coupon Discount
  const couponDiscount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (subtotal < Number(appliedCoupon.minimumOrderAmount || 0)) return 0;

    if (appliedCoupon.type === 'PERCENTAGE') {
      const calc = (subtotal * Number(appliedCoupon.value)) / 100;
      return Math.round(calc * 100) / 100;
    } else {
      return Math.min(Number(appliedCoupon.value), subtotal);
    }
  }, [appliedCoupon, subtotal]);

  // Manual Discount
  const manualDiscount = useMemo(() => {
    if (!hasManualDiscount || manualDiscountValue <= 0) return 0;
    const baseAfterCoupon = Math.max(0, subtotal - couponDiscount);
    if (manualDiscountType === 'PERCENTAGE') {
      const calc = (baseAfterCoupon * manualDiscountValue) / 100;
      return Math.round(calc * 100) / 100;
    } else {
      return Math.min(manualDiscountValue, baseAfterCoupon);
    }
  }, [hasManualDiscount, manualDiscountType, manualDiscountValue, subtotal, couponDiscount]);

  const totalDiscount = couponDiscount + manualDiscount;
  const grandTotal = Math.max(0, subtotal - totalDiscount + deliveryCharge);

  // Auto-fill paid amount when payment status is PAID
  useEffect(() => {
    if (paymentStatus === 'PAID') {
      setPaidAmount(grandTotal);
    }
  }, [paymentStatus, grandTotal]);

  // Apply Coupon Handler
  const handleApplyCoupon = () => {
    setCouponError(null);
    if (!selectedCouponCode.trim()) {
      setCouponError('Please enter or select a coupon code.');
      return;
    }

    const found = coupons.find(
      (c) => c.code.toUpperCase() === selectedCouponCode.trim().toUpperCase()
    );

    if (!found) {
      setCouponError('Coupon code not found or inactive.');
      return;
    }

    if (subtotal < Number(found.minimumOrderAmount || 0)) {
      setCouponError(`Minimum spend of ৳${found.minimumOrderAmount} required for this coupon.`);
      return;
    }

    setAppliedCoupon(found);
    toast.success(`Coupon ${found.code} applied!`);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setSelectedCouponCode('');
    setCouponError(null);
    toast.info('Coupon removed.');
  };

  // Final Form Validation and Submission
  const handleSubmitOrder = async () => {
    setSubmissionError(null);

    // 1. Validate customer
    if (customerMode === 'EXISTING' && !selectedCustomer) {
      setSubmissionError('Please select an existing customer or switch to "Walk-in / New Customer".');
      return;
    }

    if (customerMode === 'NEW') {
      if (!newCustomerFirstName.trim()) {
        setSubmissionError('New customer first name is required.');
        return;
      }
      if (!newCustomerPhone.trim()) {
        setSubmissionError('New customer phone number is required.');
        return;
      }
    }

    // 2. Validate items
    if (orderItems.length === 0) {
      setSubmissionError('Please add at least one product variant to the order.');
      return;
    }

    // 3. Validate address
    if (customerMode === 'EXISTING' && addressMode === 'SAVED') {
      if (!selectedAddressId) {
        setSubmissionError('Please select a saved address or enter a new delivery address.');
        return;
      }
    } else {
      if (!receiverName.trim()) {
        setSubmissionError('Receiver name is required for delivery.');
        return;
      }
      if (!receiverPhone.trim()) {
        setSubmissionError('Receiver phone number is required for delivery.');
        return;
      }
      if (!division.trim() || !district.trim() || !thana.trim() || !streetAddress.trim()) {
        setSubmissionError('Please provide complete delivery address details (Division, District, Thana, Area).');
        return;
      }
    }

    // 4. Validate payment
    if ((paymentStatus === 'PAID' || paymentStatus === 'PARTIALLY_PAID') && paidAmount <= 0) {
      setSubmissionError('Please enter the paid amount for Paid or Partially Paid status.');
      return;
    }

    // Prepare Payload
    const payload: CreateAdminOrderPayload = {
      items: orderItems.map((it) => ({
        productId: it.productId,
        variantId: it.variantId,
        productVariantId: it.variantId,
        quantity: it.quantity,
      })),
      paymentMethod,
      paymentStatus: paymentStatus === 'UNPAID' ? 'PENDING' : paymentStatus,
      paymentReference: paymentReference.trim() || undefined,
      paidAmount: paidAmount > 0 ? paidAmount : undefined,
      shippingMethod,
      courierName: courierProvider,
      courierProvider,
      deliveryCharge,
      source: orderSource,
      customerNotes: customerNotes.trim() || undefined,
      adminNotes: adminNotes.trim() || undefined,
    };

    // Customer payload
    if (customerMode === 'EXISTING' && selectedCustomer) {
      payload.customerId = selectedCustomer.id;
    } else {
      const custObj = {
        fullName: `${newCustomerFirstName} ${newCustomerLastName}`.trim(),
        firstName: newCustomerFirstName.trim(),
        lastName: newCustomerLastName.trim() || undefined,
        phoneNumber: newCustomerPhone.trim(),
        phone: newCustomerPhone.trim(),
        email: newCustomerEmail.trim() || undefined,
      };
      payload.customer = custObj;
      payload.newCustomer = custObj;
    }

    // Address payload
    if (customerMode === 'EXISTING' && addressMode === 'SAVED' && selectedAddressId) {
      payload.addressId = selectedAddressId;
    } else {
      payload.shippingAddress = {
        addressLine1: streetAddress.trim(),
        streetAddress: streetAddress.trim(),
        city: district.trim() || division.trim(),
        district: district.trim(),
        thana: thana.trim(),
        area: thana.trim(),
        division: division.trim(),
        postalCode: postalCode.trim() || undefined,
        phone: receiverPhone.trim(),
        receiverPhone: receiverPhone.trim(),
        fullName: receiverName.trim(),
        receiverName: receiverName.trim(),
        deliveryInstructions: addressNotes.trim() || undefined,
        notes: addressNotes.trim() || undefined,
      };
    }

    // Coupon
    if (appliedCoupon) {
      payload.couponCode = appliedCoupon.code;
    }

    // Manual discount
    if (hasManualDiscount && manualDiscountValue > 0) {
      payload.manualDiscountType = manualDiscountType;
      payload.manualDiscountValue = manualDiscountValue;
    }

    setIsSubmitting(true);
    try {
      const response = await adminApi.orders.create(payload);
      if (response.success && response.data) {
        toast.success(`Order #${response.data.orderNumber || response.data.id} created successfully!`);
        await refreshData();
        router.push(`/orders?orderId=${response.data.id}`);
      } else {
        const errMsg = response.error || response.message || 'Failed to create order. Please verify input.';
        setSubmissionError(errMsg);
        toast.error(errMsg);
      }
    } catch (err: any) {
      console.error('Order creation error:', err);
      const errMsg = err?.message || 'Server error occurred while creating order.';
      setSubmissionError(errMsg);
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PermissionGuard permission="MANAGE_ORDERS">
      <div className="min-h-screen bg-[#f7f5ee] pb-24 text-[#1b1c18]">
        {/* Top Header */}
        <div className="sticky top-0 z-30 border-b border-[#deddd3] bg-white/95 px-6 py-4 backdrop-blur-md shadow-xs">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/orders"
                className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#717975] hover:text-[#073a2d] transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>BACK TO ORDERS</span>
              </Link>
              <span className="text-[#deddd3]">|</span>
              <h1 className="font-serif text-2xl font-bold tracking-tight text-[#073a2d]">
                Manual Order Creation
              </h1>
              <span className="rounded-none border border-[#a1d1be] bg-[#bcedda]/40 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[#073a2d]">
                Atelier Concierge
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSubmitOrder}
                disabled={isSubmitting || orderItems.length === 0}
                className="flex items-center gap-2 bg-[#073a2d] px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-[#00231a] disabled:cursor-not-allowed disabled:opacity-50 shadow-xs"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-[#c79a45]" />
                    <span>CONFIRMING ORDER...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-[#c79a45]" />
                    <span>CREATE ORDER (৳{grandTotal.toLocaleString()})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Global Error Banner */}
        {submissionError && (
          <div className="mx-auto mt-6 max-w-7xl px-6">
            <div className="flex items-start gap-3 border border-[#ffdad6] bg-[#ffdad6]/40 p-4 text-xs text-[#ba1a1a]">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold uppercase tracking-wider">Order Creation Failed</strong>
                <p className="mt-0.5">{submissionError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Form Container */}
        <div className="mx-auto mt-6 max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Left 8 Cols: Form Sections */}
            <div className="space-y-6 lg:col-span-8">
              {/* SECTION A: CUSTOMER */}
              <div className="border border-[#deddd3] bg-white p-6 shadow-xs">
                <div className="flex items-center justify-between border-b border-[#deddd3] pb-4">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-[#073a2d]" />
                    <h2 className="font-serif text-base font-bold text-[#1b1c18]">
                      1. Customer Selection
                    </h2>
                  </div>
                  {/* Mode Toggle */}
                  <div className="flex rounded-none border border-[#deddd3] bg-[#fbf9f2] p-0.5 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setCustomerMode('EXISTING');
                        setSubmissionError(null);
                      }}
                      className={`px-3 py-1 font-bold uppercase tracking-wider transition-colors ${
                        customerMode === 'EXISTING'
                          ? 'bg-[#00231a] text-white'
                          : 'text-[#404945] hover:text-[#1b1c18]'
                      }`}
                    >
                      Existing Patron
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCustomerMode('NEW');
                        setSelectedCustomer(null);
                        setAddressMode('NEW');
                        setSubmissionError(null);
                      }}
                      className={`px-3 py-1 font-bold uppercase tracking-wider transition-colors ${
                        customerMode === 'NEW'
                          ? 'bg-[#00231a] text-white'
                          : 'text-[#404945] hover:text-[#1b1c18]'
                      }`}
                    >
                      Walk-in / New Customer
                    </button>
                  </div>
                </div>

                <div className="mt-4">
                  {customerMode === 'EXISTING' ? (
                    <div>
                      {selectedCustomer ? (
                        <div className="flex items-center justify-between border border-[#a1d1be] bg-[#bcedda]/20 p-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-serif text-sm font-bold text-[#073a2d]">
                                {[selectedCustomer.firstName, selectedCustomer.lastName]
                                  .filter(Boolean)
                                  .join(' ')}
                              </span>
                              <span className="bg-[#073a2d] px-2 py-0.5 font-mono text-[10px] text-white">
                                ID: {selectedCustomer.id.slice(0, 8)}...
                              </span>
                            </div>
                            <div className="mt-1 flex flex-wrap items-center gap-4 text-xs text-[#404945]">
                              <span className="flex items-center gap-1 font-mono">
                                <Phone className="h-3.5 w-3.5 text-[#717975]" />
                                {selectedCustomer.phone}
                              </span>
                              {selectedCustomer.email && (
                                <span className="flex items-center gap-1">
                                  <Mail className="h-3.5 w-3.5 text-[#717975]" />
                                  {selectedCustomer.email}
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCustomer(null);
                              setSelectedAddressId('');
                            }}
                            className="text-xs font-bold uppercase tracking-wider text-[#ba1a1a] hover:underline"
                          >
                            Change Customer
                          </button>
                        </div>
                      ) : (
                        <div className="relative">
                          <div className="relative">
                            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#717975]" />
                            <input
                              type="text"
                              value={customerSearchQuery}
                              onChange={(e) => setCustomerSearchQuery(e.target.value)}
                              placeholder="Search customer by full name, phone number, or email..."
                              className="w-full border border-[#deddd3] bg-[#fbf9f2] py-2.5 pl-10 pr-4 text-xs text-[#1b1c18] placeholder-[#717975] outline-hidden focus:border-[#073a2d]"
                            />
                            {isSearchingCustomers && (
                              <Loader2 className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-[#c79a45]" />
                            )}
                          </div>

                          {/* Search Dropdown */}
                          {customerSearchResults.length > 0 && (
                            <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-60 overflow-y-auto border border-[#deddd3] bg-white shadow-lg">
                              {customerSearchResults.map((cust) => (
                                <button
                                  key={cust.id}
                                  type="button"
                                  onClick={() => handleSelectCustomer(cust)}
                                  className="flex w-full items-center justify-between border-b border-[#deddd3]/40 p-3 text-left transition-colors hover:bg-[#fbf9f2]"
                                >
                                  <div>
                                    <p className="font-serif text-xs font-bold text-[#1b1c18]">
                                      {[cust.firstName, cust.lastName].filter(Boolean).join(' ')}
                                    </p>
                                    <p className="font-mono text-[11px] text-[#717975]">
                                      {cust.phone} {cust.email ? `• ${cust.email}` : ''}
                                    </p>
                                  </div>
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#073a2d]">
                                    SELECT →
                                  </span>
                                </button>
                              ))}
                            </div>
                          )}
                          <p className="mt-1.5 text-[11px] text-[#717975]">
                            Tip: Enter at least 3 digits of phone or name letters to search.
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* New Customer Fields */
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-[#404945]">
                          First Name *
                        </label>
                        <input
                          type="text"
                          value={newCustomerFirstName}
                          onChange={(e) => {
                            setNewCustomerFirstName(e.target.value);
                            setReceiverName(`${e.target.value} ${newCustomerLastName}`.trim());
                          }}
                          placeholder="e.g. Mostak"
                          className="mt-1 w-full border border-[#deddd3] bg-[#fbf9f2] p-2.5 text-xs text-[#1b1c18] outline-hidden focus:border-[#073a2d]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-[#404945]">
                          Last Name
                        </label>
                        <input
                          type="text"
                          value={newCustomerLastName}
                          onChange={(e) => {
                            setNewCustomerLastName(e.target.value);
                            setReceiverName(`${newCustomerFirstName} ${e.target.value}`.trim());
                          }}
                          placeholder="e.g. Shahariyar"
                          className="mt-1 w-full border border-[#deddd3] bg-[#fbf9f2] p-2.5 text-xs text-[#1b1c18] outline-hidden focus:border-[#073a2d]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-[#404945]">
                          Phone Number *
                        </label>
                        <input
                          type="text"
                          value={newCustomerPhone}
                          onChange={(e) => {
                            setNewCustomerPhone(e.target.value);
                            setReceiverPhone(e.target.value);
                          }}
                          placeholder="e.g. 01916664011"
                          className="mt-1 w-full border border-[#deddd3] bg-[#fbf9f2] p-2.5 text-xs text-[#1b1c18] outline-hidden focus:border-[#073a2d]"
                        />
                        <span className="text-[10px] text-[#717975]">
                          If this phone exists, order will automatically link to existing record.
                        </span>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-[#404945]">
                          Email Address (Optional)
                        </label>
                        <input
                          type="email"
                          value={newCustomerEmail}
                          onChange={(e) => setNewCustomerEmail(e.target.value)}
                          placeholder="e.g. client@example.com"
                          className="mt-1 w-full border border-[#deddd3] bg-[#fbf9f2] p-2.5 text-xs text-[#1b1c18] outline-hidden focus:border-[#073a2d]"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION B: DELIVERY ADDRESS */}
              <div className="border border-[#deddd3] bg-white p-6 shadow-xs">
                <div className="flex items-center justify-between border-b border-[#deddd3] pb-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-[#c79a45]" />
                    <h2 className="font-serif text-base font-bold text-[#1b1c18]">
                      2. Delivery Destination
                    </h2>
                  </div>

                  {selectedCustomer && selectedCustomer.addresses && selectedCustomer.addresses.length > 0 && (
                    <div className="flex rounded-none border border-[#deddd3] bg-[#fbf9f2] p-0.5 text-xs">
                      <button
                        type="button"
                        onClick={() => setAddressMode('SAVED')}
                        className={`px-3 py-1 font-bold uppercase tracking-wider transition-colors ${
                          addressMode === 'SAVED'
                            ? 'bg-[#00231a] text-white'
                            : 'text-[#404945] hover:text-[#1b1c18]'
                        }`}
                      >
                        Saved Address
                      </button>
                      <button
                        type="button"
                        onClick={() => setAddressMode('NEW')}
                        className={`px-3 py-1 font-bold uppercase tracking-wider transition-colors ${
                          addressMode === 'NEW'
                            ? 'bg-[#00231a] text-white'
                            : 'text-[#404945] hover:text-[#1b1c18]'
                        }`}
                      >
                        New Address
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  {addressMode === 'SAVED' && selectedCustomer?.addresses && selectedCustomer.addresses.length > 0 ? (
                    <div className="space-y-3">
                      {selectedCustomer.addresses.map((addr) => (
                        <label
                          key={addr.id}
                          className={`flex cursor-pointer items-start gap-3 border p-3 text-xs transition-all ${
                            selectedAddressId === addr.id
                              ? 'border-[#073a2d] bg-[#bcedda]/10 ring-1 ring-[#073a2d]'
                              : 'border-[#deddd3] bg-white hover:bg-[#fbf9f2]'
                          }`}
                        >
                          <input
                            type="radio"
                            name="savedAddress"
                            checked={selectedAddressId === addr.id}
                            onChange={() => {
                              setSelectedAddressId(addr.id);
                              if (addr.division) setDivision(addr.division);
                            }}
                            className="mt-0.5 text-[#073a2d] focus:ring-0"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[#1b1c18]">
                                {addr.name || selectedCustomer.firstName}
                              </span>
                              {addr.isDefault && (
                                <span className="bg-[#deddd3] px-1.5 py-0.2 text-[9px] font-bold uppercase text-[#404945]">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="mt-0.5 text-[#404945]">{addr.streetAddress}</p>
                            <p className="text-[11px] text-[#717975]">
                              {[addr.thana, addr.district, addr.division].filter(Boolean).join(', ')}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>
                  ) : (
                    /* New Address Fields using Bangladesh Geo Dataset */
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#404945]">
                            Receiver Name *
                          </label>
                          <input
                            type="text"
                            value={receiverName}
                            onChange={(e) => setReceiverName(e.target.value)}
                            placeholder="Recipient full name"
                            className="mt-1 w-full border border-[#deddd3] bg-[#fbf9f2] p-2.5 text-xs text-[#1b1c18] outline-hidden focus:border-[#073a2d]"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#404945]">
                            Receiver Contact Phone *
                          </label>
                          <input
                            type="text"
                            value={receiverPhone}
                            onChange={(e) => setReceiverPhone(e.target.value)}
                            placeholder="Recipient phone number"
                            className="mt-1 w-full border border-[#deddd3] bg-[#fbf9f2] p-2.5 text-xs text-[#1b1c18] outline-hidden focus:border-[#073a2d]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#404945]">
                            Division *
                          </label>
                          <select
                            value={division}
                            onChange={(e) => handleDivisionChange(e.target.value)}
                            className="mt-1 w-full border border-[#deddd3] bg-[#fbf9f2] p-2.5 text-xs text-[#1b1c18] outline-hidden focus:border-[#073a2d]"
                          >
                            {BANGLADESH_DIVISIONS.map((d) => (
                              <option key={d.name} value={d.name}>
                                {d.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#404945]">
                            District *
                          </label>
                          <select
                            value={district}
                            onChange={(e) => handleDistrictChange(e.target.value)}
                            className="mt-1 w-full border border-[#deddd3] bg-[#fbf9f2] p-2.5 text-xs text-[#1b1c18] outline-hidden focus:border-[#073a2d]"
                          >
                            {availableDistricts.map((d) => (
                              <option key={d.name} value={d.name}>
                                {d.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#404945]">
                            Thana / Upazila *
                          </label>
                          <select
                            value={thana}
                            onChange={(e) => setThana(e.target.value)}
                            className="mt-1 w-full border border-[#deddd3] bg-[#fbf9f2] p-2.5 text-xs text-[#1b1c18] outline-hidden focus:border-[#073a2d]"
                          >
                            <option value="">Select Thana / Upazila</option>
                            {availableThanas.map((t) => (
                              <option key={t} value={t}>
                                {t}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#404945]">
                            Area / Detailed Street Address *
                          </label>
                          <input
                            type="text"
                            value={streetAddress}
                            onChange={(e) => setStreetAddress(e.target.value)}
                            placeholder="House / Flat / Road / Block / Landmark"
                            className="mt-1 w-full border border-[#deddd3] bg-[#fbf9f2] p-2.5 text-xs text-[#1b1c18] outline-hidden focus:border-[#073a2d]"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#404945]">
                            Postal Code
                          </label>
                          <input
                            type="text"
                            value={postalCode}
                            onChange={(e) => setPostalCode(e.target.value)}
                            placeholder="e.g. 1216"
                            className="mt-1 w-full border border-[#deddd3] bg-[#fbf9f2] p-2.5 text-xs text-[#1b1c18] outline-hidden focus:border-[#073a2d]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-[#404945]">
                          Delivery / Gate Instructions
                        </label>
                        <input
                          type="text"
                          value={addressNotes}
                          onChange={(e) => setAddressNotes(e.target.value)}
                          placeholder="e.g. Call before delivery, leave with concierge"
                          className="mt-1 w-full border border-[#deddd3] bg-[#fbf9f2] p-2.5 text-xs text-[#1b1c18] outline-hidden focus:border-[#073a2d]"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION C: PRODUCTS & VARIANTS */}
              <div className="border border-[#deddd3] bg-white p-6 shadow-xs">
                <div className="border-b border-[#deddd3] pb-4">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4 text-[#073a2d]" />
                    <h2 className="font-serif text-base font-bold text-[#1b1c18]">
                      3. Products & Garment Variants
                    </h2>
                  </div>
                </div>

                {/* Product Search & Variant Selector Box */}
                <div className="mt-4 border border-[#deddd3] bg-[#fbf9f2] p-4">
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-[#404945]">
                    Select Product & Variant
                  </span>

                  <div className="relative mt-2">
                    <div className="relative">
                      <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#717975]" />
                      <input
                        type="text"
                        value={productSearchQuery}
                        onChange={(e) => setProductSearchQuery(e.target.value)}
                        placeholder="Search product by title, silhouette name, or SKU..."
                        className="w-full border border-[#deddd3] bg-white py-2.5 pl-10 pr-4 text-xs text-[#1b1c18] placeholder-[#717975] outline-hidden focus:border-[#073a2d]"
                      />
                      {isSearchingProducts && (
                        <Loader2 className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-[#c79a45]" />
                      )}
                    </div>

                    {/* Product Search Dropdown */}
                    {productSearchResults.length > 0 && (
                      <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-64 overflow-y-auto border border-[#deddd3] bg-white shadow-lg">
                        {productSearchResults.map((prod) => (
                          <button
                            key={prod.id}
                            type="button"
                            onClick={() => handleSelectProduct(prod)}
                            className="flex w-full items-center justify-between border-b border-[#deddd3]/40 p-3 text-left transition-colors hover:bg-[#fbf9f2]"
                          >
                            <div className="flex items-center gap-3">
                              {prod.images?.[0]?.url && (
                                <img
                                  src={prod.images[0].url}
                                  alt={prod.name}
                                  className="h-9 w-9 object-cover border border-[#deddd3]"
                                />
                              )}
                              <div>
                                <p className="font-serif text-xs font-bold text-[#1b1c18]">
                                  {prod.name}
                                </p>
                                <p className="font-mono text-[10px] text-[#717975]">
                                  SKU: {prod.sku} • ৳{Number(prod.price).toLocaleString()}
                                </p>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#073a2d]">
                              SELECT →
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Active Selected Product Form */}
                  {selectedProduct && (
                    <div className="mt-4 border-t border-[#deddd3] pt-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-serif text-sm font-bold text-[#073a2d]">
                            {selectedProduct.name}
                          </h4>
                          <span className="font-mono text-[11px] text-[#717975]">
                            Base SKU: {selectedProduct.sku}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedProduct(null);
                            setSelectedVariantId('');
                          }}
                          className="text-xs text-[#ba1a1a] hover:underline"
                        >
                          Clear
                        </button>
                      </div>

                      {/* Variant Dropdown & Stepper */}
                      <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#404945]">
                            Variant (Color & Size) *
                          </label>
                          <select
                            value={selectedVariantId}
                            onChange={(e) => setSelectedVariantId(e.target.value)}
                            className="mt-1 w-full border border-[#deddd3] bg-white p-2.5 text-xs text-[#1b1c18] outline-hidden focus:border-[#073a2d]"
                          >
                            {selectedProduct.variants?.map((v: any) => {
                              const vPrice =
                                v.priceOverride !== undefined && v.priceOverride !== null
                                  ? Number(v.priceOverride)
                                  : Number(selectedProduct.price);
                              return (
                                <option key={v.id} value={v.id} disabled={v.stock <= 0}>
                                  {v.color || 'Standard'} • Size: {v.size} (SKU: {v.sku}) — Stock: {v.stock} — ৳{vPrice.toLocaleString()} {v.stock <= 0 ? '(OUT OF STOCK)' : ''}
                                </option>
                              );
                            })}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#404945]">
                            Quantity *
                          </label>
                          <div className="mt-1 flex items-center">
                            <input
                              type="number"
                              min={1}
                              max={currentVariant?.stock || 1}
                              value={selectedQuantity}
                              onChange={(e) =>
                                setSelectedQuantity(
                                  Math.max(1, Math.min(Number(e.target.value) || 1, currentVariant?.stock || 1))
                                )
                              }
                              className="w-full border border-[#deddd3] bg-white p-2 text-center font-mono text-xs text-[#1b1c18] outline-hidden focus:border-[#073a2d]"
                            />
                            <button
                              type="button"
                              onClick={handleAddOrderItem}
                              disabled={!currentVariant || currentVariant.stock <= 0}
                              className="ml-2 flex shrink-0 items-center gap-1 bg-[#073a2d] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#00231a] disabled:opacity-50"
                            >
                              <Plus className="h-3.5 w-3.5" />
                              <span>ADD</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {currentVariant && (
                        <div className="mt-2 flex items-center gap-3 text-[11px]">
                          <span
                            className={`font-semibold ${
                              currentVariant.stock > 5 ? 'text-[#073a2d]' : 'text-[#8c6722]'
                            }`}
                          >
                            Available in inventory: <strong>{currentVariant.stock} units</strong>
                          </span>
                          <span className="text-[#717975]">•</span>
                          <span className="font-mono text-[#404945]">
                            Unit Price: ৳
                            {(
                              currentVariant.priceOverride !== undefined && currentVariant.priceOverride !== null
                                ? Number(currentVariant.priceOverride)
                                : Number(selectedProduct.price)
                            ).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Added Order Items Table */}
                <div className="mt-6">
                  <h3 className="font-serif text-sm font-bold text-[#1b1c18]">
                    Selected Items ({orderItems.length})
                  </h3>

                  {orderItems.length === 0 ? (
                    <div className="mt-3 border border-dashed border-[#deddd3] p-8 text-center text-xs text-[#717975]">
                      No garments added yet. Search and select products above to build order consignment.
                    </div>
                  ) : (
                    <div className="mt-3 overflow-x-auto border border-[#deddd3]">
                      <table className="w-full text-left text-xs">
                        <thead className="border-b border-[#deddd3] bg-[#fbf9f2] text-[10px] uppercase tracking-wider text-[#717975]">
                          <tr>
                            <th className="p-3">Garment Item</th>
                            <th className="p-3">Color / Size</th>
                            <th className="p-3 text-right">Unit Price</th>
                            <th className="p-3 text-center">Quantity</th>
                            <th className="p-3 text-right">Line Total</th>
                            <th className="p-3 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#deddd3]">
                          {orderItems.map((item) => (
                            <tr key={item.variantId} className="hover:bg-[#fbf9f2]/50">
                              <td className="p-3">
                                <div className="flex items-center gap-2.5">
                                  {item.image && (
                                    <img
                                      src={item.image}
                                      alt={item.productName}
                                      className="h-8 w-8 object-cover border border-[#deddd3]"
                                    />
                                  )}
                                  <div>
                                    <span className="font-serif font-bold text-[#1b1c18] block">
                                      {item.productName}
                                    </span>
                                    <span className="font-mono text-[10px] text-[#717975]">
                                      SKU: {item.variantSku}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="p-3">
                                <span className="font-medium text-[#404945]">
                                  {item.color} • {item.size}
                                </span>
                                <span className="block text-[10px] text-[#717975]">
                                  Stock: {item.stock}
                                </span>
                              </td>
                              <td className="p-3 text-right font-mono text-[#1b1c18]">
                                ৳{item.unitPrice.toLocaleString()}
                              </td>
                              <td className="p-3 text-center">
                                <div className="inline-flex items-center border border-[#deddd3] bg-white">
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateItemQuantity(item.variantId, item.quantity - 1)}
                                    disabled={item.quantity <= 1}
                                    className="px-2 py-1 text-[#717975] hover:bg-[#deddd3] disabled:opacity-30"
                                  >
                                    -
                                  </button>
                                  <span className="px-2.5 font-mono font-bold text-[#1b1c18]">
                                    {item.quantity}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateItemQuantity(item.variantId, item.quantity + 1)}
                                    disabled={item.quantity >= item.stock}
                                    className="px-2 py-1 text-[#717975] hover:bg-[#deddd3] disabled:opacity-30"
                                  >
                                    +
                                  </button>
                                </div>
                              </td>
                              <td className="p-3 text-right font-mono font-bold text-[#073a2d]">
                                ৳{(item.unitPrice * item.quantity).toLocaleString()}
                              </td>
                              <td className="p-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveOrderItem(item.variantId)}
                                  className="text-[#ba1a1a] hover:opacity-75"
                                  title="Remove item"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION D: PRICING, COUPONS & DISCOUNTS */}
              <div className="border border-[#deddd3] bg-white p-6 shadow-xs">
                <div className="border-b border-[#deddd3] pb-4">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-[#8c6722]" />
                    <h2 className="font-serif text-base font-bold text-[#1b1c18]">
                      4. Vouchers & Manual Concessions
                    </h2>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
                  {/* Coupon Box */}
                  <div className="border border-[#deddd3] bg-[#fbf9f2] p-4">
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-[#404945]">
                      Atelier Voucher / Coupon
                    </span>

                    {appliedCoupon ? (
                      <div className="mt-3 flex items-center justify-between border border-[#a1d1be] bg-[#bcedda]/30 p-3 text-xs">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold uppercase text-[#073a2d]">
                              {appliedCoupon.code}
                            </span>
                            <span className="bg-[#073a2d] px-1.5 py-0.2 text-[9px] font-bold text-white">
                              {appliedCoupon.type === 'PERCENTAGE'
                                ? `${appliedCoupon.value}% OFF`
                                : `৳${appliedCoupon.value} OFF`}
                            </span>
                          </div>
                          <span className="text-[10px] text-[#073a2d]">
                            Deduction: -৳{couponDiscount.toLocaleString()}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveCoupon}
                          className="text-[11px] font-bold uppercase text-[#ba1a1a] hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="mt-3">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={selectedCouponCode}
                            onChange={(e) => setSelectedCouponCode(e.target.value.toUpperCase())}
                            placeholder="Enter coupon code"
                            className="w-full border border-[#deddd3] bg-white p-2.5 font-mono text-xs uppercase text-[#1b1c18] outline-hidden focus:border-[#073a2d]"
                          />
                          <button
                            type="button"
                            onClick={handleApplyCoupon}
                            disabled={!selectedCouponCode.trim()}
                            className="bg-[#00231a] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#073a2d] disabled:opacity-50"
                          >
                            Apply
                          </button>
                        </div>
                        {couponError && (
                          <p className="mt-1 text-[11px] text-[#ba1a1a]">{couponError}</p>
                        )}
                        {coupons.length > 0 && (
                          <div className="mt-2">
                            <span className="text-[10px] text-[#717975]">Active Coupons: </span>
                            <div className="mt-1 flex flex-wrap gap-1.5">
                              {coupons.slice(0, 4).map((c) => (
                                <button
                                  key={c.id}
                                  type="button"
                                  onClick={() => setSelectedCouponCode(c.code)}
                                  className="border border-[#deddd3] bg-white px-2 py-0.5 font-mono text-[10px] font-bold text-[#073a2d] hover:bg-[#deddd3]"
                                >
                                  {c.code}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Manual Admin Concession */}
                  <div className="border border-[#deddd3] bg-[#fbf9f2] p-4">
                    <div className="flex items-center justify-between">
                      <span className="block text-[11px] font-bold uppercase tracking-wider text-[#404945]">
                        Manual Staff Concession
                      </span>
                      <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          checked={hasManualDiscount}
                          onChange={(e) => setHasManualDiscount(e.target.checked)}
                          className="text-[#073a2d] focus:ring-0"
                        />
                        <span className="text-[11px] font-semibold text-[#1b1c18]">Enable</span>
                      </label>
                    </div>

                    {hasManualDiscount ? (
                      <div className="mt-3 space-y-3">
                        <div className="flex rounded-none border border-[#deddd3] bg-white p-0.5 text-xs">
                          <button
                            type="button"
                            onClick={() => setManualDiscountType('FIXED')}
                            className={`flex-1 py-1 font-bold uppercase tracking-wider ${
                              manualDiscountType === 'FIXED'
                                ? 'bg-[#00231a] text-white'
                                : 'text-[#404945]'
                            }`}
                          >
                            Fixed (৳)
                          </button>
                          <button
                            type="button"
                            onClick={() => setManualDiscountType('PERCENTAGE')}
                            className={`flex-1 py-1 font-bold uppercase tracking-wider ${
                              manualDiscountType === 'PERCENTAGE'
                                ? 'bg-[#00231a] text-white'
                                : 'text-[#404945]'
                            }`}
                          >
                            Percentage (%)
                          </button>
                        </div>

                        <div>
                          <input
                            type="number"
                            min={0}
                            value={manualDiscountValue}
                            onChange={(e) => setManualDiscountValue(Math.max(0, Number(e.target.value) || 0))}
                            placeholder={manualDiscountType === 'FIXED' ? 'Amount in ৳' : 'Discount in %'}
                            className="w-full border border-[#deddd3] bg-white p-2.5 font-mono text-xs text-[#1b1c18] outline-hidden focus:border-[#073a2d]"
                          />
                          <span className="mt-1 block text-[10px] text-[#717975]">
                            Deduction: -৳{manualDiscount.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="mt-3 text-[11px] italic text-[#717975]">
                        Enable to grant a bespoke fixed or percentage discount for VIP patrons or corporate clients.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* SECTION E: PAYMENT & SHIPPING */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Payment Card */}
                <div className="border border-[#deddd3] bg-white p-6 shadow-xs">
                  <div className="border-b border-[#deddd3] pb-3">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-[#073a2d]" />
                      <h2 className="font-serif text-base font-bold text-[#1b1c18]">
                        5. Payment Method & Status
                      </h2>
                    </div>
                  </div>

                  <div className="mt-4 space-y-4">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#404945]">
                        Payment Channel *
                      </label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value as any)}
                        className="mt-1 w-full border border-[#deddd3] bg-[#fbf9f2] p-2.5 text-xs text-[#1b1c18] outline-hidden focus:border-[#073a2d]"
                      >
                        <option value="COD">Cash on Delivery (COD)</option>
                        <option value="WAITMARK_PAY">Waitmark Pay (Online Gateway)</option>
                        <option value="BKASH">bKash (MFS / Merchant)</option>
                        <option value="NAGAD">Nagad (MFS)</option>
                        <option value="CARD">Credit / Debit Card</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#404945]">
                        Payment Status *
                      </label>
                      <select
                        value={paymentStatus}
                        onChange={(e) => setPaymentStatus(e.target.value as any)}
                        className="mt-1 w-full border border-[#deddd3] bg-[#fbf9f2] p-2.5 text-xs text-[#1b1c18] outline-hidden focus:border-[#073a2d]"
                      >
                        <option value="UNPAID">Unpaid (Awaiting settlement / COD)</option>
                        <option value="PAID">Paid (Prepaid in full)</option>
                        <option value="PARTIALLY_PAID">Partially Paid</option>
                      </select>
                    </div>

                    {(paymentStatus === 'PAID' || paymentStatus === 'PARTIALLY_PAID') && (
                      <div className="space-y-3 border-t border-[#deddd3] pt-3">
                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#404945]">
                            Transaction ID / Reference
                          </label>
                          <input
                            type="text"
                            value={paymentReference}
                            onChange={(e) => setPaymentReference(e.target.value)}
                            placeholder="e.g. TRX99818274 or bKash TrxID"
                            className="mt-1 w-full border border-[#deddd3] bg-[#fbf9f2] p-2.5 font-mono text-xs text-[#1b1c18] outline-hidden focus:border-[#073a2d]"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#404945]">
                            Paid Amount (৳) *
                          </label>
                          <input
                            type="number"
                            min={1}
                            value={paidAmount}
                            onChange={(e) => setPaidAmount(Math.max(0, Number(e.target.value) || 0))}
                            placeholder="Amount paid"
                            className="mt-1 w-full border border-[#deddd3] bg-[#fbf9f2] p-2.5 font-mono text-xs text-[#1b1c18] outline-hidden focus:border-[#073a2d]"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Shipping & Courier Card */}
                <div className="border border-[#deddd3] bg-white p-6 shadow-xs">
                  <div className="border-b border-[#deddd3] pb-3">
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-[#c79a45]" />
                      <h2 className="font-serif text-base font-bold text-[#1b1c18]">
                        6. Courier & Dispatch
                      </h2>
                    </div>
                  </div>

                  <div className="mt-4 space-y-4">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#404945]">
                        Courier Provider
                      </label>
                      <select
                        value={courierProvider}
                        onChange={(e) => setCourierProvider(e.target.value)}
                        className="mt-1 w-full border border-[#deddd3] bg-[#fbf9f2] p-2.5 text-xs text-[#1b1c18] outline-hidden focus:border-[#073a2d]"
                      >
                        <option value="Steadfast">Steadfast Courier (Recommended)</option>
                        <option value="Pathao">Pathao Logistics</option>
                        <option value="REDX">REDX Delivery</option>
                        <option value="eCourier">eCourier</option>
                        <option value="Paperfly">Paperfly</option>
                        <option value="Atelier Concierge">Atelier In-house Concierge</option>
                      </select>
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-[#404945]">
                          Delivery Fee (৳)
                        </label>
                        <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isCustomDeliveryCharge}
                            onChange={(e) => setIsCustomDeliveryCharge(e.target.checked)}
                            className="text-[#073a2d] focus:ring-0"
                          />
                          <span className="text-[10px] text-[#717975]">Override Fee</span>
                        </label>
                      </div>

                      <input
                        type="number"
                        min={0}
                        disabled={!isCustomDeliveryCharge}
                        value={deliveryCharge}
                        onChange={(e) => setDeliveryCharge(Math.max(0, Number(e.target.value) || 0))}
                        className="mt-1 w-full border border-[#deddd3] bg-[#fbf9f2] p-2.5 font-mono text-xs text-[#1b1c18] outline-hidden focus:border-[#073a2d] disabled:opacity-75"
                      />
                      <span className="mt-1 block text-[10px] text-[#717975]">
                        Default: ৳80 Inside Dhaka, ৳130 Nationwide outside Dhaka.
                      </span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#404945]">
                        Order Source / Channel
                      </label>
                      <select
                        value={orderSource}
                        onChange={(e) => setOrderSource(e.target.value as any)}
                        className="mt-1 w-full border border-[#deddd3] bg-[#fbf9f2] p-2.5 text-xs text-[#1b1c18] outline-hidden focus:border-[#073a2d]"
                      >
                        <option value="ADMIN">ADMIN (Backoffice Direct)</option>
                        <option value="PHONE">PHONE (Telephone Order)</option>
                        <option value="WHATSAPP">WHATSAPP (VIP Chat Order)</option>
                        <option value="FACEBOOK">FACEBOOK (Social Commerce)</option>
                        <option value="WALK_IN">WALK_IN (Showroom / Boutique)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION G: SPECIAL INSTRUCTIONS & NOTES */}
              <div className="border border-[#deddd3] bg-white p-6 shadow-xs">
                <div className="border-b border-[#deddd3] pb-3">
                  <h2 className="font-serif text-base font-bold text-[#1b1c18]">
                    7. Notes & Special Requests
                  </h2>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#404945]">
                      Customer Notes (Visible on invoice / packaging slip)
                    </label>
                    <textarea
                      rows={2}
                      value={customerNotes}
                      onChange={(e) => setCustomerNotes(e.target.value)}
                      placeholder="e.g. Gift packaging required, urgent delivery requested"
                      className="mt-1 w-full border border-[#deddd3] bg-[#fbf9f2] p-2.5 text-xs text-[#1b1c18] outline-hidden focus:border-[#073a2d]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#404945]">
                      Internal Admin Notes (Private staff log)
                    </label>
                    <textarea
                      rows={2}
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="e.g. Customer verified via phone, confirmed payment receipt"
                      className="mt-1 w-full border border-[#deddd3] bg-[#fbf9f2] p-2.5 text-xs text-[#1b1c18] outline-hidden focus:border-[#073a2d]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right 4 Cols: Live Sticky Summary Sidebar */}
            <div className="lg:col-span-4">
              <div className="sticky top-24 space-y-6">
                <div className="border border-[#deddd3] bg-white p-6 shadow-xs">
                  <h3 className="font-serif text-lg font-bold text-[#073a2d]">
                    Consignment Summary
                  </h3>
                  <p className="mt-0.5 text-[11px] uppercase tracking-wider text-[#c79a45]">
                    Live Pricing & Allocation Preview
                  </p>

                  {/* Customer Snapshot */}
                  <div className="mt-4 border-t border-[#deddd3] pt-4">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#717975] block">
                      Client
                    </span>
                    <p className="font-serif text-sm font-bold text-[#1b1c18]">
                      {customerMode === 'EXISTING'
                        ? selectedCustomer
                          ? [selectedCustomer.firstName, selectedCustomer.lastName].filter(Boolean).join(' ')
                          : 'No Patron Selected'
                        : receiverName || 'Walk-in Patron'}
                    </p>
                    <p className="font-mono text-xs text-[#717975]">
                      {customerMode === 'EXISTING'
                        ? selectedCustomer?.phone || '—'
                        : receiverPhone || '—'}
                    </p>
                  </div>

                  {/* Address Snapshot */}
                  <div className="mt-3 border-t border-[#deddd3] pt-3 text-xs">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#717975] block">
                      Destination
                    </span>
                    <p className="font-medium text-[#1b1c18]">
                      {division} • {district} • {thana || 'Thana pending'}
                    </p>
                    <p className="text-[11px] text-[#717975]">
                      {streetAddress || 'Address details pending'}
                    </p>
                  </div>

                  {/* Items Count Snapshot */}
                  <div className="mt-3 border-t border-[#deddd3] pt-3 text-xs">
                    <div className="flex justify-between text-[#717975]">
                      <span>Total Garment Units</span>
                      <span className="font-mono font-bold text-[#1b1c18]">
                        {orderItems.reduce((sum, it) => sum + it.quantity, 0)} Units
                      </span>
                    </div>
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="mt-4 space-y-2 border-t border-[#deddd3] pt-4 text-xs">
                    <div className="flex justify-between text-[#717975]">
                      <span>Items Subtotal</span>
                      <span className="font-mono font-medium text-[#1b1c18]">
                        ৳{subtotal.toLocaleString()}
                      </span>
                    </div>

                    {couponDiscount > 0 && (
                      <div className="flex justify-between text-[#8c6722]">
                        <span>Voucher ({appliedCoupon?.code})</span>
                        <span className="font-mono font-medium">
                          -৳{couponDiscount.toLocaleString()}
                        </span>
                      </div>
                    )}

                    {manualDiscount > 0 && (
                      <div className="flex justify-between text-[#8c6722]">
                        <span>Manual Concession</span>
                        <span className="font-mono font-medium">
                          -৳{manualDiscount.toLocaleString()}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between text-[#717975]">
                      <span>Delivery Charge</span>
                      <span className="font-mono font-medium text-[#1b1c18]">
                        ৳{deliveryCharge.toLocaleString()}
                      </span>
                    </div>

                    <div className="mt-3 flex justify-between border-t border-[#deddd3] pt-3 items-baseline">
                      <div>
                        <span className="font-serif text-base font-bold uppercase text-[#1b1c18]">
                          Grand Total
                        </span>
                        <span className="block text-[10px] text-[#717975]">
                          Atelier Verified
                        </span>
                      </div>
                      <span className="font-serif text-2xl font-bold text-[#073a2d]">
                        ৳{grandTotal.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Channel & Payment preview */}
                  <div className="mt-4 rounded-none border border-[#deddd3] bg-[#fbf9f2] p-3 text-[11px] space-y-1">
                    <div className="flex justify-between">
                      <span className="text-[#717975]">Payment:</span>
                      <span className="font-bold text-[#1b1c18]">
                        {paymentMethod} • {paymentStatus}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#717975]">Dispatch:</span>
                      <span className="font-bold text-[#1b1c18]">{courierProvider}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#717975]">Channel:</span>
                      <span className="font-bold text-[#073a2d]">{orderSource}</span>
                    </div>
                  </div>

                  {/* Submission Action */}
                  <div className="mt-6">
                    <button
                      type="button"
                      onClick={handleSubmitOrder}
                      disabled={isSubmitting || orderItems.length === 0}
                      className="w-full flex items-center justify-center gap-2 bg-[#073a2d] py-3 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-[#00231a] disabled:cursor-not-allowed disabled:opacity-50 shadow-md"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin text-[#c79a45]" />
                          <span>CREATING ORDER...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-[#c79a45]" />
                          <span>CONFIRM & CREATE ORDER</span>
                        </>
                      )}
                    </button>
                    <p className="mt-2 text-center text-[10px] text-[#717975]">
                      Atomically validates stock & decrements inventory in real time.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PermissionGuard>
  );
}
