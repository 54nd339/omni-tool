'use client';

import dynamic from 'next/dynamic';
import type { ReactNode } from 'react';

import { HeaderClient } from '@/components/layout/header-client';
import { SidebarClient } from '@/components/layout/sidebar/client';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useSmartPaste } from '@/hooks/use-clipboard-paste';
import { cn } from '@/lib/utils';
import { useSidebarOpen } from '@/stores/settings-store';

const CommandPalette = dynamic(
  () => import('@/components/ui/command-palette').then((m) => m.CommandPalette),
  { ssr: false },
);

const ChangelogModal = dynamic(
  () => import('@/components/layout/changelog-modal').then((m) => m.ChangelogModal),
  { ssr: false },
);

const ShortcutsPanel = dynamic(
  () => import('@/components/layout/shortcuts-panel').then((m) => m.ShortcutsPanel),
  { ssr: false },
);

const AiAssistant = dynamic(
  () =>
    import('@/components/layout/ai-assistant/ai-assistant').then(
      (m) => m.AiAssistant,
    ),
  { ssr: false },
);

const OfflineIndicator = dynamic(
  () =>
    import('@/components/layout/offline-indicator').then((m) => m.OfflineIndicator),
  { ssr: false },
);

export function ShellClient({ children }: { children: ReactNode }) {
  const sidebarOpen = useSidebarOpen();
  useSmartPaste();

  return (
    <TooltipProvider delayDuration={300}>
      <SidebarClient />
      <div
        className={cn(
          'flex min-h-dvh flex-col transition-[margin-left] duration-200',
          sidebarOpen ? 'md:ml-56' : 'md:ml-14',
        )}
      >
        <HeaderClient />
        <main id="main-content" className="flex-1 px-6 py-6">
          <OfflineIndicator />
          {children}
        </main>
      </div>
      <CommandPalette />
      <ChangelogModal />
      <ShortcutsPanel />
      <AiAssistant />
      <div id="live-region" aria-live="polite" aria-atomic="true" className="sr-only" />
    </TooltipProvider>
  );
}
