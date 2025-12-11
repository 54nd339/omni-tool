'use client';

import React, { useEffect, useMemo, useState } from 'react';
import NextImage from 'next/image';
import { Sparkles, Download, Image as ImageIcon, RefreshCcw, Archive } from 'lucide-react';
import JSZip from 'jszip';
import { ToolLayout } from '@/app/components/shared/ToolLayout';
import { ControlPanel } from '@/app/components/shared/ControlPanel';
import { FileUpload } from '@/app/components/shared/FileUpload';
import { Button } from '@/app/components/shared/Button';

type IconPreview = { size: number; dataUrl: string };
type Platform = 'favicon' | 'android-icon' | 'apple-icon' | 'ms-icon';

const PLATFORMS: Record<Platform, number[]> = {
  favicon: [16, 32, 48, 64, 72, 96, 128, 192, 256, 384, 512],
  'android-icon': [36, 48, 72, 96, 144, 192],
  'apple-icon': [57, 60, 72, 76, 114, 120, 144, 152, 167, 180],
  'ms-icon': [70, 144, 150, 310],
};

export default function IconsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previews, setPreviews] = useState<IconPreview[]>([]);
  const [loading, setLoading] = useState(false);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [platform, setPlatform] = useState<Platform>('favicon');

  const handleFilesSelected = async (files: File[]) => {
    const selected = files[0];
    if (!selected?.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    setFile(selected);
    setPreviews([]);
    const url = URL.createObjectURL(selected);
    setSourceUrl(url);
    
    // Auto-generate icons on upload - let useEffect handle it
  };

  const handleClear = () => {
    setFile(null);
    setPreviews([]);
    setLoading(false);
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    setSourceUrl(null);
  };

  useEffect(() => () => {
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
  }, [sourceUrl]);

  // Regenerate icons when platform changes
  useEffect(() => {
    if (file) {
      generateIcons();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [platform]);

  // Generate icons when file is uploaded
  useEffect(() => {
    if (file) {
      generateIcons();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file]);

  const generateIcons = async () => {
    if (!file) return;
    setLoading(true);
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.src = url;
    await img.decode();
    const results: IconPreview[] = [];
    const sizes = PLATFORMS[platform];
    for (const size of sizes) {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) continue;
      ctx.clearRect(0, 0, size, size);
      const scale = Math.min(size / img.width, size / img.height);
      const drawW = img.width * scale;
      const drawH = img.height * scale;
      const offsetX = (size - drawW) / 2;
      const offsetY = (size - drawH) / 2;
      ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
      results.push({ size, dataUrl: canvas.toDataURL('image/png', 1) });
    }
    setPreviews(results);
    setLoading(false);
  };

  const downloadIcon = (preview: IconPreview) => {
    const link = document.createElement('a');
    link.href = preview.dataUrl;
    link.download = `${platform}-${preview.size}x${preview.size}.png`;
    link.click();
  };

  const downloadAllAsZip = async () => {
    if (previews.length === 0) return;
    const zip = new JSZip();
    previews.forEach((p) => {
      const base64Data = p.dataUrl.split(',')[1];
      zip.file(`${platform}-${p.size}x${p.size}.png`, base64Data, { base64: true });
    });
    const blob = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${platform}-icons.zip`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const canGenerate = useMemo(() => Boolean(file) && !loading, [file, loading]);

  return (
    <ToolLayout icon={Sparkles} title="Icon Generator" description="Generate favicon and app icons from images">
      {!file ? (
        <div className="max-w-xl mx-auto">
          <FileUpload label="Upload Source Image" accept="image/*" onFilesSelected={handleFilesSelected} />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={handleClear} className="w-full flex items-center justify-center gap-2">
                <RefreshCcw className="w-4 h-4" />
                Clear
              </Button>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as Platform)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm font-medium text-slate-900 dark:text-slate-100"
              >
                <option value="favicon">Favicon</option>
                <option value="android-icon">Android</option>
                <option value="apple-icon">Apple</option>
                <option value="ms-icon">Microsoft</option>
              </select>
            </div>

            <div className="space-y-4">
              <ControlPanel title="Original">
                <div className="relative w-full h-64 bg-slate-100 dark:bg-slate-800 rounded">
                  <NextImage src={sourceUrl!} alt="Source" fill className="object-contain" sizes="100vw" />
                </div>
              </ControlPanel>

              {previews.length > 0 && (
                <Button onClick={downloadAllAsZip} className="w-full flex items-center justify-center gap-2">
                  <Archive className="w-4 h-4" />
                  Download All
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {previews.length > 0 ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {previews.map((p) => (
                  <ControlPanel key={p.size} title={`${p.size} x ${p.size}`}>
                    <div className="relative w-full h-24 bg-slate-100 dark:bg-slate-800 rounded">
                      <NextImage src={p.dataUrl} alt={`icon-${p.size}`} fill className="object-contain" sizes="100vw" />
                    </div>
                    <Button variant="outline" className="w-full mt-3 flex items-center justify-center gap-2" onClick={() => downloadIcon(p)}>
                      <Download className="w-4 h-4" /> Download
                    </Button>
                  </ControlPanel>
                ))}
                </div>
              </>
            ) : (
              <ControlPanel title="Generated Icons">
                <div className="relative w-full h-64 bg-slate-100 dark:bg-slate-800 rounded flex items-center justify-center text-sm text-slate-500 dark:text-slate-400">
                  Generated icons will appear here.
                </div>
              </ControlPanel>
            )}
          </div>
        </div>
      )}
    </ToolLayout>
  );
}
