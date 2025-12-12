import { useCallback } from 'react';
import { UseSegmentRangeHandlersParams } from '@/app/lib/types';
import { timeToSeconds, secondsToTime } from '@/app/lib/utils';

/**
 * Hook to handle segment time range changes (start/end) for media split functionality
 * Provides handlers for updating segment start and end times with proper validation
 */
export function useSegmentRangeHandlers({
  segments,
  setSegments,
  totalDuration,
}: UseSegmentRangeHandlersParams) {
  const handleStartChange = useCallback(
    (id: string, value: number) => {
      setSegments((prev) =>
        prev.map((segment) => {
          if (segment.id !== id) return segment;
          const maxStart = Math.max(totalDuration - 1, 0);
          const clampedStart = Math.max(0, Math.min(value, maxStart));
          let endSeconds = timeToSeconds(segment.endTime);
          const maxEnd = Math.max(totalDuration, clampedStart + 1);
          if (endSeconds <= clampedStart) {
            endSeconds = Math.min(clampedStart + 1, maxEnd);
          } else {
            endSeconds = Math.min(endSeconds, maxEnd);
          }
          return {
            ...segment,
            startTime: secondsToTime(clampedStart),
            endTime: secondsToTime(Math.max(endSeconds, clampedStart + 1)),
          };
        })
      );
    },
    [setSegments, totalDuration]
  );

  const handleEndChange = useCallback(
    (id: string, value: number) => {
      setSegments((prev) =>
        prev.map((segment) => {
          if (segment.id !== id) return segment;
          const startSeconds = timeToSeconds(segment.startTime);
          const minEnd = startSeconds + 1;
          const clampedEnd = Math.max(minEnd, Math.min(value, totalDuration));
          return {
            ...segment,
            endTime: secondsToTime(clampedEnd),
          };
        })
      );
    },
    [setSegments, totalDuration]
  );

  return { handleStartChange, handleEndChange };
}
