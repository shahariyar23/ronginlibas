'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { apiRequest, downloadOrderInvoice, getProduct } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Calendar, Download, MapPin, Package, Search, Truck } from 'lucide-react';
import { toast } from 'sonner';

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

  useEffect(() => {
    if (isAuthLoading) return;
    if (!user) {
      router.replace('/login?next=%2Forders');
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
    try {
      const product = await getProduct(item.productId);
      const variant = product.variants?.find((entry) =>
        entry.sizeLabel === item.size || entry.size === item.size,
      );
      if (!variant) throw new Error('This item is no longer available in the original size.');
      await addToCart(product, variant.sizeLabel || variant.size, variant.color, item.quantity);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not add this item to your cart.');
    }
  };

  const handleInvoice = async (orderNumber: string) => {
    try {
      await downloadOrderInvoice(orderNumber);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not download the invoice.');
    }
  };

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
          <div className="border border-[#deddd3] bg-white p-12 text-center text-sm text-[#69726d]">
            Loading your orders...
          </div>
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
                        <Button variant="outline" size="sm" onClick={() => void handleReorder(item)}>
                          Reorder
                        </Button>
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
                  <div className="flex gap-2">
                    {['SHIPPED', 'OUT_FOR_DELIVERY'].includes(order.status) && (
                      <Link
                        href={`/track-order?id=${encodeURIComponent(order.orderNumber)}`}
                        className="inline-flex items-center border border-[#073a2d] px-3 py-2 font-semibold text-[#073a2d]"
                      >
                        Track order
                      </Link>
                    )}
                    <Button variant="outline" size="sm" onClick={() => void handleInvoice(order.orderNumber)}>
                      <Download className="mr-1 h-3.5 w-3.5" />
                      Invoice
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};
