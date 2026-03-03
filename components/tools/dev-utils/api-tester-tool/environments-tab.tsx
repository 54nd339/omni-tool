'use client';

import { Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface EnvironmentItem {
  id: string;
  name: string;
  variables: Record<string, string>;
}

interface EnvironmentsTabProps {
  activeEnvironmentId: string | null;
  deleteEnvironment: (environmentId: string) => void;
  editingEnvId: string | null;
  envVarKey: string;
  envVarValue: string;
  environments: EnvironmentItem[];
  handleAddEnv: () => void;
  handleAddEnvVar: () => void;
  newEnvName: string;
  removeVariable: (variables: Record<string, string>, key: string) => Record<string, string>;
  setActiveEnvironment: (value: string | null) => void;
  setEditingEnvId: (value: string | null) => void;
  setEnvVarKey: (value: string) => void;
  setEnvVarValue: (value: string) => void;
  setNewEnvName: (value: string) => void;
  updateEnvironment: (environmentId: string, variables: Record<string, string>) => void;
}

export function EnvironmentsTab({
  activeEnvironmentId,
  deleteEnvironment,
  editingEnvId,
  envVarKey,
  envVarValue,
  environments,
  handleAddEnv,
  handleAddEnvVar,
  newEnvName,
  removeVariable,
  setActiveEnvironment,
  setEditingEnvId,
  setEnvVarKey,
  setEnvVarValue,
  setNewEnvName,
  updateEnvironment,
}: EnvironmentsTabProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <p className="text-xs text-muted-foreground">Active:</p>
        <Select
          value={activeEnvironmentId ?? 'none'}
          onValueChange={(value) => setActiveEnvironment(value === 'none' ? null : value)}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="None" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            {environments.map((environment) => (
              <SelectItem key={environment.id} value={environment.id}>
                {environment.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2">
        <Input
          value={newEnvName}
          onChange={(event) => setNewEnvName(event.target.value)}
          placeholder="New environment..."
          className="h-8 text-xs"
          onKeyDown={(event) => event.key === 'Enter' && handleAddEnv()}
        />
        <Button variant="outline" size="sm" className="h-8 shrink-0" onClick={handleAddEnv}>
          Add
        </Button>
      </div>

      {environments.map((environment) => (
        <div key={environment.id} className="rounded-md border border-border bg-background p-2">
          <div className="flex items-center justify-between">
            <button
              className="text-xs font-medium"
              onClick={() => setEditingEnvId(editingEnvId === environment.id ? null : environment.id)}
            >
              {environment.name} ({Object.keys(environment.variables).length} vars)
            </button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-destructive"
              onClick={() => deleteEnvironment(environment.id)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
          {editingEnvId === environment.id && (
            <div className="mt-2 space-y-1">
              {Object.entries(environment.variables).map(([key, value]) => (
                <div key={key} className="flex items-center gap-1 text-xs">
                  <code className="rounded bg-muted px-1 py-0.5 font-mono">{`{{${key}}}`}</code>
                  <span className="text-muted-foreground">=</span>
                  <span className="truncate">{value}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-auto h-5 w-5 shrink-0"
                    onClick={() => updateEnvironment(environment.id, removeVariable(environment.variables, key))}
                  >
                    <Trash2 className="h-2.5 w-2.5" />
                  </Button>
                </div>
              ))}
              <div className="flex gap-1 pt-1">
                <Input
                  value={envVarKey}
                  onChange={(event) => setEnvVarKey(event.target.value)}
                  placeholder="key"
                  className="h-7 text-xs"
                />
                <Input
                  value={envVarValue}
                  onChange={(event) => setEnvVarValue(event.target.value)}
                  placeholder="value"
                  className="h-7 text-xs"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 shrink-0 text-xs"
                  onClick={handleAddEnvVar}
                >
                  +
                </Button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
