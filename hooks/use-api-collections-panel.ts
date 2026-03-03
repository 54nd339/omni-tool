'use client';

import { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';

import {
  downloadJsonFile,
  getActiveEnvironmentVariables,
  readFileAsText,
  removeVariable,
  withRequestId,
} from '@/lib/dev-utils/api-collections-panel';
import {
  type SavedRequest,
  useApiActiveEnvironmentId,
  useApiAddCollection,
  useApiAddEnvironment,
  useApiCollections,
  useApiDeleteCollection,
  useApiDeleteEnvironment,
  useApiDeleteRequest,
  useApiEnvironments,
  useApiExportCollections,
  useApiImportCollections,
  useApiSaveRequest,
  useApiSetActiveEnvironment,
  useApiUpdateEnvironment,
} from '@/stores/api-collections-store';

interface UseApiCollectionsPanelParams {
  onLoadRequest: (req: SavedRequest, vars: Record<string, string>) => void;
  onSaveRequest: () => SavedRequest;
}

export function useApiCollectionsPanel(params: UseApiCollectionsPanelParams) {
  const { onLoadRequest, onSaveRequest } = params;

  const collections = useApiCollections();
  const environments = useApiEnvironments();
  const activeEnvironmentId = useApiActiveEnvironmentId();
  const addCollection = useApiAddCollection();
  const deleteCollection = useApiDeleteCollection();
  const saveRequest = useApiSaveRequest();
  const deleteRequest = useApiDeleteRequest();
  const addEnvironment = useApiAddEnvironment();
  const deleteEnvironment = useApiDeleteEnvironment();
  const updateEnvironment = useApiUpdateEnvironment();
  const setActiveEnvironment = useApiSetActiveEnvironment();
  const exportCollections = useApiExportCollections();
  const importCollections = useApiImportCollections();

  const [newCollectionName, setNewCollectionName] = useState('');
  const [showEnvironmentsTab, setShowEnvironmentsTab] = useState(false);
  const [newEnvName, setNewEnvName] = useState('');
  const [editingEnvId, setEditingEnvId] = useState<string | null>(null);
  const [envVarKey, setEnvVarKey] = useState('');
  const [envVarValue, setEnvVarValue] = useState('');
  const importRef = useRef<HTMLInputElement>(null);

  const handleCreateCollection = useCallback(() => {
    const name = newCollectionName.trim();
    if (!name) return;
    addCollection(name);
    setNewCollectionName('');
    toast.success(`Collection "${name}" created`);
  }, [addCollection, newCollectionName]);

  const handleSaveToCollection = useCallback((collectionId: string) => {
    const requestWithId = withRequestId(onSaveRequest());
    saveRequest(collectionId, requestWithId);
    toast.success('Request saved');
  }, [onSaveRequest, saveRequest]);

  const handleLoad = useCallback((req: SavedRequest) => {
    onLoadRequest(req, getActiveEnvironmentVariables(environments, activeEnvironmentId));
  }, [activeEnvironmentId, environments, onLoadRequest]);

  const handleExport = useCallback(() => {
    downloadJsonFile('api-collections.json', exportCollections());
    toast.success('Collections exported');
  }, [exportCollections]);

  const handleImport = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const content = await readFileAsText(file);
      if (importCollections(content)) {
        toast.success('Collections imported');
      } else {
        toast.error('Invalid collections file');
      }
    } catch {
      toast.error('Invalid collections file');
    } finally {
      e.target.value = '';
    }
  }, [importCollections]);

  const handleAddEnv = useCallback(() => {
    const name = newEnvName.trim();
    if (!name) return;
    const id = addEnvironment(name);
    setNewEnvName('');
    setEditingEnvId(id);
  }, [addEnvironment, newEnvName]);

  const handleAddEnvVar = useCallback(() => {
    if (!editingEnvId || !envVarKey.trim()) return;
    const env = environments.find((entry) => entry.id === editingEnvId);
    if (!env) return;
    updateEnvironment(editingEnvId, { ...env.variables, [envVarKey.trim()]: envVarValue });
    setEnvVarKey('');
    setEnvVarValue('');
  }, [editingEnvId, envVarKey, envVarValue, environments, updateEnvironment]);

  return {
    activeEnvironmentId,
    collections,
    deleteCollection,
    deleteEnvironment,
    deleteRequest,
    editingEnvId,
    envVarKey,
    envVarValue,
    environments,
    handleAddEnv,
    handleAddEnvVar,
    handleCreateCollection,
    handleExport,
    handleImport,
    handleLoad,
    handleSaveToCollection,
    importRef,
    newCollectionName,
    newEnvName,
    removeVariable,
    setActiveEnvironment,
    setEditingEnvId,
    setEnvVarKey,
    setEnvVarValue,
    setNewCollectionName,
    setNewEnvName,
    setShowEnvironmentsTab,
    showEnvironmentsTab,
    updateEnvironment,
  };
}
