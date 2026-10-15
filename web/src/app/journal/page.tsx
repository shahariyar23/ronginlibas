import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Clock, Calendar, ArrowRight, BookOpen } from 'lucide-react';
import { SITE_CONFIG, getCanonicalUrl, generateBreadcrumbJsonLd } from '@/lib/seo';
import { getAllArticles } from '@/data/journal';

export const metadata: Metadata = {
  title: 'The Sartorial Journal | Rongin Libas — Menswear Guides & Heritage',
  description:
    'Explore the Rongin Libas Sartorial Journal. In-depth styling guides, sizing advice, fabric care, and Bengal handloom traditions from our Dhaka atelier.',
  alternates: {
    canonical: getCanonicalUrl('/journal'),
  },
  openGraph: {
    title: 'The Sartorial Journal | Rongin Libas Atelier',
    description:
      'In-depth sartorial guides, fabric insights, and sizing advice handcrafted by the Rongin Libas editorial atelier in Dhaka.',
    url: getCanonicalUrl('/journal'),
    siteName: SITE_CONFIG.name,
    images: [{ url: `${SITE_CONFIG.url}/hero-model.jpg`, width: 1200, height: 1200, alt: 'Rongin Libas Sartorial Journal' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rongin Libas Sartorial Journal',
    description: 'Expert styling and tailoring advice for discerning gentlemen in Bangladesh.',
    images: [`${SITE_CONFIG.url}/hero-model.jpg`],
  },
};

export default function JournalHubPage() {
  const articles = getAllArticles();
  const breadcrumbSchema = generateBreadcrumbJsonLd([
    { name: 'Journal', url: '/journal' },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <div className="bg-[#fbf9f2] min-h-screen py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb Navigation */}
          <div className="mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 font-sans text-xs uppercase tracking-wider text-[#717975] hover:text-[#073a2d] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Boutique</span>
            </Link>
          </div>

          {/* Hero Header */}
          <header className="mb-12 border-b border-[#deddd3] pb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="h-px w-8 bg-[#c79a45]" />
              <span className="font-sans text-xs uppercase tracking-[0.25em] text-[#c79a45] font-semibold">
                Atelier Publications
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#073a2d] leading-tight mb-4">
              The Sartorial Journal: Menswear Insights &amp; Guides
            </h1>
            <p className="font-sans text-sm sm:text-base text-[#52605b] max-w-2xl leading-relaxed">
              Curated perspectives on bespoke fitting, fabric resilience, ceremonial dressing, and the enduring heritage of Bengal textile craftsmanship.
            </p>
          </header>

          {/* Featured Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {articles.map((article) => (
              <article
                key={article.slug}
                className="bg-white border border-[#deddd3] flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md transition-shadow duration-300"
              >
                <div>
                  {/* Article Image Container */}
                  <Link
                    href={`/journal/${article.slug}`}
                    className="block relative aspect-[16/10] bg-[#f5f4ed] overflow-hidden group"
                  >
                    <Image
                      src={article.featuredImage}
                      alt={article.featuredImageAlt}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute top-3 left-3 bg-[#073a2d] text-[#fbf9f2] font-sans text-[10px] uppercase tracking-widest font-bold px-2.5 py-1">
                      {article.category}
                    </div>
                  </Link>

                  {/* Article Card Meta */}
                  <div className="p-6 space-y-3">
                    <div className="flex items-center gap-4 text-[11px] font-sans text-[#717975]">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#c79a45]" />
                        <time dateTime={article.publishedAt}>
                          {new Date(article.publishedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </time>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#c79a45]" />
                        <span>{article.readingTime}</span>
                      </span>
                    </div>

                    <h2 className="font-serif text-lg sm:text-xl text-[#073a2d] font-semibold leading-snug">
                      <Link
                        href={`/journal/${article.slug}`}
                        className="hover:text-[#0d4d3b] transition-colors"
                      >
                        {article.title}
                      </Link>
                    </h2>

                    <p className="font-sans text-xs text-[#52605b] leading-relaxed line-clamp-3">
                      {article.excerpt}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0 border-t border-[#f0eee7] mt-4">
                  <Link
                    href={`/journal/${article.slug}`}
                    className="inline-flex items-center gap-2 font-sans text-xs uppercase tracking-widest font-semibold text-[#073a2d] hover:text-[#c79a45] transition-colors pt-4"
                  >
                    <span>Read Article</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {/* Bottom Commercial Hub Links */}
          <section className="bg-white p-8 border border-[#deddd3] shadow-xs space-y-4">
            <h2 className="font-serif text-xl sm:text-2xl text-[#073a2d]">
              Explore the Rongin Libas Wardrobe Collections
            </h2>
            <p className="font-sans text-xs text-[#52605b] leading-relaxed">
              Every insight documented in our journal reflects garments actively tailored in our Dhaka boutique:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 font-sans text-xs font-semibold">
              <Link
                href="/men/polos"
                className="p-3 bg-[#fbf9f2] border border-[#deddd3] text-[#073a2d] hover:border-[#073a2d] hover:bg-white transition-all text-center"
              >
                Mercerized Polos →
              </Link>
              <Link
                href="/men/panjabi"
                className="p-3 bg-[#fbf9f2] border border-[#deddd3] text-[#073a2d] hover:border-[#073a2d] hover:bg-white transition-all text-center"
              >
                Royal Panjabis →
              </Link>
              <Link
                href="/men/shirts"
                className="p-3 bg-[#fbf9f2] border border-[#deddd3] text-[#073a2d] hover:border-[#073a2d] hover:bg-white transition-all text-center"
              >
                Formal Shirts →
              </Link>
              <Link
                href="/men/trousers"
                className="p-3 bg-[#fbf9f2] border border-[#deddd3] text-[#073a2d] hover:border-[#073a2d] hover:bg-white transition-all text-center"
              >
                Pleated Trousers →
              </Link>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
