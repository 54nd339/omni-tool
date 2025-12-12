'use client';

import { useState, useCallback, useMemo } from 'react';
import { Layers } from 'lucide-react';
import { ToolLayout, ControlPanel, TwoColumnLayout, FileUpload, DraggableList, MediaPreview, ProcessingButton, ProcessingResultPanel } from '@/app/components/shared';
import { validateMediaFile, createMediaFileItem, validateMergeFiles, formatFileSize, downloadBlob, processMerge, getMediaPreviewType, combineErrors } from '@/app/lib/utils';
import { useFileUpload, useMediaProcessing, useObjectUrl } from '@/app/lib/hooks';
import { MediaFileItem, MergeMediaResult } from '@/app/lib/types';
import { MERGE_MIN_FILES, MEDIA_FILE_ACCEPT, MEDIA_UPLOAD_LABEL, DEFAULT_MEDIA_PROCESSING_CONFIG } from '@/app/lib/constants';

export default function MergePage() {
  const [files, setFiles] = useState<MediaFileItem[]>([]);
  const [outputFormat, setOutputFormat] = useState('mp4');

  const { error: fileError, handleFilesSelected } = useFileUpload({
    accept: MEDIA_FILE_ACCEPT,
    maxFiles: Infinity,
    validator: validateMediaFile,
    onFilesSelected: async (droppedFiles: File[]) => {
      let newItems: MediaFileItem[] = [];
      setFiles((prev) => {
        newItems = droppedFiles.map((selectedFile, idx) =>
          createMediaFileItem(selectedFile, prev.length + idx)
        );
        return [...prev, ...newItems];
      });
      return newItems;
    },
  });

  const {
    processing: merging,
    progress,
    error: processingError,
    result,
    startProcessing,
  } = useMediaProcessing<MergeMediaResult>({
    ...DEFAULT_MEDIA_PROCESSING_CONFIG,
  });

  // Preview the processed file if available, otherwise preview the first uploaded file
  const previewFile = result?.blob ?? files[0]?.file ?? null;
  const previewUrl = useObjectUrl(previewFile);
  const previewType = getMediaPreviewType(previewFile, result?.blob ? outputFormat : undefined);

  const validation = useMemo(() => validateMergeFiles(files), [files]);

  const handleMerge = useCallback(async () => {
    if (!validation.valid) {
      return;
    }

    await startProcessing(async (onProgress) => {
      return await processMerge(files, outputFormat, onProgress);
    });
  }, [files, outputFormat, startProcessing, validation.valid]);

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index).map((f, idx) => ({ ...f, order: idx })));
  }, []);

  const reorderFiles = useCallback((reorderedFiles: MediaFileItem[]) => {
    const withOrder = reorderedFiles.map((item, idx) => ({ ...item, order: idx }));
    setFiles(withOrder);
  }, []);

  const error = combineErrors(fileError, processingError, validation.valid ? undefined : validation.error);

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
                label={MEDIA_UPLOAD_LABEL}
                onFilesSelected={handleFilesSelected}
                accept={MEDIA_FILE_ACCEPT}
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

            <ProcessingButton
              onClick={handleMerge}
              disabled={files.length < MERGE_MIN_FILES || !outputFormat}
              processing={merging}
              icon={<Layers className="w-4 h-4 mr-2" />}
              label="Merge Files"
              processingLabel="Merging..."
            />
          </div>
        }
        right={
          <ProcessingResultPanel
            error={error}
            processing={merging}
            progress={progress}
            progressLabel="Merging files..."
            result={
              result
                ? {
                    title: 'Merge Complete!',
                    message: `${files.length} files merged • ${result.size}`,
                    onDownload: handleDownload,
                    downloadLabel: 'Download Merged File',
                  }
                : null
            }
          >
            {result && (
              <MediaPreview
                file={previewFile}
                url={previewUrl}
                type={previewType}
                emptyMessage={result ? 'Preview not available' : 'Upload media to preview the first file in the list.'}
              />
            )}
          </ProcessingResultPanel>
        }
      />
    </ToolLayout>
  );
}
