'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { useBatchImageProcessor } from '@/hooks/worker-hooks';
import {
  type BatchItem,
  createBatchDownloadPayload,
  createBatchItemId,
  createPreview,
  type Operation,
  type OutputFormat,
} from '@/lib/image/batch-image';
import { downloadBlob } from '@/lib/utils';

export function useBatchImage() {
  const [items, setItems] = useState<BatchItem[]>([]);
  const [operation, setOperation] = useState<Operation>('resize');
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(0);
  const [format, setFormat] = useState<OutputFormat>('webp');
  const [quality, setQuality] = useState(80);
  const { error, processBatch, status } = useBatchImageProcessor();

  useEffect(() => {
    return () => {
      items.forEach((item) => URL.revokeObjectURL(item.preview));
    };
  }, [items]);

  const handleFiles = useCallback((files: File[]) => {
    const newItems: BatchItem[] = files.map((file) => ({
      id: createBatchItemId(file),
      file,
      preview: createPreview(file),
      status: 'pending',
    }));

    setItems((previous) => [...previous, ...newItems]);
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((previous) => {
      const item = previous.find((value) => value.id === id);
      if (item) URL.revokeObjectURL(item.preview);
      return previous.filter((value) => value.id !== id);
    });
  }, []);

  const clearAll = useCallback(() => {
    setItems((previous) => {
      previous.forEach((item) => URL.revokeObjectURL(item.preview));
      return [];
    });
  }, []);

  const processAll = useCallback(async () => {
    if (items.length === 0) return;

    const itemIds = items.map((item) => item.id);
    setItems((previous) =>
      previous.map((item) => ({ ...item, error: undefined, status: 'processing' })),
    );

    try {
      await processBatch(
        {
          concurrency: 4,
          files: items.map((item) => item.file),
          format,
          height,
          operation,
          quality,
          width,
        },
        (workerItem) => {
          const itemId = itemIds[workerItem.index];
          if (!itemId) return;

          setItems((previous) =>
            previous.map((item) => {
              if (item.id !== itemId) return item;

              if (workerItem.status === 'done') {
                return {
                  ...item,
                  error: undefined,
                  result: workerItem.result,
                  status: 'done',
                };
              }

              return {
                ...item,
                error: workerItem.error,
                result: undefined,
                status: 'error',
              };
            }),
          );
        },
      );

      toast.success(`Processed ${items.length} images`);
    } catch (processingError) {
      toast.error(
        processingError instanceof Error
          ? processingError.message
          : error ?? 'Batch image processing failed',
      );
    }
  }, [error, format, height, items, operation, processBatch, quality, width]);

  const downloadAll = useCallback(async () => {
    const doneItems = items.filter((item) => item.status === 'done' && item.result);
    if (doneItems.length === 0) return;

    const payload = await createBatchDownloadPayload({
      doneItems,
      format,
      operation,
    });

    downloadBlob(payload.blob, payload.fileName);
  }, [format, items, operation]);

  const doneCount = useMemo(
    () => items.filter((item) => item.status === 'done').length,
    [items],
  );
  const progress = items.length > 0 ? Math.round((doneCount / items.length) * 100) : 0;
  const processing = status === 'loading' || status === 'processing';

  return {
    clearAll,
    doneCount,
    downloadAll,
    format,
    handleFiles,
    height,
    items,
    operation,
    processAll,
    processing,
    progress,
    quality,
    removeItem,
    setFormat,
    setHeight,
    setOperation,
    setQuality,
    setWidth,
    width,
  };
}
