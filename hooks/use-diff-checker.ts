'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { useToolParams } from '@/hooks/use-tool-params';
import { DIFF_LANGUAGES, DIFF_MODES } from '@/lib/constants/dev-utils';
import {
  computeDiff,
  detectLanguage,
  getDiffStats,
} from '@/lib/dev-utils/diff-checker';
import type { DiffMode } from '@/types/common';

export type DiffCheckerViewMode = 'simple' | 'monaco';

const PARAM_DEFAULTS = {
  left: '',
  mode: 'line',
  monacoLang: 'plaintext',
  render: 'side',
  right: '',
  viewMode: 'simple',
};

export function useDiffChecker() {
  const [params, setParams] = useToolParams(PARAM_DEFAULTS);
  const [changes, setChanges] = useState<import('diff').Change[]>([]);
  const [jsonError, setJsonError] = useState<string | null>(null);

  const left = params.left;
  const right = params.right;
  const mode: DiffMode = DIFF_MODES.some((item) => item.id === params.mode as DiffMode)
    ? (params.mode as DiffMode)
    : 'line';
  const viewMode: DiffCheckerViewMode = params.viewMode === 'monaco' ? 'monaco' : 'simple';
  const monacoLang = DIFF_LANGUAGES.some((item) => item.id === params.monacoLang)
    ? params.monacoLang
    : 'plaintext';
  const renderSideBySide = params.render !== 'inline';

  const setLeft = useCallback(
    (next: string) => setParams({ left: next }),
    [setParams],
  );

  const setRight = useCallback(
    (next: string) => setParams({ right: next }),
    [setParams],
  );

  const setMode = useCallback(
    (next: DiffMode) => setParams({ mode: next }),
    [setParams],
  );

  const setViewMode = useCallback(
    (next: DiffCheckerViewMode) => setParams({ viewMode: next }),
    [setParams],
  );

  const setMonacoLang = useCallback(
    (next: string) => setParams({ monacoLang: next }),
    [setParams],
  );

  const setRenderSideBySide = useCallback(
    (next: boolean) => setParams({ render: next ? 'side' : 'inline' }),
    [setParams],
  );

  const handleAutoDetect = useCallback(() => {
    setMonacoLang(detectLanguage(left || right));
  }, [left, right, setMonacoLang]);

  useEffect(() => {
    if (viewMode === 'monaco') return;
    if (!left && !right) {
      setChanges([]);
      setJsonError(null);
      return;
    }

    let cancelled = false;
    import('diff').then((Diff) => {
      if (cancelled) return;
      const result = computeDiff(Diff, left, right, mode);
      setChanges(result.changes);
      setJsonError(result.jsonError);
    });

    return () => {
      cancelled = true;
    };
  }, [left, mode, right, viewMode]);

  const stats = useMemo(() => getDiffStats(changes), [changes]);

  return {
    changes,
    handleAutoDetect,
    jsonError,
    left,
    mode,
    monacoLang,
    renderSideBySide,
    right,
    setLeft,
    setMode,
    setMonacoLang,
    setRenderSideBySide,
    setRight,
    setViewMode,
    stats,
    viewMode,
  };
}
