// File handling types
export interface MediaFileItem {
  id: string;
  file: File;
  order: number;
}

export interface SplitSegment {
  id: string;
  startTime: string;
  endTime: string;
  name: string;
}

// Format configuration types
export interface FormatCodecConfig {
  codec: string;
  container: string;
  quality: 'low' | 'medium' | 'high' | 'lossless';
}

export interface AudioCodecConfig {
  codec: string;
  bitrate: string;
}

export interface FormatOptions {
  video: Record<string, FormatCodecConfig>;
  audio: Record<string, AudioCodecConfig>;
}

// Operation/Result types
export interface ConversionResult {
  fileName: string;
  size: string;
}

export interface MergeResult {
  fileName: string;
  size: string;
}

export interface SplitResult {
  count: number;
  totalSize: string;
}

// Media processing result types (with blob data)
export type ConvertMediaResult = {
  fileName: string;
  size: string;
  blob: Blob;
  details?: string;
  operationApplied?: boolean;
};

export type MergeMediaResult = {
  fileName: string;
  size: string;
  blob: Blob;
};

export type SplitMediaResult = {
  count: number;
  totalSize: string;
  zipBlob: Blob;
};

export interface RepairResult {
  fileName: string;
  originalSize: string;
  newSize: string;
  savings: string;
}

// Processing state types
export interface ProcessingState {
  isProcessing: boolean;
  error: string;
  progress: number;
}

export interface FileProcessingState extends ProcessingState {
  file: File | null;
}

export interface MultiFileProcessingState extends ProcessingState {
  files: MediaFileItem[];
}

export type RepairOperation = 'original' | 'repair' | 'compress_low' | 'compress_medium' | 'compress_high' | 'optimize';

// Download handler type
export interface DownloadOptions {
  fileName: string;
  dataUrl?: string;
  callback?: () => void;
}

// Processed segment type
export interface ProcessedSegment {
  name: string;
  blob: Blob;
  url: string;
  type: 'video' | 'audio' | null;
}
