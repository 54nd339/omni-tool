import { useState, useEffect, useMemo } from 'react';
import type { ProcessedSegment, UseProcessedSegmentsParams } from '@/app/lib/types';
import { isVideoFormat } from '@/app/lib/utils';

/**
 * Hook to extract and manage processed segments from a zip blob
 * Automatically handles URL creation and cleanup
 */
export function useProcessedSegments({ zipBlob, originalFileName }: UseProcessedSegmentsParams): ProcessedSegment[] {
  const [processedSegments, setProcessedSegments] = useState<ProcessedSegment[]>([]);

  // Memoize segment type calculation
  const segmentType = useMemo(() => {
    if (!originalFileName) return null;
    const inputExt = originalFileName.split('.').pop()?.toLowerCase() || '';
    return inputExt ? (isVideoFormat(inputExt) ? 'video' : 'audio') : null;
  }, [originalFileName]);

  useEffect(() => {
    if (!zipBlob) {
      // Cleanup previous segments
      setProcessedSegments((prev) => {
        prev.forEach((segment) => URL.revokeObjectURL(segment.url));
        return [];
      });
      return;
    }

    let isMounted = true;

    const extractSegments = async () => {
      try {
        const JSZip = (await import('jszip')).default;
        const zip = await JSZip.loadAsync(zipBlob);

        // Extract all files from zip
        const filePromises = Object.keys(zip.files).map(async (fileName) => {
          if (zip.files[fileName].dir) return null;

          const fileData = await zip.files[fileName].async('blob');
          const url = URL.createObjectURL(fileData);

          return {
            name: fileName,
            blob: fileData,
            url,
            type: segmentType,
          };
        });

        const extracted = (await Promise.all(filePromises)).filter((f): f is ProcessedSegment => f !== null);

        if (isMounted) {
          // Cleanup previous segments before setting new ones
          setProcessedSegments((prev) => {
            prev.forEach((segment) => URL.revokeObjectURL(segment.url));
            return extracted;
          });
        } else {
          // Cleanup if component unmounted during extraction
          extracted.forEach((segment) => URL.revokeObjectURL(segment.url));
        }
      } catch (error) {
        console.error('Failed to extract segments from zip:', error);
        if (isMounted) {
          setProcessedSegments((prev) => {
            prev.forEach((segment) => URL.revokeObjectURL(segment.url));
            return [];
          });
        }
      }
    };

    extractSegments();

    // Cleanup on unmount
    return () => {
      isMounted = false;
    };
  }, [zipBlob, segmentType]);

  return processedSegments;
}
