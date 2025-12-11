'use client';

import { useEffect, useState } from 'react';
import NextImage from 'next/image';
import JSZip from 'jszip';
import { Download, RefreshCcw, Archive } from 'lucide-react';
import { ToolLayout, ControlPanel, FileUpload, Button, ErrorAlert, Select } from '@/app/components/shared';
import { useFileUpload, useObjectUrl, useClearHandler } from '@/app/lib/hooks';
import { generateIconPreviews, downloadDataUrl, downloadBlob, validateImageFile } from '@/app/lib/utils';
import { IconPlatform, IconPreview } from '@/app/lib/types';

export default function IconsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previews, setPreviews] = useState<IconPreview[]>([]);
  const [loading, setLoading] = useState(false);
  const [platform, setPlatform] = useState<IconPlatform>('favicon');

  const sourceUrl = useObjectUrl(file);

  const { handleFilesSelected, error: fileError, clearFiles } = useFileUpload({
    accept: 'image/*',
    validator: validateImageFile,
    onFileSelected: (selected) => {
      setFile(selected);
      setPreviews([]);
    },
  });

  const { handleClear } = useClearHandler({
    clearFiles,
    onClear: () => {
      setFile(null);
      setPreviews([]);
      setLoading(false);
    },
  });

  useEffect(() => {
    const run = async () => {
      if (!sourceUrl) return;
      setLoading(true);
      try {
        const results = await generateIconPreviews(sourceUrl, platform);
        setPreviews(results);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [platform, sourceUrl]);

  const downloadIcon = (preview: IconPreview) => {
    downloadDataUrl(preview.dataUrl, `${platform}-${preview.size}x${preview.size}.png`);
  };

  const downloadAllAsZip = async () => {
    if (previews.length === 0) return;
    const zip = new JSZip();
    previews.forEach((p) => {
      const base64Data = p.dataUrl.split(',')[1];
      zip.file(`${platform}-${p.size}x${p.size}.png`, base64Data, { base64: true });
    });
    const blob = await zip.generateAsync({ type: 'blob' });
    downloadBlob(blob, `${platform}-icons.zip`);
  };

  return (
    <ToolLayout path="/image/icons">
      {!file ? (
        <div className="max-w-xl mx-auto space-y-4">
          <FileUpload label="Upload Source Image" accept="image/*" onFilesSelected={handleFilesSelected} />
          {fileError && <ErrorAlert error={fileError} />}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={handleClear} className="w-full flex items-center justify-center gap-2">
                <RefreshCcw className="w-4 h-4" />
                Clear
              </Button>
              <Select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as IconPlatform)}
                className="text-sm font-medium"
              >
                <option value="favicon">Favicon</option>
                <option value="android-icon">Android</option>
                <option value="apple-icon">Apple</option>
                <option value="ms-icon">Microsoft</option>
              </Select>
            </div>

            <div className="space-y-4">
              <ControlPanel title="Original">
                <div className="relative w-full h-64 bg-slate-100 dark:bg-slate-800 rounded">
                  {sourceUrl ? (
                    <NextImage src={sourceUrl} alt="Source" fill className="object-contain" sizes="100vw" />
                  ) : null}
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
                    <ControlPanel key={`${platform}-${p.size}`} title={`${p.size} x ${p.size}`}>
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
