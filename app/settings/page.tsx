'use client';

import { useMemo, useRef } from 'react';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';
import { Monitor, Moon, RotateCcw, Sun } from 'lucide-react';
import { useSettingsStore } from '@/stores/settings-store';
import { TOOLS } from '@/lib/constants/tools';
import { useInstallPrompt } from '@/hooks';
import { CHANGELOG } from '@/lib/constants/changelog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

const CURRENT_VERSION = CHANGELOG[0]?.version ?? '3.0.0';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { isInstalled, canInstall, install } = useInstallPrompt();
  const exportSettings = useSettingsStore((s) => s.exportSettings);
  const importSettings = useSettingsStore((s) => s.importSettings);
  const favoriteTools = useSettingsStore((s) => s.favoriteTools);
  const toolBookmarks = useSettingsStore((s) => s.toolBookmarks);
  const toolSnippets = useSettingsStore((s) => s.toolSnippets);
  const toolUsageCounts = useSettingsStore((s) => s.toolUsageCounts);
  const lastSeenVersion = useSettingsStore((s) => s.lastSeenVersion);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const topTools = useMemo(() => {
    const entries = Object.entries(toolUsageCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
    return entries.map(([id, count]) => ({
      name: TOOLS.find((t) => t.id === id)?.name ?? id,
      count,
    }));
  }, [toolUsageCounts]);

  const displayVersion = lastSeenVersion || CURRENT_VERSION;

  const handleExport = () => {
    try {
      const json = exportSettings();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'omnitool-settings.json';
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Settings exported');
    } catch {
      toast.error('Export failed');
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const json = reader.result as string;
        if (importSettings(json)) {
          toast.success('Settings imported');
        } else {
          toast.error('Invalid settings file');
        }
      } catch {
        toast.error('Import failed');
      }
      e.target.value = '';
    };
    reader.readAsText(file);
  };

  const handleClearAllData = () => {
    try {
      localStorage.clear();
      toast.success('All data cleared');
      window.location.reload();
    } catch {
      toast.error('Failed to clear data');
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8 pb-12">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your OmniTool preferences, theme, and data.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Choose how OmniTool looks</CardDescription>
        </CardHeader>
        <CardContent>
          <ToggleGroup
            type="single"
            value={theme ?? 'system'}
            onValueChange={(v) => v && setTheme(v)}
            className="flex-wrap"
          >
            <ToggleGroupItem value="light" aria-label="Light theme">
              <Sun className="mr-2 h-4 w-4" />
              Light
            </ToggleGroupItem>
            <ToggleGroupItem value="dark" aria-label="Dark theme">
              <Moon className="mr-2 h-4 w-4" />
              Dark
            </ToggleGroupItem>
            <ToggleGroupItem value="system" aria-label="System theme">
              <Monitor className="mr-2 h-4 w-4" />
              System
            </ToggleGroupItem>
          </ToggleGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data & Storage</CardTitle>
          <CardDescription>Export, import, or clear your settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={handleExport}>
              Export Settings
            </Button>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              Import Settings
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              className="sr-only"
              onChange={handleImport}
              aria-label="Import settings file"
            />
            <ClearDataDialog onConfirm={handleClearAllData} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Statistics</CardTitle>
          <CardDescription>Your usage summary</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <dl className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-md bg-muted/50 px-3 py-2">
              <dt className="text-xs font-medium text-muted-foreground">
                Favorite tools
              </dt>
              <dd className="mt-0.5 text-lg font-semibold">
                {favoriteTools.length}
              </dd>
            </div>
            <div className="rounded-md bg-muted/50 px-3 py-2">
              <dt className="text-xs font-medium text-muted-foreground">
                Bookmarks saved
              </dt>
              <dd className="mt-0.5 text-lg font-semibold">
                {toolBookmarks.length}
              </dd>
            </div>
            <div className="rounded-md bg-muted/50 px-3 py-2">
              <dt className="text-xs font-medium text-muted-foreground">
                Custom snippets
              </dt>
              <dd className="mt-0.5 text-lg font-semibold">
                {toolSnippets.length}
              </dd>
            </div>
          </dl>
          {topTools.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">Most used tools</p>
              <ul className="space-y-1">
                {topTools.map((t) => (
                  <li key={t.name} className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-1.5 text-sm">
                    <span>{t.name}</span>
                    <span className="text-xs text-muted-foreground">{t.count} uses</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Onboarding</CardTitle>
          <CardDescription>Get familiar with OmniTool features</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            onClick={() => {
              localStorage.removeItem('onboarding-complete');
              toast.success('Tour will restart on next page load');
            }}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Restart Onboarding Tour
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>PWA</CardTitle>
          <CardDescription>Progressive Web App installation</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          {isInstalled ? (
            <span className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-sm font-medium">
              Installed
            </span>
          ) : canInstall ? (
            <Button variant="outline" onClick={install}>
              Install OmniTool
            </Button>
          ) : (
            <p className="text-sm text-muted-foreground">
              Use Install from your browser menu, or install was already declined.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>About</CardTitle>
          <CardDescription>OmniTool — Offline Toolbox</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium">App name</span>
            <span className="text-muted-foreground">OmniTool</span>
          </div>
          <Separator />
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium">Version</span>
            <span className="text-muted-foreground">{displayVersion}</span>
          </div>
          <Separator />
          <div>
            <span className="text-sm text-muted-foreground">
              Offline-first PWA toolbox for developers
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ClearDataDialog({ onConfirm }: { onConfirm: () => void }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="border-destructive/50 text-destructive hover:bg-destructive/10"
        >
          Clear All Data
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Clear All Data?</DialogTitle>
        <DialogDescription>
          This will remove all settings, favorites, bookmarks, and snippets from
          this device. The page will reload. This cannot be undone.
        </DialogDescription>
        <div className="flex justify-end gap-2 pt-4">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button variant="destructive" onClick={onConfirm}>
            Clear All
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
