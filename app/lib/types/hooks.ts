import type { BackgroundMode, ImageDimensions, OutputFormat, RatioOption } from './image';
import type { SplitSegment } from './media';

// Aspect Ratio hook types
export interface AspectRatioState {
  image: { file: File } | null;
  originalDims: ImageDimensions | null;
  resultDims: ImageDimensions | null;
  ratioId: string;
  customRatio: { width: number; height: number };
  longEdge: number;
  backgroundMode: BackgroundMode;
  customColor: string;
  customOpacity: number;
  allowUpscale: boolean;
  outputFormat: OutputFormat;
  processed: { outputUrl: string; mime: string } | null;
  error: string | null;
  processing: boolean;
}

export type AspectRatioAction =
  | { type: 'SET_IMAGE'; payload: { file: File } | null }
  | { type: 'SET_RATIO_ID'; payload: string }
  | { type: 'SET_CUSTOM_RATIO'; payload: { width: number; height: number } }
  | { type: 'SET_LONG_EDGE'; payload: number }
  | { type: 'SET_BACKGROUND_MODE'; payload: BackgroundMode }
  | { type: 'SET_CUSTOM_COLOR'; payload: string }
  | { type: 'SET_CUSTOM_OPACITY'; payload: number }
  | { type: 'SET_ALLOW_UPSCALE'; payload: boolean }
  | { type: 'SET_OUTPUT_FORMAT'; payload: OutputFormat }
  | { type: 'SET_PROCESSING'; payload: boolean }
  | { type: 'SET_PROCESSED'; payload: { outputUrl: string; mime: string } | null }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_ORIGINAL_DIMS'; payload: ImageDimensions | null }
  | { type: 'SET_RESULT_DIMS'; payload: ImageDimensions | null }
  | { type: 'RESET' };

export interface UseAspectRatioResult {
  // State
  state: AspectRatioState;

  // Derived values
  selectedRatio: RatioOption;
  targetSize: { width: number; height: number };

  // Actions
  setImage: (image: { file: File } | null) => void;
  setRatioId: (id: string) => void;
  setCustomRatio: (ratio: { width: number; height: number }) => void;
  setLongEdge: (value: number) => void;
  setBackgroundMode: (mode: BackgroundMode) => void;
  setCustomColor: (color: string) => void;
  setCustomOpacity: (opacity: number) => void;
  setAllowUpscale: (allow: boolean) => void;
  setOutputFormat: (format: OutputFormat) => void;
  reset: () => void;

  // Processing
  processImage: (imageUrl: string, canvas: HTMLCanvasElement) => Promise<void>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

// Async Operation hook types
export type FeedbackType = 'error' | 'message';

export interface AsyncOperationOptions {
  feedbackType?: FeedbackType;
}

interface AsyncOperationErrorResult {
  loading: boolean;
  error: string | null;
  execute: <T, TArgs extends any[] = []>(
    operation: (...args: TArgs) => Promise<T>,
    ...args: TArgs
  ) => Promise<T | null>;
  setError: (error: string | null) => void;
}

interface AsyncOperationMessageResult {
  loading: boolean;
  message: string;
  execute: <T, TArgs extends any[] = []>(
    operation: (...args: TArgs) => Promise<T>,
    ...args: TArgs
  ) => Promise<T | null>;
  setMessage: (message: string) => void;
  clearMessage: () => void;
}

export type AsyncOperationResult<TFeedback extends FeedbackType> = TFeedback extends 'error'
  ? AsyncOperationErrorResult
  : AsyncOperationMessageResult;

// misc
export interface ClearHandlerOptions {
  clearFiles?: () => void;
  onClear?: () => void;
}

export interface FileUploadOptions<T = File> {
  accept?: string | string[];
  maxFiles?: number;
  validator?: (file: File) => { valid: boolean; error?: string };
  onFileSelected?: (file: File) => T | Promise<T>;
  onFilesSelected?: (files: File[]) => T[] | Promise<T[]>;
  transformFile?: (file: File) => T | Promise<T>;
}

export interface FileUploadResult<T = File> {
  file: T | null;
  files: T[];
  error: string;
  handleFilesSelected: (files: File[]) => Promise<void>;
  clearError: () => void;
  clearFiles: () => void;
}

export interface LoadingMessageResult {
  loading: boolean;
  message: string;
  execute: <T>(operation: () => Promise<T>, successMessage?: string | ((result: T) => string)) => Promise<T | null>;
  setMessage: (message: string) => void;
  clearMessage: () => void;
}

export interface MediaProcessingOptions {
  onComplete?: (result: any) => void;
  onError?: (error: Error) => void;
  progressInterval?: number;
  progressIncrement?: number;
  processingDelay?: number;
  resetDelay?: number;
  useRealProgress?: boolean; // If true, expects processor to call onProgress callback
  onProgress?: (progress: number) => void; // Real progress callback (0-100)
}

export interface MediaProcessingResult<T = any> {
  processing: boolean;
  progress: number;
  error: string;
  result: T | null;
  startProcessing: (processor: (onProgress?: (progress: number) => void) => Promise<T>) => Promise<void>;
  reset: () => void;
}

export interface PdfPreviewResult {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  reset: () => void;
  canGoNext: boolean;
  canGoPrev: boolean;
  renderPreview: () => Promise<void>;
}

export interface UseProcessedSegmentsParams {
  zipBlob: Blob | null | undefined;
  originalFileName?: string;
}

export interface UseSegmentRangeHandlersParams {
  segments: SplitSegment[];
  setSegments: React.Dispatch<React.SetStateAction<SplitSegment[]>>;
  totalDuration: number;
}