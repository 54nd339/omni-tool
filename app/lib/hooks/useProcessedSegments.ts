import { useState, useEffect } from 'react';
import type { ProcessedSegment, UseProcessedSegmentsParams } from '@/app/lib/types';
import { isVideoFormat } from '@/app/lib/utils';

/**
 * Hook to extract and manage processed segments from a zip blob
 * Automatically handles URL creation and cleanup
 */
export function useProcessedSegments({ zipBlob, originalFileName }: UseProcessedSegmentsParams): ProcessedSegment[] {
  const [processedSegments, setProcessedSegments] = useState<ProcessedSegment[]>([]);

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
    let currentUrls: string[] = [];

    // Cleanup previous segments before extracting new ones
    setProcessedSegments((prev) => {
      prev.forEach((segment) => URL.revokeObjectURL(segment.url));
      return [];
    });

    const extractSegments = async () => {
      try {
        const JSZip = (await import('jszip')).default;
        const zip = await JSZip.loadAsync(zipBlob);

        // Get file extension from original file to determine type
        const inputExt = originalFileName?.split('.').pop()?.toLowerCase() || '';
        const segmentType: 'video' | 'audio' | null = inputExt ? (isVideoFormat(inputExt) ? 'video' : 'audio') : null;

        // Extract all files from zip
        const filePromises = Object.keys(zip.files).map(async (fileName) => {
          if (zip.files[fileName].dir) return null;

          const fileData = await zip.files[fileName].async('blob');
          const url = URL.createObjectURL(fileData);
          currentUrls.push(url);

          return {
            name: fileName,
            blob: fileData,
            url,
            type: segmentType,
          };
        });

        const extracted = (await Promise.all(filePromises)).filter((f): f is ProcessedSegment => f !== null);

        if (isMounted) {
          setProcessedSegments(extracted);
        } else {
          // Cleanup if component unmounted during extraction
          currentUrls.forEach((url) => URL.revokeObjectURL(url));
        }
      } catch (error) {
        console.error('Failed to extract segments from zip:', error);
        if (isMounted) {
          setProcessedSegments([]);
        }
        currentUrls.forEach((url) => URL.revokeObjectURL(url));
      }
    };

    extractSegments();

    // Cleanup URLs on unmount or when result changes
    return () => {
      isMounted = false;
      currentUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [zipBlob, originalFileName]);

  return processedSegments;
}
