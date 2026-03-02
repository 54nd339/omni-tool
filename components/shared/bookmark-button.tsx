'use client';

import { useCallback, useState } from 'react';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { Bookmark, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useSettingsStore } from '@/stores/settings-store';
import { type ToolBookmark } from '@/stores/settings-store';
import { TOOLS } from '@/lib/constants/tools';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';

interface BookmarkButtonProps {
  toolId: string;
}

export function BookmarkButton({ toolId }: BookmarkButtonProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const saveBookmark = useSettingsStore((s) => s.saveBookmark);
  const deleteBookmark = useSettingsStore((s) => s.deleteBookmark);
  const bookmarks = useSettingsStore((s) => s.toolBookmarks);
  const [name, setName] = useState('');
  const [open, setOpen] = useState(false);

  const toolBookmarks = bookmarks.filter((b) => b.toolId === toolId);
  const tool = TOOLS.find((t) => t.id === toolId);

  const handleSave = useCallback(() => {
    if (!name.trim()) {
      toast.error('Enter a name');
      return;
    }
    const params: Record<string, string> = {};
    searchParams.forEach((v, k) => {
      params[k] = v;
    });
    saveBookmark(toolId, name.trim(), params);
    setName('');
    toast.success('Bookmark saved');
  }, [name, searchParams, saveBookmark, toolId]);

  const handleLoad = useCallback(
    (bookmark: ToolBookmark) => {
      const qs = new URLSearchParams(bookmark.params).toString();
      router.push(`${pathname}${qs ? `?${qs}` : ''}`);
      setOpen(false);
      toast.success(`Loaded "${bookmark.name}"`);
    },
    [pathname, router],
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Bookmarks">
          <Bookmark className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 p-3">
        <p className="mb-2 text-xs font-medium text-muted-foreground">
          Bookmark current state
        </p>
        <div className="flex gap-2">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={`My ${tool?.name ?? 'tool'} preset`}
            className="h-8 text-xs"
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            aria-label={`Bookmark name for ${tool?.name ?? 'tool'}`}
          />
          <Button size="sm" onClick={handleSave} className="h-8 shrink-0">
            Save
          </Button>
        </div>

        {toolBookmarks.length > 0 && (
          <div className="mt-3 space-y-1 border-t border-border pt-3">
            <p className="mb-1 text-xs font-medium text-muted-foreground">
              Saved bookmarks
            </p>
            {toolBookmarks.map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between rounded-md px-2 py-1 text-xs hover:bg-muted"
              >
                <button
                  className="flex-1 text-left truncate"
                  onClick={() => handleLoad(b)}
                >
                  {b.name}
                </button>
                <button
                  onClick={() => {
                    deleteBookmark(b.id);
                    toast.success('Bookmark deleted');
                  }}
                  className="ml-2 shrink-0 text-muted-foreground hover:text-destructive"
                  aria-label={`Delete ${b.name}`}
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
