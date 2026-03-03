'use client';

import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { useSettingsStore } from '@/stores/settings-store';

const KEYBOARD_SHORTCUTS = [
  { keys: ['⌘', 'K'], action: 'Open command palette' },
  { keys: ['⌘', 'B'], action: 'Toggle sidebar' },
  { keys: ['⌘', '⇧', 'A'], action: 'Toggle AI Assistant' },
  { keys: ['⌘', '⇧', 'D'], action: 'Toggle dark / light theme' },
  { keys: ['⌘', 'Z'], action: 'Undo' },
  { keys: ['⌘', '⇧', 'Z'], action: 'Redo' },
  { keys: ['Alt', '←'], action: 'Go back' },
  { keys: ['?'], action: 'Show this panel' },
] as const;

export function ShortcutsPanel() {
  const open = useSettingsStore((s) => s.shortcutsPanelOpen);
  const setOpen = useSettingsStore((s) => s.setShortcutsPanelOpen);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-sm">
        <DialogTitle>Keyboard Shortcuts</DialogTitle>
        <DialogDescription className="sr-only">
          List of global keyboard shortcuts
        </DialogDescription>
        <div className="space-y-2 pt-2">
          {KEYBOARD_SHORTCUTS.map((s) => (
            <div
              key={s.action}
              className="flex items-center justify-between text-sm"
            >
              <span className="text-muted-foreground">{s.action}</span>
              <div className="flex gap-1">
                {s.keys.map((k) => (
                  <kbd
                    key={k}
                    className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-xs"
                  >
                    {k}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
