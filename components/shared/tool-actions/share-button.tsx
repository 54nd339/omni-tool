'use client';

import { useCallback } from 'react';
import { Share2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useShare } from '@/hooks/use-share';

interface ShareButtonProps {
  blob: Blob | null;
  fileName: string;
  title?: string;
}

export function ShareButton({ blob, fileName, title }: ShareButtonProps) {
  const { share } = useShare();

  const handleShare = useCallback(() => {
    if (!blob) return;
    share({ blob, fileName, title });
  }, [blob, fileName, title, share]);

  if (!blob) return null;

  return (
    <Button variant="outline" size="sm" onClick={handleShare} aria-label="Share">
      <Share2 className="mr-1 h-3 w-3" /> Share
    </Button>
  );
}