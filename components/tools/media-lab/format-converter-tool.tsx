'use client';

import { useCallback, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

import { EmptyState } from '@/components/shared/empty-state';
import { FileDropzone } from '@/components/shared/file-dropzone';
import { FormatSelector } from '@/components/shared/format-selector';
import { ProcessingProgress } from '@/components/shared/processing-progress';
import { ShareButton } from '@/components/shared/tool-actions/share-button';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useFFmpeg } from '@/hooks/use-ffmpeg';
import {
  AUDIO_FORMAT_OPTIONS,
  type MediaType,
  VIDEO_FORMAT_OPTIONS,
} from '@/lib/media/ops';
import { formatDuration, getMediaDuration,MEDIA_AUDIO_VIDEO_ACCEPT_WITH_OGG } from '@/lib/media/utils';
import { downloadBlob, formatBytes } from '@/lib/utils';

export function FormatConverterTool() {
  const { run, status, progress } = useFFmpeg();
  const download = downloadBlob;

  const [file, setFile] = useState<File | null>(null);
  const [mediaType, setMediaType] = useState<MediaType>('video');
  const [outputFormat, setOutputFormat] = useState('mp4');
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [duration, setDuration] = useState<string | null>(null);

  const handleFiles = useCallback((files: File[]) => {
    const f = files[0];
    if (!f) return;
    setFile(f);
    setDuration(null);

    const isAudio = f.type.startsWith('audio/');
    const type: MediaType = isAudio ? 'audio' : 'video';
    setMediaType(type);
    setOutputFormat(type === 'audio' ? 'mp3' : 'mp4');

    getMediaDuration(f)
      .then((d) => setDuration(formatDuration(d)))
      .catch(() => setDuration(null));
  }, []);

  const handleConvert = useCallback(async () => {
    if (!file) return;

    try {
      const blob = await run((api) =>
        api.convertMedia(file, { outputFormat, mediaType }),
      );
      setResultBlob(blob);
      const name = file.name.replace(/\.[^.]+$/, '');
      download(blob, `${name}.${outputFormat}`);
      toast.success(`Converted to ${outputFormat.toUpperCase()}`);
    } catch {
      toast.error('Conversion failed');
    }
  }, [file, outputFormat, mediaType, run, download]);

  const formats = mediaType === 'audio' ? AUDIO_FORMAT_OPTIONS : VIDEO_FORMAT_OPTIONS;

  return (
    <div className="space-y-6">
      {!file && (
        <EmptyState icon={RefreshCw} title="Convert media" description="Upload audio or video to convert between formats">
          <FileDropzone
            onFiles={handleFiles}
            accept={MEDIA_AUDIO_VIDEO_ACCEPT_WITH_OGG}
            label="Drop a video or audio file"
            hint="Auto-detects media type"
          />
        </EmptyState>
      )}

      {file && (
        <>
          <div className="rounded-md border border-border p-4">
            <p className="text-sm font-medium">{file.name}</p>
            <p className="text-xs text-muted-foreground">
              {formatBytes(file.size)} &middot;{' '}
              {mediaType === 'audio' ? 'Audio' : 'Video'}
              {duration && <> &middot; {duration}</>}
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                Media type
              </p>
              <ToggleGroup
                type="single"
                value={mediaType}
                onValueChange={(v) => {
                  if (!v) return;
                  const t = v as MediaType;
                  setMediaType(t);
                  setOutputFormat(t === 'audio' ? 'mp3' : 'mp4');
                }}
              >
                <ToggleGroupItem value="video">Video</ToggleGroupItem>
                <ToggleGroupItem value="audio">Audio</ToggleGroupItem>
              </ToggleGroup>
            </div>

            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                Output format
              </p>
              <FormatSelector
                value={outputFormat}
                onChange={setOutputFormat}
                formats={formats}
              />
            </div>
          </div>

          {status === 'processing' && (
            <ProcessingProgress label="Converting..." progress={progress} />
          )}

          <div className="flex gap-3">
            <Button
              onClick={handleConvert}
              disabled={status === 'processing'}
              loading={status === 'processing'}
            >
              Convert
            </Button>
            <ShareButton blob={resultBlob} fileName={`converted.${outputFormat}`} />
            <Button variant="ghost" onClick={() => setFile(null)}>
              New file
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
