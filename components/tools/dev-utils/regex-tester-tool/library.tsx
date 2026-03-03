'use client';

import { useMemo, useState } from 'react';

import { Input } from '@/components/ui/input';
import { getRegexLibraryByCategory } from '@/lib/dev-utils/regex-tester';

export function RegexLibrary({
  onSelect,
}: {
  onSelect: (pattern: string, flags: string) => void;
}) {
  const [search, setSearch] = useState('');

  const filteredByCategory = useMemo(() => {
    return getRegexLibraryByCategory(search);
  }, [search]);

  return (
    <div className="space-y-4">
      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search patterns by name, category, description..."
        className="font-mono"
      />
      <div className="space-y-6">
        {Object.entries(filteredByCategory).map(([category, patterns]) => (
          <div key={category}>
            <h3 className="mb-2 text-sm font-semibold text-foreground">{category}</h3>
            <div className="space-y-1">
              {patterns.map((entry) => (
                <button
                  key={`${entry.category}-${entry.name}`}
                  type="button"
                  onClick={() => onSelect(entry.pattern, entry.flags)}
                  className="group flex w-full flex-col gap-1 rounded-md border border-border bg-card px-4 py-3 text-left transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <div className="flex w-full items-center justify-between gap-2">
                    <span className="font-semibold text-foreground group-hover:text-accent-foreground">{entry.name}</span>
                    <code className="shrink-0 truncate rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground group-hover:bg-background group-hover:text-foreground transition-colors">
                      /{entry.pattern}/{entry.flags || '(none)'}
                    </code>
                  </div>
                  <p className="text-sm text-muted-foreground group-hover:text-accent-foreground/80">{entry.description}</p>
                  <p className="font-mono text-xs text-muted-foreground group-hover:text-accent-foreground/60 transition-colors">
                    Example: {entry.example}
                  </p>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
