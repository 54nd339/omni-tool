'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { TOOL_CATEGORIES, TOOLS } from '@/lib/constants/tools';
import { getIcon } from '@/lib/icon-map';

export function Breadcrumbs() {
  const pathname = usePathname();

  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return null;

  const crumbs: { label: string; href: string; icon?: string }[] = [
    { label: 'Home', href: '/' },
  ];

  const category = TOOL_CATEGORIES.find((c) => c.path === `/${segments[0]}`);
  if (category) {
    crumbs.push({ label: category.name, href: category.path, icon: category.icon });
  }

  if (segments.length >= 2) {
    const tool = TOOLS.find((t) => t.path === pathname || t.path === `/${segments.join('/')}`);
    if (tool) {
      crumbs.push({ label: tool.name, href: tool.path, icon: tool.icon });
    }
  }

  if (crumbs.length <= 1) return null;

  return (
    <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1 text-xs text-muted-foreground">
      {crumbs.map((crumb, i) => {
        const CrumbIcon = crumb.icon ? getIcon(crumb.icon) : null;
        return (
          <span key={crumb.href} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="h-3 w-3" />}
            {i < crumbs.length - 1 ? (
              <Link href={crumb.href} className="flex items-center gap-1 hover:text-foreground transition-colors">
                {CrumbIcon && <CrumbIcon className="h-3 w-3" />}
                {crumb.label}
              </Link>
            ) : (
              <span className="flex items-center gap-1 text-foreground font-medium">
                {CrumbIcon && <CrumbIcon className="h-3 w-3" />}
                {crumb.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
