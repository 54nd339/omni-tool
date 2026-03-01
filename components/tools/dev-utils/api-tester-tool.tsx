'use client';

import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ChevronDown, ChevronRight, Clock, FolderOpen, Plus, Trash2, Import, Terminal, WifiOff } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { ToolSkeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CopyButton } from '@/components/shared/copy-button';
import { SendToButton } from '@/components/shared/send-to-button';
import { parseCurl } from '@/lib/curl-parser';
import { generateCode, CODE_TARGETS, type CodeTarget } from '@/lib/code-generators';

const GraphqlPanel = lazy(() =>
  import('./graphql-panel').then((m) => ({ default: m.GraphqlPanel })),
);
const WebSocketPanel = lazy(() =>
  import('./websocket-panel').then((m) => ({ default: m.WebSocketPanel })),
);
const ApiCollectionsPanel = lazy(() =>
  import('./api-collections-panel').then((m) => ({ default: m.ApiCollectionsPanel })),
);

import { substituteEnvVars, type SavedRequest } from '@/stores/api-collections-store';

type ApiMode = 'rest' | 'graphql' | 'websocket';
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

interface HeaderRow {
  id: string;
  key: string;
  value: string;
}

interface ResponseState {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  timeMs: number;
  sizeBytes: number;
  ok: boolean;
  isJson: boolean;
}

function parseHeaders(headers: Headers): Record<string, string> {
  const obj: Record<string, string> = {};
  headers.forEach((value, key) => {
    obj[key] = value;
  });
  return obj;
}

function formatJson(str: string): string {
  try {
    const parsed = JSON.parse(str);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return str;
  }
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const MAX_HISTORY = 10;

interface RequestHistoryEntry {
  id: string;
  method: HttpMethod;
  url: string;
  status: number;
  statusText: string;
  timeMs: number;
  timestamp: number;
  responseBody: string;
  isJson: boolean;
}

const METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];

function generateId(): string {
  return Math.random().toString(36).slice(2, 11);
}

export function ApiTesterTool() {
  const searchParams = useSearchParams();
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true,
  );
  const [mode, setMode] = useState<ApiMode>('rest');
  const [url, setUrl] = useState('https://jsonplaceholder.typicode.com/posts/1');
  const [method, setMethod] = useState<HttpMethod>('GET');
  const [headers, setHeaders] = useState<HeaderRow[]>([{ id: generateId(), key: '', value: '' }]);
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ResponseState | null>(null);
  const [headersOpen, setHeadersOpen] = useState(false);
  const [reqHeadersOpen, setReqHeadersOpen] = useState(true);
  const [curlInput, setCurlInput] = useState('');
  const [curlImportOpen, setCurlImportOpen] = useState(false);
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const [requestHistory, setRequestHistory] = useState<RequestHistoryEntry[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const pasteApplied = useRef(false);
  useEffect(() => {
    if (pasteApplied.current) return;
    const paste = searchParams.get('paste');
    if (!paste) return;
    pasteApplied.current = true;
    try {
      const decoded = decodeURIComponent(paste).trim();
      const parsed = parseCurl(decoded);
      if (parsed.url) setUrl(parsed.url);
      if (parsed.method) setMethod(parsed.method as HttpMethod);
      const hdrEntries = Object.entries(parsed.headers);
      if (hdrEntries.length > 0) {
        setHeaders(hdrEntries.map(([key, value]) => ({ id: generateId(), key, value })));
      }
      if (parsed.body) setBody(parsed.body);
    } catch {
      /* ignore bad paste data */
    }
  }, [searchParams]);

  const hasBody = method === 'POST' || method === 'PUT' || method === 'PATCH';

  const updateHeader = useCallback((id: string, field: 'key' | 'value', value: string) => {
    setHeaders((prev) =>
      prev.map((h) => (h.id === id ? { ...h, [field]: value } : h)),
    );
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

  const handleImportCurl = useCallback(() => {
    const trimmed = curlInput.trim();
    if (!trimmed) return;
    try {
      const parsed = parseCurl(trimmed);
      if (parsed.url) setUrl(parsed.url);
      if (parsed.method) setMethod(parsed.method as HttpMethod);
      const hdrEntries = Object.entries(parsed.headers);
      if (hdrEntries.length > 0) {
        setHeaders(hdrEntries.map(([key, value]) => ({ id: generateId(), key, value })));
      }
      if (parsed.body) setBody(parsed.body);
      setCurlImportOpen(false);
      setCurlInput('');
      toast.success('cURL command imported');
    } catch {
      toast.error('Failed to parse cURL command');
    }
  }, [curlInput]);

  const handleCopyAs = useCallback((target: CodeTarget) => {
    const code = generateCode(target, {
      method,
      url: url.trim(),
      headers: buildHeadersObj(),
      body: hasBody ? body : '',
    });
    navigator.clipboard.writeText(code);
    const label = CODE_TARGETS.find((t) => t.id === target)?.label ?? target;
    toast.success(`Copied as ${label}`);
  }, [method, url, body, hasBody, buildHeadersObj]);

  const handleSend = useCallback(async () => {
    const trimmed = url.trim();
    if (!trimmed) {
      toast.error('Enter a URL');
      return;
    }

    let targetUrl = trimmed;
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = `https://${targetUrl}`;
    }

    setLoading(true);
    setResponse(null);

    const start = performance.now();
    try {
      const headersObj = buildHeadersObj();
      const init: RequestInit = {
        method,
        headers: headersObj,
      };

      if (hasBody && body.trim()) {
        try {
          JSON.parse(body);
          init.body = body;
          if (!headersObj['Content-Type']) {
            headersObj['Content-Type'] = 'application/json';
          }
        } catch {
          init.body = body;
        }
      }

      const res = await fetch(targetUrl, init);
      const end = performance.now();

      const resBody = await res.text();
      const isJson =
        res.headers.get('content-type')?.includes('application/json') ?? false;
      const formatted = isJson ? formatJson(resBody) : resBody;

      const respState: ResponseState = {
        status: res.status,
        statusText: res.statusText,
        headers: parseHeaders(res.headers),
        body: formatted,
        timeMs: Math.round(end - start),
        sizeBytes: new TextEncoder().encode(resBody).length,
        ok: res.ok,
        isJson,
      };
      setResponse(respState);
      setRequestHistory((prev) => [
        { id: generateId(), method, url: targetUrl, status: res.status, statusText: res.statusText, timeMs: respState.timeMs, timestamp: Date.now(), responseBody: formatted, isJson },
        ...prev,
      ].slice(0, MAX_HISTORY));
    } catch (err) {
      const end = performance.now();
      const msg = err instanceof Error ? err.message : 'Request failed';
      const isCors =
        msg.includes('fetch') ||
        msg.includes('CORS') ||
        msg.includes('NetworkError') ||
        msg.includes('Failed to fetch');

      if (isCors) {
        toast.error(
          'CORS error: The server may not allow requests from this origin. Try a different URL or use a CORS proxy for testing.',
        );
      } else {
        toast.error(msg);
      }

      setResponse({
        status: 0,
        statusText: 'Error',
        headers: {},
        body: isCors
          ? 'CORS policy blocked the request. Many APIs require server-side requests or specific CORS headers. Try:\n• A different API that supports CORS\n• Running the request from your backend\n• Using a CORS proxy for development (e.g. cors-anywhere)'
          : msg,
        timeMs: Math.round(end - start),
        sizeBytes: 0,
        ok: false,
        isJson: false,
      });
    } finally {
      setLoading(false);
    }
  }, [url, method, body, hasBody, buildHeadersObj]);

  const handleSaveRequest = useCallback((): SavedRequest => ({
    id: '',
    name: url.replace(/^https?:\/\//, '').slice(0, 50),
    method,
    url,
    headers: headers.filter((h) => h.key.trim()),
    body,
  }), [url, method, headers, body]);

  const handleLoadRequest = useCallback((req: SavedRequest, vars: Record<string, string>) => {
    setMethod(req.method as HttpMethod);
    setUrl(substituteEnvVars(req.url, vars));
    if (req.headers.length > 0) {
      setHeaders(req.headers.map((h) => ({
        id: generateId(),
        key: substituteEnvVars(h.key, vars),
        value: substituteEnvVars(h.value, vars),
      })));
    }
    if (req.body) setBody(substituteEnvVars(req.body, vars));
    toast.success('Request loaded');
  }, []);

  const statusColor = response
    ? response.status >= 200 && response.status < 300
      ? 'text-green-600 dark:text-green-400'
      : response.status >= 400 && response.status < 500
        ? 'text-amber-600 dark:text-amber-400'
        : response.status >= 500
          ? 'text-red-600 dark:text-red-400'
          : 'text-muted-foreground'
    : '';

  return (
    <div className="space-y-6">
      {!isOnline && (
        <div
          className="flex items-center gap-2 rounded-md bg-amber-500/20 px-4 py-2.5 text-sm text-amber-800 dark:text-amber-200"
          role="alert"
        >
          <WifiOff className="h-4 w-4 shrink-0" />
          <span>This tool requires an internet connection</span>
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <ToggleGroup
          type="single"
          value={mode}
          onValueChange={(v) => v && setMode(v as ApiMode)}
        >
          <ToggleGroupItem value="rest">REST</ToggleGroupItem>
          <ToggleGroupItem value="graphql">GraphQL</ToggleGroupItem>
          <ToggleGroupItem value="websocket">WebSocket</ToggleGroupItem>
        </ToggleGroup>

        {mode === 'rest' && (
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setCollectionsOpen((o) => !o)}>
              <FolderOpen className="mr-1.5 h-3.5 w-3.5" />
              Collections
            </Button>
            <Button variant="outline" size="sm" onClick={() => setHistoryOpen((o) => !o)}>
              <Clock className="mr-1.5 h-3.5 w-3.5" />
              History{requestHistory.length > 0 && ` (${requestHistory.length})`}
            </Button>
            <div className="mx-1 h-4 w-px bg-border max-sm:hidden" />
            <Button variant="outline" size="sm" onClick={() => setCurlImportOpen((o) => !o)} title="Import cURL" aria-label="Import cURL">
              <Import className="mr-1.5 h-3.5 w-3.5" />
              Import cURL
            </Button>
            <Select onValueChange={(v) => handleCopyAs(v as CodeTarget)}>
              <SelectTrigger className="h-8 w-auto min-w-[130px] text-xs">
                <Terminal className="mr-2 h-3.5 w-3.5" />
                <span>Copy as…</span>
              </SelectTrigger>
              <SelectContent>
                {CODE_TARGETS.map((t) => (
                  <SelectItem key={t.id} value={t.id} className="text-xs">
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {mode === 'graphql' && (
        <Suspense fallback={<ToolSkeleton />}>
          <GraphqlPanel />
        </Suspense>
      )}

      {mode === 'websocket' && (
        <Suspense fallback={<ToolSkeleton />}>
          <WebSocketPanel />
        </Suspense>
      )}

      {mode === 'rest' && (
        <div className="space-y-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Select value={method} onValueChange={(v) => setMethod(v as HttpMethod)}>
              <SelectTrigger className="w-[120px] shrink-0 font-mono font-bold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {METHODS.map((m) => (
                  <SelectItem key={m} value={m} className="font-mono font-bold">
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://api.example.com/endpoint"
              className="flex-1 font-mono text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend();
              }}
            />
            <Button onClick={handleSend} disabled={loading || !isOnline} className="shrink-0 px-8">
              {loading ? 'Sending...' : 'Send'}
            </Button>
          </div>

          {collectionsOpen && (
            <Suspense fallback={<div className="h-20 animate-pulse rounded-md bg-muted" />}>
              <ApiCollectionsPanel onSaveRequest={handleSaveRequest} onLoadRequest={handleLoadRequest} />
            </Suspense>
          )}

          {historyOpen && (
            <div className="rounded-md border border-border bg-muted/20 p-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">Request History (session)</p>
                {requestHistory.length > 0 && (
                  <Button variant="ghost" size="sm" className="h-6 text-xs text-destructive" onClick={() => setRequestHistory([])}>
                    <Trash2 className="mr-1 h-3 w-3" /> Clear
                  </Button>
                )}
              </div>
              {requestHistory.length === 0 ? (
                <p className="py-2 text-center text-xs text-muted-foreground">No requests yet</p>
              ) : (
                <ul className="max-h-48 space-y-1 overflow-y-auto">
                  {requestHistory.map((entry) => (
                    <li key={entry.id}>
                      <button
                        className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs transition-colors hover:bg-muted"
                        onClick={() => {
                          setResponse({
                            status: entry.status,
                            statusText: entry.statusText,
                            headers: {},
                            body: entry.responseBody,
                            timeMs: entry.timeMs,
                            sizeBytes: new TextEncoder().encode(entry.responseBody).length,
                            ok: entry.status >= 200 && entry.status < 300,
                            isJson: entry.isJson,
                          });
                          setHistoryOpen(false);
                        }}
                      >
                        <span className="w-16 shrink-0 rounded bg-muted px-1 py-0.5 text-center font-mono text-[10px] font-semibold">
                          {entry.method}
                        </span>
                        <span className={`shrink-0 font-mono ${entry.status >= 200 && entry.status < 300 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {entry.status}
                        </span>
                        <span className="truncate text-muted-foreground">{entry.url.replace(/^https?:\/\//, '')}</span>
                        <span className="ml-auto shrink-0 text-[10px] text-muted-foreground">{entry.timeMs}ms</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

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
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeHeader(h.id)}
                      aria-label="Remove header"
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid gap-6 lg:grid-cols-2 items-start">
            <div className="space-y-6">

              {curlImportOpen && (
                <div className="space-y-2 rounded-md border border-border bg-muted/30 p-3">
                  <p className="text-xs font-medium text-muted-foreground">Paste a cURL command</p>
                  <Textarea
                    value={curlInput}
                    onChange={(e) => setCurlInput(e.target.value)}
                    placeholder={'curl -X POST \'https://api.example.com/data\' \\\n  -H \'Content-Type: application/json\' \\\n  -d \'{"key": "value"}\''}
                    rows={4}
                    className="font-mono text-sm"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleImportCurl} disabled={!curlInput.trim()}>
                      Import
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => { setCurlImportOpen(false); setCurlInput(''); }}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {hasBody && (
                <div>
                  <p className="mb-2 text-xs font-medium text-muted-foreground">Request body</p>
                  <Textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder='{"key": "value"}'
                    rows={8}
                    className="font-mono text-sm"
                  />
                </div>
              )}
            </div>

          </div>
          <div className="space-y-6 lg:sticky lg:top-6">
            {!response && !loading && (
              <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-border py-12 text-center h-[350px]">
                <p className="text-sm font-medium text-muted-foreground">No response yet</p>
                <p className="mt-1 text-xs text-muted-foreground/70">Enter a URL and click Send to make a request</p>
              </div>
            )}

            {response && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-4">
                  <span className={`font-mono font-semibold ${statusColor}`}>
                    {response.status > 0 ? response.status : '—'} {response.statusText}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {response.timeMs} ms · {formatBytes(response.sizeBytes)}
                  </span>
                  {response.body && (
                    <>
                      <SendToButton value={response.body} outputType={response.isJson ? 'json' : 'text'} />
                      <CopyButton value={response.body} size="sm" />
                    </>
                  )}
                </div>

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setHeadersOpen((o) => !o)}
                    className="flex items-center gap-2 text-left text-xs font-medium text-muted-foreground hover:text-foreground"
                  >
                    {headersOpen ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
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
        </div>
      )}
    </div>
  );
}
