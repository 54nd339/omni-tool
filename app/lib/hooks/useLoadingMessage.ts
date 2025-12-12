import type { LoadingMessageResult } from '@/app/lib/types';
import { useAsyncOperation } from './useAsyncOperation';

/**
 * @deprecated Use useAsyncOperation({ feedbackType: 'message' }) instead
 * Hook to manage loading state with message feedback
 * This is now a wrapper around useAsyncOperation for backward compatibility
 */
export function useLoadingMessage(): LoadingMessageResult {
  const { loading, message, execute: baseExecute, setMessage, clearMessage } = useAsyncOperation<'message'>({
    feedbackType: 'message',
  });

  // Enhanced execute with success message support
  const execute = async <T,>(
    operation: () => Promise<T>,
    successMessage?: string | ((result: T) => string)
  ): Promise<T | null> => {
    setMessage('Processing...');
    const result = await baseExecute(operation);
    if (result !== null) {
      const finalMessage = successMessage
        ? typeof successMessage === 'function'
          ? successMessage(result)
          : successMessage
        : '✓ Operation completed successfully';
      setMessage(finalMessage);
    }
    return result;
  };

  return {
    loading,
    message,
    execute,
    setMessage,
    clearMessage,
  };
}
