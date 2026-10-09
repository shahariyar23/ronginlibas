'use client';

import React from 'react';
import Link from 'next/link';
import {
  Clock,
  CheckCircle2,
  Package,
  Truck,
  MapPin,
  XCircle,
  ExternalLink,
  ArrowRight,
} from 'lucide-react';

export interface OrderTrackingProps {
  status: string;
  orderNumber: string;
  courierName?: string | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  estimatedDelivery?: string | null;
  createdAt?: string;
  shippingAddress?: Record<string, unknown> | null;
  trackingEvents?: Array<{
    status: string;
    description?: string | null;
    createdAt: string;
  }>;
}

export const TRACKING_STEPS = [
  {
    key: 'PENDING',
    label: 'Pending',
    description: 'Order Placed & Registered',
    icon: Clock,
  },
  {
    key: 'CONFIRMED',
    label: 'Confirm',
    description: 'Confirmed by Atelier',
    icon: CheckCircle2,
  },
  {
    key: 'PROCESSING',
    label: 'Processing',
    description: 'Tailoring & Quality Check',
    icon: Package,
  },
  {
    key: 'SHIPPED',
    label: 'Shipping',
    description: 'Dispatched with Courier',
    icon: Truck,
  },
  {
    key: 'DELIVERED',
    label: 'Deliver',
    description: 'Delivered to Customer',
    icon: MapPin,
  },
];

export function getStageIndex(status: string): number {
  switch (status) {
    case 'PENDING':
      return 0;
    case 'CONFIRMED':
      return 1;
    case 'PROCESSING':
    case 'PACKED':
      return 2;
    case 'SHIPPED':
    case 'OUT_FOR_DELIVERY':
      return 3;
    case 'DELIVERED':
      return 4;
    default:
      return 0;
  }
}

export const OrderTrackingStepper: React.FC<OrderTrackingProps> = ({
  status,
  orderNumber,
  courierName,
  trackingNumber,
  trackingUrl,
  estimatedDelivery,
  createdAt,
  shippingAddress,
  trackingEvents = [],
}) => {
  const isCancelled = status === 'CANCELLED';
  const isReturn = ['RETURN_REQUESTED', 'RETURNED', 'REFUNDED'].includes(status);
  const currentIndex = getStageIndex(status);

  const formattedAddress = shippingAddress
    ? [
        shippingAddress.addressLine1 as string,
        shippingAddress.city as string,
        shippingAddress.division as string,
      ]
        .filter(Boolean)
        .join(', ')
    : '';

  return (
    <div className="border border-[#deddd3] bg-white rounded-sm overflow-hidden shadow-xs animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#f5f4ed] border-b border-[#deddd3] px-5 py-3 text-xs">
        <div className="flex items-center gap-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isCancelled
                ? 'bg-red-500'
                : status === 'DELIVERED'
                ? 'bg-emerald-600'
                : 'bg-[#073a2d] animate-pulse'
            }`}
          />
          <span className="font-sans font-bold uppercase tracking-wider text-[#073a2d]">
            Order Tracking & Delivery Status
          </span>
          <span className="text-[#deddd3]">|</span>
          <span className="font-semibold text-[#1b1c18] font-mono">{orderNumber}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[#69726d]">Current State:</span>
          <span
            className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-xs ${
              isCancelled
                ? 'bg-red-100 text-red-700 border border-red-200'
                : status === 'DELIVERED'
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                : 'bg-[#073a2d] text-white'
            }`}
          >
            {status.replaceAll('_', ' ')}
          </span>
        </div>
      </div>

      {/* Cancelled Alert Banner */}
      {isCancelled ? (
        <div className="p-6 bg-red-50/70 border-b border-red-200 flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-red-100 border border-red-200 flex items-center justify-center text-red-600 shrink-0">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-serif font-bold text-sm text-red-800">
              Order Cancelled
            </h4>
            <p className="text-xs text-red-700 mt-1 leading-relaxed">
              This commission has been cancelled. Any reserved artisan inventory has been
              released. If payment was pre-authorized, your refund process is handled by our atelier concierge.
            </p>
          </div>
        </div>
      ) : isReturn ? (
        <div className="p-6 bg-amber-50/70 border-b border-amber-200 flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-serif font-bold text-sm text-amber-800">
              Return / Refund in Progress
            </h4>
            <p className="text-xs text-amber-700 mt-1 leading-relaxed">
              This order status is {status.replaceAll('_', ' ')}. Our support team is verifying the return consignment.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Desktop Stepper */}
          <div className="hidden md:block px-8 py-8">
            <div className="relative flex items-center justify-between">
              {/* Background Connecting Line */}
              <div className="absolute top-5 left-8 right-8 h-1 bg-[#eae8e1] z-0">
                <div
                  className="h-full bg-[#073a2d] transition-all duration-500 ease-in-out"
                  style={{
                    width: `${(Math.min(currentIndex, 4) / 4) * 100}%`,
                  }}
                />
              </div>

              {TRACKING_STEPS.map((step, idx) => {
                const isCompleted = idx < currentIndex || (idx === 4 && currentIndex === 4);
                const isCurrent = idx === currentIndex && currentIndex !== 4;
                const IconComponent = step.icon;

                return (
                  <div
                    key={step.key}
                    className="relative z-10 flex flex-col items-center text-center max-w-[110px]"
                  >
                    <div
                      className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isCompleted
                          ? 'bg-[#073a2d] text-white shadow-sm'
                          : isCurrent
                          ? 'bg-[#c79a45] text-white ring-4 ring-[#c79a45]/25 shadow-md scale-105'
                          : 'bg-white text-[#8c9490] border-2 border-[#deddd3]'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-white" />
                      ) : (
                        <IconComponent className="w-5 h-5" />
                      )}
                    </div>
                    <div className="mt-3">
                      <p
                        className={`font-sans text-xs uppercase tracking-wider ${
                          isCompleted
                            ? 'font-bold text-[#073a2d]'
                            : isCurrent
                            ? 'font-bold text-[#c79a45]'
                            : 'font-medium text-[#717975]'
                        }`}
                      >
                        {step.label}
                      </p>
                      <p className="text-[10.5px] text-[#69726d] mt-0.5 leading-tight">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mobile Stepper */}
          <div className="md:hidden px-5 py-6 space-y-4">
            {TRACKING_STEPS.map((step, idx) => {
              const isCompleted = idx < currentIndex || (idx === 4 && currentIndex === 4);
              const isCurrent = idx === currentIndex && currentIndex !== 4;
              const IconComponent = step.icon;

              return (
                <div key={step.key} className="flex items-start gap-3.5 relative">
                  {idx < TRACKING_STEPS.length - 1 && (
                    <div
                      className={`absolute left-4 top-8 bottom-0 w-0.5 -ml-[1px] ${
                        idx < currentIndex ? 'bg-[#073a2d]' : 'bg-[#deddd3]'
                      }`}
                    />
                  )}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 ${
                      isCompleted
                        ? 'bg-[#073a2d] text-white shadow-xs'
                        : isCurrent
                        ? 'bg-[#c79a45] text-white ring-2 ring-[#c79a45]/30 shadow-xs'
                        : 'bg-white text-[#8c9490] border border-[#deddd3]'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    ) : (
                      <IconComponent className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1 pb-3">
                    <div className="flex items-center justify-between">
                      <p
                        className={`text-xs uppercase tracking-wider ${
                          isCompleted
                            ? 'font-bold text-[#073a2d]'
                            : isCurrent
                            ? 'font-bold text-[#c79a45]'
                            : 'font-medium text-[#717975]'
                        }`}
                      >
                        {step.label}
                      </p>
                      {isCurrent && (
                        <span className="text-[9px] font-bold uppercase tracking-wider bg-[#c79a45]/20 text-[#073a2d] px-1.5 py-0.5 rounded-xs">
                          Active Step
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#69726d] mt-0.5">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Consignment Details Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-[#deddd3] bg-[#fcfaf4] p-5 text-xs">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#717975] block">
            Courier Partner
          </span>
          <p className="font-semibold text-[#073a2d] mt-1 inline-flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-[#c79a45]" />
            <span>{courierName || 'Pathao Express / Steadfast Courier'}</span>
          </p>
        </div>
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#717975] block">
            Tracking / Consignment ID
          </span>
          <p className="font-semibold text-[#073a2d] mt-1 font-mono">
            {trackingNumber || `RL-${orderNumber.replace(/[^A-Za-z0-9]/g, '')}`}
          </p>
        </div>
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#717975] block">
            Estimated Delivery
          </span>
          <p className="font-semibold text-[#073a2d] mt-1">
            {estimatedDelivery
              ? new Date(estimatedDelivery).toLocaleDateString(undefined, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : '2-4 Business Days'}
          </p>
        </div>
      </div>

      {/* Tracking Events History (if any) */}
      {trackingEvents.length > 0 && (
        <div className="border-t border-[#deddd3] p-5 bg-white">
          <h4 className="font-serif text-sm font-semibold text-[#073a2d] mb-3">
            Courier Milestone History
          </h4>
          <ol className="space-y-3">
            {trackingEvents.map((event, index) => (
              <li key={`${event.createdAt}-${index}`} className="flex items-start gap-2.5 text-xs">
                <span className="w-2 h-2 rounded-full bg-[#c79a45] mt-1.5 shrink-0" />
                <div className="flex-1">
                  <span className="font-semibold text-[#073a2d] uppercase">
                    {event.status.replaceAll('_', ' ')}
                  </span>
                  {event.description && (
                    <p className="text-[#69726d] mt-0.5">{event.description}</p>
                  )}
                  <time className="text-[10px] text-[#717975] block mt-0.5">
                    {new Date(event.createdAt).toLocaleString()}
                  </time>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Footer Navigation */}
      <div className="px-5 py-3.5 bg-white border-t border-[#deddd3] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 text-[#69726d]">
          <MapPin className="w-3.5 h-3.5 text-[#717975] shrink-0" />
          <span className="truncate max-w-xs sm:max-w-md">
            Destination: {formattedAddress || 'Customer Registered Address'}
          </span>
        </div>
        <div className="flex items-center gap-4">
          {trackingUrl && (
            <a
              href={trackingUrl}
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-[#073a2d] hover:text-[#c79a45] underline flex items-center gap-1"
            >
              <span>Courier Portal</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
          <Link
            href={`/track-order?id=${encodeURIComponent(orderNumber)}`}
            className="font-semibold text-[#073a2d] hover:text-[#c79a45] underline flex items-center gap-1"
          >
            <span>Full Tracking Page</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
};
