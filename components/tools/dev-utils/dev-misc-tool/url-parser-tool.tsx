'use client';

import { useCallback, useState } from 'react';
import { Trash2 } from 'lucide-react';

import { CopyButton } from '@/components/shared/tool-actions/copy-button';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  buildUrlFromFields,
  getDefaultParsedUrlFields,
  type ParsedUrlFields,
  toFieldsFromParsedUrl,
  tryParseUrlInput,
} from '@/lib/dev-utils/url-parser';
import { cn } from '@/lib/utils';

export function UrlParserTool() {
  const [urlInput, setUrlInput] = useState('');
  const [parseError, setParseError] = useState<string | null>(null);
  const [fields, setFields] = useState<ParsedUrlFields>(getDefaultParsedUrlFields);

  const parsed = tryParseUrlInput(urlInput);
  const displayFields = parsed ? toFieldsFromParsedUrl(parsed) : null;

  const handleUrlInputChange = useCallback((value: string) => {
    setUrlInput(value);
    const result = tryParseUrlInput(value);
    if (result) {
      setParseError(null);
      setFields(toFieldsFromParsedUrl(result));
    } else if (value.trim()) {
      setParseError('Invalid URL');
    } else {
      setParseError(null);
    }
  }, []);

  const updateField = useCallback(
    <K extends keyof Omit<ParsedUrlFields, 'params'>>(key: K, value: string) => {
      setFields((prev) => {
        const next = { ...prev, [key]: value };
        const built = buildUrlFromFields(next);
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
      const built = buildUrlFromFields(next);
      setUrlInput(built);
      setParseError(null);
      return next;
    });
  }, []);

  const addParam = useCallback(() => {
    setFields((prev) => {
      const next = { ...prev, params: [...prev.params, { key: '', value: '' }] };
      const built = buildUrlFromFields(next);
      setUrlInput(built);
      return next;
    });
  }, []);

  const removeParam = useCallback((index: number) => {
    setFields((prev) => {
      const next = { ...prev, params: prev.params.filter((_, i) => i !== index) };
      const built = buildUrlFromFields(next);
      setUrlInput(built);
      setParseError(null);
      return next;
    });
  }, []);

  const effectiveFields = displayFields ?? fields;
  const currentUrl = urlInput.trim()
    ? displayFields
      ? urlInput
      : buildUrlFromFields(fields)
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
            className="max-w-[140px] font-mono"
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
                    className="min-w-[100px] flex-1 font-mono sm:max-w-[180px]"
                  />
                  <Input
                    value={param.value}
                    onChange={(e) => updateParam(i, 'value', e.target.value)}
                    placeholder="value"
                    className="min-w-[100px] flex-1 font-mono sm:max-w-[180px]"
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
