import { useCallback, useState } from 'react';
import { computeHashes } from '@/app/lib/tools';
import { HashResults } from '@/app/lib/types';

export const useHashGenerator = () => {
  const [hashes, setHashes] = useState<HashResults | null>(null);
  const [loading, setLoading] = useState(false);

  const generate = useCallback((text: string) => {
    if (!text) {
      setHashes(null);
      return;
    }
    setLoading(true);
    try {
      const results = computeHashes(text);
      setHashes(results);
    } finally {
      setLoading(false);
    }
  }, []);

  return { hashes, loading, generate };
};
