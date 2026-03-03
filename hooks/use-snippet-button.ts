'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import {
  BUILT_IN_SNIPPETS,
  type ToolSnippet,
} from '@/lib/constants/snippets';
import { TOOLS } from '@/lib/constants/tools';
import { createPrefixedId } from '@/lib/utils';
import { useSettingsStore } from '@/stores/settings-store';

export function useSnippetButton(toolId: string) {
  const router = useRouter();
  const toolSnippets = useSettingsStore((state) => state.toolSnippets);
  const saveSnippet = useSettingsStore((state) => state.saveSnippet);
  const deleteSnippet = useSettingsStore((state) => state.deleteSnippet);
  const [name, setName] = useState('');
  const [open, setOpen] = useState(false);

  const toolDef = useMemo(() => TOOLS.find((tool) => tool.id === toolId), [toolId]);
  const toolPath = toolDef?.path ?? '';

  const builtIn = useMemo(
    () => BUILT_IN_SNIPPETS.filter((snippet) => snippet.toolId === toolId),
    [toolId],
  );
  const userSnippets = useMemo(
    () => toolSnippets.filter((snippet) => snippet.toolId === toolId),
    [toolId, toolSnippets],
  );
  const allSnippets = useMemo(
    () => [...builtIn, ...userSnippets],
    [builtIn, userSnippets],
  );

  const handleSave = useCallback(() => {
    if (!name.trim()) return;

    const params = Object.fromEntries(
      new URLSearchParams(window.location.search).entries(),
    );

    if (Object.keys(params).length === 0) {
      toast.error('No settings to save in URL. Make changes first.');
      return;
    }

    const snippet: ToolSnippet = {
      id: createPrefixedId('user', 4),
      toolId,
      name: name.trim(),
      params,
    };

    saveSnippet(snippet);
    setName('');
    toast.success('Snippet saved');
  }, [name, saveSnippet, toolId]);

  const handleLoad = useCallback(
    (snippet: ToolSnippet) => {
      const query = new URLSearchParams(snippet.params).toString();
      router.push(`${toolPath}?${query}`);
      toast.success(`Loaded: ${snippet.name}`);
    },
    [router, toolPath],
  );

  const handleDelete = useCallback(
    (snippet: ToolSnippet) => {
      deleteSnippet(snippet.id);
      toast.success('Snippet deleted');
    },
    [deleteSnippet],
  );

  return {
    allSnippets,
    handleDelete,
    handleLoad,
    handleSave,
    name,
    open,
    saveDisabled: !name.trim(),
    setName,
    setOpen,
  };
}
