'use client';

import dynamic from 'next/dynamic';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  type DiffCheckerViewMode,
  useDiffChecker,
} from '@/hooks/use-diff-checker';
import { DIFF_LANGUAGES, DIFF_MODES } from '@/lib/constants/dev-utils';
import type { DiffMode } from '@/types/common';

import { SimpleDiffOutput } from './simple-diff-output';
import { TextInputPair } from './text-input-pair';

const DiffEditor = dynamic(() => import('@monaco-editor/react').then((m) => m.DiffEditor), { ssr: false });

export function DiffCheckerTool() {
  const {
    changes,
    handleAutoDetect,
    jsonError,
    left,
    mode,
    monacoLang,
    renderSideBySide,
    right,
    setLeft,
    setMode,
    setMonacoLang,
    setRenderSideBySide,
    setRight,
    setViewMode,
    stats,
    viewMode,
  } = useDiffChecker();
  const { resolvedTheme } = useTheme();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">View</p>
          <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value as DiffCheckerViewMode)}>
            <ToggleGroupItem value="simple">Simple</ToggleGroupItem>
            <ToggleGroupItem value="monaco">Monaco</ToggleGroupItem>
          </ToggleGroup>
        </div>

        {viewMode === 'simple' && (
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Diff mode</p>
            <ToggleGroup type="single" value={mode} onValueChange={(value) => value && setMode(value as DiffMode)}>
              {DIFF_MODES.map((diffMode) => (
                <ToggleGroupItem key={diffMode.id} value={diffMode.id}>{diffMode.label}</ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        )}

        {viewMode === 'monaco' && (
          <>
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">Language</p>
              <div className="flex flex-wrap items-center gap-2">
                <ToggleGroup type="single" value={monacoLang} onValueChange={(value) => value && setMonacoLang(value)} className="flex-wrap">
                  {DIFF_LANGUAGES.map((language) => (
                    <ToggleGroupItem key={language.id} value={language.id} className="text-xs">{language.label}</ToggleGroupItem>
                  ))}
                </ToggleGroup>
                <Button variant="ghost" size="sm" className="text-xs" onClick={handleAutoDetect}>Auto-detect</Button>
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">Layout</p>
              <ToggleGroup type="single" value={renderSideBySide ? 'side' : 'inline'} onValueChange={(value) => value && setRenderSideBySide(value === 'side')}>
                <ToggleGroupItem value="side" className="text-xs">Side by Side</ToggleGroupItem>
                <ToggleGroupItem value="inline" className="text-xs">Inline</ToggleGroupItem>
              </ToggleGroup>
            </div>
          </>
        )}

        {viewMode === 'simple' && (left || right) && (
          <p className="text-xs text-muted-foreground">
            <span className="text-green-600">+{stats.added}</span>{' '}
            <span className="text-red-500">-{stats.removed}</span>
          </p>
        )}
      </div>

      {viewMode === 'monaco' ? (
        <div className="space-y-2">
          <div className="overflow-hidden rounded-md border border-border">
            <DiffEditor
              height="550px"
              language={monacoLang}
              original={left}
              modified={right}
              theme={resolvedTheme === 'dark' ? 'vs-dark' : 'vs'}
              options={{
                renderSideBySide,
                minimap: { enabled: false },
                fontSize: 13,
                scrollBeyondLastLine: false,
                automaticLayout: true,
                readOnly: false,
                originalEditable: true,
                padding: { top: 12 },
              }}
              onMount={(editor) => {
                const originalEditor = editor.getOriginalEditor();
                const modifiedEditor = editor.getModifiedEditor();
                originalEditor.onDidChangeModelContent(() => setLeft(originalEditor.getValue()));
                modifiedEditor.onDidChangeModelContent(() => setRight(modifiedEditor.getValue()));
              }}
            />
          </div>
        </div>
      ) : (
        <>
          <TextInputPair
            left={left}
            right={right}
            onLeftChange={setLeft}
            onRightChange={setRight}
          />

          <SimpleDiffOutput
            changes={changes}
            jsonError={jsonError}
            left={left}
            mode={mode}
            right={right}
          />
        </>
      )}
    </div>
  );
}
