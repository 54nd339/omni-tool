'use client';

import { useCallback, useMemo, useState } from 'react';
import { Plus, X } from 'lucide-react';

import { CopyButton } from '@/components/shared/tool-actions/copy-button';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  buildGradientCss,
  createColorStopId,
  createDefaultStops,
  GRADIENT_PRESETS,
} from '@/lib/image/color-picker';
import type { ColorStop, GradientType } from '@/types/common';

export function GradientGenerator() {
  const [type, setType] = useState<GradientType>('linear');
  const [angle, setAngle] = useState(90);
  const [stops, setStops] = useState<ColorStop[]>(createDefaultStops);

  const cssValue = useMemo(() => buildGradientCss(type, angle, stops), [type, angle, stops]);
  const fullCss = `background: ${cssValue};`;

  const addStop = useCallback(() => {
    setStops((previous) => [
      ...previous,
      { id: createColorStopId(), color: '#10b981', position: 50 },
    ]);
  }, []);

  const removeStop = useCallback((id: string) => {
    setStops((previous) => (previous.length <= 2 ? previous : previous.filter((stop) => stop.id !== id)));
  }, []);

  const updateStop = useCallback((id: string, patch: Partial<Omit<ColorStop, 'id'>>) => {
    setStops((previous) => previous.map((stop) => (stop.id === id ? { ...stop, ...patch } : stop)));
  }, []);

  const loadPreset = useCallback((preset: (typeof GRADIENT_PRESETS)[number]) => {
    setStops(preset.stops.map((stop) => ({ ...stop, id: createColorStopId() })));
  }, []);

  return (
    <div className="space-y-6">
      <div className="h-48 w-full rounded-lg border border-border shadow-inner" style={{ background: cssValue }} />

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Type</p>
          <ToggleGroup
            type="single"
            value={type}
            onValueChange={(value: string) => value && setType(value as GradientType)}
            className="justify-start"
          >
            <ToggleGroupItem value="linear">Linear</ToggleGroupItem>
            <ToggleGroupItem value="radial">Radial</ToggleGroupItem>
            <ToggleGroupItem value="conic">Conic</ToggleGroupItem>
          </ToggleGroup>
        </div>

        {(type === 'linear' || type === 'conic') && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Angle: {angle}°</p>
            <div className="flex h-10 items-center">
              <Slider min={0} max={360} step={1} value={[angle]} onValueChange={([value]) => setAngle(value)} />
            </div>
          </div>
        )}
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-medium text-muted-foreground">Color Stops</p>
          <Button variant="ghost" size="sm" onClick={addStop}>
            <Plus className="mr-1 h-3 w-3" />
            Add
          </Button>
        </div>
        <div className="space-y-2">
          {stops.map((stop) => (
            <div key={stop.id} className="flex items-center gap-3 rounded-md border border-border p-2">
              <input
                type="color"
                value={stop.color}
                onChange={(event) => updateStop(stop.id, { color: event.target.value })}
                className="h-8 w-8 shrink-0 cursor-pointer rounded border-0 bg-transparent"
              />
              <code className="w-[72px] shrink-0 text-xs">{stop.color}</code>
              <div className="flex-1">
                <Slider
                  min={0}
                  max={100}
                  step={1}
                  value={[stop.position]}
                  onValueChange={([value]) => updateStop(stop.id, { position: value })}
                />
              </div>
              <span className="w-8 text-right text-xs text-muted-foreground">{stop.position}%</span>
              <button
                onClick={() => removeStop(stop.id)}
                aria-label="Remove color stop"
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">Presets</p>
        <div className="flex flex-wrap gap-2">
          {GRADIENT_PRESETS.map((preset) => {
            const previewGradient = `linear-gradient(90deg, ${preset.stops
              .map((stop) => `${stop.color} ${stop.position}%`)
              .join(', ')})`;
            return (
              <button
                key={preset.name}
                onClick={() => loadPreset(preset)}
                className="flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-xs transition-colors hover:bg-muted"
              >
                <span className="inline-block h-4 w-4 rounded-full" style={{ background: previewGradient }} />
                {preset.name}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-medium text-muted-foreground">CSS</p>
          <CopyButton value={fullCss} size="sm" />
        </div>
        <code className="block break-all rounded-md border border-border bg-muted/50 p-3 text-sm">{fullCss}</code>
      </div>
    </div>
  );
}
