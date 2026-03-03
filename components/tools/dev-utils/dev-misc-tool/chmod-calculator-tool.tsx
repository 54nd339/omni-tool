'use client';

import { useCallback, useMemo, useState } from 'react';

import { CopyButton } from '@/components/shared/tool-actions/copy-button';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  gridToOctal,
  gridToSymbolic,
  octalToGrid,
  PERM_CHARS,
  type PermGrid,
  PERMS,
  PRESETS,
  ROLES,
} from '@/lib/dev-utils/chmod';

export function ChmodCalculatorTool() {
  const [grid, setGrid] = useState<PermGrid>(() => octalToGrid('755'));

  const octal = useMemo(() => gridToOctal(grid), [grid]);
  const symbolic = useMemo(() => gridToSymbolic(grid), [grid]);
  const command = `chmod ${octal} <file>`;

  const togglePerm = useCallback((role: number, perm: number) => {
    setGrid((prev) => {
      const next = prev.map((r) => [...r]) as PermGrid;
      next[role][perm] = !next[role][perm];
      return next;
    });
  }, []);

  const applyPreset = useCallback((preset: string) => {
    setGrid(octalToGrid(preset));
  }, []);

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto">
        <table className="w-full max-w-md border-collapse">
          <thead>
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground" />
              {PERMS.map((p, i) => (
                <th key={p} className="px-3 py-2 text-center text-xs font-medium text-muted-foreground">
                  {p} ({PERM_CHARS[i]})
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROLES.map((role, ri) => (
              <tr key={role} className="border-t border-border">
                <td className="px-3 py-3 text-sm font-medium">{role}</td>
                {[0, 1, 2].map((pi) => (
                  <td key={pi} className="px-3 py-3 text-center">
                    <Checkbox
                      checked={grid[ri][pi]}
                      onCheckedChange={() => togglePerm(ri, pi)}
                      aria-label={`${role} ${PERMS[pi]}`}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-md border border-border p-4">
          <p className="mb-1 text-xs font-medium text-muted-foreground">Octal</p>
          <div className="flex items-center justify-between">
            <span className="font-mono text-2xl font-bold">{octal}</span>
            <CopyButton value={octal} size="sm" />
          </div>
        </div>
        <div className="rounded-md border border-border p-4">
          <p className="mb-1 text-xs font-medium text-muted-foreground">Symbolic</p>
          <div className="flex items-center justify-between">
            <span className="font-mono text-lg font-semibold">{symbolic}</span>
            <CopyButton value={symbolic} size="sm" />
          </div>
        </div>
        <div className="rounded-md border border-border p-4">
          <p className="mb-1 text-xs font-medium text-muted-foreground">Command</p>
          <div className="flex items-center justify-between gap-2">
            <code className="truncate font-mono text-sm">{command}</code>
            <CopyButton value={command} size="sm" />
          </div>
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">Common Presets</p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <Button
              key={p.label}
              variant={octal === p.label ? 'default' : 'outline'}
              size="sm"
              onClick={() => applyPreset(p.label)}
              title={p.desc}
            >
              {p.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
