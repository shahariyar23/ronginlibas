/**
 * Centralized Cloudinary Image Optimization & Responsive Delivery Utility
 *
 * Provides safe, deterministic image transformations for Rongin Libas:
 * - Automatic modern format negotiation (WebP / AVIF via f_auto)
 * - Automatic perceptual visual compression (q_auto)
 * - Responsive width scaling (c_limit / c_fill) to eliminate multi-megabyte payloads
 * - Fallback safety: Non-Cloudinary assets (local or external) are preserved unmodified
 * - Duplication avoidance: Prevents corrupted double-transformations on existing URLs
 */

export interface CloudinaryTransformOptions {
  width?: number;
  height?: number;
  crop?: 'limit' | 'fill' | 'fit' | 'scale' | 'thumb' | 'pad';
  quality?: string | number;
  format?: string;
  dpr?: number | string;
  preset?: 'thumbnail' | 'card' | 'detail' | 'zoom' | 'hero';
}

const PRESETS: Record<NonNullable<CloudinaryTransformOptions['preset']>, { width: number; height?: number; crop: CloudinaryTransformOptions['crop'] }> = {
  thumbnail: { width: 160, height: 213, crop: 'fill' },
  card: { width: 640, crop: 'limit' },
  detail: { width: 1200, crop: 'limit' },
  zoom: { width: 1800, crop: 'limit' },
  hero: { width: 1920, crop: 'limit' },
};

/**
 * Checks if a given URL is a Cloudinary delivery asset
 */
export function isCloudinaryUrl(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return false;
  return url.includes('res.cloudinary.com') && url.includes('/image/upload/');
}

/**
 * Transforms a Cloudinary URL by injecting responsive sizing, format negotiation, and quality optimizations.
 * If the URL is not a Cloudinary asset, the original URL is returned safely.
 */
export function getOptimizedImageUrl(
  rawUrl?: string | null,
  options: CloudinaryTransformOptions = {},
): string {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return '';
  }

  const url = rawUrl.trim();

  // If not a Cloudinary asset (e.g. /hero-model.jpg, Google avatar), return as-is
  if (!isCloudinaryUrl(url)) {
    return url;
  }

  // Resolve preset parameters
  const presetConfig = options.preset ? PRESETS[options.preset] : undefined;
  const width = options.width ?? presetConfig?.width;
  const height = options.height ?? presetConfig?.height;
  const crop = options.crop ?? presetConfig?.crop ?? (height && width ? 'fill' : 'limit');
  const quality = options.quality ?? 'auto';
  const format = options.format ?? 'auto';
  const dpr = options.dpr;

  // Build transform tokens
  const tokens: string[] = [];

  if (crop) tokens.push(`c_${crop}`);
  if (width) tokens.push(`w_${Math.round(width)}`);
  if (height) tokens.push(`h_${Math.round(height)}`);
  if (dpr) tokens.push(`dpr_${dpr}`);
  if (format) tokens.push(`f_${format}`);
  if (quality) tokens.push(`q_${quality}`);

  const transformString = tokens.join(',');

  // Parse Cloudinary URL segments around "/image/upload/"
  const uploadIndex = url.indexOf('/image/upload/');
  const prefix = url.slice(0, uploadIndex + '/image/upload/'.length);
  let suffix = url.slice(uploadIndex + '/image/upload/'.length);

  // If the URL already contains existing transformation segments before the version/publicId
  // E.g., /image/upload/c_limit,w_600/v12345/sample.webp -> strip old c_/w_/h_/f_/q_ transforms
  const segmentMatch = suffix.match(/^((?:[a-z]_[^/]+,?)+\/)(v\d+\/.*|[a-zA-Z0-9_\-./]+)$/);
  if (segmentMatch) {
    // Retain non-sizing custom transformations if any, otherwise replace
    suffix = segmentMatch[2];
  }

  return `${prefix}${transformString}/${suffix}`;
}

/**
 * Generates a standard HTML srcset attribute string for responsive Cloudinary image loading
 */
export function getCloudinarySrcSet(
  rawUrl?: string | null,
  widths: number[] = [320, 480, 640, 800, 1024, 1200],
): string {
  if (!rawUrl || !isCloudinaryUrl(rawUrl)) {
    return '';
  }

  return widths
    .map((w) => {
      const transformed = getOptimizedImageUrl(rawUrl, { width: w, crop: 'limit' });
      return `${transformed} ${w}w`;
    })
    .join(', ');
}

/**
 * Generates natural, descriptive, Google Images-ready alt text without keyword stuffing
 */
export function getNaturalAltText(
  productName: string,
  options?: {
    color?: string;
    category?: string;
    viewIndex?: number;
    totalViews?: number;
    customAlt?: string | null;
  },
): string {
  if (options?.customAlt && options.customAlt.trim().length > 3) {
    return options.customAlt.trim();
  }

  const parts: string[] = [productName.trim()];

  if (options?.color && options.color.trim().toLowerCase() !== 'standard') {
    parts.push(`in ${options.color.trim()}`);
  }

  if (options?.viewIndex !== undefined && options.totalViews && options.totalViews > 1) {
    const viewNumber = options.viewIndex + 1;
    if (viewNumber === 1) {
      parts.push('— Front silhouette view');
    } else if (viewNumber === 2) {
      parts.push('— Back & profile drape');
    } else {
      parts.push(`— Artisan detail view ${viewNumber}`);
    }
  } else if (options?.category) {
    parts.push(`— ${options.category.trim()} collection`);
  }

  parts.push('by Rongin Libas');

  return parts.join(' ');
}
