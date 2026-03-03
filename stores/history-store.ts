import { create } from 'zustand';

interface Snapshot {
  label: string;
  data: unknown;
  timestamp: number;
}

interface HistoryState {
  past: Snapshot[];
  future: Snapshot[];
  canUndo: boolean;
  canRedo: boolean;
}

interface HistoryActions {
  push: (label: string, data: unknown) => void;
  undo: () => Snapshot | null;
  redo: () => Snapshot | null;
  clear: () => void;
}

const MAX_HISTORY = 50;

export const useHistoryStore = create<HistoryState & HistoryActions>()(
  (set, get) => ({
    past: [],
    future: [],
    canUndo: false,
    canRedo: false,

    push: (label, data) =>
      set((s) => {
        const snapshot: Snapshot = { label, data, timestamp: Date.now() };
        const past = [...s.past, snapshot].slice(-MAX_HISTORY);
        return { past, future: [], canUndo: true, canRedo: false };
      }),

    undo: () => {
      const { past, future } = get();
      if (past.length === 0) return null;
      const snapshot = past[past.length - 1];
      set({
        past: past.slice(0, -1),
        future: [snapshot, ...future],
        canUndo: past.length > 1,
        canRedo: true,
      });
      return snapshot;
    },

    redo: () => {
      const { past, future } = get();
      if (future.length === 0) return null;
      const snapshot = future[0];
      set({
        past: [...past, snapshot],
        future: future.slice(1),
        canUndo: true,
        canRedo: future.length > 1,
      });
      return snapshot;
    },

    clear: () =>
      set({ past: [], future: [], canUndo: false, canRedo: false }),
  }),
);

export const useCanUndo = () => useHistoryStore((s) => s.canUndo);
export const useCanRedo = () => useHistoryStore((s) => s.canRedo);
