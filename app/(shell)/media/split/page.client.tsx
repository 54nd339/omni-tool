'use client';

import { useState, useCallback, useMemo } from 'react';
import { Scissors, Trash2 } from 'lucide-react';
import { ToolLayout, ControlPanel, TwoColumnLayout, Button, Input, FileUpload, DoubleRangeSlider, MediaPreview, FileInfoCard, ProcessingButton, ProcessingResultPanel } from '@/app/components/shared';
import { validateMediaFile, validateSegments, downloadBlob, processSplit, getMediaDuration, timeToSeconds, secondsToTime, combineErrors, generateNextSegmentId } from '@/app/lib/utils';
import { useFileUpload, useMediaProcessing, useProcessedSegments, useSegmentRangeHandlers } from '@/app/lib/hooks';
import { SplitSegment, SplitMediaResult } from '@/app/lib/types';
import { DEFAULT_SEGMENT_DURATION, DEFAULT_SEGMENT_START, MEDIA_FILE_ACCEPT, MEDIA_UPLOAD_LABEL, DEFAULT_MEDIA_PROCESSING_CONFIG } from '@/app/lib/constants';

export default function SplitPage() {
  const [duration, setDuration] = useState(0);
  const [segments, setSegments] = useState<SplitSegment[]>([]);

  const { file, error: fileError, handleFilesSelected } = useFileUpload<File>({
    accept: MEDIA_FILE_ACCEPT,
    validator: validateMediaFile,
    onFileSelected: async (selectedFile) => {
      // Get actual media duration
      try {
        const actualDuration = await getMediaDuration(selectedFile);
        setDuration(actualDuration);
      } catch (error) {
        // Silently fallback to 5 minutes if duration detection fails
        setDuration(300);
      }
      // Initialize with one segment if empty
      setSegments((prev) => {
        if (prev.length === 0) {
          return [
            { id: '1', startTime: DEFAULT_SEGMENT_START, endTime: DEFAULT_SEGMENT_DURATION, name: 'Segment 1' },
          ];
        }
        return prev;
      });
      return selectedFile;
    },
  });

  const totalDuration = useMemo(
    () => Math.max(duration, timeToSeconds(DEFAULT_SEGMENT_DURATION)),
    [duration]
  );

  const {
    processing: splitting,
    progress,
    error: processingError,
    result,
    startProcessing,
  } = useMediaProcessing<SplitMediaResult>({
    ...DEFAULT_MEDIA_PROCESSING_CONFIG,
  });

  const processedSegments = useProcessedSegments({
    zipBlob: result?.zipBlob,
    originalFileName: file?.name,
  });

  const handleAddSegment = useCallback(() => {
    const newId = generateNextSegmentId(segments);
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
    setSegments((prev) => {
      if (prev.length > 1) {
        return prev.filter((s) => s.id !== id);
      }
      return prev;
    });
  }, []);

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

  const validation = useMemo(
    () => file && segments.length > 0 ? validateSegments(segments, duration) : { valid: true },
    [file, segments, duration]
  );

  const handleSplit = useCallback(async () => {
    if (!file) return;

    if (!validation.valid) {
      return;
    }

    await startProcessing(async (onProgress) => {
      return await processSplit(file, segments, onProgress);
    });
  }, [file, segments, startProcessing, validation.valid]);

  const validationError = validation.valid ? undefined : validation.error;
  const error = combineErrors(fileError, processingError, validationError);

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
                    <p>Duration: {secondsToTime(duration)}</p>
                  }
                />
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

            <ProcessingButton
              onClick={handleSplit}
              disabled={!file}
              processing={splitting}
              icon={<Scissors className="w-4 h-4 mr-2" />}
              label="Split Media"
              processingLabel="Splitting..."
            />
          </div>
        }
        right={
          <ProcessingResultPanel
            error={error}
            processing={splitting}
            progress={progress}
            progressLabel="Splitting file..."
            result={
              result && processedSegments.length > 0
                ? {
                    title: 'Split Complete!',
                    message: `Created ${result.count} segments`,
                    onDownload: handleDownload,
                    downloadLabel: 'Download All',
                  }
                : null
            }
          >
            {result && processedSegments.length > 0 && (
              <ControlPanel title={`Processed Segments (${processedSegments.length})`}>
                <div className="space-y-4">
                  {processedSegments.map((segment, index) => (
                    <div key={`${segment.name}-${index}`} className="space-y-2">
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
            )}
          </ProcessingResultPanel>
        }
      />
    </ToolLayout>
  );
}
