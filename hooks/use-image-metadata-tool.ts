'use client';

import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { useClipboardPaste } from '@/hooks/use-clipboard-paste';
import { useImageMetadata } from '@/hooks/worker-hooks';
import {
  extractImageMetadata,
  getMetadataEntries,
  type MetadataResult,
} from '@/lib/image/image-metadata';
import { downloadBlob } from '@/lib/utils';

export function useImageMetadataTool() {
  const [file, setFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<MetadataResult | null>(null);
  const { error, status, stripMetadata } = useImageMetadata();

  const handleFiles = useCallback(async (files: File[]) => {
    const selected = files[0];
    if (!selected) return;

    setFile(selected);
    const result = await extractImageMetadata(selected);
    setMetadata(result);
  }, []);

  useClipboardPaste(handleFiles, !file);

  const handleStripAndDownload = useCallback(async () => {
    if (!file) return;

    try {
      const blob = await stripMetadata(file);
      const baseName = file.name.replace(/\.[^.]+$/, '');
      downloadBlob(blob, `${baseName}-no-metadata.png`);
      toast.success('Image downloaded without metadata');
    } catch (stripError) {
      toast.error(
        stripError instanceof Error
          ? stripError.message
          : error ?? 'Failed to strip metadata',
      );
    }
  }, [error, file, stripMetadata]);

  const metadataEntries = useMemo(
    () => (metadata ? getMetadataEntries(metadata) : []),
    [metadata],
  );
  const stripLoading = status === 'loading' || status === 'processing';

  return {
    file,
    handleFiles,
    handleStripAndDownload,
    metadata,
    metadataEntries,
    stripLoading,
  };
}
