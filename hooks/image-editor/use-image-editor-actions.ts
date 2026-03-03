'use client';

import { useCallback } from 'react';
import { toast } from 'sonner';

import { useImageCompress } from '@/hooks/worker-hooks';
import {
  getCompressedDownloadName,
  getEditedDownloadName,
} from '@/lib/image/image-editor';
import { formatBytes } from '@/lib/utils';

import { type EditorMode, type ImageEditorState } from './use-image-editor-state';

interface EditorSnapshot {
  width: number;
  height: number;
  quality: number;
  format: string;
  previewUrl: string | null;
  resultBlob: Blob | null;
}

interface HistorySnapshot {
  data: unknown;
}

interface ImageOpsApi {
  resizeImage: (file: Blob, options: { width: number; height: number; maintainAspect: boolean }) => Promise<Blob>;
  convertImage: (file: Blob, options: { outputFormat: string; quality: number }) => Promise<Blob>;
}

export function useImageEditorActions(params: {
  addHistory: (label: string, data: unknown) => void;
  clearHistory: () => void;
  download: (blob: Blob, filename: string) => void;
  redoHistory: () => HistorySnapshot | null;
  run: <T>(task: (api: ImageOpsApi) => Promise<T>) => Promise<T>;
  share: (params: { blob: Blob; fileName: string }) => Promise<void>;
  state: ImageEditorState;
  undoHistory: () => HistorySnapshot | null;
}) {
  const {
    addHistory,
    clearHistory,
    download,
    redoHistory,
    run,
    share,
    state,
    undoHistory,
  } = params;
  const { compressImage, error: compressError } = useImageCompress();

  const restoreSnapshot = useCallback((snapshot: EditorSnapshot) => {
    state.setWidth(snapshot.width);
    state.setHeight(snapshot.height);
    state.setQuality(snapshot.quality);
    state.setFormat(snapshot.format);
    state.setPreviewUrl(snapshot.previewUrl);
    state.setResultBlob(snapshot.resultBlob);
  }, [state]);

  const handleUndo = useCallback(() => {
    const snapshot = undoHistory();
    if (snapshot) restoreSnapshot(snapshot.data as EditorSnapshot);
  }, [restoreSnapshot, undoHistory]);

  const handleRedo = useCallback(() => {
    const snapshot = redoHistory();
    if (snapshot) restoreSnapshot(snapshot.data as EditorSnapshot);
  }, [redoHistory, restoreSnapshot]);

  const handleFiles = useCallback((files: File[]) => {
    const selectedFile = files[0];
    if (!selectedFile) return;

    state.setFile(selectedFile);
    state.setResultBlob(null);
    state.setCompressedBlob(null);
    state.setCompressedUrl(null);

    const url = URL.createObjectURL(selectedFile);
    state.setOriginalUrl(url);
    state.setPreviewUrl(url);

    const image = new window.Image();
    image.onload = () => {
      state.setOriginalDims({ width: image.width, height: image.height });
      state.setWidth(image.width);
      state.setHeight(image.height);
    };
    image.src = url;
  }, [state]);

  const handleModeChange = useCallback((value: string) => {
    if (!value) return;

    state.setMode(value as EditorMode);
    state.setResultBlob(null);
    state.setCompressedBlob(null);
    state.setCompressedUrl(null);
    if (state.originalUrl) state.setPreviewUrl(state.originalUrl);
  }, [state]);

  const handleWidthChange = useCallback((nextWidth: number) => {
    state.setWidth(nextWidth);
    if (state.lockAspect && state.originalDims.width > 0) {
      state.setHeight(Math.round((nextWidth / state.originalDims.width) * state.originalDims.height));
    }
  }, [state]);

  const handleHeightChange = useCallback((nextHeight: number) => {
    state.setHeight(nextHeight);
    if (state.lockAspect && state.originalDims.height > 0) {
      state.setWidth(Math.round((nextHeight / state.originalDims.height) * state.originalDims.width));
    }
  }, [state]);

  const widthError = state.file && state.width <= 0 ? 'Must be > 0' : undefined;
  const heightError = state.file && state.height <= 0 ? 'Must be > 0' : undefined;
  const dimsValid = state.width > 0 && state.height > 0;

  const handleProcess = useCallback(async () => {
    if (!state.file || !dimsValid) {
      if (!dimsValid) toast.error('Width and height must be positive');
      return;
    }

    try {
      let blob: Blob;
      if (state.width !== state.originalDims.width || state.height !== state.originalDims.height) {
        blob = await run((api) =>
          api.resizeImage(state.file as Blob, { width: state.width, height: state.height, maintainAspect: false }),
        );
      } else {
        blob = state.file;
      }

      if (state.format !== 'png' || state.quality < 100) {
        blob = await run((api) =>
          api.convertImage(blob, { outputFormat: state.format, quality: state.quality }),
        );
      }

      const newUrl = URL.createObjectURL(blob);
      state.setResultBlob(blob);
      if (state.previewUrl && state.previewUrl !== state.originalUrl) URL.revokeObjectURL(state.previewUrl);
      state.setPreviewUrl(newUrl);
      addHistory('Process image', {
        width: state.width,
        height: state.height,
        quality: state.quality,
        format: state.format,
        previewUrl: newUrl,
        resultBlob: blob,
      } as EditorSnapshot);
      toast.success(`Processed: ${formatBytes(state.file.size)} → ${formatBytes(blob.size)}`);
    } catch {
      toast.error('Processing failed');
    }
  }, [addHistory, dimsValid, run, state]);

  const handleCompress = useCallback(async () => {
    if (!state.file) return;
    state.setCompressing(true);

    try {
      const blob = await compressImage({
        file: state.file,
        format: state.compressFormat,
        quality: state.compressQuality,
      });
      const url = URL.createObjectURL(blob);
      state.setCompressedBlob(blob);
      if (state.compressedUrl) URL.revokeObjectURL(state.compressedUrl);
      state.setCompressedUrl(url);
      toast.success(`Compressed: ${formatBytes(state.file.size)} → ${formatBytes(blob.size)}`);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : compressError ?? 'Compression failed',
      );
    } finally {
      state.setCompressing(false);
    }
  }, [compressError, compressImage, state]);

  const handleDownload = useCallback(() => {
    if (!state.resultBlob || !state.file) return;
    download(state.resultBlob, getEditedDownloadName(state.file.name, state.format));
  }, [download, state.file, state.format, state.resultBlob]);

  const handleCompressDownload = useCallback(() => {
    if (!state.compressedBlob || !state.file) return;
    download(state.compressedBlob, getCompressedDownloadName(state.file.name, state.compressFormat));
  }, [download, state.compressedBlob, state.compressFormat, state.file]);

  const handleReset = useCallback(() => {
    if (state.originalUrl) URL.revokeObjectURL(state.originalUrl);
    if (state.previewUrl && state.previewUrl !== state.originalUrl) URL.revokeObjectURL(state.previewUrl);
    if (state.compressedUrl) URL.revokeObjectURL(state.compressedUrl);
    state.setFile(null);
    state.setOriginalUrl(null);
    state.setPreviewUrl(null);
    state.setResultBlob(null);
    state.setCompressedBlob(null);
    state.setCompressedUrl(null);
    state.setMode('edit');
    clearHistory();
  }, [clearHistory, state]);

  const onShare = state.resultBlob && state.file
    ? () => {
      const shareBlob = state.resultBlob;
      const sourceFile = state.file;
      if (!shareBlob || !sourceFile) return;
      return share({
        blob: shareBlob,
        fileName: getEditedDownloadName(sourceFile.name, state.format),
      });
    }
    : undefined;

  const estimatedSize = state.resultBlob ? formatBytes(state.resultBlob.size) : null;

  return {
    estimatedSize,
    handleCompress,
    handleCompressDownload,
    handleDownload,
    handleFiles,
    handleHeightChange,
    handleModeChange,
    handleProcess,
    handleRedo,
    handleReset,
    handleUndo,
    handleWidthChange,
    heightError,
    onShare,
    widthError,
  };
}
