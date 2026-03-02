'use client';

import { memo, useCallback } from 'react';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getIcon } from '@/lib/icon-map';
import { useSettingsStore } from '@/stores/settings-store';

interface ToolCardProps {
  name: string;
  description: string;
  href: string;
  icon?: string;
  toolId?: string;
  className?: string;
}

export const ToolCard = memo(function ToolCard({ name, description, href, icon, toolId, className }: ToolCardProps) {
  const Icon = icon ? getIcon(icon) : undefined;
  const favoriteTools = useSettingsStore((s) => s.favoriteTools);
  const toggleFavorite = useSettingsStore((s) => s.toggleFavorite);
  const isFavorite = toolId ? favoriteTools.includes(toolId) : false;

  const handleToggleFavorite = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (toolId) toggleFavorite(toolId);
    },
    [toolId, toggleFavorite],
  );

  return (
    <Link
      href={href}
      prefetch={true}
      className={cn(
        'group relative flex flex-col gap-2 rounded-lg border border-border p-5',
        'transition-all duration-200 ease-out',
        'hover:scale-[1.02] hover:border-foreground/20 hover:bg-muted/50 hover:shadow-md',
        className,
      )}
    >
      <div className="flex items-start justify-between">
        {Icon && (
          <Icon className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-foreground" />
        )}
        {toolId && (
          <button
            onClick={handleToggleFavorite}
            className="rounded-sm p-0.5 text-muted-foreground/40 transition-colors hover:text-yellow-500"
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Star
              className={cn('h-3.5 w-3.5', isFavorite && 'fill-yellow-500 text-yellow-500')}
            />
          </button>
        )}
      </div>
      <span className="text-sm font-medium tracking-tight group-hover:text-foreground">
        {name}
      </span>
      <span className="text-xs leading-relaxed text-muted-foreground">
        {description}
      </span>
    </Link>
  );
});
