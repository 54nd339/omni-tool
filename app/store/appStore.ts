'use client';

import { create, type StateCreator, type StoreApi } from 'zustand';
import { persist } from 'zustand/middleware';

export type AppTheme = 'dark' | 'light';

export interface AppState {
  theme: AppTheme;
  sidebarOpen: boolean;
  setTheme: (theme: AppTheme) => void;
  toggleSidebar: () => void;
}

const creator: StateCreator<AppState> = (set: StoreApi<AppState>['setState']) => ({
  theme: 'dark',
  sidebarOpen: false,
  setTheme: (theme: AppTheme) => set({ theme }),
  toggleSidebar: () => set((state: AppState) => ({ sidebarOpen: !state.sidebarOpen })),
});

export const useAppStore = create<AppState>()(
  persist(creator, {
    name: 'omnitool-app-state',
    partialize: (state: AppState) => ({
      theme: state.theme,
      sidebarOpen: state.sidebarOpen,
    }),
  }),
);
