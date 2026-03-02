'use client';

import type { ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { useSidebarOpen } from '@/stores/settings-store';
import { useSmartPaste } from '@/hooks';
import { cn } from '@/lib/utils';

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

const OnboardingTour = dynamic(
  () => import('@/components/layout/onboarding-tour').then((m) => m.OnboardingTour),
  { ssr: false },
);

const AiAssistant = dynamic(
  () => import('@/components/layout/ai-assistant').then((m) => m.AiAssistant),
  { ssr: false },
);

const OfflineIndicator = dynamic(
  () =>
    import('@/components/layout/offline-indicator').then((m) => m.OfflineIndicator),
  { ssr: false },
);

export function Shell({ children }: { children: ReactNode }) {
  const sidebarOpen = useSidebarOpen();
  useSmartPaste();

  return (
    <TooltipProvider delayDuration={300}>
      <Sidebar />
      <div
        className={cn(
          'flex min-h-dvh flex-col transition-[margin-left] duration-200',
          sidebarOpen ? 'md:ml-56' : 'md:ml-14',
        )}
      >
        <Header />
        <main id="main-content" className="flex-1 px-6 py-6">
          <OfflineIndicator />
          {children}
        </main>
      </div>
      <CommandPalette />
      <ChangelogModal />
      <ShortcutsPanel />
      <OnboardingTour />
      <AiAssistant />
      <div id="live-region" aria-live="polite" aria-atomic="true" className="sr-only" />
    </TooltipProvider>
  );
}
