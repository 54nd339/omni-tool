import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UiState {
  aiPanelOpen: boolean;
  changelogModalOpen: boolean;
  commandPaletteOpen: boolean;
  lastSeenVersion: string;
  shortcutsPanelOpen: boolean;
  sidebarOpen: boolean;
}

interface UiActions {
  setAiPanelOpen: (open: boolean) => void;
  setChangelogModalOpen: (open: boolean) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setLastSeenVersion: (version: string) => void;
  setShortcutsPanelOpen: (open: boolean) => void;
  setSidebarOpen: (open: boolean) => void;
  toggleAiPanel: () => void;
  toggleCommandPalette: () => void;
  toggleShortcutsPanel: () => void;
  toggleSidebar: () => void;
}

export type UiStore = UiState & UiActions;

export const useUiStore = create<UiStore>()(
  persist(
    (set) => ({
      aiPanelOpen: false,
      changelogModalOpen: false,
      commandPaletteOpen: false,
      lastSeenVersion: '',
      shortcutsPanelOpen: false,
      sidebarOpen: true,

      setAiPanelOpen: (open) => set({ aiPanelOpen: open }),
      setChangelogModalOpen: (open) => set({ changelogModalOpen: open }),
      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
      setLastSeenVersion: (version) => set({ lastSeenVersion: version }),
      setShortcutsPanelOpen: (open) => set({ shortcutsPanelOpen: open }),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleAiPanel: () => set((state) => ({ aiPanelOpen: !state.aiPanelOpen })),
      toggleCommandPalette: () => set((state) => ({ commandPaletteOpen: !state.commandPaletteOpen })),
      toggleShortcutsPanel: () => set((state) => ({ shortcutsPanelOpen: !state.shortcutsPanelOpen })),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    }),
    {
      name: 'omni-ui-settings',
      partialize: (state) => ({
        lastSeenVersion: state.lastSeenVersion,
        sidebarOpen: state.sidebarOpen,
      }),
    },
  ),
);
