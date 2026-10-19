import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Download,
  Mail,
  PhoneCall,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Compass,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { SITE_CONFIG, getCanonicalUrl } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Press, Media Kit & Brand Assets | Rongin Libas Dhaka',
  description:
    'Official media kit, approved vector logos, brand color palette, editorial boilerplate, and press contacts for Rongin Libas menswear atelier in Dhaka, Bangladesh.',
  alternates: {
    canonical: getCanonicalUrl('/press'),
  },
  openGraph: {
    title: 'Press & Media Kit | Rongin Libas Atelier',
    description:
      'Official brand resources, high-resolution logos, brand palette, and media contact information for Rongin Libas.',
    url: getCanonicalUrl('/press'),
    siteName: SITE_CONFIG.name,
    images: [{ url: `${SITE_CONFIG.url}/hero-model.jpg`, width: 1200, height: 1200, alt: 'Rongin Libas Press Kit' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rongin Libas Press & Media Kit',
    description: 'Official media kit and brand assets for fashion journalists and creators.',
    images: [`${SITE_CONFIG.url}/hero-model.jpg`],
  },
};

export default function PressPage() {
  const brandColors = [
    { name: 'Primary Emerald', hex: '#073A2D', role: 'Primary Brand Color', textColor: 'text-white' },
    { name: 'Deep Emerald', hex: '#0D4D3B', role: 'Atelier Contrast & Accent', textColor: 'text-white' },
    { name: 'Imperial Gold', hex: '#C79A45', role: 'Accent & Crest Foil', textColor: 'text-[#073A2D]' },
    { name: 'Warm Ivory', hex: '#F8F6EF', role: 'Primary Canvas & Surface', textColor: 'text-[#073A2D]' },
    { name: 'Border Ochre', hex: '#DEDDD3', role: 'Subtle Frame & Divider', textColor: 'text-[#073A2D]' },
    { name: 'Muted Slate', hex: '#69726D', role: 'Secondary Tone & Notes', textColor: 'text-white' },
  ];

  return (
    <div className="bg-[#fbf9f2] min-h-screen py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
              Media Sanctuary &amp; Press Kit
            </span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#073a2d] leading-tight mb-4 font-normal">
            Press, Media Kit &amp; Brand Assets
          </h1>
          <p className="font-sans text-sm sm:text-base text-[#52605b] max-w-2xl leading-relaxed">
            Welcome to the official Rongin Libas media room. This resource provides journalists, fashion editors, digital publishers, and creators with verified facts, high-resolution logos, brand guidelines, and direct concierge press contacts.
          </p>
        </header>

        {/* Factsheet & Brand Boilerplate */}
        <section className="bg-white p-6 sm:p-8 border border-[#deddd3] shadow-xs space-y-6 mb-10">
          <h2 className="font-serif text-2xl text-[#073a2d] font-normal border-b border-[#f0eee7] pb-3">
            Atelier Factsheet &amp; Boilerplate
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-[#52605b] leading-relaxed">
            <div className="space-y-3">
              <p>
                <strong className="text-[#073a2d] font-semibold">Brand Name:</strong> Rongin Libas
              </p>
              <p>
                <strong className="text-[#073a2d] font-semibold">Legal Entity:</strong> Rongin Libas Atelier
              </p>
              <p>
                <strong className="text-[#073a2d] font-semibold">Headquarters:</strong> Dhaka, Bangladesh
              </p>
              <p>
                <strong className="text-[#073a2d] font-semibold">Official Website:</strong>{' '}
                <a href={SITE_CONFIG.url} className="text-[#073a2d] underline font-medium">
                  https://ronginlibas.com
                </a>
              </p>
            </div>

            <div className="space-y-3">
              <p>
                <strong className="text-[#073a2d] font-semibold">Primary Tagline:</strong> &ldquo;CLOTH YOUR IDENTITY&rdquo;
              </p>
              <p>
                <strong className="text-[#073a2d] font-semibold">Secondary Positioning:</strong> &ldquo;Style. Comfort. Confidence. Everyday.&rdquo;
              </p>
              <p>
                <strong className="text-[#073a2d] font-semibold">Product Focus:</strong> Bespoke Royal Panjabis, Double-Mercerized Polos, Tailored Shirts, Architectural Trousers.
              </p>
              <p>
                <strong className="text-[#073a2d] font-semibold">Distribution:</strong> Nationwide fulfillment across all 64 districts in Bangladesh with doorstep open-box inspection.
              </p>
            </div>
          </div>

          <div className="p-4 bg-[#fbf9f2] border border-[#deddd3] space-y-2">
            <h3 className="font-serif text-sm font-semibold text-[#073a2d]">Official Editorial Boilerplate</h3>
            <p className="font-sans text-xs text-[#404945] leading-relaxed">
              &ldquo;Rongin Libas is an aristocratic Bangladeshi sartorial atelier dedicated to the harmonious revival of ancestral Bengal handloom weaves, bespoke tailoring precision, and modern understated elegance. Founded in Dhaka, the atelier crafts royal bandhgala panjabis, double-mercerized Egyptian cotton polos, formal poplin shirts, and architectural pleated trousers engineered for tropical breathability and dignified presence.&rdquo;
            </p>
          </div>
        </section>

        {/* Brand Assets & Official Logos */}
        <section id="brand-assets" className="bg-white p-6 sm:p-8 border border-[#deddd3] shadow-xs space-y-6 mb-10">
          <div className="flex items-center justify-between border-b border-[#f0eee7] pb-3">
            <h2 className="font-serif text-2xl text-[#073a2d] font-normal">
              Official Brand Assets &amp; Logos
            </h2>
            <span className="font-sans text-xs uppercase tracking-wider text-[#c79a45] font-semibold">
              Vector &amp; Raster
            </span>
          </div>
          <p className="font-sans text-xs text-[#52605b] leading-relaxed">
            These verified assets are authorized for editorial, publication, and press coverage of Rongin Libas. Please do not alter proportions, colors, or lockup elements.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Vector SVG Emblem Card */}
            <div className="p-6 bg-[#fbf9f2] border border-[#deddd3] flex flex-col items-center justify-between space-y-4">
              <div className="w-full flex items-center justify-center py-6 min-h-[100px]">
                <Image
                  src="/logo.svg"
                  alt="Official Rongin Libas Vector Emblem"
                  width={180}
                  height={50}
                  className="h-12 w-auto object-contain"
                />
              </div>
              <div className="w-full text-center space-y-1">
                <p className="font-serif text-sm font-semibold text-[#073a2d]">Vector Emblem &amp; Wordmark</p>
                <p className="font-sans text-[11px] text-[#717975]">Format: SVG (Scalable Vector Graphics)</p>
              </div>
              <a
                href="/logo.svg"
                download="rongin-libas-logo.svg"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#073a2d] hover:bg-[#0d4d3b] text-[#fbf9f2] text-xs font-sans uppercase tracking-widest font-semibold transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download SVG</span>
              </a>
            </div>

            {/* High-Resolution PNG Card */}
            <div className="p-6 bg-[#073a2d] border border-[#073a2d] flex flex-col items-center justify-between space-y-4 text-white">
              <div className="w-full flex items-center justify-center py-6 min-h-[100px]">
                <Image
                  src="/logo.svg"
                  alt="Official Rongin Libas Emblem Dark Background"
                  width={180}
                  height={50}
                  className="h-12 w-auto object-contain brightness-0 invert"
                />
              </div>
              <div className="w-full text-center space-y-1">
                <p className="font-serif text-sm font-semibold text-white">Inverted Emblem on Atelier Dark</p>
                <p className="font-sans text-[11px] text-[#c0c8c3]">Format: High-Res PNG / SVG</p>
              </div>
              <a
                href="/logo.png"
                download="rongin-libas-logo.png"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#c79a45] hover:bg-[#b08436] text-[#073a2d] text-xs font-sans uppercase tracking-widest font-semibold transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PNG</span>
              </a>
            </div>
          </div>
        </section>

        {/* Brand Palette Tokens */}
        <section className="bg-white p-6 sm:p-8 border border-[#deddd3] shadow-xs space-y-6 mb-10">
          <h2 className="font-serif text-2xl text-[#073a2d] font-normal border-b border-[#f0eee7] pb-3">
            Atelier Color Palette
          </h2>
          <p className="font-sans text-xs text-[#52605b] leading-relaxed">
            Our visual identity is anchored in royal tones reminiscent of ancestral Bengal courts, verdant riverbanks, and artisanal parchment:
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {brandColors.map((color) => (
              <div key={color.hex} className="border border-[#deddd3] overflow-hidden shadow-2xs">
                <div
                  className={`h-20 flex items-end p-2 ${color.textColor}`}
                  style={{ backgroundColor: color.hex }}
                >
                  <span className="font-mono text-[11px] font-bold">{color.hex}</span>
                </div>
                <div className="p-2.5 bg-[#fbf9f2] space-y-0.5">
                  <p className="font-serif text-xs font-semibold text-[#073a2d] truncate">{color.name}</p>
                  <p className="font-sans text-[10px] text-[#717975] leading-tight">{color.role}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Media & Interview Inquiries Contact */}
        <section className="bg-[#073a2d] text-[#fbf9f2] p-8 border border-[#c79a45]/30 shadow-md space-y-6 mb-10">
          <div className="space-y-2">
            <span className="font-sans text-[11px] uppercase tracking-[0.25em] text-[#c79a45] font-semibold block">
              Direct Media Desk
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-white font-normal">
              Press, Editorial &amp; Partnership Inquiries
            </h2>
            <p className="font-sans text-xs text-[#c0c8c3] max-w-xl leading-relaxed">
              For interview requests with our master cutting team, garment loans for editorial styling, high-resolution product photography, or corporate partnerships, reach out directly:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
            <div className="p-4 bg-white/5 border border-white/10 space-y-1">
              <span className="text-[#c79a45] uppercase tracking-wider text-[10px] font-semibold block">
                Editorial &amp; Media Desk
              </span>
              <a href={`mailto:${SITE_CONFIG.pressEmail}`} className="text-white hover:underline text-sm font-medium">
                {SITE_CONFIG.pressEmail}
              </a>
            </div>

            <div className="p-4 bg-white/5 border border-white/10 space-y-1">
              <span className="text-[#c79a45] uppercase tracking-wider text-[10px] font-semibold block">
                WhatsApp Press Hotline
              </span>
              <a
                href={`https://wa.me/8801352926067?text=${encodeURIComponent('Press & Editorial Inquiry for Rongin Libas')}`}
                target="_blank"
                rel="noreferrer"
                className="text-white hover:underline text-sm font-medium"
              >
                01352926067
              </a>
            </div>
          </div>
        </section>

        {/* Commercial & Editorial Hub Navigation */}
        <div className="p-6 bg-[#f5f4ed] border border-[#deddd3] flex flex-wrap items-center justify-between gap-4 font-sans text-xs text-[#073a2d] font-semibold">
          <Link href="/about" className="hover:text-[#c79a45] underline">
            Read Our Brand Story →
          </Link>
          <Link href="/journal" className="hover:text-[#c79a45] underline">
            Browse The Sartorial Journal →
          </Link>
          <Link href="/contact" className="hover:text-[#c79a45] underline">
            Customer Care Concierge →
          </Link>
          <Link href="/men" className="hover:text-[#c79a45] underline">
            Explore Menswear Atelier →
          </Link>
        </div>
      </div>
    </div>
  );
}
