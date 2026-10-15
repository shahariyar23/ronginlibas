import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Share2,
  Bookmark,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Tag,
} from 'lucide-react';
import {
  SITE_CONFIG,
  getCanonicalUrl,
  generateBreadcrumbJsonLd,
  generateArticleJsonLd,
} from '@/lib/seo';
import { getArticleBySlug, getRelatedArticles } from '@/data/journal';
import { ArticleShareBar } from '@/components/journal/ArticleShareBar';

interface JournalArticlePageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: JournalArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    return {
      title: 'Article Not Found | Rongin Libas',
      robots: { index: false, follow: false },
    };
  }

  const canonical = getCanonicalUrl(`/journal/${article.slug}`);
  const imageUrl = article.featuredImage.startsWith('http')
    ? article.featuredImage
    : `${SITE_CONFIG.url}${article.featuredImage}`;

  return {
    title: `${article.seoTitle} | Rongin Libas`,
    description: article.metaDescription,
    alternates: {
      canonical,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
      },
    },
    openGraph: {
      title: article.title,
      description: article.metaDescription,
      url: canonical,
      siteName: SITE_CONFIG.name,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 1200,
          alt: article.featuredImageAlt,
        },
      ],
      type: 'article',
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      authors: [article.author.name],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.metaDescription,
      images: [imageUrl],
    },
  };
}

export default async function JournalArticlePage({
  params,
}: JournalArticlePageProps) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const relatedArticles = getRelatedArticles(article.slug, 2);

  const breadcrumbsSchema = generateBreadcrumbJsonLd([
    { name: 'Journal', url: '/journal' },
    { name: article.title, url: `/journal/${article.slug}` },
  ]);

  const articleSchema = generateArticleJsonLd({
    headline: article.title,
    description: article.metaDescription,
    url: `/journal/${article.slug}`,
    image: article.featuredImage,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    authorName: article.author.name,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <div className="bg-[#fbf9f2] min-h-screen py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb Navigation */}
          <nav
            aria-label="Breadcrumbs"
            className="mb-8 flex flex-wrap items-center gap-2 font-sans text-xs uppercase tracking-wider text-[#717975]"
          >
            <Link href="/" className="hover:text-[#073a2d] transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3 h-3 text-[#c79a45]" />
            <Link href="/journal" className="hover:text-[#073a2d] transition-colors">
              Journal
            </Link>
            <ChevronRight className="w-3 h-3 text-[#c79a45]" />
            <span className="text-[#073a2d] font-semibold truncate max-w-[200px] sm:max-w-xs">
              {article.category}
            </span>
          </nav>

          {/* Article Header */}
          <header className="mb-10 space-y-4 border-b border-[#deddd3] pb-8">
            <div className="inline-block bg-[#073a2d] text-[#fbf9f2] font-sans text-[10px] uppercase tracking-widest font-bold px-3 py-1">
              {article.category}
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#073a2d] leading-tight font-normal">
              {article.title}
            </h1>

            <p className="font-serif italic text-base sm:text-lg text-[#52605b] leading-relaxed">
              {article.excerpt}
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-between gap-4 border-t border-[#f0eee7] text-xs font-sans text-[#717975]">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-[#073a2d] font-medium">
                  <User className="w-3.5 h-3.5 text-[#c79a45]" />
                  <span>{article.author.name}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#c79a45]" />
                  <time dateTime={article.publishedAt}>
                    {new Date(article.publishedAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </time>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#c79a45]" />
                  <span>{article.readingTime}</span>
                </span>
              </div>
            </div>
          </header>

          {/* Featured Hero Image */}
          <div className="relative aspect-[16/9] w-full bg-[#f5f4ed] overflow-hidden mb-6 border border-[#deddd3] shadow-xs">
            <Image
              src={article.featuredImage}
              alt={article.featuredImageAlt}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 896px) 100vw, 896px"
            />
          </div>

          {/* Social & Resource Sharing Bar */}
          <div className="mb-10">
            <ArticleShareBar
              title={article.title}
              url={getCanonicalUrl(`/journal/${article.slug}`)}
              excerpt={article.excerpt}
            />
          </div>

          {/* Main Article Body */}
          <article className="space-y-10 font-sans text-[#404945] leading-relaxed text-sm sm:text-base">
            {article.sections.map((section, idx) => (
              <section key={idx} className="space-y-4">
                {section.heading && (
                  <h2 className="font-serif text-2xl sm:text-3xl text-[#073a2d] font-normal pt-4 border-b border-[#f0eee7] pb-2">
                    {section.heading}
                  </h2>
                )}
                {section.paragraphs.map((para, pIdx) => (
                  <p key={pIdx} className="leading-relaxed">
                    {para}
                  </p>
                ))}
                {section.callout && (
                  <div className="p-6 bg-[#fbf9f2] border-l-4 border-[#073a2d] border border-[#deddd3] my-6 space-y-2">
                    <h3 className="font-serif text-base text-[#073a2d] font-semibold">
                      {section.callout.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#52605b] leading-relaxed">
                      {section.callout.text}
                    </p>
                    {section.callout.link && (
                      <p className="pt-2">
                        <Link
                          href={section.callout.link.href}
                          className="inline-flex items-center gap-1.5 font-semibold text-xs text-[#073a2d] hover:text-[#c79a45] transition-colors underline"
                        >
                          <span>{section.callout.link.label}</span>
                          <span>→</span>
                        </Link>
                      </p>
                    )}
                  </div>
                )}
              </section>
            ))}

            {/* Article Tags */}
            <div className="pt-6 border-t border-[#deddd3] flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1 text-xs font-sans text-[#717975] mr-2">
                <Tag className="w-3.5 h-3.5 text-[#c79a45]" />
                <span>Topics:</span>
              </span>
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 bg-white border border-[#deddd3] font-sans text-[11px] text-[#52605b]"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* Bottom Article Share Bar */}
            <div className="pt-4">
              <ArticleShareBar
                title={article.title}
                url={getCanonicalUrl(`/journal/${article.slug}`)}
                excerpt={article.excerpt}
              />
            </div>

            {/* Natural Commercial Linking Hub */}
            {article.relatedLinks.length > 0 && (
              <section className="bg-white p-6 sm:p-8 border border-[#deddd3] shadow-xs space-y-4 my-10">
                <h3 className="font-serif text-xl text-[#073a2d] font-semibold">
                  Featured Sartorial Collections &amp; Inquiries
                </h3>
                <p className="text-xs text-[#52605b]">
                  Explore garments tailored to the standards and fabric specifications discussed in this guide:
                </p>
                <div className="space-y-3 pt-2">
                  {article.relatedLinks.map((link, lIdx) => (
                    <div
                      key={lIdx}
                      className="p-3.5 bg-[#fbf9f2] border border-[#deddd3] flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div>
                        <Link
                          href={link.href}
                          className="font-serif text-sm font-semibold text-[#073a2d] hover:text-[#c79a45] transition-colors underline"
                        >
                          {link.label}
                        </Link>
                        {link.description && (
                          <p className="text-[11px] text-[#717975] mt-0.5">
                            {link.description}
                          </p>
                        )}
                      </div>
                      <Link
                        href={link.href}
                        className="text-xs uppercase tracking-wider font-semibold text-[#073a2d] hover:text-[#c79a45] shrink-0"
                      >
                        View Collection →
                      </Link>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Related Articles Cards */}
            {relatedArticles.length > 0 && (
              <section className="pt-8 border-t border-[#deddd3] space-y-6">
                <h3 className="font-serif text-2xl text-[#073a2d]">
                  Related Sartorial Reading
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {relatedArticles.map((rel) => (
                    <div
                      key={rel.slug}
                      className="bg-white border border-[#deddd3] p-5 shadow-xs flex flex-col justify-between space-y-3"
                    >
                      <div className="space-y-2">
                        <span className="font-sans text-[10px] uppercase tracking-wider text-[#c79a45] font-semibold">
                          {rel.category}
                        </span>
                        <h4 className="font-serif text-base text-[#073a2d] font-semibold leading-snug">
                          <Link
                            href={`/journal/${rel.slug}`}
                            className="hover:text-[#0d4d3b] transition-colors"
                          >
                            {rel.title}
                          </Link>
                        </h4>
                        <p className="text-xs text-[#52605b] line-clamp-2">
                          {rel.excerpt}
                        </p>
                      </div>
                      <Link
                        href={`/journal/${rel.slug}`}
                        className="inline-flex items-center gap-1.5 font-sans text-xs uppercase tracking-wider font-semibold text-[#073a2d] hover:text-[#c79a45] transition-colors pt-2"
                      >
                        <span>Read Guide</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Return to Journal Button */}
            <div className="pt-6">
              <Link
                href="/journal"
                className="inline-flex items-center gap-2 font-sans text-xs uppercase tracking-wider font-semibold text-[#717975] hover:text-[#073a2d] transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Journal Publications</span>
              </Link>
            </div>
          </article>
        </div>
      </div>
    </>
  );
}
