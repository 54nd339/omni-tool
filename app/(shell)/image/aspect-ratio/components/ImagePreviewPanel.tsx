'use client';

import NextImage from 'next/image';
import { useAspectRatioContext } from './AspectRatioContext';
import { ControlPanel } from '@/app/components/shared';
import { useObjectUrl } from '@/app/lib/hooks';

export function ImagePreviewPanel() {
  const { state } = useAspectRatioContext();
  const imageUrl = useObjectUrl(state.image?.file || null);

  return (
    <ControlPanel title="Original">
      <div className="relative w-full h-72 bg-slate-100 dark:bg-slate-800 rounded flex items-center justify-center overflow-hidden">
        {imageUrl && (
          <NextImage
            src={imageUrl}
            alt="Original image"
            fill
            className="object-contain"
            sizes="100vw"
            priority
          />
        )}
      </div>
      {state.originalDims && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
          {state.originalDims.width}x{state.originalDims.height}px
        </p>
      )}
    </ControlPanel>
  );
}
