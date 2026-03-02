'use client';

import { useCallback, Suspense, lazy, type ComponentType } from 'react';
import { TOOLS } from '@/lib/constants/tools';
import type { ToolDefinition } from '@/types';
import { useSettingsStore } from '@/stores/settings-store';
import { ToolCard } from '@/components/layout/tool-card';
import type { DndSortableList as DndSortableListType } from '@/components/shared/dnd-sortable-list';

type DndListProps = Parameters<typeof DndSortableListType<ToolDefinition>>[0];

const DndSortableList = lazy(() =>
  import('@/components/shared/dnd-sortable-list').then((m) => ({
    default: m.DndSortableList as ComponentType<DndListProps>,
  })),
);

export function FavoriteTools() {
  const favoriteIds = useSettingsStore((s) => s.favoriteTools);
  const reorderFavorites = useSettingsStore((s) => s.reorderFavorites);

  const tools = favoriteIds
    .map((id) => TOOLS.find((t) => t.id === id))
    .filter((t): t is ToolDefinition => t !== undefined);

  const handleReorder = useCallback(
    (ids: string[]) => reorderFavorites(ids),
    [reorderFavorites],
  );

  if (tools.length === 0) return null;

  return (
    <section>
      <h2 className="mb-3 text-sm font-medium text-muted-foreground">
        Favorites
      </h2>
      <Suspense
        fallback={
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {tools.map((tool) => (
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
        }
      >
        <DndSortableList
          items={tools}
          onReorder={handleReorder}
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
          renderItem={(tool: ToolDefinition) => (
            <ToolCard
              toolId={tool.id}
              name={tool.name}
              description={tool.description}
              href={tool.path}
              icon={tool.icon}
            />
          )}
        />
      </Suspense>
    </section>
  );
}
