'use client';

import { useCallback, useState } from 'react';
import { toast } from 'sonner';

import { useToolParams } from '@/hooks/use-tool-params';
import { type FormatterLanguage } from '@/lib/constants/dev-utils';
import { formatCode } from '@/lib/dev-utils/code-formatter';

const PARAM_DEFAULTS = {
  input: '',
  language: 'javascript',
  semicolons: 'true',
  singleQuote: 'true',
  tabWidth: '2',
};

export function useCodeFormatter() {
  const [params, setParams] = useToolParams(PARAM_DEFAULTS);
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  const language: FormatterLanguage = params.language as FormatterLanguage;
  const input = params.input;
  const tabWidth = Math.max(1, Math.min(8, Number(params.tabWidth) || 2));
  const singleQuote = params.singleQuote !== 'false';
  const semicolons = params.semicolons !== 'false';

  const setLanguage = useCallback(
    (next: FormatterLanguage) => setParams({ language: next }),
    [setParams],
  );

  const setInput = useCallback(
    (next: string) => setParams({ input: next }),
    [setParams],
  );

  const setTabWidth = useCallback(
    (next: number) => setParams({ tabWidth: String(next) }),
    [setParams],
  );

  const setSingleQuote = useCallback(
    (next: boolean) => setParams({ singleQuote: next ? 'true' : 'false' }),
    [setParams],
  );

  const setSemicolons = useCallback(
    (next: boolean) => setParams({ semicolons: next ? 'true' : 'false' }),
    [setParams],
  );

  const handleFormat = useCallback(async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const formatted = await formatCode({
        input,
        language,
        semicolons,
        singleQuote,
        tabWidth,
      });
      setOutput(formatted);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Formatting failed');
      setOutput('');
    } finally {
      setLoading(false);
    }
  }, [input, language, semicolons, singleQuote, tabWidth]);

  return {
    handleFormat,
    input,
    language,
    loading,
    output,
    semicolons,
    setInput,
    setLanguage,
    setSemicolons,
    setSingleQuote,
    setTabWidth,
    singleQuote,
    tabWidth,
  };
}
