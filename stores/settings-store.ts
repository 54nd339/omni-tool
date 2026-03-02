import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ToolSnippet } from '@/lib/constants/snippets';

export interface ToolBookmark {
  id: string;
  name: string;
  toolId: string;
  params: Record<string, string>;
  createdAt: number;
}

const SETTINGS_VERSION = 1;

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

interface SettingsState {
  sidebarOpen: boolean;
  recentTools: string[];
  favoriteTools: string[];
  commandPaletteOpen: boolean;
  shortcutsPanelOpen: boolean;
  aiPanelOpen: boolean;
  lastSeenVersion: string;
  changelogModalOpen: boolean;
  toolBookmarks: ToolBookmark[];
  toolSnippets: ToolSnippet[];
  toolUsageCounts: Record<string, number>;
}

interface SettingsActions {
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  addRecentTool: (toolId: string) => void;
  toggleFavorite: (toolId: string) => void;
  reorderFavorites: (orderedIds: string[]) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  toggleCommandPalette: () => void;
  setShortcutsPanelOpen: (open: boolean) => void;
  toggleShortcutsPanel: () => void;
  setAiPanelOpen: (open: boolean) => void;
  toggleAiPanel: () => void;
  setLastSeenVersion: (version: string) => void;
  setChangelogModalOpen: (open: boolean) => void;
  saveBookmark: (toolId: string, name: string, params: Record<string, string>) => void;
  loadBookmark: (id: string) => ToolBookmark | undefined;
  deleteBookmark: (id: string) => void;
  saveSnippet: (snippet: ToolSnippet) => void;
  deleteSnippet: (id: string) => void;
  exportSettings: () => string;
  importSettings: (json: string) => boolean;
}

const MAX_RECENT = 8;

function isValidImportData(data: unknown): data is ExportableSettings {
  if (!data || typeof data !== 'object') return false;
  const o = data as Record<string, unknown>;
  const hasFavorites = Array.isArray(o.favorites) || Array.isArray(o.favoriteOrder);
  if (!hasFavorites) return false;
  if (!Array.isArray(o.recentTools)) return false;
  if (typeof o.sidebarOpen !== 'boolean') return false;
  return true;
}

export const useSettingsStore = create<SettingsState & SettingsActions>()(
  persist(
    (set, get) => ({
      sidebarOpen: true,
      recentTools: [],
      favoriteTools: [],
      commandPaletteOpen: false,
      shortcutsPanelOpen: false,
      aiPanelOpen: false,
      lastSeenVersion: '',
      changelogModalOpen: false,
      toolBookmarks: [],
      toolSnippets: [],
      toolUsageCounts: {},

      toggleSidebar: () =>
        set((s) => ({ sidebarOpen: !s.sidebarOpen })),

      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      addRecentTool: (toolId) =>
        set((s) => ({
          recentTools: [
            toolId,
            ...s.recentTools.filter((id) => id !== toolId),
          ].slice(0, MAX_RECENT),
          toolUsageCounts: {
            ...s.toolUsageCounts,
            [toolId]: (s.toolUsageCounts[toolId] ?? 0) + 1,
          },
        })),

      toggleFavorite: (toolId) =>
        set((s) => ({
          favoriteTools: s.favoriteTools.includes(toolId)
            ? s.favoriteTools.filter((id) => id !== toolId)
            : [...s.favoriteTools, toolId],
        })),

      reorderFavorites: (orderedIds) => set({ favoriteTools: orderedIds }),

      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),

      toggleCommandPalette: () =>
        set((s) => ({ commandPaletteOpen: !s.commandPaletteOpen })),

      setShortcutsPanelOpen: (open) => set({ shortcutsPanelOpen: open }),
      toggleShortcutsPanel: () =>
        set((s) => ({ shortcutsPanelOpen: !s.shortcutsPanelOpen })),

      setAiPanelOpen: (open) => set({ aiPanelOpen: open }),
      toggleAiPanel: () =>
        set((s) => ({ aiPanelOpen: !s.aiPanelOpen })),

      setLastSeenVersion: (version) => set({ lastSeenVersion: version }),

      setChangelogModalOpen: (open) => set({ changelogModalOpen: open }),

      saveBookmark: (toolId, name, params) =>
        set((s) => ({
          toolBookmarks: [
            ...s.toolBookmarks,
            {
              id: Math.random().toString(36).slice(2, 11),
              name,
              toolId,
              params,
              createdAt: Date.now(),
            },
          ],
        })),

      loadBookmark: (id) => get().toolBookmarks.find((b) => b.id === id),

      deleteBookmark: (id) =>
        set((s) => ({
          toolBookmarks: s.toolBookmarks.filter((b) => b.id !== id),
        })),

      saveSnippet: (snippet) =>
        set((s) => ({
          toolSnippets: [...s.toolSnippets.filter((sn) => sn.id !== snippet.id), snippet],
        })),

      deleteSnippet: (id) =>
        set((s) => ({
          toolSnippets: s.toolSnippets.filter((sn) => sn.id !== id),
        })),

      exportSettings: () => {
        const s = get();
        const data: ExportableSettings = {
          version: SETTINGS_VERSION,
          favorites: s.favoriteTools,
          favoriteOrder: s.favoriteTools,
          recentTools: s.recentTools,
          sidebarOpen: s.sidebarOpen,
          bookmarks: s.toolBookmarks,
          snippets: s.toolSnippets,
          usageCounts: s.toolUsageCounts,
        };
        return JSON.stringify(data, null, 2);
      },

      importSettings: (json) => {
        try {
          const parsed = JSON.parse(json) as unknown;
          if (!isValidImportData(parsed)) return false;
          set({
            favoriteTools: parsed.favoriteOrder?.length
              ? parsed.favoriteOrder
              : parsed.favorites,
            recentTools: Array.isArray(parsed.recentTools)
              ? parsed.recentTools.slice(0, MAX_RECENT)
              : [],
            sidebarOpen: parsed.sidebarOpen ?? get().sidebarOpen,
            toolBookmarks: Array.isArray(parsed.bookmarks) ? parsed.bookmarks : get().toolBookmarks,
            toolSnippets: Array.isArray(parsed.snippets) ? parsed.snippets : get().toolSnippets,
            toolUsageCounts: parsed.usageCounts && typeof parsed.usageCounts === 'object' ? parsed.usageCounts : get().toolUsageCounts,
          });
          return true;
        } catch {
          return false;
        }
      },
    }),
    {
      name: 'omni-settings',
      partialize: (s) => ({
        sidebarOpen: s.sidebarOpen,
        recentTools: s.recentTools,
        favoriteTools: s.favoriteTools,
        lastSeenVersion: s.lastSeenVersion,
        toolBookmarks: s.toolBookmarks,
        toolSnippets: s.toolSnippets,
        toolUsageCounts: s.toolUsageCounts,
      }),
    },
  ),
);

export const useSidebarOpen = () => useSettingsStore((s) => s.sidebarOpen);
