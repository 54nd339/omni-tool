'use client';

import { useCallback, useState } from 'react';
import { ChevronDown, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { CopyButton } from '@/components/shared/copy-button';

interface HeaderRow {
  id: string;
  key: string;
  value: string;
}

interface GqlResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  timeMs: number;
  ok: boolean;
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 11);
}

const EXAMPLE_QUERY = `query {
  users {
    id
    name
    email
  }
}`;

const INTROSPECTION_QUERY = `query IntrospectionQuery {
  __schema {
    types {
      name
      kind
      description
      fields {
        name
        type { name kind }
      }
    }
  }
}`;

export function GraphqlPanel() {
  const [url, setUrl] = useState('');
  const [query, setQuery] = useState(EXAMPLE_QUERY);
  const [variables, setVariables] = useState('');
  const [headers, setHeaders] = useState<HeaderRow[]>([
    { id: generateId(), key: 'Content-Type', value: 'application/json' },
  ]);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<GqlResponse | null>(null);
  const [headersOpen, setHeadersOpen] = useState(false);
  const [reqHeadersOpen, setReqHeadersOpen] = useState(true);

  const updateHeader = useCallback((id: string, field: 'key' | 'value', value: string) => {
    setHeaders((prev) => prev.map((h) => (h.id === id ? { ...h, [field]: value } : h)));
  }, []);

  const addHeader = useCallback(() => {
    setHeaders((prev) => [...prev, { id: generateId(), key: '', value: '' }]);
  }, []);

  const removeHeader = useCallback((id: string) => {
    setHeaders((prev) => {
      const next = prev.filter((h) => h.id !== id);
      return next.length === 0 ? [{ id: generateId(), key: '', value: '' }] : next;
    });
  }, []);

  const buildHeadersObj = useCallback((): Record<string, string> => {
    const obj: Record<string, string> = {};
    for (const h of headers) {
      const k = h.key.trim();
      if (k) obj[k] = h.value.trim();
    }
    return obj;
  }, [headers]);

  const sendQuery = useCallback(
    async (gqlQuery: string) => {
      const trimmedUrl = url.trim();
      if (!trimmedUrl) {
        toast.error('Enter a GraphQL endpoint URL');
        return;
      }

      let parsedVars: Record<string, unknown> | undefined;
      if (variables.trim()) {
        try {
          parsedVars = JSON.parse(variables);
        } catch {
          toast.error('Variables must be valid JSON');
          return;
        }
      }

      setLoading(true);
      setResponse(null);
      const start = performance.now();

      try {
        const res = await fetch(trimmedUrl, {
          method: 'POST',
          headers: buildHeadersObj(),
          body: JSON.stringify({
            query: gqlQuery,
            ...(parsedVars ? { variables: parsedVars } : {}),
          }),
        });

        const end = performance.now();
        const text = await res.text();
        let formatted: string;
        try {
          formatted = JSON.stringify(JSON.parse(text), null, 2);
        } catch {
          formatted = text;
        }

        const resHeaders: Record<string, string> = {};
        res.headers.forEach((v, k) => {
          resHeaders[k] = v;
        });

        setResponse({
          status: res.status,
          statusText: res.statusText,
          headers: resHeaders,
          body: formatted,
          timeMs: Math.round(end - start),
          ok: res.ok,
        });
      } catch (err) {
        const end = performance.now();
        const msg = err instanceof Error ? err.message : 'Request failed';
        setResponse({
          status: 0,
          statusText: 'Error',
          headers: {},
          body: msg,
          timeMs: Math.round(end - start),
          ok: false,
        });
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    },
    [url, variables, buildHeadersObj],
  );

  const handleRun = useCallback(() => sendQuery(query), [query, sendQuery]);

  const handleIntrospect = useCallback(
    () => sendQuery(INTROSPECTION_QUERY),
    [sendQuery],
  );

  const statusColor = response
    ? response.ok
      ? 'text-green-600 dark:text-green-400'
      : 'text-red-600 dark:text-red-400'
    : '';

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://api.example.com/graphql"
          className="flex-1 font-mono text-sm"
        />
        <Button onClick={handleRun} disabled={loading} className="shrink-0 px-8">
          {loading ? 'Running...' : 'Run Query'}
        </Button>
        <Button variant="outline" onClick={handleIntrospect} disabled={loading} className="shrink-0">
          Introspect
        </Button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setReqHeadersOpen((o) => !o)}
            className="flex items-center gap-2 text-left text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            {reqHeadersOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            Headers {headers.length > 1 || headers[0].key !== '' ? `(${headers.length})` : ''}
          </button>
          <Button variant="ghost" size="sm" onClick={addHeader} className="h-7 text-xs">
            <Plus className="mr-1 h-3 w-3" />
            Add
          </Button>
        </div>
        {reqHeadersOpen && (
          <div className="space-y-2">
            {headers.map((h) => (
              <div key={h.id} className="grid w-full grid-cols-[1fr_2fr_auto] items-center gap-2">
                <Input
                  value={h.key}
                  onChange={(e) => updateHeader(h.id, 'key', e.target.value)}
                  placeholder="Header name"
                  className="font-mono text-sm"
                />
                <Input
                  value={h.value}
                  onChange={(e) => updateHeader(h.id, 'value', e.target.value)}
                  placeholder="Value"
                  className="font-mono text-sm"
                />
                <Button variant="ghost" size="icon" onClick={() => removeHeader(h.id)} aria-label="Remove">
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">Query</p>
          <Textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            rows={10}
            className="font-mono text-sm"
            placeholder="query { ... }"
          />
        </div>
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">Variables (JSON)</p>
          <Textarea
            value={variables}
            onChange={(e) => setVariables(e.target.value)}
            rows={10}
            className="font-mono text-sm"
            placeholder='{ "id": 1 }'
          />
        </div>
      </div>

      {!response && !loading && (
        <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-border py-12 text-center">
          <p className="text-sm font-medium text-muted-foreground">No response yet</p>
          <p className="mt-1 text-xs text-muted-foreground/70">Enter a GraphQL endpoint and run a query</p>
        </div>
      )}

      {response && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <span className={`font-mono font-semibold ${statusColor}`}>
              {response.status > 0 ? response.status : '—'} {response.statusText}
            </span>
            <span className="text-xs text-muted-foreground">{response.timeMs} ms</span>
            {response.body && <CopyButton value={response.body} size="sm" />}
          </div>

          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setHeadersOpen((o) => !o)}
              className="flex items-center gap-2 text-left text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              {headersOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              Response headers
            </button>
            {headersOpen && Object.keys(response.headers).length > 0 && (
              <div className="rounded-md border border-border bg-muted/30 p-3 font-mono text-xs">
                {Object.entries(response.headers).map(([k, v]) => (
                  <div key={k} className="flex gap-2 py-0.5">
                    <span className="text-muted-foreground">{k}:</span>
                    <span className="break-all">{v}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Response body</p>
            <Textarea
              value={response.body}
              readOnly
              rows={16}
              className="font-mono text-sm resize-none bg-muted/50"
            />
          </div>
        </div>
      )}
    </div>
  );
}
