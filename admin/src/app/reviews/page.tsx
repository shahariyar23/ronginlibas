'use client';

import React, { useState, useEffect } from 'react';
import { Star, CheckCircle2, MessageSquare } from 'lucide-react';
import { TablePageSkeleton } from '@/components/common/Skeleton';

interface Review {
  id: string;
  author: string;
  location: string;
  productName: string;
  rating: number;
  date: string;
  comment: string;
  verified: boolean;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);

  useEffect(() => {
    async function loadReviews() {
      try {
        const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/reviews?limit=50`;
        const res = await fetch(url);
        const json = await res.json();
        if (json?.data?.items && Array.isArray(json.data.items)) {
          setReviews(
            json.data.items.map((r: any) => ({
              id: r.id,
              author: r.customer
                ? `${r.customer.firstName} ${r.customer.lastName || ''}`.trim()
                : 'Patron',
              location: r.customer?.addresses?.[0]?.city || 'Bangladesh',
              productName: r.product?.name || 'Garment',
              rating: r.rating || 5,
              date: new Date(r.createdAt || Date.now()).toLocaleDateString('en-GB'),
              comment: r.comment || '',
              verified: true,
            }))
          );
        }
      } catch (err) {
        console.warn('Reviews fetch fallback:', err);
      } finally {
        setIsLoadingReviews(false);
      }
    }
    loadReviews();
  }, []);

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

      {reviews.length === 0 ? (
        <div className="bg-white border border-[#deddd3] p-12 text-center space-y-3">
          <MessageSquare className="w-8 h-8 text-[#717975] mx-auto opacity-40" />
          <h3 className="font-serif text-lg text-[#1b1c18]">No Testimonials Yet</h3>
          <p className="text-xs text-[#717975] max-w-sm mx-auto">
            Customer reviews submitted from the boutique shop will appear here for moderation.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white border border-[#deddd3] p-6 shadow-xs space-y-3 hover:border-[#c79a45] transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#f0eee7] pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#073a2d] text-white flex items-center justify-center font-bold text-xs">
                    {rev.author.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-xs text-[#1b1c18]">{rev.author}</p>
                      {rev.verified && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#0d4d3b] bg-[#bcedda]/40 px-1.5 py-0.2">
                          <CheckCircle2 className="w-3 h-3" />
                          Verified Patron
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#717975]">{rev.location}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <span className="font-medium text-[#073a2d] bg-[#fbf9f2] border border-[#deddd3] px-2.5 py-0.5">
                    {rev.productName}
                  </span>
                  <span className="text-[#717975] text-[11px]">{rev.date}</span>
                </div>
              </div>

              <div className="flex items-center gap-1 text-[#c79a45]">
                {[...Array(rev.rating)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-[#c79a45]" />
                ))}
              </div>

              <p className="text-xs text-[#404945] leading-relaxed italic">
                &ldquo;{rev.comment}&rdquo;
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
