'use client';

import React from 'react';
import { Star, CheckCircle2, MessageSquare, ThumbsUp } from 'lucide-react';

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

const REVIEWS: Review[] = [
  {
    id: 'rev-1',
    author: 'Tanvir Chowdhury',
    location: 'Gulshan-2, Dhaka',
    productName: 'Premium Green Panjabi',
    rating: 5,
    date: 'Yesterday, 04:30 PM',
    comment:
      'The double-mercerized Egyptian cotton drape is extraordinary. The tone-on-tone embroidery on the collar is understated yet undeniably royal. Arrived immaculately boxed.',
    verified: true,
  },
  {
    id: 'rev-2',
    author: 'Sheikh Farhan',
    location: 'Banani, Dhaka',
    productName: 'Royal Jamdani Panjabi',
    rating: 5,
    date: 'Oct 22, 2026',
    comment:
      'True heritage weave. The sheer density and precision of the Jamdani handloom work commands absolute respect at celebratory gatherings.',
    verified: true,
  },
  {
    id: 'rev-3',
    author: 'Ahsan Karim',
    location: 'Uttara, Dhaka',
    productName: 'Classic White Shirt',
    rating: 5,
    date: 'Oct 20, 2026',
    comment:
      'The 120s two-ply pinpoint oxford has great substance without feeling suffocating in Dhaka heat. Mother-of-pearl buttons are genuine.',
    verified: true,
  },
];

export default function ReviewsPage() {
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

      <div className="space-y-4">
        {REVIEWS.map((rev) => (
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
    </div>
  );
}
