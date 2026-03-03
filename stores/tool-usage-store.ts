import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const MAX_RECENT = 8;

interface ToolUsageState {
  favoriteTools: string[];
  recentTools: string[];
  toolUsageCounts: Record<string, number>;
}

interface ToolUsageActions {
  addRecentTool: (toolId: string) => void;
  reorderFavorites: (orderedIds: string[]) => void;
  toggleFavorite: (toolId: string) => void;
}

export type ToolUsageStore = ToolUsageState & ToolUsageActions;

export const useToolUsageStore = create<ToolUsageStore>()(
  persist(
    (set) => ({
      favoriteTools: [],
      recentTools: [],
      toolUsageCounts: {},

      addRecentTool: (toolId) =>
        set((state) => ({
          recentTools: [
            toolId,
            ...state.recentTools.filter((id) => id !== toolId),
          ].slice(0, MAX_RECENT),
          toolUsageCounts: {
            ...state.toolUsageCounts,
            [toolId]: (state.toolUsageCounts[toolId] ?? 0) + 1,
          },
        })),

      reorderFavorites: (orderedIds) => set({ favoriteTools: orderedIds }),

      toggleFavorite: (toolId) =>
        set((state) => ({
          favoriteTools: state.favoriteTools.includes(toolId)
            ? state.favoriteTools.filter((id) => id !== toolId)
            : [...state.favoriteTools, toolId],
        })),
    }),
    {
      name: 'omni-tool-usage',
    },
  ),
);
