'use client';

import { useCallback, useState } from 'react';
import { toast } from 'sonner';

import { useFFmpeg } from '@/hooks/use-ffmpeg';
import { type SplitPoint } from '@/lib/media/ops';
import { formatDuration, getMediaDuration, isValidTimeFormat, parseTime } from '@/lib/media/utils';
import { downloadBlob, pluralize } from '@/lib/utils';

export function useMediaSplit() {
  const { run, status, progress } = useFFmpeg();

  const [file, setFile] = useState<File | null>(null);
  const [resultBlob, setResultBlob] = useState<{ blob: Blob; ext: string } | null>(null);
  const [duration, setDuration] = useState<string | null>(null);
  const [rawDuration, setRawDuration] = useState<number | null>(null);
  const [splits, setSplits] = useState<SplitPoint[]>([
    { id: crypto.randomUUID(), start: '0:00', end: '0:30' },
  ]);

  const handleFiles = useCallback((files: File[]) => {
    const selected = files[0];
    if (!selected) return;

    setFile(selected);
    setDuration(null);
    setResultBlob(null);
    setSplits([{ id: crypto.randomUUID(), start: '0:00', end: '0:30' }]);

    getMediaDuration(selected)
      .then((value) => {
        setRawDuration(value);
        setDuration(formatDuration(value));
      })
      .catch(() => {
        setRawDuration(null);
        setDuration(null);
      });
  }, []);

  const addSplit = useCallback(() => {
    setSplits((prev) => [...prev, { id: crypto.randomUUID(), start: '0:00', end: '0:30' }]);
  }, []);

  const removeSplit = useCallback((id: string) => {
    setSplits((prev) => prev.filter((split) => split.id !== id));
  }, []);

  const updateSplit = useCallback((id: string, field: 'start' | 'end', value: string) => {
    setSplits((prev) => prev.map((split) => (split.id === id ? { ...split, [field]: value } : split)));
  }, []);

  const handleSplit = useCallback(async () => {
    if (!file || splits.length === 0) return;

    const badFormat = splits.some((split) => !isValidTimeFormat(split.start) || !isValidTimeFormat(split.end));
    if (badFormat) {
      toast.error('Invalid time format. Use mm:ss or h:mm:ss');
      return;
    }

    const points = splits.map((split) => ({ start: parseTime(split.start), end: parseTime(split.end) }));

    if (points.some((point) => point.end <= point.start)) {
      toast.error('End time must be after start time for each segment');
      return;
    }

    if (rawDuration !== null && points.some((point) => point.end > rawDuration + 1)) {
      toast.error(`One or more split points exceed the media duration (${formatDuration(rawDuration)})`);
      return;
    }

    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'mp4';
      const blobs = await run((api) => api.splitMedia(file, points, ext));
      const baseName = file.name.replace(/\.[^.]+$/, '');

      if (blobs.length === 1) {
        setResultBlob({ blob: blobs[0], ext });
        downloadBlob(blobs[0], `${baseName}-clip.${ext}`);
      } else {
        const { default: JSZip } = await import('jszip');
        const zip = new JSZip();
        blobs.forEach((blob, index) => {
          zip.file(`${baseName}-part-${index + 1}.${ext}`, blob);
        });
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        setResultBlob({ blob: zipBlob, ext: 'zip' });
        downloadBlob(zipBlob, `${baseName}-splits.zip`);
      }

      toast.success(`Split into ${blobs.length} ${pluralize(blobs.length, 'segment')}`);
    } catch {
      toast.error('Split failed');
    }
  }, [file, rawDuration, run, splits]);

  const handleReset = useCallback(() => {
    setFile(null);
    setResultBlob(null);
    setDuration(null);
    setRawDuration(null);
    setSplits([{ id: crypto.randomUUID(), start: '0:00', end: '0:30' }]);
  }, []);

  return {
    addSplit,
    duration,
    file,
    handleFiles,
    handleReset,
    handleSplit,
    progress,
    removeSplit,
    resultBlob,
    splits,
    status,
    updateSplit,
  };
}
