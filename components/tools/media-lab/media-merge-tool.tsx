'use client';

import { Combine } from 'lucide-react';

import { DndSortableList } from '@/components/shared/dnd-sortable-list';
import { EmptyState } from '@/components/shared/empty-state';
import { FileDropzone } from '@/components/shared/file-dropzone';
import { FilePreview } from '@/components/shared/file-preview';
import { ProcessingProgress } from '@/components/shared/processing-progress';
import { ShareButton } from '@/components/shared/tool-actions/share-button';
import { Button } from '@/components/ui/button';
import { useMediaMerge } from '@/hooks/use-media-merge';
import { MEDIA_AUDIO_VIDEO_ACCEPT } from '@/lib/media/utils';
import { pluralize } from '@/lib/utils';

export function MediaMergeTool() {
  const { files, handleClear, handleFiles, handleMerge, handleRemove, handleReorder, progress, resultBlob, status } = useMediaMerge();

  return (
    <div className="space-y-6">
      {files.length === 0 ? (
        <EmptyState icon={Combine} title="Merge media" description="Upload audio or video files to concatenate">
          <FileDropzone
            onFiles={handleFiles}
            accept={MEDIA_AUDIO_VIDEO_ACCEPT}
            multiple
            label="Drop media files to merge"
            hint="Same format recommended. Drag to reorder."
          />
        </EmptyState>
      ) : (
        <>
          <FileDropzone
            onFiles={handleFiles}
            accept={MEDIA_AUDIO_VIDEO_ACCEPT}
            multiple
            label="Drop media files to merge"
            hint="Same format recommended. Drag to reorder."
          />
          <DndSortableList
            items={files}
            onReorder={handleReorder}
            renderItem={(f) => (
              <FilePreview
                name={f.duration ? `${f.name} (${f.duration})` : f.name}
                size={f.size}
                onRemove={() => handleRemove(f.id)}
              />
            )}
          />

          {status === 'processing' && (
            <ProcessingProgress label="Merging..." progress={progress} />
          )}

          <div className="flex gap-3">
            <Button
              onClick={handleMerge}
              disabled={status === 'processing' || files.length < 2}
              loading={status === 'processing'}
            >
              Merge {files.length} {pluralize(files.length, 'file')}
            </Button>
            <ShareButton blob={resultBlob?.blob || null} fileName={`merged.${resultBlob?.ext || 'mp4'}`} />
            <Button variant="ghost" onClick={handleClear}>
              Clear all
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
