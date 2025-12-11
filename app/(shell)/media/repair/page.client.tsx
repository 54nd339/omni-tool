'use client';

import { useState, useCallback } from 'react';
import { Wrench, Loader } from 'lucide-react';
import { ToolLayout, ControlPanel, TwoColumnLayout, Button, FileUpload, ErrorAlert, ProgressBar, SuccessResult, RadioGroup } from '@/app/components/shared';
import { REPAIR_OPTIONS, PROCESSING_CONFIG } from '@/app/lib/constants';
import { RepairOperation } from '@/app/lib/types';
import { validateFileFormat, calculateCompressedSize, downloadDataUrl, formatFileSize } from '@/app/lib/utils';
import { useFileUpload, useMediaProcessing } from '@/app/lib/hooks';

export default function RepairPage() {
  const [operation, setOperation] = useState<RepairOperation>('repair');

  const { file, error: fileError, handleFilesSelected } = useFileUpload<File>({
    accept: 'audio/*,video/*',
    validator: validateFileFormat,
  });

  const {
    processing,
    progress,
    error: processingError,
    result,
    startProcessing,
  } = useMediaProcessing<{ fileName: string; originalSize: string; newSize: string; savings: string }>({
    progressInterval: PROCESSING_CONFIG.PROGRESS_INTERVAL,
    progressIncrement: PROCESSING_CONFIG.PROGRESS_INCREMENT,
    processingDelay: PROCESSING_CONFIG.PROCESSING_DELAY,
    resetDelay: PROCESSING_CONFIG.RESET_DELAY,
  });

  const error = fileError || processingError;

  const handleProcess = useCallback(async () => {
    if (!file) return;

    await startProcessing(async () => {
      const originalSize = (file.size / 1024 / 1024).toFixed(2);
      const { newSize, savings } = calculateCompressedSize(file.size, operation);
      const fileName = `processed_${file.name}`;

      return {
        fileName,
        originalSize: `${originalSize}MB`,
        newSize: `${newSize}MB`,
        savings: `${savings}%`,
      };
    });
  }, [file, operation, startProcessing]);

  const handleDownload = useCallback(() => {
    if (result) {
      downloadDataUrl('data:text/plain;charset=utf-8,Mock file', result.fileName);
    }
  }, [result]);

  const originalMb = file ? parseFloat((file.size / 1024 / 1024).toFixed(2)) : 0;
  const estimation = file ? calculateCompressedSize(file.size, operation) : null;
  const newSizeMb = estimation ? parseFloat(estimation.newSize) : 0;
  const savingsMb = file ? Math.max(0, originalMb - newSizeMb) : 0;
  const savingsPercent = estimation ? estimation.savings : '0';

  return (
    <ToolLayout
      icon={Wrench}
      title="Media Repair & Compress"
      description="Repair corrupted files and compress media"
    >
      <TwoColumnLayout
        left={
          <div className="space-y-4">
            <ControlPanel title="Select File">
              <FileUpload
                label="Upload Media File"
                onFilesSelected={handleFilesSelected}
                accept="audio/*,video/*"
                multiple={false}
              />
              {file && (
                <div className="mt-4 p-3 bg-slate-100 dark:bg-slate-900 rounded-lg">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {file.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Size: {formatFileSize(file.size, 'MB')}
                  </p>
                  {estimation && (
                    <>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                        Estimated after: {newSizeMb.toFixed(2)} MB
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                        Savings: {savingsMb.toFixed(2)} MB ({savingsPercent}%)
                      </p>
                    </>
                  )}
                </div>
              )}
            </ControlPanel>

            <ControlPanel title="Operation">
              <RadioGroup
                name="operation"
                options={Object.entries(REPAIR_OPTIONS).map(([key, option]) => ({
                  value: key,
                  label: option.label,
                  description: option.description,
                }))}
                value={operation}
                onChange={(value) => setOperation(value as RepairOperation)}
              />
            </ControlPanel>

            <Button
              onClick={handleProcess}
              disabled={!file || processing}
              className="w-full flex items-center justify-center"
            >
              {processing ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Wrench className="w-4 h-4 mr-2" />
                  Start Process
                </>
              )}
            </Button>
          </div>
        }
        right={
          <div className="space-y-4">
            <ErrorAlert error={error} />

            {processing && <ProgressBar progress={progress} label="Processing file..." />}

            {result && (
              <SuccessResult
                title="Complete!"
                message={`New size: ${result.newSize}`}
                onDownload={handleDownload}
                downloadLabel="Download File"
              />
            )}

            <ControlPanel title="Operations">
              <div className="text-sm text-slate-600 dark:text-slate-400 space-y-3">
                <div>
                  <p className="font-medium text-slate-700 dark:text-slate-300 mb-2">Available:</p>
                  <ul className="space-y-1 ml-2 text-xs">
                    <li>• Repair: Fix corrupted files</li>
                    <li>• Compress: Reduce file size</li>
                    <li>• Optimize: Balance quality/size</li>
                  </ul>
                </div>
              </div>
            </ControlPanel>
          </div>
        }
      />
    </ToolLayout>
  );
}
