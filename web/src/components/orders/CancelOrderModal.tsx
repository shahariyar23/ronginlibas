'use client';

import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Clock, ShoppingBag, X } from 'lucide-react';

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
  size?: string | null;
  color?: string | null;
  quantity: number;
  unitPrice: number | string;
  subtotal?: number | string;
  discountAmount?: number | string;
  productImage?: string | null;
  product?: OrderProductSummary | null;
}

export interface OrderRecordForCancel {
  orderNumber: string;
  createdAt: string;
  status: string;
  paymentStatus?: string;
  paymentMethod: string;
  totalAmount: number | string;
  items: OrderItem[];
}

interface CancelOrderModalProps {
  isOpen: boolean;
  order: OrderRecordForCancel | null;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  isCancelling: boolean;
  timeRemaining?: string | null;
}

export const CancelOrderModal: React.FC<CancelOrderModalProps> = ({
  isOpen,
  order,
  onClose,
  onConfirm,
  isCancelling,
  timeRemaining,
}) => {
  // Handle ESC key to close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isCancelling) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isCancelling, onClose]);

  if (!isOpen || !order) return null;

  const formattedDate = new Date(order.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const formattedTime = new Date(order.createdAt).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });

  const grandTotal = Math.round(Number(order.totalAmount) || 0);

  const getItemName = (item: OrderItem): string => {
    return item.productName || item.product?.name || item.name || 'Bespoke Garment';
  };

  const getItemImage = (item: OrderItem): string | null => {
    return item.productImage || item.product?.images?.[0]?.url || null;
  };

  const getItemUnitPrice = (item: OrderItem): number => {
    return Number(item.unitPrice) || 0;
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cancel-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isCancelling) {
          onClose();
        }
      }}
    >
      <div className="bg-[#fbf9f2] border border-[#deddd3] rounded-lg shadow-2xl max-w-lg w-full overflow-hidden relative flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-[#deddd3] bg-[#f8f6ed] relative">
          <button
            type="button"
            onClick={onClose}
            disabled={isCancelling}
            className="absolute top-4 right-4 text-[#717975] hover:text-[#073a2d] transition-colors p-1 disabled:opacity-50 cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-full bg-red-100/70 border border-red-200 text-red-600 flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="min-w-0 pr-6">
              <h3
                id="cancel-modal-title"
                className="font-serif text-xl sm:text-2xl text-[#073a2d] font-normal leading-tight"
              >
                Cancel Order
              </h3>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#69726d]">
                <span className="font-mono font-medium text-[#073a2d] bg-[#eae7da] px-1.5 py-0.5 rounded text-[11px]">
                  #{order.orderNumber}
                </span>
                <span>•</span>
                <span>{formattedDate} at {formattedTime}</span>
              </div>
            </div>
          </div>

          {timeRemaining && (
            <div className="mt-3.5 inline-flex items-center gap-1.5 text-xs text-[#073a2d] bg-[#e8f1ec] border border-[#c6dfd4] px-2.5 py-1 rounded">
              <Clock className="w-3.5 h-3.5 text-[#073a2d]" />
              <span>Cancellation window active: <strong className="font-semibold">{timeRemaining}</strong></span>
            </div>
          )}
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
          {/* Policy / Inventory message */}
          <div className="bg-[#f5f3e9] border border-[#e5dec9] rounded p-3.5 text-xs text-[#4c4233] leading-relaxed">
            <p className="font-medium text-[#2d271f] mb-1">Notice of cancellation:</p>
            Any reserved artisan inventory will be restored to stock, and cancellation notices will be dispatched to your email and the atelier administration.
          </div>

          {/* Order Details Preview */}
          <div className="border border-[#deddd3] rounded bg-white overflow-hidden">
            <div className="bg-[#faf8f3] px-3.5 py-2.5 border-b border-[#deddd3] flex items-center justify-between text-xs">
              <span className="font-sans uppercase tracking-wider text-[#69726d] font-medium">
                Order Summary ({order.items.length} {order.items.length === 1 ? 'item' : 'items'})
              </span>
              <span className="font-serif font-semibold text-[#073a2d] text-sm">
                ৳{grandTotal.toLocaleString()}
              </span>
            </div>

            <div className="divide-y divide-[#f0eee7] max-h-52 overflow-y-auto px-3.5">
              {order.items.map((item, idx) => {
                const name = getItemName(item);
                const img = getItemImage(item);
                const unitPrice = getItemUnitPrice(item);

                return (
                  <div key={item.id || `${item.productId}-${idx}`} className="py-2.5 flex items-center gap-3">
                    <div className="w-11 h-13 shrink-0 bg-[#f5f4ed] border border-[#e4e2d8] rounded overflow-hidden flex items-center justify-center">
                      {img ? (
                        <img
                          src={img}
                          alt={name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <ShoppingBag className="w-4 h-4 text-[#c79a45]" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-serif text-xs sm:text-sm font-semibold text-[#073a2d] truncate">
                        {name}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-2 text-[11px] text-[#69726d] mt-0.5">
                        {item.color && <span>Color: {item.color}</span>}
                        {item.size && <span>Size: {item.size}</span>}
                        <span>Qty: {item.quantity}</span>
                      </div>
                    </div>
                    <div className="text-right text-xs font-semibold text-[#073a2d] shrink-0">
                      ৳{(unitPrice * item.quantity).toLocaleString()}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-[#faf8f3] px-3.5 py-2 border-t border-[#deddd3] flex items-center justify-between text-[11px] text-[#69726d]">
              <span>Payment: <strong className="text-[#404945] font-medium">{order.paymentMethod}</strong></span>
              <span>Status: <strong className="text-amber-700 font-medium">{order.paymentStatus || 'Pending'}</strong></span>
            </div>
          </div>

          <p className="text-[11px] text-[#717975] text-center italic">
            Once cancelled, this action cannot be undone. You can restore items to your shopping bag afterwards if you wish.
          </p>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-[#deddd3] bg-[#f8f6ed] flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isCancelling}
            className="w-full sm:w-auto font-sans text-xs uppercase tracking-wider border-[#deddd3] bg-white text-[#404945] hover:bg-[#f5f4ed] h-10 px-5 cursor-pointer"
          >
            Keep Order
          </Button>

          <Button
            type="button"
            onClick={() => void onConfirm()}
            loading={isCancelling}
            loadingText="Cancelling Order..."
            disabled={isCancelling}
            className="w-full sm:w-auto bg-red-700 hover:bg-red-800 text-white font-sans text-xs uppercase tracking-wider h-10 px-5 shadow-xs cursor-pointer"
          >
            Confirm Cancellation
          </Button>
        </div>
      </div>
    </div>
  );
};
