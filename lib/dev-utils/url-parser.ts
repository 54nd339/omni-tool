const FALLBACK_BASE = 'https://example.com';

export interface UrlParam {
  key: string;
  value: string;
}

export interface ParsedUrlFields {
  hash: string;
  hostname: string;
  params: UrlParam[];
  pathname: string;
  port: string;
  protocol: string;
}

export function getDefaultParsedUrlFields(): ParsedUrlFields {
  return {
    protocol: 'https:',
    hostname: 'example.com',
    port: '',
    pathname: '/',
    hash: '',
    params: [],
  };
}

export function tryParseUrlInput(input: string): { url: URL; params: UrlParam[] } | null {
  const trimmed = input.trim();
  if (!trimmed) {
    return null;
  }

  try {
    const url = trimmed.startsWith('http://') || trimmed.startsWith('https://')
      ? new URL(trimmed)
      : new URL(trimmed, FALLBACK_BASE);

    const params: UrlParam[] = [];
    url.searchParams.forEach((value, key) => {
      params.push({ key: decodeURIComponent(key), value: decodeURIComponent(value) });
    });

    return { url, params };
  } catch {
    return null;
  }
}

export function toFieldsFromParsedUrl(parsed: { url: URL; params: UrlParam[] }): ParsedUrlFields {
  return {
    protocol: parsed.url.protocol,
    hostname: parsed.url.hostname,
    port: parsed.url.port,
    pathname: parsed.url.pathname,
    hash: parsed.url.hash.slice(1),
    params: parsed.params,
  };
}

export function buildUrlFromFields(parsed: ParsedUrlFields): string {
  const protocol = parsed.protocol.endsWith(':') ? parsed.protocol : `${parsed.protocol}:`;
  const host = parsed.hostname + (parsed.port ? `:${parsed.port}` : '');
  const path = parsed.pathname.startsWith('/') ? parsed.pathname : `/${parsed.pathname}`;
  const search = new URLSearchParams();

  parsed.params.forEach(({ key, value }) => {
    if (key.trim()) {
      search.append(encodeURIComponent(key.trim()), value);
    }
  });

  const searchString = parsed.params.length ? `?${search.toString()}` : '';
  const hashString = parsed.hash ? (parsed.hash.startsWith('#') ? parsed.hash : `#${parsed.hash}`) : '';

  return `${protocol}//${host}${path}${searchString}${hashString}`;
}
