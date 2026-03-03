'use client';

import { createContext, type ReactNode, useContext } from 'react';
import { Download } from 'lucide-react';

import { FormatSelector } from '@/components/shared/format-selector';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  type BackgroundMode,
  clampDimension,
  IMAGE_PLACEHOLDER_FORMATS,
  IMAGE_PLACEHOLDER_PRESETS,
  type PlaceholderFormat,
} from '@/lib/image/image-placeholder';

interface ImagePlaceholderContextValue {
  bgMode: BackgroundMode;
  fontSize: number;
  format: PlaceholderFormat;
  gradientAngle: number;
  gradientColor1: string;
  gradientColor2: string;
  handleDownload: () => void;
  height: number;
  overlayText: string;
  setBgMode: (value: BackgroundMode) => void;
  setFontSize: (value: number) => void;
  setFormat: (value: PlaceholderFormat) => void;
  setGradientAngle: (value: number) => void;
  setGradientColor1: (value: string) => void;
  setGradientColor2: (value: string) => void;
  setHeight: (value: number) => void;
  setOverlayText: (value: string) => void;
  setSolidColor: (value: string) => void;
  setTextColor: (value: string) => void;
  setTextOverlay: (value: boolean) => void;
  setWidth: (value: number) => void;
  solidColor: string;
  textColor: string;
  textOverlay: boolean;
  width: number;
}

const ImagePlaceholderContext = createContext<ImagePlaceholderContextValue | null>(null);

export function ImagePlaceholderProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: ImagePlaceholderContextValue;
}) {
  return (
    <ImagePlaceholderContext.Provider value={value}>
      {children}
    </ImagePlaceholderContext.Provider>
  );
}

function useImagePlaceholderContext(): ImagePlaceholderContextValue {
  const context = useContext(ImagePlaceholderContext);
  if (!context) {
    throw new Error('useImagePlaceholderContext must be used within ImagePlaceholderProvider');
  }
  return context;
}

export function SettingsPanel() {
  const {
    bgMode,
    fontSize,
    format,
    gradientAngle,
    gradientColor1,
    gradientColor2,
    height,
    overlayText,
    solidColor,
    textColor,
    textOverlay,
    width,
    handleDownload,
    setBgMode,
    setFontSize,
    setFormat,
    setGradientAngle,
    setGradientColor1,
    setGradientColor2,
    setHeight,
    setOverlayText,
    setSolidColor,
    setTextColor,
    setTextOverlay,
    setWidth,
  } = useImagePlaceholderContext();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">Width</p>
          <Input
            type="number"
            min={1}
            max={4096}
            value={width}
            onChange={(event) => setWidth(clampDimension(Number.parseInt(event.target.value, 10)))}
          />
        </div>
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">Height</p>
          <Input
            type="number"
            min={1}
            max={4096}
            value={height}
            onChange={(event) => setHeight(clampDimension(Number.parseInt(event.target.value, 10)))}
          />
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">Quick presets</p>
        <Select
          onValueChange={(value) => {
            const [presetWidth, presetHeight] = value.split('x').map(Number);
            setWidth(presetWidth);
            setHeight(presetHeight);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a preset..." />
          </SelectTrigger>
          <SelectContent>
            {IMAGE_PLACEHOLDER_PRESETS.map(({ h, w }) => (
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
            onValueChange={(value) => {
              if (value) {
                setBgMode(value as BackgroundMode);
              }
            }}
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
                onChange={(event) => setSolidColor(event.target.value)}
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
                onChange={(event) => setGradientColor1(event.target.value)}
                className="h-9 w-9 shrink-0 cursor-pointer rounded-md border border-border bg-transparent p-1"
              />
              <input
                type="color"
                value={gradientColor2}
                onChange={(event) => setGradientColor2(event.target.value)}
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
              onValueChange={([value]) => setGradientAngle(value)}
            />
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Checkbox
            id="text-overlay"
            checked={textOverlay}
            onCheckedChange={(checked) => setTextOverlay(checked === true)}
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
                onChange={(event) => setOverlayText(event.target.value)}
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
                    onValueChange={([value]) => setFontSize(value)}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={textColor}
                  onChange={(event) => setTextColor(event.target.value)}
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
          onChange={(value) => setFormat(value as PlaceholderFormat)}
          formats={IMAGE_PLACEHOLDER_FORMATS.map((item) => ({ id: item.id, label: item.label }))}
        />
        <Button onClick={handleDownload}>
          <Download className="mr-2 h-4 w-4" />
          Download
        </Button>
      </div>
    </div>
  );
}
