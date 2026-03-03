'use client';

import { Download, Upload } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useApiCollectionsPanel } from '@/hooks/use-api-collections-panel';
import { removeVariable } from '@/lib/dev-utils/api-collections-panel';
import { type SavedRequest } from '@/stores/api-collections-store';

import { CollectionsTab } from './collections-tab';
import { EnvironmentsTab } from './environments-tab';

interface ApiCollectionsPanelProps {
  onLoadRequest: (req: SavedRequest, vars: Record<string, string>) => void;
  onSaveRequest: () => SavedRequest;
}

export function ApiCollectionsPanel({ onLoadRequest, onSaveRequest }: ApiCollectionsPanelProps) {
  const {
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
    setActiveEnvironment,
    setEditingEnvId,
    setEnvVarKey,
    setEnvVarValue,
    setNewCollectionName,
    setNewEnvName,
    setShowEnvironmentsTab,
    showEnvironmentsTab,
    updateEnvironment,
  } = useApiCollectionsPanel({ onLoadRequest, onSaveRequest });

  return (
    <div className="space-y-4 rounded-md border border-border bg-muted/20 p-3 text-sm">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button
            className={`text-xs font-medium ${!showEnvironmentsTab ? 'text-foreground underline underline-offset-4' : 'text-muted-foreground'}`}
            onClick={() => setShowEnvironmentsTab(false)}
          >
            Collections
          </button>
          <button
            className={`text-xs font-medium ${showEnvironmentsTab ? 'text-foreground underline underline-offset-4' : 'text-muted-foreground'}`}
            onClick={() => setShowEnvironmentsTab(true)}
          >
            Environments
          </button>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleExport} title="Export">
            <Download className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => importRef.current?.click()} title="Import">
            <Upload className="h-3.5 w-3.5" />
          </Button>
          <input ref={importRef} type="file" accept=".json" className="sr-only" onChange={handleImport} />
        </div>
      </div>

      {!showEnvironmentsTab ? (
        <CollectionsTab
          collections={collections}
          deleteCollection={deleteCollection}
          deleteRequest={deleteRequest}
          handleCreateCollection={handleCreateCollection}
          handleLoad={handleLoad}
          handleSaveToCollection={handleSaveToCollection}
          newCollectionName={newCollectionName}
          setNewCollectionName={setNewCollectionName}
        />
      ) : (
        <EnvironmentsTab
          activeEnvironmentId={activeEnvironmentId}
          deleteEnvironment={deleteEnvironment}
          editingEnvId={editingEnvId}
          envVarKey={envVarKey}
          envVarValue={envVarValue}
          environments={environments}
          handleAddEnv={handleAddEnv}
          handleAddEnvVar={handleAddEnvVar}
          newEnvName={newEnvName}
          removeVariable={removeVariable}
          setActiveEnvironment={setActiveEnvironment}
          setEditingEnvId={setEditingEnvId}
          setEnvVarKey={setEnvVarKey}
          setEnvVarValue={setEnvVarValue}
          setNewEnvName={setNewEnvName}
          updateEnvironment={updateEnvironment}
        />
      )}
    </div>
  );
}
