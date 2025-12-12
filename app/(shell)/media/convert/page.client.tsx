'use client';

import { useState, useCallback } from 'react';
import { Repeat2, Loader } from 'lucide-react';
import { ToolLayout, ControlPanel, TwoColumnLayout, Button, FileUpload, ErrorAlert, ProgressBar, SuccessResult, Select } from '@/app/components/shared';
import { validateMediaFile, formatFileSize, downloadBlob, processMedia, calculateCompressedSize } from '@/app/lib/utils';
import { useFileUpload, useMediaProcessing } from '@/app/lib/hooks';
import { RepairOperation } from '@/app/lib/types';
import { FORMAT_OPTIONS, PROCESSING_CONFIG, REPAIR_OPTIONS } from '@/app/lib/constants';

export default function ConvertPage() {
  const [targetFormat, setTargetFormat] = useState('mp4');
  const [operation, setOperation] = useState<RepairOperation>('original');

  const { file, error: fileError, handleFilesSelected } = useFileUpload<File>({
    accept: 'audio/*,video/*',
    validator: validateMediaFile,
  });

  const {
    processing,
    progress,
    error: processingError,
    result,
    startProcessing,
  } = useMediaProcessing<{ fileName: string; size: string; blob: Blob; details?: string; operationApplied?: boolean }>({
    useRealProgress: true,
    resetDelay: PROCESSING_CONFIG.RESET_DELAY,
  });

  const error = fileError || processingError;

  const estimation = file ? calculateCompressedSize(file.size, operation) : null;
  const originalMb = file ? parseFloat((file.size / 1024 / 1024).toFixed(2)) : 0;
  const newSizeMb = estimation ? parseFloat(estimation.newSize) : 0;
  const savingsMb = file ? Math.max(0, originalMb - newSizeMb) : 0;
  const savingsPercent = estimation ? estimation.savings : '0';

  const handleConvert = useCallback(async () => {
    if (!file || !targetFormat) return;

    await startProcessing(async (onProgress) => {
      return await processMedia(file, targetFormat, operation, onProgress);
    });
  }, [file, targetFormat, operation, startProcessing]);

  const handleDownload = useCallback(() => {
    if (result?.blob) {
      downloadBlob(result.blob, result.fileName);
    }
  }, [result]);

  return (
    <ToolLayout path="/media/convert">
      <TwoColumnLayout
        left={
          <div className="space-y-4">
            <ControlPanel title="Select File">
              <FileUpload
                label="Upload Audio/Video"
                onFilesSelected={handleFilesSelected}
                accept="audio/*,video/*"
                multiple={false}
              />
              {file && (
                <div className="mt-4 p-3 bg-slate-100 dark:bg-slate-900 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div className="text-left">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {file.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {formatFileSize(file.size, 'MB')}
                      </p>
                    </div>

                    {estimation && (
                      <div className="text-right text-xs text-slate-500 dark:text-slate-400">
                        <p>Estimated after operation: {newSizeMb.toFixed(2)} MB</p>
                        <p className="text-green-600 dark:text-green-400 font-medium">
                          Savings: {savingsMb.toFixed(2)} MB ({savingsPercent}%)
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </ControlPanel>

            <div className="grid gap-4 md:grid-cols-2">
              <ControlPanel title="Output Format">
                <Select
                  value={targetFormat}
                  onChange={(e) => setTargetFormat(e.target.value)}
                >
                  <optgroup label="Video Formats">
                    {Object.keys(FORMAT_OPTIONS.video).map((fmt) => (
                      <option key={fmt} value={fmt}>
                        {fmt.toUpperCase()}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Audio Formats">
                    {Object.keys(FORMAT_OPTIONS.audio).map((fmt) => (
                      <option key={fmt} value={fmt}>
                        {fmt.toUpperCase()}
                      </option>
                    ))}
                  </optgroup>
                </Select>
              </ControlPanel>

              <ControlPanel title="Operation">
                <Select
                  value={operation}
                  onChange={(e) => setOperation(e.target.value as RepairOperation)}
                >
                  {Object.entries(REPAIR_OPTIONS).map(([key, option]) => (
                    <option key={key} value={key}>
                      {option}
                    </option>
                  ))}
                </Select>
              </ControlPanel>
            </div>

            <div>
              <Button
                onClick={handleConvert}
                disabled={!file || !targetFormat || processing}
                className="w-full flex items-center justify-center"
              >
                {processing ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Repeat2 className="w-4 h-4 mr-2" />
                    Convert
                  </>
                )}
              </Button>
            </div>
          </div>
        }
        right={
          <div className="space-y-4">
            <ErrorAlert error={error} />
            {processing && (
              <ProgressBar progress={progress} label="Processing..." />
            )}

            {result && (
              <SuccessResult
                title={result.operationApplied ? 'Conversion & Optimization Complete!' : 'Conversion Complete!'}
                message={result.details ?? `${result.fileName} • ${result.size}`}
                onDownload={handleDownload}
                downloadLabel={result.operationApplied ? 'Download Optimized File' : 'Download Converted File'}
              />
            )}
          </div>
        }
      />
    </ToolLayout>
  );
}
