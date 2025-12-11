'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import { AlertCircle, Eraser, Download, Copy, Check, Image as ImageIcon, RefreshCcw } from 'lucide-react';
import { ToolLayout } from '@/app/components/shared/ToolLayout';
import { ControlPanel } from '@/app/components/shared/ControlPanel';
import { FileUpload } from '@/app/components/shared/FileUpload';
import { Button } from '@/app/components/shared/Button';

type ResultState = 'idle' | 'processing' | 'done' | 'error';

export default function BackgroundRemovalPage() {
  const [file, setFile] = useState<File | null>(null);
  const [inputUrl, setInputUrl] = useState<string | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<ResultState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState<'png' | 'webp' | 'jpeg'>('png');
  const [showFormatDialog, setShowFormatDialog] = useState(false);

  const canProcess = useMemo(() => Boolean(file) && status !== 'processing', [file, status]);

  const handleFilesSelected = async (files: File[]) => {
    const selected = files[0];
    if (!selected?.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    setFile(selected);
    const url = URL.createObjectURL(selected);
    setInputUrl(url);
    setOutputUrl(null);
    setProgress(0);
    setStatus('idle');
    setError(null);
    
    // Auto-start background removal
    setTimeout(() => handleRemove(selected), 100);
  };

  const handleClear = () => {
    setFile(null);
    setInputUrl(null);
    setOutputUrl(null);
    setProgress(0);
    setStatus('idle');
    setError(null);
    setCopied(false);
  };

  const handleRemove = async (targetFile?: File) => {
    const fileToProcess = targetFile || file;
    if (!fileToProcess) return;
    setStatus('processing');
    setProgress(5);
    setError(null);
    try {
      const { removeBackground } = await import('@imgly/background-removal');
      const resultBlob = (await removeBackground(fileToProcess, {
        progress: (...args: any[]) => {
          const val = typeof args[0] === 'number' ? args[0] : 0;
          setProgress(Math.round(val * 100));
        },
      })) as Blob;
      const url = URL.createObjectURL(resultBlob);
      setOutputUrl(url);
      setStatus('done');
      setProgress(100);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to remove background');
      setStatus('error');
    }
  };

  const handleDownload = async () => {
    if (!outputUrl || !file) return;
    
    // Convert to selected format
    const res = await fetch(outputUrl);
    const blob = await res.blob();
    
    let finalBlob = blob;
    if (downloadFormat !== 'png') {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = document.createElement('img');
      
      await new Promise<void>((resolve) => {
        img.onload = () => {
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          ctx?.drawImage(img, 0, 0);
          canvas.toBlob((convertedBlob) => {
            if (convertedBlob) finalBlob = convertedBlob;
            resolve();
          }, downloadFormat === 'jpeg' ? 'image/jpeg' : 'image/webp', 0.9);
        };
        img.src = outputUrl;
      });
    }
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(finalBlob);
    link.download = `bg-removed-${file.name.replace(/\.[^.]+$/, '')}.${downloadFormat}`;
    link.click();
    setShowFormatDialog(false);
  };

  const handleCopy = async () => {
    if (!outputUrl) return;
    const res = await fetch(outputUrl);
    const blob = await res.blob();
    await navigator.clipboard.write([new ClipboardItem({ [blob.type || 'image/png']: blob })]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolLayout icon={Eraser} title="Background Removal" description="Remove image backgrounds locally with WebAssembly">
      {!file ? (
        <div className="max-w-xl mx-auto">
          <FileUpload label="Upload Image" accept="image/*" onFilesSelected={handleFilesSelected} />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={handleClear} className="w-full flex items-center justify-center gap-2">
                <RefreshCcw className="w-4 h-4" />
                Clear Image
              </Button>
              <Button variant="outline" onClick={() => handleRemove()} disabled={!canProcess} loading={status === 'processing'} className="w-full">
                Re-apply
              </Button>
            </div>

            <ControlPanel title="Original">
              <div className="relative w-full h-64 bg-slate-100 dark:bg-slate-800 rounded">
                <Image src={inputUrl!} alt="Original" fill className="object-contain rounded" sizes="100vw" />
              </div>
              {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
            </ControlPanel>

            {status === 'done' && outputUrl && (
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={() => setShowFormatDialog(true)} className="w-full flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" />
                  Download
                </Button>
                <Button variant="outline" onClick={handleCopy} className="w-full flex items-center justify-center gap-2">
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <ControlPanel title="Preview">
              {status === 'processing' ? (
                <div className="relative w-full h-64 bg-slate-100 dark:bg-slate-800 rounded overflow-hidden">
                  <div className="absolute inset-0 animate-pulse">
                    <div className="h-full w-full bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700"></div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-600 dark:text-slate-300">
                    Processing... {progress}%
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
          </div>
        </div>
      )}
      
      {showFormatDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowFormatDialog(false)}>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">Select Download Format</h3>
            <div className="space-y-2 mb-4">
              {(['png', 'webp', 'jpeg'] as const).map((fmt) => (
                <label key={fmt} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700">
                  <input
                    type="radio"
                    name="format"
                    value={fmt}
                    checked={downloadFormat === fmt}
                    onChange={(e) => setDownloadFormat(e.target.value as typeof fmt)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium uppercase">{fmt}</span>
                  {fmt === 'png' && <span className="text-xs text-slate-500">(supports transparency)</span>}
                </label>
              ))}
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
