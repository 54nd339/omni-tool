'use client';

import { lazy, Suspense } from 'react';
import { BarChart3, Download, Loader2 } from 'lucide-react';

import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useDataVizTool } from '@/hooks/use-data-viz-tool';

const LazyCharts = lazy(() =>
  import('./charts').then((m) => ({ default: m.DataVizCharts })),
);

export function DataVizTool() {
  const {
    allColumns,
    chartRef,
    chartType,
    columns,
    data,
    effectiveX,
    effectiveY,
    exportChart,
    handleLoad,
    input,
    setChartType,
    setInput,
    setXAxis,
    setYAxis,
  } = useDataVizTool();

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
                <ToggleGroup
                  type="single"
                  value={chartType}
                  onValueChange={(value) => value && setChartType(value as typeof chartType)}
                >
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
