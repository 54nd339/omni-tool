'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Download, RefreshCcw } from 'lucide-react';
import { ToolLayout, ControlPanel, FileUpload, Button, CopyButton, ErrorAlert, RadioGroup } from '@/app/components/shared';
import { useClipboard, useFileUpload, useObjectUrl, useClearHandler } from '@/app/lib/hooks';
import { convertAndDownloadImage, downloadDataUrl, formatErrorMessage, validateImageFile } from '@/app/lib/utils';
import { UI_CONSTANTS, IMAGE_DEFAULTS, BACKGROUND_REMOVER_FORMATS } from '@/app/lib/constants';

type ResultState = 'idle' | 'processing' | 'done' | 'error';

export default function BackgroundRemoverPage() {
  const [file, setFile] = useState<File | null>(null);
  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);
  const [status, setStatus] = useState<ResultState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [downloadFormat, setDownloadFormat] = useState(IMAGE_DEFAULTS.BACKGROUND_REMOVER_FORMAT);
  const [showFormatDialog, setShowFormatDialog] = useState(false);
  const clipboard = useClipboard();

  const inputUrl = useObjectUrl(file);
  const outputUrl = useObjectUrl(outputBlob);

  const { handleFilesSelected, error: fileError, clearFiles } = useFileUpload({
    accept: 'image/*',
    validator: validateImageFile,
    onFileSelected: (selected) => {
      setFile(selected);
      setOutputBlob(null);
      setStatus('idle');
      setError(null);
      
      setTimeout(() => handleRemove(selected), UI_CONSTANTS.BACKGROUND_REMOVER.AUTO_START_DELAY);
    },
  });

  const { handleClear } = useClearHandler({
    clearFiles,
    onClear: () => {
      setFile(null);
      setOutputBlob(null);
      setStatus('idle');
      setError(null);
      clipboard.setCopied(false);
    },
  });

  const handleRemove = async (targetFile?: File) => {
    const fileToProcess = targetFile || file;
    if (!fileToProcess) return;
    setStatus('processing');
    setError(null);
    try {
      const { removeBackground } = await import('@imgly/background-removal');
      const resultBlob = (await removeBackground(fileToProcess, {
        progress: (key: string, current: number, total: number) => {
          const percentage = Math.round((current / total) * 100);
          console.log(`Downloading ${key}: ${percentage}%`);
        },
      })) as Blob;
      setOutputBlob(resultBlob);
      setStatus('done');
    } catch (err: any) {
      console.error(err);
      setError(formatErrorMessage(err, 'Failed to remove background'));
      setStatus('error');
    }
  };

  const handleDownload = async () => {
    if (!outputUrl || !file) return;
    
    if (downloadFormat === 'png') {
      // PNG supports transparency, use direct download
      downloadDataUrl(outputUrl, `bg-removed-${file.name.replace(/\.[^.]+$/, '')}.png`);
    } else {
      // Convert to JPEG or WebP
      await convertAndDownloadImage(outputUrl, `bg-removed-${file.name}`, downloadFormat);
    }
    
    setShowFormatDialog(false);
  };

  const handleCopy = async () => {
    if (!outputUrl) return;
    const res = await fetch(outputUrl);
    const blob = await res.blob();
    await clipboard.copyBlob(outputUrl, blob.type || 'image/png');
  };

  return (
    <ToolLayout path="/image/background-remover">
      {!file ? (
        <div className="max-w-xl mx-auto">
          <FileUpload label="Upload Image" accept="image/*" onFilesSelected={handleFilesSelected} />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <ControlPanel title="Original">
              {inputUrl && (
                <div className="relative w-full h-64 bg-slate-100 dark:bg-slate-800 rounded">
                  <Image src={inputUrl} alt="Original" fill className="object-contain rounded" sizes="100vw" />
                </div>
              )}
              {(error || fileError) && <ErrorAlert error={error || fileError} className="mt-2" />}
            </ControlPanel>

            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={handleClear} className="w-full flex items-center justify-center gap-2">
                <RefreshCcw className="w-4 h-4" />
                Clear Image
              </Button>
              <Button variant="outline" onClick={() => handleRemove()} disabled={!file || status === 'processing'} loading={status === 'processing'} className="w-full">
                Re-apply
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <ControlPanel title="Preview">
              {status === 'processing' ? (
                <div className="relative w-full h-64 bg-slate-100 dark:bg-slate-800 rounded overflow-hidden">
                  <div className="absolute inset-0 animate-pulse">
                    <div className="h-full w-full bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700"></div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-600 dark:text-slate-300">
                    Processing...
                  </div>
                </div>
              ) : outputUrl ? (
                <div className="relative w-full h-64 bg-slate-100 dark:bg-slate-800 rounded">
                  <Image src={outputUrl} alt="No background" fill className="object-contain rounded" sizes="100vw" />
                </div>
              ) : (
                <div className="relative w-full h-64 bg-slate-100 dark:bg-slate-800 rounded flex items-center justify-center text-sm text-slate-500 dark:text-slate-400">
                  Your processed image will appear here.
                </div>
              )}
            </ControlPanel>
            
            {status === 'done' && outputUrl && (
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={() => setShowFormatDialog(true)} className="w-full flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" />
                  Download
                </Button>
                <CopyButton
                  value={outputUrl}
                  onCopy={handleCopy}
                  copied={clipboard.copied}
                  disabled={!outputUrl}
                  className="w-full"
                />
              </div>
            )}
          </div>
        </div>
      )}
      
      {showFormatDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowFormatDialog(false)}>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">Select Download Format</h3>
            <div className="mb-4">
              <RadioGroup
                name="format"
                options={BACKGROUND_REMOVER_FORMATS}
                value={downloadFormat}
                onChange={(value) => setDownloadFormat(value as typeof downloadFormat)}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={() => setShowFormatDialog(false)} className="w-full">
                Cancel
              </Button>
              <Button onClick={handleDownload} className="w-full">
                Download
              </Button>
            </div>
          </div>
        </div>
      )}
    </ToolLayout>
  );
}
