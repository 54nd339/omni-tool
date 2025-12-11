export type ImageDimensions = { width: number; height: number };

export type TargetFormat = 'image/png' | 'image/jpeg' | 'image/webp' | 'image/avif';

export type PdfLikeImageFormat = 'png' | 'jpeg' | 'webp';

export type ImageSettings = {
  scale: number;
  quality: number;
  grayscale: boolean;
  keepAspect: boolean;
  width?: number;
  height?: number;
};

export type IconPlatform = 'favicon' | 'android-icon' | 'apple-icon' | 'ms-icon';

export type IconPreview = { size: number; dataUrl: string };

// Aspect Ratio types (merged from aspectRatio.ts)
export type RatioOption = {
  id: string;
  label: string;
  width: number;
  height: number;
  hint?: string;
};

export type BackgroundMode = 'white' | 'transparent' | 'custom';

export type OutputFormat = 'png' | 'jpeg' | 'webp';

export type ImageState = { file: File; url: string } | null;

export type ProcessedInfo = {
  outputUrl: string;
  mime: string;
};

export type AspectRatioPaddingState = {
  image: ImageState;
  originalDims: { width: number; height: number } | null;
  resultDims: { width: number; height: number } | null;
  ratioId: string;
  customRatio: { width: number; height: number };
  longEdge: number;
  backgroundMode: BackgroundMode;
  customColor: string;
  customOpacity: number;
  allowUpscale: boolean;
  outputFormat: OutputFormat;
  processed: ProcessedInfo | null;
  error: string | null;
  processing: boolean;
};
