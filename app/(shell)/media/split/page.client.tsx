'use client';

import { useState, useCallback } from 'react';
import { Scissors, Loader, Trash2 } from 'lucide-react';
import { ToolLayout, ControlPanel, TwoColumnLayout, Button, Input, FileUpload, ErrorAlert, ProgressBar, SuccessResult } from '@/app/components/shared';
import { PROCESSING_CONFIG, DEFAULT_SEGMENT_DURATION, DEFAULT_SEGMENT_START } from '@/app/lib/constants';
import { validateFileFormat, validateSegments, downloadDataUrl, formatFileSize } from '@/app/lib/utils';
import { useFileUpload, useMediaProcessing } from '@/app/lib/hooks';
import { SplitSegment } from '@/app/lib/types';

export default function SplitPage() {
  const [duration, setDuration] = useState(0);
  const [segments, setSegments] = useState<SplitSegment[]>([]);

  const { file, error: fileError, handleFilesSelected } = useFileUpload<File>({
    accept: 'audio/*,video/*',
    validator: validateFileFormat,
    onFileSelected: (selectedFile) => {
      // Simulate getting duration
      setDuration(300); // 5 minutes
      // Initialize with one segment if empty
      if (segments.length === 0) {
        setSegments([
          { id: '1', startTime: DEFAULT_SEGMENT_START, endTime: DEFAULT_SEGMENT_DURATION, name: 'Segment 1' },
        ]);
      }
      return selectedFile;
    },
  });

  const {
    processing: splitting,
    progress,
    error: processingError,
    result,
    startProcessing,
  } = useMediaProcessing<{ count: number; totalSize: string }>({
    progressInterval: PROCESSING_CONFIG.SPLIT_PROGRESS_INTERVAL,
    progressIncrement: PROCESSING_CONFIG.SPLIT_PROGRESS_INCREMENT,
    processingDelay: PROCESSING_CONFIG.PROCESSING_DELAY,
    resetDelay: PROCESSING_CONFIG.RESET_DELAY,
  });

  const handleAddSegment = useCallback(() => {
    const newId = (Math.max(...segments.map((s) => parseInt(s.id) || 0), 0) + 1).toString();
    setSegments((prev) => [
      ...prev,
      {
        id: newId,
        startTime: DEFAULT_SEGMENT_START,
        endTime: DEFAULT_SEGMENT_DURATION,
        name: `Segment ${prev.length + 1}`,
      },
    ]);
  }, [segments]);

  const handleRemoveSegment = useCallback((id: string) => {
    if (segments.length > 1) {
      setSegments((prev) => prev.filter((s) => s.id !== id));
    }
  }, [segments.length]);

  const handleUpdateSegment = useCallback(
    (id: string, field: keyof SplitSegment, value: string) => {
      setSegments((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
    },
    []
  );

  const handleSplit = useCallback(async () => {
    if (!file) return;

    const validation = validateSegments(segments, duration);
    if (!validation.valid) {
      return;
    }

    await startProcessing(async () => {
      const totalSize = Math.round((file.size * segments.length * 0.3) / 1024 / 1024 * 100) / 100;

      return {
        count: segments.length,
        totalSize: `${totalSize}MB`,
      };
    });
  }, [file, segments, duration, startProcessing]);

  const validationError = file && segments.length > 0 ? validateSegments(segments, duration).error : undefined;
  const error = fileError || processingError || validationError;

  const handleDownload = useCallback(() => {
    if (result) {
      downloadDataUrl('data:text/plain;charset=utf-8,Mock file', `segments_${Date.now()}.zip`);
    }
  }, [result]);

  return (
    <ToolLayout
      icon={Scissors}
      title="Media Split"
      description="Split audio/video files into segments"
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

            <ControlPanel title="Segments">
              {segments.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400 py-4 text-center">
                  No segments added
                </p>
              ) : (
                <div className="space-y-3">
                  {segments.map((segment) => (
                    <div
                      key={segment.id}
                      className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Input
                          type="text"
                          value={segment.name}
                          onChange={(e) => handleUpdateSegment(segment.id, 'name', e.target.value)}
                          placeholder="Segment name"
                          className="flex-1 text-sm"
                        />
                        {segments.length > 1 && (
                          <Button
                            onClick={() => handleRemoveSegment(segment.id)}
                            variant="outline"
                            className="ml-2 p-1.5 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          type="text"
                          label="Start (MM:SS)"
                          value={segment.startTime}
                          onChange={(e) => handleUpdateSegment(segment.id, 'startTime', e.target.value)}
                          placeholder="00:00"
                          className="text-sm"
                        />
                        <Input
                          type="text"
                          label="End (MM:SS)"
                          value={segment.endTime}
                          onChange={(e) => handleUpdateSegment(segment.id, 'endTime', e.target.value)}
                          placeholder="00:30"
                          className="text-sm"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <Button
                onClick={handleAddSegment}
                variant="secondary"
                className="w-full mt-3"
              >
                + Add Segment
              </Button>
            </ControlPanel>

            <Button
              onClick={handleSplit}
              disabled={!file || splitting}
              className="w-full flex items-center justify-center"
            >
              {splitting ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Splitting...
                </>
              ) : (
                <>
                  <Scissors className="w-4 h-4 mr-2" />
                  Split Media
                </>
              )}
            </Button>
          </div>
        }
        right={
          <div className="space-y-4">
            {error && <ErrorAlert error={error} />}

            {splitting && <ProgressBar progress={progress} label="Splitting file..." />}

            {result && (
              <SuccessResult
                title="Split Complete!"
                message={`Created ${result.count} segments`}
                onDownload={handleDownload}
                downloadLabel="Download All"
              />
            )}

            <ControlPanel title="Help">
              <div className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
                <p className="font-medium">Time Format: MM:SS</p>
                <ul className="space-y-1 ml-2 text-xs">
                  <li>• 00:30 = 30 seconds</li>
                  <li>• 01:45 = 1 minute 45 seconds</li>
                  <li>• 05:00 = 5 minutes</li>
                </ul>
              </div>
            </ControlPanel>
          </div>
        }
      />
    </ToolLayout>
  );
}
