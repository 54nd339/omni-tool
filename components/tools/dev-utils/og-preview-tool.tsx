'use client';

import { useState, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CopyButton } from '@/components/shared/copy-button';

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

interface OgMeta {
  [key: string]: string;
}

function parseOgMeta(html: string): OgMeta {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const getMeta = (property: string) =>
    doc.querySelector(`meta[property="${property}"]`)?.getAttribute('content') ??
    doc.querySelector(`meta[name="${property}"]`)?.getAttribute('content') ??
    '';

  const meta: OgMeta = {};
  for (const prop of OG_TAGS) {
    const val = getMeta(prop);
    if (val) meta[prop] = val;
  }
  return meta;
}

function toMetaHtml(meta: OgMeta): string {
  return Object.entries(meta)
    .map(([prop, content]) => `  <meta property="${prop}" content="${content.replace(/"/g, '&quot;')}" />`)
    .join('\n');
}

function truncate(text: string, maxLines: number): string {
  const lines = text.split('\n').slice(0, maxLines);
  const result = lines.join('\n');
  if (text.length > result.length) return result.trimEnd() + '…';
  return result;
}

export function OgPreviewTool() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<OgMeta | null>(null);

  const fetchOg = useCallback(async () => {
    const trimmed = url.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);
    setMeta(null);

    try {
      const res = await fetch(CORS_PROXY + encodeURIComponent(trimmed));
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const html = await res.text();
      const parsed = parseOgMeta(html);
      setMeta(Object.keys(parsed).length ? parsed : null);
      if (Object.keys(parsed).length === 0) {
        setError('No OpenGraph meta tags found on this page.');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch URL');
    } finally {
      setLoading(false);
    }
  }, [url]);

  const hasOg = meta && Object.keys(meta).length > 0;
  const fbTitle = meta?.['og:title'] ?? meta?.['twitter:title'] ?? '';
  const fbDesc = meta?.['og:description'] ?? meta?.['twitter:description'] ?? '';
  const fbImage = meta?.['og:image'] ?? meta?.['twitter:image'] ?? '';
  const fbSite = meta?.['og:site_name'] ?? '';
  const twitterCard = meta?.['twitter:card'] ?? 'summary_large_image';

  const isSummaryCard = twitterCard === 'summary';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Input
          type="url"
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && fetchOg()}
          className="flex-1"
          disabled={loading}
        />
        <Button onClick={fetchOg} disabled={loading || !url.trim()} className="shrink-0">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Fetching…
            </>
          ) : (
            'Fetch'
          )}
        </Button>
      </div>

      {error && !hasOg && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {hasOg && (
        <>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Facebook / LinkedIn card */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Facebook / LinkedIn
              </p>
              <Card
                className="overflow-hidden border bg-card text-card-foreground"
                style={{ maxWidth: 600 }}
              >
                <div className="aspect-[1.91/1] w-full bg-muted">
                  {fbImage ? (
                    <img
                      src={fbImage}
                      alt=""
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                      No image
                    </div>
                  )}
                </div>
                <CardContent className="space-y-1 p-3">
                  {fbSite && (
                    <p className="text-xs text-muted-foreground">{fbSite}</p>
                  )}
                  <p className="font-semibold line-clamp-1">{fbTitle || 'No title'}</p>
                  {fbDesc && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {truncate(fbDesc, 2)}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Twitter card */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Twitter
              </p>
              <Card
                className="overflow-hidden border bg-card text-card-foreground"
                style={{ maxWidth: 600 }}
              >
                {isSummaryCard ? (
                  <div className="flex gap-3 p-3">
                    <div className="aspect-square h-24 w-24 shrink-0 overflow-hidden rounded bg-muted">
                      {fbImage ? (
                        <img
                          src={fbImage}
                          alt=""
                          className="h-full w-full object-cover"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground text-xs">
                          —
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="font-semibold line-clamp-1">{fbTitle || 'No title'}</p>
                      {fbDesc && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {truncate(fbDesc, 2)}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="aspect-[1.91/1] w-full bg-muted">
                      {fbImage ? (
                        <img
                          src={fbImage}
                          alt=""
                          className="h-full w-full object-cover"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                          No image
                        </div>
                      )}
                    </div>
                    <CardContent className="space-y-1 p-3">
                      {fbSite && (
                        <p className="text-xs text-muted-foreground">{fbSite}</p>
                      )}
                      <p className="font-semibold line-clamp-1">{fbTitle || 'No title'}</p>
                      {fbDesc && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {truncate(fbDesc, 2)}
                        </p>
                      )}
                    </CardContent>
                  </>
                )}
              </Card>
            </div>
          </div>

          {/* Meta tags table */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-medium">Meta Tags</h3>
              {meta && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Copy as HTML</span>
                  <CopyButton value={toMetaHtml(meta)} size="sm" />
                </div>
              )}
            </div>
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-2 text-left font-medium">Property</th>
                    <th className="px-4 py-2 text-left font-medium">Content</th>
                  </tr>
                </thead>
                <tbody>
                  {meta &&
                    Object.entries(meta).map(([prop, content]) => (
                      <tr key={prop} className="border-b last:border-0">
                        <td className="px-4 py-2 font-mono text-muted-foreground">{prop}</td>
                        <td className="max-w-md truncate px-4 py-2" title={content}>
                          {content}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
