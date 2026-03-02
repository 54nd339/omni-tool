'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useSettingsStore } from '@/stores/settings-store';
import { BUILT_IN_SNIPPETS } from '@/lib/constants/snippets';
import { type ToolSnippet } from '@/lib/constants/snippets';
import { TOOLS } from '@/lib/constants/tools';

interface SnippetButtonProps {
  toolId: string;
}

export function SnippetButton({ toolId }: SnippetButtonProps) {
  const router = useRouter();
  const toolSnippets = useSettingsStore((s) => s.toolSnippets);
  const saveSnippet = useSettingsStore((s) => s.saveSnippet);
  const deleteSnippet = useSettingsStore((s) => s.deleteSnippet);
  const [name, setName] = useState('');
  const [open, setOpen] = useState(false);

  const toolDef = TOOLS.find((t) => t.id === toolId);
  const toolPath = toolDef?.path ?? '';

  const builtIn = BUILT_IN_SNIPPETS.filter((s) => s.toolId === toolId);
  const userSnippets = toolSnippets.filter((s) => s.toolId === toolId);
  const allSnippets = [...builtIn, ...userSnippets];

  const handleSave = () => {
    if (!name.trim()) return;
    const params = Object.fromEntries(new URLSearchParams(window.location.search).entries());

    // Don't save empty snippets unless intended
    if (Object.keys(params).length === 0) {
      toast.error('No settings to save in URL. Make changes first.');
      return;
    }

    const snippet: ToolSnippet = {
      id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      toolId,
      name: name.trim(),
      params,
    };
    saveSnippet(snippet);
    setName('');
    toast.success('Snippet saved');
  };

  const handleLoad = (snippet: ToolSnippet) => {
    const query = new URLSearchParams(snippet.params).toString();
    router.push(`${toolPath}?${query}`);
    setOpen(false);
    toast.success(`Loaded: ${snippet.name}`);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs">
          <FileText className="h-3.5 w-3.5" />
          Snippets
          {allSnippets.length > 0 && (
            <span className="ml-0.5 rounded-full bg-muted px-1.5 text-[10px] font-medium">
              {allSnippets.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3" align="end">
        <p className="mb-2 text-xs font-medium text-muted-foreground">Snippets</p>

        {allSnippets.length > 0 ? (
          <div className="mb-3 max-h-[200px] space-y-1 overflow-auto">
            {allSnippets.map((snippet) => (
              <div
                key={snippet.id}
                className="group flex items-center justify-between rounded-md px-2 py-1.5 text-xs text-foreground hover:bg-accent hover:text-accent-foreground"
              >
                <button className="flex-1 text-left truncate" onClick={() => handleLoad(snippet)}>
                  {snippet.name}
                  {snippet.builtIn && (
                    <span className="ml-1.5 text-[10px] text-muted-foreground">(built-in)</span>
                  )}
                </button>
                {!snippet.builtIn && (
                  <button
                    className="shrink-0 p-1 text-muted-foreground opacity-100 sm:opacity-0 sm:group-hover:opacity-100 hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSnippet(snippet.id);
                      toast.success('Snippet deleted');
                    }}
                    aria-label={`Delete snippet ${snippet.name}`}
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="mb-3 text-xs text-muted-foreground">No snippets yet</p>
        )}

        <div className="flex items-center gap-2 border-t border-border pt-2">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Snippet name..."
            className="h-7 text-xs"
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          />
          <Button size="sm" variant="outline" className="h-7 shrink-0" onClick={handleSave} disabled={!name.trim()} aria-label="Save snippet">
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
