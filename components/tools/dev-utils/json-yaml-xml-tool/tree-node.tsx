'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

import { CopyButton } from '@/components/shared/tool-actions/copy-button';
import { cn } from '@/lib/utils';

interface TreeNodeProps {
  label: string;
  value: unknown;
  depth: number;
  highlighted: boolean;
}

export function TreeNode({ label, value, depth, highlighted }: TreeNodeProps) {
  const [expanded, setExpanded] = useState(depth < 2);
  const isObject = value !== null && typeof value === 'object';
  const entries = isObject
    ? Array.isArray(value)
      ? value.map((nestedValue, index) => [String(index), nestedValue] as const)
      : Object.entries(value as Record<string, unknown>)
    : [];

  const typeColor =
    typeof value === 'string'
      ? 'text-green-600 dark:text-green-400'
      : typeof value === 'number'
        ? 'text-blue-600 dark:text-blue-400'
        : typeof value === 'boolean'
          ? 'text-purple-600 dark:text-purple-400'
          : value === null
            ? 'text-muted-foreground'
            : '';

  const preview = isObject
    ? Array.isArray(value)
      ? `[${value.length}]`
      : `{${Object.keys(value as object).length}}`
    : '';

  return (
    <div className={depth > 0 ? 'pl-4' : undefined}>
      <div
        className={cn(
          'group flex items-center gap-1 rounded-sm py-0.5 text-sm',
          highlighted && 'bg-yellow-100 dark:bg-yellow-900/30',
        )}
      >
        {isObject ? (
          <button
            onClick={() => setExpanded(!expanded)}
            className="shrink-0 text-muted-foreground"
            aria-label={expanded ? 'Collapse' : 'Expand'}
          >
            {expanded ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
          </button>
        ) : (
          <span className="w-3.5" />
        )}
        <span className="font-medium text-foreground">{label}</span>
        <span className="text-muted-foreground">:</span>
        {isObject ? (
          <span className="text-muted-foreground">{preview}</span>
        ) : (
          <span className={cn('truncate', typeColor)}>
            {typeof value === 'string' ? `"${value}"` : String(value)}
          </span>
        )}
        <CopyButton
          value={typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
          size="sm"
          className="ml-1 opacity-0 group-hover:opacity-100"
        />
      </div>
      {isObject && expanded && (
        <div>
          {entries.map(([key, nestedValue]) => (
            <TreeNode
              key={key}
              label={key}
              value={nestedValue}
              depth={depth + 1}
              highlighted={false}
            />
          ))}
        </div>
      )}
    </div>
  );
}
