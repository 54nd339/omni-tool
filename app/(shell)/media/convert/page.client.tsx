'use client';

import { useState, useCallback } from 'react';
import { Repeat2, Loader } from 'lucide-react';
import { ToolLayout, ControlPanel, TwoColumnLayout, Button, FileUpload, ErrorAlert, ProgressBar, SuccessResult, Select, RadioGroup } from '@/app/components/shared';
import { validateFileFormat, isVideoFormat, isAudioFormat, getNewFileName, calculateCompressedSize, downloadDataUrl, formatFileSize } from '@/app/lib/utils';
import { useFileUpload, useMediaProcessing } from '@/app/lib/hooks';
import { QualityLevel } from '@/app/lib/types';
import { SUPPORTED_FORMATS, FORMAT_OPTIONS, FILE_SIZE_CONFIG, PROCESSING_CONFIG } from '@/app/lib/constants';

export default function ConvertPage() {
  const [targetFormat, setTargetFormat] = useState('mp4');
  const [quality, setQuality] = useState<QualityLevel>('high');

  const { file, error: fileError, handleFilesSelected } = useFileUpload<File>({
    accept: 'audio/*,video/*',
    validator: validateFileFormat,
  });

  const {
    processing: converting,
    progress,
    error: processingError,
    result,
    startProcessing,
  } = useMediaProcessing<{ fileName: string; size: string }>({
    progressInterval: PROCESSING_CONFIG.PROGRESS_INTERVAL,
    progressIncrement: PROCESSING_CONFIG.PROGRESS_INCREMENT,
    processingDelay: PROCESSING_CONFIG.PROCESSING_DELAY,
    resetDelay: PROCESSING_CONFIG.RESET_DELAY,
  });

  const error = fileError || processingError;

  const handleConvert = useCallback(async () => {
    if (!file) return;

    await startProcessing(async () => {
      const { newSize: mockSize } = calculateCompressedSize(file.size, FILE_SIZE_CONFIG.CONVERT_SIZE_RATIO);
      const fileName = getNewFileName(file.name, targetFormat);

      return {
        fileName,
        size: `${mockSize}MB`,
      };
    });
  }, [file, targetFormat, startProcessing]);

  const handleDownload = useCallback(() => {
    if (result) {
      downloadDataUrl('data:text/plain;charset=utf-8,Mock file', result.fileName);
    }
  }, [result]);

  const isVideo = isVideoFormat(targetFormat);
  const isAudio = isAudioFormat(targetFormat);

  return (
    <ToolLayout
      icon={Repeat2}
      title="Format Converter"
      description="Convert audio and video between formats"
    >
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
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {file.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {formatFileSize(file.size, 'MB')}
                  </p>
                </div>
              )}
            </ControlPanel>

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

            {isVideo && (
              <ControlPanel title="Quality">
                <RadioGroup
                        name="quality"
                  value={quality}
                  onChange={(value) => setQuality(value as QualityLevel)}
                  options={(['low', 'medium', 'high'] as QualityLevel[]).map((q) => ({
                    value: q,
                    label: q.charAt(0).toUpperCase() + q.slice(1),
                  }))}
                />
              </ControlPanel>
            )}

            <Button
              onClick={handleConvert}
              disabled={!file || converting}
              className="w-full flex items-center justify-center"
            >
              {converting ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Converting...
                </>
              ) : (
                <>
                  <Repeat2 className="w-4 h-4 mr-2" />
                  Convert
                </>
              )}
            </Button>
          </div>
        }
        right={
          <div className="space-y-4">
            <ErrorAlert error={error} />

            {converting && <ProgressBar progress={progress} label="Converting..." />}

            {result && (
              <SuccessResult
                title="Conversion Complete!"
                message={`${result.fileName} • ${result.size}`}
                onDownload={handleDownload}
                downloadLabel="Download"
              />
            )}

            <ControlPanel title="Supported Formats">
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase mb-2">
                    Video
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {SUPPORTED_FORMATS.video.join(', ')}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase mb-2">
                    Audio
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {SUPPORTED_FORMATS.audio.join(', ')}
                  </p>
                </div>
              </div>
            </ControlPanel>
          </div>
        }
      />
    </ToolLayout>
  );
}
