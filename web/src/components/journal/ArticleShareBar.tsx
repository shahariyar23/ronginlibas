'use client';

import React, { useState } from 'react';
import { Share2, Link as LinkIcon, Check } from 'lucide-react';
import { toast } from 'sonner';

const FacebookIcon = () => (
  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

interface ArticleShareBarProps {
  title: string;
  url: string;
  excerpt?: string;
}

export function ArticleShareBar({ title, url, excerpt }: ArticleShareBarProps) {
  const [copied, setCopied] = useState(false);

  const shareText = `${title} — Rongin Libas`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${url}`)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;

  const handleCopy = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        toast.success('Article link copied to clipboard');
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      toast.error('Unable to copy link');
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title,
          text: excerpt || title,
          url,
        });
      } catch {
        // User cancelled or unsupported
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white border border-[#deddd3] shadow-xs">
      <div className="flex items-center gap-2 text-xs font-sans text-[#717975]">
        <Share2 className="w-4 h-4 text-[#c79a45]" />
        <span className="font-semibold uppercase tracking-wider text-[#073a2d]">
          Share Sartorial Resource
        </span>
      </div>

      <div className="flex items-center gap-2 font-sans text-xs">
        {/* Copy Link Button */}
        <button
          onClick={handleCopy}
          type="button"
          aria-label="Copy article link"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#fbf9f2] hover:bg-[#f0eee7] text-[#073a2d] border border-[#deddd3] rounded-none transition-colors cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-[#073a2d]" />
              <span className="font-semibold">Copied!</span>
            </>
          ) : (
            <>
              <LinkIcon className="w-3.5 h-3.5 text-[#717975]" />
              <span>Copy Link</span>
            </>
          )}
        </button>

        {/* WhatsApp Share */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share guide on WhatsApp"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#073a2d] hover:bg-[#0c4e3b] text-[#fbf9f2] border border-[#073a2d] rounded-none transition-colors"
        >
          <span>WhatsApp</span>
        </a>

        {/* Facebook Share */}
        <a
          href={facebookUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share guide on Facebook"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#fbf9f2] hover:bg-[#f0eee7] text-[#073a2d] border border-[#deddd3] rounded-none transition-colors"
        >
          <FacebookIcon />
          <span>Facebook</span>
        </a>

        {/* Mobile Native Share Trigger */}
        <button
          onClick={handleNativeShare}
          type="button"
          aria-label="Share article via device options"
          className="sm:hidden inline-flex items-center gap-1 px-2.5 py-1.5 bg-white border border-[#deddd3] text-[#073a2d]"
        >
          <Share2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
