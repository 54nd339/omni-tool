'use client';

import { useMemo, useRef } from 'react';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';

import { useInstallPrompt } from '@/hooks/use-install-prompt';
import { CHANGELOG } from '@/lib/constants/changelog';
import { TOOLS } from '@/lib/constants/tools';
import {
  clearAllAppData,
  downloadJson,
  readFileText,
  reloadPage,
} from '@/lib/utils';
import { useSettingsStore } from '@/stores/settings-store';

const CURRENT_VERSION = CHANGELOG[0]?.version ?? '3.0.0';

export function useSettings() {
  const { theme, setTheme } = useTheme();
  const { isInstalled, canInstall, install } = useInstallPrompt();
  const exportSettings = useSettingsStore((state) => state.exportSettings);
  const importSettings = useSettingsStore((state) => state.importSettings);
  const favoriteTools = useSettingsStore((state) => state.favoriteTools);
  const toolBookmarks = useSettingsStore((state) => state.toolBookmarks);
  const toolSnippets = useSettingsStore((state) => state.toolSnippets);
  const toolUsageCounts = useSettingsStore((state) => state.toolUsageCounts);
  const lastSeenVersion = useSettingsStore((state) => state.lastSeenVersion);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const topTools = useMemo(() => {
    const entries = Object.entries(toolUsageCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    return entries.map(([id, count]) => ({
      name: TOOLS.find((tool) => tool.id === id)?.name ?? id,
      count,
    }));
  }, [toolUsageCounts]);

  const displayVersion = lastSeenVersion || CURRENT_VERSION;

  const handleExport = () => {
    try {
      downloadJson(exportSettings(), 'omnitool-settings.json');
      toast.success('Settings exported');
    } catch {
      toast.error('Export failed');
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const json = await readFileText(file, 'File read failed');
      if (importSettings(json)) {
        toast.success('Settings imported');
      } else {
        toast.error('Invalid settings file');
      }
    } catch {
      toast.error('Import failed');
    } finally {
      event.target.value = '';
    }
  };

  const handleClearAllData = () => {
    try {
      clearAllAppData();
      toast.success('All data cleared');
      reloadPage();
    } catch {
      toast.error('Failed to clear data');
    }
  };

  return {
    canInstall,
    displayVersion,
    favoriteTools,
    fileInputRef,
    handleClearAllData,
    handleExport,
    handleImport,
    install,
    isInstalled,
    theme,
    toolBookmarks,
    toolSnippets,
    topTools,
    setTheme,
  };
}
