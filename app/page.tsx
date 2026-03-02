'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Star, Clock } from 'lucide-react';
import { TOOL_CATEGORIES, TOOLS } from '@/lib/constants/tools';
import type { ToolCategory } from '@/types';
import { ToolCard } from '@/components/layout/tool-card';
import { FavoriteTools } from '@/components/layout/favorite-tools';
import { RecentTools } from '@/components/layout/recent-tools';
import { LazySection } from '@/components/layout/lazy-section';
import { getIcon } from '@/lib/icon-map';
import { pluralize } from '@/lib/utils';
import { useSettingsStore } from '@/stores/settings-store';

const toolsByCategory = TOOL_CATEGORIES.reduce(
  (acc, cat) => {
    acc[cat.id] = TOOLS.filter((t) => t.category === cat.id);
    return acc;
  },
  {} as Record<ToolCategory, (typeof TOOLS)[number][]>,
);

const PREVIEW_COUNT = 3;

export default function HomePage() {
  const toolUsageCounts = useSettingsStore((s) => s.toolUsageCounts);
  const hasFavorites = useSettingsStore((s) => s.favoriteTools.length > 0);
  const hasRecents = useSettingsStore((s) => s.recentTools.length > 0);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const mostUsed = useMemo(() => {
    const entries = Object.entries(toolUsageCounts).filter(([, c]) => c >= 3);
    if (entries.length === 0) return [];
    return entries
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6)
      .map(([id]) => TOOLS.find((t) => t.id === id))
      .filter(Boolean) as (typeof TOOLS)[number][];
  }, [toolUsageCounts]);

  const prefetchPaths = useMemo(() => {
    const entries = Object.entries(toolUsageCounts);
    if (entries.length === 0) return [];
    return entries
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([id]) => TOOLS.find((t) => t.id === id)?.path)
      .filter(Boolean) as string[];
  }, [toolUsageCounts]);

  useEffect(() => {
    const links: HTMLLinkElement[] = [];
    for (const path of prefetchPaths) {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = path;
      document.head.appendChild(link);
      links.push(link);
    }
    return () => links.forEach((l) => l.remove());
  }, [prefetchPaths]);

  let stagger = 0;

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <div
        className="animate-stagger"
        style={{ '--stagger': stagger++ } as React.CSSProperties}
      >
        <h1 className="text-2xl font-semibold tracking-tight">OmniTool</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Offline-first toolbox for images, PDFs, media, crypto, dev utils, and
          more. Everything runs in your browser.
        </p>
      </div>

      <div
        className="animate-stagger"
        style={{ '--stagger': stagger++ } as React.CSSProperties}
      >
        {hasFavorites ? (
          <FavoriteTools />
        ) : (
          <section className="rounded-lg border border-dashed border-border p-4 text-center">
            <Star className="mx-auto h-5 w-5 text-muted-foreground/40" aria-hidden />
            <p className="mt-2 text-sm text-muted-foreground">
              Star tools to pin them here for quick access
            </p>
          </section>
        )}
      </div>

      <div
        className="animate-stagger"
        style={{ '--stagger': stagger++ } as React.CSSProperties}
      >
        {hasRecents ? (
          <RecentTools />
        ) : (
          <section className="rounded-lg border border-dashed border-border p-4 text-center">
            <Clock className="mx-auto h-5 w-5 text-muted-foreground/40" aria-hidden />
            <p className="mt-2 text-sm text-muted-foreground">
              Tools you use will appear here
            </p>
          </section>
        )}
      </div>

      {mostUsed.length > 0 && (
        <div
          className="animate-stagger"
          style={{ '--stagger': stagger++ } as React.CSSProperties}
        >
          <section>
            <h2 className="mb-3 text-sm font-medium text-muted-foreground">
              Most Used
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {mostUsed.map((tool) => (
                <ToolCard
                  key={tool.id}
                  toolId={tool.id}
                  name={tool.name}
                  description={tool.description}
                  href={tool.path}
                  icon={tool.icon}
                />
              ))}
            </div>
          </section>
        </div>
      )}

      {TOOL_CATEGORIES.map((cat, index) => {
        const categoryTools = toolsByCategory[cat.id];
        if (categoryTools.length === 0) return null;
        const CatIcon = getIcon(cat.icon);
        const isExpanded = expanded.has(cat.id);
        const hasMore = categoryTools.length > PREVIEW_COUNT;
        const visibleTools = isExpanded ? categoryTools : categoryTools.slice(0, PREVIEW_COUNT);
        const content = (
          <div
            key={cat.id}
            className="animate-stagger"
            style={{ '--stagger': stagger++ } as React.CSSProperties}
          >
            <section>
              <div className="mb-3 flex items-center gap-2">
                {CatIcon && (
                  <CatIcon className="h-4 w-4 text-muted-foreground" />
                )}
                <h2 className="text-sm font-medium text-muted-foreground">
                  {cat.name}
                </h2>
                <span className="text-xs text-muted-foreground/60">
                  {categoryTools.length} {pluralize(categoryTools.length, 'tool')}
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {visibleTools.map((tool) => (
                  <ToolCard
                    key={tool.id}
                    toolId={tool.id}
                    name={tool.name}
                    description={tool.description}
                    href={tool.path}
                    icon={tool.icon}
                  />
                ))}
              </div>
              {hasMore && !isExpanded && (
                <button
                  onClick={() => setExpanded((prev) => new Set(prev).add(cat.id))}
                  className="mt-3 flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Show all {categoryTools.length} tools
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              )}
              {hasMore && isExpanded && (
                <Link
                  href={cat.path}
                  className="mt-3 flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  View {cat.name}
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </section>
          </div>
        );
        if (index < 2) return content;
        return (
          <LazySection key={cat.id} skeletonCount={Math.min(categoryTools.length, PREVIEW_COUNT)}>
            {content}
          </LazySection>
        );
      })}
    </div>
  );
}
