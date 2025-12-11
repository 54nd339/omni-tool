import { useState, useCallback } from 'react';
import { PROCESSING_CONFIG } from '@/app/lib/constants';
import { simulateProgress, formatErrorMessage } from '@/app/lib/utils';

export interface MediaProcessingOptions {
  onComplete?: (result: any) => void;
  onError?: (error: Error) => void;
  progressInterval?: number;
  progressIncrement?: number;
  processingDelay?: number;
  resetDelay?: number;
}

export interface MediaProcessingResult<T = any> {
  processing: boolean;
  progress: number;
  error: string;
  result: T | null;
  startProcessing: (processor: () => Promise<T>) => Promise<void>;
  reset: () => void;
}

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
  } = options;

  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [result, setResult] = useState<T | null>(null);

  const startProcessing = useCallback(
    async (processor: () => Promise<T>) => {
      setProcessing(true);
      setError('');
      setProgress(0);

      try {
        const progressIntervalId = simulateProgress(progressInterval, progressIncrement, setProgress);

        await new Promise((resolve) => setTimeout(resolve, processingDelay));
        clearInterval(progressIntervalId);

        const processingResult = await processor();
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
    [progressInterval, progressIncrement, processingDelay, resetDelay, onComplete, onError]
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

