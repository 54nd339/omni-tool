'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { toast } from 'sonner';

import { useToolParams } from '@/hooks/use-tool-params';
import {
  type BackgroundMode,
  buildPlaceholderSvg,
  drawPlaceholderCanvas,
  type PlaceholderFormat,
  type PlaceholderRenderConfig,
  resolveOverlayText,
} from '@/lib/image/image-placeholder';
import { downloadBlob } from '@/lib/utils';

const PARAM_DEFAULTS = {
  bgMode: 'solid',
  fontSize: '32',
  format: 'png',
  gradientAngle: '90',
  gradientColor1: '#6366f1',
  gradientColor2: '#ec4899',
  height: '600',
  overlayText: '{width} x {height}',
  solidColor: '#94a3b8',
  textColor: '#1e293b',
  textOverlay: 'false',
  width: '800',
};

function toNumber(value: string, fallback: number, min: number, max: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, Math.round(parsed)));
}

export function useImagePlaceholder() {
  const [params, setParams] = useToolParams(PARAM_DEFAULTS);
  const download = downloadBlob;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const width = toNumber(params.width, 800, 1, 5000);
  const height = toNumber(params.height, 600, 1, 5000);
  const bgMode = params.bgMode as BackgroundMode;
  const solidColor = params.solidColor;
  const gradientColor1 = params.gradientColor1;
  const gradientColor2 = params.gradientColor2;
  const gradientAngle = toNumber(params.gradientAngle, 90, 0, 360);
  const textOverlay = params.textOverlay === 'true';
  const overlayText = params.overlayText;
  const fontSize = toNumber(params.fontSize, 32, 8, 256);
  const textColor = params.textColor;
  const format = params.format as PlaceholderFormat;

  const setWidth = useCallback((nextWidth: number) => setParams({ width: String(nextWidth) }), [setParams]);
  const setHeight = useCallback((nextHeight: number) => setParams({ height: String(nextHeight) }), [setParams]);
  const setBgMode = useCallback((nextBgMode: BackgroundMode) => setParams({ bgMode: nextBgMode }), [setParams]);
  const setSolidColor = useCallback((nextSolidColor: string) => setParams({ solidColor: nextSolidColor }), [setParams]);
  const setGradientColor1 = useCallback((nextGradientColor1: string) => setParams({ gradientColor1: nextGradientColor1 }), [setParams]);
  const setGradientColor2 = useCallback((nextGradientColor2: string) => setParams({ gradientColor2: nextGradientColor2 }), [setParams]);
  const setGradientAngle = useCallback((nextGradientAngle: number) => setParams({ gradientAngle: String(nextGradientAngle) }), [setParams]);
  const setTextOverlay = useCallback((nextTextOverlay: boolean) => setParams({ textOverlay: nextTextOverlay ? 'true' : 'false' }), [setParams]);
  const setOverlayText = useCallback((nextOverlayText: string) => setParams({ overlayText: nextOverlayText }), [setParams]);
  const setFontSize = useCallback((nextFontSize: number) => setParams({ fontSize: String(nextFontSize) }), [setParams]);
  const setTextColor = useCallback((nextTextColor: string) => setParams({ textColor: nextTextColor }), [setParams]);
  const setFormat = useCallback((nextFormat: PlaceholderFormat) => setParams({ format: nextFormat }), [setParams]);

  const renderConfig = useMemo<PlaceholderRenderConfig>(() => ({
    bgMode,
    fontSize,
    gradientAngle,
    gradientColor1,
    gradientColor2,
    height,
    solidColor,
    textColor,
    textOverlay,
    width,
  }), [
    bgMode,
    fontSize,
    gradientAngle,
    gradientColor1,
    gradientColor2,
    height,
    solidColor,
    textColor,
    textOverlay,
    width,
  ]);

  const resolvedText = useMemo(() => resolveOverlayText(overlayText, width, height), [overlayText, width, height]);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      drawPlaceholderCanvas(canvas, renderConfig, resolvedText);
    }
  }, [renderConfig, resolvedText]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  const handleDownload = useCallback(() => {
    try {
      if (format === 'svg') {
        const svg = buildPlaceholderSvg(renderConfig, resolvedText);
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
  }, [download, format, renderConfig, resolvedText]);

  return {
    bgMode,
    canvasRef,
    fontSize,
    format,
    gradientAngle,
    gradientColor1,
    gradientColor2,
    handleDownload,
    height,
    overlayText,
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
    solidColor,
    textColor,
    textOverlay,
    width,
  };
}