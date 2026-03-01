'use client';

import { useCallback, useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CopyButton } from '@/components/shared/copy-button';
import { cn } from '@/lib/utils';

const FALLBACK_BASE = 'https://example.com';

interface ParsedUrl {
  protocol: string;
  hostname: string;
  port: string;
  pathname: string;
  hash: string;
  params: Array<{ key: string; value: string }>;
}

function tryParseUrl(input: string): { url: URL; params: Array<{ key: string; value: string }> } | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  try {
    const url = trimmed.startsWith('http://') || trimmed.startsWith('https://')
      ? new URL(trimmed)
      : new URL(trimmed, FALLBACK_BASE);

    const params: Array<{ key: string; value: string }> = [];
    url.searchParams.forEach((value, key) => {
      params.push({ key: decodeURIComponent(key), value: decodeURIComponent(value) });
    });

    return { url, params };
  } catch {
    return null;
  }
}

function buildUrl(parsed: ParsedUrl): string {
  const proto = parsed.protocol.endsWith(':') ? parsed.protocol : `${parsed.protocol}:`;
  const host = parsed.hostname + (parsed.port ? `:${parsed.port}` : '');
  const path = parsed.pathname.startsWith('/') ? parsed.pathname : `/${parsed.pathname}`;
  const search = new URLSearchParams();
  parsed.params.forEach(({ key, value }) => {
    if (key.trim()) search.append(encodeURIComponent(key.trim()), value);
  });
  const searchStr = parsed.params.length ? `?${search.toString()}` : '';
  const hashStr = parsed.hash ? (parsed.hash.startsWith('#') ? parsed.hash : `#${parsed.hash}`) : '';

  return `${proto}//${host}${path}${searchStr}${hashStr}`;
}

export function UrlParserTool() {
  const [urlInput, setUrlInput] = useState('');
  const [parseError, setParseError] = useState<string | null>(null);
  const [fields, setFields] = useState<ParsedUrl>({
    protocol: 'https:',
    hostname: 'example.com',
    port: '',
    pathname: '/',
    hash: '',
    params: [],
  });

  const parsed = tryParseUrl(urlInput);
  const displayFields = parsed
    ? {
      protocol: parsed.url.protocol,
      hostname: parsed.url.hostname,
      port: parsed.url.port,
      pathname: parsed.url.pathname,
      hash: parsed.url.hash.slice(1),
      params: parsed.params,
    }
    : null;

  const handleUrlInputChange = useCallback((value: string) => {
    setUrlInput(value);
    const result = tryParseUrl(value);
    if (result) {
      setParseError(null);
      setFields({
        protocol: result.url.protocol,
        hostname: result.url.hostname,
        port: result.url.port,
        pathname: result.url.pathname,
        hash: result.url.hash.slice(1),
        params: result.params,
      });
    } else if (value.trim()) {
      setParseError('Invalid URL');
    } else {
      setParseError(null);
    }
  }, []);

  const updateField = useCallback(
    <K extends keyof Omit<ParsedUrl, 'params'>>(key: K, value: string) => {
      setFields((prev) => {
        const next = { ...prev, [key]: value };
        const built = buildUrl(next);
        setUrlInput(built);
        setParseError(null);
        return next;
      });
    },
    [],
  );

  const updateParam = useCallback((index: number, keyOrValue: 'key' | 'value', value: string) => {
    setFields((prev) => {
      const next = { ...prev, params: [...prev.params] };
      next.params[index] = { ...next.params[index], [keyOrValue]: value };
      const built = buildUrl(next);
      setUrlInput(built);
      setParseError(null);
      return next;
    });
  }, []);

  const addParam = useCallback(() => {
    setFields((prev) => {
      const next = { ...prev, params: [...prev.params, { key: '', value: '' }] };
      const built = buildUrl(next);
      setUrlInput(built);
      return next;
    });
  }, []);

  const removeParam = useCallback((index: number) => {
    setFields((prev) => {
      const next = { ...prev, params: prev.params.filter((_, i) => i !== index) };
      const built = buildUrl(next);
      setUrlInput(built);
      setParseError(null);
      return next;
    });
  }, []);

  const effectiveFields = displayFields ?? fields;
  const currentUrl = urlInput.trim()
    ? displayFields
      ? urlInput
      : buildUrl(fields)
    : '';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
        <Input
          type="text"
          placeholder="https://example.com/path?key=value#hash"
          value={urlInput}
          onChange={(e) => handleUrlInputChange(e.target.value)}
          className="flex-1 font-mono text-sm"
          error={parseError ?? undefined}
        />
        <CopyButton value={currentUrl} className="shrink-0" />
      </div>

      {parseError && urlInput.trim() && (
        <div
          className={cn(
            'rounded-lg border px-4 py-3 text-sm',
            'border-destructive/30 bg-destructive/5 text-destructive',
          )}
        >
          {parseError}
        </div>
      )}

      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Protocol</label>
            <Input
              value={effectiveFields.protocol}
              onChange={(e) => updateField('protocol', e.target.value)}
              className="font-mono"
              placeholder="https:"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Host</label>
            <Input
              value={effectiveFields.hostname}
              onChange={(e) => updateField('hostname', e.target.value)}
              className="font-mono"
              placeholder="example.com"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Port</label>
          <Input
            value={effectiveFields.port}
            onChange={(e) => updateField('port', e.target.value)}
            className="font-mono max-w-[140px]"
            placeholder="(optional)"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Pathname</label>
          <Input
            value={effectiveFields.pathname}
            onChange={(e) => updateField('pathname', e.target.value)}
            className="font-mono"
            placeholder="/path/to/resource"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Hash / Fragment</label>
          <Input
            value={effectiveFields.hash}
            onChange={(e) => updateField('hash', e.target.value)}
            className="font-mono"
            placeholder="#section"
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-xs font-medium text-muted-foreground">Query Parameters</label>
            <Button variant="outline" size="sm" onClick={addParam}>
              Add parameter
            </Button>
          </div>
          {effectiveFields.params.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border py-6 text-center text-sm text-muted-foreground">
              No parameters. Add one below.
            </div>
          ) : (
            <div className="space-y-2">
              {effectiveFields.params.map((param, i) => (
                <div key={i} className="flex flex-wrap items-center gap-2">
                  <Input
                    value={param.key}
                    onChange={(e) => updateParam(i, 'key', e.target.value)}
                    placeholder="key"
                    className="font-mono min-w-[100px] flex-1 sm:max-w-[180px]"
                  />
                  <Input
                    value={param.value}
                    onChange={(e) => updateParam(i, 'value', e.target.value)}
                    placeholder="value"
                    className="font-mono min-w-[100px] flex-1 sm:max-w-[180px]"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeParam(i)}
                    aria-label="Remove parameter"
                    className="shrink-0 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
