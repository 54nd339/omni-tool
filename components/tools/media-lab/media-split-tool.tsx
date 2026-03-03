'use client';

import { memo } from 'react';
import { Plus, Scissors, Trash2 } from 'lucide-react';

import { EmptyState } from '@/components/shared/empty-state';
import { FileDropzone } from '@/components/shared/file-dropzone';
import { ProcessingProgress } from '@/components/shared/processing-progress';
import { ShareButton } from '@/components/shared/tool-actions/share-button';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMediaSplit } from '@/hooks/use-media-split';
import type { SplitPoint } from '@/lib/media/ops';
import { MEDIA_AUDIO_VIDEO_ACCEPT } from '@/lib/media/utils';
import { formatBytes, pluralize } from '@/lib/utils';

const SplitRow = memo(function SplitRow({
  sp,
  canRemove,
  onUpdate,
  onRemove,
}: {
  sp: SplitPoint;
  canRemove: boolean;
  onUpdate: (id: string, field: 'start' | 'end', value: string) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Input
        value={sp.start}
        onChange={(e) => onUpdate(sp.id, 'start', e.target.value)}
        placeholder="Start"
        className="w-28"
      />
      <span className="text-xs text-muted-foreground">to</span>
      <Input
        value={sp.end}
        onChange={(e) => onUpdate(sp.id, 'end', e.target.value)}
        placeholder="End"
        className="w-28"
      />
      {canRemove && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemove(sp.id)}
          aria-label="Remove split point"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
});

export function MediaSplitTool() {
  const { addSplit, duration, file, handleFiles, handleReset, handleSplit, progress, removeSplit, resultBlob, splits, status, updateSplit } = useMediaSplit();

  return (
    <div className="space-y-6">
      {!file && (
        <EmptyState icon={Scissors} title="Split media" description="Upload audio or video to split at specific points">
          <FileDropzone
            onFiles={handleFiles}
            accept={MEDIA_AUDIO_VIDEO_ACCEPT}
            label="Drop a media file to split"
            hint="Define time ranges to extract"
          />
        </EmptyState>
      )}

      {file && (
        <>
          <div className="rounded-md border border-border p-4">
            <p className="text-sm font-medium">{file.name}</p>
            <p className="text-xs text-muted-foreground">
              {formatBytes(file.size)}
              {duration && <> &middot; {duration}</>}
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground">
              Split points (mm:ss or h:mm:ss)
            </p>
            {splits.map((sp) => (
              <SplitRow
                key={sp.id}
                sp={sp}
                canRemove={splits.length > 1}
                onUpdate={updateSplit}
                onRemove={removeSplit}
              />
            ))}
            <Button variant="outline" size="sm" onClick={addSplit}>
              <Plus className="mr-1 h-3 w-3" /> Add segment
            </Button>
          </div>

          {status === 'processing' && (
            <ProcessingProgress label="Splitting..." progress={progress} />
          )}

          <div className="flex gap-3">
            <Button
              onClick={handleSplit}
              disabled={status === 'processing' || splits.length === 0}
              loading={status === 'processing'}
            >
              Split ({splits.length} {pluralize(splits.length, 'segment')})
            </Button>
            <ShareButton blob={resultBlob?.blob || null} fileName={`${file.name.replace(/\.[^.]+$/, '')}-split.${resultBlob?.ext || 'mp4'}`} />
            <Button variant="ghost" onClick={handleReset}>
              New file
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
