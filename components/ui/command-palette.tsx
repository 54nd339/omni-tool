'use client';

import { Command } from 'cmdk';
import { useRouter } from 'next/navigation';
import { useCallback, useDeferredValue, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { TOOLS, TOOL_CATEGORIES } from '@/lib/constants/tools';
import { BUILT_IN_SNIPPETS } from '@/lib/constants/snippets';
import type { ToolDefinition } from '@/types';
import { useSettingsStore } from '@/stores/settings-store';
import { type ToolBookmark } from '@/stores/settings-store';
import { useHistoryStore } from '@/stores/history-store';
import { useTheme } from 'next-themes';
import { getIcon } from '@/lib/icon-map';

function HighlightMatch({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <span className="bg-accent text-accent-foreground rounded-sm px-0.5">
        {text.slice(idx, idx + query.length)}
      </span>
      {text.slice(idx + query.length)}
    </>
  );
}

export function CommandPalette() {
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

  useEffect(() => {
    if (open) {
      setSearch('');
      inputRef.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [open, setOpen]);

  const navigate = useCallback(
    (path: string, toolId: string) => {
      addRecentTool(toolId);
      router.push(path);
      setOpen(false);
    },
    [addRecentTool, router, setOpen],
  );

  const favoriteTools = useSettingsStore((s) => s.favoriteTools);
  const toolBookmarks = useSettingsStore((s) => s.toolBookmarks);
  const toolSnippets = useSettingsStore((s) => s.toolSnippets);
  const allSnippets = [...BUILT_IN_SNIPPETS, ...toolSnippets];

  const favoriteToolDefs = favoriteTools
    .map((id) => TOOLS.find((t) => t.id === id))
    .filter((t): t is ToolDefinition => t !== undefined);

  const recentToolDefs = recentTools
    .map((id) => TOOLS.find((t) => t.id === id))
    .filter((t): t is ToolDefinition => t !== undefined);

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
            onClick={() => setOpen(false)}
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

                <Command.Group heading="Actions" className="pb-1 text-xs text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5">
                  <Command.Item
                    value="open settings preferences"
                    onSelect={() => { router.push('/settings'); setOpen(false); }}
                    className="flex cursor-default items-center justify-between rounded-md px-2 py-2 text-sm aria-selected:bg-muted"
                  >
                    <span>Open Settings</span>
                  </Command.Item>
                  <Command.Item
                    value="toggle theme dark light"
                    onSelect={() => { setTheme(resolvedTheme === 'dark' ? 'light' : 'dark'); setOpen(false); }}
                    className="flex cursor-default items-center justify-between rounded-md px-2 py-2 text-sm aria-selected:bg-muted"
                  >
                    <span>Toggle theme</span>
                    <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">⌘⇧D</kbd>
                  </Command.Item>
                  <Command.Item
                    value="toggle sidebar"
                    onSelect={() => { toggleSidebar(); setOpen(false); }}
                    className="flex cursor-default items-center justify-between rounded-md px-2 py-2 text-sm aria-selected:bg-muted"
                  >
                    <span>Toggle sidebar</span>
                    <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">⌘B</kbd>
                  </Command.Item>
                  {canUndo && (
                    <Command.Item
                      value="undo"
                      onSelect={() => { undo(); setOpen(false); }}
                      className="flex cursor-default items-center justify-between rounded-md px-2 py-2 text-sm aria-selected:bg-muted"
                    >
                      <span>Undo</span>
                      <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">⌘Z</kbd>
                    </Command.Item>
                  )}
                  {canRedo && (
                    <Command.Item
                      value="redo"
                      onSelect={() => { redo(); setOpen(false); }}
                      className="flex cursor-default items-center justify-between rounded-md px-2 py-2 text-sm aria-selected:bg-muted"
                    >
                      <span>Redo</span>
                      <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">⌘⇧Z</kbd>
                    </Command.Item>
                  )}
                </Command.Group>

                {favoriteToolDefs.length > 0 && (
                  <Command.Group heading="Favorites" className="pb-1 text-xs text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5">
                    {favoriteToolDefs.map((tool) => {
                      const FavIcon = getIcon(tool.icon);
                      return (
                        <Command.Item
                          key={`fav-${tool.id}`}
                          value={`favorite ${tool.name}`}
                          onSelect={() => navigate(tool.path, tool.id)}
                          className="flex cursor-default items-center gap-3 rounded-md px-2 py-2 text-sm aria-selected:bg-muted"
                        >
                          {FavIcon && <FavIcon className="h-4 w-4 shrink-0 text-muted-foreground" />}
                          <span>{tool.name}</span>
                        </Command.Item>
                      );
                    })}
                  </Command.Group>
                )}

                {recentToolDefs.length > 0 && (
                  <Command.Group heading="Recent" className="pb-1 text-xs text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5">
                    {recentToolDefs.map((tool) => {
                      const RecentIcon = getIcon(tool.icon);
                      return (
                        <Command.Item
                          key={`recent-${tool.id}`}
                          value={`recent ${tool.name}`}
                          onSelect={() => navigate(tool.path, tool.id)}
                          className="flex cursor-default items-center gap-3 rounded-md px-2 py-2 text-sm aria-selected:bg-muted"
                        >
                          {RecentIcon && <RecentIcon className="h-4 w-4 shrink-0 text-muted-foreground" />}
                          <span>{tool.name}</span>
                        </Command.Item>
                      );
                    })}
                  </Command.Group>
                )}

                {toolBookmarks.length > 0 && (
                  <Command.Group heading="Bookmarks" className="pb-1 text-xs text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5">
                    {toolBookmarks.map((bm) => {
                      const tool = TOOLS.find((t) => t.id === bm.toolId);
                      if (!tool) return null;
                      const qs = new URLSearchParams(bm.params).toString();
                      const href = `${tool.path}${qs ? `?${qs}` : ''}`;
                      return (
                        <Command.Item
                          key={`bm-${bm.id}`}
                          value={`bookmark ${bm.name} ${tool.name}`}
                          onSelect={() => { router.push(href); setOpen(false); }}
                          className="flex cursor-default items-center gap-3 rounded-md px-2 py-2 text-sm aria-selected:bg-muted"
                        >
                          <span className="text-muted-foreground">{bm.name}</span>
                          <span className="ml-auto text-[10px] text-muted-foreground/60">{tool.name}</span>
                        </Command.Item>
                      );
                    })}
                  </Command.Group>
                )}

                {allSnippets.length > 0 && (
                  <Command.Group heading="Snippets" className="pb-1 text-xs text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5">
                    {allSnippets.map((snippet) => {
                      const tool = TOOLS.find((t) => t.id === snippet.toolId);
                      if (!tool) return null;
                      const qs = new URLSearchParams(snippet.params).toString();
                      const href = `${tool.path}${qs ? `?${qs}` : ''}`;
                      return (
                        <Command.Item
                          key={`snippet-${snippet.id}`}
                          value={`snippet ${snippet.name} ${tool.name}`}
                          onSelect={() => { router.push(href); setOpen(false); }}
                          className="flex cursor-default items-center gap-3 rounded-md px-2 py-2 text-sm aria-selected:bg-muted"
                        >
                          <span className="text-muted-foreground">{snippet.name}</span>
                          <span className="ml-auto text-[10px] text-muted-foreground/60">{tool.name}</span>
                        </Command.Item>
                      );
                    })}
                  </Command.Group>
                )}

                {TOOL_CATEGORIES.map((cat) => {
                  const categoryTools = TOOLS.filter((t) => t.category === cat.id);
                  return (
                    <Command.Group
                      key={cat.id}
                      heading={`${cat.name} (${categoryTools.length})`}
                      className="pb-1 text-xs text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5"
                    >
                      {categoryTools.map((tool) => {
                        const ToolIcon = getIcon(tool.icon);
                        return (
                          <Command.Item
                            key={tool.id}
                            value={`${tool.name} ${tool.keywords.join(' ')}`}
                            onSelect={() => navigate(tool.path, tool.id)}
                            className="flex cursor-default items-center gap-3 rounded-md px-2 py-2 text-sm aria-selected:bg-muted"
                          >
                            {ToolIcon && <ToolIcon className="h-4 w-4 shrink-0 text-muted-foreground" />}
                            <div>
                              <div className="font-medium">
                                <HighlightMatch text={tool.name} query={deferredSearch} />
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {tool.description}
                              </div>
                            </div>
                          </Command.Item>
                        );
                      })}
                    </Command.Group>
                  );
                })}
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
