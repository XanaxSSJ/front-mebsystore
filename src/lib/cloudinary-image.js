import { ensureHttps } from '@/lib/url';

const CLOUDINARY_HOST = /res\.cloudinary\.com/i;

export const IMAGE_PRESETS = {
  thumb: { width: 120, crop: 'limit' },
  cart: { width: 160, crop: 'limit' },
  card: { width: 480, crop: 'limit' },
  galleryThumb: { width: 200, crop: 'limit' },
  galleryMain: { width: 1200, crop: 'limit' },
  checkout: { width: 120, crop: 'limit' },
  order: { width: 160, crop: 'limit' },
  adminThumb: { width: 112, crop: 'limit' },
  brandLogo: { width: 128, crop: 'limit' },
};

export function isCloudinaryUrl(url) {
  return typeof url === 'string' && CLOUDINARY_HOST.test(url);
}

function buildTransformString({ width, height, crop = 'limit', quality = 'auto', format = 'auto', dpr }) {
  const parts = [];
  if (width) parts.push(`w_${Math.round(width)}`);
  if (height) parts.push(`h_${Math.round(height)}`);
  if (width || height) parts.push(`c_${crop}`);
  parts.push(`f_${format}`, `q_${quality}`);
  if (dpr) parts.push(`dpr_${dpr}`);
  return parts.join(',');
}

export function getOptimizedImageUrl(url, options = {}) {
  const normalized = ensureHttps(url);
  if (!normalized || !isCloudinaryUrl(normalized)) return normalized;

  const preset = options.preset ? IMAGE_PRESETS[options.preset] : {};
  const merged = { ...preset, ...options };
  delete merged.preset;

  const transform = buildTransformString(merged);
  if (!transform) return normalized;

  const marker = '/upload/';
  const idx = normalized.indexOf(marker);
  if (idx === -1) return normalized;

  const prefix = normalized.slice(0, idx + marker.length);
  const suffix = normalized.slice(idx + marker.length);

  if (suffix.startsWith(`${transform}/`)) return normalized;

  return `${prefix}${transform}/${suffix}`;
}

export function getOptimizedSrcSet(url, baseWidth, options = {}) {
  if (!url || !baseWidth || !isCloudinaryUrl(url)) return undefined;

  const widths = [
    Math.round(baseWidth),
    Math.round(baseWidth * 1.5),
    Math.round(baseWidth * 2),
  ].filter((w, i, arr) => w > 0 && arr.indexOf(w) === i);

  return widths
    .map((w) => `${getOptimizedImageUrl(url, { ...options, width: w })} ${w}w`)
    .join(', ');
}
