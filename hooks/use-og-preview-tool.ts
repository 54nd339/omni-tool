'use client';

import { useCallback, useMemo, useState } from 'react';

import { useToolParams } from '@/hooks/use-tool-params';
import {
  fetchOgMeta,
  getOgPreviewData,
  hasOgMeta,
  type OgMeta,
} from '@/lib/dev-utils/og-preview';

interface UseOgPreviewToolResult {
  error: string | null;
  fetchOg: () => Promise<void>;
  hasOg: boolean;
  hideImage: (key: string) => void;
  hiddenImages: Set<string>;
  loading: boolean;
  meta: OgMeta | null;
  preview: ReturnType<typeof getOgPreviewData>;
  setUrl: (value: string) => void;
  url: string;
}

export function useOgPreviewTool(): UseOgPreviewToolResult {
  const [params, setParams] = useToolParams({ url: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hiddenImages, setHiddenImages] = useState<Set<string>>(new Set());
  const [meta, setMeta] = useState<OgMeta | null>(null);
  const url = params.url;

  const setUrl = useCallback(
    (value: string) => {
      setParams({ url: value });
    },
    [setParams],
  );

  const hideImage = useCallback((key: string) => {
    setHiddenImages((previous) => new Set(previous).add(key));
  }, []);

  const fetchOg = useCallback(async () => {
    const trimmed = url.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);
    setMeta(null);
    setHiddenImages(new Set());

    try {
      const parsed = await fetchOgMeta(trimmed);
      setMeta(Object.keys(parsed).length ? parsed : null);
      if (Object.keys(parsed).length === 0) {
        setError('No OpenGraph meta tags found on this page.');
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Failed to fetch URL');
    } finally {
      setLoading(false);
    }
  }, [url]);

  const hasOg = useMemo(() => hasOgMeta(meta), [meta]);
  const preview = useMemo(() => getOgPreviewData(meta), [meta]);

  return {
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
  };
}
