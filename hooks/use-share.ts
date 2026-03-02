'use client';

import { useCallback } from 'react';
import { toast } from 'sonner';

interface ShareOptions {
  blob: Blob;
  fileName: string;
  title?: string;
}

export function useShare() {
  const canShare = typeof navigator !== 'undefined' && !!navigator.share;

  const share = useCallback(async ({ blob, fileName, title }: ShareOptions) => {
    const file = new File([blob], fileName, { type: blob.type });

    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ title: title ?? fileName, files: [file] });
        return;
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;
        if (err instanceof Error) toast.error(err.message);
      }
    }

    try {
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob }),
      ]);
      toast.success('Copied');
    } catch {
      toast.error('Sharing not supported on this device');
    }
  }, []);

  return { share, canShare };
}
