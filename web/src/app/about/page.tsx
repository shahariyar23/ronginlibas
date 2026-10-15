import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Compass, Sparkles, Truck, PhoneCall, CheckCircle2 } from 'lucide-react';
import { SITE_CONFIG, getCanonicalUrl, generateOrganizationJsonLd } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'About Rongin Libas | Aristocratic Menswear Atelier — Cloth Your Identity',
  description:
    'Discover Rongin Libas, an aristocratic Bangladeshi menswear atelier in Dhaka crafting bespoke panjabis, double-mercerized knitwear, and architectural casual wear.',
  alternates: {
    canonical: getCanonicalUrl('/about'),
  },
  openGraph: {
    title: 'About Rongin Libas | Aristocratic Menswear Atelier',
    description:
      'Discover Rongin Libas, an aristocratic Bangladeshi menswear atelier in Dhaka crafting bespoke panjabis, double-mercerized knitwear, and timeless essentials.',
    url: getCanonicalUrl('/about'),
    siteName: SITE_CONFIG.name,
    images: [{ url: `${SITE_CONFIG.url}/hero-model.jpg`, width: 1200, height: 1200, alt: 'Rongin Libas Atelier Dhaka' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Rongin Libas | Cloth Your Identity',
    description:
      'Bangladeshi menswear atelier specializing in royal panjabis, mercerized knitwear, and bespoke tailoring.',
    images: [`${SITE_CONFIG.url}/hero-model.jpg`],
  },
};

export default function AboutPage() {
  const organizationSchema = generateOrganizationJsonLd();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
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
                Atelier Heritage &amp; Identity
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#073a2d] leading-tight mb-4">
              About Rongin Libas: Aristocratic Menswear Handcrafted in Dhaka
            </h1>
            <p className="font-serif italic text-lg sm:text-xl text-[#52605b] max-w-2xl">
              &ldquo;Cloth Your Identity&rdquo; — Style. Comfort. Confidence. Everyday.
            </p>
          </header>

          {/* Main Story Sections */}
          <article className="space-y-10 font-sans text-[#404945] leading-relaxed">
            {/* Section 1: Brand Ethos */}
            <section className="bg-white p-6 sm:p-8 border border-[#deddd3] space-y-4 shadow-xs">
              <h2 className="font-serif text-2xl text-[#073a2d] font-normal border-b border-[#f0eee7] pb-3">
                The Rongin Libas Philosophy
              </h2>
              <p>
                Rongin Libas is an aristocratic Bangladeshi sartorial atelier dedicated to the harmonious revival of ancestral handloom weaves, bespoke tailoring precision, and modern understated elegance. Founded in Dhaka, Bangladesh, the atelier was born out of a profound reverence for Bengal’s textile legacy and a commitment to dressing discerning gentlemen with uncompromising dignity.
              </p>
              <p>
                Our guiding philosophy, <strong>&ldquo;Cloth Your Identity,&rdquo;</strong> reflects the conviction that fine garments are not fleeting ornamentation. They are an intimate extension of a gentleman&apos;s character, cultural pride, and personal presence. Every cut, collar stance, and stitch is engineered to provide lasting comfort in our tropical climate while honoring timeless sartorial standards.
              </p>
            </section>

            {/* Section 2: Craftsmanship Pillars */}
            <section className="bg-white p-6 sm:p-8 border border-[#deddd3] space-y-6 shadow-xs">
              <h2 className="font-serif text-2xl text-[#073a2d] font-normal border-b border-[#f0eee7] pb-3">
                Our Sartorial Pillars
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-[#fbf9f2] border border-[#deddd3] space-y-2">
                  <div className="flex items-center gap-2 text-[#073a2d] font-semibold text-sm">
                    <Compass className="w-4 h-4 text-[#c79a45]" />
                    <span>Ancestral Handloom Traditions</span>
                  </div>
                  <p className="text-xs text-[#52605b]">
                    Collaborating with artisan weavers across Bengal to preserve heritage hand-embroidery, jacquard motifs, and natural cotton textures.
                  </p>
                </div>

                <div className="p-4 bg-[#fbf9f2] border border-[#deddd3] space-y-2">
                  <div className="flex items-center gap-2 text-[#073a2d] font-semibold text-sm">
                    <Sparkles className="w-4 h-4 text-[#c79a45]" />
                    <span>Premium Natural Fibers</span>
                  </div>
                  <p className="text-xs text-[#52605b]">
                    Curating double-mercerized Egyptian Giza cotton yarns, breathable linens, and high-density poplins engineered specifically for tropical resilience.
                  </p>
                </div>

                <div className="p-4 bg-[#fbf9f2] border border-[#deddd3] space-y-2">
                  <div className="flex items-center gap-2 text-[#073a2d] font-semibold text-sm">
                    <ShieldCheck className="w-4 h-4 text-[#c79a45]" />
                    <span>Doorstep Open-Box Inspection</span>
                  </div>
                  <p className="text-xs text-[#52605b]">
                    Complete peace of mind. Every client is empowered to examine visual stitching, fabric drape, and sizing before final Cash on Delivery settlement.
                  </p>
                </div>

                <div className="p-4 bg-[#fbf9f2] border border-[#deddd3] space-y-2">
                  <div className="flex items-center gap-2 text-[#073a2d] font-semibold text-sm">
                    <Truck className="w-4 h-4 text-[#c79a45]" />
                    <span>Nationwide Fulfillment</span>
                  </div>
                  <p className="text-xs text-[#52605b]">
                    Reliable courier delivery across all 64 districts in Bangladesh, supported by dedicated WhatsApp concierge assistance.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 3: The Menswear Collection Focus */}
            <section className="bg-white p-6 sm:p-8 border border-[#deddd3] space-y-4 shadow-xs">
              <h2 className="font-serif text-2xl text-[#073a2d] font-normal border-b border-[#f0eee7] pb-3">
                Core Menswear Collections
              </h2>
              <p>
                Our atelier focuses intentionally on essential menswear garments engineered for celebratory events, boardroom poise, and refined leisure:
              </p>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#073a2d] shrink-0 mt-0.5" />
                  <span>
                    <Link href="/men/panjabi" className="font-semibold text-[#073a2d] hover:underline">
                      Imperial Panjabis:
                    </Link>{' '}
                    Tailored with upright bandhgala collars, understated tone-on-tone embroidery, and ancestral jacquard weaves for weddings and celebrations.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#073a2d] shrink-0 mt-0.5" />
                  <span>
                    <Link href="/men/polos" className="font-semibold text-[#073a2d] hover:underline">
                      Double-Mercerized Polos:
                    </Link>{' '}
                    Crafted from long-staple cotton yarns with silky luster, shape retention, and reinforced ribbed collars that resist curling.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#073a2d] shrink-0 mt-0.5" />
                  <span>
                    <Link href="/men/shirts" className="font-semibold text-[#073a2d] hover:underline">
                      Tailored Formal Shirts:
                    </Link>{' '}
                    Precision-cut 2-ply Egyptian cotton poplins offering crisp posture and lightweight breathability throughout demanding workdays.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#073a2d] shrink-0 mt-0.5" />
                  <span>
                    <Link href="/men/trousers" className="font-semibold text-[#073a2d] hover:underline">
                      Architectural Trousers:
                    </Link>{' '}
                    Pleated and Gurkha-inspired waistbands structured for effortless drape above handcrafted footwear.
                  </span>
                </li>
              </ul>
            </section>

            {/* Section 4: Patron Concierge Call to Action */}
            <div className="bg-[#073a2d] text-[#fbf9f2] p-8 border border-[#c79a45]/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
              <div className="space-y-2 text-center md:text-left">
                <span className="font-sans text-[11px] uppercase tracking-[0.25em] text-[#c79a45] font-semibold block">
                  Atelier Concierge
                </span>
                <h3 className="font-serif text-2xl text-white">Have a Bespoke Inquiry or Size Question?</h3>
                <p className="font-sans text-xs text-[#c0c8c3] max-w-lg">
                  Our master cutting team in Dhaka is available via WhatsApp to help you choose the ideal size, fabric weight, or ceremonial ensemble.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/contact"
                  className="px-5 py-2.5 bg-[#c79a45] hover:bg-[#b08436] text-[#073a2d] font-sans text-xs uppercase tracking-widest font-semibold transition-colors"
                >
                  Contact Concierge
                </Link>
                <Link
                  href="/men"
                  className="px-5 py-2.5 bg-transparent hover:bg-white/10 text-white border border-[#76a493]/40 font-sans text-xs uppercase tracking-widest transition-colors"
                >
                  Explore Collection
                </Link>
              </div>
            </div>
          </article>
        </div>
      </div>
    </>
  );
}
