'use client';

import { Undo2, Redo2, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageEditorActionsProps {
  processing: boolean;
  canUndo: boolean;
  canRedo: boolean;
  hasResult: boolean;
  onProcess: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onDownload: () => void;
  onShare?: () => void;
  onReset: () => void;
}

export function ImageEditorActions({
  processing,
  canUndo,
  canRedo,
  hasResult,
  onProcess,
  onUndo,
  onRedo,
  onDownload,
  onShare,
  onReset,
}: ImageEditorActionsProps) {
  return (
    <div className="flex flex-col gap-3 pt-2">
      <div className="flex gap-2">
        <Button onClick={onProcess} disabled={processing} loading={processing} className="flex-1">
          Process
        </Button>
        <Button variant="ghost" onClick={onReset} className="flex-1">
          New image
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={onUndo} disabled={!canUndo} aria-label="Undo" title="Undo">
          <Undo2 className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={onRedo} disabled={!canRedo} aria-label="Redo" title="Redo">
          <Redo2 className="h-4 w-4" />
        </Button>

        {hasResult ? (
          <>
            <Button variant="outline" onClick={onDownload} className="flex-1">
              Download
            </Button>
            {onShare && (
              <Button variant="outline" size="icon" onClick={onShare} aria-label="Share" title="Share">
                <Share2 className="h-4 w-4" />
              </Button>
            )}
          </>
        ) : (
          <div className="flex-1" />
        )}
      </div>
    </div>
  );
}
