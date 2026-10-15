import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
import { proxy } from '../src/proxy.ts';
import {
  getCanonicalUrl,
  isFacetedOrFilteredQuery,
  getFacetedRobotsDirectives,
  generateBreadcrumbJsonLd,
  generateOrganizationJsonLd,
  generateWebSiteJsonLd,
  generateArticleJsonLd,
  generateFaqJsonLd,
  generateContactPageJsonLd,
  generateProductJsonLd,
  SITE_CONFIG,
  CANONICAL_BASE_URL,
} from '../src/lib/seo.ts';
import robots from '../src/app/robots.ts';
import { getAllArticles } from '../src/data/journal.ts';

console.log('🧪 Starting Rongin Libas Step 9 Final SEO Hardening & Regression Suite...\n');

let passCount = 0;
function test(name, fn) {
  try {
    fn();
    console.log(`  ✅ PASS: ${name}`);
    passCount++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(err);
    process.exitCode = 1;
  }
}

// ==========================================
// 1. BRAND & PALETTE VERIFICATION
// ==========================================
test('Brand identity and palette are strictly approved values', () => {
  assert.equal(SITE_CONFIG.name, 'Rongin Libas');
  assert.equal(SITE_CONFIG.tagline, 'CLOTH YOUR IDENTITY');
  assert.equal(SITE_CONFIG.secondaryTagline, 'Style. Comfort. Confidence. Everyday.');
  assert.equal(SITE_CONFIG.colors.primary, '#073A2D');
  assert.equal(SITE_CONFIG.colors.deepEmerald, '#0D4D3B');
  assert.equal(SITE_CONFIG.colors.accent, '#C79A45');
  assert.equal(SITE_CONFIG.colors.parchment, '#F8F6EF');
  assert.equal(SITE_CONFIG.colors.borderOchre, '#DEDDD3');
  assert.equal(SITE_CONFIG.colors.mutedSlate, '#69726D');
});

// ==========================================
// 2. CANONICAL ENFORCEMENT
// ==========================================
test('Canonical normalization strips queries, trailing slashes, and enforces HTTPS host', () => {
  assert.equal(getCanonicalUrl('/'), 'https://ronginlibas.com');
  assert.equal(getCanonicalUrl('/men'), 'https://ronginlibas.com/men');
  assert.equal(getCanonicalUrl('/men/'), 'https://ronginlibas.com/men');
  assert.equal(getCanonicalUrl('/men/polos'), 'https://ronginlibas.com/men/polos');
  assert.equal(getCanonicalUrl('/men/polos/'), 'https://ronginlibas.com/men/polos');
  assert.equal(getCanonicalUrl('/men?size=XL&color=green'), 'https://ronginlibas.com/men');
  assert.equal(getCanonicalUrl('http://www.ronginlibas.com/products/panjabi/'), 'https://ronginlibas.com/products/panjabi');
});

// ==========================================
// 3. FACETED NAVIGATION & DIRECTIVES
// ==========================================
test('Faceted filter detection accurately classifies query strings', () => {
  assert.equal(isFacetedOrFilteredQuery({}), false);
  assert.equal(isFacetedOrFilteredQuery(null), false);
  assert.equal(isFacetedOrFilteredQuery({ page: '2' }), false);
  assert.equal(isFacetedOrFilteredQuery({ size: 'XL' }), true);
  assert.equal(isFacetedOrFilteredQuery({ color: 'emerald' }), true);
  assert.equal(isFacetedOrFilteredQuery({ q: 'panjabi' }), true);
  assert.equal(isFacetedOrFilteredQuery({ minPrice: '1000' }), true);

  const cleanRobots = getFacetedRobotsDirectives(false);
  assert.equal(cleanRobots.index, true);
  assert.equal(cleanRobots.follow, true);

  const facetedRobots = getFacetedRobotsDirectives(true);
  assert.equal(facetedRobots.index, false);
  assert.equal(facetedRobots.follow, true);
});

// ==========================================
// 4. EDGE PROXY 308 PERMANENT REDIRECTS
// ==========================================
test('Proxy enforces permanent 308 for www, trailing slash, and legacy routes', () => {
  // Test 1: www to apex
  const reqWww = new NextRequest('http://www.ronginlibas.com/men', {
    headers: { host: 'www.ronginlibas.com', 'x-forwarded-proto': 'http' },
  });
  const resWww = proxy(reqWww);
  assert.equal(resWww.status, 308);
  assert.equal(resWww.headers.get('location'), 'https://ronginlibas.com/men');

  // Test 2: Trailing slash removal
  const reqSlash = new NextRequest('https://ronginlibas.com/shop/', {
    headers: { host: 'ronginlibas.com', 'x-forwarded-proto': 'https' },
  });
  const resSlash = proxy(reqSlash);
  assert.equal(resSlash.status, 308);
  assert.equal(resSlash.headers.get('location'), 'https://ronginlibas.com/shop');

  // Test 3: Legacy /categories/polos -> /men/polos
  const reqCat = new NextRequest('https://ronginlibas.com/categories/polos', {
    headers: { host: 'ronginlibas.com', 'x-forwarded-proto': 'https' },
  });
  const resCat = proxy(reqCat);
  assert.equal(resCat.status, 308);
  assert.equal(resCat.headers.get('location'), 'https://ronginlibas.com/men/polos');

  // Test 4: Root /categories -> /men
  const reqCatRoot = new NextRequest('https://ronginlibas.com/categories', {
    headers: { host: 'ronginlibas.com', 'x-forwarded-proto': 'https' },
  });
  const resCatRoot = proxy(reqCatRoot);
  assert.equal(resCatRoot.status, 308);
  assert.equal(resCatRoot.headers.get('location'), 'https://ronginlibas.com/men');

  // Test 5: /product and /products -> /shop
  const reqProdRoot = new NextRequest('https://ronginlibas.com/products', {
    headers: { host: 'ronginlibas.com', 'x-forwarded-proto': 'https' },
  });
  const resProdRoot = proxy(reqProdRoot);
  assert.equal(resProdRoot.status, 308);
  assert.equal(resProdRoot.headers.get('location'), 'https://ronginlibas.com/shop');

  // Test 6: Legacy /shop?gender=MEN -> /men
  const reqShopGender = new NextRequest('https://ronginlibas.com/shop?gender=MEN', {
    headers: { host: 'ronginlibas.com', 'x-forwarded-proto': 'https' },
  });
  const resShopGender = proxy(reqShopGender);
  assert.equal(resShopGender.status, 308);
  assert.equal(resShopGender.headers.get('location'), 'https://ronginlibas.com/men');

  // Test 7: Legacy /shop?category=polos -> /men/polos
  const reqShopCat = new NextRequest('https://ronginlibas.com/shop?category=polos', {
    headers: { host: 'ronginlibas.com', 'x-forwarded-proto': 'https' },
  });
  const resShopCat = proxy(reqShopCat);
  assert.equal(resShopCat.status, 308);
  assert.equal(resShopCat.headers.get('location'), 'https://ronginlibas.com/men/polos');

  // Test 8: Faceted /shop?size=XL must NOT redirect (allows customer filtering)
  const reqShopFilter = new NextRequest('https://ronginlibas.com/shop?size=XL', {
    headers: { host: 'ronginlibas.com', 'x-forwarded-proto': 'https' },
  });
  const resShopFilter = proxy(reqShopFilter);
  assert.equal(resShopFilter.status, 200); // Passes through to Next.js
});

// ==========================================
// 5. STRUCTURED DATA SCHEMAS
// ==========================================
test('Structured data schemas generate valid JSON-LD objects matching visible page content', () => {
  // Breadcrumbs
  const breadcrumbs = generateBreadcrumbJsonLd([
    { name: 'Men', url: '/men' },
    { name: 'Polos', url: '/men/polos' },
  ]);
  assert.equal(breadcrumbs['@type'], 'BreadcrumbList');
  assert.equal(breadcrumbs.itemListElement.length, 3); // Home + Men + Polos
  assert.equal(breadcrumbs.itemListElement[0].name, 'Home');
  assert.equal(breadcrumbs.itemListElement[0].item, 'https://ronginlibas.com');
  assert.equal(breadcrumbs.itemListElement[1].item, 'https://ronginlibas.com/men');
  assert.equal(breadcrumbs.itemListElement[2].item, 'https://ronginlibas.com/men/polos');

  // Organization
  const org = generateOrganizationJsonLd();
  assert.equal(org['@type'], 'Organization');
  assert.equal(org.name, 'Rongin Libas');
  assert.equal(org.telephone, '01916664011');
  assert.equal(org.address.addressCountry, 'BD');

  // WebSite (no deprecated SearchAction)
  const website = generateWebSiteJsonLd();
  assert.equal(website['@type'], 'WebSite');
  assert.equal(website.potentialAction, undefined);

  // Article / BlogPosting
  const article = generateArticleJsonLd({
    headline: "Men's Polo Shirt Fit Guide",
    description: 'Expert tailoring fit guide',
    url: '/journal/mens-polo-shirt-size-and-fit-guide',
    image: '/assets/journal/polo-guide.jpg',
    datePublished: '2026-10-15',
  });
  assert.equal(article['@type'], 'BlogPosting');
  assert.equal(article.mainEntityOfPage['@id'], 'https://ronginlibas.com/journal/mens-polo-shirt-size-and-fit-guide');

  // FAQPage
  const faq = generateFaqJsonLd([
    { question: 'What is COD?', answer: 'Cash on delivery across 64 districts.' },
  ]);
  assert.equal(faq['@type'], 'FAQPage');
  assert.equal(faq.mainEntity[0].name, 'What is COD?');

  // ContactPage
  const contact = generateContactPageJsonLd();
  assert.equal(contact['@type'], 'ContactPage');
  assert.equal(contact.mainEntity.telephone, '01916664011');

  // ProductGroup with variants
  const dummyVariantProduct = {
    id: 'prod-1',
    name: 'Royal Mercerized Polo',
    slug: 'royal-mercerized-polo',
    price: 3200,
    images: ['https://res.cloudinary.com/demo/image/upload/polo.jpg'],
    variants: [
      { id: 'v1', size: 'M', color: 'Emerald', stock: 10, isActive: true },
      { id: 'v2', size: 'L', color: 'Emerald', stock: 5, isActive: true },
    ],
  };
  const productGroupSchema = generateProductJsonLd(dummyVariantProduct);
  assert.equal(productGroupSchema['@type'], 'ProductGroup');
  assert.equal(productGroupSchema.hasVariant.length, 2);
  assert.equal(productGroupSchema.hasVariant[0].offers.price, 3200);
  assert.equal(productGroupSchema.hasVariant[0].offers.availability, 'https://schema.org/InStock');
});

// ==========================================
// 6. ROBOTS.TXT INTEGRITY
// ==========================================
test('Robots.txt contains sitemap, allows discovery of noindexed pages, and secures private areas', () => {
  const robotsFn = typeof robots === 'function' ? robots : robots.default;
  const robotsConfig = robotsFn();
  assert.equal(robotsConfig.sitemap, 'https://ronginlibas.com/sitemap.xml');
  const rule = robotsConfig.rules[0];
  assert.equal(rule.userAgent, '*');
  assert.ok(rule.allow.includes('/'));
  assert.ok(rule.allow.includes('/men'));
  assert.ok(rule.allow.includes('/products/'));
  assert.ok(rule.allow.includes('/shop')); // Crawlable for directive discovery
  assert.ok(rule.disallow.includes('/checkout'));
  assert.ok(rule.disallow.includes('/cart'));
  assert.ok(rule.disallow.includes('/admin'));
  assert.ok(rule.disallow.includes('/profile'));
});

// ==========================================
// 7. EDITORIAL CONTENT DISCOVERY
// ==========================================
test('Published journal articles are discoverable with valid metadata and content', () => {
  const articlesFn = typeof getAllArticles === 'function' ? getAllArticles : getAllArticles.default;
  const articles = articlesFn();
  assert.ok(articles.length >= 2, 'Must have at least 2 published journal articles');
  for (const art of articles) {
    assert.ok(art.slug.length > 0);
    assert.ok(art.title.length > 0);
    assert.ok(art.seoTitle.length > 0);
    assert.ok(art.metaDescription.length > 0);
    const textContent = (art.sections || []).flatMap((s) => s.paragraphs).join(' ');
    assert.ok(textContent.length > 500, `Article ${art.slug} content is substantial`);
    assert.equal(art.isPublished, true);
  }
});

console.log(`\n🎉 All ${passCount} automated SEO regression tests passed successfully!\n`);
