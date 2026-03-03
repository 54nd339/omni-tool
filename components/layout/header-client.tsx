'use client';

import Link from 'next/link';
import { useTheme } from 'next-themes';
import {
  Download,
  Menu,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Sparkles,
  Sun,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useInstallPrompt } from '@/hooks/use-install-prompt';
import { useSettingsStore, useSidebarOpen } from '@/stores/settings-store';

import { ClipboardManager } from './clipboard-manager';
import { LogoIcon } from './logo';

export function HeaderClient() {
  const sidebarOpen = useSidebarOpen();
  const toggleSidebar = useSettingsStore((state) => state.toggleSidebar);
  const { resolvedTheme, setTheme } = useTheme();
  const { canInstall, install } = useInstallPrompt();

  const setSidebarOpen = useSettingsStore((state) => state.setSidebarOpen);
  const setCommandPaletteOpen = useSettingsStore(
    (state) => state.setCommandPaletteOpen,
  );
  const toggleAiPanel = useSettingsStore((state) => state.toggleAiPanel);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border bg-background/80 px-4 backdrop-blur-sm">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="h-4 w-4" />
      </Button>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="hidden md:inline-flex"
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {sidebarOpen ? (
              <PanelLeftClose className="h-4 w-4" />
            ) : (
              <PanelLeftOpen className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>Toggle sidebar (⌘B)</TooltipContent>
      </Tooltip>

      <Link
        href="/"
        className="flex items-center text-foreground transition-opacity hover:opacity-80"
        aria-label="Go to homepage"
      >
        <LogoIcon className="h-5 w-5" />
      </Link>

      <button
        onClick={() => setCommandPaletteOpen(true)}
        aria-label="Search tools"
        className="ml-2 flex h-8 w-full max-w-xs items-center gap-2 rounded-md border border-border bg-muted/50 px-3 text-xs text-muted-foreground transition-colors hover:bg-muted"
      >
        <Search className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Search tools...</span>
        <span className="sm:hidden">Search...</span>
        <kbd className="ml-auto hidden rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] sm:inline-block">
          ⌘K
        </kbd>
      </button>

      <div className="ml-auto flex items-center gap-1">
        <div className="hidden md:contents">
          <ClipboardManager />
        </div>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:inline-flex"
              onClick={toggleAiPanel}
              aria-label="AI Assistant"
            >
              <Sparkles className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>AI Assistant (⌘⇧A)</TooltipContent>
        </Tooltip>

        {canInstall && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="hidden md:inline-flex"
                onClick={install}
              >
                <Download className="h-4 w-4" />
                <span className="sr-only">Install app</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Install OmniTool</TooltipContent>
          </Tooltip>
        )}

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Toggle theme (⌘⇧D)</TooltipContent>
        </Tooltip>
      </div>
    </header>
  );
}
