export const MEDIA_AUDIO_VIDEO_ACCEPT = {
  'video/*': ['.mp4', '.webm', '.mkv', '.avi', '.mov'],
  'audio/*': ['.mp3', '.wav', '.aac', '.flac', '.m4a'],
} as const;

export const MEDIA_AUDIO_VIDEO_ACCEPT_WITH_OGG = {
  ...MEDIA_AUDIO_VIDEO_ACCEPT,
  'audio/*': [...MEDIA_AUDIO_VIDEO_ACCEPT['audio/*'], '.ogg'],
} as const;

export function getMediaDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const el = file.type.startsWith('video/')
      ? document.createElement('video')
      : document.createElement('audio');

    el.preload = 'metadata';

    el.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(el.duration);
    };

    el.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load media metadata'));
    };

    el.src = url;
  });
}

export function formatDuration(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '--:--';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function parseTime(str: string): number {
  const parts = str.split(':').map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parts[0] || 0;
}

export function isValidTimeFormat(str: string): boolean {
  return /^\d{1,2}(:\d{2}){1,2}$/.test(str.trim());
}