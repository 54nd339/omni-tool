import { useState, useCallback } from 'react';
import { formatErrorMessage } from '@/app/lib/utils';
import type { FeedbackType, AsyncOperationResult, AsyncOperationOptions } from '@/app/lib/types';

/**
 * Unified hook to manage async operation with configurable feedback type
 * @param options - Configuration options
 * @param options.feedbackType - 'error' for error state, 'message' for message feedback (default: 'error')
 * @returns Object with loading state, execute function, and feedback (error or message)
 */
export function useAsyncOperation<TFeedback extends FeedbackType = 'error'>(
  options: AsyncOperationOptions = {}
): AsyncOperationResult<TFeedback> {
  const { feedbackType = 'error' as TFeedback } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  const execute = useCallback(
    async <T, TArgs extends any[] = []>(
      operation: (...args: TArgs) => Promise<T>,
      ...args: TArgs
    ): Promise<T | null> => {
      setLoading(true);
      if (feedbackType === 'error') {
        setError(null);
      } else {
        setMessage('Processing...');
      }

      try {
        const result = await operation(...args);
        if (feedbackType === 'message') {
          setMessage('✓ Operation completed successfully');
        }
        return result;
      } catch (err) {
        const errorMessage = formatErrorMessage(err, 'An unknown error occurred');
        if (feedbackType === 'error') {
          setError(errorMessage);
        } else {
          setMessage(`Error: ${errorMessage}`);
        }
        return null;
      } finally {
        setLoading(false);
      }
    },
    [feedbackType]
  );

  const clearMessage = useCallback(() => {
    setMessage('');
  }, []);

  if (feedbackType === 'error') {
    return {
      loading,
      error,
      execute,
      setError,
    } as AsyncOperationResult<TFeedback>;
  } else {
    return {
      loading,
      message,
      execute,
      setMessage,
      clearMessage,
    } as AsyncOperationResult<TFeedback>;
  }
}
