export interface JournalCallout {
  title: string;
  text: string;
  link?: {
    href: string;
    label: string;
  };
}

export interface JournalSection {
  heading?: string;
  paragraphs: string[];
  callout?: JournalCallout;
}

export interface JournalRelatedLink {
  href: string;
  label: string;
  description?: string;
}

export interface JournalArticle {
  slug: string;
  title: string;
  seoTitle: string;
  metaDescription: string;
  excerpt: string;
  publishedAt: string;
  updatedAt: string;
  readingTime: string;
  author: {
    name: string;
    role: string;
  };
  featuredImage: string;
  featuredImageAlt: string;
  category: string;
  tags: string[];
  sections: JournalSection[];
  relatedLinks: JournalRelatedLink[];
  isPublished: boolean;
}

export const JOURNAL_ARTICLES: JournalArticle[] = [
  {
    slug: 'mens-polo-shirt-size-and-fit-guide',
    title: "Men's Polo Shirt Size & Fit Guide: Choosing Between Tailored & Relaxed Cuts",
    seoTitle: "Men's Polo Shirt Size & Fit Guide | Rongin Libas Dhaka Atelier",
    metaDescription:
      "Master the nuances of polo shirt sizing. Learn chest dimensions, collar stance, sleeve proportion, and fabric drape engineered for Dhaka's climate.",
    excerpt:
      "A tailored polo shirt should balance aristocratic presence with effortless breathability. Here is how discerning gentlemen choose precise chest, sleeve, and shoulder dimensions.",
    publishedAt: '2026-10-10T09:00:00.000Z',
    updatedAt: '2026-10-14T11:30:00.000Z',
    readingTime: '5 min read',
    author: {
      name: 'Rongin Libas Editorial Atelier',
      role: 'Master Cutting & Fit Consultant',
    },
    featuredImage: '/hero-model.jpg',
    featuredImageAlt: "Tailored double-mercerized polo shirt by Rongin Libas",
    category: 'Sartorial Guides',
    tags: ['Polos', 'Size Guide', 'Tailoring', 'Fit Guide'],
    isPublished: true,
    sections: [
      {
        heading: 'The Anatomy of an Aristocratic Polo Fit',
        paragraphs: [
          "Unlike mass-produced casual tees, an atelier polo shirt serves as a cornerstone of smart-casual elegance in Bengal. The garment must frame the collarbone with structural integrity while allowing gentle airflow across the torso.",
          "When assessing fit across the chest, the fabric should gently skim the pectorals without pulling across the placket. If horizontal tension lines appear between the Mother-of-Pearl buttons, the chest measurement is too restrictive. Conversely, excess fabric billowing at the ribcage compromises the silhouette.",
        ],
        callout: {
          title: 'Atelier Proportion Rule',
          text: 'The sleeve cuff should rest precisely at mid-bicep, embracing the arm without tight constriction. A ribbed hem that pinches creates unwanted bunching.',
          link: {
            href: '/men/polos',
            label: 'Explore Rongin Libas mercerized polo shirts',
          },
        },
      },
      {
        heading: 'Choosing Between Tailored Fit and Relaxed Silhouette',
        paragraphs: [
          "Our patrons often navigate between structured business casual environments and relaxed weekend retreats. Our tailored cut features a slight waist taper that complements natural posture, making it the quintessential pairing with structured trousers.",
          "For relaxed settings, our classic fit introduces an extra 1.5 to 2 inches through the torso and hem, prioritizing ventilation in humid tropical weather without losing the crisp collar stance.",
        ],
      },
      {
        heading: 'Fabric Weight & Mercerized Cotton Behavior',
        paragraphs: [
          "Rongin Libas polos utilize double-mercerized long-staple cotton yarns. Mercerization aligns the cotton cellulose fibers, imparting a subtle silk-like sheen and dramatically reducing shrinkage after gentle hand-washing.",
          "To preserve the collar shape and fabric luster, always dry flat in the shade. Never wring out fine mercerized knitwear.",
        ],
        callout: {
          title: 'Need Bespoke Guidance?',
          text: 'If your chest and shoulder measurements span different standard sizes, our bespoke atelier offers personalized dimension adjustments.',
          link: {
            href: '/contact',
            label: 'Contact our Dhaka tailoring concierge',
          },
        },
      },
    ],
    relatedLinks: [
      {
        href: '/men/polos',
        label: "Explore Rongin Libas mercerized polo shirts",
        description: 'Double-mercerized Egyptian cotton polos crafted for tropical resilience.',
      },
      {
        href: '/men/trousers',
        label: 'Pair with tailored pleated trousers',
        description: 'Architectural trousers engineered for balanced sartorial posture.',
      },
      {
        href: '/faq',
        label: 'Review our sizing and fit FAQ',
        description: 'Detailed instructions on garment care, chest sizing, and exchange policies.',
      },
    ],
  },
  {
    slug: 'the-art-of-styling-a-royal-panjabi',
    title: 'The Art of Styling a Royal Panjabi: Essential Guidelines for Ceremonies',
    seoTitle: 'How to Style a Royal Panjabi | Rongin Libas Ceremonial Sartorial Guide',
    metaDescription:
      'Discover timeless styling rules for Bangladeshi panjabis. Pair ancestral handloom weaves with architectural trousers and footwear for weddings and festivities.',
    excerpt:
      'The panjabi is not merely festive attire—it is an emblem of Bengali cultural dignity. Learn the essential principles of collar proportions, embroidery placement, and lower garment harmony.',
    publishedAt: '2026-10-11T10:00:00.000Z',
    updatedAt: '2026-10-14T12:00:00.000Z',
    readingTime: '6 min read',
    author: {
      name: 'Rongin Libas Editorial Atelier',
      role: 'Heritage Textile Curator',
    },
    featuredImage: '/hero-model.jpg',
    featuredImageAlt: "Handcrafted royal emerald panjabi by Rongin Libas",
    category: 'Ceremonial Heritage',
    tags: ['Panjabi', 'Wedding Style', 'Bengali Heritage', 'Festive'],
    isPublished: true,
    sections: [
      {
        heading: 'Dignity in the Collar: The Bandhgala Stance',
        paragraphs: [
          "The signature of a masterfully tailored royal panjabi lies in the neckline. A well-constructed mandarin or bandhgala collar must maintain upright poise without choking the throat. Our master cutters incorporate micro-interfacing that withstands evening humidity without wilting.",
          "Whether selecting an understated monochrome poplin or an intricately embroidered royal emerald piece, the collar should comfortably accept one finger's breadth between the fabric and neck.",
        ],
        callout: {
          title: 'Ceremonial Masterpiece',
          text: 'Each royal panjabi in our collection is cut individually, preserving the continuity of embroidered borders along the placket.',
          link: {
            href: '/men/panjabi',
            label: 'View Rongin Libas imperial panjabis',
          },
        },
      },
      {
        heading: 'The Modern Silhouette: Pleated Trousers vs. Classic Pajamas',
        paragraphs: [
          "While traditional churidars remain timeless for formal nuptials, contemporary patrons increasingly favor architectural Gurkha or pleated trousers in contrasting ivory, slate, or midnight noir.",
          "A tailored trouser breaks cleanly above handcrafted leather nagras or monk straps, lending an elevated, statuesque presence that bridges ancestral prestige with modern sartorial restraint.",
        ],
      },
      {
        heading: 'Preserving Fine Bengal Handloom Weaves',
        paragraphs: [
          "Handloom textiles breathe with life. When caring for raw silk, jacquard weaves, or fine cotton panjabis, avoid industrial tumble drying. Dry cleaning or lukewarm hand-washing with gentle ph-neutral detergents ensures the metallic zari and silk yarns remain lustrous across generations.",
        ],
        callout: {
          title: 'Doorstep Verification Guarantee',
          text: 'Inspect your panjabi stitching, embroidery, and weave quality at your doorstep with our open-box courier policy before final settlement.',
          link: {
            href: '/shipping',
            label: 'Learn about open-box doorstep delivery',
          },
        },
      },
    ],
    relatedLinks: [
      {
        href: '/men/panjabi',
        label: 'View Rongin Libas imperial panjabis',
        description: 'Handcrafted royal panjabis with ancestral embroidery and tailored collars.',
      },
      {
        href: '/men/trousers',
        label: 'Pair with architectural pleated trousers',
        description: 'Modern sartorial trousers tailored for ceremonial ensembles.',
      },
      {
        href: '/collections/new-arrivals',
        label: 'Discover new seasonal loom drops',
        description: 'Limited seasonal releases woven from natural Bengal fibers.',
      },
    ],
  },
  {
    slug: 'mens-luxury-fabrics-for-tropical-weather',
    title: "Men's Luxury Fabrics for Tropical Comfort: Egyptian Cotton, Mercerized Yarns & Handlooms",
    seoTitle: "Men's Luxury Fabrics for Tropical Climate | Rongin Libas Atelier",
    metaDescription:
      "A comprehensive guide to luxury natural fabrics for tropical humidity. Understand Egyptian Giza cotton, mercerized pique, and Bengal handlooms.",
    excerpt:
      "True sartorial luxury in South Asia requires an intimate understanding of fiber breathability, yarn counts, and weave density. Explore the natural textiles engineered for tropical comfort.",
    publishedAt: '2026-10-12T08:30:00.000Z',
    updatedAt: '2026-10-14T14:15:00.000Z',
    readingTime: '5 min read',
    author: {
      name: 'Rongin Libas Editorial Atelier',
      role: 'Textile Engineering Specialist',
    },
    featuredImage: '/hero-model.jpg',
    featuredImageAlt: "Fine cotton and handloom fabric textures by Rongin Libas",
    category: 'Textile Science',
    tags: ['Fabrics', 'Egyptian Cotton', 'Mercerization', 'Summer Style'],
    isPublished: true,
    sections: [
      {
        heading: 'Why Synthetic Blends Fail in South Asian Humidity',
        paragraphs: [
          "Polyester and synthetic stretch blends trap perspiration against the skin, fostering heat retention and rapid fabric degradation. In contrast, long-staple natural cotton and linen fibers function as microscopic ventilation networks.",
          "At Rongin Libas, our core fabric charter strictly prioritizes pure natural cottons, hand-spun silks, and certified Egyptian Giza yarns that wick humidity while maintaining a structured, crisp appearance.",
        ],
        callout: {
          title: 'The Egyptian Giza Difference',
          text: 'Giza cotton fibers possess remarkable staple length, allowing our weavers to spin ultra-fine 2-ply yarns that resist pilling and deliver unmatched softness.',
          link: {
            href: '/men/shirts',
            label: 'Discover structured Egyptian cotton shirts',
          },
        },
      },
      {
        heading: 'Double Mercerization: The Intersection of Softness & Structure',
        paragraphs: [
          "Mercerization is a specialized finishing treatment where cotton yarn is bathed in a controlled caustic bath under tension. This process swells the cotton fibers into smooth cylinders, permanently enhancing tensile strength, dye absorption, and dimensional stability.",
          "Our polo shirts undergo double mercerization—once as raw yarn, and once after knitting into pique fabric. The result is a garment that retains its deep royal hue and crisp collar even after rigorous tropical wear.",
        ],
      },
      {
        heading: 'GSM Selection: Navigating Fabric Weight',
        paragraphs: [
          "Grams per Square Meter (GSM) indicates the weight and density of a weave. For lightweight formal shirting, 100 to 120 GSM provides ethereal lightness. For structured casual polos and t-shirts, 220 to 260 GSM delivers substantial drape without trapping excessive heat.",
        ],
        callout: {
          title: 'Risk-Free Inspection',
          text: 'Every garment is backed by our doorstep open-box verification and 2-day sizing and mismatch exchange charter.',
          link: {
            href: '/returns',
            label: 'Review our open-box verification and exchange policy',
          },
        },
      },
    ],
    relatedLinks: [
      {
        href: '/men/shirts',
        label: 'Discover structured Egyptian cotton shirts',
        description: 'Impeccably tailored formal shirts cut from 2-ply long-staple cotton.',
      },
      {
        href: '/men/t-shirts',
        label: 'Shop heavyweight breathable t-shirts',
        description: '240 GSM organic cotton t-shirts engineered for lasting shape retention.',
      },
      {
        href: '/men',
        label: 'Explore the full Rongin Libas menswear collection',
        description: 'Handcrafted royal panjabis, mercerized knitwear, and trousers.',
      },
    ],
  },
  {
    slug: 'mens-clothing-care-and-longevity-guide',
    title: 'The Master Sartorial Care Guide: Preserving Handlooms, Mercerized Yarns & Linens',
    seoTitle: "Luxury Men's Garment Care Guide | Rongin Libas Dhaka Atelier",
    metaDescription:
      'Step-by-step care and preservation instructions for royal panjabis, mercerized cotton polos, and Bengal handlooms. Wash, steam, and store tailored menswear.',
    excerpt:
      'Fine garments are an investment in personal heritage. Here is the definitive atelier guide to washing, steaming, and seasonal preservation for long-staple cottons and mercerized knitwear.',
    publishedAt: '2026-10-15T08:00:00.000Z',
    updatedAt: '2026-10-15T15:00:00.000Z',
    readingTime: '6 min read',
    author: {
      name: 'Rongin Libas Editorial Atelier',
      role: 'Master Textile Conservator',
    },
    featuredImage: '/hero-model.jpg',
    featuredImageAlt: 'Artisan garment preservation and pressing by Rongin Libas',
    category: 'Textile Care',
    tags: ['Garment Care', 'Handloom Preservation', 'Mercerized Cotton', 'Ironing Guide'],
    isPublished: true,
    sections: [
      {
        heading: 'Gentle Cleansing: Preserving Natural Fiber Luster',
        paragraphs: [
          'The longevity of artisanal cottons, raw silks, and mercerized pique begins with mindful laundering. Traditional chemical dry cleaning may strip the natural protective oils from fine Egyptian yarns over time. For non-tailored cotton garments, gentle hand-washing in cool water with a mild, pH-neutral detergent is the gold standard.',
          'Never wring, twist, or scrub delicate hand-embroidered panjabi plackets. Submerge the garment, gently agitate the water, and rinse thoroughly until the water runs completely clear.',
        ],
        callout: {
          title: 'Preserving Ceremonial Embroidery',
          text: 'Heavily embroidered royal panjabis with metallic zari work should always be entrusted to a heritage-trained dry cleaner.',
          link: {
            href: '/men/panjabi',
            label: 'View Rongin Libas imperial panjabis',
          },
        },
      },
      {
        heading: 'The Geometry of Drying: Flat vs. Hanger',
        paragraphs: [
          'Wet knitwear behaves like clay; gravity will stretch the fibers if suspended from a wire hanger. After rinsing our double-mercerized polos, roll the garment inside a clean, dry cotton towel to absorb excess moisture, then lay it flat on a drying rack in the shade.',
          'Always avoid direct midday sunlight. Intense ultraviolet rays can break down cellulose bonds and cause rich jewel tones (such as atelier emerald and royal navy) to fade prematurely.',
        ],
        callout: {
          title: 'Reinforced Collar Care',
          text: 'Gently shape the ribbed polo collar while damp to maintain its crisp, non-curling stance once fully dry.',
          link: {
            href: '/men/polos',
            label: 'Explore double-mercerized polo shirts',
          },
        },
      },
      {
        heading: 'Steaming, Pressing & Monsoon Wardrobe Storage',
        paragraphs: [
          'High heat from a dry iron can crush the natural 3D texture of pique knitwear and scorch delicate handloom fibers. We strongly advocate for garment steaming. The hot moisture relaxes fiber tension naturally without flattening the fabric weave.',
          "During Bangladesh's humid monsoon months, store tailored panjabis and trousers in breathable cotton canvas garment bags—never non-porous plastic sleeves. Incorporate natural cedarwood blocks rather than harsh chemical mothballs to safeguard against humidity and textile pests.",
        ],
        callout: {
          title: 'Client Guidance & Sizing Support',
          text: 'Have questions about fabric maintenance or fitting? Our concierge team in Dhaka is always available to assist.',
          link: {
            href: '/contact',
            label: 'Connect with our Dhaka atelier concierge',
          },
        },
      },
    ],
    relatedLinks: [
      {
        href: '/men/panjabi',
        label: 'View Rongin Libas imperial panjabis',
        description: 'Heirloom ceremonial garments with ancestral handloom embroidery.',
      },
      {
        href: '/men/polos',
        label: 'Explore double-mercerized polo shirts',
        description: 'Pique knitwear with lasting color saturation and shape retention.',
      },
      {
        href: '/faq',
        label: 'Read frequently asked garment questions',
        description: 'Guidance on sizes, delivery, open-box inspection, and exchanges.',
      },
    ],
  },
];

export function getAllArticles(): JournalArticle[] {
  return JOURNAL_ARTICLES.filter((article) => article.isPublished);
}

export function getArticleBySlug(slug: string): JournalArticle | undefined {
  return JOURNAL_ARTICLES.find(
    (article) => article.slug === slug && article.isPublished,
  );
}

export function getRelatedArticles(currentSlug: string, limit = 2): JournalArticle[] {
  return JOURNAL_ARTICLES.filter(
    (article) => article.slug !== currentSlug && article.isPublished,
  ).slice(0, limit);
}
