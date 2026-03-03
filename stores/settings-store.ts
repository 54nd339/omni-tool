import type { ToolSnippet } from '@/lib/constants/snippets';
import { resolveToolsByIds } from '@/lib/constants/tools';
import {
  type SavedContentStore,
  type ToolBookmark,
  useSavedContentStore,
} from '@/stores/saved-content-store';
import {
  type ToolUsageStore,
  useToolUsageStore,
} from '@/stores/tool-usage-store';
import { type UiStore, useUiStore } from '@/stores/ui-store';

const SETTINGS_VERSION = 1;
const MAX_RECENT = 8;

export type { ToolBookmark } from '@/stores/saved-content-store';

export interface ExportableSettings {
  version?: number;
  favorites: string[];
  favoriteOrder: string[];
  recentTools: string[];
  sidebarOpen: boolean;
  bookmarks?: ToolBookmark[];
  snippets?: ToolSnippet[];
  usageCounts?: Record<string, number>;
}

interface TransferActions {
  exportSettings: () => string;
  importSettings: (json: string) => boolean;
}

export type SettingsStore = UiStore & ToolUsageStore & SavedContentStore & TransferActions;

function isValidImportData(data: unknown): data is ExportableSettings {
  if (!data || typeof data !== 'object') return false;
  const objectData = data as Record<string, unknown>;
  const hasFavorites = Array.isArray(objectData.favorites) || Array.isArray(objectData.favoriteOrder);
  if (!hasFavorites) return false;
  if (!Array.isArray(objectData.recentTools)) return false;
  if (typeof objectData.sidebarOpen !== 'boolean') return false;
  return true;
}

function exportSettings(): string {
  const ui = useUiStore.getState();
  const usage = useToolUsageStore.getState();
  const saved = useSavedContentStore.getState();

  const data: ExportableSettings = {
    bookmarks: saved.toolBookmarks,
    favoriteOrder: usage.favoriteTools,
    favorites: usage.favoriteTools,
    recentTools: usage.recentTools,
    sidebarOpen: ui.sidebarOpen,
    snippets: saved.toolSnippets,
    usageCounts: usage.toolUsageCounts,
    version: SETTINGS_VERSION,
  };

  return JSON.stringify(data, null, 2);
}

function importSettings(json: string): boolean {
  try {
    const parsed = JSON.parse(json) as unknown;
    if (!isValidImportData(parsed)) return false;

    useToolUsageStore.setState((state) => ({
      favoriteTools: parsed.favoriteOrder?.length
        ? parsed.favoriteOrder
        : parsed.favorites,
      recentTools: Array.isArray(parsed.recentTools)
        ? parsed.recentTools.slice(0, MAX_RECENT)
        : [],
      toolUsageCounts:
        parsed.usageCounts && typeof parsed.usageCounts === 'object'
          ? parsed.usageCounts
          : state.toolUsageCounts,
    }));

    useUiStore.setState((state) => ({
      sidebarOpen: parsed.sidebarOpen ?? state.sidebarOpen,
    }));

    useSavedContentStore.setState((state) => ({
      toolBookmarks: Array.isArray(parsed.bookmarks)
        ? parsed.bookmarks
        : state.toolBookmarks,
      toolSnippets: Array.isArray(parsed.snippets)
        ? parsed.snippets
        : state.toolSnippets,
    }));

    return true;
  } catch {
    return false;
  }
}

export function useSettingsStore<T>(selector: (state: SettingsStore) => T): T {
  const ui = useUiStore((state) => state);
  const usage = useToolUsageStore((state) => state);
  const saved = useSavedContentStore((state) => state);

  return selector({
    ...saved,
    ...ui,
    ...usage,
    exportSettings,
    importSettings,
  });
}

export const useSidebarOpen = () => useUiStore((state) => state.sidebarOpen);
export const useRecentTools = () => useToolUsageStore((state) => state.recentTools);
export const useFavoriteTools = () => useToolUsageStore((state) => state.favoriteTools);
export const useFavoriteToolDefinitions = () => {
  const favoriteIds = useToolUsageStore((state) => state.favoriteTools);
  return resolveToolsByIds(favoriteIds);
};
export const useCommandPaletteOpen = () =>
  useUiStore((state) => state.commandPaletteOpen);
export const useToolBookmarks = () =>
  useSavedContentStore((state) => state.toolBookmarks);
export const useToolSnippets = () => useSavedContentStore((state) => state.toolSnippets);
