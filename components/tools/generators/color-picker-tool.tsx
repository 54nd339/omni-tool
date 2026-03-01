'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Palette, Pipette, Plus, X } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { CopyButton } from '@/components/shared/copy-button';

type Tab = 'picker' | 'gradient';
type GradientType = 'linear' | 'radial' | 'conic';

interface ColorStop {
  id: string;
  color: string;
  position: number;
}

const PRESETS: { name: string; stops: Omit<ColorStop, 'id'>[] }[] = [
  { name: 'Sunset', stops: [{ color: '#ff6b6b', position: 0 }, { color: '#feca57', position: 100 }] },
  { name: 'Ocean', stops: [{ color: '#0652DD', position: 0 }, { color: '#1289A7', position: 50 }, { color: '#12CBC4', position: 100 }] },
  { name: 'Aurora', stops: [{ color: '#6c5ce7', position: 0 }, { color: '#a29bfe', position: 50 }, { color: '#74b9ff', position: 100 }] },
  { name: 'Flame', stops: [{ color: '#e74c3c', position: 0 }, { color: '#f39c12', position: 50 }, { color: '#f1c40f', position: 100 }] },
  { name: 'Forest', stops: [{ color: '#2d3436', position: 0 }, { color: '#00b894', position: 100 }] },
  { name: 'Candy', stops: [{ color: '#fc5c7d', position: 0 }, { color: '#6a82fb', position: 100 }] },
];

let stopCounter = 0;
function newId() {
  return `stop-${++stopCounter}`;
}

function defaultStops(): ColorStop[] {
  return [
    { id: newId(), color: '#6366f1', position: 0 },
    { id: newId(), color: '#ec4899', position: 100 },
  ];
}

function GradientGeneratorTool() {
  const [type, setType] = useState<GradientType>('linear');
  const [angle, setAngle] = useState(90);
  const [stops, setStops] = useState<ColorStop[]>(defaultStops);

  const cssValue = useMemo(() => {
    const sortedStops = [...stops].sort((a, b) => a.position - b.position);
    const colorList = sortedStops.map((s) => `${s.color} ${s.position}%`).join(', ');

    if (type === 'linear') return `linear-gradient(${angle}deg, ${colorList})`;
    if (type === 'radial') return `radial-gradient(circle, ${colorList})`;
    return `conic-gradient(from ${angle}deg, ${colorList})`;
  }, [type, angle, stops]);

  const addStop = useCallback(() => {
    setStops((prev) => [...prev, { id: newId(), color: '#10b981', position: 50 }]);
  }, []);

  const removeStop = useCallback((id: string) => {
    setStops((prev) => (prev.length <= 2 ? prev : prev.filter((s) => s.id !== id)));
  }, []);

  const updateStop = useCallback((id: string, patch: Partial<Omit<ColorStop, 'id'>>) => {
    setStops((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    );
  }, []);

  const loadPreset = useCallback((preset: (typeof PRESETS)[number]) => {
    setStops(preset.stops.map((s) => ({ ...s, id: newId() })));
  }, []);

  const fullCss = `background: ${cssValue};`;

  return (
    <div className="space-y-6">
      <div
        className="h-48 w-full rounded-lg border border-border shadow-inner"
        style={{ background: cssValue }}
      />

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Type</p>
          <ToggleGroup
            type="single"
            value={type}
            onValueChange={(v: string) => v && setType(v as GradientType)}
            className="justify-start"
          >
            <ToggleGroupItem value="linear">Linear</ToggleGroupItem>
            <ToggleGroupItem value="radial">Radial</ToggleGroupItem>
            <ToggleGroupItem value="conic">Conic</ToggleGroupItem>
          </ToggleGroup>
        </div>

        {(type === 'linear' || type === 'conic') && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              Angle: {angle}°
            </p>
            <div className="flex h-10 items-center">
              <Slider
                min={0}
                max={360}
                step={1}
                value={[angle]}
                onValueChange={([v]) => setAngle(v)}
              />
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
                onChange={(e) => updateStop(stop.id, { color: e.target.value })}
                className="h-8 w-8 shrink-0 cursor-pointer rounded border-0 bg-transparent"
              />
              <code className="w-[72px] shrink-0 text-xs">{stop.color}</code>
              <div className="flex-1">
                <Slider
                  min={0}
                  max={100}
                  step={1}
                  value={[stop.position]}
                  onValueChange={([v]) => updateStop(stop.id, { position: v })}
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
          {PRESETS.map((preset) => {
            const previewGradient = `linear-gradient(90deg, ${preset.stops.map((s) => `${s.color} ${s.position}%`).join(', ')})`;
            return (
              <button
                key={preset.name}
                onClick={() => loadPreset(preset)}
                className="flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-xs transition-colors hover:bg-muted"
              >
                <span
                  className="inline-block h-4 w-4 rounded-full"
                  style={{ background: previewGradient }}
                />
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
        <code className="block rounded-md border border-border bg-muted/50 p-3 text-sm break-all">
          {fullCss}
        </code>
      </div>
    </div>
  );
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

function rgbToHsl(
  r: number,
  g: number,
  b: number,
): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, Math.round(l * 100)];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hslToRgb(
  h: number,
  s: number,
  l: number,
): [number, number, number] {
  h /= 360;
  s /= 100;
  l /= 100;
  if (s === 0) {
    const v = Math.round(l * 255);
    return [v, v, v];
  }
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [
    Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    Math.round(hue2rgb(p, q, h) * 255),
    Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
  ];
}

function hslToHex(h: number, s: number, l: number): string {
  return rgbToHex(...hslToRgb(h, s, l));
}

function relativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrastRatio(
  rgb1: [number, number, number],
  rgb2: [number, number, number],
): number {
  const l1 = relativeLuminance(...rgb1);
  const l2 = relativeLuminance(...rgb2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function generateShades(hex: string): string[] {
  const rgb = hexToRgb(hex);
  const [h, s] = rgbToHsl(...rgb);
  return [95, 85, 70, 55, 45, 35, 25, 15, 8].map((l) => hslToHex(h, s, l));
}

// No export helper needed here anymore

export function ColorGradientTool() {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<Tab>('picker');
  const [hex, setHex] = useState(() => {
    const paste = searchParams.get('paste');
    if (paste) {
      const v = decodeURIComponent(paste).trim();
      return /^#?[0-9a-f]{6}$/i.test(v) ? (v.startsWith('#') ? v : `#${v}`) : '#3b82f6';
    }
    return '#3b82f6';
  });
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const rgb = useMemo(() => hexToRgb(hex), [hex]);
  const hsl = useMemo(() => rgbToHsl(...rgb), [rgb]);
  const hexStr = hex.toUpperCase();
  const rgbStr = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
  const hslStr = `hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)`;

  const contrastWhite = useMemo(
    () => contrastRatio(rgb, [255, 255, 255]),
    [rgb],
  );
  const contrastBlack = useMemo(
    () => contrastRatio(rgb, [0, 0, 0]),
    [rgb],
  );

  const wcagLabel = (ratio: number) => {
    if (ratio >= 7) return 'AAA';
    if (ratio >= 4.5) return 'AA';
    if (ratio >= 3) return 'AA Large';
    return 'Fail';
  };

  const shades = useMemo(() => generateShades(hex), [hex]);
  const cssVars = useMemo(
    () => shades.map((c, i) => `  --color-shade-${i + 1}: ${c};`).join('\n'),
    [shades],
  );

  const handleHexInput = useCallback((value: string) => {
    const clean = value.startsWith('#') ? value : `#${value}`;
    if (/^#[0-9a-fA-F]{6}$/.test(clean)) {
      setHex(clean.toLowerCase());
    }
  }, []);

  const handleRgbChange = useCallback(
    (r: number, g: number, b: number) => {
      setHex(
        rgbToHex(
          Math.min(255, Math.max(0, r)),
          Math.min(255, Math.max(0, g)),
          Math.min(255, Math.max(0, b)),
        ),
      );
    },
    [],
  );

  const handleHslChange = useCallback(
    (h: number, s: number, l: number) => {
      setHex(
        rgbToHex(
          ...hslToRgb(
            Math.min(360, Math.max(0, h)),
            Math.min(100, Math.max(0, s)),
            Math.min(100, Math.max(0, l)),
          ),
        ),
      );
    },
    [],
  );

  const handleImageExtract = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, 1, 1);
        const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
        setHex(rgbToHex(r, g, b));
        URL.revokeObjectURL(img.src);
      };
      img.src = URL.createObjectURL(file);
    },
    [],
  );

  // Palette extract handlers removed

  return (
    <div className="space-y-6">
      <ToggleGroup
        type="single"
        value={tab}
        onValueChange={(v: string) => v && setTab(v as Tab)}
      >
        <ToggleGroupItem value="picker">
          <Pipette className="mr-1.5 h-3.5 w-3.5" /> Picker
        </ToggleGroupItem>
        <ToggleGroupItem value="gradient">
          <Palette className="mr-1.5 h-3.5 w-3.5" /> Gradient
        </ToggleGroupItem>
      </ToggleGroup>

      {tab === 'gradient' && <GradientGeneratorTool />}

      {tab === 'picker' && (<div className="space-y-6">
        {/* Color picker + values */}
        <div className="grid gap-6 sm:grid-cols-[200px_1fr]">
          <div className="space-y-3">
            <div
              className="h-40 w-full rounded-lg border border-border"
              style={{ backgroundColor: hex }}
            />
            <input
              type="color"
              value={hex}
              onChange={(e) => setHex(e.target.value)}
              className="h-10 w-full cursor-pointer rounded border border-border"
            />
            <div>
              <p className="mb-1 text-[11px] text-muted-foreground">
                Extract from image
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageExtract}
                className="text-xs"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                HEX
              </p>
              <div className="flex items-center gap-2">
                <Input
                  value={hexStr}
                  onChange={(e) => handleHexInput(e.target.value)}
                  className="font-mono"
                />
                <CopyButton value={hexStr} size="sm" className="h-7 w-7" />
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                RGB
              </p>
              <div className="flex items-center gap-2">
                <div className="grid flex-1 grid-cols-3 gap-2">
                  <Input
                    type="number"
                    min={0}
                    max={255}
                    value={rgb[0]}
                    onChange={(e) =>
                      handleRgbChange(+e.target.value, rgb[1], rgb[2])
                    }
                    className="font-mono"
                  />
                  <Input
                    type="number"
                    min={0}
                    max={255}
                    value={rgb[1]}
                    onChange={(e) =>
                      handleRgbChange(rgb[0], +e.target.value, rgb[2])
                    }
                    className="font-mono"
                  />
                  <Input
                    type="number"
                    min={0}
                    max={255}
                    value={rgb[2]}
                    onChange={(e) =>
                      handleRgbChange(rgb[0], rgb[1], +e.target.value)
                    }
                    className="font-mono"
                  />
                </div>
                <CopyButton value={rgbStr} size="sm" className="h-7 w-7" />
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                HSL
              </p>
              <div className="flex items-center gap-2">
                <div className="grid flex-1 grid-cols-3 gap-2">
                  <Input
                    type="number"
                    min={0}
                    max={360}
                    value={hsl[0]}
                    onChange={(e) =>
                      handleHslChange(+e.target.value, hsl[1], hsl[2])
                    }
                    className="font-mono"
                  />
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={hsl[1]}
                    onChange={(e) =>
                      handleHslChange(hsl[0], +e.target.value, hsl[2])
                    }
                    className="font-mono"
                  />
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={hsl[2]}
                    onChange={(e) =>
                      handleHslChange(hsl[0], hsl[1], +e.target.value)
                    }
                    className="font-mono"
                  />
                </div>
                <CopyButton value={hslStr} size="sm" className="h-7 w-7" />
              </div>
            </div>
          </div>
        </div>

        {/* Shades */}
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            Shades
          </p>
          <div className="flex overflow-hidden rounded-md border border-border">
            {shades.map((color, i) => (
              <div
                key={`${color}-${i}`}
                onClick={() => setHex(color)}
                className="group relative flex-1 cursor-pointer"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setHex(color); }}
              >
                <div className="h-12" style={{ background: color }} />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                  <CopyButton
                    value={color}
                    size="sm"
                    className="bg-background/80"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CSS Variables */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">
              CSS Variables
            </p>
            <CopyButton value={`:root {\n${cssVars}\n}`} size="sm" />
          </div>
          <pre className="rounded-md border border-border bg-muted/50 p-3 text-xs">
            {`:root {\n${cssVars}\n}`}
          </pre>
        </div>
      </div>)}
    </div>
  );
}
