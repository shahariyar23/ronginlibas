'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  ShoppingBag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getPaymentStatusApi, initiateWaitmarkPaymentApi, cancelOrderApi, OrderPaymentStatusResult } from '@/lib/api';
import { toast } from 'sonner';
import { analytics } from '@/lib/analytics/client';
import { useCart } from '@/context/CartContext';

function PaymentResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const orderId = searchParams.get('orderId') || '';
  const trxId = searchParams.get('trx_id') || '';
  const phone = searchParams.get('phone') || '';
  const trackingToken = searchParams.get('trackingToken') || '';
  const statusParam = (searchParams.get('status') || '').trim().toLowerCase();
  const isFailedParam = ['failed', 'cancelled', 'cancel', 'declined', 'rejected', 'error'].includes(statusParam);

  const [statusData, setStatusData] = useState<OrderPaymentStatusResult | null>(
    isFailedParam
      ? {
          orderId,
          orderNumber: orderId,
          paymentStatus: 'FAILED',
          orderStatus: 'CANCELLED',
          totalAmount: 0,
          paidAmount: 0,
          paymentReference: trxId || null,
          paymentMethod: 'WAITMARK_PAY',
          payments: [],
        }
      : null,
  );
  const [loading, setLoading] = useState(!isFailedParam);
  const [pollCount, setPollCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { restoreFromOrder } = useCart();

  const MAX_POLLS = 10; // Poll for up to 30 seconds

  const fetchStatus = async (isManual = false) => {
    if (!orderId) {
      setLoading(false);
      setErrorMessage('No order reference provided.');
      return;
    }

    try {
      if (isManual) setLoading(true);
      const res = await getPaymentStatusApi(orderId, {
        phone: phone || undefined,
        trackingToken: trackingToken || undefined,
      });

      const data = (res as any)?.data || res;
      if (data?.orderId || data?.paymentStatus) {
        setStatusData(data);
        setErrorMessage(null);
      }
    } catch (err: any) {
      if (isFailedParam) {
        // If query param explicitly stated failed/cancelled, keep clean failed UI
        setErrorMessage(null);
      } else {
        if (isManual) {
          toast.error(err?.message || 'Failed to refresh payment status');
        }
        setErrorMessage(err?.message || 'Could not verify payment status.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!orderId || isFailedParam) {
      if (orderId && isFailedParam) {
        void cancelOrderApi(orderId, {
          phone: phone || undefined,
          trackingToken: trackingToken || undefined,
        }).catch(() => {});
      }
      setLoading(false);
      return;
    }

    void fetchStatus();

    // Auto-poll if payment is still pending verification
    const interval = setInterval(() => {
      setPollCount((prev) => {
        if (prev >= MAX_POLLS) {
          clearInterval(interval);
          return prev;
        }

        // If already paid, failed, or confirmed, stop polling
        if (statusData?.paymentStatus === 'PAID' || statusData?.paymentStatus === 'FAILED') {
          clearInterval(interval);
          return prev;
        }

        void fetchStatus();
        return prev + 1;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [orderId, statusData?.paymentStatus, isFailedParam]);

  const handleRetryPayment = async () => {
    const targetOrderId = statusData?.orderNumber || orderId;
    if (!targetOrderId) return;
    setIsRetrying(true);
    try {
      const res = await initiateWaitmarkPaymentApi({
        orderId: targetOrderId,
        phone: phone || undefined,
        trackingToken: trackingToken || undefined,
      });

      const checkoutUrl = (res as any)?.checkoutUrl || (res as any)?.data?.checkoutUrl;

      if (checkoutUrl) {
        toast.info('Redirecting to Waitmark Pay secure gateway...');
        window.location.assign(checkoutUrl);
      }
    } catch (err: any) {
      toast.error(err?.message || 'Payment retry failed. Please try again or contact concierge.');
      setIsRetrying(false);
    }
  };

  const handleRestoreCart = async () => {
    const targetOrderId = statusData?.orderNumber || orderId;
    if (!targetOrderId) return;
    setIsRestoring(true);
    try {
      const success = await restoreFromOrder(
        targetOrderId,
        phone || undefined,
        trackingToken || undefined,
      );
      if (success) {
        router.push('/cart');
      }
    } finally {
      setIsRestoring(false);
    }
  };

  const isPaid = statusData?.paymentStatus === 'PAID';
  const isFailed = statusData?.paymentStatus === 'FAILED' || isFailedParam;
  const isPending = !isPaid && !isFailed;

  // Track verified purchase conversion once payment is confirmed by backend as PAID
  useEffect(() => {
    if (!isPaid || !statusData) return;

    let items: any[] = [];
    const orderNumber = statusData.orderNumber || orderId;
    try {
      const saved = sessionStorage.getItem(`rl_pending_order_items_${orderNumber}`);
      if (saved) {
        items = JSON.parse(saved);
      }
    } catch {
      // ignore
    }

    analytics.trackPurchase({
      pagePath: '/payment/result',
      orderId: statusData.orderId || orderId,
      orderNumber,
      currency: 'BDT',
      value: Number(statusData.paidAmount || statusData.totalAmount || 0),
      paymentMethod: statusData.paymentMethod || 'WAITMARK_PAY',
      items,
    });
  }, [isPaid, statusData, orderId]);

  return (
    <div className="min-h-[80vh] bg-[#fbf9f2] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-md w-full bg-white border border-[#deddd3] p-8 shadow-sm text-center space-y-6" data-clarity-mask="true">
        {/* Brand Header */}
        <div className="space-y-1">
          <span className="text-[10px] uppercase tracking-[0.3em] font-sans font-bold text-[#c79a45]">
            Rongin Libas Atelier
          </span>
          <h1 className="font-serif text-2xl font-bold text-[#073a2d]">
            Payment Verification
          </h1>
        </div>

        {/* Status Presentation */}
        {loading && !statusData ? (
          <div className="py-8 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#f0eee7] border border-[#c79a45] flex items-center justify-center animate-spin">
              <RefreshCw className="w-7 h-7 text-[#073a2d]" />
            </div>
            <p className="text-xs font-sans text-[#69726d]">
              Connecting to atelier ledger and verifying transaction with Waitmark Pay...
            </p>
          </div>
        ) : isPaid ? (
          /* Confirmed Paid */
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 border-2 border-emerald-600 flex items-center justify-center text-emerald-700 shadow-xs">
              <CheckCircle2 className="w-9 h-9 text-emerald-700 stroke-[2.5]" />
            </div>
            <div className="space-y-1">
              <span className="inline-block bg-emerald-100 text-emerald-800 border border-emerald-300 text-[11px] font-sans font-bold px-3 py-1 uppercase tracking-wider rounded-full">
                Payment Confirmed
              </span>
              <p className="text-xs text-[#525b55] pt-1">
                Your transaction has been securely verified and applied to your order.
              </p>
            </div>

            <div className="bg-[#fbf9f2] border border-[#deddd3] p-4 text-left space-y-2.5 text-xs font-sans">
              <div className="flex justify-between border-b border-[#deddd3] pb-2">
                <span className="text-[#69726d]">Order Reference</span>
                <span className="font-mono font-bold text-[#073a2d]">
                  {statusData?.orderNumber || orderId}
                </span>
              </div>
              <div className="flex justify-between border-b border-[#deddd3] pb-2">
                <span className="text-[#69726d]">Payment Method</span>
                <span className="font-semibold text-[#073a2d]">Waitmark Pay</span>
              </div>
              <div className="flex justify-between border-b border-[#deddd3] pb-2">
                <span className="text-[#69726d]">Paid Amount</span>
                <span className="font-bold text-[#073a2d]">
                  ৳{Number(statusData?.paidAmount || statusData?.totalAmount || 0).toLocaleString()} BDT
                </span>
              </div>
              {(statusData?.paymentReference || trxId) && (
                <div className="flex justify-between pt-0.5">
                  <span className="text-[#69726d]">Transaction ID</span>
                  <span className="font-mono text-[#073a2d]">
                    {statusData?.paymentReference || trxId}
                  </span>
                </div>
              )}
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <Link
                href={`/track-order?id=${encodeURIComponent(statusData?.orderNumber || orderId)}${
                  phone ? `&phone=${encodeURIComponent(phone)}` : ''
                }${trackingToken ? `&trackingToken=${encodeURIComponent(trackingToken)}` : ''}`}
                className="w-full inline-flex items-center justify-center gap-2 bg-[#073a2d] hover:bg-[#0d4d3b] text-[#fbf9f2] font-sans text-xs uppercase tracking-wider font-bold py-3.5"
              >
                <span>Track Your Order</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/shop"
                className="text-xs font-sans text-[#073a2d] hover:underline py-2"
              >
                Continue Browsing Collection
              </Link>
            </div>
          </div>
        ) : isFailed ? (
          /* Payment Failed */
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-red-50 border-2 border-red-500 flex items-center justify-center text-red-600">
              <AlertCircle className="w-9 h-9 text-red-600 stroke-[2]" />
            </div>
            <div className="space-y-1">
              <span className="inline-block bg-red-100 text-red-800 border border-red-300 text-[11px] font-sans font-bold px-3 py-1 uppercase tracking-wider rounded-full">
                Payment Unsuccessful
              </span>
              <p className="text-xs text-[#525b55] pt-1">
                The payment attempt could not be completed or was cancelled at the gateway. The order has been cancelled and any reserved stock was restored to inventory.
              </p>
            </div>

            <div className="bg-[#fbf9f2] border border-[#deddd3] p-4 text-xs font-sans text-left space-y-2">
              <div className="flex justify-between border-b border-[#deddd3] pb-2">
                <span className="text-[#69726d]">Order Reference</span>
                <span className="font-mono font-bold text-[#073a2d]">
                  {statusData?.orderNumber || orderId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#69726d]">Status</span>
                <span className="font-bold text-red-600">
                  CANCELLED / RELEASED
                </span>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <Link
                href="/cart"
                className="w-full inline-flex items-center justify-center gap-2 bg-[#073a2d] hover:bg-[#0d4d3b] text-[#fbf9f2] font-sans text-xs uppercase tracking-wider font-bold py-3.5"
              >
                <ShoppingBag className="w-4 h-4 mr-1 text-[#c79a45]" />
                <span>Return to Cart / Reorder</span>
              </Link>
              <Link
                href="/shop"
                className="text-xs font-sans text-[#073a2d] hover:underline py-2"
              >
                Continue Browsing Collection
              </Link>
            </div>
          </div>
        ) : (
          /* Verification in Progress */
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-amber-50 border-2 border-amber-500 flex items-center justify-center text-amber-700">
              <Clock className="w-9 h-9 text-amber-600 animate-pulse stroke-[2]" />
            </div>
            <div className="space-y-1">
              <span className="inline-block bg-amber-100 text-amber-800 border border-amber-300 text-[11px] font-sans font-bold px-3 py-1 uppercase tracking-wider rounded-full">
                Verification in Progress
              </span>
              <p className="text-xs text-[#525b55] pt-1">
                We are confirming your payment authorization with Waitmark Pay. This usually takes just a few moments.
              </p>
            </div>

            <div className="bg-[#fbf9f2] border border-[#deddd3] p-4 text-xs font-sans text-left space-y-2">
              <div className="flex justify-between border-b border-[#deddd3] pb-2">
                <span className="text-[#69726d]">Order Reference</span>
                <span className="font-mono font-bold text-[#073a2d]">
                  {statusData?.orderNumber || orderId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#69726d]">Amount</span>
                <span className="font-bold text-[#073a2d]">
                  ৳{Number(statusData?.totalAmount || 0).toLocaleString()} BDT
                </span>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <Button
                variant="outline"
                onClick={() => fetchStatus(true)}
                disabled={loading || isRetrying || isRestoring}
                className="w-full border-[#073a2d] text-[#073a2d] hover:bg-[#f0eee7] text-xs font-sans uppercase font-bold py-3"
              >
                <RefreshCw className={`w-3.5 h-3.5 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Check Status Again
              </Button>
              <Button
                onClick={handleRetryPayment}
                disabled={isRetrying || isRestoring}
                className="w-full bg-[#073a2d] hover:bg-[#0d4d3b] text-white text-xs font-sans uppercase font-bold py-3"
              >
                <CreditCard className="w-3.5 h-3.5 mr-2" />
                {isRetrying ? 'Initiating...' : 'Pay with Waitmark Pay'}
              </Button>
              {pollCount >= MAX_POLLS && (
                <Button
                  onClick={handleRestoreCart}
                  disabled={isRetrying || isRestoring}
                  variant="outline"
                  className="w-full border-[#c79a45] text-[#073a2d] hover:bg-[#fbf9f2] text-xs font-sans uppercase font-bold py-3"
                >
                  <ShoppingBag className="w-3.5 h-3.5 mr-2 text-[#c79a45]" />
                  {isRestoring ? 'Restoring Items...' : 'Restore Items to Cart'}
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Security Assurance */}
        <div className="pt-4 border-t border-[#deddd3] flex items-center justify-center gap-1.5 text-[11px] font-sans text-[#717975]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#073a2d]" />
          <span>256-Bit Encrypted Waitmark Pay Transaction</span>
        </div>
      </div>
    </div>
  );
}

export default function PaymentResultPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[80vh] flex items-center justify-center bg-[#fbf9f2]">
          <div className="text-center space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin text-[#073a2d] mx-auto" />
            <p className="text-xs text-[#69726d]">Loading payment ledger...</p>
          </div>
        </div>
      }
    >
      <PaymentResultContent />
    </Suspense>
  );
}
