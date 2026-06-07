const ALIEXPRESS_PLACEHOLDER = 'https://www.aliexpress.com/';

export function aliexpress(): string {
  const url = import.meta.env.PUBLIC_ALIEXPRESS_TRACKING_URL;
  if (!url) {
    console.warn(
      '[afiliados] PUBLIC_ALIEXPRESS_TRACKING_URL ausente — usando fallback sin tracking',
    );
    return ALIEXPRESS_PLACEHOLDER;
  }
  return url;
}

export interface AmazonEsOpts {
  q?: string;
  asin?: string;
}

export function amazonEs(opts: AmazonEsOpts): string {
  const tag = import.meta.env.PUBLIC_AMAZON_TAG_ES || '';
  if (opts.asin) {
    return `https://www.amazon.es/dp/${opts.asin}?tag=${tag}`;
  }
  const q = encodeURIComponent(opts.q ?? '').replace(/%20/g, '+');
  return `https://www.amazon.es/s?k=${q}&tag=${tag}`;
}

export function relAttrs(): string {
  return 'nofollow sponsored noopener';
}
