/**
 * Client-side FFmpeg utilities
 * This file should only be imported on the client side
 */

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

let ffmpegInstance: FFmpeg | null = null;
let initialized = false;
let initializing = false;

/**
 * Check if SharedArrayBuffer is available (requires Cross-Origin Isolation)
 */
const checkSharedArrayBufferSupport = (): { supported: boolean; error?: string } => {
  if (typeof SharedArrayBuffer === 'undefined') {
    return {
      supported: false,
      error: 'SharedArrayBuffer is not available. This requires Cross-Origin Isolation headers:\n' +
        '  - Cross-Origin-Opener-Policy: same-origin\n' +
        '  - Cross-Origin-Embedder-Policy: require-corp\n\n' +
        'For development: Headers are configured in next.config.ts\n' +
        'For production: Serve with a server that sets these headers (e.g., nginx, Apache, or a Node.js server)',
    };
  }
  return { supported: true };
};

const initFFmpeg = async (): Promise<FFmpeg> => {
  if (initialized && ffmpegInstance) return ffmpegInstance;

  if (typeof window === 'undefined') {
    throw new Error('FFmpeg can only be used on the client side');
  }

  // Check for SharedArrayBuffer support
  const sabCheck = checkSharedArrayBufferSupport();
  if (!sabCheck.supported) {
    throw new Error(sabCheck.error || 'SharedArrayBuffer is not supported');
  }

  // Prevent multiple simultaneous initializations
  if (initializing) {
    while (initializing) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    if (ffmpegInstance) return ffmpegInstance;
  }

  initializing = true;

  try {
    const ffmpeg = new FFmpeg();

    ffmpeg.on('log', ({ message }) => {
      console.log('[FFmpeg]', message);
    });

    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const baseURL = `${origin}/ffmpeg`;

    console.log('[FFmpeg] Loading from:', baseURL);

    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });

    ffmpegInstance = ffmpeg;
    initialized = true;
    return ffmpeg;
  } catch (error) {
    console.error('FFmpeg initialization error:', error);

    if (error instanceof Error) {
      if (error.message.includes('SharedArrayBuffer')) {
        throw new Error(
          'FFmpeg requires SharedArrayBuffer support. ' +
          'Please ensure your server sets Cross-Origin Isolation headers:\n' +
          '  - Cross-Origin-Opener-Policy: same-origin\n' +
          '  - Cross-Origin-Embedder-Policy: require-corp'
        );
      }
      throw new Error(`Failed to initialize FFmpeg: ${error.message}`);
    }
    throw new Error(`Failed to initialize FFmpeg: ${String(error)}`);
  } finally {
    initializing = false;
  }
};

/**
 * Get FFmpeg instance (initializes if needed)
 */
export const getFFmpeg = async (): Promise<FFmpeg> => {
  return initFFmpeg();
};

/**
 * Check if FFmpeg is initialized
 */
export const isFFmpegReady = (): boolean => {
  return initialized && ffmpegInstance !== null;
};

/**
 * Write file to FFmpeg virtual filesystem
 */
export const writeFFmpegFile = async (name: string, data: File | Blob | Uint8Array): Promise<void> => {
  const ffmpeg = await getFFmpeg();
  const fileData = data instanceof File || data instanceof Blob
    ? await fetchFile(data)
    : data;
  await ffmpeg.writeFile(name, fileData);
};

/**
 * Read file from FFmpeg virtual filesystem
 */
export const readFFmpegFile = async (name: string): Promise<Uint8Array> => {
  const ffmpeg = await getFFmpeg();
  const data = await ffmpeg.readFile(name);
  // FFmpeg returns FileData which can be string or Uint8Array
  if (typeof data === 'string') {
    return new TextEncoder().encode(data);
  }
  return data;
};

/**
 * Delete file from FFmpeg virtual filesystem
 */
export const deleteFFmpegFile = async (name: string): Promise<void> => {
  const ffmpeg = await getFFmpeg();
  await ffmpeg.deleteFile(name);
};

/**
 * Execute FFmpeg command with progress tracking
 */
export interface FFmpegProgress {
  progress: number; // 0-100
  time: number; // Current time in seconds
}

export const executeFFmpeg = async (
  args: string[],
  onProgress?: (progress: FFmpegProgress) => void
): Promise<void> => {
  const ffmpeg = await getFFmpeg();

  // Set up progress handler if provided
  if (onProgress) {
    ffmpeg.on('progress', ({ progress: p, time }) => {
      onProgress({
        progress: Math.min(100, Math.max(0, p * 100)),
        time: time || 0,
      });
    });
  }

  try {
    await ffmpeg.exec(args);
  } catch (error) {
    console.error('FFmpeg execution error:', error);
    throw new Error(`FFmpeg processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
