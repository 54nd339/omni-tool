import {
  SUPPORTED_FORMATS,
  ALL_SUPPORTED_FORMATS,
  COMPRESSION_RATIOS,
  MERGE_MIN_FILES,
  MAX_FILE_SIZE,
} from '@/app/lib/constants';
import { MediaFileItem, SplitSegment } from '@/app/lib/types';
import { getFileExtensionFromName } from './file';

export const validateFileFormat = (file: File): { valid: boolean; error?: string } => {
  const fileExt = getFileExtensionFromName(file.name);

  if (!ALL_SUPPORTED_FORMATS.includes(fileExt as any)) {
    return {
      valid: false,
      error: `File format .${fileExt} is not supported`,
    };
  }

  return { valid: true };
};

// Format checking
export const isVideoFormat = (format: string): boolean => {
  return SUPPORTED_FORMATS.video.includes(format as any);
};

export const isAudioFormat = (format: string): boolean => {
  return SUPPORTED_FORMATS.audio.includes(format as any);
};

// File operations
export const generateUniqueId = (): string => {
  return `${Date.now()}-${Math.random()}`;
};

export const createMediaFileItem = (file: File, order: number): MediaFileItem => {
  return {
    id: generateUniqueId(),
    file,
    order,
  };
};


export const getNewFileName = (originalName: string, newExtension: string): string => {
  const baseName = originalName.replace(/\.[^.]+$/, '');
  return `${baseName}.${newExtension}`;
};

// Time conversion
export const timeToSeconds = (timeStr: string): number => {
  const [min, sec] = timeStr.split(':').map(Number);
  return (min || 0) * 60 + (sec || 0);
};

export const secondsToTime = (seconds: number): string => {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
};

// Segment validation
export const validateSegments = (
  segments: SplitSegment[],
  duration: number
): { valid: boolean; error?: string } => {
  if (segments.length === 0) {
    return { valid: false, error: 'At least one segment is required' };
  }

  for (const segment of segments) {
    const start = timeToSeconds(segment.startTime);
    const end = timeToSeconds(segment.endTime);

    if (start >= end) {
      return {
        valid: false,
        error: `Segment "${segment.name}": Start time must be before end time`,
      };
    }

    if (end > duration) {
      return {
        valid: false,
        error: `Segment "${segment.name}": End time exceeds file duration`,
      };
    }
  }

  return { valid: true };
};

// Progress simulation
type SetProgress = (progress: number | ((prev: number) => number)) => void;

export const simulateProgress = (
  interval: number,
  increment: number,
  onProgress: SetProgress
): NodeJS.Timeout => {
  return setInterval(() => {
    onProgress((prev) => Math.min(prev + Math.random() * increment, 90));
  }, interval);
};

// File size calculation - unified interface
export interface SizeCalculationResult {
  newSize: string;
  savings: string;
}

/**
 * Calculate compressed/converted file size with unified interface
 * @param originalSize - Original file size in bytes
 * @param operationOrRatio - Either an operation string (for repair operations) or a ratio number (for convert/merge)
 * @returns Object with newSize (in MB as string) and savings (as percentage string)
 */
export const calculateCompressedSize = (
  originalSize: number,
  operationOrRatio: string | number
): SizeCalculationResult => {
  const compressionRatio =
    typeof operationOrRatio === 'string'
      ? COMPRESSION_RATIOS[operationOrRatio] || 0.95
      : operationOrRatio;

  const originalSizeMb = (originalSize / 1024 / 1024).toFixed(2);
  const newSizeMb = (parseFloat(originalSizeMb) * compressionRatio).toFixed(2);
  const savings = ((1 - compressionRatio) * 100).toFixed(1);

  return { newSize: newSizeMb, savings };
};

// Merge validation
export const validateMergeFiles = (files: MediaFileItem[]): { valid: boolean; error?: string } => {
  if (files.length < MERGE_MIN_FILES) {
    return {
      valid: false,
      error: `Please add at least ${MERGE_MIN_FILES} files to merge`,
    };
  }

  const hasAudio = files.some(f => f.file.type.startsWith('audio/'));
  const hasVideo = files.some(f => f.file.type.startsWith('video/'));

  if (hasAudio && hasVideo) {
    return {
      valid: false,
      error: 'Cannot mix audio and video files. Please merge files of the same type.',
    };
  }

  return { valid: true };
};

/**
 * Validate file size (100MB limit)
 */
export const validateFileSize = (file: File): { valid: boolean; error?: string } => {
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds 100MB limit. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
    };
  }
  return { valid: true };
};

/**
 * Combined file validation (format + size)
 */
export const validateMediaFile = (file: File): { valid: boolean; error?: string } => {
  const formatCheck = validateFileFormat(file);
  if (!formatCheck.valid) return formatCheck;

  const sizeCheck = validateFileSize(file);
  if (!sizeCheck.valid) return sizeCheck;

  return { valid: true };
};
