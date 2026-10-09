'use client';

import React, { useState, useEffect } from 'react';
import { Star, CheckCircle2, MessageSquare, Send } from 'lucide-react';
import { adminApi, type AdminReview } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { TablePageSkeleton } from '@/components/common/Skeleton';
import { PermissionGuard } from '@/components/auth/PermissionGuard';

function ReviewsContent() {
  const { toast } = useToast();
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submittingReviewId, setSubmittingReviewId] = useState<string | null>(null);
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    async function loadReviews() {
      setIsLoadingReviews(true);
      setLoadError(null);
      try {
        const response = await adminApi.reviews.getAll({ page: 1, limit: 50 });
        if (!response.success || !response.data) {
          throw new Error(response.error || 'Unable to load reviews');
        }
        setReviews(response.data.items);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to load reviews';
        setLoadError(message);
      } finally {
        setIsLoadingReviews(false);
      }
    }
    loadReviews();
  }, [reloadCount]);

  const sendFeedback = async (review: AdminReview, formData: FormData) => {
    const feedback = String(formData.get('feedback') ?? '').trim();
    if (!feedback) {
      toast.error('Write feedback before sending');
      return;
    }

    setSubmittingReviewId(review.id);
    try {
      const response = await adminApi.reviews.sendFeedback(review.id, feedback);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Unable to send review feedback');
      }
      const feedbackData = response.data;
      setReviews((current) =>
        current.map((item) =>
          item.id === review.id
            ? {
                ...item,
                adminFeedback: feedbackData.adminFeedback,
                adminFeedbackAt: feedbackData.adminFeedbackAt,
              }
            : item,
        ),
      );
      toast.success('Feedback sent. The customer will be notified.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unable to send review feedback');
    } finally {
      setSubmittingReviewId(null);
    }
  };

  if (isLoadingReviews) {
    return (
      <TablePageSkeleton
        title="Patron Editorial Reviews & Curation"
        showAddButton={false}
        rowCount={6}
      />
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="border-b border-[#deddd3] pb-6">
        <span className="text-[11px] font-bold tracking-widest uppercase text-[#717975]">
          PATRON SATISFACTION & ATELIER TESTIMONIALS
        </span>
        <h1 className="text-3xl font-serif text-[#1b1c18] mt-1 tracking-tight">Reviews</h1>
        <p className="text-xs text-[#69726d] mt-1">
          Direct verified feedback and sartorial appraisals from patrons across Bangladesh.
        </p>
      </div>

      {loadError ? (
        <div role="alert" className="bg-white border border-red-200 p-8 text-center space-y-2">
          <h3 className="font-semibold text-sm text-red-800">Could not load reviews</h3>
          <p className="text-xs text-red-700">{loadError}</p>
          <button
            type="button"
            onClick={() => setReloadCount((count) => count + 1)}
            className="text-xs font-semibold underline text-[#073a2d]"
          >
            Try again
          </button>
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white border border-[#deddd3] p-12 text-center space-y-3">
          <MessageSquare className="w-8 h-8 text-[#717975] mx-auto opacity-40" />
          <h3 className="font-serif text-lg text-[#1b1c18]">No Testimonials Yet</h3>
          <p className="text-xs text-[#717975] max-w-sm mx-auto">
            Customer reviews submitted from the boutique shop will appear here for moderation.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((rev) => {
            const author = `${rev.customer.firstName} ${rev.customer.lastName || ''}`.trim();
            const address = rev.customer.addresses[0];
            const location = address ? `${address.city}, ${address.division}` : 'Bangladesh';
            return (
              <div
                key={rev.id}
                className="bg-white border border-[#deddd3] p-6 shadow-xs space-y-3 hover:border-[#c79a45] transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#f0eee7] pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#073a2d] text-white flex items-center justify-center font-bold text-xs">
                      {author.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-xs text-[#1b1c18]">{author}</p>
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#0d4d3b] bg-[#bcedda]/40 px-1.5 py-0.2">
                          <CheckCircle2 className="w-3 h-3" />
                          Customer
                        </span>
                      </div>
                      <p className="text-[11px] text-[#717975]">
                        {rev.customer.email || rev.customer.phone} · {location}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <span className="font-medium text-[#073a2d] bg-[#fbf9f2] border border-[#deddd3] px-2.5 py-0.5">
                      {rev.product.name} · {rev.product.sku}
                    </span>
                    <span className="text-[#717975] text-[11px]">
                      {new Date(rev.createdAt).toLocaleDateString('en-GB')}
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-[#717975]">
                      {rev.status}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[#c79a45]">
                  {Array.from({ length: Math.max(0, Math.min(5, rev.rating)) }, (_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-[#c79a45]" />
                  ))}
                </div>

                <p className="text-xs text-[#404945] leading-relaxed italic">
                  &ldquo;{rev.comment}&rdquo;
                </p>
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    void sendFeedback(rev, new FormData(event.currentTarget));
                  }}
                  className="border-t border-[#f0eee7] pt-4 space-y-2"
                >
                  <label
                    htmlFor={`feedback-${rev.id}`}
                    className="block text-xs font-semibold text-[#1b1c18]"
                  >
                    Admin feedback
                  </label>
                  <textarea
                    id={`feedback-${rev.id}`}
                    name="feedback"
                    defaultValue={rev.adminFeedback || ''}
                    maxLength={3000}
                    required
                    rows={3}
                    placeholder="Write a personal response to this customer..."
                    className="w-full border border-[#deddd3] px-3 py-2 text-xs text-[#404945] focus:outline-none focus:border-[#073a2d]"
                  />
                  {rev.adminFeedbackAt && (
                    <p className="text-[10px] text-[#717975]">
                      Last sent {new Date(rev.adminFeedbackAt).toLocaleString('en-GB')}
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={submittingReviewId === rev.id}
                    className="inline-flex items-center gap-2 bg-[#073a2d] px-4 py-2 text-xs font-semibold text-white disabled:opacity-60"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {submittingReviewId === rev.id ? 'Sending...' : 'Send feedback'}
                  </button>
                </form>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function ReviewsPage() {
  return (
    <PermissionGuard permission="reviews" moduleName="Client Reviews">
      <ReviewsContent />
    </PermissionGuard>
  );
}
