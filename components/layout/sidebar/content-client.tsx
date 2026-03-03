'use client';

import { memo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

import { LogoIcon } from '../logo';
import { SidebarBookmarks } from './bookmarks';
import { SidebarCategoryTree } from './category-tree';
import { SidebarFavorites } from './favorites';
import { SidebarFooter } from './footer';

export const SidebarContentClient = memo(function SidebarContentClient({
  open,
}: {
  open: boolean;
}) {
  const pathname = usePathname();

  return (
    <>
      <div className="flex h-14 shrink-0 items-center gap-2 px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-foreground">
            <LogoIcon className="h-5 w-5" />
          </div>
          {open && <span className="text-sm font-semibold tracking-tight">OmniTool</span>}
        </Link>
      </div>

      <Separator />

      <ScrollArea className="flex-1 py-2">
        <SidebarFavorites open={open} />
        <SidebarBookmarks open={open} />
        <SidebarCategoryTree open={open} pathname={pathname} />
      </ScrollArea>

      <SidebarFooter open={open} />
    </>
  );
});
