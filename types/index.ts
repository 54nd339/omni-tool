/* ------------------------------------------------------------------ */
/*  Image Studio                                                      */
/* ------------------------------------------------------------------ */

export interface AspectRatio {
  id: string;
  label: string;
  width: number;
  height: number;
  hint: string;
}

export interface PadColor {
  id: string;
  label: string;
  value?: string;
}

export interface IconPlatform {
  platform: string;
  sizes: number[];
}

/* ------------------------------------------------------------------ */
/*  Media Lab                                                         */
/* ------------------------------------------------------------------ */

export interface VideoFormat {
  codec: string;
  container: string;
  quality: string;
}

export interface AudioFormat {
  codec: string;
  bitrate: string;
}

export type MediaFormatMap = {
  video: Record<string, VideoFormat>;
  audio: Record<string, AudioFormat>;
};

/* ------------------------------------------------------------------ */
/*  Crypto Suite                                                      */
/* ------------------------------------------------------------------ */

export type HashAlgorithm =
  | 'MD5'
  | 'SHA1'
  | 'SHA256'
  | 'SHA384'
  | 'SHA512'
  | 'HMAC-SHA256';

export type CipherAlgorithm = 'AES' | 'TripleDES' | 'Rabbit' | 'RC4';

/* ------------------------------------------------------------------ */
/*  Dev Utils                                                         */
/* ------------------------------------------------------------------ */

export type DiffMode = 'line' | 'word' | 'char' | 'sentence' | 'json';

export type DataFormat = 'json' | 'yaml' | 'xml' | 'csv';

/* ------------------------------------------------------------------ */
/*  Tool Registry                                                     */
/* ------------------------------------------------------------------ */

export type ToolCategory =
  | 'image-studio'
  | 'files-media'
  | 'crypto'
  | 'dev-utils'
  | 'generators'
  | 'workspace';

export interface ToolDefinition {
  id: string;
  name: string;
  description: string;
  path: string;
  category: ToolCategory;
  icon: string;
  keywords: string[];
  fullWidth?: boolean;
  hideSnippets?: boolean;
}

export interface ToolCategoryDefinition {
  id: ToolCategory;
  name: string;
  description: string;
  path: string;
  icon: string;
  prefetches?: string[];
}

/* ------------------------------------------------------------------ */
/*  Processing / Workers                                              */
/* ------------------------------------------------------------------ */

export type ProcessingStatus = 'idle' | 'loading' | 'processing' | 'done' | 'error';

/* ------------------------------------------------------------------ */
/*  Download                                                          */
/* ------------------------------------------------------------------ */

export interface DownloadOption {
  id: string;
  label: string;
  extension: string;
  mimeType: string;
}
