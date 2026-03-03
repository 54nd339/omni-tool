import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { createPrefixedId } from '@/lib/utils';

export interface ClipboardClip {
  id: string;
  text: string;
  preview: string;
  toolId?: string;
  timestamp: number;
}

interface ClipboardState {
  clips: ClipboardClip[];
  addClip: (text: string, toolId?: string) => void;
  removeClip: (id: string) => void;
  clearClips: () => void;
}

const MAX_CLIPS = 30;
const PREVIEW_LENGTH = 80;

export const useClipboardStore = create<ClipboardState>()(
  persist(
    (set) => ({
      clips: [],

      addClip: (text, toolId) => {
        const preview =
          text.length > PREVIEW_LENGTH
            ? text.slice(0, PREVIEW_LENGTH) + '…'
            : text;

        set((state) => {
          const filtered = state.clips.filter((c) => c.text !== text);
          const newClip: ClipboardClip = {
            id: createPrefixedId('clip', 4),
            text,
            preview,
            toolId,
            timestamp: Date.now(),
          };
          return {
            clips: [newClip, ...filtered].slice(0, MAX_CLIPS),
          };
        });
      },

      removeClip: (id) =>
        set((state) => ({
          clips: state.clips.filter((c) => c.id !== id),
        })),

      clearClips: () => set({ clips: [] }),
    }),
    {
      name: 'omnitool-clipboard',
    },
  ),
);

export const useClipboardClips = () => useClipboardStore((state) => state.clips);
export const useClipboardAddClip = () => useClipboardStore((state) => state.addClip);
export const useClipboardRemoveClip = () => useClipboardStore((state) => state.removeClip);
export const useClipboardClearClips = () => useClipboardStore((state) => state.clearClips);
