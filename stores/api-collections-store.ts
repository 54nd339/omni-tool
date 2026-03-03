import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { createId } from '@/lib/utils';

export interface SavedRequest {
  id: string;
  name: string;
  method: string;
  url: string;
  headers: { key: string; value: string }[];
  body: string;
}

export interface ApiCollection {
  id: string;
  name: string;
  requests: SavedRequest[];
}

export interface ApiEnvironment {
  id: string;
  name: string;
  variables: Record<string, string>;
}

interface ApiCollectionsState {
  collections: ApiCollection[];
  environments: ApiEnvironment[];
  activeEnvironmentId: string | null;
}

interface ApiCollectionsActions {
  addCollection: (name: string) => string;
  deleteCollection: (id: string) => void;
  saveRequest: (collectionId: string, request: SavedRequest) => void;
  deleteRequest: (collectionId: string, requestId: string) => void;
  addEnvironment: (name: string) => string;
  deleteEnvironment: (id: string) => void;
  updateEnvironment: (id: string, variables: Record<string, string>) => void;
  setActiveEnvironment: (id: string | null) => void;
  exportCollections: () => string;
  importCollections: (json: string) => boolean;
}

function genId(): string {
  return createId();
}

export const useApiCollectionsStore = create<ApiCollectionsState & ApiCollectionsActions>()(
  persist(
    (set, get) => ({
      collections: [],
      environments: [],
      activeEnvironmentId: null,

      addCollection: (name) => {
        const id = genId();
        set((s) => ({ collections: [...s.collections, { id, name, requests: [] }] }));
        return id;
      },

      deleteCollection: (id) =>
        set((s) => ({ collections: s.collections.filter((c) => c.id !== id) })),

      saveRequest: (collectionId, request) =>
        set((s) => ({
          collections: s.collections.map((c) => {
            if (c.id !== collectionId) return c;
            const existing = c.requests.findIndex((r) => r.id === request.id);
            const requests = existing >= 0
              ? c.requests.map((r) => (r.id === request.id ? request : r))
              : [...c.requests, request];
            return { ...c, requests };
          }),
        })),

      deleteRequest: (collectionId, requestId) =>
        set((s) => ({
          collections: s.collections.map((c) =>
            c.id === collectionId
              ? { ...c, requests: c.requests.filter((r) => r.id !== requestId) }
              : c,
          ),
        })),

      addEnvironment: (name) => {
        const id = genId();
        set((s) => ({ environments: [...s.environments, { id, name, variables: {} }] }));
        return id;
      },

      deleteEnvironment: (id) =>
        set((s) => ({
          environments: s.environments.filter((e) => e.id !== id),
          activeEnvironmentId: s.activeEnvironmentId === id ? null : s.activeEnvironmentId,
        })),

      updateEnvironment: (id, variables) =>
        set((s) => ({
          environments: s.environments.map((e) => (e.id === id ? { ...e, variables } : e)),
        })),

      setActiveEnvironment: (id) => set({ activeEnvironmentId: id }),

      exportCollections: () => {
        const { collections, environments } = get();
        return JSON.stringify({ collections, environments }, null, 2);
      },

      importCollections: (json) => {
        try {
          const data = JSON.parse(json);
          if (!Array.isArray(data.collections)) return false;
          set({
            collections: data.collections,
            environments: Array.isArray(data.environments) ? data.environments : [],
          });
          return true;
        } catch {
          return false;
        }
      },
    }),
    { name: 'api-collections' },
  ),
);

export const useApiCollections = () => useApiCollectionsStore((state) => state.collections);
export const useApiEnvironments = () => useApiCollectionsStore((state) => state.environments);
export const useApiActiveEnvironmentId = () => useApiCollectionsStore((state) => state.activeEnvironmentId);
export const useApiAddCollection = () => useApiCollectionsStore((state) => state.addCollection);
export const useApiDeleteCollection = () => useApiCollectionsStore((state) => state.deleteCollection);
export const useApiSaveRequest = () => useApiCollectionsStore((state) => state.saveRequest);
export const useApiDeleteRequest = () => useApiCollectionsStore((state) => state.deleteRequest);
export const useApiAddEnvironment = () => useApiCollectionsStore((state) => state.addEnvironment);
export const useApiDeleteEnvironment = () => useApiCollectionsStore((state) => state.deleteEnvironment);
export const useApiUpdateEnvironment = () => useApiCollectionsStore((state) => state.updateEnvironment);
export const useApiSetActiveEnvironment = () => useApiCollectionsStore((state) => state.setActiveEnvironment);
export const useApiExportCollections = () => useApiCollectionsStore((state) => state.exportCollections);
export const useApiImportCollections = () => useApiCollectionsStore((state) => state.importCollections);

export function substituteEnvVars(text: string, vars: Record<string, string>): string {
  return text.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`);
}
