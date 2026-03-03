'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { useToolParams } from '@/hooks/use-tool-params';
import { useSvgOptimizer } from '@/hooks/worker-hooks';
import { downloadBlob, formatBytes } from '@/lib/utils';

const PARAM_DEFAULTS = {
  precision: '3',
};

export function useSvgOptimizerTool() {
  const { error, optimize: optimizeSvg, status } = useSvgOptimizer();
  const [params, setParams] = useToolParams(PARAM_DEFAULTS);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const precision = Math.max(0, Math.min(8, Number(params.precision) || 3));
  const loading = status === 'loading' || status === 'processing';

  const handleFiles = useCallback(async (files: File[]) => {
    const file = files[0];
    if (!file) return;
    const text = await file.text();
    setInput(text);
    setOutput('');
  }, []);

  const optimize = useCallback(async () => {
    if (!input.trim()) return;
    try {
      const result = await optimizeSvg(input, precision);
      setOutput(result.output);
      toast.success(`Saved ${formatBytes(result.savedBytes)}`);
    } catch (workerError) {
      toast.error(
        workerError instanceof Error
          ? workerError.message
          : error ?? 'Optimization failed',
      );
    }
  }, [error, input, optimizeSvg, precision]);

  const handleDownload = useCallback(() => {
    if (!output) return;
    downloadBlob(new Blob([output], { type: 'image/svg+xml' }), 'optimized.svg');
  }, [output]);

  const inputSize = input ? new Blob([input]).size : 0;
  const outputSize = output ? new Blob([output]).size : 0;

  const inputPreviewUrl = useMemo(
    () =>
      input
        ? URL.createObjectURL(new Blob([input], { type: 'image/svg+xml' }))
        : null,
    [input],
  );
  const outputPreviewUrl = useMemo(
    () =>
      output
        ? URL.createObjectURL(new Blob([output], { type: 'image/svg+xml' }))
        : null,
    [output],
  );

  useEffect(() => {
    return () => {
      if (inputPreviewUrl) URL.revokeObjectURL(inputPreviewUrl);
    };
  }, [inputPreviewUrl]);

  useEffect(() => {
    return () => {
      if (outputPreviewUrl) URL.revokeObjectURL(outputPreviewUrl);
    };
  }, [outputPreviewUrl]);

  return {
    handleDownload,
    handleFiles,
    input,
    inputPreviewUrl,
    inputSize,
    loading,
    optimize,
    output,
    outputPreviewUrl,
    outputSize,
    precision,
    setInput,
    setOutput,
    setParams,
  };
}
