'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Star, CheckCircle2, MessageSquare, Send, Check, X, Clock, ShieldCheck, Loader2 } from 'lucide-react';
import { adminApi, type AdminReview } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { TablePageSkeleton } from '@/components/common/Skeleton';
import { PermissionGuard } from '@/components/auth/PermissionGuard';

type ReviewFilterStatus = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED';

function ReviewsContent() {
  const { toast } = useToast();
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submittingReviewId, setSubmittingReviewId] = useState<string | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<ReviewFilterStatus>('ALL');
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    async function loadReviews() {
      setIsLoadingReviews(true);
      setLoadError(null);
      try {
        const response = await adminApi.reviews.getAll({ page: 1, limit: 100 });
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

  const updateReviewStatus = async (
    reviewId: string,
    newStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'HIDDEN',
  ) => {
    setUpdatingStatusId(reviewId);
    try {
      const response = await adminApi.reviews.updateStatus(reviewId, newStatus);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to update review status');
      }
      setReviews((current) =>
        current.map((item) =>
          item.id === reviewId ? { ...item, status: newStatus } : item,
        ),
      );
      if (newStatus === 'APPROVED') {
        toast.success('Review approved! It is now published live on the boutique product page.');
      } else if (newStatus === 'REJECTED') {
        toast.success('Review marked as rejected.');
      } else {
        toast.success('Review status updated to ' + newStatus);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unable to update status');
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const sendFeedback = async (
    review: AdminReview,
    feedbackText: string,
    autoApprove = false,
  ) => {
    const feedback = feedbackText.trim();
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

      let nextStatus = review.status;
      if (autoApprove && review.status !== 'APPROVED') {
        const statusRes = await adminApi.reviews.updateStatus(review.id, 'APPROVED');
        if (statusRes.success) {
          nextStatus = 'APPROVED';
        }
      }

      setReviews((current) =>
        current.map((item) =>
          item.id === review.id
            ? {
                ...item,
                status: nextStatus,
                adminFeedback: feedbackData.adminFeedback,
                adminFeedbackAt: feedbackData.adminFeedbackAt,
              }
            : item,
        ),
      );

      if (autoApprove) {
        toast.success('Feedback sent & review approved live on the store!');
      } else {
        toast.success('Feedback sent. The customer will be notified.');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unable to send review feedback');
    } finally {
      setSubmittingReviewId(null);
    }
  };

  const filteredReviews = useMemo(() => {
    if (statusFilter === 'ALL') return reviews;
    return reviews.filter((r) => r.status === statusFilter);
  }, [reviews, statusFilter]);

  const counts = useMemo(() => {
    return {
      all: reviews.length,
      pending: reviews.filter((r) => r.status === 'PENDING').length,
      approved: reviews.filter((r) => r.status === 'APPROVED').length,
      rejected: reviews.filter((r) => r.status === 'REJECTED').length,
    };
  }, [reviews]);

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
      <div className="border-b border-[#deddd3] pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold tracking-widest uppercase text-[#717975]">
            PATRON SATISFACTION &amp; ATELIER TESTIMONIALS
          </span>
          <h1 className="text-3xl font-serif text-[#1b1c18] mt-1 tracking-tight">Reviews &amp; Moderation</h1>
          <p className="text-xs text-[#69726d] mt-1">
            Moderate submitted customer appraisals and publish reflections directly to boutique garments.
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 bg-[#fbf9f2] p-1 border border-[#deddd3]">
          {(
            [
              { key: 'ALL', label: 'All Reviews', count: counts.all },
              { key: 'PENDING', label: 'Pending', count: counts.pending },
              { key: 'APPROVED', label: 'Approved', count: counts.approved },
              { key: 'REJECTED', label: 'Rejected', count: counts.rejected },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3 py-1.5 text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                statusFilter === tab.key
                  ? 'bg-[#073a2d] text-white shadow-xs'
                  : 'text-[#404945] hover:text-[#073a2d]'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  statusFilter === tab.key
                    ? 'bg-white/20 text-white'
                    : 'bg-[#ebe8df] text-[#717975]'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
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
      ) : filteredReviews.length === 0 ? (
        <div className="bg-white border border-[#deddd3] p-12 text-center space-y-3">
          <MessageSquare className="w-8 h-8 text-[#717975] mx-auto opacity-40" />
          <h3 className="font-serif text-lg text-[#1b1c18]">
            {statusFilter === 'ALL'
              ? 'No Testimonials Yet'
              : `No ${statusFilter.toLowerCase()} reviews found`}
          </h3>
          <p className="text-xs text-[#717975] max-w-sm mx-auto">
            {statusFilter === 'PENDING'
              ? 'All customer reviews have been moderated. You are all caught up!'
              : 'Customer reviews submitted from the boutique shop will appear here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((rev) => {
            const author = `${rev.customer.firstName} ${rev.customer.lastName || ''}`.trim();
            const address = rev.customer.addresses?.[0];
            const location = address ? `${address.city}, ${address.division}` : 'Bangladesh';
            const isPending = rev.status === 'PENDING';
            const isApproved = rev.status === 'APPROVED';
            const isRejected = rev.status === 'REJECTED';
            const isUpdating = updatingStatusId === rev.id;

            return (
              <div
                key={rev.id}
                className={`bg-white border p-6 shadow-xs space-y-4 transition-colors ${
                  isPending
                    ? 'border-[#c79a45]/60 bg-[#fffdf9]'
                    : isApproved
                    ? 'border-[#deddd3] hover:border-[#073a2d]'
                    : 'border-[#deddd3] opacity-80'
                }`}
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#f0eee7] pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#073a2d] text-white flex items-center justify-center font-bold text-xs">
                      {author.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-xs text-[#1b1c18]">{author}</p>
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#0d4d3b] bg-[#bcedda]/40 px-1.5 py-0.2">
                          <CheckCircle2 className="w-3 h-3" />
                          Verified Patron
                        </span>
                      </div>
                      <p className="text-[11px] text-[#717975]">
                        {rev.customer.email || rev.customer.phone} · {location}
                      </p>
                    </div>
                  </div>

                  {/* Product info & Status Badge */}
                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    <span className="font-medium text-[#073a2d] bg-[#fbf9f2] border border-[#deddd3] px-2.5 py-1">
                      {rev.product.name} ({rev.product.sku})
                    </span>
                    <span className="text-[#717975] text-[11px]">
                      {new Date(rev.createdAt).toLocaleDateString('en-GB')}
                    </span>

                    {/* Status Badge */}
                    {isApproved && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#073a2d] bg-[#b0ecd3]/50 px-2 py-0.5 border border-[#073a2d]/20">
                        <Check className="w-3 h-3" />
                        Approved &amp; Live
                      </span>
                    )}
                    {isPending && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#9a6700] bg-[#fef3cd] px-2 py-0.5 border border-[#c79a45]/40 animate-pulse">
                        <Clock className="w-3 h-3" />
                        Pending Moderation
                      </span>
                    )}
                    {isRejected && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#ba1a1a] bg-[#ba1a1a]/10 px-2 py-0.5 border border-[#ba1a1a]/30">
                        <X className="w-3 h-3" />
                        Rejected
                      </span>
                    )}
                  </div>
                </div>

                {/* Rating & Review Text */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1 text-[#c79a45]">
                    {Array.from({ length: Math.max(0, Math.min(5, rev.rating)) }, (_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#c79a45]" />
                    ))}
                    <span className="ml-2 text-xs font-bold text-[#073a2d]">
                      {rev.rating} / 5 Stars
                    </span>
                  </div>

                  <p className="text-sm text-[#1b1c18] leading-relaxed bg-[#fbf9f2] p-3.5 border border-[#f0eee7] rounded-none">
                    &ldquo;{rev.comment}&rdquo;
                  </p>
                </div>

                {/* Attached Garment Photos */}
                {rev.images && rev.images.length > 0 && (
                  <div className="pt-1">
                    <p className="text-[11px] font-semibold text-[#717975] mb-2 flex items-center gap-1">
                      <span>Attached Garment Photos ({rev.images.length}):</span>
                    </p>
                    <div className="flex flex-wrap gap-2.5">
                      {rev.images.map((imgUrl, imgIdx) => (
                        <a
                          key={imgIdx}
                          href={imgUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="w-20 h-24 rounded border border-[#deddd3] overflow-hidden hover:opacity-90 hover:border-[#c79a45] transition-all bg-[#fbf9f2] shrink-0 block shadow-xs"
                          title="Click to view full photo"
                        >
                          <img
                            src={imgUrl}
                            alt={`Review photo ${imgIdx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Direct Moderation Control Buttons Bar */}
                <div className="bg-[#fcfaf5] p-3 border border-[#deddd3] flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#717975]">
                      Moderation Action:
                    </span>
                    {!isApproved && (
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => updateReviewStatus(rev.id, 'APPROVED')}
                        className="inline-flex items-center gap-1.5 bg-[#073a2d] hover:bg-[#0d4d3b] text-white px-3 py-1.5 text-xs font-semibold shadow-xs disabled:opacity-50 cursor-pointer transition-colors"
                      >
                        {isUpdating ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Check className="w-3.5 h-3.5" />
                        )}
                        <span>Approve &amp; Publish to Store</span>
                      </button>
                    )}

                    {!isRejected && (
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => updateReviewStatus(rev.id, 'REJECTED')}
                        className="inline-flex items-center gap-1.5 bg-white border border-[#ba1a1a]/40 hover:bg-[#ba1a1a]/10 text-[#ba1a1a] px-3 py-1.5 text-xs font-semibold disabled:opacity-50 cursor-pointer transition-colors"
                      >
                        {isUpdating ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <X className="w-3.5 h-3.5" />
                        )}
                        <span>Reject Review</span>
                      </button>
                    )}

                    {!isPending && (
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => updateReviewStatus(rev.id, 'PENDING')}
                        className="inline-flex items-center gap-1.5 bg-white border border-[#deddd3] hover:bg-[#ebe8df] text-[#404945] px-2.5 py-1.5 text-xs font-semibold disabled:opacity-50 cursor-pointer transition-colors"
                      >
                        {isUpdating ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Clock className="w-3 h-3 text-[#717975]" />
                        )}
                        <span>Revert to Pending</span>
                      </button>
                    )}
                  </div>

                  <p className="text-[11px] text-[#717975] italic">
                    {isApproved
                      ? 'Live on product page for all customers.'
                      : isPending
                      ? 'Hidden from product page until approved.'
                      : 'Hidden from store.'}
                  </p>
                </div>

                {/* Atelier Feedback Reply Form */}
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    const form = event.currentTarget;
                    const feedback = String(new FormData(form).get('feedback') ?? '');
                    void sendFeedback(rev, feedback, false);
                  }}
                  className="border-t border-[#f0eee7] pt-4 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor={`feedback-${rev.id}`}
                      className="block text-xs font-semibold text-[#1b1c18] uppercase tracking-wider"
                    >
                      Official Atelier Response
                    </label>
                    {rev.adminFeedbackAt && (
                      <span className="text-[10px] text-[#717975]">
                        Last sent {new Date(rev.adminFeedbackAt).toLocaleString('en-GB')}
                      </span>
                    )}
                  </div>

                  <textarea
                    id={`feedback-${rev.id}`}
                    name="feedback"
                    defaultValue={rev.adminFeedback || ''}
                    maxLength={3000}
                    required
                    rows={3}
                    placeholder="Write a personal atelier reflection to this patron..."
                    className="w-full border border-[#deddd3] bg-white px-3 py-2 text-xs text-[#1b1c18] focus:outline-none focus:border-[#073a2d]"
                  />

                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      type="submit"
                      disabled={submittingReviewId === rev.id}
                      className="inline-flex items-center gap-2 bg-[#073a2d] hover:bg-[#0d4d3b] px-4 py-2 text-xs font-semibold text-white disabled:opacity-60 cursor-pointer transition-colors"
                    >
                      {submittingReviewId === rev.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                      <span>Send Response</span>
                    </button>

                    {/* Quick combo action: Send Response & Approve in one click */}
                    {!isApproved && (
                      <button
                        type="button"
                        disabled={submittingReviewId === rev.id}
                        onClick={(event) => {
                          const form = event.currentTarget.closest('form');
                          if (!form) return;
                          const feedback = String(new FormData(form).get('feedback') ?? '');
                          void sendFeedback(rev, feedback, true);
                        }}
                        className="inline-flex items-center gap-1.5 bg-[#c79a45] hover:bg-[#b08535] px-4 py-2 text-xs font-semibold text-white disabled:opacity-60 cursor-pointer transition-colors"
                      >
                        {submittingReviewId === rev.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <ShieldCheck className="w-3.5 h-3.5" />
                        )}
                        <span>Send Response &amp; Approve</span>
                      </button>
                    )}
                  </div>
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
