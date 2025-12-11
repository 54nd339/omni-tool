'use client';

import NextImage from 'next/image';
import { Download } from 'lucide-react';
import { useAspectRatioContext } from './AspectRatioContext';
import { ControlPanel, Button, CopyButton } from '@/app/components/shared';
import { useClipboard } from '@/app/lib/hooks';
import {
  downloadDataUrl,
  generateDownloadFilename,
  getFileExtensionFromMime,
} from '@/app/lib/utils';

export function AspectRatioOutputPanel() {
  const { state } = useAspectRatioContext();
  const clipboard = useClipboard();

  const handleDownload = () => {
    if (!state.processed || !state.image) return;
    const ext = getFileExtensionFromMime(state.processed.mime);
    const filename = generateDownloadFilename(state.image.file.name, state.ratioId, ext);
    downloadDataUrl(state.processed.outputUrl, filename);
  };

  const handleCopy = async () => {
    if (!state.processed) return;
    await clipboard.copyBlob(state.processed.outputUrl, state.processed.mime);
  };

  return (
    <ControlPanel title="Padded Output">
      <div className="relative w-full h-72 bg-slate-100 dark:bg-slate-800 rounded flex items-center justify-center overflow-hidden">
        {state.processed ? (
          <NextImage
            src={state.processed.outputUrl}
            alt="Padded preview"
            fill
            className="object-contain"
            sizes="100vw"
          />
        ) : (
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Adjust settings to generate preview.
          </div>
        )}
      </div>
      {state.error && (
        <p className="text-sm text-red-500 mt-2">{state.error}</p>
      )}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Button
          onClick={handleDownload}
          disabled={!state.processed || state.processing}
          className="w-full flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" />
          Download
        </Button>
        <CopyButton
          value={state.processed?.outputUrl || ''}
          onCopy={handleCopy}
          copied={clipboard.copied}
          disabled={!state.processed || state.processing}
          className="w-full"
        />
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
        The entire image is preserved; padding is added to reach the selected
        aspect ratio.
      </p>
    </ControlPanel>
  );
}

