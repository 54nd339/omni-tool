'use client';

import { useCallback, useState } from 'react';
import { toast } from 'sonner';

import { useFFmpeg } from '@/hooks/use-ffmpeg';
import type { MediaEntry } from '@/lib/media/ops';
import { formatDuration, getMediaDuration } from '@/lib/media/utils';
import { downloadBlob, reorderByIds } from '@/lib/utils';

export function useMediaMerge() {
  const { run, status, progress } = useFFmpeg();

  const [files, setFiles] = useState<MediaEntry[]>([]);
  const [resultBlob, setResultBlob] = useState<{ blob: Blob; ext: string } | null>(null);

  const handleFiles = useCallback((incoming: File[]) => {
    const referenceType = files.length > 0 ? files[0].file.type : (incoming[0]?.type || '');
    const validIncoming = incoming.filter((file) => file.type === referenceType);

    if (validIncoming.length !== incoming.length) {
      toast.error('All merged files must be the exact same format');
    }

    if (validIncoming.length === 0) return;

    const entries: MediaEntry[] = validIncoming.map((file) => ({
      id: crypto.randomUUID(),
      file,
      name: file.name,
      size: file.size,
    }));

    setFiles((prev) => [...prev, ...entries]);

    entries.forEach((entry) => {
      getMediaDuration(entry.file)
        .then((duration) => {
          setFiles((prev) =>
            prev.map((item) =>
              item.id === entry.id ? { ...item, duration: formatDuration(duration) } : item,
            ),
          );
        })
        .catch((error) => {
          if (process.env.NODE_ENV === 'development') {
            console.warn('Failed to get media duration:', error);
          }
        });
    });
  }, [files]);

  const handleReorder = useCallback((ids: string[]) => {
    setFiles((prev) => reorderByIds(prev, ids, (item) => item.id));
  }, []);

  const handleRemove = useCallback((id: string) => {
    setFiles((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const handleMerge = useCallback(async () => {
    if (files.length < 2) {
      toast.error('Add at least 2 files');
      return;
    }

    try {
      const ext = files[0]?.name.split('.').pop()?.toLowerCase() || 'mp4';
      const inputs = files.map((file) => ({ file: file.file, name: file.name }));
      const blob = await run((api) => api.mergeMedia(inputs, ext));
      setResultBlob({ blob, ext });
      downloadBlob(blob, `merged.${ext}`);
      toast.success('Media merged');
    } catch {
      toast.error('Merge failed');
    }
  }, [files, run]);

  const handleClear = useCallback(() => {
    setFiles([]);
    setResultBlob(null);
  }, []);

  return {
    files,
    handleClear,
    handleFiles,
    handleMerge,
    handleRemove,
    handleReorder,
    progress,
    resultBlob,
    status,
  };
}
