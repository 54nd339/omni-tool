'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { Layers } from 'lucide-react';
import { toast } from 'sonner';

import { EmptyState } from '@/components/shared/empty-state';
import { FileDropzone } from '@/components/shared/file-dropzone';
import { ShareButton } from '@/components/shared/tool-actions/share-button';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { useClipboardPaste } from '@/hooks/use-clipboard-paste';
import { useIconGen } from '@/hooks/worker-hooks';
import { ICON_PLATFORMS } from '@/lib/constants/image-studio';
import {
  createIconSourceBitmap,
  getInitialSelectedPlatforms,
  getSelectedPlatformPayload,
  revokeUrl,
  toTransferredIconGenerationRequest,
} from '@/lib/image/icon-generator-client';
import { cn, downloadBlob, pluralize } from '@/lib/utils';

export function IconGeneratorTool() {
  const download = downloadBlob;
  const { run, status } = useIconGen();

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState<
    Record<string, number[]>
  >(getInitialSelectedPlatforms(ICON_PLATFORMS));

  const handleFiles = useCallback((files: File[]) => {
    const f = files[0];
    if (!f) return;
    setPreviewUrl((prev) => {
      revokeUrl(prev);
      return URL.createObjectURL(f);
    });
    setFile(f);
  }, []);

  useEffect(() => {
    return () => {
      revokeUrl(previewUrl);
    };
  }, [previewUrl]);

  useClipboardPaste(handleFiles, !file);

  const toggleSize = useCallback(
    (platform: string, size: number) => {
      setSelectedPlatforms((prev) => {
        const sizes = prev[platform] ?? [];
        const has = sizes.includes(size);
        return {
          ...prev,
          [platform]: has
            ? sizes.filter((s) => s !== size)
            : [...sizes, size].sort((a, b) => a - b),
        };
      });
    },
    [],
  );

  const togglePlatform = useCallback(
    (platform: string, allSizes: number[]) => {
      setSelectedPlatforms((prev) => {
        const current = prev[platform] ?? [];
        const allSelected = allSizes.every((s) => current.includes(s));
        return {
          ...prev,
          [platform]: allSelected ? [] : [...allSizes],
        };
      });
    },
    [],
  );

  const handleGenerate = useCallback(async () => {
    if (!file) return;

    const platforms = getSelectedPlatformPayload(selectedPlatforms);

    if (platforms.length === 0) {
      toast.error('Select at least one size');
      return;
    }

    try {
      const bitmap = await createIconSourceBitmap(file);
      const request = toTransferredIconGenerationRequest({
        platforms,
        sourceImageBitmap: bitmap,
      });

      const zip = await run((api) => api.generateIcons(request));
      setResultBlob(zip);
      download(zip, 'icons.zip');
      toast.success('Icons generated and downloaded');
    } catch (e) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Icon generation error:', e);
      }
      toast.error('Icon generation failed');
    }
  }, [file, selectedPlatforms, download, run]);

  const totalIcons = Object.values(selectedPlatforms).reduce(
    (sum, sizes) => sum + sizes.length,
    0,
  );

  return (
    <div className="space-y-6">
      {!file && (
        <EmptyState icon={Layers} title="Generate icon sets" description="Upload an image to create favicon, Android, Apple, and MS icons" hint="Tip: ⌘V to paste an image from clipboard">
          <FileDropzone
            onFiles={handleFiles}
            accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.svg'] }}
            label="Drop a source image for icon generation"
            hint="Square images work best. Output is always PNG. Or paste from clipboard."
          />
        </EmptyState>
      )}

      {file && (
        <>
          <div className="grid gap-6 lg:grid-cols-[200px_1fr]">
            <div className="space-y-3">
              {previewUrl && (
                <Image
                  src={previewUrl}
                  alt="Source"
                  width={128}
                  height={128}
                  unoptimized
                  className="h-32 w-32 rounded-lg border border-border object-cover"
                />
              )}
              <Button
                variant="ghost"
                className="text-xs"
                onClick={() => {
                  setFile(null);
                  setPreviewUrl((prev) => {
                    revokeUrl(prev);
                    return null;
                  });
                }}
              >
                Change image
              </Button>
            </div>

            <div className="space-y-5">
              {ICON_PLATFORMS.map((platform) => {
                const selected = selectedPlatforms[platform.platform] ?? [];
                const allSelected = platform.sizes.every((s) =>
                  selected.includes(s),
                );

                return (
                  <div key={platform.platform}>
                    <div className="mb-2 flex items-center gap-2">
                      <Checkbox
                        checked={allSelected}
                        onCheckedChange={() =>
                          togglePlatform(platform.platform, [...platform.sizes])
                        }
                      />
                      <span className="text-sm font-medium capitalize">
                        {platform.platform.replace('-', ' ')}
                      </span>
                    </div>
                    <div className="ml-6 flex flex-wrap gap-3">
                      {platform.sizes.map((size) => {
                        const checked = selected.includes(size);
                        return (
                          <label
                            key={size}
                            className={cn(
                              "flex cursor-pointer flex-col items-center gap-2 rounded-lg border p-2 transition-colors hover:bg-muted",
                              checked ? "border-primary bg-primary/5" : "border-border bg-background"
                            )}
                          >
                            <div
                              className="flex h-[64px] w-[64px] shrink-0 items-center justify-center rounded-md border border-border/50 bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%3E%3Crect%20width%3D%228%22%20height%3D%228%22%20fill%3D%22%23f0f0f0%22%2F%3E%3Crect%20x%3D%228%22%20y%3D%228%22%20width%3D%228%22%20height%3D%228%22%20fill%3D%22%23f0f0f0%22%2F%3E%3C%2Fsvg%3E')] overflow-hidden"
                              title={`${size}x${size} preview`}
                            >
                              {previewUrl && (
                                <Image
                                  src={previewUrl}
                                  alt={`${size}x${size}`}
                                  width={size}
                                  height={size}
                                  unoptimized
                                  className="max-h-full max-w-full object-contain"
                                />
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs font-medium">
                              <Checkbox
                                checked={checked}
                                onCheckedChange={() =>
                                  toggleSize(platform.platform, size)
                                }
                              />
                              {size}
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {status === 'processing' && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Generating icons...</p>
              <Progress value={undefined} />
            </div>
          )}

          <div className="flex items-center gap-3">
            <Button
              onClick={handleGenerate}
              disabled={status === 'processing' || totalIcons === 0}
              loading={status === 'processing'}
            >
              Generate {totalIcons} {pluralize(totalIcons, 'icon')} (ZIP)
            </Button>
            <ShareButton blob={resultBlob} fileName="icons.zip" />
          </div>
        </>
      )}
    </div>
  );
}
