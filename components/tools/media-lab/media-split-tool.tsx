'use client';

import { memo, useCallback, useState } from 'react';
import { toast } from 'sonner';
import { Plus, Scissors, Trash2 } from 'lucide-react';
import { useFFmpeg, useDownload } from '@/hooks';
import { parseTime, isValidTimeFormat, getMediaDuration, formatDuration } from '@/lib/media';
import { formatBytes, pluralize } from '@/lib/utils';
import { EmptyState } from '@/components/shared/empty-state';
import { FileDropzone } from '@/components/shared/file-dropzone';
import { FormatSelector } from '@/components/shared/format-selector';
import { ShareButton } from '@/components/shared/share-button';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';

const ACCEPT = {
  'video/*': ['.mp4', '.webm', '.mkv', '.avi', '.mov'],
  'audio/*': ['.mp3', '.wav', '.aac', '.flac', '.m4a'],
};

interface SplitPoint {
  id: string;
  start: string;
  end: string;
}

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

let counter = 0;

export function MediaSplitTool() {
  const { run, status, progress } = useFFmpeg();
  const { download } = useDownload();

  const [file, setFile] = useState<File | null>(null);
  const [resultBlob, setResultBlob] = useState<{ blob: Blob; ext: string } | null>(null);
  const [duration, setDuration] = useState<string | null>(null);
  const [rawDuration, setRawDuration] = useState<number | null>(null);
  const [splits, setSplits] = useState<SplitPoint[]>([
    { id: 'sp-0', start: '0:00', end: '0:30' },
  ]);

  const handleFiles = useCallback((files: File[]) => {
    const f = files[0];
    if (!f) return;
    setFile(f);
    setFile(f);
    setDuration(null);

    getMediaDuration(f)
      .then((d) => {
        setRawDuration(d);
        setDuration(formatDuration(d));
      })
      .catch(() => {
        setRawDuration(null);
        setDuration(null);
      });
  }, []);

  const addSplit = useCallback(() => {
    counter += 1;
    setSplits((prev) => [
      ...prev,
      { id: `sp-${counter}`, start: '0:00', end: '0:30' },
    ]);
  }, []);

  const removeSplit = useCallback((id: string) => {
    setSplits((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const updateSplit = useCallback(
    (id: string, field: 'start' | 'end', value: string) => {
      setSplits((prev) =>
        prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
      );
    },
    [],
  );

  const handleSplit = useCallback(async () => {
    if (!file || splits.length === 0) return;

    const badFormat = splits.some(
      (s) => !isValidTimeFormat(s.start) || !isValidTimeFormat(s.end),
    );
    if (badFormat) {
      toast.error('Invalid time format. Use mm:ss or h:mm:ss');
      return;
    }

    const points = splits.map((s) => ({
      start: parseTime(s.start),
      end: parseTime(s.end),
    }));

    const invalid = points.some((p) => p.end <= p.start);
    if (invalid) {
      toast.error('End time must be after start time for each segment');
      return;
    }

    if (rawDuration !== null) {
      const outOfBounds = points.some((p) => p.end > rawDuration + 1); // 1s tolerance
      if (outOfBounds) {
        toast.error(`One or more split points exceed the media duration (${formatDuration(rawDuration)})`);
        return;
      }
    }

    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'mp4';
      const blobs = await run((api) =>
        api.splitMedia(file, points, ext),
      );

      const baseName = file.name.replace(/\.[^.]+$/, '');
      if (blobs.length === 1) {
        setResultBlob({ blob: blobs[0], ext });
        download(blobs[0], `${baseName}-clip.${ext}`);
      } else {
        const { default: JSZip } = await import('jszip');
        const zip = new JSZip();
        blobs.forEach((blob, i) => {
          zip.file(`${baseName}-part-${i + 1}.${ext}`, blob);
        });
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        setResultBlob({ blob: zipBlob, ext: 'zip' });
        download(zipBlob, `${baseName}-splits.zip`);
      }
      toast.success(`Split into ${blobs.length} ${pluralize(blobs.length, 'segment')}`);
    } catch {
      toast.error('Split failed');
    }
  }, [file, splits, run, download]);

  return (
    <div className="space-y-6">
      {!file && (
        <EmptyState icon={Scissors} title="Split media" description="Upload audio or video to split at specific points">
          <FileDropzone
            onFiles={handleFiles}
            accept={ACCEPT}
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
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Splitting... {progress}%
              </p>
              <Progress value={progress} />
            </div>
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
            <Button variant="ghost" onClick={() => setFile(null)}>
              New file
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
