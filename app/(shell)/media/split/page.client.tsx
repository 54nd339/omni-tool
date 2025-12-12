'use client';

import { useState, useCallback } from 'react';
import { Scissors, Loader, Trash2 } from 'lucide-react';
import { ToolLayout, ControlPanel, TwoColumnLayout, Button, Input, FileUpload, ErrorAlert, ProgressBar, SuccessResult, DoubleRangeSlider, MediaPreview } from '@/app/components/shared';
import { PROCESSING_CONFIG, DEFAULT_SEGMENT_DURATION, DEFAULT_SEGMENT_START } from '@/app/lib/constants';
import { validateMediaFile, validateSegments, formatFileSize, downloadBlob, processSplit, getMediaDuration, timeToSeconds, secondsToTime } from '@/app/lib/utils';
import { useFileUpload, useMediaProcessing, useProcessedSegments, useSegmentRangeHandlers } from '@/app/lib/hooks';
import { SplitSegment } from '@/app/lib/types';

export default function SplitPage() {
  const [duration, setDuration] = useState(0);
  const [segments, setSegments] = useState<SplitSegment[]>([]);

  const { file, error: fileError, handleFilesSelected } = useFileUpload<File>({
    accept: 'audio/*,video/*',
    validator: validateMediaFile,
    onFileSelected: async (selectedFile) => {
      // Get actual media duration
      try {
        const actualDuration = await getMediaDuration(selectedFile);
        setDuration(actualDuration);
      } catch (error) {
        console.error('Failed to get media duration:', error);
        setDuration(300); // Fallback to 5 minutes
      }
      // Initialize with one segment if empty
      if (segments.length === 0) {
        setSegments([
          { id: '1', startTime: DEFAULT_SEGMENT_START, endTime: DEFAULT_SEGMENT_DURATION, name: 'Segment 1' },
        ]);
      }
      return selectedFile;
    },
  });

  const totalDuration = Math.max(duration, timeToSeconds(DEFAULT_SEGMENT_DURATION));

  const {
    processing: splitting,
    progress,
    error: processingError,
    result,
    startProcessing,
  } = useMediaProcessing<{ count: number; totalSize: string; zipBlob: Blob }>({
    useRealProgress: true,
    resetDelay: PROCESSING_CONFIG.RESET_DELAY,
  });

  const processedSegments = useProcessedSegments({
    zipBlob: result?.zipBlob,
    originalFileName: file?.name,
  });

  const handleAddSegment = useCallback(() => {
    const newId = (Math.max(...segments.map((s) => parseInt(s.id) || 0), 0) + 1).toString();
    const startSeconds = timeToSeconds(DEFAULT_SEGMENT_START);
    const defaultDurationSeconds = timeToSeconds(DEFAULT_SEGMENT_DURATION);
    const availableDuration = Math.max(duration, defaultDurationSeconds);
    const safeEndSeconds = Math.max(startSeconds + 1, Math.min(availableDuration, defaultDurationSeconds));

    setSegments((prev) => [
      ...prev,
      {
        id: newId,
        startTime: secondsToTime(startSeconds),
        endTime: secondsToTime(safeEndSeconds),
        name: `Segment ${prev.length + 1}`,
      },
    ]);
  }, [segments, duration]);

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

  const { handleStartChange, handleEndChange } = useSegmentRangeHandlers({
    segments,
    setSegments,
    totalDuration,
  });

  const handleSplit = useCallback(async () => {
    if (!file) return;

    const validation = validateSegments(segments, duration);
    if (!validation.valid) {
      return;
    }

    await startProcessing(async (onProgress) => {
      return await processSplit(file, segments, onProgress);
    });
  }, [file, segments, duration, startProcessing]);

  const validationError = file && segments.length > 0 ? validateSegments(segments, duration).error : undefined;
  const error = fileError || processingError || validationError;

  const handleDownload = useCallback(() => {
    if (result?.zipBlob) {
      downloadBlob(result.zipBlob, `segments_${Date.now()}.zip`);
    }
  }, [result]);

  return (
    <ToolLayout path="/media/split">
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
                    {formatFileSize(file.size, 'MB')} • Duration: {Math.floor(duration / 60)}:{String(duration % 60).padStart(2, '0')}
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
                  {segments.map((segment) => {
                    const startSeconds = timeToSeconds(segment.startTime);
                    const endSeconds = timeToSeconds(segment.endTime);

                    return (
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
                        <DoubleRangeSlider
                          label="Time Range"
                          startValue={startSeconds}
                          endValue={endSeconds}
                          min={0}
                          max={totalDuration}
                          step={1}
                          startDisplayValue={segment.startTime}
                          endDisplayValue={segment.endTime}
                          onStartChange={(value) => handleStartChange(segment.id, value)}
                          onEndChange={(value) => handleEndChange(segment.id, value)}
                        />
                      </div>
                    );
                  })}
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

            {result && processedSegments.length > 0 && (
              <div className="space-y-4">
                <ControlPanel title={`Processed Segments (${processedSegments.length})`}>
                  <div className="space-y-4">
                    {processedSegments.map((segment, index) => (
                      <div key={index} className="space-y-2">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {segment.name}
                        </p>
                        <MediaPreview
                          file={segment.blob}
                          url={segment.url}
                          type={segment.type}
                          emptyMessage="Preview not available"
                        />
                      </div>
                    ))}
                  </div>
                </ControlPanel>

                <SuccessResult
                  title="Split Complete!"
                  message={`Created ${result.count} segments`}
                  onDownload={handleDownload}
                  downloadLabel="Download All"
                />
              </div>
            )}
          </div>
        }
      />
    </ToolLayout>
  );
}
