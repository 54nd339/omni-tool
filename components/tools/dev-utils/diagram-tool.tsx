'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { CopyButton } from '@/components/shared/copy-button';

const TEMPLATES: Record<string, { label: string; code: string }> = {
  flowchart: {
    label: 'Flowchart',
    code: `graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Action 1]
    B -->|No| D[Action 2]
    C --> E[End]
    D --> E`,
  },
  sequence: {
    label: 'Sequence',
    code: `sequenceDiagram
    participant A as Client
    participant B as Server
    participant C as Database
    A->>B: HTTP Request
    B->>C: Query
    C-->>B: Results
    B-->>A: JSON Response`,
  },
  classDiagram: {
    label: 'Class',
    code: `classDiagram
    class Animal {
        +String name
        +int age
        +makeSound()
    }
    class Dog {
        +fetch()
    }
    class Cat {
        +purr()
    }
    Animal <|-- Dog
    Animal <|-- Cat`,
  },
  er: {
    label: 'ER',
    code: `erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ LINE-ITEM : contains
    CUSTOMER {
        string name
        string email
    }
    ORDER {
        int id
        date created
    }`,
  },
  gantt: {
    label: 'Gantt',
    code: `gantt
    title Project Timeline
    dateFormat YYYY-MM-DD
    section Planning
    Requirements  :a1, 2024-01-01, 7d
    Design        :a2, after a1, 5d
    section Development
    Frontend      :b1, after a2, 14d
    Backend       :b2, after a2, 14d
    section Testing
    QA            :c1, after b1, 7d`,
  },
  pie: {
    label: 'Pie',
    code: `pie title Technology Stack
    "TypeScript" : 40
    "React" : 25
    "Node.js" : 20
    "Python" : 15`,
  },
  mindmap: {
    label: 'Mindmap',
    code: `mindmap
  root((Web Dev))
    Frontend
      React
      Vue
      Angular
    Backend
      Node.js
      Python
      Go
    Database
      PostgreSQL
      MongoDB
      Redis`,
  },
};

export function DiagramTool() {
  const [code, setCode] = useState(TEMPLATES.flowchart.code);
  const [svgOutput, setSvgOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { resolvedTheme } = useTheme();
  const previewRef = useRef<HTMLDivElement>(null);
  const renderTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const previewUrl = useMemo(
    () => svgOutput ? URL.createObjectURL(new Blob([svgOutput], { type: 'image/svg+xml' })) : null,
    [svgOutput],
  );

  const renderDiagram = useCallback(async (src: string) => {
    if (!src.trim()) { setSvgOutput(''); setError(null); return; }
    try {
      const mermaid = (await import('mermaid')).default;
      mermaid.initialize({
        startOnLoad: false,
        theme: resolvedTheme === 'dark' ? 'dark' : 'default',
        securityLevel: 'loose',
      });
      const { svg } = await mermaid.render('mermaid-preview', src);
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
    const blob = new Blob([svgOutput], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'diagram.svg';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('SVG exported');
  };

  const handleExportPng = async () => {
    if (!svgOutput) return;
    const bgColor = resolvedTheme === 'dark' ? '#09090b' : '#ffffff';
    const svgBlob = new Blob([svgOutput], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(svgBlob);
    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = 2;
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (!blob) return;
        const pngUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = pngUrl;
        a.download = 'diagram.png';
        a.click();
        URL.revokeObjectURL(pngUrl);
        toast.success('PNG exported');
      }, 'image/png');
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-xs font-medium text-muted-foreground mr-2">Templates:</p>
        {Object.entries(TEMPLATES).map(([key, { label }]) => (
          <Button key={key} variant="outline" size="sm" onClick={() => setCode(TEMPLATES[key].code)} className="text-xs">
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
              <img src={previewUrl} alt="Diagram preview" className="mx-auto max-w-full" />
            ) : (
              <p className="text-sm text-muted-foreground">Diagram preview will appear here...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
