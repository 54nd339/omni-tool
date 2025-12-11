import { useState, useEffect } from 'react';

/**
 * Hook to manage object URL lifecycle
 * Automatically revokes the URL when component unmounts or when a new URL is set
 */
export function useObjectUrl(file: File | Blob | null): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setUrl(objectUrl);

      return () => {
        URL.revokeObjectURL(objectUrl);
      };
    } else {
      setUrl(null);
    }
  }, [file]);

  return url;
}

