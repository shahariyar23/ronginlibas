'use client';

import React, { useEffect, useMemo, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { apiRequest, downloadOrderInvoice, getProduct } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Calendar, Download, MapPin, Package, Search, Truck, Lock, User, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { OrderTrackingStepper } from '@/components/orders/OrderTrackingStepper';
import { LogoLoader } from '@/components/common/LogoLoader';

interface OrderItem {
  productId: string;
  name: string;
  size: string;
  color: string;
  quantity: number;
  unitPrice: number;
}

interface OrderRecord {
  orderNumber: string;
  createdAt: string;
  status: string;
  courierName?: string | null;
  trackingNumber?: string | null;
  estimatedDelivery?: string | null;
  shippingAddress?: Record<string, unknown> | null;
  paymentMethod: string;
  subtotal: number;
  deliveryCharge: number;
  totalAmount: number;
  items: OrderItem[];
}

export const OrdersClient: React.FC = () => {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { addToCart } = useCart();
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [filter, setFilter] = useState<'all' | 'in-transit' | 'delivered'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const searchParams = useSearchParams();
  const [expandedTrackingOrders, setExpandedTrackingOrders] = useState<Set<string>>(new Set());
  const [reorderingItemKey, setReorderingItemKey] = useState<string | null>(null);
  const [downloadingInvoiceOrder, setDownloadingInvoiceOrder] = useState<string | null>(null);

  // Auto-expand if URL has ?track=... or ?id=...
  useEffect(() => {
    const trackParam = searchParams.get('track') || searchParams.get('id');
    if (trackParam && orders.length > 0) {
      const match = orders.find(
        (o) =>
          o.orderNumber.toLowerCase() === trackParam.toLowerCase() ||
          o.orderNumber.replace('#', '').toLowerCase() === trackParam.replace('#', '').toLowerCase(),
      );
      if (match) {
        setExpandedTrackingOrders(new Set([match.orderNumber]));
      }
    }
  }, [searchParams, orders]);

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
      order.items.some((item) => item.name.toLowerCase().includes(query));
    return matchesFilter && matchesQuery;
  }), [orders, filter, searchQuery]);

  const handleReorder = async (item: OrderItem) => {
    const key = `${item.productId}-${item.size}-${item.color}`;
    if (reorderingItemKey) return;
    setReorderingItemKey(key);
    try {
      const product = await getProduct(item.productId);
      const variant = product.variants?.find((entry) =>
        entry.sizeLabel === item.size || entry.size === item.size,
      );
      if (!variant) throw new Error('This item is no longer available in the original size.');
      await addToCart(product, variant.sizeLabel || variant.size, variant.color, item.quantity);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not add this item to your cart.');
    } finally {
      setReorderingItemKey(null);
    }
  };

  const handleInvoice = async (orderNumber: string) => {
    if (downloadingInvoiceOrder) return;
    setDownloadingInvoiceOrder(orderNumber);
    try {
      await downloadOrderInvoice(orderNumber);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not download the invoice.');
    } finally {
      setDownloadingInvoiceOrder(null);
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
            Please login first to view your order history, live consignment statuses, and downloadable invoices.
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
              href="/shop"
              className="w-full inline-flex items-center justify-center gap-2 bg-[#f5f4ed] hover:bg-[#eae8e1] text-[#073a2d] font-sans text-xs uppercase tracking-wider py-3 px-6 font-semibold transition-all cursor-pointer"
            >
              <span>Explore Collection</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#fbf9f2] py-10">
      <div className="mx-auto max-w-6xl space-y-8 px-4 sm:px-6">
        <nav className="text-xs uppercase tracking-widest text-[#717975]">
          <Link href="/" className="hover:text-[#073a2d]">Home</Link>
          <span className="px-2">/</span>
          <Link href="/profile" className="hover:text-[#073a2d]">Account</Link>
          <span className="px-2">/</span>
          <span className="text-[#073a2d]">Orders</span>
        </nav>

        <header className="flex flex-col gap-5 border-b border-[#deddd3] pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#c79a45]">Account</span>
            <h1 className="mt-1 font-serif text-3xl text-[#073a2d] sm:text-4xl">Your Orders</h1>
            <p className="mt-2 text-sm text-[#69726d]">Order history and delivery information for {user?.name}.</p>
          </div>
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-3 h-4 w-4 text-[#717975]" />
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search order number or item"
              className="pl-9"
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
              className={filter === value ? 'bg-[#073a2d] text-white' : ''}
            >
              {label}
            </Button>
          ))}
        </div>

        {isLoading ? (
          <LogoLoader />
        ) : filteredOrders.length === 0 ? (
          <div className="space-y-3 border border-[#deddd3] bg-white p-12 text-center">
            <Package className="mx-auto h-10 w-10 text-[#c79a45]" />
            <h2 className="font-serif text-xl text-[#073a2d]">No matching orders</h2>
            <p className="text-sm text-[#69726d]">Orders placed with this account will appear here.</p>
            <Link href="/shop" className="inline-block text-sm font-semibold text-[#073a2d] underline">
              Browse the collection
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {filteredOrders.map((order) => (
              <article key={order.orderNumber} className="border border-[#deddd3] bg-white">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#deddd3] bg-[#f5f4ed] p-5">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-[#717975]">Order</span>
                    <h2 className="font-serif text-xl font-semibold text-[#073a2d]">{order.orderNumber}</h2>
                    <span className="mt-1 inline-flex items-center gap-1 text-xs text-[#69726d]">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className="rounded-none bg-[#073a2d] px-3 py-1 uppercase text-white">
                      {order.status.replaceAll('_', ' ')}
                    </Badge>
                    <span className="font-semibold text-[#073a2d]">৳{order.totalAmount.toLocaleString()}</span>
                  </div>
                </div>

                <div className="divide-y divide-[#f0eee7] px-5">
                  {order.items.map((item, index) => (
                    <div key={`${item.productId}-${index}`} className="flex flex-wrap items-center justify-between gap-3 py-4">
                      <div>
                        <h3 className="font-serif font-semibold text-[#073a2d]">{item.name}</h3>
                        <p className="mt-1 text-xs text-[#69726d]">
                          {item.color} · Size {item.size} · Qty {item.quantity}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold">৳{(item.unitPrice * item.quantity).toLocaleString()}</span>
                        {order.status === 'DELIVERED' && (
                          <Link
                            href="/profile"
                            className="inline-flex items-center h-8 px-3 text-xs border border-[#c79a45] text-[#073a2d] hover:bg-[#073a2d] hover:text-white transition-colors"
                          >
                            Write Review
                          </Link>
                        )}
                        {(() => {
                          const itemKey = `${item.productId}-${item.size}-${item.color}`;
                          const isReorderingThis = reorderingItemKey === itemKey;
                          return (
                            <Button
                              variant="outline"
                              size="sm"
                              loading={isReorderingThis}
                              loadingText="Reordering..."
                              disabled={Boolean(reorderingItemKey)}
                              onClick={() => void handleReorder(item)}
                            >
                              Reorder
                            </Button>
                          );
                        })()}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#deddd3] p-5 text-xs text-[#69726d]">
                  <div className="space-y-1">
                    {(order.courierName || order.trackingNumber) && (
                      <div className="flex items-center gap-2">
                        <Truck className="h-3.5 w-3.5 text-[#073a2d]" />
                        {order.courierName ?? 'Courier'} {order.trackingNumber ? `· ${order.trackingNumber}` : ''}
                      </div>
                    )}
                    {order.shippingAddress && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-[#717975]" />
                        {[order.shippingAddress.addressLine1, order.shippingAddress.city, order.shippingAddress.division]
                          .filter(Boolean).join(', ')}
                      </div>
                    )}
                    {order.estimatedDelivery && (
                      <div>Estimated delivery: {new Date(order.estimatedDelivery).toLocaleDateString()}</div>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleTracking(order.orderNumber)}
                      className={`font-semibold border-[#073a2d] transition-all cursor-pointer ${
                        expandedTrackingOrders.has(order.orderNumber)
                          ? 'bg-[#073a2d] text-white hover:bg-[#0c4e3b]'
                          : 'text-[#073a2d] hover:bg-[#073a2d] hover:text-white'
                      }`}
                    >
                      <Truck className="mr-1.5 h-3.5 w-3.5" />
                      <span>Order Tracking</span>
                      <ChevronDown
                        className={`ml-1.5 h-3.5 w-3.5 transition-transform duration-200 ${
                          expandedTrackingOrders.has(order.orderNumber) ? 'rotate-180' : ''
                        }`}
                      />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      loading={downloadingInvoiceOrder === order.orderNumber}
                      loadingText="Downloading..."
                      disabled={Boolean(downloadingInvoiceOrder)}
                      onClick={() => void handleInvoice(order.orderNumber)}
                    >
                      <Download className="mr-1 h-3.5 w-3.5" />
                      Invoice
                    </Button>
                  </div>
                </div>

                {/* Collapsible Order Tracking Stepper Section */}
                {expandedTrackingOrders.has(order.orderNumber) && (
                  <div className="border-t border-[#deddd3] p-4 sm:p-5 bg-[#fbf9f2]">
                    <OrderTrackingStepper
                      status={order.status}
                      orderNumber={order.orderNumber}
                      courierName={order.courierName}
                      trackingNumber={order.trackingNumber}
                      estimatedDelivery={order.estimatedDelivery}
                      createdAt={order.createdAt}
                      shippingAddress={order.shippingAddress}
                    />
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};
