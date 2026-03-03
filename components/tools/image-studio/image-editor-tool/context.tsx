'use client';

import { createContext, type ReactNode, useContext } from 'react';

import type { useImageEditor } from '@/hooks/use-image-editor';

type RawImageEditorContextValue = ReturnType<typeof useImageEditor>;
export type ImageEditorContextValue = Omit<RawImageEditorContextValue, 'file'> & {
  file: File;
};

const ImageEditorContext = createContext<ImageEditorContextValue | null>(null);

export function ImageEditorProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: ImageEditorContextValue;
}) {
  return (
    <ImageEditorContext.Provider value={value}>
      {children}
    </ImageEditorContext.Provider>
  );
}

export function useImageEditorContext(): ImageEditorContextValue {
  const context = useContext(ImageEditorContext);
  if (!context) {
    throw new Error('useImageEditorContext must be used within ImageEditorProvider');
  }
  return context;
}
