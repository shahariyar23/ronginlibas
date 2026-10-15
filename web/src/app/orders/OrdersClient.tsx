'use client';

import React, { useEffect, useMemo, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { apiRequest, getProduct, initiateUddoktaPaymentApi, initiateWaitmarkPaymentApi, cancelOrderApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  MapPin,
  Package,
  Search,
  Truck,
  Lock,
  User,
  ChevronDown,
  Eye,
  EyeOff,
  Tag,
  CreditCard,
  CheckCircle2,
  Clock,
  Sparkles,
  RefreshCw,
  ShoppingBag,
  ExternalLink,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { OrderTrackingStepper } from '@/components/orders/OrderTrackingStepper';
import { CancelOrderModal } from '@/components/orders/CancelOrderModal';
import { LogoLoader } from '@/components/common/LogoLoader';

interface OrderProductSummary {
  id: string;
  name: string;
  slug?: string | null;
  images?: Array<{ url: string }>;
}

interface OrderItem {
  id?: string;
  productId?: string | null;
  variantId?: string | null;
  productName?: string;
  name?: string;
  variantName?: string | null;
  sku?: string | null;
  size?: string | null;
  color?: string | null;
  quantity: number;
  unitPrice: number | string;
  subtotal?: number | string;
  discountAmount?: number | string;
  productImage?: string | null;
  createdAt?: string;
  product?: OrderProductSummary | null;
}

interface TrackingEvent {
  status: string;
  description?: string | null;
  createdAt: string;
}

interface ShippingAddress {
  recipientName?: string;
  name?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  division?: string;
  postalCode?: string;
  country?: string;
  [key: string]: unknown;
}

interface OrderRecord {
  id?: string;
  orderNumber: string;
  createdAt: string;
  updatedAt?: string;
  status: string;
  paymentStatus?: string;
  paymentMethod: string;
  subtotal: number | string;
  discountAmount?: number | string;
  manualDiscountAmount?: number | string;
  deliveryCharge: number | string;
  totalAmount: number | string;
  paidAmount?: number | string;
  paymentReference?: string | null;
  customerNotes?: string | null;
  courierName?: string | null;
  courierProvider?: string | null;
  courierStatus?: string | null;
  courierLastSyncedAt?: string | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  estimatedDelivery?: string | null;
  shippingAddress?: ShippingAddress | null;
  items: OrderItem[];
  trackingEvents?: TrackingEvent[];
}

const getItemName = (item: OrderItem): string => {
  return item.productName || item.product?.name || item.name || 'Bespoke Garment';
};

const getItemImage = (item: OrderItem): string | null => {
  return item.productImage || item.product?.images?.[0]?.url || null;
};

const getItemUnitPrice = (item: OrderItem): number => {
  return Number(item.unitPrice) || 0;
};

const getItemDiscount = (item: OrderItem): number => {
  return Number(item.discountAmount) || 0;
};

const getItemSubtotal = (item: OrderItem): number => {
  if (item.subtotal !== undefined && item.subtotal !== null) {
    return Number(item.subtotal) || 0;
  }
  return getItemUnitPrice(item) * item.quantity;
};

const getStatusBadgeStyle = (status: string) => {
  switch (status.toUpperCase()) {
    case 'DELIVERED':
      return 'bg-[#0f5132] text-white border-[#0f5132]';
    case 'SHIPPED':
    case 'OUT_FOR_DELIVERY':
      return 'bg-[#073a2d] text-white border-[#073a2d]';
    case 'PROCESSING':
    case 'PACKED':
      return 'bg-[#1b4332] text-white border-[#1b4332]';
    case 'CONFIRMED':
      return 'bg-[#1e3a8a] text-white border-[#1e3a8a]';
    case 'PENDING':
      return 'bg-[#b45309] text-white border-[#b45309]';
    case 'CANCELLED':
      return 'bg-[#991b1b] text-white border-[#991b1b]';
    case 'RETURNED':
    case 'REFUNDED':
      return 'bg-[#4b5563] text-white border-[#4b5563]';
    default:
      return 'bg-[#073a2d] text-white border-[#073a2d]';
  }
};

export const OrdersClient: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { addToCart, restoreFromOrder } = useCart();
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [filter, setFilter] = useState<'all' | 'in-transit' | 'delivered'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [expandedDetailsOrders, setExpandedDetailsOrders] = useState<Set<string>>(new Set());
  const [expandedTrackingOrders, setExpandedTrackingOrders] = useState<Set<string>>(new Set());
  const [reorderingItemKey, setReorderingItemKey] = useState<string | null>(null);
  const [payingOrderNumber, setPayingOrderNumber] = useState<string | null>(null);
  const [restoringOrderNumber, setRestoringOrderNumber] = useState<string | null>(null);

  const handlePayNow = async (orderNumber: string, method?: string) => {
    if (payingOrderNumber) return;
    setPayingOrderNumber(orderNumber);
    try {
      const isWaitmark = method === 'WAITMARK_PAY';
      const res = isWaitmark
        ? await initiateWaitmarkPaymentApi({ orderId: orderNumber })
        : await initiateUddoktaPaymentApi({ orderId: orderNumber });
      const checkoutUrl = (res as any)?.checkoutUrl || (res as any)?.data?.checkoutUrl;
      if (checkoutUrl) {
        toast.info(`Redirecting to ${isWaitmark ? 'Waitmark Pay' : 'UddoktaPay'}...`);
        window.location.assign(checkoutUrl);
      }
    } catch (err: any) {
      toast.error(err?.message || 'Payment initiation failed. Please try again.');
    } finally {
      setPayingOrderNumber(null);
    }
  };

  const handleRestoreToCart = async (orderNumber: string) => {
    if (restoringOrderNumber) return;
    setRestoringOrderNumber(orderNumber);
    try {
      const success = await restoreFromOrder(orderNumber);
      if (success) {
        router.push('/cart');
      }
    } finally {
      setRestoringOrderNumber(null);
    }
  };

  const [cancellingOrderNumber, setCancellingOrderNumber] = useState<string | null>(null);
  const [orderToCancel, setOrderToCancel] = useState<OrderRecord | null>(null);

  const isOrderCancellable = (order: OrderRecord) => {
    if (order.status !== 'PENDING') return false;
    if (order.paymentStatus === 'PAID') return false;
    const orderTime = new Date(order.createdAt).getTime();
    if (Number.isNaN(orderTime)) return false;
    const sixHoursMs = 6 * 60 * 60 * 1000;
    return Date.now() - orderTime <= sixHoursMs;
  };

  const getCancelTimeRemaining = (orderCreatedAt: string) => {
    const orderTime = new Date(orderCreatedAt).getTime();
    if (Number.isNaN(orderTime)) return null;
    const sixHoursMs = 6 * 60 * 60 * 1000;
    const remainingMs = sixHoursMs - (Date.now() - orderTime);
    if (remainingMs <= 0) return null;
    const hours = Math.floor(remainingMs / (60 * 60 * 1000));
    const mins = Math.floor((remainingMs % (60 * 60 * 1000)) / (60 * 1000));
    return hours > 0 ? `${hours}h ${mins}m left` : `${mins}m left`;
  };

  const handleConfirmCancel = async () => {
    if (!orderToCancel || cancellingOrderNumber) return;
    const orderNumber = orderToCancel.orderNumber;

    setCancellingOrderNumber(orderNumber);
    try {
      await cancelOrderApi(orderNumber);
      toast.success(`Order ${orderNumber} cancelled successfully. Confirmation dispatched.`);
      setOrders((prev) =>
        prev.map((o) =>
          o.orderNumber === orderNumber ? { ...o, status: 'CANCELLED' } : o,
        ),
      );
      setOrderToCancel(null);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to cancel order.');
    } finally {
      setCancellingOrderNumber(null);
    }
  };

  // Auto-expand if URL has ?track=... or ?id=... or ?order=...
  useEffect(() => {
    const trackParam = searchParams.get('track') || searchParams.get('id') || searchParams.get('order');
    if (trackParam && orders.length > 0) {
      const match = orders.find(
        (o) =>
          o.orderNumber.toLowerCase() === trackParam.toLowerCase() ||
          o.orderNumber.replace('#', '').toLowerCase() === trackParam.replace('#', '').toLowerCase(),
      );
      if (match) {
        setExpandedDetailsOrders(new Set([match.orderNumber]));
        if (searchParams.get('track')) {
          setExpandedTrackingOrders(new Set([match.orderNumber]));
        }
      }
    }
  }, [searchParams, orders]);

  const toggleDetails = (orderNumber: string) => {
    setExpandedDetailsOrders((prev) => {
      const next = new Set(prev);
      if (next.has(orderNumber)) {
        next.delete(orderNumber);
      } else {
        next.add(orderNumber);
      }
      return next;
    });
  };

  const toggleTracking = (orderNumber: string) => {
    setExpandedTrackingOrders((prev) => {
      const next = new Set(prev);
      if (next.has(orderNumber)) {
        next.delete(orderNumber);
      } else {
        next.add(orderNumber);
      }
      return next;
    });
  };

  const hasNotifiedRef = useRef(false);
  useEffect(() => {
    if (!isAuthLoading && !user && !hasNotifiedRef.current) {
      hasNotifiedRef.current = true;
      toast.error('You are not logged in. Please login first.');
    }
  }, [isAuthLoading, user]);

  useEffect(() => {
    if (isAuthLoading) return;
    if (!user) {
      Promise.resolve().then(() => setIsLoading(false));
      return;
    }
    let active = true;
    apiRequest<{ items: OrderRecord[] }>('/orders/my-orders?limit=100')
      .then((result) => {
        if (active) setOrders(result.items ?? []);
      })
      .catch((error: unknown) => {
        if (active) toast.error(error instanceof Error ? error.message : 'Could not load your orders.');
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user?.id, isAuthLoading, router]);

  const filteredOrders = useMemo(() => orders.filter((order) => {
    const isInTransit = ['SHIPPED', 'OUT_FOR_DELIVERY'].includes(order.status);
    const matchesFilter =
      filter === 'all' || (filter === 'in-transit' ? isInTransit : order.status === 'DELIVERED');
    const query = searchQuery.trim().toLowerCase();
    const matchesQuery =
      !query ||
      order.orderNumber.toLowerCase().includes(query) ||
      order.items.some((item) => {
        const name = getItemName(item).toLowerCase();
        const color = (item.color || '').toLowerCase();
        const sku = (item.sku || '').toLowerCase();
        return name.includes(query) || color.includes(query) || sku.includes(query);
      });
    return matchesFilter && matchesQuery;
  }), [orders, filter, searchQuery]);

  const handleReorder = async (item: OrderItem) => {
    const itemKey = `${item.productId}-${item.size}-${item.color}`;
    if (reorderingItemKey || !item.productId) return;
    setReorderingItemKey(itemKey);
    try {
      const product = await getProduct(item.productId);
      const variant = product.variants?.find((entry) =>
        entry.sizeLabel === item.size || entry.size === item.size,
      );
      if (!variant) throw new Error('This item is no longer available in the original size.');
      await addToCart(product, variant.sizeLabel || variant.size, variant.color, item.quantity);
      toast.success(`Added ${getItemName(item)} to your bag.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not add this item to your cart.');
    } finally {
      setReorderingItemKey(null);
    }
  };

  if (isAuthLoading) {
    return <LogoLoader />;
  }

  if (!user) {
    return (
      <div className="min-h-screen pt-28 pb-20 bg-[#fbf9f2] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white border border-[#deddd3] p-8 sm:p-10 text-center shadow-xl">
          <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-[#fdf8ed] border border-[#e8d5aa] flex items-center justify-center text-[#073a2d]">
            <Lock className="w-8 h-8 text-[#073a2d]" />
          </div>
          <Badge className="bg-[#ba1a1a] text-white text-[10px] font-sans uppercase tracking-widest px-2.5 py-0.5 mb-3">
            Authentication Required
          </Badge>
          <h1 className="font-serif text-2xl sm:text-3xl text-[#073a2d] mb-2 font-normal">
            You are not logged in
          </h1>
          <p className="font-sans text-xs sm:text-sm text-[#69726d] leading-relaxed mb-6">
            Please login first to view your order history, delivery details, product history, and live statuses.
          </p>
          <div className="space-y-3">
            <Link
              href="/login?next=%2Forders"
              className="w-full inline-flex items-center justify-center gap-2 bg-[#073a2d] hover:bg-[#0d4d3b] text-white font-sans text-xs uppercase tracking-widest py-3.5 px-6 font-semibold shadow-md transition-all cursor-pointer"
            >
              <User className="w-4 h-4 text-[#c79a45]" />
              <span>Login First</span>
            </Link>
            <Link
              href="/men"
              className="w-full inline-flex items-center justify-center gap-2 bg-[#f5f4ed] hover:bg-[#eae8e1] text-[#073a2d] font-sans text-xs uppercase tracking-wider py-3 px-6 font-semibold transition-all cursor-pointer"
            >
              <span>Explore Men&apos;s Collection</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#fbf9f2] py-6 sm:py-10" data-clarity-mask="true">
      <div className="mx-auto max-w-6xl space-y-6 sm:space-y-8 px-3 sm:px-6">
        <nav className="text-xs uppercase tracking-widest text-[#717975]">
          <Link href="/" className="hover:text-[#073a2d]">Home</Link>
          <span className="px-2">/</span>
          <Link href="/profile" className="hover:text-[#073a2d]">Account</Link>
          <span className="px-2">/</span>
          <span className="text-[#073a2d]">Orders</span>
        </nav>

        <header className="flex flex-col gap-4 sm:gap-5 border-b border-[#deddd3] pb-5 sm:pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.2em] text-[#c79a45]">Account</span>
            <h1 className="mt-1 font-serif text-2xl text-[#073a2d] sm:text-4xl">Your Orders</h1>
            <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-[#69726d]">
              Order history, product details, discounts, and delivery information for {user?.name}.
            </p>
          </div>
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-3 h-4 w-4 text-[#717975]" />
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search order number or item"
              className="pl-9 h-10 text-xs"
            />
          </div>
        </header>

        <div className="flex flex-wrap gap-2">
          {([
            ['all', `All orders (${orders.length})`],
            ['in-transit', 'In transit'],
            ['delivered', 'Delivered'],
          ] as const).map(([value, label]) => (
            <Button
              key={value}
              variant={filter === value ? 'default' : 'outline'}
              onClick={() => setFilter(value)}
              className={`text-xs h-8 sm:h-9 ${filter === value ? 'bg-[#073a2d] text-white' : ''}`}
            >
              {label}
            </Button>
          ))}
        </div>

        {isLoading ? (
          <LogoLoader />
        ) : filteredOrders.length === 0 ? (
          <div className="space-y-3 border border-[#deddd3] bg-white p-8 sm:p-12 text-center">
            <Package className="mx-auto h-10 w-10 text-[#c79a45]" />
            <h2 className="font-serif text-xl text-[#073a2d]">No matching orders</h2>
            <p className="text-xs sm:text-sm text-[#69726d]">Orders placed with this account will appear here.</p>
            <Link href="/men" className="inline-block text-xs sm:text-sm font-semibold text-[#073a2d] underline">
              Browse the men&apos;s collection
            </Link>
          </div>
        ) : (
          <div className="space-y-5 sm:space-y-6">
            {filteredOrders.map((order) => {
              const isDetailsExpanded = expandedDetailsOrders.has(order.orderNumber);
              const isTrackingExpanded = expandedTrackingOrders.has(order.orderNumber);

              const subtotal = Number(order.subtotal) || 0;
              const deliveryCharge = Number(order.deliveryCharge) || 0;
              const couponDiscount = Number(order.discountAmount) || 0;
              const manualDiscount = Number(order.manualDiscountAmount) || 0;
              const totalDiscount = couponDiscount + manualDiscount;
              const grandTotal = Number(order.totalAmount) || 0;
              const paidAmount = Number(order.paidAmount) || 0;
              const balanceDue = Math.max(0, grandTotal - paidAmount);

              const formattedDate = new Date(order.createdAt).toLocaleDateString(undefined, {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              });

              const formattedTime = new Date(order.createdAt).toLocaleTimeString(undefined, {
                hour: '2-digit',
                minute: '2-digit',
              });

              const addressParts = order.shippingAddress
                ? [
                    order.shippingAddress.addressLine1,
                    order.shippingAddress.addressLine2,
                    order.shippingAddress.city,
                    order.shippingAddress.division,
                    order.shippingAddress.postalCode,
                  ].filter(Boolean)
                : [];

              const recipientName =
                order.shippingAddress?.recipientName ||
                order.shippingAddress?.name ||
                user?.name ||
                'Valued Patron';

              const recipientPhone =
                order.shippingAddress?.phone ||
                user?.phone ||
                '—';

              return (
                <article
                  key={order.orderNumber}
                  className="border border-[#deddd3] bg-white shadow-xs transition-shadow hover:shadow-md"
                >
                  {/* Card Header - Clickable to expand details */}
                  <div
                    onClick={() => toggleDetails(order.orderNumber)}
                    className="border-b border-[#deddd3] bg-[#f5f4ed] p-3.5 sm:p-5 cursor-pointer hover:bg-[#edeae0] transition-colors"
                  >
                    {/* Mobile Header Layout (< sm) */}
                    <div className="flex sm:hidden flex-col gap-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <span className="text-[9px] uppercase tracking-widest text-[#717975] block">Order</span>
                          <h2 className="font-serif text-base font-bold text-[#073a2d]">
                            {order.orderNumber}
                          </h2>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 justify-end">
                          <Badge
                            className={`rounded-none px-2 py-0.5 uppercase text-[10px] font-semibold ${getStatusBadgeStyle(
                              order.status,
                            )}`}
                          >
                            {order.status.replaceAll('_', ' ')}
                          </Badge>
                          <Badge
                            className={`rounded-none px-2 py-0.5 uppercase text-[9px] font-semibold ${
                              order.paymentStatus === 'PAID'
                                ? 'bg-[#0f5132] text-white border-[#0f5132]'
                                : order.paymentStatus === 'FAILED'
                                  ? 'bg-[#ba1a1a] text-white border-[#ba1a1a]'
                                  : 'bg-[#c79a45] text-[#073a2d] border-[#c79a45]'
                            }`}
                          >
                            Pay: {order.paymentStatus || 'PENDING'}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-[#69726d] border-t border-[#e8e6dc] pt-2">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-[#717975]" />
                          {formattedDate} · {formattedTime}
                        </span>
                        <span>
                          {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between border-t border-[#e8e6dc] pt-2">
                        <div>
                          <span className="block text-[9px] uppercase tracking-wider text-[#717975]">Grand Total</span>
                          <span className="font-serif font-bold text-base text-[#073a2d]">
                            ৳{grandTotal.toLocaleString()}
                          </span>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleDetails(order.orderNumber);
                          }}
                          className="text-[#073a2d] bg-white hover:bg-[#f5f4ed] px-3 h-8 flex items-center gap-1.5 font-semibold text-xs border border-[#deddd3] shadow-2xs"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#c79a45]" />
                          <span>{isDetailsExpanded ? 'Hide' : 'Details'}</span>
                          <ChevronDown
                            className={`w-3.5 h-3.5 transition-transform duration-200 ${
                              isDetailsExpanded ? 'rotate-180' : ''
                            }`}
                          />
                        </Button>
                      </div>
                    </div>

                    {/* Tablet/Desktop Header Layout (>= sm) */}
                    <div className="hidden sm:flex items-center justify-between gap-4">
                      <div>
                        <span className="text-[10px] uppercase tracking-widest text-[#717975]">Order</span>
                        <div className="flex items-center gap-2">
                          <h2 className="font-serif text-xl font-bold text-[#073a2d]">
                            {order.orderNumber}
                          </h2>
                          <span className="text-[11px] text-[#717975]">
                            ({order.items.length} {order.items.length === 1 ? 'item' : 'items'})
                          </span>
                        </div>
                        <span className="mt-1 inline-flex items-center gap-1 text-xs text-[#69726d]">
                          <Calendar className="h-3.5 w-3.5" />
                          {formattedDate} · {formattedTime}
                        </span>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className="block text-[10px] uppercase tracking-wider text-[#717975]">Grand Total</span>
                          <span className="font-serif font-bold text-lg text-[#073a2d]">
                            ৳{grandTotal.toLocaleString()}
                          </span>
                        </div>

                        <div className="flex flex-col gap-1 items-end">
                          <Badge
                            className={`rounded-none px-3 py-1 uppercase text-xs font-semibold ${getStatusBadgeStyle(
                              order.status,
                            )}`}
                          >
                            {order.status.replaceAll('_', ' ')}
                          </Badge>
                          <Badge
                            className={`rounded-none px-2.5 py-0.5 uppercase text-[10px] font-semibold ${
                              order.paymentStatus === 'PAID'
                                ? 'bg-[#0f5132] text-white border-[#0f5132]'
                                : order.paymentStatus === 'FAILED'
                                  ? 'bg-[#ba1a1a] text-white border-[#ba1a1a]'
                                  : 'bg-[#c79a45] text-[#073a2d] border-[#c79a45]'
                            }`}
                          >
                            Payment: {order.paymentStatus || 'PENDING'}
                          </Badge>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleDetails(order.orderNumber);
                          }}
                          className="text-[#073a2d] hover:bg-white/80 px-3 h-8 flex items-center gap-1.5 font-semibold text-xs border border-[#deddd3]"
                        >
                          {isDetailsExpanded ? (
                            <>
                              <EyeOff className="w-3.5 h-3.5 text-[#c79a45]" />
                              <span>Close</span>
                            </>
                          ) : (
                            <>
                              <Eye className="w-3.5 h-3.5 text-[#c79a45]" />
                              <span>Order Details</span>
                            </>
                          )}
                          <ChevronDown
                            className={`w-3.5 h-3.5 transition-transform duration-200 ${
                              isDetailsExpanded ? 'rotate-180' : ''
                            }`}
                          />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Compact Items Row (Always visible overview) */}
                  <div className="divide-y divide-[#f0eee7] px-3.5 sm:px-5">
                    {order.items.map((item, index) => {
                      const itemName = getItemName(item);
                      const itemImg = getItemImage(item);
                      const unitPrice = getItemUnitPrice(item);
                      const itemDiscount = getItemDiscount(item);
                      const itemSubtotal = getItemSubtotal(item);
                      const productSlug = item.product?.slug || item.productId;
                      const itemKey = `${item.productId}-${item.size}-${item.color}-${index}`;
                      const isReorderingThis = reorderingItemKey === `${item.productId}-${item.size}-${item.color}`;

                      return (
                        <div
                          key={itemKey}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3.5 sm:py-4"
                        >
                          <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0 flex-1">
                            {/* Product Thumbnail */}
                            <div className="relative w-14 h-16 sm:w-14 sm:h-16 shrink-0 bg-[#f5f4ed] border border-[#e4e2d8] overflow-hidden flex items-center justify-center">
                              {itemImg ? (
                                <img
                                  src={itemImg}
                                  alt={itemName}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              ) : (
                                <ShoppingBag className="w-5 h-5 text-[#c79a45]" />
                              )}
                            </div>

                            {/* Product Info */}
                            <div className="min-w-0 flex-1">
                              {productSlug ? (
                                <Link
                                  href={`/products/${encodeURIComponent(productSlug)}`}
                                  className="font-serif font-semibold text-sm sm:text-base text-[#073a2d] hover:text-[#c79a45] transition-colors line-clamp-1 block"
                                >
                                  {itemName}
                                </Link>
                              ) : (
                                <h3 className="font-serif font-semibold text-sm sm:text-base text-[#073a2d] line-clamp-1">
                                  {itemName}
                                </h3>
                              )}

                              <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[#69726d]">
                                {item.color && (
                                  <span className="inline-flex items-center gap-1">
                                    <span className="font-medium text-[#404945]">Color:</span> {item.color}
                                  </span>
                                )}
                                {item.color && item.size && <span>·</span>}
                                {item.size && (
                                  <span className="inline-flex items-center gap-1">
                                    <span className="font-medium text-[#404945]">Size:</span> {item.size}
                                  </span>
                                )}
                                <span>·</span>
                                <span>
                                  <span className="font-medium text-[#404945]">Qty:</span> {item.quantity}
                                </span>
                              </div>

                              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                                <span className="text-[#404945]">
                                  Price: <span className="font-semibold text-[#073a2d]">৳{unitPrice.toLocaleString()}</span>
                                </span>
                                {itemDiscount > 0 && (
                                  <span className="text-[#0f5132] font-semibold text-[11px] bg-[#e6f4ea] px-1.5 py-0.5 border border-[#b7e1cd]">
                                    -৳{itemDiscount.toLocaleString()} off
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Line Total & Actions (Full width on mobile with divider) */}
                          <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-2 sm:gap-3 pt-2.5 sm:pt-0 border-t sm:border-t-0 border-[#f0eee7]">
                            <div className="text-left sm:text-right">
                              <span className="text-[10px] uppercase tracking-wider text-[#717975] block sm:hidden">Item Total</span>
                              <span className="text-sm sm:text-base font-semibold text-[#073a2d]">
                                ৳{itemSubtotal.toLocaleString()}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              {order.status === 'DELIVERED' && (
                                <Link
                                  href={`/profile?tab=reviews&orderNumber=${encodeURIComponent(order.orderNumber)}&productId=${encodeURIComponent(item.productId || '')}&productName=${encodeURIComponent(itemName)}&size=${encodeURIComponent(item.size || '')}&color=${encodeURIComponent(item.color || '')}`}
                                  className="inline-flex items-center h-8 px-2.5 sm:px-3 text-xs border border-[#c79a45] text-[#073a2d] hover:bg-[#073a2d] hover:text-white transition-colors cursor-pointer"
                                >
                                  Review
                                </Link>
                              )}

                              {item.productId && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  loading={isReorderingThis}
                                  loadingText="Adding..."
                                  disabled={Boolean(reorderingItemKey)}
                                  onClick={() => void handleReorder(item)}
                                  className="text-xs h-8 px-2.5 sm:px-3 border-[#073a2d] text-[#073a2d] hover:bg-[#073a2d] hover:text-white"
                                >
                                  <RefreshCw className="mr-1 h-3 w-3" />
                                  Reorder
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Summary Footer Bar (Mobile Optimized Action Buttons) */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4 border-t border-[#deddd3] p-3.5 sm:p-5 text-xs text-[#69726d] bg-white">
                    <div className="space-y-1">
                      {(order.courierName || order.trackingNumber) && (
                        <div className="flex flex-wrap items-center gap-2 text-[#073a2d] font-medium">
                          <div className="flex items-center gap-1.5">
                            <Truck className="h-3.5 w-3.5 text-[#c79a45]" />
                            <span>{order.courierName || 'Pathao Courier'}</span>
                          </div>
                          {order.trackingNumber && (
                            <span className="font-mono text-[11px] bg-[#f5f4ed] px-1.5 py-0.5 border border-[#deddd3]">
                              {order.trackingNumber}
                            </span>
                          )}
                        </div>
                      )}
                      {addressParts.length > 0 && (
                        <div className="flex items-start sm:items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 text-[#717975] shrink-0 mt-0.5 sm:mt-0" />
                          <span className="line-clamp-1 sm:truncate max-w-xs sm:max-w-md">{addressParts.join(', ')}</span>
                        </div>
                      )}
                      {order.estimatedDelivery && (
                        <div className="text-[11px] text-[#717975]">
                          Estimated delivery: {new Date(order.estimatedDelivery).toLocaleDateString()}
                        </div>
                      )}
                    </div>

                    {/* Action buttons: 2-column grid on mobile, inline on desktop */}
                    <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
                      {(order.paymentMethod === 'UDDOKTAPAY' || order.paymentMethod === 'WAITMARK_PAY') &&
                        order.paymentStatus !== 'PAID' &&
                        order.status !== 'CANCELLED' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => void handlePayNow(order.orderNumber, order.paymentMethod)}
                              disabled={Boolean(payingOrderNumber || restoringOrderNumber)}
                              className="bg-[#073a2d] hover:bg-[#0c4e3b] text-white font-semibold text-xs h-9 sm:h-8 justify-center cursor-pointer shadow-xs"
                            >
                              <CreditCard className="mr-1.5 h-3.5 w-3.5" />
                              <span>{payingOrderNumber === order.orderNumber ? 'Initiating...' : 'Pay Now'}</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => void handleRestoreToCart(order.orderNumber)}
                              disabled={Boolean(payingOrderNumber || restoringOrderNumber || cancellingOrderNumber)}
                              className="border-[#c79a45] text-[#073a2d] hover:bg-[#fdfbf6] font-semibold text-xs h-9 sm:h-8 justify-center cursor-pointer"
                            >
                              <ShoppingBag className="mr-1.5 h-3.5 w-3.5 text-[#c79a45]" />
                              <span>{restoringOrderNumber === order.orderNumber ? 'Restoring...' : 'Restore to Bag'}</span>
                            </Button>
                          </>
                        )}

                      {/* 6-Hour Patron Cancellation Action */}
                      {isOrderCancellable(order) && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setOrderToCancel(order)}
                          disabled={Boolean(payingOrderNumber || restoringOrderNumber || cancellingOrderNumber)}
                          title={`Cancelable within 6h while PENDING (${getCancelTimeRemaining(order.createdAt) || 'Eligible'})`}
                          className="border-red-300 text-red-600 hover:bg-red-50 font-semibold text-xs h-9 sm:h-8 justify-center cursor-pointer"
                        >
                          <X className="mr-1 h-3.5 w-3.5 text-red-500" />
                          <span>
                            {cancellingOrderNumber === order.orderNumber
                              ? 'Cancelling...'
                              : 'Cancel Order'}
                          </span>
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleDetails(order.orderNumber)}
                        className={`font-semibold border-[#073a2d] transition-all cursor-pointer text-xs h-9 sm:h-8 justify-center ${
                          isDetailsExpanded
                            ? 'bg-[#073a2d] text-white hover:bg-[#0c4e3b]'
                            : 'text-[#073a2d] hover:bg-[#073a2d] hover:text-white'
                        }`}
                      >
                        <Eye className="mr-1.5 h-3.5 w-3.5 shrink-0" />
                        <span>{isDetailsExpanded ? 'Hide' : 'Details'}</span>
                        <ChevronDown
                          className={`ml-1.5 h-3.5 w-3.5 transition-transform duration-200 ${
                            isDetailsExpanded ? 'rotate-180' : ''
                          }`}
                        />
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleTracking(order.orderNumber)}
                        className={`font-semibold border-[#c79a45] transition-all cursor-pointer text-xs h-9 sm:h-8 justify-center ${
                          isTrackingExpanded
                            ? 'bg-[#c79a45] text-[#073a2d] hover:bg-[#b58b38]'
                            : 'text-[#073a2d] hover:bg-[#c79a45] hover:text-[#073a2d]'
                        }`}
                      >
                        <Truck className="mr-1.5 h-3.5 w-3.5 shrink-0" />
                        <span>Tracking</span>
                        <ChevronDown
                          className={`ml-1.5 h-3.5 w-3.5 transition-transform duration-200 ${
                            isTrackingExpanded ? 'rotate-180' : ''
                          }`}
                        />
                      </Button>
                    </div>
                  </div>

                  {/* EXPANDED ORDER DETAILS PANEL */}
                  {isDetailsExpanded && (
                    <div className="border-t-2 border-[#073a2d] bg-[#fbf9f2] p-4 sm:p-6 space-y-6">
                      <div className="flex items-center justify-between border-b border-[#e4e2d8] pb-3">
                        <div className="flex items-center gap-2">
                          <Package className="w-5 h-5 text-[#c79a45]" />
                          <h3 className="font-serif text-lg font-bold text-[#073a2d]">
                            Complete Order & Product Details
                          </h3>
                        </div>
                        <span className="text-xs uppercase tracking-wider text-[#717975] font-semibold">
                          Reference: #{order.orderNumber}
                        </span>
                      </div>

                      {/* Detailed Products Section */}
                      <div className="bg-white border border-[#deddd3] p-4 sm:p-5 shadow-xs">
                        <h4 className="font-serif text-sm font-semibold uppercase tracking-wider text-[#073a2d] mb-4 flex items-center justify-between">
                          <span>Items Ordered ({order.items.length})</span>
                          <span className="text-xs font-normal text-[#69726d]">Unit Price & Breakdown</span>
                        </h4>

                        <div className="divide-y divide-[#f0eee7]">
                          {order.items.map((item, idx) => {
                            const itemName = getItemName(item);
                            const itemImg = getItemImage(item);
                            const unitPrice = getItemUnitPrice(item);
                            const itemDiscount = getItemDiscount(item);
                            const itemSubtotal = getItemSubtotal(item);
                            const productSlug = item.product?.slug || item.productId;

                            return (
                              <div
                                key={`detail-${item.productId}-${idx}`}
                                className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                              >
                                <div className="flex items-start gap-4">
                                  <div className="relative w-16 h-20 shrink-0 bg-[#f5f4ed] border border-[#e4e2d8] overflow-hidden flex items-center justify-center">
                                    {itemImg ? (
                                      <img
                                        src={itemImg}
                                        alt={itemName}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <ShoppingBag className="w-6 h-6 text-[#c79a45]" />
                                    )}
                                  </div>

                                  <div className="space-y-1">
                                    {productSlug ? (
                                      <Link
                                        href={`/products/${encodeURIComponent(productSlug)}`}
                                        className="font-serif font-bold text-base text-[#073a2d] hover:text-[#c79a45] transition-colors inline-flex items-center gap-1.5"
                                      >
                                        <span>{itemName}</span>
                                        <ExternalLink className="w-3.5 h-3.5 text-[#c79a45]" />
                                      </Link>
                                    ) : (
                                      <div className="font-serif font-bold text-base text-[#073a2d]">
                                        {itemName}
                                      </div>
                                    )}

                                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#69726d]">
                                      {item.color && (
                                        <span className="bg-[#f5f4ed] px-2 py-0.5 border border-[#deddd3]">
                                          Color: <strong className="text-[#073a2d]">{item.color}</strong>
                                        </span>
                                      )}
                                      {item.size && (
                                        <span className="bg-[#f5f4ed] px-2 py-0.5 border border-[#deddd3]">
                                          Size: <strong className="text-[#073a2d]">{item.size}</strong>
                                        </span>
                                      )}
                                      {item.sku && (
                                        <span className="font-mono text-[11px] text-[#717975]">
                                          SKU: {item.sku}
                                        </span>
                                      )}
                                    </div>

                                    <div className="text-xs text-[#69726d] pt-1">
                                      Unit Price: <span className="font-semibold text-[#073a2d]">৳{unitPrice.toLocaleString()}</span> × {item.quantity} {item.quantity > 1 ? 'units' : 'unit'}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-[#f0eee7]">
                                  <span className="text-xs text-[#717975] uppercase tracking-wider sm:hidden">
                                    Subtotal
                                  </span>
                                  <div className="text-right">
                                    {itemDiscount > 0 && (
                                      <div className="text-xs text-[#0f5132] font-medium">
                                        Discount: -৳{itemDiscount.toLocaleString()}
                                      </div>
                                    )}
                                    <div className="font-serif font-bold text-base sm:text-lg text-[#073a2d]">
                                      ৳{itemSubtotal.toLocaleString()}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Financial Ledger & Price Breakdown (Product price, discount if any, grand total) */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Delivery & Shipping Info */}
                        <div className="bg-white border border-[#deddd3] p-4 sm:p-5 shadow-xs space-y-3">
                          <h4 className="font-serif text-sm font-semibold uppercase tracking-wider text-[#073a2d] flex items-center gap-2 border-b border-[#f0eee7] pb-2">
                            <MapPin className="w-4 h-4 text-[#c79a45]" />
                            <span>Delivery Destination</span>
                          </h4>

                          <div className="text-xs space-y-1.5 text-[#404945]">
                            <div>
                              <span className="text-[#717975]">Recipient:</span>{' '}
                              <strong className="text-[#073a2d]">{recipientName}</strong>
                            </div>
                            <div>
                              <span className="text-[#717975]">Phone:</span>{' '}
                              <strong className="text-[#073a2d]">{recipientPhone}</strong>
                            </div>
                            <div className="pt-1">
                              <span className="text-[#717975] block">Address:</span>
                              <span className="text-[#073a2d] leading-relaxed">
                                {addressParts.length > 0 ? addressParts.join(', ') : 'Delivery address on file'}
                              </span>
                            </div>
                            {order.courierName && (
                              <div className="pt-2 border-t border-[#f0eee7] flex items-center justify-between">
                                <span className="text-[#717975]">Courier Service:</span>
                                <span className="font-semibold text-[#073a2d]">
                                  {order.courierName}
                                </span>
                              </div>
                            )}
                            {order.trackingNumber && (
                              <div className="flex items-center justify-between">
                                <span className="text-[#717975]">Consignment ID:</span>
                                <span className="font-mono font-bold text-[#073a2d]">
                                  {order.trackingNumber}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Price, Discount & Grand Total Ledger */}
                        <div className="bg-white border border-[#deddd3] p-4 sm:p-5 shadow-xs space-y-3">
                          <h4 className="font-serif text-sm font-semibold uppercase tracking-wider text-[#073a2d] flex items-center gap-2 border-b border-[#f0eee7] pb-2">
                            <Tag className="w-4 h-4 text-[#c79a45]" />
                            <span>Payment & Total Breakdown</span>
                          </h4>

                          <div className="space-y-2 text-xs">
                            <div className="flex justify-between items-center text-[#404945]">
                              <span>Products Subtotal</span>
                              <span className="font-medium text-[#073a2d]">৳{subtotal.toLocaleString()}</span>
                            </div>

                            <div className="flex justify-between items-center text-[#404945]">
                              <span>Delivery Charge</span>
                              <span className="font-medium text-[#073a2d]">
                                {deliveryCharge === 0 ? 'FREE (Complimentary)' : `৳${deliveryCharge.toLocaleString()}`}
                              </span>
                            </div>

                            {couponDiscount > 0 && (
                              <div className="flex justify-between items-center text-[#0f5132] font-semibold bg-[#e6f4ea] px-2 py-1 border border-[#b7e1cd]">
                                <span className="flex items-center gap-1">
                                  <Sparkles className="w-3.5 h-3.5" />
                                  Coupon Discount
                                </span>
                                <span>-৳{couponDiscount.toLocaleString()}</span>
                              </div>
                            )}

                            {manualDiscount > 0 && (
                              <div className="flex justify-between items-center text-[#0f5132] font-semibold bg-[#e6f4ea] px-2 py-1 border border-[#b7e1cd]">
                                <span>Atelier Special Discount</span>
                                <span>-৳{manualDiscount.toLocaleString()}</span>
                              </div>
                            )}

                            {totalDiscount > 0 && (
                              <div className="text-[11px] text-[#0f5132] text-right italic font-medium">
                                Total Savings: ৳{totalDiscount.toLocaleString()}
                              </div>
                            )}

                            <div className="border-t-2 border-[#073a2d] pt-3 flex justify-between items-baseline">
                              <span className="font-serif text-sm sm:text-base font-bold text-[#073a2d] uppercase">
                                Grand Total
                              </span>
                              <span className="font-serif text-xl sm:text-2xl font-bold text-[#073a2d]">
                                ৳{grandTotal.toLocaleString()}
                              </span>
                            </div>

                            <div className="border-t border-[#f0eee7] pt-2 text-[11px] text-[#69726d] flex items-center justify-between">
                              <span>Payment Method:</span>
                              <span className="font-semibold text-[#073a2d]">
                                {order.paymentMethod === 'COD'
                                  ? 'Cash on Delivery (COD)'
                                  : order.paymentMethod === 'UDDOKTAPAY'
                                  ? 'UddoktaPay (Online)'
                                  : order.paymentMethod === 'WAITMARK_PAY'
                                  ? 'Waitmark Pay (Online)'
                                  : order.paymentMethod || 'Cash on Delivery'}
                              </span>
                            </div>

                            <div className="text-[11px] text-[#69726d] flex items-center justify-between">
                              <span>Payment Status:</span>
                              <span
                                className={`font-semibold ${
                                  order.paymentStatus === 'PAID' ? 'text-[#0f5132]' : 'text-[#b45309]'
                                }`}
                              >
                                {order.paymentStatus === 'PAID'
                                  ? 'Paid in Full'
                                  : balanceDue > 0
                                  ? `Due on Delivery (৳${balanceDue.toLocaleString()})`
                                  : 'Pending'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Integrated Live Tracking Stepper inside Details */}
                      <div className="bg-white border border-[#deddd3] p-4 sm:p-5 shadow-xs space-y-4">
                        <div className="flex items-center justify-between border-b border-[#f0eee7] pb-2">
                          <h4 className="font-serif text-sm font-semibold uppercase tracking-wider text-[#073a2d] flex items-center gap-2">
                            <Clock className="w-4 h-4 text-[#c79a45]" />
                            <span>Order Status Timeline & History</span>
                          </h4>
                          <span className="text-xs text-[#69726d]">Live Updates</span>
                        </div>

                        <OrderTrackingStepper
                          status={order.status}
                          orderNumber={order.orderNumber}
                          courierName={order.courierName}
                          trackingNumber={order.trackingNumber}
                          trackingUrl={order.trackingUrl}
                          estimatedDelivery={order.estimatedDelivery}
                          createdAt={order.createdAt}
                          shippingAddress={order.shippingAddress}
                          trackingEvents={order.trackingEvents}
                        />
                      </div>
                    </div>
                  )}

                  {/* Separate Tracking Drawer (if toggled independently when details closed) */}
                  {!isDetailsExpanded && isTrackingExpanded && (
                    <div className="border-t border-[#deddd3] p-4 sm:p-5 bg-[#fbf9f2]">
                      <OrderTrackingStepper
                        status={order.status}
                        orderNumber={order.orderNumber}
                        courierName={order.courierName}
                        trackingNumber={order.trackingNumber}
                        trackingUrl={order.trackingUrl}
                        estimatedDelivery={order.estimatedDelivery}
                        createdAt={order.createdAt}
                        shippingAddress={order.shippingAddress}
                        trackingEvents={order.trackingEvents}
                      />
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Bespoke Cancel Order Confirmation Dialog */}
      <CancelOrderModal
        isOpen={Boolean(orderToCancel)}
        order={orderToCancel}
        onClose={() => {
          if (!cancellingOrderNumber) {
            setOrderToCancel(null);
          }
        }}
        onConfirm={handleConfirmCancel}
        isCancelling={Boolean(
          cancellingOrderNumber &&
          orderToCancel &&
          cancellingOrderNumber === orderToCancel.orderNumber
        )}
        timeRemaining={orderToCancel ? getCancelTimeRemaining(orderToCancel.createdAt) : null}
      />
    </main>
  );
};
