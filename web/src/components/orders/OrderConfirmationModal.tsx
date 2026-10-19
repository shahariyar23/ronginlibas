'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, Copy, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

export interface OrderConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderNumber: string;
  orderStatus?: string;
  phone?: string;
  trackingToken?: string;
  onContinueShopping?: () => void;
}

interface StatusDisplayInfo {
  label: string;
  dotClass: string;
  textClass: string;
  badgeClass: string;
}

function formatStatus(status?: string): StatusDisplayInfo {
  const s = (status || 'CONFIRMED').toUpperCase().replace(/\s+/g, '_');
  switch (s) {
    case 'PENDING':
    case 'PENDING_CONFIRMATION':
    case 'CONFIRMED':
      return {
        label: 'Confirmed',
        dotClass: 'bg-emerald-600',
        textClass: 'text-emerald-900',
        badgeClass: 'bg-emerald-50 border-emerald-200/90',
      };
    case 'PROCESSING':
      return {
        label: 'Processing',
        dotClass: 'bg-[#073a2d]',
        textClass: 'text-[#073a2d]',
        badgeClass: 'bg-[#f6f3eb] border-[#deddd3]/80',
      };
    case 'SHIPPED':
      return {
        label: 'Shipped',
        dotClass: 'bg-sky-600',
        textClass: 'text-sky-900',
        badgeClass: 'bg-sky-50 border-sky-200',
      };
    case 'DELIVERED':
      return {
        label: 'Delivered',
        dotClass: 'bg-emerald-600',
        textClass: 'text-emerald-900',
        badgeClass: 'bg-emerald-50 border-emerald-200',
      };
    case 'CANCELLED':
      return {
        label: 'Cancelled',
        dotClass: 'bg-rose-600',
        textClass: 'text-rose-900',
        badgeClass: 'bg-rose-50 border-rose-200',
      };
    default:
      return {
        label: 'Confirmed',
        dotClass: 'bg-emerald-600',
        textClass: 'text-emerald-900',
        badgeClass: 'bg-emerald-50 border-emerald-200/90',
      };
  }
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  open,
  onOpenChange,
  orderNumber,
  orderStatus,
  phone = '',
  trackingToken = '',
  onContinueShopping,
}) => {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  // Normalize order reference display
  const rawNumber = (orderNumber || '').trim();
  const formattedOrderNumber = rawNumber
    ? rawNumber.startsWith('#')
      ? rawNumber
      : `#${rawNumber}`
    : '—';

  const cleanOrderRef = rawNumber.replace(/^#/, '');
  const formattedStatus = formatStatus(orderStatus);

  const trackingHref = `/track-order?id=${encodeURIComponent(cleanOrderRef || rawNumber)}${
    trackingToken ? `&phone=${encodeURIComponent(phone)}&trackingToken=${encodeURIComponent(trackingToken)}` : ''
  }`;

  const handleCopy = useCallback(async () => {
    if (!rawNumber) return;
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(formattedOrderNumber);
        setCopied(true);
        toast.success('Order number copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      toast.error('Could not copy order number');
    }
  }, [formattedOrderNumber, rawNumber]);

  const handleContinueShopping = useCallback(() => {
    if (onContinueShopping) {
      onContinueShopping();
    } else {
      onOpenChange(false);
      router.push('/shop');
    }
  }, [onContinueShopping, onOpenChange, router]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        overlayClassName="bg-[#021812]/75 backdrop-blur-sm sm:backdrop-blur-md transition-all duration-300"
        closeButtonClassName="top-4 right-4 text-[#717975] hover:text-[#073a2d] hover:bg-[#073a2d]/10 rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-[#073a2d]/30"
        className="max-w-[460px] w-[calc(100%-2rem)] mx-auto p-0 bg-[#fbf9f2] border border-[#deddd3] rounded-2xl shadow-[0_20px_50px_rgba(7,58,45,0.18)] overflow-hidden text-center"
        data-clarity-mask="true"
      >
        {/* Subtle Gold Atelier Accent Line */}
        <div className="h-1 w-full bg-gradient-to-r from-[#c79a45]/20 via-[#c79a45] to-[#c79a45]/20" />

        <div className="px-6 pt-7 pb-8 sm:px-8 sm:pt-8 sm:pb-9 space-y-5 sm:space-y-6">
          {/* Brand & Animated Success Emblem */}
          <div className="flex flex-col items-center justify-center gap-3">
            <span className="text-[10px] sm:text-[11px] font-serif font-semibold uppercase tracking-[0.28em] text-[#c79a45] select-none">
              Rongin Libas
            </span>

            {/* Circular Icon Container with smooth entrance */}
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white border border-[#073a2d]/15 shadow-[0_4px_20px_rgba(7,58,45,0.08)] flex items-center justify-center animate-rl-circle">
              {/* Subtle inner gold accent ring */}
              <div
                className="absolute inset-1 rounded-full border border-[#c79a45]/25 pointer-events-none"
                aria-hidden="true"
              />
              <svg
                className="w-8 h-8 sm:w-9 sm:h-9 text-[#073a2d]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path className="animate-rl-check" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          {/* Primary Header & Elegant Minimal Message */}
          <DialogHeader className="space-y-1.5 animate-rl-rise">
            <DialogTitle className="font-serif text-xl sm:text-2xl font-semibold text-[#073a2d] tracking-tight">
              Order Created Successfully
            </DialogTitle>
            <DialogDescription className="font-sans text-xs sm:text-[13px] text-[#404945] leading-relaxed max-w-xs mx-auto">
              Thank you for shopping with Rongin Libas.
              <span className="block text-[#69726d] pt-0.5">
                Your order has been received successfully.
              </span>
            </DialogDescription>
          </DialogHeader>

          {/* Dedicated Order Number Card */}
          <div className="bg-white border border-[#deddd3] rounded-xl p-3.5 sm:p-4 text-left shadow-xs transition-colors hover:border-[#c79a45]/40 animate-rl-rise">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="text-[10px] sm:text-[11px] font-sans font-semibold uppercase tracking-[0.18em] text-[#717975]">
                Order Number
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-sans font-medium text-[#073a2d] hover:text-[#00231a] bg-[#f5eedf]/60 hover:bg-[#f5eedf] border border-[#c79a45]/30 rounded-md transition-all active:scale-95 cursor-pointer"
                aria-label={copied ? 'Order number copied' : 'Copy order number'}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#073a2d] stroke-[2.5]" />
                    <span className="font-semibold text-[#073a2d]">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#717975]" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <div className="font-mono text-sm sm:text-base font-bold text-[#073a2d] tracking-wide break-all select-all">
              {formattedOrderNumber}
            </div>
          </div>

          {/* Order Status Badge (Visually secondary) */}
          <div className="flex items-center justify-center animate-rl-rise">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${formattedStatus.badgeClass} border text-xs shadow-2xs`}>
              <span className={`w-1.5 h-1.5 rounded-full ${formattedStatus.dotClass}`} aria-hidden="true" />
              <span className="text-[11px] font-sans text-[#717975] uppercase tracking-wider font-medium">
                Order Status:
              </span>
              <span className={`text-[11px] font-sans font-semibold ${formattedStatus.textClass}`}>
                {formattedStatus.label}
              </span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-col gap-2.5 animate-rl-rise">
            <Button
              type="button"
              onClick={handleContinueShopping}
              className="w-full h-11 sm:h-12 bg-[#073a2d] hover:bg-[#0c4a3b] active:scale-[0.99] text-white font-sans text-xs sm:text-[13px] uppercase tracking-[0.16em] font-semibold rounded-lg shadow-sm hover:shadow transition-all duration-200 cursor-pointer"
            >
              Continue Shopping
            </Button>
            <Link
              href={trackingHref}
              onClick={() => onOpenChange(false)}
              className="inline-flex items-center justify-center gap-1.5 w-full py-2 text-xs sm:text-[13px] font-sans font-semibold uppercase tracking-wider text-[#073a2d] hover:text-[#0c4a3b] hover:bg-[#073a2d]/5 rounded-lg transition-colors group cursor-pointer"
            >
              <span>Track Your Order</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          {/* Discreet Atelier Concierge Contact (Section 15) */}
          <div className="pt-2 border-t border-[#deddd3]/60 text-center animate-rl-rise">
            <p className="text-[11px] font-sans text-[#717975]">
              Questions about your order? Reach concierge:{' '}
              <a
                href="tel:+8801352926067"
                className="font-medium text-[#073a2d] hover:underline"
              >
                01352926067
              </a>{' '}
              or on{' '}
              <a
                href="https://wa.me/8801352926067"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-[#073a2d] hover:underline"
              >
                WhatsApp
              </a>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
