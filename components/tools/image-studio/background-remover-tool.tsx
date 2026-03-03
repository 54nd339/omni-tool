'use client';

import { useCallback, useState } from 'react';
import { Eraser } from 'lucide-react';
import { toast } from 'sonner';

import { BeforeAfterSlider } from '@/components/shared/before-after-slider';
import { DownloadDialog } from '@/components/shared/download-dialog';
import { EmptyState } from '@/components/shared/empty-state';
import { FileDropzone } from '@/components/shared/file-dropzone';
import { ProcessingProgress } from '@/components/shared/processing-progress';
import { ShareButton } from '@/components/shared/tool-actions/share-button';
import { Button } from '@/components/ui/button';
import { useClipboardPaste } from '@/hooks/use-clipboard-paste';
import { useBgRemoval } from '@/hooks/worker-hooks';
import { BG_REMOVAL_DOWNLOAD_OPTIONS } from '@/lib/image/background-removal';
import { downloadBlob } from '@/lib/utils';

export function BackgroundRemoverTool() {
  const { removeBackground, status, progress, error } = useBgRemoval();
  const download = downloadBlob;

  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [showDownload, setShowDownload] = useState(false);
  const [fileName, setFileName] = useState('');

  const handleFiles = useCallback(
    async (files: File[]) => {
      const file = files[0];
      if (!file) return;

      setFileName(file.name.replace(/\.[^.]+$/, ''));
      setOriginalUrl(URL.createObjectURL(file));
      setResultUrl(null);
      setResultBlob(null);

      try {
        const blob = await removeBackground(file);
        const url = URL.createObjectURL(blob);
        setResultUrl(url);
        setResultBlob(blob);
        toast.success('Background removed');
      } catch {
        toast.error(error ?? 'Background removal failed');
      }
    },
    [removeBackground, error],
  );

  useClipboardPaste(handleFiles, !originalUrl);

  const handleDownload = useCallback(
    (option: (typeof BG_REMOVAL_DOWNLOAD_OPTIONS)[number]) => {
      if (!resultBlob) return;
      download(resultBlob, `${fileName}-no-bg.${option.extension}`);
    },
    [resultBlob, fileName, download],
  );

  const handleReset = useCallback(() => {
    setOriginalUrl(null);
    setResultUrl(null);
    setResultBlob(null);
    setFileName('');
  }, []);

  return (
    <div className="space-y-6">
      {!originalUrl && (
        <EmptyState icon={Eraser} title="Remove backgrounds" description="Upload an image to remove its background using AI" hint="Tip: ⌘V to paste an image from clipboard">
          <FileDropzone
            onFiles={handleFiles}
            accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] }}
            label="Drop an image to remove its background"
            hint="PNG, JPG, or WebP -- or paste from clipboard"
          />
        </EmptyState>
      )}

      {status === 'processing' && (
        <ProcessingProgress label="Removing background..." progress={progress} />
      )}

      {status === 'loading' && (
        <p className="text-sm text-muted-foreground">
          Loading AI model (first time may take a moment)...
        </p>
      )}

      {originalUrl && resultUrl && (
        <>
          <BeforeAfterSlider
            beforeSrc={originalUrl}
            afterSrc={resultUrl}
            beforeLabel="Original"
            afterLabel="Removed"
            className="max-h-[500px]"
          />

          <div className="flex gap-3">
            <Button onClick={() => setShowDownload(true)}>Download</Button>
            <ShareButton blob={resultBlob} fileName={`${fileName}-no-bg.png`} />
            <Button variant="outline" onClick={handleReset}>
              New image
            </Button>
          </div>

          <DownloadDialog
            open={showDownload}
            onOpenChange={setShowDownload}
            options={BG_REMOVAL_DOWNLOAD_OPTIONS}
            onDownload={handleDownload}
          />
        </>
      )}
    </div>
  );
}
