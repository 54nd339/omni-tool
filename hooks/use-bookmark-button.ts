'use client';

import { useCallback, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

import { TOOLS } from '@/lib/constants/tools';
import { type ToolBookmark, useSettingsStore } from '@/stores/settings-store';

export function useBookmarkButton(toolId: string) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const saveBookmark = useSettingsStore((state) => state.saveBookmark);
  const deleteBookmark = useSettingsStore((state) => state.deleteBookmark);
  const bookmarks = useSettingsStore((state) => state.toolBookmarks);
  const [name, setName] = useState('');
  const [open, setOpen] = useState(false);

  const toolBookmarks = useMemo(
    () => bookmarks.filter((bookmark) => bookmark.toolId === toolId),
    [bookmarks, toolId],
  );
  const tool = useMemo(
    () => TOOLS.find((entry) => entry.id === toolId),
    [toolId],
  );

  const handleSave = useCallback(() => {
    if (!name.trim()) {
      toast.error('Enter a name');
      return;
    }

    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });

    saveBookmark(toolId, name.trim(), params);
    setName('');
    toast.success('Bookmark saved');
  }, [name, saveBookmark, searchParams, toolId]);

  const handleLoad = useCallback(
    (bookmark: ToolBookmark) => {
      const query = new URLSearchParams(bookmark.params).toString();
      router.push(`${pathname}${query ? `?${query}` : ''}`);
      toast.success(`Loaded "${bookmark.name}"`);
    },
    [pathname, router],
  );

  const handleDelete = useCallback(
    (bookmark: ToolBookmark) => {
      deleteBookmark(bookmark.id);
      toast.success('Bookmark deleted');
    },
    [deleteBookmark],
  );

  return {
    handleDelete,
    handleLoad,
    handleSave,
    name,
    open,
    saveDisabled: !name.trim(),
    savePlaceholder: `My ${tool?.name ?? 'tool'} preset`,
    setName,
    setOpen,
    toolBookmarks,
  };
}
