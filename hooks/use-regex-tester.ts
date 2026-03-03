'use client';

import { useCallback, useMemo, useState } from 'react';

import { useToolParams } from '@/hooks/use-tool-params';
import {
  REGEX_TESTER_ALLOWED_FLAGS,
  REGEX_TESTER_PARAM_DEFAULTS,
} from '@/lib/constants/dev-utils';
import {
  buildHighlightedText,
  compileRegex,
  getRegexMatches,
  getReplacedText,
  type MatchResult,
} from '@/lib/dev-utils/regex-tester';
import { type RegexTesterParams, type RegexTesterTab } from '@/types/dev-utils';

export function useRegexTester() {
  const [params, setParams] = useToolParams<RegexTesterParams>(REGEX_TESTER_PARAM_DEFAULTS);
  const [activeTab, setActiveTab] = useState<RegexTesterTab>('tester');

  const pattern = params.pattern;
  const testString = params.test;
  const replacement = params.replacement;
  const showReplace = params.replace === '1';

  const flags = useMemo(() => {
    const normalized = params.flags
      .split('')
      .filter(
        (flag, index, array) =>
          REGEX_TESTER_ALLOWED_FLAGS.has(flag) && array.indexOf(flag) === index,
      );

    return new Set(normalized.length > 0 ? normalized : ['g']);
  }, [params.flags]);

  const handleLibrarySelect = useCallback(
    (newPattern: string, newFlags: string) => {
      setParams({
        pattern: newPattern,
        flags: newFlags || 'g',
      });
      setActiveTab('tester');
    },
    [setParams],
  );

  const toggleFlag = useCallback(
    (flag: string) => {
      const next = new Set(flags);
      if (next.has(flag)) {
        next.delete(flag);
      } else {
        next.add(flag);
      }
      setParams({ flags: [...next].join('') || 'g' });
    },
    [flags, setParams],
  );

  const { regex, error: regexError } = useMemo(
    () => compileRegex(pattern, flags),
    [pattern, flags],
  );

  const matches: MatchResult[] = useMemo(
    () =>
      getRegexMatches({
        flags,
        regex,
        testString,
      }),
    [regex, testString, flags],
  );

  const highlightedText = useMemo(
    () =>
      buildHighlightedText({
        matches,
        regex,
        testString,
      }),
    [regex, testString, matches],
  );

  const replacedText = useMemo(
    () =>
      getReplacedText({
        regex,
        replacement,
        showReplace,
        testString,
      }),
    [regex, testString, replacement, showReplace],
  );

  return {
    activeTab,
    flags,
    handleLibrarySelect,
    highlightedText,
    matches,
    pattern,
    regexError,
    replacedText,
    replacement,
    setActiveTab,
    setParams,
    showReplace,
    testString,
    toggleFlag,
  };
}
