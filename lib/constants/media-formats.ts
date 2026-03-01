import type { MediaFormatMap } from '@/types';

export const MEDIA_FORMATS: MediaFormatMap = {
  video: {
    mp4: { codec: 'libx264', container: 'mp4', quality: 'high' },
    webm: { codec: 'libvpx-vp9', container: 'webm', quality: 'high' },
    mkv: { codec: 'libx264', container: 'mkv', quality: 'lossless' },
    avi: { codec: 'mpeg4', container: 'avi', quality: 'medium' },
    mov: { codec: 'libx264', container: 'mov', quality: 'high' },
  },
  audio: {
    mp3: { codec: 'libmp3lame', bitrate: '192k' },
    wav: { codec: 'pcm_s16le', bitrate: 'lossless' },
    aac: { codec: 'aac', bitrate: '192k' },
    flac: { codec: 'flac', bitrate: 'lossless' },
    m4a: { codec: 'aac', bitrate: '192k' },
  },
} as const;
