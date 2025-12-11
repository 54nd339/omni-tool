'use client';

import { useState, useCallback } from 'react';
import { Layers, Loader } from 'lucide-react';
import { ToolLayout, ControlPanel, TwoColumnLayout, Button, FileUpload, DraggableList, ErrorAlert, ProgressBar, SuccessResult, Select } from '@/app/components/shared';
import { validateFileFormat, createMediaFileItem, calculateCompressedSize, downloadDataUrl, validateMergeFiles, formatFileSize } from '@/app/lib/utils';
import { useFileUpload, useMediaProcessing } from '@/app/lib/hooks';
import { MediaFileItem } from '@/app/lib/types';
import { SUPPORTED_FORMATS, PROCESSING_CONFIG, FILE_SIZE_CONFIG, MERGE_MIN_FILES } from '@/app/lib/constants';

export default function MergePage() {
  const [files, setFiles] = useState<MediaFileItem[]>([]);
  const [outputFormat, setOutputFormat] = useState('mp4');

  const { error: fileError, handleFilesSelected } = useFileUpload({
    accept: 'video/*',
    maxFiles: Infinity,
    validator: validateFileFormat,
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
  } = useMediaProcessing<{ fileName: string; size: string }>({
    progressInterval: PROCESSING_CONFIG.MERGE_PROGRESS_INTERVAL,
    progressIncrement: PROCESSING_CONFIG.MERGE_PROGRESS_INCREMENT,
    processingDelay: PROCESSING_CONFIG.PROCESSING_DELAY,
    resetDelay: PROCESSING_CONFIG.RESET_DELAY,
  });

  const handleMerge = useCallback(async () => {
    const validation = validateMergeFiles(files);
    if (!validation.valid) {
      // Error will be shown via ErrorAlert component
      return;
    }

    await startProcessing(async () => {
      const totalSize = files.reduce((sum, f) => sum + f.file.size, 0);
      const { newSize: mockSize } = calculateCompressedSize(totalSize, FILE_SIZE_CONFIG.MERGE_SIZE_RATIO);
      const fileName = `merged_video.${outputFormat}`;

      return {
        fileName,
        size: `${mockSize}MB`,
      };
    });
  }, [files, outputFormat, startProcessing]);

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index).map((f, idx) => ({ ...f, order: idx })));
  }, []);

  const reorderFiles = useCallback((reorderedFiles: MediaFileItem[]) => {
    const withOrder = reorderedFiles.map((item, idx) => ({ ...item, order: idx }));
    setFiles(withOrder);
  }, []);

  const error = fileError || processingError || (files.length > 0 && files.length < MERGE_MIN_FILES ? `Please add at least ${MERGE_MIN_FILES} files to merge` : '');

  const handleDownload = useCallback(() => {
    if (result) {
      downloadDataUrl('data:text/plain;charset=utf-8,Mock file', result.fileName);
    }
  }, [result]);

  return (
    <ToolLayout
      icon={Layers}
      title="Media Merge"
      description="Combine multiple audio/video files into one"
    >
      <TwoColumnLayout
        left={
          <div className="space-y-4">
            <ControlPanel title="Add Files">
              <FileUpload
                label="Upload Video Files"
                onFilesSelected={handleFilesSelected}
                accept="video/*"
                multiple={true}
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Add at least {MERGE_MIN_FILES} files to merge
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

            <ControlPanel title="Output Format">
              <Select
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value)}
                className="text-sm"
              >
                <option value="">Select format</option>
                <optgroup label="Video">
                  {SUPPORTED_FORMATS.video.map((fmt) => (
                    <option key={fmt} value={fmt}>
                      {fmt.toUpperCase()}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Audio">
                  {SUPPORTED_FORMATS.audio.map((fmt) => (
                    <option key={fmt} value={fmt}>
                      {fmt.toUpperCase()}
                    </option>
                  ))}
                </optgroup>
              </Select>
            </ControlPanel>

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
            <ErrorAlert error={error} />

            {merging && <ProgressBar progress={progress} label="Merging files..." />}

            {result && (
              <SuccessResult
                title="Merge Complete!"
                message={`${files.length} files merged • ${result.size}`}
                onDownload={handleDownload}
                downloadLabel="Download Merged File"
              />
            )}

            <ControlPanel title="Requirements">
              <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">✓</span>
                  <span>At least {MERGE_MIN_FILES} files</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">✓</span>
                  <span>Same format recommended</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">✓</span>
                  <span>Select output format</span>
                </li>
              </ul>
            </ControlPanel>
          </div>
        }
      />
    </ToolLayout>
  );
}
