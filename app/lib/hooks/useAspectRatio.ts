import { useReducer, useMemo, useCallback, useRef } from 'react';
import type { BackgroundMode, OutputFormat, ImageDimensions, RatioOption } from '@/app/lib/types';
import { ASPECT_RATIO_DEFAULTS, ASPECT_RATIO_PRESETS } from '@/app/lib/constants';
import { clampRatioValue, buildTargetSize, generatePaddedImage, formatErrorMessage } from '@/app/lib/utils';

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

type AspectRatioAction =
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

const initialState: AspectRatioState = {
  image: null,
  originalDims: null,
  resultDims: null,
  ratioId: ASPECT_RATIO_DEFAULTS.ratioId,
  customRatio: ASPECT_RATIO_DEFAULTS.customRatio,
  longEdge: ASPECT_RATIO_DEFAULTS.longEdge,
  backgroundMode: ASPECT_RATIO_DEFAULTS.backgroundMode as BackgroundMode,
  customColor: ASPECT_RATIO_DEFAULTS.customColor,
  customOpacity: ASPECT_RATIO_DEFAULTS.customOpacity,
  allowUpscale: ASPECT_RATIO_DEFAULTS.allowUpscale,
  outputFormat: ASPECT_RATIO_DEFAULTS.outputFormat as OutputFormat,
  processed: null,
  error: null,
  processing: false,
};

function aspectRatioReducer(
  state: AspectRatioState,
  action: AspectRatioAction
): AspectRatioState {
  switch (action.type) {
    case 'SET_IMAGE':
      return {
        ...state,
        image: action.payload,
        // Clear related state when image changes
        originalDims: null,
        resultDims: null,
        processed: null,
        error: null,
      };

    case 'SET_RATIO_ID':
      return { ...state, ratioId: action.payload };

    case 'SET_CUSTOM_RATIO':
      return { ...state, customRatio: action.payload };

    case 'SET_LONG_EDGE':
      return { ...state, longEdge: action.payload };

    case 'SET_BACKGROUND_MODE':
      const newState = { ...state, backgroundMode: action.payload };
      // Auto-update outputFormat if transparency is selected
      if (action.payload === 'transparent' && state.outputFormat === 'jpeg') {
        newState.outputFormat = 'png';
      }
      return newState;

    case 'SET_CUSTOM_COLOR':
      return { ...state, customColor: action.payload };

    case 'SET_CUSTOM_OPACITY':
      return { ...state, customOpacity: action.payload };

    case 'SET_ALLOW_UPSCALE':
      return { ...state, allowUpscale: action.payload };

    case 'SET_OUTPUT_FORMAT':
      return { ...state, outputFormat: action.payload };

    case 'SET_PROCESSING':
      return { ...state, processing: action.payload };

    case 'SET_PROCESSED':
      return { ...state, processed: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    case 'SET_ORIGINAL_DIMS':
      return { ...state, originalDims: action.payload };

    case 'SET_RESULT_DIMS':
      return { ...state, resultDims: action.payload };

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}

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

export function useAspectRatio(): UseAspectRatioResult {
  const [state, dispatch] = useReducer(aspectRatioReducer, initialState);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Derived values
  const selectedRatio: RatioOption = useMemo(
    () => ({
      ...(state.ratioId === 'custom'
        ? ASPECT_RATIO_PRESETS.find((r) => r.id === 'custom')!
        : ASPECT_RATIO_PRESETS.find((r) => r.id === state.ratioId) || ASPECT_RATIO_PRESETS[0]),
      ...(state.ratioId === 'custom' && {
        width: clampRatioValue(state.customRatio.width, 1),
        height: clampRatioValue(state.customRatio.height, 1),
      }),
    }),
    [state.ratioId, state.customRatio.width, state.customRatio.height]
  );

  const targetSize = useMemo(
    () => buildTargetSize(selectedRatio, state.longEdge),
    [selectedRatio, state.longEdge]
  );

  // Actions
  const setImage = useCallback((image: { file: File } | null) => {
    dispatch({ type: 'SET_IMAGE', payload: image });
  }, []);

  const setRatioId = useCallback((id: string) => {
    dispatch({ type: 'SET_RATIO_ID', payload: id });
  }, []);

  const setCustomRatio = useCallback((ratio: { width: number; height: number }) => {
    dispatch({ type: 'SET_CUSTOM_RATIO', payload: ratio });
  }, []);

  const setLongEdge = useCallback((value: number) => {
    dispatch({ type: 'SET_LONG_EDGE', payload: value });
  }, []);

  const setBackgroundMode = useCallback((mode: BackgroundMode) => {
    dispatch({ type: 'SET_BACKGROUND_MODE', payload: mode });
  }, []);

  const setCustomColor = useCallback((color: string) => {
    dispatch({ type: 'SET_CUSTOM_COLOR', payload: color });
  }, []);

  const setCustomOpacity = useCallback((opacity: number) => {
    dispatch({ type: 'SET_CUSTOM_OPACITY', payload: opacity });
  }, []);

  const setAllowUpscale = useCallback((allow: boolean) => {
    dispatch({ type: 'SET_ALLOW_UPSCALE', payload: allow });
  }, []);

  const setOutputFormat = useCallback((format: OutputFormat) => {
    dispatch({ type: 'SET_OUTPUT_FORMAT', payload: format });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  // Processing function
  const processImage = useCallback(
    async (imageUrl: string, canvas: HTMLCanvasElement) => {
      dispatch({ type: 'SET_PROCESSING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      try {
        const result = await generatePaddedImage({
          imageUrl,
          canvas,
          targetSize,
          allowUpscale: state.allowUpscale,
          backgroundMode: state.backgroundMode,
          customColor: state.customColor,
          customOpacity: state.customOpacity,
          outputFormat: state.outputFormat,
        });

        dispatch({ type: 'SET_ORIGINAL_DIMS', payload: result.originalDims });
        dispatch({ type: 'SET_RESULT_DIMS', payload: result.resultDims });
        dispatch({
          type: 'SET_PROCESSED',
          payload: { outputUrl: result.dataUrl, mime: result.mime },
        });
      } catch (err: unknown) {
        const message = formatErrorMessage(err, 'Failed to process image');
        console.error(err);
        dispatch({ type: 'SET_ERROR', payload: message });
      } finally {
        dispatch({ type: 'SET_PROCESSING', payload: false });
      }
    },
    [
      targetSize,
      state.allowUpscale,
      state.backgroundMode,
      state.customColor,
      state.customOpacity,
      state.outputFormat,
    ]
  );

  return {
    state,
    selectedRatio,
    targetSize,
    setImage,
    setRatioId,
    setCustomRatio,
    setLongEdge,
    setBackgroundMode,
    setCustomColor,
    setCustomOpacity,
    setAllowUpscale,
    setOutputFormat,
    reset,
    processImage,
    canvasRef,
  };
}
