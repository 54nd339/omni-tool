'use client';

import { Clock, FolderOpen, Import, Terminal } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';
import { CODE_TARGETS, type CodeTarget } from '@/lib/dev-utils/code-generators';

interface RestToolbarProps {
  historyCount: number;
  onCopyAs: (target: CodeTarget) => void;
  onToggleCollections: () => void;
  onToggleCurlImport: () => void;
  onToggleHistory: () => void;
}

export function RestToolbar({
  historyCount,
  onCopyAs,
  onToggleCollections,
  onToggleCurlImport,
  onToggleHistory,
}: RestToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="outline" size="sm" onClick={onToggleCollections}>
        <FolderOpen className="mr-1.5 h-3.5 w-3.5" />
        Collections
      </Button>
      <Button variant="outline" size="sm" onClick={onToggleHistory}>
        <Clock className="mr-1.5 h-3.5 w-3.5" />
        History{historyCount > 0 && ` (${historyCount})`}
      </Button>
      <div className="mx-1 h-4 w-px bg-border max-sm:hidden" />
      <Button
        variant="outline"
        size="sm"
        onClick={onToggleCurlImport}
        title="Import cURL"
        aria-label="Import cURL"
      >
        <Import className="mr-1.5 h-3.5 w-3.5" />
        Import cURL
      </Button>
      <Select onValueChange={(value) => onCopyAs(value as CodeTarget)}>
        <SelectTrigger className="h-8 w-auto min-w-[130px] text-xs">
          <Terminal className="mr-2 h-3.5 w-3.5" />
          <span>Copy as…</span>
        </SelectTrigger>
        <SelectContent>
          {CODE_TARGETS.map((target) => (
            <SelectItem key={target.id} value={target.id} className="text-xs">
              {target.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
