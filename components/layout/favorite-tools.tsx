'use client';

import { type ComponentType, lazy, Suspense, useCallback } from 'react';

import { ToolCard } from '@/components/layout/tools/tool-card';
import type { DndSortableList as DndSortableListType } from '@/components/shared/dnd-sortable-list';
import { useFavoriteToolDefinitions, useSettingsStore } from '@/stores/settings-store';
import { type ToolDefinition } from '@/types/tools';

type ToolItem = ToolDefinition;
type DndListProps = Parameters<typeof DndSortableListType<ToolItem>>[0];

const DndSortableList = lazy(() =>
  import('@/components/shared/dnd-sortable-list').then((m) => ({
    default: m.DndSortableList as ComponentType<DndListProps>,
  })),
);

export function FavoriteTools() {
  const tools = useFavoriteToolDefinitions();
  const reorderFavorites = useSettingsStore((s) => s.reorderFavorites);

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
          renderItem={(tool: ToolItem) => (
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
