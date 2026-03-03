export interface OptimizeSvgOptions {
  input: string;
  precision: number;
}

export interface OptimizeSvgResult {
  output: string;
  savedBytes: number;
}

export async function optimizeSvg(
  options: OptimizeSvgOptions,
): Promise<OptimizeSvgResult> {
  const { input, precision } = options;
  const { optimize } = await import('svgo/browser');
  const result = optimize(input, {
    floatPrecision: precision,
    multipass: true,
  });

  const savedBytes =
    new Blob([input]).size - new Blob([result.data]).size;

  return {
    output: result.data,
    savedBytes: Math.max(0, savedBytes),
  };
}