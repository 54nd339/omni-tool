'use client';

import { useEffect, useRef } from 'react';

export function useClipboardPaste(
  onPaste: (files: File[]) => void,
  enabled = true,
) {
  const callbackRef = useRef(onPaste);
  callbackRef.current = onPaste;

  useEffect(() => {
    if (!enabled) return;

    const handler = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const imageFiles: File[] = [];
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) imageFiles.push(file);
        }
      }

      if (imageFiles.length > 0) {
        e.preventDefault();
        callbackRef.current(imageFiles);
      }
    };

    document.addEventListener('paste', handler);
    return () => document.removeEventListener('paste', handler);
  }, [enabled]);
}

export function useSmartPaste(enabled = true) {
  const lastRef = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const handler = async (e: ClipboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      const text = e.clipboardData?.getData('text/plain');
      if (!text || text.length < 3) return;

      const { detectContentType } = await import('@/lib/smart-suggest');
      const suggestion = detectContentType(text);
      if (!suggestion) return;

      if (window.location.pathname.replace(/\/$/, '') === suggestion.toolPath) return;

      const key = `${suggestion.type}:${text.slice(0, 50)}`;
      if (lastRef.current === key) return;
      lastRef.current = key;

      const pasteParam = encodeURIComponent(text.slice(0, 2000));

      const { toast } = await import('sonner');
      toast(
        `Looks like ${suggestion.type}. Open in ${suggestion.toolName}?`,
        {
          duration: 5000,
          action: {
            label: 'Open',
            onClick: () => {
              window.location.href = `${suggestion.toolPath}?paste=${pasteParam}`;
            },
          },
        },
      );
    };

    document.addEventListener('paste', handler);
    return () => document.removeEventListener('paste', handler);
  }, [enabled]);
}
