'use client';

import { useRouter } from 'next/navigation';
import { useHotkeys } from 'react-hotkeys-hook';
import { useTheme } from 'next-themes';
import { useSettingsStore } from '@/stores/settings-store';
import { useHistoryStore } from '@/stores/history-store';
import { KONAMI_SEQUENCE } from '@/lib/constants/shortcuts';

export function useGlobalShortcuts() {
  const router = useRouter();
  const toggleSidebar = useSettingsStore((s) => s.toggleSidebar);
  const toggleCommandPalette = useSettingsStore((s) => s.toggleCommandPalette);
  const toggleShortcutsPanel = useSettingsStore((s) => s.toggleShortcutsPanel);
  const toggleAiPanel = useSettingsStore((s) => s.toggleAiPanel);
  const { setTheme, resolvedTheme } = useTheme();
  const undo = useHistoryStore((s) => s.undo);
  const redo = useHistoryStore((s) => s.redo);

  useHotkeys('mod+k', (e) => {
    e.preventDefault();
    toggleCommandPalette();
  });

  useHotkeys('mod+b', (e) => {
    e.preventDefault();
    toggleSidebar();
  });

  useHotkeys('mod+shift+d', (e) => {
    e.preventDefault();
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  });

  useHotkeys('mod+shift+a', (e) => {
    e.preventDefault();
    toggleAiPanel();
  });

  useHotkeys('mod+z', (e) => {
    e.preventDefault();
    undo();
  });

  useHotkeys('mod+shift+z', (e) => {
    e.preventDefault();
    redo();
  });

  useHotkeys('alt+left, mod+[', (e) => {
    e.preventDefault();
    router.back();
  });

  useHotkeys('shift+/', (e) => {
    const tag = (e.target as HTMLElement)?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement)?.isContentEditable) return;
    e.preventDefault();
    toggleShortcutsPanel();
  });

  useHotkeys(KONAMI_SEQUENCE, () => {
    document.documentElement.classList.add('konami');
    setTimeout(() => document.documentElement.classList.remove('konami'), 3000);
  });
}
