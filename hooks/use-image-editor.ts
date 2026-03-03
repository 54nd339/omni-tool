'use client';

import { downloadBlob } from '@/lib/utils';
import { useCanRedo, useCanUndo, useHistoryStore } from '@/stores/history-store';

import { useImageEditorActions } from './image-editor/use-image-editor-actions';
import { useImageEditorState } from './image-editor/use-image-editor-state';
import { useClipboardPaste } from './use-clipboard-paste';
import { useFFmpeg } from './use-ffmpeg';
import { useShare } from './use-share';

export function useImageEditor() {
  const { run, status, progress } = useFFmpeg();
  const download = downloadBlob;
  const { share } = useShare();
  const addHistory = useHistoryStore((state) => state.push);
  const undoHistory = useHistoryStore((state) => state.undo);
  const redoHistory = useHistoryStore((state) => state.redo);
  const clearHistory = useHistoryStore((state) => state.clear);
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();

  const state = useImageEditorState(clearHistory);
  const actions = useImageEditorActions({
    addHistory,
    clearHistory,
    download,
    redoHistory: () => redoHistory(),
    run,
    share,
    state,
    undoHistory: () => undoHistory(),
  });

  useClipboardPaste(actions.handleFiles, !state.file);

  return {
    canRedo,
    canUndo,
    compressedBlob: state.compressedBlob,
    compressedUrl: state.compressedUrl,
    compressFormat: state.compressFormat,
    compressQuality: state.compressQuality,
    compressing: state.compressing,
    estimatedSize: actions.estimatedSize,
    file: state.file,
    format: state.format,
    handleCompress: actions.handleCompress,
    handleCompressDownload: actions.handleCompressDownload,
    handleDownload: actions.handleDownload,
    handleFiles: actions.handleFiles,
    handleHeightChange: actions.handleHeightChange,
    handleModeChange: actions.handleModeChange,
    handleProcess: actions.handleProcess,
    handleRedo: actions.handleRedo,
    handleReset: actions.handleReset,
    handleUndo: actions.handleUndo,
    handleWidthChange: actions.handleWidthChange,
    height: state.height,
    heightError: actions.heightError,
    lockAspect: state.lockAspect,
    mode: state.mode,
    onShare: actions.onShare,
    originalDims: state.originalDims,
    originalUrl: state.originalUrl,
    previewUrl: state.previewUrl,
    processing: status === 'processing',
    progress,
    quality: state.quality,
    resultBlob: state.resultBlob,
    setCompressFormat: state.setCompressFormat,
    setCompressQuality: state.setCompressQuality,
    setFormat: state.setFormat,
    setLockAspect: state.setLockAspect,
    setQuality: state.setQuality,
    width: state.width,
    widthError: actions.widthError,
  };
}
