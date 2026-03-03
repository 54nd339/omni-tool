'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

import {
  type ApiMode,
  buildHeaderObject,
  createApiId,
  type HttpMethod,
  MAX_HISTORY,
  normalizeUrl,
  type RequestHistoryEntry,
  type ResponseState,
} from '@/lib/dev-utils/api-tester';
import {
  ensureAtLeastOneHeader,
  executeRestRequest,
  makeEmptyHeaderRow,
  mapHeadersToRows,
} from '@/lib/dev-utils/api-tester-runtime';
import { CODE_TARGETS, type CodeTarget, generateCode } from '@/lib/dev-utils/code-generators';
import { parseCurl } from '@/lib/dev-utils/curl-parser';
import { type SavedRequest, substituteEnvVars } from '@/stores/api-collections-store';
import { type HeaderRow } from '@/types/dev-utils';

export function useApiTester() {
  const searchParams = useSearchParams();
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true,
  );
  const [mode, setMode] = useState<ApiMode>('rest');
  const [url, setUrl] = useState('https://jsonplaceholder.typicode.com/posts/1');
  const [method, setMethod] = useState<HttpMethod>('GET');
  const [headers, setHeaders] = useState<HeaderRow[]>([makeEmptyHeaderRow()]);
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ResponseState | null>(null);
  const [responseHeadersOpen, setResponseHeadersOpen] = useState(false);
  const [requestHeadersOpen, setRequestHeadersOpen] = useState(true);
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
    let raf = 0;
    try {
      const decoded = decodeURIComponent(paste).trim();
      const parsed = parseCurl(decoded);
      const mappedHeaders = mapHeadersToRows(parsed.headers);

      raf = requestAnimationFrame(() => {
        if (parsed.url) setUrl(parsed.url);
        if (parsed.method) setMethod(parsed.method as HttpMethod);
        if (mappedHeaders.length > 0) setHeaders(mappedHeaders);
        if (parsed.body) setBody(parsed.body);
      });
    } catch {
      return;
    }

    return () => {
      if (raf) cancelAnimationFrame(raf);
    };
  }, [searchParams]);

  const hasBody = method === 'POST' || method === 'PUT' || method === 'PATCH';

  const updateHeader = useCallback((id: string, field: 'key' | 'value', value: string) => {
    setHeaders((prev) => prev.map((header) => (header.id === id ? { ...header, [field]: value } : header)));
  }, []);

  const addHeader = useCallback(() => {
    setHeaders((prev) => [...prev, { id: createApiId(), key: '', value: '' }]);
  }, []);

  const removeHeader = useCallback((id: string) => {
    setHeaders((prev) => ensureAtLeastOneHeader(prev.filter((header) => header.id !== id)));
  }, []);

  const handleImportCurl = useCallback(() => {
    const trimmed = curlInput.trim();
    if (!trimmed) return;
    try {
      const parsed = parseCurl(trimmed);
      if (parsed.url) setUrl(parsed.url);
      if (parsed.method) setMethod(parsed.method as HttpMethod);
      const mappedHeaders = mapHeadersToRows(parsed.headers);
      if (mappedHeaders.length > 0) setHeaders(mappedHeaders);
      if (parsed.body) setBody(parsed.body);
      setCurlImportOpen(false);
      setCurlInput('');
      toast.success('cURL command imported');
    } catch {
      toast.error('Failed to parse cURL command');
    }
  }, [curlInput]);

  const handleCopyAs = useCallback(
    (target: CodeTarget) => {
      const code = generateCode(target, {
        method,
        url: url.trim(),
        headers: buildHeaderObject(headers),
        body: hasBody ? body : '',
      });
      navigator.clipboard.writeText(code);
      const label = CODE_TARGETS.find((item) => item.id === target)?.label ?? target;
      toast.success(`Copied as ${label}`);
    },
    [method, url, headers, body, hasBody],
  );

  const handleSend = useCallback(async () => {
    const targetUrl = normalizeUrl(url);
    if (!targetUrl) {
      toast.error('Enter a URL');
      return;
    }

    setLoading(true);
    setResponse(null);

    const result = await executeRestRequest({
      body,
      hasBody,
      headers,
      method,
      url: targetUrl,
    });

    setResponse(result.response);
    if (result.historyEntry) {
      setRequestHistory((prev) => [result.historyEntry as RequestHistoryEntry, ...prev].slice(0, MAX_HISTORY));
    }
    if (result.errorMessage) {
      toast.error(result.errorMessage);
    }
    setLoading(false);
  }, [url, headers, method, hasBody, body]);

  const handleSaveRequest = useCallback(
    (): SavedRequest => ({
      id: '',
      name: url.replace(/^https?:\/\//, '').slice(0, 50),
      method,
      url,
      headers: headers.filter((header) => header.key.trim()),
      body,
    }),
    [url, method, headers, body],
  );

  const handleLoadRequest = useCallback((request: SavedRequest, variables: Record<string, string>) => {
    setMethod(request.method as HttpMethod);
    setUrl(substituteEnvVars(request.url, variables));
    if (request.headers.length > 0) {
      setHeaders(
        request.headers.map((header) => ({
          id: createApiId(),
          key: substituteEnvVars(header.key, variables),
          value: substituteEnvVars(header.value, variables),
        })),
      );
    }
    if (request.body) setBody(substituteEnvVars(request.body, variables));
    toast.success('Request loaded');
  }, []);

  return {
    addHeader,
    body,
    collectionsOpen,
    curlImportOpen,
    curlInput,
    handleCopyAs,
    handleImportCurl,
    handleLoadRequest,
    handleSaveRequest,
    handleSend,
    hasBody,
    headers,
    responseHeadersOpen,
    historyOpen,
    isOnline,
    loading,
    method,
    mode,
    removeHeader,
    requestHeadersOpen,
    requestHistory,
    response,
    setBody,
    setCollectionsOpen,
    setCurlImportOpen,
    setCurlInput,
    setResponseHeadersOpen,
    setHistoryOpen,
    setMethod,
    setMode,
    setRequestHeadersOpen,
    setRequestHistory,
    setResponse,
    setUrl,
    updateHeader,
    url,
  };
}