'use client';

import Image from 'next/image';
import { Loader2 } from 'lucide-react';

import { CopyButton } from '@/components/shared/tool-actions/copy-button';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useOgPreviewTool } from '@/hooks/use-og-preview-tool';
import {
  toMetaHtml,
  truncateLines,
} from '@/lib/dev-utils/og-preview';

export function OgPreviewTool() {
  const {
    error,
    fetchOg,
    hasOg,
    hideImage,
    hiddenImages,
    loading,
    meta,
    preview,
    setUrl,
    url,
  } = useOgPreviewTool();

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
                className="max-w-[600px] overflow-hidden border bg-card text-card-foreground"
              >
                <div className="relative aspect-[1.91/1] w-full bg-muted">
                  {preview.image && !hiddenImages.has(`fb-main:${preview.image}`) ? (
                    <Image
                      src={preview.image}
                      alt=""
                      fill
                      unoptimized
                      className="object-cover"
                      referrerPolicy="no-referrer"
                      sizes="(max-width: 768px) 100vw, 600px"
                      onError={() => {
                        hideImage(`fb-main:${preview.image}`);
                      }}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                      No image
                    </div>
                  )}
                </div>
                <CardContent className="space-y-1 p-3">
                  {preview.siteName && (
                    <p className="text-xs text-muted-foreground">{preview.siteName}</p>
                  )}
                  <p className="font-semibold line-clamp-1">{preview.title || 'No title'}</p>
                  {preview.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {truncateLines(preview.description, 2)}
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
                className="max-w-[600px] overflow-hidden border bg-card text-card-foreground"
              >
                {preview.isSummaryCard ? (
                  <div className="flex gap-3 p-3">
                    <div className="aspect-square h-24 w-24 shrink-0 overflow-hidden rounded bg-muted">
                      {preview.image && !hiddenImages.has(`tw-small:${preview.image}`) ? (
                        <Image
                          src={preview.image}
                          alt=""
                          width={96}
                          height={96}
                          unoptimized
                          className="h-full w-full object-cover"
                          referrerPolicy="no-referrer"
                          onError={() => {
                            hideImage(`tw-small:${preview.image}`);
                          }}
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground text-xs">
                          —
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="font-semibold line-clamp-1">{preview.title || 'No title'}</p>
                      {preview.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {truncateLines(preview.description, 2)}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="relative aspect-[1.91/1] w-full bg-muted">
                      {preview.image && !hiddenImages.has(`tw-main:${preview.image}`) ? (
                        <Image
                          src={preview.image}
                          alt=""
                          fill
                          unoptimized
                          className="object-cover"
                          referrerPolicy="no-referrer"
                          sizes="(max-width: 768px) 100vw, 600px"
                          onError={() => {
                            hideImage(`tw-main:${preview.image}`);
                          }}
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                          No image
                        </div>
                      )}
                    </div>
                    <CardContent className="space-y-1 p-3">
                      {preview.siteName && (
                        <p className="text-xs text-muted-foreground">{preview.siteName}</p>
                      )}
                      <p className="font-semibold line-clamp-1">{preview.title || 'No title'}</p>
                      {preview.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {truncateLines(preview.description, 2)}
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
