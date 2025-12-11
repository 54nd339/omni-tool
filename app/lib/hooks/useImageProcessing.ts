import { useState, useRef, useCallback } from 'react';
import { processImageCanvas } from '@/app/lib/utils';
import { ImageDimensions, ImageSettings, TargetFormat } from '@/app/lib/types';

export const useImageProcessing = () => {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [originalDims, setOriginalDims] = useState<ImageDimensions | null>(null);
  const [newDims, setNewDims] = useState<ImageDimensions | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const processImage = useCallback(
    async (imageUrl: string, options: ImageSettings, format: TargetFormat) => {
      if (!canvasRef.current) return;
      setLoading(true);
      try {
        const { dataUrl, dims } = await processImageCanvas(imageUrl, options, canvasRef.current, format);
        setPreview(dataUrl);
        if (dims) setNewDims(dims);
      } catch (error) {
        console.error('Image processing error:', error);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const reset = useCallback(() => {
    setPreview(null);
    setOriginalDims(null);
    setNewDims(null);
  }, []);

  return {
    loading,
    preview,
    originalDims,
    newDims,
    canvasRef,
    processImage,
    setOriginalDims,
    reset,
  };
};
