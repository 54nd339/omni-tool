'use client';

import { useCallback, useDeferredValue, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Command } from 'cmdk';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';

import { BUILT_IN_SNIPPETS } from '@/lib/constants/snippets';
import { TOOLS } from '@/lib/constants/tools';
import { useHistoryStore } from '@/stores/history-store';
import { useSettingsStore } from '@/stores/settings-store';

import {
  ActionsSection,
  BookmarksSection,
  CategoriesSection,
  SnippetsSection,
  ToolListSection,
} from './command-palette/sections';

export function CommandPalette() {
  const isDefined = <T,>(value: T | undefined): value is T => value !== undefined;
  const open = useSettingsStore((s) => s.commandPaletteOpen);
  const setOpen = useSettingsStore((s) => s.setCommandPaletteOpen);
  const router = useRouter();
  const addRecentTool = useSettingsStore((s) => s.addRecentTool);
  const recentTools = useSettingsStore((s) => s.recentTools);
  const toggleSidebar = useSettingsStore((s) => s.toggleSidebar);
  const undo = useHistoryStore((s) => s.undo);
  const redo = useHistoryStore((s) => s.redo);
  const canUndo = useHistoryStore((s) => s.canUndo);
  const canRedo = useHistoryStore((s) => s.canRedo);
  const { resolvedTheme, setTheme } = useTheme();
  const reduced = useReducedMotion();
  const inputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);

  const closePalette = useCallback(() => {
    setSearch('');
    setOpen(false);
  }, [setOpen]);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closePalette();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [closePalette, open]);

  const navigate = useCallback(
    (path: string, toolId: string) => {
      addRecentTool(toolId);
      router.push(path);
      closePalette();
    },
    [addRecentTool, closePalette, router],
  );

  const favoriteTools = useSettingsStore((s) => s.favoriteTools);
  const toolBookmarks = useSettingsStore((s) => s.toolBookmarks);
  const toolSnippets = useSettingsStore((s) => s.toolSnippets);
  const allSnippets = [...BUILT_IN_SNIPPETS, ...toolSnippets];

  const favoriteToolDefs = favoriteTools
    .map((id) => TOOLS.find((t) => t.id === id))
    .filter(isDefined);

  const recentToolDefs = recentTools
    .map((id) => TOOLS.find((t) => t.id === id))
    .filter(isDefined);

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]"
          role="dialog"
          aria-label="Command palette"
          aria-modal="true"
        >
          <motion.div
            initial={reduced ? undefined : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closePalette}
          />
          <motion.div
            initial={reduced ? undefined : { opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="relative z-10 w-full max-w-lg overflow-hidden rounded-lg border border-border bg-background shadow-2xl"
          >
            <Command label="Command palette" shouldFilter={!!deferredSearch} filter={(value, search) => {
              if (!search) return 1;
              const haystack = value.toLowerCase();
              const needle = search.toLowerCase();
              return haystack.includes(needle) ? 1 : 0;
            }}>
              <Command.Input
                ref={inputRef}
                value={search}
                onValueChange={setSearch}
                placeholder="Search tools..."
                className="w-full border-b border-border bg-transparent px-4 py-3 text-sm outline-none placeholder:text-muted-foreground"
                aria-label="Search tools"
              />
              <Command.List className="max-h-80 overflow-y-auto p-2">
                <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
                  No results found. Try fewer words.
                </Command.Empty>

                <ActionsSection
                  canRedo={canRedo}
                  canUndo={canUndo}
                  closePalette={closePalette}
                  redo={redo}
                  resolvedTheme={resolvedTheme}
                  routerPush={(path) => router.push(path)}
                  setTheme={setTheme}
                  toggleSidebar={toggleSidebar}
                  undo={undo}
                />

                <ToolListSection
                  heading="Favorites"
                  navigate={navigate}
                  tools={favoriteToolDefs}
                  valuePrefix="favorite"
                />

                <ToolListSection
                  heading="Recent"
                  navigate={navigate}
                  tools={recentToolDefs}
                  valuePrefix="recent"
                />

                <BookmarksSection
                  bookmarks={toolBookmarks}
                  closePalette={closePalette}
                  routerPush={(path) => router.push(path)}
                />

                <SnippetsSection
                  closePalette={closePalette}
                  routerPush={(path) => router.push(path)}
                  snippets={allSnippets}
                />

                <CategoriesSection navigate={navigate} query={deferredSearch} />
              </Command.List>
              <div className="flex items-center gap-3 border-t border-border px-4 py-2 text-xs text-muted-foreground">
                <span>
                  <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">↑↓</kbd>{' '}
                  navigate
                </span>
                <span>
                  <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">↵</kbd>{' '}
                  select
                </span>
                <span>
                  <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">esc</kbd>{' '}
                  close
                </span>
              </div>
            </Command>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
