'use client';

import React from 'react';
import { Globe, Sparkles, RefreshCw, AlertCircle, CheckCircle2, ExternalLink } from 'lucide-react';

interface ProductSeoSectionProps {
  productTitle: string;
  productDescription?: string;
  productFabric?: string;
  slug: string;
  setSlug: (val: string) => void;
  seoTitle: string;
  setSeoTitle: (val: string) => void;
  metaDescription: string;
  setMetaDescription: (val: string) => void;
  canonicalUrl: string;
  setCanonicalUrl: (val: string) => void;
  isEditing?: boolean;
}

export function ProductSeoSection({
  productTitle,
  productDescription = '',
  productFabric = '',
  slug,
  setSlug,
  seoTitle,
  setSeoTitle,
  metaDescription,
  setMetaDescription,
  canonicalUrl,
  setCanonicalUrl,
  isEditing = false,
}: ProductSeoSectionProps) {
  // Helpers to auto-generate suggested SEO copy
  const generateSlugFromName = () => {
    const clean = productTitle
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    setSlug(clean || 'garment');
  };

  const generateSuggestedTitle = () => {
    if (!productTitle) return;
    setSeoTitle(`${productTitle.trim()} | Rongin Libas — Bespoke Menswear`);
  };

  const generateSuggestedDescription = () => {
    let text = '';
    if (productFabric && productTitle) {
      text = `Handcrafted ${productTitle.trim()} tailored from ${productFabric.trim()}. Artisanal luxury cut by the Rongin Libas atelier in Dhaka.`;
    } else if (productDescription) {
      text = productDescription.replace(/<[^>]*>?/gm, '').trim().slice(0, 155);
    } else if (productTitle) {
      text = `Discover the ${productTitle.trim()} handcrafted with ancestral Bengal weaves and contemporary tailoring at Rongin Libas.`;
    }
    setMetaDescription(text);
  };

  // Character lengths
  const titleLen = seoTitle.length;
  const descLen = metaDescription.length;

  // Effective preview values
  const effectiveTitle = seoTitle || (productTitle ? `${productTitle} | Rongin Libas` : 'Garment Name | Rongin Libas');
  const effectiveSlug = slug || (productTitle ? productTitle.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-') : 'product-slug');
  const effectiveDesc =
    metaDescription ||
    (productDescription ? productDescription.slice(0, 155) : 'Handcrafted menswear tailored with ancestral Bengal weaves in Dhaka by Rongin Libas.');

  return (
    <div className="bg-white border border-[#deddd3] p-6 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#f0eee7] pb-3">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-[#073a2d]" />
          <h2 className="font-serif text-base font-medium text-[#1b1c18]">
            05. Search Engine Optimization (SEO & Google Search)
          </h2>
        </div>
        <span className="text-[10px] font-bold text-[#073a2d] bg-[#bcedda]/40 px-2.5 py-0.5 tracking-wider uppercase">
          GOOGLE INDEXING READY
        </span>
      </div>

      <p className="text-xs text-[#717975] leading-relaxed">
        Customize search engine titles, meta summaries, and permalinks so this garment ranks on Google Search and Google Images.
      </p>

      {/* Google Search Live Preview */}
      <div className="bg-[#fbf9f2] border border-[#deddd3] p-4 rounded-none space-y-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#717975] block mb-1">
          Google Search Preview (Desktop & Mobile)
        </span>
        <div className="flex items-center gap-2 text-xs text-[#202124] font-sans">
          <div className="w-4 h-4 rounded-full bg-[#073a2d] flex items-center justify-center text-[9px] text-white font-bold">
            RL
          </div>
          <div className="flex flex-col">
            <span className="text-[12px] font-medium text-[#202124] leading-tight">Rongin Libas</span>
            <span className="text-[10px] text-[#4d5156] truncate max-w-md">
              https://ronginlibas.com › products › <strong className="text-[#202124]">{effectiveSlug}</strong>
            </span>
          </div>
        </div>
        <div className="text-base sm:text-lg font-medium text-[#1a0dab] hover:underline cursor-pointer leading-snug line-clamp-1 font-sans">
          {effectiveTitle}
        </div>
        <div className="text-xs sm:text-sm text-[#4d5156] line-clamp-2 leading-relaxed font-sans">
          {effectiveDesc}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 pt-2">
        {/* 1. URL Slug */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-[#1b1c18] flex items-center gap-1.5">
              <span>Product URL Handle (Slug)</span>
              <span className="text-[#ba1a1a]">*</span>
            </label>
            <button
              type="button"
              onClick={generateSlugFromName}
              className="text-[11px] font-bold text-[#073a2d] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Generate from Title</span>
            </button>
          </div>
          <div className="flex items-stretch border border-[#deddd3] bg-white focus-within:border-[#073a2d]">
            <span className="bg-[#f5f4ed] px-3 py-2 text-xs text-[#717975] font-mono border-r border-[#deddd3] flex items-center select-none">
              ronginlibas.com/products/
            </span>
            <input
              type="text"
              value={slug}
              onChange={(e) =>
                setSlug(
                  e.target.value
                    .toLowerCase()
                    .replace(/[^a-z0-9-]/g, '-')
                    .replace(/-+/g, '-'),
                )
              }
              placeholder="e.g. premium-mercerized-polo-t-shirt"
              className="flex-1 px-3 py-2 text-xs font-mono text-[#073a2d] outline-none"
            />
          </div>
          <p className="text-[11px] text-[#717975] mt-1">
            {isEditing ? (
              <span className="text-[#073a2d] font-medium">
                Note: Changing this slug will automatically create a 301 permanent redirect from the old URL to prevent broken links.
              </span>
            ) : (
              'Unique, human-readable handle used in product URLs, sitemaps, and search engines.'
            )}
          </p>
        </div>

        {/* 2. SEO Title */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-[#1b1c18]">
              SEO Title (Page & Meta Title)
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={generateSuggestedTitle}
                className="text-[11px] font-bold text-[#073a2d] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3" />
                <span>Suggest Title</span>
              </button>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-none ${
                  titleLen >= 50 && titleLen <= 60
                    ? 'bg-[#bcedda] text-[#073a2d] font-bold'
                    : titleLen > 65
                    ? 'bg-[#ba1a1a]/10 text-[#ba1a1a] font-bold'
                    : 'bg-[#f0eee7] text-[#717975]'
                }`}
              >
                {titleLen}/60 chars
              </span>
            </div>
          </div>
          <input
            type="text"
            value={seoTitle}
            onChange={(e) => setSeoTitle(e.target.value)}
            placeholder={productTitle ? `${productTitle} | Rongin Libas — Aristocratic Menswear` : 'Leave blank to use default template'}
            className="w-full border border-[#deddd3] px-3 py-2 text-xs text-[#1b1c18] outline-none focus:border-[#073a2d]"
          />
          <p className="text-[11px] text-[#717975] mt-1 flex items-center gap-1">
            <span>Recommended length: 50–60 characters. Search engines typically truncate titles longer than 65 characters.</span>
          </p>
        </div>

        {/* 3. Meta Description */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-[#1b1c18]">
              Meta Description (Search Snippet)
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={generateSuggestedDescription}
                className="text-[11px] font-bold text-[#073a2d] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3" />
                <span>Suggest Description</span>
              </button>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-none ${
                  descLen >= 140 && descLen <= 160
                    ? 'bg-[#bcedda] text-[#073a2d] font-bold'
                    : descLen > 165
                    ? 'bg-[#ba1a1a]/10 text-[#ba1a1a] font-bold'
                    : 'bg-[#f0eee7] text-[#717975]'
                }`}
              >
                {descLen}/160 chars
              </span>
            </div>
          </div>
          <textarea
            rows={3}
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            placeholder="Summarize this garment's weave, fit, and elegance for search engine snippets (approximately 140–160 characters)..."
            className="w-full border border-[#deddd3] px-3 py-2 text-xs text-[#1b1c18] outline-none focus:border-[#073a2d] resize-none"
          />
          <p className="text-[11px] text-[#717975] mt-1">
            Recommended length: 140–160 characters. Accurately describes what patrons will discover on the product page.
          </p>
        </div>

        {/* 4. Canonical URL (Optional) */}
        <div>
          <label className="text-xs font-semibold text-[#1b1c18] block mb-1.5">
            Custom Canonical URL (Advanced)
          </label>
          <input
            type="url"
            value={canonicalUrl}
            onChange={(e) => setCanonicalUrl(e.target.value)}
            placeholder={`Default: https://ronginlibas.com/products/${effectiveSlug}`}
            className="w-full border border-[#deddd3] px-3 py-2 text-xs text-[#1b1c18] outline-none focus:border-[#073a2d]"
          />
          <p className="text-[11px] text-[#717975] mt-1">
            Optional. Leave empty to automatically point to this product's own URL. Only specify if this product is an intentional duplicate or variant canonicalized to a master product.
          </p>
        </div>
      </div>
    </div>
  );
}
