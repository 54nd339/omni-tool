'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';

import { CopyButton } from '@/components/shared/tool-actions/copy-button';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToolParams } from '@/hooks/use-tool-params';
import { DIAGRAM_TEMPLATES } from '@/lib/constants/dev-utils';
import {
  exportDiagramPng,
  exportDiagramSvg,
  renderMermaidDiagram,
} from '@/lib/dev-utils/diagram';

const PARAM_DEFAULTS = {
  template: 'flowchart',
};

type DiagramTemplateKey = keyof typeof DIAGRAM_TEMPLATES;

function isDiagramTemplateKey(value: string): value is DiagramTemplateKey {
  return value in DIAGRAM_TEMPLATES;
}

export function DiagramTool() {
  const [params, setParams] = useToolParams(PARAM_DEFAULTS);
  const templateKey: DiagramTemplateKey = isDiagramTemplateKey(params.template)
    ? params.template
    : 'flowchart';
  const [code, setCode] = useState<string>(DIAGRAM_TEMPLATES[templateKey].code);
  const [svgOutput, setSvgOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { resolvedTheme } = useTheme();
  const previewRef = useRef<HTMLDivElement>(null);
  const renderTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const previewUrl = useMemo(
    () => svgOutput ? URL.createObjectURL(new Blob([svgOutput], { type: 'image/svg+xml' })) : null,
    [svgOutput],
  );

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const renderDiagram = useCallback(async (src: string) => {
    if (!src.trim()) { setSvgOutput(''); setError(null); return; }
    try {
      const svg = await renderMermaidDiagram({
        source: src,
        theme: resolvedTheme === 'dark' ? 'dark' : 'default',
      });
      setSvgOutput(svg);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Render error');
    }
  }, [resolvedTheme]);

  useEffect(() => {
    if (renderTimer.current) clearTimeout(renderTimer.current);
    renderTimer.current = setTimeout(() => renderDiagram(code), 500);
    return () => { if (renderTimer.current) clearTimeout(renderTimer.current); };
  }, [code, renderDiagram]);

  const handleExportSvg = () => {
    if (!svgOutput) return;
    exportDiagramSvg(svgOutput);
    toast.success('SVG exported');
  };

  const handleExportPng = async () => {
    if (!svgOutput) return;
    await exportDiagramPng({
      backgroundColor: resolvedTheme === 'dark' ? '#09090b' : '#ffffff',
      svgOutput,
    });
    toast.success('PNG exported');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-xs font-medium text-muted-foreground mr-2">Templates:</p>
        {(Object.entries(DIAGRAM_TEMPLATES) as [DiagramTemplateKey, (typeof DIAGRAM_TEMPLATES)[DiagramTemplateKey]][]).map(([key, { label }]) => (
          <Button
            key={key}
            variant="outline"
            size="sm"
            onClick={() => {
              setParams({ template: key });
              setCode(DIAGRAM_TEMPLATES[key].code);
            }}
            className="text-xs"
          >
            {label}
          </Button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <div className="mb-2 flex h-8 items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">Mermaid Source</p>
          </div>
          <Textarea value={code} onChange={(e) => setCode(e.target.value)} rows={20} className="font-mono text-sm" placeholder="Enter Mermaid diagram code..." autoFocus />
        </div>
        <div>
          <div className="mb-2 flex h-8 items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">Preview</p>
            <div className="flex items-center gap-2">
              {svgOutput && <CopyButton value={svgOutput} size="sm" className="h-8 w-8" />}
              {svgOutput && (
                <>
                  <Button variant="ghost" size="sm" className="h-8" onClick={handleExportSvg}>SVG</Button>
                  <Button variant="ghost" size="sm" className="h-8" onClick={handleExportPng}>PNG</Button>
                </>
              )}
            </div>
          </div>
          <div
            ref={previewRef}
            className="min-h-[400px] overflow-auto rounded-md border border-border bg-background p-4 [&_svg]:mx-auto [&_svg]:max-w-full"
          >
            {error ? (
              <p className="text-sm text-destructive">{error}</p>
            ) : previewUrl ? (
              <Image src={previewUrl} alt="Diagram preview" width={1200} height={900} unoptimized className="mx-auto h-auto max-w-full" />
            ) : (
              <p className="text-sm text-muted-foreground">Diagram preview will appear here...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
