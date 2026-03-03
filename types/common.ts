export type HashAlgorithm =
  | 'MD5'
  | 'SHA1'
  | 'SHA256'
  | 'SHA384'
  | 'SHA512'
  | 'HMAC-SHA256';

export type CipherAlgorithm = 'AES' | 'TripleDES' | 'Rabbit' | 'RC4';

export type ProcessingStatus = 'idle' | 'loading' | 'processing' | 'done' | 'error';

export type DiffMode = 'line' | 'word' | 'char' | 'sentence' | 'json';

export type DataFormat = 'json' | 'yaml' | 'xml' | 'csv';

export interface DownloadOption {
  id: string;
  label: string;
  extension: string;
  mimeType: string;
}

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

export type GradientType = 'linear' | 'radial' | 'conic';

export interface ColorStop {
  id: string;
  color: string;
  position: number;
}

export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

export interface ErrorCorrectionOption {
  id: ErrorCorrectionLevel;
  label: string;
  hint: string;
}

export interface QrRenderOptions {
  bgColor: string;
  ecLevel: ErrorCorrectionLevel;
  fgColor: string;
  margin?: number;
  size: number;
  text: string;
}

export type IdType = 'uuid' | 'ulid';

export interface PasswordStrength {
  label: string;
  color: string;
  score: number;
}