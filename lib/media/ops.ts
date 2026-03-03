import { MEDIA_FORMATS } from '@/lib/constants/media-formats';

export type MediaType = 'video' | 'audio';

export interface MediaEntry {
  id: string;
  file: File;
  name: string;
  size: number;
  duration?: string;
}

export interface SplitPoint {
  id: string;
  start: string;
  end: string;
}

export const VIDEO_FORMAT_OPTIONS = Object.keys(MEDIA_FORMATS.video).map((key) => ({
  id: key,
  label: key.toUpperCase(),
}));

export const AUDIO_FORMAT_OPTIONS = Object.keys(MEDIA_FORMATS.audio).map((key) => ({
  id: key,
  label: key.toUpperCase(),
}));