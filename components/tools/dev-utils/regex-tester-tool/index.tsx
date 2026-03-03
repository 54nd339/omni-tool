'use client';

import { lazy, Suspense } from 'react';

import { CopyButton } from '@/components/shared/tool-actions/copy-button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { ToolSkeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useRegexTester } from '@/hooks/use-regex-tester';
import {
  REGEX_TESTER_CHEAT_SHEET,
  REGEX_TESTER_FLAG_OPTIONS,
} from '@/lib/constants/dev-utils';
import { pluralize } from '@/lib/utils';

const RegexLibrary = lazy(() =>
  import('./library').then((m) => ({ default: m.RegexLibrary })),
);

export function RegexTesterTool() {
  const {
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
  } = useRegexTester();

  return (
    <div className="space-y-6">
      <ToggleGroup
        type="single"
        value={activeTab}
        onValueChange={(value) => value && setActiveTab(value as typeof activeTab)}
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
                  onChange={(e) => setParams({ pattern: e.target.value })}
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
              {REGEX_TESTER_FLAG_OPTIONS.map((f) => (
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
                  onCheckedChange={() => setParams({ replace: showReplace ? '0' : '1' })}
                />
                Replace mode
              </label>
            </div>

            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">Test String</p>
              <Textarea
                value={testString}
                onChange={(e) => setParams({ test: e.target.value })}
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
                  onChange={(e) => setParams({ replacement: e.target.value })}
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
              {REGEX_TESTER_CHEAT_SHEET.map((item) => (
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
