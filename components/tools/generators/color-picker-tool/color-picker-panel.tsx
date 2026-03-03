'use client';

import { type ChangeEvent,useCallback, useMemo } from 'react';

import { CopyButton } from '@/components/shared/tool-actions/copy-button';
import { Input } from '@/components/ui/input';
import {
  contrastRatio,
  generateShades,
  hexToRgb,
  hslToRgb,
  rgbToHex,
  rgbToHsl,
} from '@/lib/image/color-picker';

interface ColorPickerPanelProps {
  colorHex: string;
  onHexChange: (hex: string) => void;
}

export function ColorPickerPanel({ colorHex, onHexChange }: ColorPickerPanelProps) {
  const rgb = useMemo(() => hexToRgb(colorHex), [colorHex]);
  const hsl = useMemo(() => rgbToHsl(...rgb), [rgb]);
  const shades = useMemo(() => generateShades(colorHex), [colorHex]);

  const hexString = colorHex.toUpperCase();
  const rgbString = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
  const hslString = `hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)`;

  const contrastWhite = useMemo(() => contrastRatio(rgb, [255, 255, 255]), [rgb]);
  const contrastBlack = useMemo(() => contrastRatio(rgb, [0, 0, 0]), [rgb]);

  const wcagLabel = useCallback((ratio: number) => {
    if (ratio >= 7) return 'AAA';
    if (ratio >= 4.5) return 'AA';
    if (ratio >= 3) return 'AA Large';
    return 'Fail';
  }, []);

  const cssVars = useMemo(
    () => shades.map((shade, index) => `  --color-shade-${index + 1}: ${shade};`).join('\n'),
    [shades],
  );

  const handleHexInput = useCallback((value: string) => {
    const normalized = value.startsWith('#') ? value : `#${value}`;
    if (/^#[0-9a-fA-F]{6}$/.test(normalized)) onHexChange(normalized.toLowerCase());
  }, [onHexChange]);

  const handleRgbChange = useCallback((r: number, g: number, b: number) => {
    onHexChange(
      rgbToHex(
        Math.min(255, Math.max(0, r)),
        Math.min(255, Math.max(0, g)),
        Math.min(255, Math.max(0, b)),
      ),
    );
  }, [onHexChange]);

  const handleHslChange = useCallback((hue: number, saturation: number, lightness: number) => {
    onHexChange(
      rgbToHex(
        ...hslToRgb(
          Math.min(360, Math.max(0, hue)),
          Math.min(100, Math.max(0, saturation)),
          Math.min(100, Math.max(0, lightness)),
        ),
      ),
    );
  }, [onHexChange]);

  const handleImageExtract = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const context = canvas.getContext('2d');
      if (!context) return;
      context.drawImage(image, 0, 0, 1, 1);
      const [r, g, b] = context.getImageData(0, 0, 1, 1).data;
      onHexChange(rgbToHex(r, g, b));
      URL.revokeObjectURL(image.src);
    };
    image.src = URL.createObjectURL(file);
  }, [onHexChange]);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-[200px_1fr]">
        <div className="space-y-3">
          <div className="h-40 w-full rounded-lg border border-border" style={{ backgroundColor: colorHex }} />
          <input
            type="color"
            value={colorHex}
            onChange={(event) => onHexChange(event.target.value)}
            className="h-10 w-full cursor-pointer rounded border border-border"
          />
          <div>
            <p className="mb-1 text-[11px] text-muted-foreground">Extract from image</p>
            <input type="file" accept="image/*" onChange={handleImageExtract} className="text-xs" />
          </div>
          <div className="space-y-1 rounded-md border border-border bg-muted/20 p-2 text-xs">
            <p>White contrast: {contrastWhite.toFixed(2)} ({wcagLabel(contrastWhite)})</p>
            <p>Black contrast: {contrastBlack.toFixed(2)} ({wcagLabel(contrastBlack)})</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">HEX</p>
            <div className="flex items-center gap-2">
              <Input value={hexString} onChange={(event) => handleHexInput(event.target.value)} className="font-mono" />
              <CopyButton value={hexString} size="sm" className="h-7 w-7" />
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">RGB</p>
            <div className="flex items-center gap-2">
              <div className="grid flex-1 grid-cols-3 gap-2">
                <Input type="number" min={0} max={255} value={rgb[0]} onChange={(event) => handleRgbChange(+event.target.value, rgb[1], rgb[2])} className="font-mono" />
                <Input type="number" min={0} max={255} value={rgb[1]} onChange={(event) => handleRgbChange(rgb[0], +event.target.value, rgb[2])} className="font-mono" />
                <Input type="number" min={0} max={255} value={rgb[2]} onChange={(event) => handleRgbChange(rgb[0], rgb[1], +event.target.value)} className="font-mono" />
              </div>
              <CopyButton value={rgbString} size="sm" className="h-7 w-7" />
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">HSL</p>
            <div className="flex items-center gap-2">
              <div className="grid flex-1 grid-cols-3 gap-2">
                <Input type="number" min={0} max={360} value={hsl[0]} onChange={(event) => handleHslChange(+event.target.value, hsl[1], hsl[2])} className="font-mono" />
                <Input type="number" min={0} max={100} value={hsl[1]} onChange={(event) => handleHslChange(hsl[0], +event.target.value, hsl[2])} className="font-mono" />
                <Input type="number" min={0} max={100} value={hsl[2]} onChange={(event) => handleHslChange(hsl[0], hsl[1], +event.target.value)} className="font-mono" />
              </div>
              <CopyButton value={hslString} size="sm" className="h-7 w-7" />
            </div>
          </div>
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">Shades</p>
        <div className="flex overflow-hidden rounded-md border border-border">
          {shades.map((shade, index) => (
            <div
              key={`${shade}-${index}`}
              onClick={() => onHexChange(shade)}
              className="group relative flex-1 cursor-pointer"
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') onHexChange(shade);
              }}
            >
              <div className="h-12" style={{ background: shade }} />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                <CopyButton value={shade} size="sm" className="bg-background/80" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-medium text-muted-foreground">CSS Variables</p>
          <CopyButton value={`:root {\n${cssVars}\n}`} size="sm" />
        </div>
        <pre className="rounded-md border border-border bg-muted/50 p-3 text-xs">{`:root {\n${cssVars}\n}`}</pre>
      </div>
    </div>
  );
}
