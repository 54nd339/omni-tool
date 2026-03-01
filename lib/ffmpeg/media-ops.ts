import { fetchFile } from '@ffmpeg/util';
import { getFFmpeg, type FFmpegProgressCallback } from './loader';
import { MEDIA_FORMATS } from '@/lib/constants/media-formats';

export interface MediaConvertOptions {
  outputFormat: string;
  mediaType: 'video' | 'audio';
}

export interface MediaSplitPoint {
  start: number;
  end: number;
}

export async function convertMedia(
  input: File | Blob,
  options: MediaConvertOptions,
  onProgress?: FFmpegProgressCallback,
): Promise<Blob> {
  const ff = await getFFmpeg(onProgress);
  const ext = input instanceof File ? input.name.split('.').pop() ?? 'mp4' : 'mp4';
  const inputName = `input.${ext}`;
  const outputName = `output.${options.outputFormat}`;

  await ff.writeFile(inputName, await fetchFile(input));

  const args = ['-i', inputName];

  if (options.mediaType === 'video') {
    const fmt = MEDIA_FORMATS.video[options.outputFormat];
    if (fmt) {
      args.push('-c:v', fmt.codec);
      if (['mp4', 'mkv', 'avi', 'mov'].includes(options.outputFormat)) {
        args.push('-preset', 'ultrafast');
      } else if (options.outputFormat === 'webm') {
        args.push('-cpu-used', '5', '-deadline', 'realtime');
      }
      args.push('-c:a', 'aac');
    }
  } else {
    const fmt = MEDIA_FORMATS.audio[options.outputFormat];
    if (fmt) {
      args.push('-c:a', fmt.codec);
      if (fmt.bitrate !== 'lossless') {
        args.push('-b:a', fmt.bitrate);
      }
    }
  }

  args.push('-threads', '4', '-y', outputName);
  await ff.exec(args);

  const data = await ff.readFile(outputName);
  await ff.deleteFile(inputName);
  await ff.deleteFile(outputName);

  const mimeMap: Record<string, string> = {
    mp4: 'video/mp4', webm: 'video/webm', mkv: 'video/x-matroska',
    avi: 'video/x-msvideo', mov: 'video/quicktime',
    mp3: 'audio/mpeg', wav: 'audio/wav', aac: 'audio/aac',
    flac: 'audio/flac', m4a: 'audio/mp4',
  };
  return new Blob([data as BlobPart], {
    type: mimeMap[options.outputFormat] ?? 'application/octet-stream',
  });
}

export async function mergeMedia(
  inputs: { file: File | Blob; name: string }[],
  outputFormat: string,
  onProgress?: FFmpegProgressCallback,
): Promise<Blob> {
  const ff = await getFFmpeg();

  const tsList: string[] = [];
  const totalFiles = inputs.length;

  // Synthesize global progress across multiple files
  const handleProgress = (i: number) => ({ progress, time }: { progress: number; time: number }) => {
    if (onProgress) {
      // ratio from 0.0 to 1.0 for the current file
      const currentRatio = Math.max(0, Math.min(1, progress));
      // global ratio from 0.0 to 1.0 across all files
      const globalRatio = (i + currentRatio) / totalFiles;
      onProgress({ ratio: globalRatio, time });
    }
  };

  // Stage 1: Normalize all inputs into pristine MPEG-TS uniform streams
  for (let i = 0; i < totalFiles; i++) {
    const origExt = inputs[i].name.split('.').pop() ?? 'mp4';
    const inputName = `merge_in_${i}.${origExt}`;
    const tsName = `merge_temp_${i}.ts`;

    await ff.writeFile(inputName, await fetchFile(inputs[i].file));

    const args = ['-i', inputName];
    if (['mp4', 'mkv', 'avi', 'mov'].includes(outputFormat)) {
      args.push('-c:v', 'libx264', '-preset', 'ultrafast');
    } else if (outputFormat === 'webm') {
      args.push('-c:v', 'libvpx', '-cpu-used', '5', '-deadline', 'realtime');
    }

    args.push(
      '-c:a', 'aac',
      '-f', 'mpegts',
      '-threads', '4',
      '-y', tsName
    );

    const listener = handleProgress(i);
    ff.on('progress', listener);
    await ff.exec(args);
    ff.off('progress', listener);

    tsList.push(tsName);
    await ff.deleteFile(inputName);
  }

  // Stage 2: Instant binary stitch of identical .ts streams
  const outputName = `merged.${outputFormat}`;
  const concatStr = `concat:${tsList.join('|')}`;

  await ff.exec([
    '-i', concatStr,
    '-c', 'copy',
    '-bsf:a', 'aac_adtstoasc',
    '-y', outputName
  ]);

  const data = await ff.readFile(outputName);

  for (const tsName of tsList) {
    await ff.deleteFile(tsName);
  }
  await ff.deleteFile(outputName);

  if (onProgress) {
    onProgress({ ratio: 1, time: 0 }); // guarantee 100% fill
  }

  return new Blob([data as BlobPart]);
}

export async function splitMedia(
  input: File | Blob,
  points: MediaSplitPoint[],
  outputFormat: string,
  onProgress?: FFmpegProgressCallback,
): Promise<Blob[]> {
  const ff = await getFFmpeg(onProgress);
  const ext = input instanceof File ? input.name.split('.').pop() ?? 'mp4' : 'mp4';
  const inputName = `split_input.${ext}`;

  await ff.writeFile(inputName, await fetchFile(input));

  const results: Blob[] = [];

  for (let i = 0; i < points.length; i++) {
    const outputName = `split_${i}.${outputFormat}`;
    const duration = points[i].end - points[i].start;

    const args = [
      '-ss', String(points[i].start),
      '-i', inputName,
      '-t', String(duration),
    ];

    if (['mp4', 'mkv', 'avi', 'mov'].includes(outputFormat)) {
      args.push('-preset', 'ultrafast');
    } else if (outputFormat === 'webm') {
      args.push('-cpu-used', '5', '-deadline', 'realtime');
    }

    args.push(
      '-threads', '4',
      '-y', outputName,
    );

    await ff.exec(args);

    const data = await ff.readFile(outputName);
    results.push(new Blob([data as BlobPart]));
    await ff.deleteFile(outputName);
  }

  await ff.deleteFile(inputName);
  return results;
}
