import { REGEX_LIBRARY_PATTERNS } from '@/lib/constants/dev-utils';

export interface MatchResult {
  groups: Record<string, string> | undefined;
  index: number;
  match: string;
}

export interface RegexCompilationResult {
  error: string | null;
  regex: RegExp | null;
}

export interface HighlightPart {
  highlighted: boolean;
  text: string;
}

export type RegexLibraryEntry = (typeof REGEX_LIBRARY_PATTERNS)[number];

export function getRegexLibraryByCategory(search: string): Record<string, RegexLibraryEntry[]> {
  const query = search.trim().toLowerCase();
  const filteredPatterns = query
    ? REGEX_LIBRARY_PATTERNS.filter(
      (entry) =>
        entry.name.toLowerCase().includes(query) ||
        entry.category.toLowerCase().includes(query) ||
        entry.description.toLowerCase().includes(query) ||
        entry.pattern.toLowerCase().includes(query) ||
        entry.example.toLowerCase().includes(query),
    )
    : REGEX_LIBRARY_PATTERNS;

  const groupedByCategory: Record<string, RegexLibraryEntry[]> = {};

  for (const entry of filteredPatterns) {
    if (!groupedByCategory[entry.category]) {
      groupedByCategory[entry.category] = [];
    }

    groupedByCategory[entry.category].push(entry);
  }

  return groupedByCategory;
}

export function compileRegex(pattern: string, flags: Set<string>): RegexCompilationResult {
  if (!pattern) {
    return { regex: null, error: null };
  }

  try {
    return { regex: new RegExp(pattern, [...flags].join('')), error: null };
  } catch (error) {
    return { regex: null, error: (error as Error).message };
  }
}

export function getRegexMatches(params: {
  flags: Set<string>;
  regex: RegExp | null;
  testString: string;
}): MatchResult[] {
  if (!params.regex || !params.testString) {
    return [];
  }

  const results: MatchResult[] = [];

  if (params.flags.has('g')) {
    let match: RegExpExecArray | null;
    const scopedRegex = new RegExp(params.regex.source, params.regex.flags);

    while ((match = scopedRegex.exec(params.testString)) !== null) {
      results.push({ match: match[0], index: match.index, groups: match.groups });
      if (match[0].length === 0) {
        scopedRegex.lastIndex += 1;
      }
    }

    return results;
  }

  const match = params.regex.exec(params.testString);
  if (match) {
    results.push({ match: match[0], index: match.index, groups: match.groups });
  }

  return results;
}

export function buildHighlightedText(params: {
  matches: MatchResult[];
  regex: RegExp | null;
  testString: string;
}): HighlightPart[] | null {
  if (!params.regex || !params.testString || params.matches.length === 0) {
    return null;
  }

  const parts: HighlightPart[] = [];
  let lastIndex = 0;

  for (const match of params.matches) {
    if (match.index > lastIndex) {
      parts.push({ text: params.testString.slice(lastIndex, match.index), highlighted: false });
    }

    parts.push({ text: match.match, highlighted: true });
    lastIndex = match.index + match.match.length;
  }

  if (lastIndex < params.testString.length) {
    parts.push({ text: params.testString.slice(lastIndex), highlighted: false });
  }

  return parts;
}

export function getReplacedText(params: {
  regex: RegExp | null;
  replacement: string;
  showReplace: boolean;
  testString: string;
}): string {
  if (!params.regex || !params.testString || !params.showReplace) {
    return '';
  }

  try {
    return params.testString.replace(params.regex, params.replacement);
  } catch {
    return '';
  }
}
