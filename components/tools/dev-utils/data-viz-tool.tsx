'use client';

import { lazy, Suspense, useCallback, useMemo, useRef, useState } from 'react';
import { BarChart3, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { EmptyState } from '@/components/shared/empty-state';
import type { ChartType } from './data-viz-charts';

const LazyCharts = lazy(() =>
  import('./data-viz-charts').then((m) => ({ default: m.DataVizCharts })),
);

function tryParseJson(text: string): Record<string, unknown>[] | null {
  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'object') {
      return parsed;
    }
  } catch { /* not json */ }
  return null;
}

function tryParseCsv(text: string): Record<string, unknown>[] | null {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return null;

  const sep = lines[0].includes('\t') ? '\t' : ',';
  const headers = lines[0].split(sep).map((h) => h.trim().replace(/^["']|["']$/g, ''));
  if (headers.length < 2) return null;

  const rows: Record<string, unknown>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const vals = lines[i].split(sep).map((v) => v.trim().replace(/^["']|["']$/g, ''));
    if (vals.length !== headers.length) continue;
    const row: Record<string, unknown> = {};
    for (let j = 0; j < headers.length; j++) {
      const num = Number(vals[j]);
      row[headers[j]] = isNaN(num) ? vals[j] : num;
    }
    rows.push(row);
  }
  return rows.length > 0 ? rows : null;
}

function inferColumns(data: Record<string, unknown>[]): { numeric: string[]; categorical: string[] } {
  const keys = Object.keys(data[0]);
  const numeric: string[] = [];
  const categorical: string[] = [];
  for (const key of keys) {
    const numericCount = data.filter((row) => typeof row[key] === 'number').length;
    if (numericCount > data.length * 0.5) numeric.push(key);
    else categorical.push(key);
  }
  return { numeric, categorical };
}

export function DataVizTool() {
  const [input, setInput] = useState('');
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [xAxis, setXAxis] = useState('');
  const [yAxis, setYAxis] = useState('');
  const chartRef = useRef<HTMLDivElement>(null);

  const data = useMemo(() => {
    if (!input.trim()) return null;
    return tryParseJson(input) || tryParseCsv(input);
  }, [input]);

  const columns = useMemo(() => {
    if (!data) return { numeric: [] as string[], categorical: [] as string[] };
    return inferColumns(data);
  }, [data]);

  const allColumns = useMemo(
    () => [...columns.categorical, ...columns.numeric],
    [columns],
  );

  const effectiveX = xAxis || allColumns[0] || '';
  const effectiveY = yAxis || columns.numeric[0] || '';

  const handleLoad = useCallback((sample: 'json' | 'csv') => {
    if (sample === 'json') {
      setInput(JSON.stringify([
        { month: 'Jan', sales: 65, returns: 12 },
        { month: 'Feb', sales: 59, returns: 8 },
        { month: 'Mar', sales: 80, returns: 15 },
        { month: 'Apr', sales: 81, returns: 10 },
        { month: 'May', sales: 56, returns: 6 },
        { month: 'Jun', sales: 95, returns: 18 },
      ], null, 2));
    } else {
      setInput(`city,population,area
Tokyo,37400000,2191
Delhi,30290000,1484
Shanghai,27058000,6341
São Paulo,22043000,1521
Mumbai,20411000,603
Cairo,20076000,3085`);
    }
  }, []);

  const exportChart = useCallback(async (type: 'svg' | 'png') => {
    const container = chartRef.current;
    if (!container) return;
    const svg = container.querySelector('svg');
    if (!svg) return;

    const clone = svg.cloneNode(true) as SVGElement;
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(clone);

    if (type === 'svg') {
      const blob = new Blob([svgStr], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'chart.svg';
      a.click();
      URL.revokeObjectURL(url);
      return;
    }

    const canvas = document.createElement('canvas');
    const rect = svg.getBoundingClientRect();
    const dpr = 2;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d')!;
    ctx.scale(dpr, dpr);

    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, rect.width, rect.height);
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'chart.png';
        a.click();
        URL.revokeObjectURL(url);
      }, 'image/png');
    };
    img.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgStr)))}`;
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">Input (JSON array or CSV)</p>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={() => handleLoad('json')}>Sample JSON</Button>
              <Button variant="ghost" size="sm" onClick={() => handleLoad('csv')}>Sample CSV</Button>
            </div>
          </div>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='Paste a JSON array or CSV...'
            className="min-h-[300px] font-mono text-xs"
          />
          {input.trim() && !data && (
            <p className="text-xs text-destructive">Could not parse input as JSON array or CSV.</p>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex h-8 items-center justify-end" />

          <div className="flex flex-col overflow-hidden rounded-lg border border-border bg-background">
            <div className="flex flex-wrap items-end gap-3 border-b border-border bg-muted/30 p-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Chart Type</label>
                <ToggleGroup type="single" value={chartType} onValueChange={(v) => v && setChartType(v as ChartType)}>
                  <ToggleGroupItem value="bar">Bar</ToggleGroupItem>
                  <ToggleGroupItem value="line">Line</ToggleGroupItem>
                  <ToggleGroupItem value="area">Area</ToggleGroupItem>
                  <ToggleGroupItem value="pie">Pie</ToggleGroupItem>
                  <ToggleGroupItem value="scatter">Scatter</ToggleGroupItem>
                </ToggleGroup>
              </div>

              {data && (
                <>
                  <div className="w-32">
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">X Axis</label>
                    <Select value={effectiveX} onValueChange={setXAxis}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {allColumns.map((col) => (
                          <SelectItem key={col} value={col}>{col}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {(chartType === 'pie' || chartType === 'scatter') && (
                    <div className="w-32">
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">Y Axis</label>
                      <Select value={effectiveY} onValueChange={setYAxis}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {columns.numeric.map((col) => (
                            <SelectItem key={col} value={col}>{col}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </>
              )}
            </div>

            <div ref={chartRef} className="flex min-h-[343px] items-center justify-center p-4">
              {data ? (
                <Suspense fallback={<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />}>
                  <LazyCharts
                    data={data}
                    chartType={chartType}
                    effectiveX={effectiveX}
                    effectiveY={effectiveY}
                    numericColumns={columns.numeric}
                  />
                </Suspense>
              ) : (
                <EmptyState
                  icon={BarChart3}
                  title="No data yet"
                  description="Paste a JSON array or CSV on the left to generate a chart."
                />
              )}
            </div>
          </div>

          {data && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => exportChart('svg')}>
                <Download className="mr-1.5 h-3 w-3" /> SVG
              </Button>
              <Button variant="outline" size="sm" onClick={() => exportChart('png')}>
                <Download className="mr-1.5 h-3 w-3" /> PNG
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
