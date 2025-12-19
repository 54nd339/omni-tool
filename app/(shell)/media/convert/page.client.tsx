'use client';

import { useState, useCallback, useMemo } from 'react';
import { Repeat2 } from 'lucide-react';
import { ToolLayout, ControlPanel, TwoColumnLayout, FileUpload, Select, FileInfoCard, ProcessingButton, ProcessingResultPanel } from '@/app/components/shared';
import { validateMediaFile, downloadBlob, processMedia, calculateCompressedSize, combineErrors } from '@/app/lib/utils';
import { useFileUpload, useMediaProcessing } from '@/app/lib/hooks';
import { RepairOperation, ConvertMediaResult } from '@/app/lib/types';
import { FORMAT_OPTIONS, REPAIR_OPTIONS, MEDIA_FILE_ACCEPT, MEDIA_UPLOAD_LABEL, DEFAULT_MEDIA_PROCESSING_CONFIG } from '@/app/lib/constants';

export default function ConvertPage() {
  const [targetFormat, setTargetFormat] = useState('mp4');
  const [operation, setOperation] = useState<RepairOperation>('original');

  const { file, error: fileError, handleFilesSelected } = useFileUpload<File>({
    accept: MEDIA_FILE_ACCEPT,
    validator: validateMediaFile,
  });

  const {
    processing,
    progress,
    error: processingError,
    result,
    startProcessing,
  } = useMediaProcessing<ConvertMediaResult>({
    ...DEFAULT_MEDIA_PROCESSING_CONFIG,
  });

  const error = combineErrors(fileError, processingError);

  const estimation = useMemo(
    () => file ? calculateCompressedSize(file.size, operation) : null,
    [file, operation]
  );

  const sizeInfo = useMemo(() => {
    if (!estimation || !file) {
      return {
        originalMb: 0,
        newSizeMb: 0,
        savingsMb: 0,
        savingsPercent: '0',
      };
    }
    const originalMb = file.size / (1024 * 1024);
    const newSizeMb = parseFloat(estimation.newSize);
    return {
      originalMb,
      newSizeMb,
      savingsMb: Math.max(0, originalMb - newSizeMb),
      savingsPercent: estimation.savings,
    };
  }, [estimation, file]);

  const { originalMb, newSizeMb, savingsMb, savingsPercent } = sizeInfo;

  const videoFormats = useMemo(() => Object.keys(FORMAT_OPTIONS.video), []);
  const audioFormats = useMemo(() => Object.keys(FORMAT_OPTIONS.audio), []);
  const repairOptions = useMemo(() => Object.entries(REPAIR_OPTIONS), []);

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
                label={MEDIA_UPLOAD_LABEL}
                onFilesSelected={handleFilesSelected}
                accept={MEDIA_FILE_ACCEPT}
                multiple={false}
              />
              {file && (
                <FileInfoCard
                  fileName={file.name}
                  fileSize={file.size}
                  additionalInfo={
                    estimation && (
                      <>
                        <p>Estimated after operation: {newSizeMb.toFixed(2)} MB</p>
                        <p className="text-green-600 dark:text-green-400 font-medium">
                          Savings: {savingsMb.toFixed(2)} MB ({savingsPercent}%)
                        </p>
                      </>
                    )
                  }
                />
              )}
            </ControlPanel>

            <div className="grid gap-4 md:grid-cols-2">
              <ControlPanel title="Output Format">
                <Select
                  value={targetFormat}
                  onChange={(e) => setTargetFormat(e.target.value)}
                >
                  <optgroup label="Video Formats">
                    {videoFormats.map((fmt) => (
                      <option key={fmt} value={fmt}>
                        {fmt.toUpperCase()}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Audio Formats">
                    {audioFormats.map((fmt) => (
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
                  {repairOptions.map(([key, option]) => (
                    <option key={key} value={key}>
                      {option}
                    </option>
                  ))}
                </Select>
              </ControlPanel>
            </div>

            <ProcessingButton
              onClick={handleConvert}
              disabled={!file || !targetFormat}
              processing={processing}
              icon={<Repeat2 className="w-4 h-4 mr-2" />}
              label="Convert"
            />
          </div>
        }
        right={
          <ProcessingResultPanel
            error={error}
            processing={processing}
            progress={progress}
            progressLabel="Processing..."
            result={
              result
                ? {
                  title: result.operationApplied ? 'Conversion & Optimization Complete!' : 'Conversion Complete!',
                  message: result.details ?? `${result.fileName} • ${result.size}`,
                  onDownload: handleDownload,
                  downloadLabel: result.operationApplied ? 'Download Optimized File' : 'Download Converted File',
                }
                : null
            }
          />
        }
      />
    </ToolLayout>
  );
}
