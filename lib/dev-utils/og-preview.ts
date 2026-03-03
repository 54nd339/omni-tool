const CORS_PROXY = 'https://corsproxy.io/?';

const OG_TAGS = [
  'og:title',
  'og:description',
  'og:image',
  'og:site_name',
  'og:type',
  'og:url',
  'twitter:card',
  'twitter:title',
  'twitter:description',
  'twitter:image',
] as const;

export interface OgMeta {
  [key: string]: string;
}

export interface OgPreviewData {
  description: string;
  image: string;
  isSummaryCard: boolean;
  siteName: string;
  title: string;
  twitterCard: string;
}

export function parseOgMeta(html: string): OgMeta {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const getMeta = (property: string) =>
    doc.querySelector(`meta[property="${property}"]`)?.getAttribute('content') ??
    doc.querySelector(`meta[name="${property}"]`)?.getAttribute('content') ??
    '';

  const meta: OgMeta = {};
  for (const prop of OG_TAGS) {
    const value = getMeta(prop);
    if (value) {
      meta[prop] = value;
    }
  }

  return meta;
}

export async function fetchOgMeta(url: string): Promise<OgMeta> {
  const response = await fetch(CORS_PROXY + encodeURIComponent(url));
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const html = await response.text();
  return parseOgMeta(html);
}

export function hasOgMeta(meta: OgMeta | null): boolean {
  return !!meta && Object.keys(meta).length > 0;
}

export function getOgPreviewData(meta: OgMeta | null): OgPreviewData {
  const title = meta?.['og:title'] ?? meta?.['twitter:title'] ?? '';
  const description = meta?.['og:description'] ?? meta?.['twitter:description'] ?? '';
  const image = meta?.['og:image'] ?? meta?.['twitter:image'] ?? '';
  const siteName = meta?.['og:site_name'] ?? '';
  const twitterCard = meta?.['twitter:card'] ?? 'summary_large_image';

  return {
    description,
    image,
    isSummaryCard: twitterCard === 'summary',
    siteName,
    title,
    twitterCard,
  };
}

export function toMetaHtml(meta: OgMeta): string {
  return Object.entries(meta)
    .map(([property, content]) => `  <meta property="${property}" content="${content.replace(/"/g, '&quot;')}" />`)
    .join('\n');
}

export function truncateLines(text: string, maxLines: number): string {
  const lines = text.split('\n').slice(0, maxLines);
  const result = lines.join('\n');
  if (text.length > result.length) {
    return `${result.trimEnd()}…`;
  }

  return result;
}
