'use client';

import { memo } from 'react';
import Link from 'next/link';
import { Bookmark } from 'lucide-react';

import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { getToolById } from '@/lib/constants/tools';
import { useSettingsStore } from '@/stores/settings-store';

export const SidebarBookmarks = memo(function SidebarBookmarks({
  open,
}: {
  open: boolean;
}) {
  const bookmarks = useSettingsStore((s) => s.toolBookmarks);

  if (bookmarks.length === 0 || !open) return null;

  return (
    <div className="px-2 pb-1">
      <p className="mb-1 px-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        Bookmarks
      </p>
      {bookmarks.slice(0, 5).map((bookmark) => {
        const tool = getToolById(bookmark.toolId);
        if (!tool) return null;

        const queryString = new URLSearchParams(bookmark.params).toString();
        const href = `${tool.path}${queryString ? `?${queryString}` : ''}`;

        return (
          <Tooltip key={bookmark.id}>
            <TooltipTrigger asChild>
              <Link
                href={href}
                className="flex items-center gap-3 rounded-md px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Bookmark className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{bookmark.name}</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">{`${bookmark.name} (${tool.name})`}</TooltipContent>
          </Tooltip>
        );
      })}
      <Separator className="mt-1" />
    </div>
  );
});