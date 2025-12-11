'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { Download, RefreshCcw } from 'lucide-react';
import { ToolLayout, ControlPanel, FileUpload, Button, CopyButton, ErrorAlert, Input, Select, RangeSlider, Checkbox } from '@/app/components/shared';
import { downloadDataUrl, formatFileSize, readImageDimensions, validateImageFile } from '@/app/lib/utils';
import { useClipboard, useImageProcessing, useFileUpload, useObjectUrl } from '@/app/lib/hooks';
import { ImageSettings, TargetFormat } from '@/app/lib/types';
import { IMAGE_DEFAULTS, IMAGE_FORMAT_OPTIONS, UI_CONSTANTS } from '@/app/lib/constants';

export default function EditImagePage() {
  const [image, setImage] = useState<{ file: File } | null>(null);
  const clipboard = useClipboard();
  const imageUrl = useObjectUrl(image?.file || null);
  const {
    canvasRef,
    processImage,
    setOriginalDims,
    newDims,
    originalDims,
    preview,
    reset: resetProcessing,
    loading,
  } = useImageProcessing();

  const [scale, setScale] = useState<number>(UI_CONSTANTS.IMAGE.DEFAULT_SCALE);
  const [width, setWidth] = useState<number | ''>('');
  const [height, setHeight] = useState<number | ''>('');
  const [keepAspect, setKeepAspect] = useState(true);
  const [quality, setQuality] = useState<number>(IMAGE_DEFAULTS.EDIT_QUALITY);
  const [grayscale, setGrayscale] = useState(false);
  const [format, setFormat] = useState<TargetFormat>(IMAGE_DEFAULTS.EDIT_FORMAT);

  const resetState = () => {
    setImage(null);
    setScale(100);
    setWidth('');
    setHeight('');
    setKeepAspect(true);
    setQuality(0.8);
    setGrayscale(false);
    clipboard.setCopied(false);
    resetProcessing();
    setFormat('image/png');
  };

  const { error: fileError, handleFilesSelected: handleFileUpload } = useFileUpload({
    accept: 'image/*',
    validator: validateImageFile,
    onFileSelected: async (file) => {
      setImage({ file });
      resetProcessing();
      setFormat(IMAGE_DEFAULTS.EDIT_FORMAT);
      setWidth('');
      setHeight('');
      setKeepAspect(true);
      setQuality(IMAGE_DEFAULTS.EDIT_QUALITY);
      setGrayscale(false);

      // Read dimensions from the file directly
      const url = URL.createObjectURL(file);
      try {
        const dims = await readImageDimensions(url);
        setOriginalDims(dims);
      } catch {
        // Ignore errors
      } finally {
        URL.revokeObjectURL(url);
      }
    },
  });

  const applyTransform = async () => {
    if (!image) return;
    const targetWidth = typeof width === 'number' && width > 0 ? width : undefined;
    const targetHeight = typeof height === 'number' && height > 0 ? height : undefined;
    const settings: ImageSettings = {
      scale,
      quality,
      grayscale,
      keepAspect,
      width: targetWidth,
      height: targetHeight,
    };
    if (!imageUrl) return;
    await processImage(imageUrl, settings, format);
  };

  useEffect(() => {
    if (!image) return;
    applyTransform();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scale, quality, grayscale, keepAspect, width, height, image, format]);

  const previewMime = useMemo(() => preview?.match(/^data:([^;]+);/)?.[1] || format, [preview, format]);

  const handleDownload = () => {
    if (!preview || !image) return;
    const ext = (previewMime.split('/')[1] || 'png').replace('jpeg', 'jpg');
    const filename = `${image.file.name.replace(/\.[^.]+$/, '')}.${ext}`;
    downloadDataUrl(preview, filename);
  };

  const handleCopy = async () => {
    if (!preview) return;
    await clipboard.copyBlob(preview, previewMime);
  };

  const newSize = useMemo(() => {
    if (!preview) return 0;
    const base64Header = /^data:[^;]+;base64,/;
    const base64 = preview.replace(base64Header, '');
    return Math.round((base64.length * 3) / 4);
  }, [preview]);

  return (
    <ToolLayout path="/image/edit">
      {!image ? (
        <div className="max-w-xl mx-auto space-y-4">
          <FileUpload label="Upload Image" accept="image/*" onFilesSelected={handleFileUpload} />
          {fileError && <ErrorAlert error={fileError} />}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            <Button variant="outline" onClick={resetState} className="w-full flex items-center justify-center gap-2">
              <RefreshCcw className="w-4 h-4" />
              Clear Image
            </Button>

            <ControlPanel title="Image Controls">
              <div className="space-y-4">
                <RangeSlider
                  label="Resize"
                  value={scale}
                  min={10}
                  max={200}
                  step={1}
                  displayValue={`${scale}%`}
                  onChange={(e) => setScale(parseInt(e.target.value))}
                />

                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    label="Width (px, optional)"
                    value={width === '' ? '' : width}
                    onChange={(e) => {
                      const newWidth = e.target.value === '' ? '' : parseInt(e.target.value);
                      setWidth(newWidth);
                      if (keepAspect && originalDims && typeof newWidth === 'number') {
                        const aspectRatio = originalDims.height / originalDims.width;
                        setHeight(Math.round(newWidth * aspectRatio));
                      }
                    }}
                  />
                  <Input
                    type="number"
                    label="Height (px, optional)"
                    value={height === '' ? '' : height}
                    onChange={(e) => {
                      const newHeight = e.target.value === '' ? '' : parseInt(e.target.value);
                      setHeight(newHeight);
                      if (keepAspect && originalDims && typeof newHeight === 'number') {
                        const aspectRatio = originalDims.width / originalDims.height;
                        setWidth(Math.round(newHeight * aspectRatio));
                      }
                    }}
                  />
                </div>

                <Checkbox
                  label="Keep aspect ratio"
                  checked={keepAspect}
                  onChange={(e) => setKeepAspect(e.target.checked)}
                />

                <RangeSlider
                  label="Quality"
                  value={quality}
                  min={0.1}
                  max={1}
                  step={0.05}
                  displayValue={`${Math.round(quality * 100)}%`}
                  onChange={(e) => setQuality(parseFloat(e.target.value))}
                  disabled={format === 'image/png'}
                  helperText={format === 'image/png' ? 'PNG is lossless - quality control disabled' : undefined}
                />

                <Checkbox
                  label="Grayscale Mode"
                  checked={grayscale}
                  onChange={(e) => setGrayscale(e.target.checked)}
                />

                <Select
                  label="Target Format"
                  value={format}
                  onChange={(e) => setFormat(e.target.value as TargetFormat)}
                >
                  {IMAGE_FORMAT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>

                <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1 border-t pt-3">
                  <p>
                    Original: {image ? formatFileSize(image.file.size) : '--'}
                    {originalDims ? ` • ${originalDims.width}x${originalDims.height}px` : ''}
                  </p>
                  <p>
                    New: {preview ? formatFileSize(newSize) : '--'}
                    {newDims ? ` • ${newDims.width}x${newDims.height}px` : ''}
                  </p>
                </div>
              </div>
            </ControlPanel>
          </div>

          <div className="space-y-4 hidden lg:block">
            <ControlPanel title="Original">
              <div className="relative w-full h-72 bg-slate-100 dark:bg-slate-800 rounded flex items-center justify-center">
                {imageUrl && <Image src={imageUrl} alt="Original" width={originalDims?.width || 500} height={originalDims?.height || 500} className="max-w-full max-h-72 object-contain" />}
              </div>
            </ControlPanel>
          </div>

          <div className="space-y-4">
            {preview ? (
              <ControlPanel title="Preview">
                <div className="relative w-full h-72 bg-slate-100 dark:bg-slate-800 rounded flex items-center justify-center">
                  <Image src={preview} alt="Preview" width={newDims?.width || 500} height={newDims?.height || 500} className="max-w-full max-h-72 object-contain" />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Button variant="outline" onClick={handleDownload} className="w-full flex items-center justify-center gap-2">
                    <Download className="w-4 h-4" />
                    Download
                  </Button>
                  <CopyButton
                    value={preview || ''}
                    onCopy={handleCopy}
                    copied={clipboard.copied}
                    disabled={!preview || loading}
                    className="w-full"
                  />
                </div>
              </ControlPanel>
            ) : (
              <ControlPanel title="Preview">
                <div className="relative w-full h-72 bg-slate-100 dark:bg-slate-800 rounded flex items-center justify-center text-sm text-slate-500 dark:text-slate-400">
                  Your processed image will appear here.
                </div>
              </ControlPanel>
            )}
          </div>
        </div>
      )}
      <canvas ref={canvasRef} className="hidden" />
    </ToolLayout>
  );
}
