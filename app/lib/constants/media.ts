import { FormatOptions } from '@/app/lib/types';

export const SUPPORTED_FORMATS = {
  video: ['mp4', 'webm', 'mkv', 'avi', 'mov', 'flv', 'wmv', 'ts'] as const,
  audio: ['mp3', 'wav', 'aac', 'flac', 'm4a', 'opus', 'ogg'] as const,
} as const;

export const ALL_SUPPORTED_FORMATS = [
  ...SUPPORTED_FORMATS.video,
  ...SUPPORTED_FORMATS.audio,
] as const;

export const FORMAT_OPTIONS: FormatOptions = {
  video: {
    mp4: { codec: 'h264', container: 'mp4', quality: 'high' },
    webm: { codec: 'vp9', container: 'webm', quality: 'high' },
    mkv: { codec: 'h264', container: 'mkv', quality: 'lossless' },
    avi: { codec: 'mpeg4', container: 'avi', quality: 'medium' },
    mov: { codec: 'h264', container: 'mov', quality: 'high' },
  },
  audio: {
    mp3: { codec: 'libmp3lame', bitrate: '192k' },
    wav: { codec: 'pcm_s16le', bitrate: 'lossless' },
    aac: { codec: 'aac', bitrate: '192k' },
    flac: { codec: 'flac', bitrate: 'lossless' },
    m4a: { codec: 'aac', bitrate: '192k' },
  },
};

export const REPAIR_OPTIONS: Record<string, string> = {
  original: 'Original Quality',
  repair: 'Repair Corrupted File',
  compress_low: 'Compress (Low)',
  compress_medium: 'Compress (Medium)',
  compress_high: 'Compress (High)',
  optimize: 'Optimize for Web',
};

export const COMPRESSION_RATIOS: Record<string, number> = {
  original: 1,
  repair: 0.95,
  compress_low: 0.4,
  compress_medium: 0.6,
  compress_high: 0.8,
  optimize: 0.75,
};

export const PROCESSING_CONFIG = {
  PROGRESS_INTERVAL: 500, // ms
  PROGRESS_INCREMENT: 0.3, // random factor
  PROCESSING_DELAY: 3000, // ms
  RESET_DELAY: 2000, // ms
  MERGE_PROGRESS_INTERVAL: 400,
  MERGE_PROGRESS_INCREMENT: 0.25,
  SPLIT_PROGRESS_INTERVAL: 400,
  SPLIT_PROGRESS_INCREMENT: 0.2,
};

export const FILE_SIZE_CONFIG = {
  CONVERT_SIZE_RATIO: 0.8,
  MERGE_SIZE_RATIO: 0.95,
  SPLIT_SIZE_PER_SEGMENT: 0.3,
};

export const MERGE_MIN_FILES = 2;
export const SPLIT_MIN_SEGMENTS = 1;
export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

export const TIME_FORMAT = 'MM:SS' as const;
export const DEFAULT_SEGMENT_DURATION = '00:30' as const;
export const DEFAULT_SEGMENT_START = '00:00' as const;
