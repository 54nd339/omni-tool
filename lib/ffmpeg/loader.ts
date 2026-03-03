import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

let ffmpeg: FFmpeg | null = null;
let loadPromise: Promise<FFmpeg> | null = null;

export type FFmpegProgressCallback = (progress: {
  ratio: number;
  time: number;
}) => void;

export async function getFFmpeg(
  onProgress?: FFmpegProgressCallback,
): Promise<FFmpeg> {
  if (ffmpeg?.loaded) return ffmpeg;
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    const instance = new FFmpeg();

    if (onProgress) {
      instance.on('progress', ({ progress, time }) => {
        onProgress({ ratio: progress, time });
      });
    }

    const baseURL = 'https://unpkg.com/@ffmpeg/core-mt@0.12.10/dist/umd';

    await instance.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.wasm`,
        'application/wasm',
      ),
      workerURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.worker.js`,
        'text/javascript',
      ),
    });

    ffmpeg = instance;
    return instance;
  })();

  return loadPromise;
}

