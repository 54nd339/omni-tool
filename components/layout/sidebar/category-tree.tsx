'use client';

import { memo } from 'react';
import Link from 'next/link';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { TOOL_CATEGORIES, TOOLS } from '@/lib/constants/tools';
import { getIconOrFallback } from '@/lib/icon-map';
import { cn } from '@/lib/utils';

interface SidebarCategoryTreeProps {
  open: boolean;
  pathname: string;
}

export const SidebarCategoryTree = memo(function SidebarCategoryTree({
  open,
  pathname,
}: SidebarCategoryTreeProps) {
  return (
    <nav
      className="flex flex-col gap-0.5 px-2"
      role="tree"
      aria-label={open ? 'Tool categories' : 'Tool categories (collapsed)'}
      onKeyDown={(event) => {
        const target = event.target as HTMLElement;
        const items = Array.from(
          target.closest('nav')?.querySelectorAll<HTMLElement>('a') ?? [],
        );
        const idx = items.indexOf(target as HTMLElement);
        if (idx < 0) return;
        if (event.key === 'ArrowDown' && idx < items.length - 1) {
          event.preventDefault();
          items[idx + 1].focus();
        } else if (event.key === 'ArrowUp' && idx > 0) {
          event.preventDefault();
          items[idx - 1].focus();
        }
      }}
    >
      {TOOL_CATEGORIES.map((category) => {
        const Icon = getIconOrFallback(category.icon);
        const isActive = pathname.startsWith(category.path);
        const categoryTools = TOOLS.filter((tool) => tool.category === category.id);
        const expanded = open && isActive;

        return (
          <div key={category.id} role="treeitem" aria-expanded={expanded} aria-selected={isActive}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href={category.path}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'flex min-h-[44px] items-center gap-3 rounded-md px-2 py-2 transition-colors md:min-h-0 md:py-2',
                    'text-sm',
                    isActive
                      ? 'bg-muted font-medium text-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {open && <span className="truncate">{category.name}</span>}
                </Link>
              </TooltipTrigger>
              {!open && (
                <TooltipContent side="right">{category.name}</TooltipContent>
              )}
            </Tooltip>

            {expanded && (
              <div
                role="group"
                className="ml-5 flex flex-col gap-0.5 border-l border-border pl-3 pt-0.5"
              >
                {categoryTools.map((tool) => {
                  const active = pathname === tool.path;
                  return (
                    <Link
                      key={tool.id}
                      href={tool.path}
                      role="treeitem"
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'flex min-h-[44px] items-center rounded-md px-2 py-1.5 transition-colors md:min-h-0 md:py-1.5',
                        'text-xs',
                        active
                          ? 'bg-muted font-medium text-foreground'
                          : 'text-muted-foreground hover:text-foreground',
                      )}
                    >
                      {tool.name}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
});