'use client';

import { useState, useCallback } from 'react';
import { Layers, Loader } from 'lucide-react';
import { ToolLayout, ControlPanel, TwoColumnLayout, Button, FileUpload, DraggableList, ErrorAlert, ProgressBar, SuccessResult, MediaPreview } from '@/app/components/shared';
import { validateMediaFile, createMediaFileItem, validateMergeFiles, formatFileSize, downloadBlob, processMerge, isVideoFormat } from '@/app/lib/utils';
import { useFileUpload, useMediaProcessing, useObjectUrl } from '@/app/lib/hooks';
import { MediaFileItem } from '@/app/lib/types';
import { PROCESSING_CONFIG, MERGE_MIN_FILES } from '@/app/lib/constants';

export default function MergePage() {
  const [files, setFiles] = useState<MediaFileItem[]>([]);
  const [outputFormat, setOutputFormat] = useState('mp4');

  const { error: fileError, handleFilesSelected } = useFileUpload({
    accept: 'audio/*,video/*',
    maxFiles: Infinity,
    validator: validateMediaFile,
    onFilesSelected: async (droppedFiles: File[]) => {
      const newItems = droppedFiles.map((selectedFile, idx) =>
        createMediaFileItem(selectedFile, files.length + idx)
      );
      setFiles((prev) => [...prev, ...newItems]);
      return newItems;
    },
  });

  const {
    processing: merging,
    progress,
    error: processingError,
    result,
    startProcessing,
  } = useMediaProcessing<{ fileName: string; size: string; blob: Blob }>({
    useRealProgress: true,
    resetDelay: PROCESSING_CONFIG.RESET_DELAY,
  });

  // Preview the processed file if available, otherwise preview the first uploaded file
  const previewFile = result?.blob ?? files[0]?.file ?? null;
  const previewUrl = useObjectUrl(previewFile);

  // Determine preview type: if result exists, use outputFormat; otherwise use file type
  const previewType = result?.blob
    ? (isVideoFormat(outputFormat) ? 'video' : 'audio')
    : previewFile instanceof File
      ? (previewFile.type?.startsWith('video/') ? 'video' : previewFile.type?.startsWith('audio/') ? 'audio' : null)
      : null;

  const handleMerge = useCallback(async () => {
    const validation = validateMergeFiles(files);
    if (!validation.valid) {
      return;
    }

    await startProcessing(async (onProgress) => {
      return await processMerge(files, outputFormat, onProgress);
    });
  }, [files, outputFormat, startProcessing]);

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index).map((f, idx) => ({ ...f, order: idx })));
  }, []);

  const reorderFiles = useCallback((reorderedFiles: MediaFileItem[]) => {
    const withOrder = reorderedFiles.map((item, idx) => ({ ...item, order: idx }));
    setFiles(withOrder);
  }, []);

  const validation = validateMergeFiles(files);
  const error = fileError || processingError || (validation.valid ? '' : validation.error);

  const handleDownload = useCallback(() => {
    if (result?.blob) {
      downloadBlob(result.blob, result.fileName);
    }
  }, [result]);

  return (
    <ToolLayout path="/media/merge">
      <TwoColumnLayout
        left={
          <div className="space-y-4">
            <ControlPanel title="Add Files">
              <FileUpload
                label="Upload Audio/Video"
                onFilesSelected={handleFilesSelected}
                accept="audio/*,video/*"
                multiple={true}
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Add at least {MERGE_MIN_FILES} files of same format to merge.
              </p>
            </ControlPanel>

            {files.length > 0 && (
              <DraggableList
                items={files}
                onReorder={reorderFiles}
                onRemove={removeFile}
                title={`Files Order (${files.length})`}
                renderMetadata={(item) => (
                  <>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {item.file.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {formatFileSize(item.file.size, 'MB')}
                    </p>
                  </>
                )}
                getItemKey={(item) => item.id}
              />
            )}

            <Button
              onClick={handleMerge}
              disabled={files.length < MERGE_MIN_FILES || !outputFormat || merging}
              className="w-full flex items-center justify-center"
            >
              {merging ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Merging...
                </>
              ) : (
                <>
                  <Layers className="w-4 h-4 mr-2" />
                  Merge Files
                </>
              )}
            </Button>
          </div>
        }
        right={
          <div className="space-y-4">
            {error && <ErrorAlert error={error} />}

            {merging && <ProgressBar progress={progress} label="Merging files..." />}

            {result && (
              <>
                <MediaPreview
                  file={previewFile}
                  url={previewUrl}
                  type={previewType}
                  emptyMessage={result ? 'Preview not available' : 'Upload media to preview the first file in the list.'}
                />
                <SuccessResult
                  title="Merge Complete!"
                  message={`${files.length} files merged • ${result.size}`}
                  onDownload={handleDownload}
                  downloadLabel="Download Merged File"
                />
              </>
            )}
          </div>
        }
      />
    </ToolLayout>
  );
}
