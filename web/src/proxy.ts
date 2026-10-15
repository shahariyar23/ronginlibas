import { NextResponse, type NextRequest } from 'next/server';

const CANONICAL_HOST = 'ronginlibas.com';
const CANONICAL_ORIGIN = `https://${CANONICAL_HOST}`;

/**
 * Next.js 16 App Router Proxy for SEO Canonical Routing & Permanent Redirections
 *
 * Responsibilities:
 * 1. Canonical Hostname: Permanent 308 redirect of www.ronginlibas.com -> ronginlibas.com
 * 2. Protocol Enforcement: Permanent 308 redirect of HTTP -> HTTPS for production domain
 * 3. Trailing Slash Enforcement: Permanent 308 redirect removing trailing slashes (e.g. /shop/ -> /shop)
 * 4. Single-Jump Resolution: Collapses combined issues (e.g., http://www.ronginlibas.com/shop/) into a single 308 redirect
 * 5. Environment Isolation: Preserves HTTP and localhost during local development and preview deployments
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Extract host without port and normalize to lowercase
  const rawHost =
    request.headers.get('x-forwarded-host') ||
    request.headers.get('host') ||
    request.nextUrl.host ||
    '';
  const host = rawHost.toLowerCase().split(':')[0];

  // Extract protocol ('http' or 'https')
  const proto = (
    request.headers.get('x-forwarded-proto') ||
    request.nextUrl.protocol.replace(':', '') ||
    'https'
  ).toLowerCase();

  // Local development detection
  const isLocalhost =
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host === '0.0.0.0' ||
    host.endsWith('.local') ||
    host.endsWith('.internal');

  // Preview environment detection (e.g. Vercel previews, Cloudflare Pages previews)
  const isPreviewHost =
    host.endsWith('.vercel.app') ||
    host.endsWith('.pages.dev') ||
    host.endsWith('.workers.dev');

  let shouldRedirect = false;
  let targetHost = host;
  let targetProto = proto;
  let targetPath = pathname;

  // 1. Hostname & Protocol Normalization (Production only)
  if (!isLocalhost && !isPreviewHost) {
    // Redirect www.ronginlibas.com to ronginlibas.com
    if (host === 'www.ronginlibas.com' || host === 'www.ronginlibas.com.') {
      targetHost = CANONICAL_HOST;
      shouldRedirect = true;
    }

    // Redirect HTTP to HTTPS for the authoritative production domain
    if (targetHost === CANONICAL_HOST && proto === 'http') {
      targetProto = 'https';
      shouldRedirect = true;
    }
  }

  // 2. Trailing Slash Normalization (remove trailing slashes for non-root paths)
  if (targetPath.length > 1 && targetPath.endsWith('/')) {
    targetPath = targetPath.replace(/\/+$/, '');
    shouldRedirect = true;
  }

  // 3. Semantic Category Route Consolidation (/categories or /categories/:slug -> /men or /men/:slug)
  if (targetPath === '/categories') {
    targetPath = '/men';
    shouldRedirect = true;
  } else if (targetPath.startsWith('/categories/')) {
    const categorySlug = targetPath.replace(/^\/categories\//, '').split('/')[0];
    targetPath = categorySlug ? `/men/${categorySlug}` : '/men';
    shouldRedirect = true;
  }

  // 3b. Product Root Consolidation (/product or /products -> /shop)
  if (targetPath === '/product' || targetPath === '/products') {
    targetPath = '/shop';
    shouldRedirect = true;
  }

  // 4. Legacy Facet/Query Parameter Canonical Redirects
  // Redirect legacy /shop?gender=MEN or /shop?category=:slug to semantic /men routes when not faceted
  let nextSearch = search;
  if (targetPath === '/shop') {
    const searchParams = request.nextUrl.searchParams;
    const gender = searchParams.get('gender')?.toUpperCase();
    const category = searchParams.get('category');
    const isFacetedFilter =
      searchParams.has('size') ||
      searchParams.has('color') ||
      searchParams.has('fabric') ||
      searchParams.has('fabricOrigin') ||
      searchParams.has('fit') ||
      searchParams.has('minPrice') ||
      searchParams.has('maxPrice') ||
      searchParams.has('q') ||
      searchParams.has('search') ||
      searchParams.has('page') ||
      searchParams.has('filter') ||
      searchParams.has('newArrival') ||
      searchParams.has('bestSeller') ||
      searchParams.has('offers');

    if (!isFacetedFilter) {
      if (category && (gender === 'MEN' || !gender)) {
        targetPath = `/men/${encodeURIComponent(category)}`;
        const cleanedParams = new URLSearchParams(searchParams);
        cleanedParams.delete('category');
        cleanedParams.delete('gender');
        nextSearch = cleanedParams.toString() ? `?${cleanedParams.toString()}` : '';
        shouldRedirect = true;
      } else if (gender === 'MEN' && !category) {
        targetPath = '/men';
        const cleanedParams = new URLSearchParams(searchParams);
        cleanedParams.delete('gender');
        nextSearch = cleanedParams.toString() ? `?${cleanedParams.toString()}` : '';
        shouldRedirect = true;
      }
    }
  }

  // Execute single permanent redirect if any normalization triggered
  if (shouldRedirect) {
    // If the target is the canonical production domain
    if (targetHost === CANONICAL_HOST) {
      const destination = `${CANONICAL_ORIGIN}${targetPath}${nextSearch}`;
      return NextResponse.redirect(destination, 308);
    }

    // For localhost or preview deployments undergoing trailing slash normalization
    const destination = new URL(request.url);
    destination.pathname = targetPath;
    destination.search = nextSearch.startsWith('?') ? nextSearch.slice(1) : nextSearch;
    return NextResponse.redirect(destination, 308);
  }

  return NextResponse.next();
}

// Backwards compatibility export
export const middleware = proxy;

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - sitemap.xml, robots.txt (search engine control files)
     * - static file extensions (.svg, .png, .jpg, .jpeg, .webp, .gif, .woff, .woff2, .ttf, .css, .js)
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap\\.xml|robots\\.txt|.*\\.(?:svg|png|jpg|jpeg|webp|gif|woff|woff2|ttf|css|js|map)$).*)',
  ],
};
