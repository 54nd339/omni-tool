'use client';

import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CHANGELOG } from '@/lib/constants/changelog';
import { useSettingsStore } from '@/stores/settings-store';

const LATEST_VERSION = CHANGELOG[0]?.version ?? '';

export function ChangelogModal() {
  const lastSeenVersion = useSettingsStore((s) => s.lastSeenVersion);
  const changelogModalOpen = useSettingsStore((s) => s.changelogModalOpen);
  const setLastSeenVersion = useSettingsStore((s) => s.setLastSeenVersion);
  const setChangelogModalOpen = useSettingsStore((s) => s.setChangelogModalOpen);
  const [dismissedVersion, setDismissedVersion] = useState<string | null>(null);

  const hasNewVersion = lastSeenVersion !== LATEST_VERSION;
  const isOpen =
    changelogModalOpen || (hasNewVersion && dismissedVersion !== LATEST_VERSION);

  useEffect(() => {
    if (hasNewVersion) {
      setChangelogModalOpen(true);
    }
  }, [hasNewVersion, setChangelogModalOpen]);

  const handleGotIt = () => {
    setLastSeenVersion(LATEST_VERSION);
    setChangelogModalOpen(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setChangelogModalOpen(false);
      if (hasNewVersion) setDismissedVersion(LATEST_VERSION);
    }
  };

  if (CHANGELOG.length === 0) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[85vh] flex flex-col">
        <div className="pr-8">
          <DialogTitle>What&apos;s New</DialogTitle>
        </div>
        <ScrollArea className="flex-1 -mx-2 px-2 min-h-0 max-h-[50vh]">
          <div className="flex flex-col gap-6 pr-4">
            {CHANGELOG.map((entry) => (
              <div key={entry.version}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold text-foreground">
                    v{entry.version}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {entry.date}
                  </span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  {entry.items.map((item, i) => (
                    <li key={`${entry.version}-${i}`}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="pt-4 flex justify-end">
          <Button onClick={handleGotIt}>Got it</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
