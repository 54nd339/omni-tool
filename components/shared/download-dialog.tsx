'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { DownloadOption } from '@/types/common';

interface GenericDownloadDialogProps<TOption extends DownloadOption> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  options: readonly TOption[];
  onDownload: (option: TOption) => void;
  title?: string;
}

export function DownloadDialog<TOption extends DownloadOption>({
  open,
  onOpenChange,
  options,
  onDownload,
  title = 'Choose format',
}: GenericDownloadDialogProps<TOption>) {
  const [selected, setSelected] = useState<string>(options[0]?.id ?? '');

  const handleDownload = () => {
    const opt = options.find((o) => o.id === selected);
    if (opt) {
      onDownload(opt);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>
          Select the output format before downloading.
        </DialogDescription>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setSelected(opt.id)}
              aria-label={`Download as ${opt.label}`}
              className={cn(
                'rounded-md border px-3 py-2 text-left text-sm transition-colors',
                selected === opt.id
                  ? 'border-foreground bg-muted font-medium'
                  : 'border-border hover:bg-muted/50',
              )}
            >
              <div className="font-mono text-xs uppercase">{opt.extension}</div>
              <div className="mt-0.5 text-xs text-muted-foreground">
                {opt.label}
              </div>
            </button>
          ))}
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleDownload}>Download</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
