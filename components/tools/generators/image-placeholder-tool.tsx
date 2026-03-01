'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Download } from 'lucide-react';
import { toast } from 'sonner';
import { useDownload } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { FormatSelector } from '@/components/shared/format-selector';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type BackgroundMode = 'solid' | 'linear' | 'radial';
type Format = 'png' | 'svg' | 'webp';

const PRESETS = [
  { w: 1920, h: 1080 },
  { w: 1280, h: 720 },
  { w: 800, h: 600 },
  { w: 400, h: 300 },
  { w: 256, h: 256 },
  { w: 128, h: 128 },
] as const;

const FORMATS = [
  { id: 'png', label: 'PNG' },
  { id: 'svg', label: 'SVG' },
  { id: 'webp', label: 'WebP' },
] as const;

function hexToRgba(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return 'rgba(0,0,0,0)';
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  return `rgba(${r},${g},${b},1)`;
}

export function ImagePlaceholderTool() {
  const { download } = useDownload();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);
  const [bgMode, setBgMode] = useState<BackgroundMode>('solid');
  const [solidColor, setSolidColor] = useState('#94a3b8');
  const [gradientColor1, setGradientColor1] = useState('#6366f1');
  const [gradientColor2, setGradientColor2] = useState('#ec4899');
  const [gradientAngle, setGradientAngle] = useState(90);
  const [textOverlay, setTextOverlay] = useState(false);
  const [overlayText, setOverlayText] = useState('{width} x {height}');
  const [fontSize, setFontSize] = useState(32);
  const [textColor, setTextColor] = useState('#1e293b');
  const [format, setFormat] = useState<Format>('png');

  const resolvedText = overlayText
    .replace(/\{width\}/gi, String(width))
    .replace(/\{height\}/gi, String(height));

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (bgMode === 'solid') {
      ctx.fillStyle = hexToRgba(solidColor);
      ctx.fillRect(0, 0, width, height);
    } else if (bgMode === 'linear') {
      const rad = (gradientAngle * Math.PI) / 180;
      const dx = Math.cos(rad) * width;
      const dy = Math.sin(rad) * height;
      const grad = ctx.createLinearGradient(0, 0, dx, dy);
      grad.addColorStop(0, hexToRgba(gradientColor1));
      grad.addColorStop(1, hexToRgba(gradientColor2));
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    } else {
      const cx = width / 2;
      const cy = height / 2;
      const r = Math.max(width, height) / 2;
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      grad.addColorStop(0, hexToRgba(gradientColor1));
      grad.addColorStop(1, hexToRgba(gradientColor2));
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    }

    if (textOverlay && resolvedText) {
      ctx.fillStyle = hexToRgba(textColor);
      ctx.font = `600 ${fontSize}px system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(resolvedText, width / 2, height / 2);
    }
  }, [
    width,
    height,
    bgMode,
    solidColor,
    gradientColor1,
    gradientColor2,
    gradientAngle,
    textOverlay,
    resolvedText,
    fontSize,
    textColor,
  ]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  const handleDownload = useCallback(() => {
    try {
      if (format === 'svg') {
        let bg = '';
        if (bgMode === 'solid') {
          bg = `<rect width="${width}" height="${height}" fill="${solidColor}"/>`;
        } else if (bgMode === 'linear') {
          const rad = (gradientAngle * Math.PI) / 180;
          const x1 = 0.5 - 0.5 * Math.cos(rad);
          const y1 = 0.5 - 0.5 * Math.sin(rad);
          const x2 = 0.5 + 0.5 * Math.cos(rad);
          const y2 = 0.5 + 0.5 * Math.sin(rad);
          bg = `<defs><linearGradient id="g" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"><stop offset="0%" stop-color="${gradientColor1}"/><stop offset="100%" stop-color="${gradientColor2}"/></linearGradient></defs><rect width="${width}" height="${height}" fill="url(#g)"/>`;
        } else {
          bg = `<defs><radialGradient id="g" cx="50%" cy="50%" r="70%"><stop offset="0%" stop-color="${gradientColor1}"/><stop offset="100%" stop-color="${gradientColor2}"/></radialGradient></defs><rect width="${width}" height="${height}" fill="url(#g)"/>`;
        }
        const escapedText = resolvedText
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
        const textEl =
          textOverlay && resolvedText
            ? `<text x="${width / 2}" y="${height / 2}" fill="${textColor}" font-size="${fontSize}" font-weight="600" text-anchor="middle" dominant-baseline="central" font-family="system-ui,sans-serif">${escapedText}</text>`
            : '';
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${bg}${textEl}</svg>`;
        const blob = new Blob([svg], { type: 'image/svg+xml' });
        download(blob, 'placeholder.svg');
      } else {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const mime = format === 'png' ? 'image/png' : 'image/webp';
        canvas.toBlob(
          (blob) => {
            if (blob) {
              download(blob, `placeholder.${format}`);
            }
          },
          mime,
          0.95,
        );
      }
      toast.success(`Downloaded ${format.toUpperCase()}`);
    } catch {
      toast.error('Download failed');
    }
  }, [
    format,
    width,
    height,
    bgMode,
    solidColor,
    gradientColor1,
    gradientColor2,
    gradientAngle,
    textOverlay,
    resolvedText,
    fontSize,
    textColor,
    download,
  ]);

  const applyPreset = useCallback((w: number, h: number) => {
    setWidth(w);
    setHeight(h);
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">Width</p>
              <Input
                type="number"
                min={1}
                max={4096}
                value={width}
                onChange={(e) => setWidth(Math.max(1, Math.min(4096, parseInt(e.target.value, 10) || 1)))}
              />
            </div>
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">Height</p>
              <Input
                type="number"
                min={1}
                max={4096}
                value={height}
                onChange={(e) => setHeight(Math.max(1, Math.min(4096, parseInt(e.target.value, 10) || 1)))}
              />
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Quick presets</p>
            <Select onValueChange={(v) => {
              const [w, h] = v.split('x').map(Number);
              applyPreset(w, h);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Select a preset..." />
              </SelectTrigger>
              <SelectContent>
                {PRESETS.map(({ w, h }) => (
                  <SelectItem key={`${w}x${h}`} value={`${w}x${h}`}>
                    {w} × {h}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Background</p>
            <div className="flex flex-wrap items-center gap-4">
              <ToggleGroup
                type="single"
                value={bgMode}
                onValueChange={(v) => v && setBgMode(v as BackgroundMode)}
              >
                <ToggleGroupItem value="solid">Solid</ToggleGroupItem>
                <ToggleGroupItem value="linear">Linear</ToggleGroupItem>
                <ToggleGroupItem value="radial">Radial</ToggleGroupItem>
              </ToggleGroup>

              {bgMode === 'solid' && (
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={solidColor}
                    onChange={(e) => setSolidColor(e.target.value)}
                    className="h-9 w-9 shrink-0 cursor-pointer rounded-md border border-border bg-transparent p-1"
                  />
                  <code className="text-xs text-muted-foreground">{solidColor}</code>
                </div>
              )}
              {(bgMode === 'linear' || bgMode === 'radial') && (
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={gradientColor1}
                    onChange={(e) => setGradientColor1(e.target.value)}
                    className="h-9 w-9 shrink-0 cursor-pointer rounded-md border border-border bg-transparent p-1"
                  />
                  <input
                    type="color"
                    value={gradientColor2}
                    onChange={(e) => setGradientColor2(e.target.value)}
                    className="h-9 w-9 shrink-0 cursor-pointer rounded-md border border-border bg-transparent p-1"
                  />
                </div>
              )}
            </div>

            {bgMode === 'linear' && (
              <div className="mt-4">
                <p className="mb-2 text-xs text-muted-foreground">Angle: {gradientAngle}°</p>
                <Slider
                  min={0}
                  max={360}
                  step={1}
                  value={[gradientAngle]}
                  onValueChange={([v]) => setGradientAngle(v)}
                />
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Checkbox
                id="text-overlay"
                checked={textOverlay}
                onCheckedChange={(c) => setTextOverlay(c === true)}
              />
              <label htmlFor="text-overlay" className="text-sm">
                Text overlay
              </label>
            </div>
            {textOverlay && (
              <div className="space-y-4 pl-6 pt-2">
                <div>
                  <p className="mb-2 text-xs text-muted-foreground">Text (use {'{width}'}, {'{height}'})</p>
                  <Input
                    value={overlayText}
                    onChange={(e) => setOverlayText(e.target.value)}
                    placeholder="{width} x {height}"
                  />
                </div>
                <div className="grid grid-cols-[1fr_auto] items-end gap-6">
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Font size: {fontSize}</p>
                    <div className="flex h-10 items-center">
                      <Slider
                        min={12}
                        max={240}
                        step={1}
                        value={[fontSize]}
                        onValueChange={([v]) => setFontSize(v)}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="h-10 w-10 shrink-0 cursor-pointer rounded-md border border-border bg-transparent p-1"
                    />
                    <code className="text-xs text-muted-foreground">{textColor}</code>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <FormatSelector
              value={format}
              onChange={(v) => setFormat(v as Format)}
              formats={FORMATS.map((f) => ({ id: f.id, label: f.label }))}
            />
            <Button onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </div>
        </div>

        <div className="flex min-h-[200px] items-center justify-center">
          <div className="max-h-[400px] overflow-auto rounded-lg border border-border bg-muted/20 p-4">
            <canvas
              ref={canvasRef}
              className="block max-w-full max-h-[400px] w-auto rounded object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
