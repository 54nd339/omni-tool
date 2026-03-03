'use client';

import { memo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { getIconOrFallback } from '@/lib/icon-map';
import { cn } from '@/lib/utils';
import { useFavoriteToolDefinitions } from '@/stores/settings-store';

export const SidebarFavorites = memo(function SidebarFavorites({
  open,
}: {
  open: boolean;
}) {
  const pathname = usePathname();
  const favoriteTools = useFavoriteToolDefinitions();

  if (favoriteTools.length === 0) return null;

  return (
    <div className="px-2 pb-1">
      {open && (
        <p className="mb-1 px-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Favorites
        </p>
      )}
      {favoriteTools.map((tool) => {
        const Icon = getIconOrFallback(tool.icon);
        const active = pathname === tool.path;

        return (
          <Tooltip key={tool.id}>
            <TooltipTrigger asChild>
              <Link
                href={tool.path}
                className={cn(
                  'flex items-center gap-3 rounded-md px-2 py-1.5 text-xs transition-colors',
                  active
                    ? 'bg-muted font-medium text-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                {open && <span className="truncate">{tool.name}</span>}
              </Link>
            </TooltipTrigger>
            {!open && <TooltipContent side="right">{tool.name}</TooltipContent>}
          </Tooltip>
        );
      })}
      <Separator className="mt-1" />
    </div>
  );
});