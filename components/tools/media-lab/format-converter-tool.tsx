'use client';

import { useCallback, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useFFmpeg, useDownload } from '@/hooks';
import { getMediaDuration, formatDuration } from '@/lib/media';
import { formatBytes } from '@/lib/utils';
import { EmptyState } from '@/components/shared/empty-state';
import { FileDropzone } from '@/components/shared/file-dropzone';
import { ShareButton } from '@/components/shared/share-button';
import { FormatSelector } from '@/components/shared/format-selector';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { MEDIA_FORMATS } from '@/lib/constants/media-formats';

type MediaType = 'video' | 'audio';

const VIDEO_FORMATS = Object.keys(MEDIA_FORMATS.video).map((k) => ({
  id: k,
  label: k.toUpperCase(),
}));
const AUDIO_FORMATS = Object.keys(MEDIA_FORMATS.audio).map((k) => ({
  id: k,
  label: k.toUpperCase(),
}));

const ACCEPT = {
  'video/*': ['.mp4', '.webm', '.mkv', '.avi', '.mov'],
  'audio/*': ['.mp3', '.wav', '.aac', '.flac', '.m4a', '.ogg'],
};

export function FormatConverterTool() {
  const { run, status, progress } = useFFmpeg();
  const { download } = useDownload();

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

  const formats = mediaType === 'audio' ? AUDIO_FORMATS : VIDEO_FORMATS;

  return (
    <div className="space-y-6">
      {!file && (
        <EmptyState icon={RefreshCw} title="Convert media" description="Upload audio or video to convert between formats">
          <FileDropzone
            onFiles={handleFiles}
            accept={ACCEPT}
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
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Converting... {progress}%
              </p>
              <Progress value={progress} />
            </div>
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
