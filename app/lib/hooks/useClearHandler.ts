import { useCallback } from 'react';

export interface ClearHandlerOptions {
  clearFiles?: () => void;
  onClear?: () => void;
}

/**
 * Hook to create a standardized clear/reset handler
 * Combines clearFiles from useFileUpload with additional cleanup callbacks
 */
export function useClearHandler(options: ClearHandlerOptions = {}) {
  const { clearFiles, onClear } = options;

  const handleClear = useCallback(() => {
    if (clearFiles) {
      clearFiles();
    }
    if (onClear) {
      onClear();
    }
  }, [clearFiles, onClear]);

  return { handleClear };
}

