'use client';

import { useCallback, useEffect, useReducer } from 'react';
import { parseAsBoolean, parseAsInteger, parseAsString, useQueryState } from 'nuqs';

import { type CompressFormat } from '@/lib/image/image-editor';

export type EditorMode = 'edit' | 'compress';

interface ImageEditorLocalState {
  compressedBlob: Blob | null;
  compressedUrl: string | null;
  compressFormat: CompressFormat;
  compressQuality: number;
  compressing: boolean;
  file: File | null;
  mode: EditorMode;
  originalDims: {
    width: number;
    height: number;
  };
  originalUrl: string | null;
  previewUrl: string | null;
  resultBlob: Blob | null;
}

type ImageEditorLocalAction =
  | { type: 'setCompressedBlob'; payload: Blob | null }
  | { type: 'setCompressedUrl'; payload: string | null }
  | { type: 'setCompressFormat'; payload: CompressFormat }
  | { type: 'setCompressQuality'; payload: number }
  | { type: 'setCompressing'; payload: boolean }
  | { type: 'setFile'; payload: File | null }
  | { type: 'setMode'; payload: EditorMode }
  | { type: 'setOriginalDims'; payload: { width: number; height: number } }
  | { type: 'setOriginalUrl'; payload: string | null }
  | { type: 'setPreviewUrl'; payload: string | null }
  | { type: 'setResultBlob'; payload: Blob | null };

const initialImageEditorLocalState: ImageEditorLocalState = {
  compressedBlob: null,
  compressedUrl: null,
  compressFormat: 'webp',
  compressQuality: 80,
  compressing: false,
  file: null,
  mode: 'edit',
  originalDims: { width: 0, height: 0 },
  originalUrl: null,
  previewUrl: null,
  resultBlob: null,
};

function imageEditorLocalReducer(
  state: ImageEditorLocalState,
  action: ImageEditorLocalAction,
): ImageEditorLocalState {
  switch (action.type) {
    case 'setCompressedBlob':
      return { ...state, compressedBlob: action.payload };
    case 'setCompressedUrl':
      return { ...state, compressedUrl: action.payload };
    case 'setCompressFormat':
      return { ...state, compressFormat: action.payload };
    case 'setCompressQuality':
      return { ...state, compressQuality: action.payload };
    case 'setCompressing':
      return { ...state, compressing: action.payload };
    case 'setFile':
      return { ...state, file: action.payload };
    case 'setMode':
      return { ...state, mode: action.payload };
    case 'setOriginalDims':
      return { ...state, originalDims: action.payload };
    case 'setOriginalUrl':
      return { ...state, originalUrl: action.payload };
    case 'setPreviewUrl':
      return { ...state, previewUrl: action.payload };
    case 'setResultBlob':
      return { ...state, resultBlob: action.payload };
    default:
      return state;
  }
}

export function useImageEditorState(clearHistory: () => void) {
  const [localState, dispatch] = useReducer(
    imageEditorLocalReducer,
    initialImageEditorLocalState,
  );

  const [width, setWidth] = useQueryState('w', parseAsInteger.withDefault(0));
  const [height, setHeight] = useQueryState('h', parseAsInteger.withDefault(0));
  const [lockAspect, setLockAspect] = useQueryState('lock', parseAsBoolean.withDefault(true));
  const [quality, setQuality] = useQueryState('q', parseAsInteger.withDefault(85));
  const [format, setFormat] = useQueryState('f', parseAsString.withDefault('png'));

  const setCompressedBlob = useCallback((value: Blob | null) => {
    dispatch({ type: 'setCompressedBlob', payload: value });
  }, []);

  const setCompressedUrl = useCallback((value: string | null) => {
    dispatch({ type: 'setCompressedUrl', payload: value });
  }, []);

  const setCompressFormat = useCallback((value: CompressFormat) => {
    dispatch({ type: 'setCompressFormat', payload: value });
  }, []);

  const setCompressQuality = useCallback((value: number) => {
    dispatch({ type: 'setCompressQuality', payload: value });
  }, []);

  const setCompressing = useCallback((value: boolean) => {
    dispatch({ type: 'setCompressing', payload: value });
  }, []);

  const setFile = useCallback((value: File | null) => {
    dispatch({ type: 'setFile', payload: value });
  }, []);

  const setMode = useCallback((value: EditorMode) => {
    dispatch({ type: 'setMode', payload: value });
  }, []);

  const setOriginalDims = useCallback((value: { width: number; height: number }) => {
    dispatch({ type: 'setOriginalDims', payload: value });
  }, []);

  const setOriginalUrl = useCallback((value: string | null) => {
    dispatch({ type: 'setOriginalUrl', payload: value });
  }, []);

  const setPreviewUrl = useCallback((value: string | null) => {
    dispatch({ type: 'setPreviewUrl', payload: value });
  }, []);

  const setResultBlob = useCallback((value: Blob | null) => {
    dispatch({ type: 'setResultBlob', payload: value });
  }, []);

  useEffect(() => {
    return () => clearHistory();
  }, [clearHistory]);

  return {
    compressedBlob: localState.compressedBlob,
    compressedUrl: localState.compressedUrl,
    compressFormat: localState.compressFormat,
    compressQuality: localState.compressQuality,
    compressing: localState.compressing,
    file: localState.file,
    format,
    height,
    lockAspect,
    mode: localState.mode,
    originalDims: localState.originalDims,
    originalUrl: localState.originalUrl,
    previewUrl: localState.previewUrl,
    quality,
    resultBlob: localState.resultBlob,
    setCompressedBlob,
    setCompressedUrl,
    setCompressFormat,
    setCompressing,
    setCompressQuality,
    setFile,
    setFormat,
    setHeight,
    setLockAspect,
    setMode,
    setOriginalDims,
    setOriginalUrl,
    setPreviewUrl,
    setQuality,
    setResultBlob,
    setWidth,
    width,
  };
}

export type ImageEditorState = ReturnType<typeof useImageEditorState>;
