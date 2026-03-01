'use client';

import { useCallback, useRef, useState } from 'react';
import { Download, FolderPlus, Plus, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  useApiCollectionsStore,
  type SavedRequest,
} from '@/stores/api-collections-store';

interface ApiCollectionsPanelProps {
  onLoadRequest: (req: SavedRequest, vars: Record<string, string>) => void;
  onSaveRequest: () => SavedRequest;
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 11);
}

export function ApiCollectionsPanel({ onLoadRequest, onSaveRequest }: ApiCollectionsPanelProps) {
  const collections = useApiCollectionsStore((s) => s.collections);
  const environments = useApiCollectionsStore((s) => s.environments);
  const activeEnvironmentId = useApiCollectionsStore((s) => s.activeEnvironmentId);
  const addCollection = useApiCollectionsStore((s) => s.addCollection);
  const deleteCollection = useApiCollectionsStore((s) => s.deleteCollection);
  const saveRequest = useApiCollectionsStore((s) => s.saveRequest);
  const deleteRequest = useApiCollectionsStore((s) => s.deleteRequest);
  const addEnvironment = useApiCollectionsStore((s) => s.addEnvironment);
  const deleteEnvironment = useApiCollectionsStore((s) => s.deleteEnvironment);
  const updateEnvironment = useApiCollectionsStore((s) => s.updateEnvironment);
  const setActiveEnvironment = useApiCollectionsStore((s) => s.setActiveEnvironment);
  const exportCollections = useApiCollectionsStore((s) => s.exportCollections);
  const importCollections = useApiCollectionsStore((s) => s.importCollections);

  const [newCollName, setNewCollName] = useState('');
  const [envTab, setEnvTab] = useState(false);
  const [newEnvName, setNewEnvName] = useState('');
  const [editingEnvId, setEditingEnvId] = useState<string | null>(null);
  const [envVarKey, setEnvVarKey] = useState('');
  const [envVarValue, setEnvVarValue] = useState('');
  const importRef = useRef<HTMLInputElement>(null);

  const activeVars = environments.find((e) => e.id === activeEnvironmentId)?.variables ?? {};

  const handleCreateCollection = useCallback(() => {
    const name = newCollName.trim();
    if (!name) return;
    addCollection(name);
    setNewCollName('');
    toast.success(`Collection "${name}" created`);
  }, [newCollName, addCollection]);

  const handleSaveToCollection = useCallback((collectionId: string) => {
    const req = onSaveRequest();
    const reqWithId = { ...req, id: req.id || generateId() };
    saveRequest(collectionId, reqWithId);
    toast.success('Request saved');
  }, [onSaveRequest, saveRequest]);

  const handleLoad = useCallback((req: SavedRequest) => {
    onLoadRequest(req, activeVars);
  }, [onLoadRequest, activeVars]);

  const handleExport = useCallback(() => {
    const json = exportCollections();
    const blob = new Blob([json], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'api-collections.json';
    a.click();
    URL.revokeObjectURL(a.href);
    toast.success('Collections exported');
  }, [exportCollections]);

  const handleImport = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (importCollections(reader.result as string)) {
        toast.success('Collections imported');
      } else {
        toast.error('Invalid collections file');
      }
      e.target.value = '';
    };
    reader.readAsText(file);
  }, [importCollections]);

  const handleAddEnv = useCallback(() => {
    const name = newEnvName.trim();
    if (!name) return;
    const id = addEnvironment(name);
    setNewEnvName('');
    setEditingEnvId(id);
  }, [newEnvName, addEnvironment]);

  const handleAddEnvVar = useCallback(() => {
    if (!editingEnvId || !envVarKey.trim()) return;
    const env = environments.find((e) => e.id === editingEnvId);
    if (!env) return;
    updateEnvironment(editingEnvId, { ...env.variables, [envVarKey.trim()]: envVarValue });
    setEnvVarKey('');
    setEnvVarValue('');
  }, [editingEnvId, envVarKey, envVarValue, environments, updateEnvironment]);

  return (
    <div className="space-y-4 rounded-md border border-border bg-muted/20 p-3 text-sm">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button
            className={`text-xs font-medium ${!envTab ? 'text-foreground underline underline-offset-4' : 'text-muted-foreground'}`}
            onClick={() => setEnvTab(false)}
          >
            Collections
          </button>
          <button
            className={`text-xs font-medium ${envTab ? 'text-foreground underline underline-offset-4' : 'text-muted-foreground'}`}
            onClick={() => setEnvTab(true)}
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

      {!envTab ? (
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={newCollName}
              onChange={(e) => setNewCollName(e.target.value)}
              placeholder="New collection..."
              className="h-8 text-xs"
              onKeyDown={(e) => e.key === 'Enter' && handleCreateCollection()}
            />
            <Button variant="outline" size="sm" className="h-8 shrink-0" onClick={handleCreateCollection}>
              <FolderPlus className="mr-1 h-3.5 w-3.5" />
              Add
            </Button>
          </div>

          {collections.length === 0 && (
            <p className="py-2 text-center text-xs text-muted-foreground">No collections yet</p>
          )}

          {collections.map((coll) => (
            <div key={coll.id} className="rounded-md border border-border bg-background p-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">{coll.name}</span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleSaveToCollection(coll.id)} title="Save current request">
                    <Plus className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => deleteCollection(coll.id)} title="Delete collection">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              {coll.requests.length > 0 && (
                <ul className="mt-1 space-y-0.5">
                  {coll.requests.map((req) => (
                    <li key={req.id} className="flex items-center justify-between gap-1 rounded px-1.5 py-0.5 hover:bg-muted">
                      <button
                        className="flex items-center gap-2 text-left text-xs"
                        onClick={() => handleLoad(req)}
                      >
                        <span className="w-12 shrink-0 rounded bg-muted px-1 py-0.5 text-center text-[10px] font-mono font-semibold">
                          {req.method}
                        </span>
                        <span className="truncate">{req.name || req.url}</span>
                      </button>
                      <Button variant="ghost" size="icon" className="h-5 w-5 shrink-0 text-destructive" onClick={() => deleteRequest(coll.id, req.id)}>
                        <Trash2 className="h-2.5 w-2.5" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <p className="text-xs text-muted-foreground">Active:</p>
            <Select value={activeEnvironmentId ?? 'none'} onValueChange={(v) => setActiveEnvironment(v === 'none' ? null : v)}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {environments.map((env) => (
                  <SelectItem key={env.id} value={env.id}>{env.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Input value={newEnvName} onChange={(e) => setNewEnvName(e.target.value)} placeholder="New environment..." className="h-8 text-xs" onKeyDown={(e) => e.key === 'Enter' && handleAddEnv()} />
            <Button variant="outline" size="sm" className="h-8 shrink-0" onClick={handleAddEnv}>Add</Button>
          </div>

          {environments.map((env) => (
            <div key={env.id} className="rounded-md border border-border bg-background p-2">
              <div className="flex items-center justify-between">
                <button className="text-xs font-medium" onClick={() => setEditingEnvId(editingEnvId === env.id ? null : env.id)}>
                  {env.name} ({Object.keys(env.variables).length} vars)
                </button>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => deleteEnvironment(env.id)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
              {editingEnvId === env.id && (
                <div className="mt-2 space-y-1">
                  {Object.entries(env.variables).map(([k, v]) => (
                    <div key={k} className="flex items-center gap-1 text-xs">
                      <code className="rounded bg-muted px-1 py-0.5 font-mono">{`{{${k}}}`}</code>
                      <span className="text-muted-foreground">=</span>
                      <span className="truncate">{v}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="ml-auto h-5 w-5 shrink-0"
                        onClick={() => {
                          const { [k]: _, ...rest } = env.variables;
                          updateEnvironment(env.id, rest);
                        }}
                      >
                        <Trash2 className="h-2.5 w-2.5" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex gap-1 pt-1">
                    <Input value={envVarKey} onChange={(e) => setEnvVarKey(e.target.value)} placeholder="key" className="h-7 text-xs" />
                    <Input value={envVarValue} onChange={(e) => setEnvVarValue(e.target.value)} placeholder="value" className="h-7 text-xs" />
                    <Button variant="outline" size="sm" className="h-7 shrink-0 text-xs" onClick={handleAddEnvVar}>+</Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
