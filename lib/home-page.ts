import {
  TOOL_CATEGORIES,
  type ToolItem,
  TOOLS,
} from '@/lib/constants/tools';
import type { ToolCategory } from '@/types/tools';

function isDefined<T>(value: T | undefined): value is T {
  return value !== undefined;
}

export const TOOLS_BY_CATEGORY = TOOL_CATEGORIES.reduce(
  (acc, category) => {
    acc[category.id] = TOOLS.filter((tool) => tool.category === category.id);
    return acc;
  },
  {} as Record<ToolCategory, ToolItem[]>,
);

export function getMostUsedTools(
  toolUsageCounts: Record<string, number>,
  minUsage = 3,
  limit = 6,
): ToolItem[] {
  const entries = Object.entries(toolUsageCounts).filter(([, count]) => count >= minUsage);
  if (entries.length === 0) return [];

  return entries
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([id]) => TOOLS.find((tool) => tool.id === id))
    .filter(isDefined);
}

export function getMostUsedPrefetchPaths(
  toolUsageCounts: Record<string, number>,
  limit = 5,
): ToolItem['path'][] {
  const entries = Object.entries(toolUsageCounts);
  if (entries.length === 0) return [];

  return entries
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([id]) => TOOLS.find((tool) => tool.id === id)?.path)
    .filter((path): path is ToolItem['path'] => path !== undefined);
}
