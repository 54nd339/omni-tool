'use client';

import { useCallback, useState } from 'react';
import { Combine } from 'lucide-react';
import { toast } from 'sonner';
import { reorderByIds, pluralize } from '@/lib/utils';
import { useFFmpeg, useDownload } from '@/hooks';
import { getMediaDuration, formatDuration } from '@/lib/media';
import { EmptyState } from '@/components/shared/empty-state';
import { FileDropzone } from '@/components/shared/file-dropzone';
import { DndSortableList } from '@/components/shared/dnd-sortable-list';
import { FilePreview } from '@/components/shared/file-preview';
import { FormatSelector } from '@/components/shared/format-selector';
import { ShareButton } from '@/components/shared/share-button';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

const ACCEPT = {
  'video/*': ['.mp4', '.webm', '.mkv', '.avi', '.mov'],
  'audio/*': ['.mp3', '.wav', '.aac', '.flac', '.m4a'],
};

interface MediaEntry {
  id: string;
  file: File;
  name: string;
  size: number;
  duration?: string;
}

let counter = 0;

export function MediaMergeTool() {
  const { run, status, progress } = useFFmpeg();
  const { download } = useDownload();

  const [files, setFiles] = useState<MediaEntry[]>([]);

  const [resultBlob, setResultBlob] = useState<{ blob: Blob; ext: string } | null>(null);

  const handleFiles = useCallback((incoming: File[]) => {
    const referenceType = files.length > 0 ? files[0].file.type : (incoming[0]?.type || '');
    const validIncoming = incoming.filter((f) => f.type === referenceType);

    if (validIncoming.length !== incoming.length) {
      toast.error('All merged files must be the exact same format');
    }

    if (validIncoming.length === 0) return;

    const entries: MediaEntry[] = validIncoming.map((f) => {
      counter += 1;
      return {
        id: `media-${counter}`,
        file: f,
        name: f.name,
        size: f.size,
      };
    });
    setFiles((prev) => [...prev, ...entries]);

    entries.forEach((entry) => {
      getMediaDuration(entry.file)
        .then((d) => {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === entry.id ? { ...f, duration: formatDuration(d) } : f,
            ),
          );
        })
        .catch((err) => {
          console.warn('Failed to get media duration:', err);
          return undefined;
        });
    });
  }, [files]);

  const handleReorder = useCallback(
    (ids: string[]) => {
      setFiles(reorderByIds(files, ids, (f) => f.id));
    },
    [files],
  );

  const handleRemove = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const handleMerge = useCallback(async () => {
    if (files.length < 2) {
      toast.error('Add at least 2 files');
      return;
    }

    try {
      const ext = files[0]?.name.split('.').pop()?.toLowerCase() || 'mp4';
      const inputs = files.map((f) => ({ file: f.file, name: f.name }));
      const blob = await run((api) => api.mergeMedia(inputs, ext));
      setResultBlob({ blob, ext });
      download(blob, `merged.${ext}`);
      toast.success('Media merged');
    } catch {
      toast.error('Merge failed');
    }
  }, [files, run, download]);

  return (
    <div className="space-y-6">
      {files.length === 0 ? (
        <EmptyState icon={Combine} title="Merge media" description="Upload audio or video files to concatenate">
          <FileDropzone
            onFiles={handleFiles}
            accept={ACCEPT}
            multiple
            label="Drop media files to merge"
            hint="Same format recommended. Drag to reorder."
          />
        </EmptyState>
      ) : (
        <>
          <FileDropzone
            onFiles={handleFiles}
            accept={ACCEPT}
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
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Merging... {progress}%
              </p>
              <Progress value={progress} />
            </div>
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
            <Button variant="ghost" onClick={() => setFiles([])}>
              Clear all
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
