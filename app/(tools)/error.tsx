'use client';

import { useCallback,useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';

export default function ToolError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const handleReset = useCallback(() => {
    const url = new URL(window.location.href);
    url.search = '';
    window.history.replaceState(null, '', url.toString());
    reset();
  }, [reset]);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center justify-center gap-4 py-24 text-center">
      <div className="rounded-full bg-muted p-3">
        <AlertCircle className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
      </div>
      <h1 className="text-lg font-semibold tracking-tight">
        This tool encountered an error
      </h1>
      <p className="text-sm text-muted-foreground">
        {error.message || 'Something went wrong while running this tool.'}
      </p>
      {process.env.NODE_ENV === 'development' && error.stack && (
        <pre className="max-h-40 w-full overflow-auto rounded-md bg-muted p-3 text-left text-xs text-muted-foreground">
          {error.stack}
        </pre>
      )}
      <div className="flex gap-3">
        <Button variant="outline" onClick={handleReset}>
          Reset tool
        </Button>
        <Button variant="outline" onClick={reset}>
          Try again
        </Button>
        <Link
          href="/"
          className="inline-flex h-9 items-center justify-center rounded-md px-4 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
