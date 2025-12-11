import { useState, useCallback } from 'react';
import { blobFromDataUrl } from '@/app/lib/utils';

export const useClipboard = (duration: number = 2000) => {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), duration);
      } catch (error) {
        console.error('Failed to copy:', error);
      }
    },
    [duration]
  );

  const copyBlob = useCallback(
    async (dataUrl: string, mimeType: string = 'image/png') => {
      try {
        const blob = await blobFromDataUrl(dataUrl, mimeType);
        await navigator.clipboard.write([new ClipboardItem({ [mimeType]: blob })]);
        setCopied(true);
        setTimeout(() => setCopied(false), duration);
      } catch (error) {
        console.error('Failed to copy blob:', error);
      }
    },
    [duration]
  );

  return { copied, copy, copyBlob, setCopied };
};
