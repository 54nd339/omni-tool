'use client';

import { useCallback, lazy, Suspense, useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { ToolSkeleton } from '@/components/ui/skeleton';
import { CopyButton } from '@/components/shared/copy-button';
import { pluralize } from '@/lib/utils';

const RegexLibrary = lazy(() =>
  import('./regex-library').then((m) => ({ default: m.RegexLibrary })),
);

const FLAG_OPTIONS = [
  { id: 'g', label: 'Global (g)' },
  { id: 'i', label: 'Case insensitive (i)' },
  { id: 'm', label: 'Multiline (m)' },
  { id: 's', label: 'Dotall (s)' },
] as const;

const CHEAT_SHEET = [
  { pattern: '.', desc: 'Any character' },
  { pattern: '\\d', desc: 'Digit [0-9]' },
  { pattern: '\\w', desc: 'Word char [a-zA-Z0-9_]' },
  { pattern: '\\s', desc: 'Whitespace' },
  { pattern: '^', desc: 'Start of string/line' },
  { pattern: '$', desc: 'End of string/line' },
  { pattern: '*', desc: '0 or more' },
  { pattern: '+', desc: '1 or more' },
  { pattern: '?', desc: '0 or 1' },
  { pattern: '{n,m}', desc: 'Between n and m' },
  { pattern: '(abc)', desc: 'Capture group' },
  { pattern: '(?:abc)', desc: 'Non-capture group' },
  { pattern: '(?=abc)', desc: 'Positive lookahead' },
  { pattern: '[abc]', desc: 'Character class' },
  { pattern: '[^abc]', desc: 'Negated class' },
  { pattern: 'a|b', desc: 'Alternation' },
];

interface MatchResult {
  match: string;
  index: number;
  groups: Record<string, string> | undefined;
}

type Tab = 'tester' | 'library';

export function RegexTesterTool() {
  const [activeTab, setActiveTab] = useState<Tab>('tester');
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState<Set<string>>(new Set(['g']));
  const [testString, setTestString] = useState('');
  const [replacement, setReplacement] = useState('');
  const [showReplace, setShowReplace] = useState(false);

  const handleLibrarySelect = useCallback((newPattern: string, newFlags: string) => {
    setPattern(newPattern);
    setFlags(new Set(newFlags.split('').filter(Boolean)));
    setActiveTab('tester');
  }, []);

  const toggleFlag = useCallback((flag: string) => {
    setFlags((prev) => {
      const next = new Set(prev);
      if (next.has(flag)) next.delete(flag);
      else next.add(flag);
      return next;
    });
  }, []);

  const { regex, error: regexError } = useMemo(() => {
    if (!pattern) return { regex: null, error: null };
    try {
      return { regex: new RegExp(pattern, [...flags].join('')), error: null };
    } catch (err) {
      return { regex: null, error: (err as Error).message };
    }
  }, [pattern, flags]);

  const matches: MatchResult[] = useMemo(() => {
    if (!regex || !testString) return [];
    const results: MatchResult[] = [];
    if (flags.has('g')) {
      let m: RegExpExecArray | null;
      const re = new RegExp(regex.source, regex.flags);
      while ((m = re.exec(testString)) !== null) {
        results.push({ match: m[0], index: m.index, groups: m.groups });
        if (m[0].length === 0) re.lastIndex++;
      }
    } else {
      const m = regex.exec(testString);
      if (m) results.push({ match: m[0], index: m.index, groups: m.groups });
    }
    return results;
  }, [regex, testString, flags]);

  const highlightedText = useMemo(() => {
    if (!regex || !testString || matches.length === 0) return null;
    const parts: { text: string; highlighted: boolean }[] = [];
    let lastIndex = 0;
    for (const m of matches) {
      if (m.index > lastIndex) {
        parts.push({ text: testString.slice(lastIndex, m.index), highlighted: false });
      }
      parts.push({ text: m.match, highlighted: true });
      lastIndex = m.index + m.match.length;
    }
    if (lastIndex < testString.length) {
      parts.push({ text: testString.slice(lastIndex), highlighted: false });
    }
    return parts;
  }, [regex, testString, matches]);

  const replacedText = useMemo(() => {
    if (!regex || !testString || !showReplace) return '';
    try {
      return testString.replace(regex, replacement);
    } catch {
      return '';
    }
  }, [regex, testString, replacement, showReplace]);

  return (
    <div className="space-y-6">
      <ToggleGroup
        type="single"
        value={activeTab}
        onValueChange={(v) => v && setActiveTab(v as Tab)}
      >
        <ToggleGroupItem value="tester">Tester</ToggleGroupItem>
        <ToggleGroupItem value="library">Library</ToggleGroupItem>
      </ToggleGroup>

      {activeTab === 'library' ? (
        <Suspense fallback={<div className="min-h-[400px]"><ToolSkeleton /></div>}>
          <RegexLibrary onSelect={handleLibrarySelect} />
        </Suspense>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
          <div className="space-y-4">
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">Pattern</p>
              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground">/</span>
                <Input
                  value={pattern}
                  onChange={(e) => setPattern(e.target.value)}
                  placeholder="Enter regex pattern..."
                  className="font-mono"
                  autoFocus
                />
                <span className="text-muted-foreground">/</span>
                <span className="font-mono text-sm text-muted-foreground">{[...flags].join('')}</span>
              </div>
              {regexError && (
                <p className="mt-1 text-xs text-destructive">{regexError}</p>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              {FLAG_OPTIONS.map((f) => (
                <label key={f.id} className="flex items-center gap-1.5 text-xs">
                  <Checkbox
                    checked={flags.has(f.id)}
                    onCheckedChange={() => toggleFlag(f.id)}
                  />
                  {f.label}
                </label>
              ))}
              <label className="flex items-center gap-1.5 text-xs">
                <Checkbox
                  checked={showReplace}
                  onCheckedChange={() => setShowReplace(!showReplace)}
                />
                Replace mode
              </label>
            </div>

            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">Test String</p>
              <Textarea
                value={testString}
                onChange={(e) => setTestString(e.target.value)}
                placeholder="Enter test string..."
                rows={5}
                className="font-mono"
              />
            </div>

            {showReplace && (
              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground">Replacement</p>
                <Input
                  value={replacement}
                  onChange={(e) => setReplacement(e.target.value)}
                  placeholder="Replacement string ($1, $2, etc.)"
                  className="font-mono"
                />
              </div>
            )}

            {highlightedText && (
              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground">
                  Highlighted ({matches.length} {pluralize(matches.length, 'match', 'matches')})
                </p>
                <div className="whitespace-pre-wrap rounded-md border border-border p-3 font-mono text-sm">
                  {highlightedText.map((part, i) =>
                    part.highlighted ? (
                      <mark
                        key={i}
                        className="rounded-sm bg-accent px-0.5 text-accent-foreground"
                      >
                        {part.text}
                      </mark>
                    ) : (
                      <span key={i}>{part.text}</span>
                    ),
                  )}
                </div>
              </div>
            )}

            {showReplace && replacedText && (
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-medium text-muted-foreground">Result</p>
                  <CopyButton value={replacedText} size="sm" className="h-6 w-6" />
                </div>
                <div className="whitespace-pre-wrap rounded-md border border-border p-3 font-mono text-sm">
                  {replacedText}
                </div>
              </div>
            )}

            {matches.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground">Match Details</p>
                <div className="space-y-1.5">
                  {matches.map((m, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 rounded-md border border-border px-3 py-2 text-xs"
                    >
                      <span className="font-mono text-muted-foreground">#{i + 1}</span>
                      <code className="flex-1 break-all">&quot;{m.match}&quot;</code>
                      <span className="text-muted-foreground">@{m.index}</span>
                      {m.groups && Object.keys(m.groups).length > 0 && (
                        <span className="text-muted-foreground">
                          groups: {JSON.stringify(m.groups)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="hidden rounded-md border border-border p-3 lg:block">
            <p className="mb-2 text-xs font-medium text-muted-foreground">Cheat Sheet</p>
            <div className="space-y-1">
              {CHEAT_SHEET.map((item) => (
                <div key={item.pattern} className="flex items-center gap-2 text-xs">
                  <code className="w-16 shrink-0 font-mono text-[11px]">{item.pattern}</code>
                  <span className="text-muted-foreground">{item.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
