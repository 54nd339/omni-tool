import type { Change } from 'diff';

import { CopyButton } from '@/components/shared/tool-actions/copy-button';
import { generateUnifiedDiff } from '@/lib/dev-utils/diff-checker';
import { cn } from '@/lib/utils';
import type { DiffMode } from '@/types/common';

interface SimpleDiffOutputProps {
  changes: Change[];
  jsonError: string | null;
  left: string;
  mode: DiffMode;
  right: string;
}

export function SimpleDiffOutput({ changes, jsonError, left, mode, right }: SimpleDiffOutputProps) {
  return (
    <>
      {!left && !right && (
        <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-border py-12 text-center">
          <p className="text-sm font-medium text-muted-foreground">Paste text on both sides to compare</p>
          <p className="mt-1 text-xs text-muted-foreground/70">Supports line, word, character, sentence, and JSON semantic diff</p>
        </div>
      )}

      {jsonError && (
        <div className="rounded-md border border-amber-500/50 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:bg-amber-950/20 dark:text-amber-400">
          Parse error (falling back to text diff): {jsonError}
        </div>
      )}

      {changes.length > 0 && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">Diff output</p>
            <CopyButton value={generateUnifiedDiff(changes)} size="sm" className="h-6 w-6" />
          </div>
          <div className="overflow-x-auto rounded-md border border-border p-4 font-mono text-sm">
            {changes.map((part, index) => (
              <span
                key={index}
                className={cn(
                  part.added && 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
                  part.removed && 'bg-red-100 text-red-800 line-through dark:bg-red-900/30 dark:text-red-300',
                )}
              >
                {mode === 'line'
                  ? part.value.split('\n').map((line, lineIndex, lines) =>
                    line || lineIndex < lines.length - 1 ? (
                      <div key={lineIndex}>
                        {part.added && '+ '}
                        {part.removed && '- '}
                        {!part.added && !part.removed && '  '}
                        {line}
                      </div>
                    ) : null,
                  )
                  : part.value}
              </span>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
