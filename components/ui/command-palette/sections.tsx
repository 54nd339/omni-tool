'use client';

import { Command } from 'cmdk';

import type { ToolSnippet } from '@/lib/constants/snippets';
import { getToolById, TOOL_CATEGORIES, TOOLS } from '@/lib/constants/tools';
import { getIcon } from '@/lib/icon-map';
import type { ToolBookmark } from '@/stores/settings-store';
import type { ToolDefinition } from '@/types/tools';

import { HighlightMatch } from './highlight-match';

const GROUP_CLASS = 'pb-1 text-xs text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5';
const ITEM_CLASS = 'flex cursor-default items-center gap-3 rounded-md px-2 py-2 text-sm aria-selected:bg-muted';

interface ActionsSectionProps {
  canRedo: boolean;
  canUndo: boolean;
  closePalette: () => void;
  redo: () => void;
  resolvedTheme: string | undefined;
  routerPush: (path: string) => void;
  setTheme: (theme: string) => void;
  toggleSidebar: () => void;
  undo: () => void;
}

export function ActionsSection({
  canRedo,
  canUndo,
  closePalette,
  redo,
  resolvedTheme,
  routerPush,
  setTheme,
  toggleSidebar,
  undo,
}: ActionsSectionProps) {
  return (
    <Command.Group heading="Actions" className={GROUP_CLASS}>
      <Command.Item
        value="open settings preferences"
        onSelect={() => {
          routerPush('/settings');
          closePalette();
        }}
        className="flex cursor-default items-center justify-between rounded-md px-2 py-2 text-sm aria-selected:bg-muted"
      >
        <span>Open Settings</span>
      </Command.Item>
      <Command.Item
        value="toggle theme dark light"
        onSelect={() => {
          setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
          closePalette();
        }}
        className="flex cursor-default items-center justify-between rounded-md px-2 py-2 text-sm aria-selected:bg-muted"
      >
        <span>Toggle theme</span>
        <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">⌘⇧D</kbd>
      </Command.Item>
      <Command.Item
        value="toggle sidebar"
        onSelect={() => {
          toggleSidebar();
          closePalette();
        }}
        className="flex cursor-default items-center justify-between rounded-md px-2 py-2 text-sm aria-selected:bg-muted"
      >
        <span>Toggle sidebar</span>
        <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">⌘B</kbd>
      </Command.Item>
      {canUndo && (
        <Command.Item
          value="undo"
          onSelect={() => {
            undo();
            closePalette();
          }}
          className="flex cursor-default items-center justify-between rounded-md px-2 py-2 text-sm aria-selected:bg-muted"
        >
          <span>Undo</span>
          <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">⌘Z</kbd>
        </Command.Item>
      )}
      {canRedo && (
        <Command.Item
          value="redo"
          onSelect={() => {
            redo();
            closePalette();
          }}
          className="flex cursor-default items-center justify-between rounded-md px-2 py-2 text-sm aria-selected:bg-muted"
        >
          <span>Redo</span>
          <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">⌘⇧Z</kbd>
        </Command.Item>
      )}
    </Command.Group>
  );
}

interface ToolListSectionProps {
  heading: string;
  navigate: (path: string, toolId: string) => void;
  tools: ToolDefinition[];
  valuePrefix: string;
}

export function ToolListSection({
  heading,
  navigate,
  tools,
  valuePrefix,
}: ToolListSectionProps) {
  if (tools.length === 0) return null;

  return (
    <Command.Group heading={heading} className={GROUP_CLASS}>
      {tools.map((tool) => {
        const Icon = getIcon(tool.icon);
        return (
          <Command.Item
            key={`${valuePrefix}-${tool.id}`}
            value={`${valuePrefix} ${tool.name}`}
            onSelect={() => navigate(tool.path, tool.id)}
            className={ITEM_CLASS}
          >
            {Icon && <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />}
            <span>{tool.name}</span>
          </Command.Item>
        );
      })}
    </Command.Group>
  );
}

interface BookmarksSectionProps {
  bookmarks: ToolBookmark[];
  closePalette: () => void;
  routerPush: (path: string) => void;
}

export function BookmarksSection({
  bookmarks,
  closePalette,
  routerPush,
}: BookmarksSectionProps) {
  if (bookmarks.length === 0) return null;

  return (
    <Command.Group heading="Bookmarks" className={GROUP_CLASS}>
      {bookmarks.map((bookmark) => {
        const tool = getToolById(bookmark.toolId);
        if (!tool) return null;
        const queryString = new URLSearchParams(bookmark.params).toString();
        const href = `${tool.path}${queryString ? `?${queryString}` : ''}`;

        return (
          <Command.Item
            key={`bm-${bookmark.id}`}
            value={`bookmark ${bookmark.name} ${tool.name}`}
            onSelect={() => {
              routerPush(href);
              closePalette();
            }}
            className={ITEM_CLASS}
          >
            <span className="text-muted-foreground">{bookmark.name}</span>
            <span className="ml-auto text-[10px] text-muted-foreground/60">{tool.name}</span>
          </Command.Item>
        );
      })}
    </Command.Group>
  );
}

interface SnippetsSectionProps {
  closePalette: () => void;
  routerPush: (path: string) => void;
  snippets: ToolSnippet[];
}

export function SnippetsSection({
  closePalette,
  routerPush,
  snippets,
}: SnippetsSectionProps) {
  if (snippets.length === 0) return null;

  return (
    <Command.Group heading="Snippets" className={GROUP_CLASS}>
      {snippets.map((snippet) => {
        const tool = getToolById(snippet.toolId);
        if (!tool) return null;
        const queryString = new URLSearchParams(snippet.params).toString();
        const href = `${tool.path}${queryString ? `?${queryString}` : ''}`;

        return (
          <Command.Item
            key={`snippet-${snippet.id}`}
            value={`snippet ${snippet.name} ${tool.name}`}
            onSelect={() => {
              routerPush(href);
              closePalette();
            }}
            className={ITEM_CLASS}
          >
            <span className="text-muted-foreground">{snippet.name}</span>
            <span className="ml-auto text-[10px] text-muted-foreground/60">{tool.name}</span>
          </Command.Item>
        );
      })}
    </Command.Group>
  );
}

interface CategoriesSectionProps {
  navigate: (path: string, toolId: string) => void;
  query: string;
}

export function CategoriesSection({ navigate, query }: CategoriesSectionProps) {
  return (
    <>
      {TOOL_CATEGORIES.map((category) => {
        const categoryTools = TOOLS.filter((tool) => tool.category === category.id);

        return (
          <Command.Group
            key={category.id}
            heading={`${category.name} (${categoryTools.length})`}
            className={GROUP_CLASS}
          >
            {categoryTools.map((tool) => {
              const Icon = getIcon(tool.icon);
              return (
                <Command.Item
                  key={tool.id}
                  value={`${tool.name} ${tool.keywords.join(' ')}`}
                  onSelect={() => navigate(tool.path, tool.id)}
                  className={ITEM_CLASS}
                >
                  {Icon && <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />}
                  <div>
                    <div className="font-medium">
                      <HighlightMatch text={tool.name} query={query} />
                    </div>
                    <div className="text-xs text-muted-foreground">{tool.description}</div>
                  </div>
                </Command.Item>
              );
            })}
          </Command.Group>
        );
      })}
    </>
  );
}
