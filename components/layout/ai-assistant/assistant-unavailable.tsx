'use client';

import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export function AssistantUnavailable() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
      <Sparkles className="h-12 w-12 text-muted-foreground/50" />
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          The AI Assistant uses Chrome&apos;s built-in Prompt API (Gemini Nano).
        </p>
        <p className="text-sm text-muted-foreground">
          You need Chrome 131+ with the Prompt API flag enabled.
        </p>
        <Link
          href="chrome://flags/#prompt-api-for-gemini-nano"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-accent underline hover:no-underline"
        >
          chrome://flags/#prompt-api-for-gemini-nano
        </Link>
      </div>
    </div>
  );
}