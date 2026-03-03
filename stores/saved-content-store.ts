import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { ToolSnippet } from '@/lib/constants/snippets';
import { createId } from '@/lib/utils';

export interface ToolBookmark {
  createdAt: number;
  id: string;
  name: string;
  params: Record<string, string>;
  toolId: string;
}

interface SavedContentState {
  toolBookmarks: ToolBookmark[];
  toolSnippets: ToolSnippet[];
}

interface SavedContentActions {
  deleteBookmark: (id: string) => void;
  deleteSnippet: (id: string) => void;
  loadBookmark: (id: string) => ToolBookmark | undefined;
  saveBookmark: (toolId: string, name: string, params: Record<string, string>) => void;
  saveSnippet: (snippet: ToolSnippet) => void;
}

export type SavedContentStore = SavedContentState & SavedContentActions;

export const useSavedContentStore = create<SavedContentStore>()(
  persist(
    (set, get) => ({
      toolBookmarks: [],
      toolSnippets: [],

      deleteBookmark: (id) =>
        set((state) => ({
          toolBookmarks: state.toolBookmarks.filter((bookmark) => bookmark.id !== id),
        })),

      deleteSnippet: (id) =>
        set((state) => ({
          toolSnippets: state.toolSnippets.filter((snippet) => snippet.id !== id),
        })),

      loadBookmark: (id) => get().toolBookmarks.find((bookmark) => bookmark.id === id),

      saveBookmark: (toolId, name, params) =>
        set((state) => ({
          toolBookmarks: [
            ...state.toolBookmarks,
            {
              createdAt: Date.now(),
              id: createId(),
              name,
              params,
              toolId,
            },
          ],
        })),

      saveSnippet: (snippet) =>
        set((state) => ({
          toolSnippets: [...state.toolSnippets.filter((saved) => saved.id !== snippet.id), snippet],
        })),
    }),
    {
      name: 'omni-saved-content',
    },
  ),
);
