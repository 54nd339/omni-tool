'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { useClipboardPaste } from '@/hooks/use-clipboard-paste';
import { useAspectRatioPadWorkerApi } from '@/hooks/worker-hooks';
import { ASPECT_RATIOS, PAD_COLORS } from '@/lib/constants/image-studio';
import {
  computePadDimensions,
  getCalculatedRatio,
  getPresetRatioById,
} from '@/lib/image/aspect-ratio-pad';
import {
  readImageDimensions,
  revokeUrl,
  toPaddedFileName,
} from '@/lib/image/aspect-ratio-pad-client';
import { downloadBlob } from '@/lib/utils';
import type { AspectRatio } from '@/types/common';

export function useAspectRatioPad() {
  const { error: padError, padImage, status } = useAspectRatioPadWorkerApi();
  const download = downloadBlob;

  const [file, setFile] = useState<File | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  const [selectedRatio, setSelectedRatio] = useState<AspectRatio>(ASPECT_RATIOS[0]);
  const [colorMode, setColorMode] = useState('white');
  const [customColor, setCustomColor] = useState('#000000');
  const [imgDimensions, setImgDimensions] = useState({ width: 0, height: 0 });

  const [calcExpanded, setCalcExpanded] = useState(false);
  const [calcWidth, setCalcWidth] = useState('1920');
  const [calcHeight, setCalcHeight] = useState('1080');

  const calcRatio = useMemo(() => getCalculatedRatio(calcWidth, calcHeight), [calcWidth, calcHeight]);

  const handleCalcPreset = useCallback(
    (pw: number, ph: number, ratioId: string | null) => {
      const currentW = parseFloat(calcWidth);
      if (currentW && !Number.isNaN(currentW)) {
        setCalcHeight(String(Math.round(currentW * (ph / pw))));
      } else {
        setCalcWidth(String(pw * 100));
        setCalcHeight(String(ph * 100));
      }
      const match = getPresetRatioById(ratioId);
      if (match) setSelectedRatio(match);
    },
    [calcWidth],
  );

  const handleCalcWidthChange = useCallback((newWidth: string) => {
    setCalcWidth(newWidth);
    const nextRatio = getCalculatedRatio(newWidth, calcHeight);
    if (nextRatio && parseFloat(newWidth)) {
      setCalcHeight(String(Math.round(parseFloat(newWidth) * (nextRatio.h / nextRatio.w))));
    }
  }, [calcHeight]);

  const handleCalcHeightChange = useCallback((newHeight: string) => {
    setCalcHeight(newHeight);
    const nextRatio = getCalculatedRatio(calcWidth, newHeight);
    if (nextRatio && parseFloat(newHeight)) {
      setCalcWidth(String(Math.round(parseFloat(newHeight) * (nextRatio.w / nextRatio.h))));
    }
  }, [calcWidth]);

  const calcResultText = calcRatio ? `${calcRatio.w}:${calcRatio.h}` : '';

  const [inputUrl, setInputUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      revokeUrl(inputUrl);
      revokeUrl(resultUrl);
    };
  }, [inputUrl, resultUrl]);

  const handleFiles = useCallback((files: File[]) => {
    const selectedFile = files[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    revokeUrl(inputUrl);
    revokeUrl(resultUrl);
    setResultUrl(null);
    setResultBlob(null);

    const url = URL.createObjectURL(selectedFile);
    setInputUrl(url);

    readImageDimensions(selectedFile)
      .then(({ width, height }) => setImgDimensions({ width, height }))
      .catch(() => toast.error('Could not read image dimensions'));
  }, [inputUrl, resultUrl]);

  useClipboardPaste(handleFiles, !file);

  const fillColor =
    colorMode === 'custom'
      ? customColor
      : PAD_COLORS.find((c): c is typeof c & { value: string } => c.id === colorMode && 'value' in c)?.value ?? '#ffffff';

  const padDims =
    imgDimensions.width > 0
      ? computePadDimensions(imgDimensions.width, imgDimensions.height, selectedRatio)
      : null;

  const handlePad = useCallback(async () => {
    if (!file || !padDims) return;

    try {
      const blob = await padImage({
        file,
        fillColor,
        target: padDims,
      });

      revokeUrl(resultUrl);
      setResultUrl(URL.createObjectURL(blob));
      setResultBlob(blob);
      toast.success('Image padded');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : padError ?? 'Padding failed',
      );
    }
  }, [file, fillColor, padDims, padError, padImage, resultUrl]);

  const handleDownload = useCallback(() => {
    if (!resultBlob || !file) return;
    download(resultBlob, toPaddedFileName(file.name));
  }, [download, file, resultBlob]);

  const handleReset = useCallback(() => {
    revokeUrl(inputUrl);
    revokeUrl(resultUrl);
    setFile(null);
    setResultUrl(null);
    setResultBlob(null);
    setInputUrl(null);
  }, [inputUrl, resultUrl]);

  const paddedFileName = file ? toPaddedFileName(file.name) : 'padded.png';
  const isProcessing = status === 'loading' || status === 'processing';

  return {
    calcExpanded,
    calcHeight,
    calcRatio,
    calcResultText,
    calcWidth,
    colorMode,
    customColor,
    file,
    handleCalcHeightChange,
    handleCalcPreset,
    handleCalcWidthChange,
    handleDownload,
    handleFiles,
    handlePad,
    handleReset,
    imgDimensions,
    inputUrl,
    isProcessing,
    padDims,
    paddedFileName,
    resultBlob,
    resultUrl,
    selectedRatio,
    setCalcExpanded,
    setColorMode,
    setCustomColor,
    setSelectedRatio,
  };
}