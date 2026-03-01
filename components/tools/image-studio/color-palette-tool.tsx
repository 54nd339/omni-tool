'use client';

import { useCallback, useMemo, useState } from 'react';
import { Pipette } from 'lucide-react';
import { useClipboardPaste } from '@/hooks';
import { CopyButton } from '@/components/shared/copy-button';
import { EmptyState } from '@/components/shared/empty-state';
import { FileDropzone } from '@/components/shared/file-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Palette } from 'lucide-react';

type HarmonyType =
  | 'complementary'
  | 'analogous'
  | 'triadic'
  | 'split'
  | 'tetradic';

type ExportFormat = 'json' | 'css' | 'tailwind' | 'scss';

interface ColorInfo {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
}

function hslToHex(h: number, s: number, l: number): string {
  const { r, g, b } = hslToRgb(h, s, l);
  return rgbToHex(r, g, b);
}

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h /= 360;
  s /= 100;
  l /= 100;
  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
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
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

function generateHarmony(baseHex: string, harmony: HarmonyType): string[] {
  const hex = baseHex.startsWith('#') ? baseHex : `#${baseHex}`;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const { h, s, l } = rgbToHsl(r, g, b);

  switch (harmony) {
    case 'complementary':
      return [baseHex, hslToHex((h + 180) % 360, s, l)];
    case 'analogous':
      return [
        hslToHex((h + 330) % 360, s, l),
        baseHex,
        hslToHex((h + 30) % 360, s, l),
      ];
    case 'triadic':
      return [
        baseHex,
        hslToHex((h + 120) % 360, s, l),
        hslToHex((h + 240) % 360, s, l),
      ];
    case 'split':
      return [
        baseHex,
        hslToHex((h + 150) % 360, s, l),
        hslToHex((h + 210) % 360, s, l),
      ];
    case 'tetradic':
      return [
        baseHex,
        hslToHex((h + 90) % 360, s, l),
        hslToHex((h + 180) % 360, s, l),
        hslToHex((h + 270) % 360, s, l),
      ];
    default:
      return [baseHex];
  }
}
function rgbToHex(r: number, g: number, b: number): string {
  return (
    '#' +
    [r, g, b]
      .map((x) => {
        const h = Math.round(x).toString(16);
        return h.length === 1 ? '0' + h : h;
      })
      .join('')
  );
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      default:
        h = ((r - g) / d + 4) / 6;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function euclideanDistance(
  a: { r: number; g: number; b: number },
  b: { r: number; g: number; b: number }
): number {
  return Math.sqrt(
    Math.pow(a.r - b.r, 2) + Math.pow(a.g - b.g, 2) + Math.pow(a.b - b.b, 2)
  );
}

const SIMILARITY_THRESHOLD = 55;

function extractDominantColors(imageUrl: string): Promise<ColorInfo[]> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const maxSize = 100;
        const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        ctx.drawImage(img, 0, 0, w, h);
        const imageData = ctx.getImageData(0, 0, w, h);
        const data = imageData.data;

        const freq = new Map<string, { count: number; r: number; g: number; b: number }>();

        for (let i = 0; i < data.length; i += 4) {
          const alpha = data[i + 3];
          if (alpha < 128) continue;

          const r = Math.round(data[i] / 16) * 16;
          const g = Math.round(data[i + 1] / 16) * 16;
          const b = Math.round(data[i + 2] / 16) * 16;
          const key = `${r},${g},${b}`;

          const existing = freq.get(key);
          if (existing) {
            existing.count++;
          } else {
            freq.set(key, { count: 1, r, g, b });
          }
        }

        const sorted = [...freq.entries()]
          .sort((a, b) => b[1].count - a[1].count)
          .map(([, v]) => v);

        const deduped: typeof sorted = [];
        for (const entry of sorted) {
          const tooSimilar = deduped.some(
            (d) => euclideanDistance(entry, d) < SIMILARITY_THRESHOLD
          );
          if (!tooSimilar) {
            deduped.push(entry);
            if (deduped.length >= 8) break;
          }
        }

        const colors: ColorInfo[] = deduped.map(({ r, g, b }) => ({
          hex: rgbToHex(r, g, b),
          rgb: { r, g, b },
          hsl: rgbToHsl(r, g, b),
        }));

        resolve(colors);
      } catch (e) {
        reject(e);
      }
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageUrl;
  });
}

function formatExport(colors: ColorInfo[], format: ExportFormat): string {
  const hexes = colors.map((c) => c.hex);
  switch (format) {
    case 'json':
      return JSON.stringify(hexes, null, 2);
    case 'css':
      return hexes
        .map((hex, i) => `--color-${i + 1}: ${hex};`)
        .join('\n');
    case 'tailwind':
      return `colors: {\n  palette: {\n${hexes
        .map((hex, i) => `    ${i + 1}: '${hex}',`)
        .join('\n')}\n  }\n}`;
    case 'scss':
      return hexes
        .map((hex, i) => `$color-${i + 1}: ${hex};`)
        .join('\n');
    default:
      return '';
  }
}

export function ColorPaletteTool() {
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [colors, setColors] = useState<ColorInfo[]>([]);
  const [baseHex, setBaseHex] = useState('#3b82f6');
  const [harmony, setHarmony] = useState<HarmonyType>('triadic');
  const [exportFormat, setExportFormat] = useState<ExportFormat>('json');
  const [loading, setLoading] = useState(false);

  const harmonyColors = useMemo(
    () => generateHarmony(baseHex, harmony),
    [baseHex, harmony]
  );

  const handleFiles = useCallback((files: File[]) => {
    const f = files[0];
    if (!f) return;

    const prev = imageUrl;
    if (prev) URL.revokeObjectURL(prev);

    setFile(f);
    const url = URL.createObjectURL(f);
    setImageUrl(url);
    setLoading(true);

    extractDominantColors(url)
      .then(setColors)
      .catch(() => setColors([]))
      .finally(() => setLoading(false));
  }, [imageUrl]);

  useClipboardPaste(handleFiles, !file);

  const exportText = useMemo(
    () => formatExport(colors, exportFormat),
    [colors, exportFormat]
  );

  const handleReset = useCallback(() => {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    setFile(null);
    setImageUrl(null);
    setColors([]);
  }, [imageUrl]);

  return (
    <div className="space-y-6">
      {!file && (
        <EmptyState
          icon={Pipette}
          title="Color Palette from Image"
          description="Upload an image to extract its dominant colors"
          hint="Tip: ⌘V to paste an image from clipboard"
        >
          <FileDropzone
            onFiles={handleFiles}
            accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.bmp'] }}
            label="Drop an image"
            hint="PNG, JPG, WebP, GIF, or BMP — or paste from clipboard"
          />
        </EmptyState>
      )}

      {file && (
        <>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-border">
                <img
                  src={imageUrl!}
                  alt="Uploaded"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {loading ? 'Extracting colors…' : `${colors.length} dominant colors`}
                </p>
                <Button variant="ghost" size="sm" className="mt-2" onClick={handleReset}>
                  New image
                </Button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="h-24 rounded-md bg-muted" />
                    <div className="mt-2 h-4 bg-muted rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : colors.length > 0 && (
            <>
              <div>
                <p className="mb-3 text-sm font-medium">Color swatches</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {colors.map((c, i) => (
                    <Card key={i}>
                      <CardContent className="p-4 space-y-3">
                        <div
                          className={cn(
                            'h-24 w-full rounded-md border border-border',
                            'ring-offset-background focus-visible:ring-2 focus-visible:ring-ring'
                          )}
                          style={{ backgroundColor: c.hex }}
                        />
                        <div className="space-y-1 text-xs font-mono">
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">HEX</span>
                            <span className="flex-1 truncate">{c.hex}</span>
                            <CopyButton value={c.hex} size="sm" toolId="color-palette" />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground shrink-0">RGB</span>
                            <span className="flex-1 truncate">
                              rgb({c.rgb.r}, {c.rgb.g}, {c.rgb.b})
                            </span>
                            <CopyButton
                              value={`rgb(${c.rgb.r}, ${c.rgb.g}, ${c.rgb.b})`}
                              size="sm"
                              toolId="color-palette"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground shrink-0">HSL</span>
                            <span className="flex-1 truncate">
                              hsl({c.hsl.h}, {c.hsl.s}%, {c.hsl.l}%)
                            </span>
                            <CopyButton
                              value={`hsl(${c.hsl.h}, ${c.hsl.s}%, ${c.hsl.l}%)`}
                              size="sm"
                              toolId="color-palette"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium">Export palette</p>
                <ToggleGroup
                  type="single"
                  value={exportFormat}
                  onValueChange={(v) => v && setExportFormat(v as ExportFormat)}
                >
                  <ToggleGroupItem value="json">JSON</ToggleGroupItem>
                  <ToggleGroupItem value="css">CSS Vars</ToggleGroupItem>
                  <ToggleGroupItem value="tailwind">Tailwind</ToggleGroupItem>
                  <ToggleGroupItem value="scss">SCSS</ToggleGroupItem>
                </ToggleGroup>
                <div className="flex gap-2">
                  <Textarea
                    readOnly
                    value={exportText}
                    className="min-h-[120px] flex-1 font-mono text-xs"
                  />
                  <CopyButton value={exportText} toolId="color-palette" className="shrink-0" />
                </div>
              </div>
            </>
          )}
        </>
      )}

      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Palette className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Harmonious Palettes</h3>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">Base Color</p>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={baseHex}
                  onChange={(e) => setBaseHex(e.target.value)}
                  className="h-10 w-20 cursor-pointer rounded border border-border bg-transparent"
                />
                <input
                  type="text"
                  value={baseHex}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) setBaseHex(val);
                  }}
                  className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="#000000"
                />
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">Harmony Type</p>
              <ToggleGroup
                type="single"
                value={harmony}
                onValueChange={(v) => v && setHarmony(v as HarmonyType)}
                className="justify-start"
              >
                <ToggleGroupItem value="complementary">Complementary</ToggleGroupItem>
                <ToggleGroupItem value="analogous">Analogous</ToggleGroupItem>
                <ToggleGroupItem value="triadic">Triadic</ToggleGroupItem>
                <ToggleGroupItem value="split">Split</ToggleGroupItem>
                <ToggleGroupItem value="tetradic">Tetradic</ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Result</p>
            <div className="flex gap-2">
              {harmonyColors.map((color, i) => (
                <div
                  key={`${color}-${i}`}
                  className="group relative flex-1 cursor-pointer"
                  onClick={() => setBaseHex(color)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setBaseHex(color); }}
                >
                  <div
                    className="h-20 rounded-md border border-border transition-transform group-hover:scale-[1.03]"
                    style={{ background: color }}
                  />
                  <div className="mt-1 flex flex-col items-center gap-1">
                    <code className="text-[10px]">{color}</code>
                    <CopyButton value={color} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
