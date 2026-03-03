import { createId } from '@/lib/utils';

export type Operation = 'resize' | 'convert' | 'compress';
export type OutputFormat = 'png' | 'jpg' | 'webp';

export interface BatchItem {
  id: string;
  file: File;
  preview: string;
  status: 'pending' | 'processing' | 'done' | 'error';
  result?: Blob;
  error?: string;
}

export const IMAGE_ACCEPT = {
  'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.avif', '.bmp', '.gif'],
} as const;

export function createBatchItemId(file: File): string {
  return `${file.name}-${Date.now()}-${createId(4)}`;
}

export function createPreview(file: File): string {
  return URL.createObjectURL(file);
}

export function getOutputExtension(operation: Operation, format: OutputFormat): OutputFormat {
  return operation === 'resize' ? 'png' : format;
}

export function getOutputFileName(fileName: string, extension: OutputFormat): string {
  return fileName.replace(/\.[^.]+$/, `.${extension === 'jpg' ? 'jpg' : extension}`);
}

export async function runBatchProcessing(params: {
  abortRef: { current: boolean };
  concurrency: number;
  format: OutputFormat;
  height: number;
  items: BatchItem[];
  onItemState: (id: string, state: Partial<BatchItem>) => void;
  operation: Operation;
  quality: number;
  width: number;
}): Promise<void> {
  let index = 0;

  const runNext = async (): Promise<void> => {
    while (index < params.items.length) {
      if (params.abortRef.current) {
        return;
      }

      const currentIndex = index;
      index += 1;
      const currentItem = params.items[currentIndex];

      params.onItemState(currentItem.id, { status: 'processing' });

      try {
        const result = await processImage(
          currentItem.file,
          params.operation,
          params.width,
          params.height,
          params.format,
          params.quality,
        );
        params.onItemState(currentItem.id, { status: 'done', result, error: undefined });
      } catch (error) {
        params.onItemState(currentItem.id, {
          status: 'error',
          error: error instanceof Error ? error.message : 'Failed',
        });
      }
    }
  };

  await Promise.all(
    Array.from({ length: Math.min(params.concurrency, params.items.length) }, () => runNext()),
  );
}

export async function createBatchDownloadPayload(params: {
  doneItems: BatchItem[];
  format: OutputFormat;
  operation: Operation;
}): Promise<{ blob: Blob; fileName: string }> {
  if (params.doneItems.length === 1) {
    const item = params.doneItems[0];
    return {
      blob: item.result as Blob,
      fileName: getOutputFileName(item.file.name, getOutputExtension(params.operation, params.format)),
    };
  }

  const { default: JSZip } = await import('jszip');
  const zip = new JSZip();
  for (const item of params.doneItems) {
    const extension = getOutputExtension(params.operation, params.format);
    const name = getOutputFileName(item.file.name, extension);
    zip.file(name, item.result as Blob);
  }

  return {
    blob: await zip.generateAsync({ type: 'blob' }),
    fileName: 'batch-images.zip',
  };
}

export async function processImage(
  file: File,
  operation: Operation,
  width: number,
  height: number,
  format: OutputFormat,
  quality: number,
): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const sourceWidth = bitmap.width;
  const sourceHeight = bitmap.height;

  let outputWidth = sourceWidth;
  let outputHeight = sourceHeight;

  if (operation === 'resize' && width > 0 && height > 0) {
    outputWidth = width;
    outputHeight = height;
  } else if (operation === 'resize' && width > 0) {
    outputWidth = width;
    outputHeight = Math.round((sourceHeight / sourceWidth) * width);
  } else if (operation === 'resize' && height > 0) {
    outputHeight = height;
    outputWidth = Math.round((sourceWidth / sourceHeight) * height);
  }

  const canvas = new OffscreenCanvas(outputWidth, outputHeight);
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas context unavailable');
  context.drawImage(bitmap, 0, 0, outputWidth, outputHeight);
  bitmap.close();

  const mimeMap: Record<OutputFormat, string> = {
    png: 'image/png',
    jpg: 'image/jpeg',
    webp: 'image/webp',
  };

  const outputFormat = operation === 'convert' || operation === 'compress' ? format : 'png';
  const mimeType = mimeMap[outputFormat];
  const outputQuality = operation === 'compress' ? quality / 100 : 0.92;

  return canvas.convertToBlob({ type: mimeType, quality: outputQuality });
}
