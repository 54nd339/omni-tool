'use client';

import { memo } from 'react';
import Link from 'next/link';
import { Settings } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { CHANGELOG } from '@/lib/constants/changelog';
import { cn } from '@/lib/utils';
import { useSettingsStore } from '@/stores/settings-store';

export const SidebarFooter = memo(function SidebarFooter({
  open,
}: {
  open: boolean;
}) {
  const setChangelogModalOpen = useSettingsStore((s) => s.setChangelogModalOpen);
  const lastSeenVersion = useSettingsStore((s) => s.lastSeenVersion);
  const latestVersion = CHANGELOG[0]?.version ?? '';
  const hasNewVersion = lastSeenVersion !== latestVersion;

  return (
    <div className="mt-auto shrink-0 border-t border-border p-2">
      <div className="flex flex-col gap-1">
        {hasNewVersion && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2"
                onClick={() => setChangelogModalOpen(true)}
              >
                <span className="relative inline-flex">
                  <span className="size-2 rounded-full bg-primary" />
                </span>
                {open && <span>What&apos;s New</span>}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">What&apos;s New</TooltipContent>
          </Tooltip>
        )}
        <div className="flex gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/settings"
                className={cn(
                  'inline-flex h-9 min-h-[44px] flex-1 items-center justify-center gap-2 rounded-md transition-colors hover:bg-muted sm:min-h-0',
                  'font-medium',
                )}
                aria-label="Settings"
              >
                <Settings className="h-4 w-4" />
                {open && <span>Settings</span>}
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Settings</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  );
});