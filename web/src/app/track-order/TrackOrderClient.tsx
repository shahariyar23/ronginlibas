'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MapPin, Search, Truck } from 'lucide-react';
import { toast } from 'sonner';

interface TrackingData {
  orderNumber: string;
  status: string;
  courierName?: string | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  estimatedDelivery?: string | null;
  trackingEvents: Array<{
    status: string;
    description?: string | null;
    createdAt: string;
  }>;
}

export const TrackOrderClient: React.FC = () => {
  const searchParams = useSearchParams();
  const { isLoggedIn } = useAuth();
  const [orderNumber, setOrderNumber] = useState(searchParams.get('id') || '');
  const [phone, setPhone] = useState(searchParams.get('phone') || '');
  const [trackingToken, setTrackingToken] = useState(searchParams.get('trackingToken') || '');
  const [tracking, setTracking] = useState<TrackingData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const trackOrder = useCallback(async (id: string, guestPhone: string, token: string) => {
    if (!id.trim()) return;
    setIsLoading(true);
    const query = new URLSearchParams();
    if (guestPhone) query.set('phone', guestPhone);
    if (token) query.set('trackingToken', token);
    try {
      const result = await apiRequest<TrackingData>(
        `/orders/${encodeURIComponent(id.trim())}/tracking${query.size ? `?${query.toString()}` : ''}`,
      );
      setTracking(result);
    } catch (error) {
      setTracking(null);
      toast.error(error instanceof Error ? error.message : 'Could not retrieve tracking information.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const id = searchParams.get('id');
    if (!id) return;
    const timer = window.setTimeout(() => {
      void trackOrder(
        id,
        searchParams.get('phone') ?? '',
        searchParams.get('trackingToken') ?? '',
      );
    }, 0);
    return () => window.clearTimeout(timer);
  }, [searchParams, trackOrder]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    void trackOrder(orderNumber, phone, trackingToken);
  };

  return (
    <main className="min-h-screen bg-[#fbf9f2] py-10">
      <div className="mx-auto max-w-4xl space-y-8 px-4 sm:px-6">
        <nav className="text-xs uppercase tracking-widest text-[#717975]">
          <Link href="/" className="hover:text-[#073a2d]">Home</Link>
          <span className="px-2">/</span>
          <Link href="/orders" className="hover:text-[#073a2d]">Orders</Link>
          <span className="px-2">/</span>
          <span className="text-[#073a2d]">Tracking</span>
        </nav>

        <header className="bg-[#073a2d] p-7 text-white sm:p-10">
          <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-[#c79a45]">
            <Truck className="h-4 w-4" />
            Order delivery
          </span>
          <h1 className="mt-2 font-serif text-3xl sm:text-4xl">Track your order</h1>
          <p className="mt-2 max-w-xl text-sm text-[#c0c8c3]">
            Enter the order number. Guest orders also require the phone number and tracking token shown after checkout.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="grid gap-3 border border-[#deddd3] bg-white p-5 sm:grid-cols-2">
          <label className="space-y-1 text-xs font-semibold text-[#404945] sm:col-span-2">
            Order number
            <Input
              required
              value={orderNumber}
              onChange={(event) => setOrderNumber(event.target.value)}
              placeholder="#RL12345678"
            />
          </label>
          {!isLoggedIn && (
            <>
              <label className="space-y-1 text-xs font-semibold text-[#404945]">
                Guest checkout phone
                <Input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="01XXXXXXXXX" />
              </label>
              <label className="space-y-1 text-xs font-semibold text-[#404945]">
                Tracking token
                <Input value={trackingToken} onChange={(event) => setTrackingToken(event.target.value)} />
              </label>
            </>
          )}
          <Button disabled={isLoading} className="bg-[#073a2d] text-white sm:col-span-2">
            <Search className="mr-2 h-4 w-4" />
            {isLoading ? 'Looking up order...' : 'Track order'}
          </Button>
        </form>

        {tracking && (
          <section className="space-y-6 border border-[#deddd3] bg-white p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#deddd3] pb-5">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#717975]">Order</span>
                <h2 className="font-serif text-2xl font-semibold text-[#073a2d]">{tracking.orderNumber}</h2>
              </div>
              <Badge className="rounded-none bg-[#073a2d] text-white">{tracking.status.replaceAll('_', ' ')}</Badge>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#717975]">Courier</span>
                <p className="mt-1 text-sm font-semibold text-[#073a2d]">{tracking.courierName || 'Not assigned'}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#717975]">Tracking number</span>
                <p className="mt-1 text-sm font-semibold text-[#073a2d]">{tracking.trackingNumber || 'Not assigned'}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#717975]">Estimated delivery</span>
                <p className="mt-1 text-sm font-semibold text-[#073a2d]">
                  {tracking.estimatedDelivery ? new Date(tracking.estimatedDelivery).toLocaleDateString() : 'To be confirmed'}
                </p>
              </div>
            </div>

            {tracking.trackingUrl && (
              <a href={tracking.trackingUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-[#073a2d] underline">
                <MapPin className="h-4 w-4" />
                Open courier tracking
              </a>
            )}

            <div className="border-t border-[#deddd3] pt-5">
              <h3 className="font-serif text-lg text-[#073a2d]">Tracking updates</h3>
              {tracking.trackingEvents.length ? (
                <ol className="mt-4 space-y-4">
                  {tracking.trackingEvents.map((event, index) => (
                    <li key={`${event.createdAt}-${index}`} className="flex gap-3">
                      <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[#c79a45]" />
                      <div>
                        <p className="text-sm font-semibold text-[#073a2d]">{event.status.replaceAll('_', ' ')}</p>
                        {event.description && <p className="mt-0.5 text-sm text-[#69726d]">{event.description}</p>}
                        <time className="mt-1 block text-xs text-[#717975]">
                          {new Date(event.createdAt).toLocaleString()}
                        </time>
                      </div>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="mt-3 text-sm text-[#69726d]">There are no courier updates yet.</p>
              )}
            </div>
          </section>
        )}
      </div>
    </main>
  );
};
