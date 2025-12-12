import { useState, useCallback } from 'react';
import { PROCESSING_CONFIG } from '@/app/lib/constants';
import { simulateProgress, formatErrorMessage } from '@/app/lib/utils';
import type { MediaProcessingOptions, MediaProcessingResult } from '@/app/lib/types';

export function useMediaProcessing<T = any>(
  options: MediaProcessingOptions = {}
): MediaProcessingResult<T> {
  const {
    onComplete,
    onError,
    progressInterval = PROCESSING_CONFIG.PROGRESS_INTERVAL,
    progressIncrement = PROCESSING_CONFIG.PROGRESS_INCREMENT,
    processingDelay = PROCESSING_CONFIG.PROCESSING_DELAY,
    resetDelay = PROCESSING_CONFIG.RESET_DELAY,
    useRealProgress = false,
    onProgress: externalOnProgress,
  } = options;

  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [result, setResult] = useState<T | null>(null);

  const startProcessing = useCallback(
    async (processor: (onProgress?: (progress: number) => void) => Promise<T>) => {
      setProcessing(true);
      setError('');
      setProgress(0);

      try {
        let progressIntervalId: NodeJS.Timeout | null = null;

        // Use real progress if enabled, otherwise simulate
        const handleProgress = (progress: number) => {
          setProgress(progress);
          if (externalOnProgress) {
            externalOnProgress(progress);
          }
        };

        if (!useRealProgress) {
          // Simulate progress for backward compatibility
          progressIntervalId = simulateProgress(progressInterval, progressIncrement, setProgress);
          await new Promise((resolve) => setTimeout(resolve, processingDelay));
          if (progressIntervalId) clearInterval(progressIntervalId);
        }

        // Call processor with progress callback if using real progress
        const processingResult = useRealProgress
          ? await processor(handleProgress)
          : await processor();

        setProgress(100);
        setResult(processingResult);

        if (onComplete) {
          onComplete(processingResult);
        }

        if (resetDelay > 0) {
          setTimeout(() => {
            setProgress(0);
          }, resetDelay);
        }
      } catch (err) {
        const errorMessage = formatErrorMessage(err, 'Processing failed');
        setError(errorMessage);
        if (onError) {
          onError(err instanceof Error ? err : new Error(errorMessage));
        }
      } finally {
        setProcessing(false);
      }
    },
    [progressInterval, progressIncrement, processingDelay, resetDelay, onComplete, onError, useRealProgress, externalOnProgress]
  );

  const reset = useCallback(() => {
    setProcessing(false);
    setProgress(0);
    setError('');
    setResult(null);
  }, []);

  return {
    processing,
    progress,
    error,
    result,
    startProcessing,
    reset,
  };
}
