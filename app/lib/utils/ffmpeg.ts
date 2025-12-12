import { FORMAT_OPTIONS, REPAIR_OPTIONS } from '@/app/lib/constants';
import { MediaFileItem, SplitSegment, RepairOperation } from '@/app/lib/types';
import { getFFmpeg, writeFFmpegFile, readFFmpegFile, deleteFFmpegFile, executeFFmpeg } from '@/app/lib/tools';
import { getFileExtensionFromName } from './file';
import { getNewFileName, isVideoFormat, isAudioFormat, timeToSeconds } from './media';

const toArrayBuffer = (data: Uint8Array): ArrayBuffer => {
  const { buffer, byteOffset, byteLength } = data;
  if (buffer instanceof SharedArrayBuffer) {
    const copy = new ArrayBuffer(byteLength);
    new Uint8Array(copy).set(new Uint8Array(buffer, byteOffset, byteLength));
    return copy;
  }
  if (byteOffset === 0 && byteLength === buffer.byteLength) {
    return buffer;
  }
  return buffer.slice(byteOffset, byteOffset + byteLength);
};

const createBlobFromData = (data: Uint8Array, type?: string) => new Blob([toArrayBuffer(data)], { type });

/**
 * Get media duration in seconds
 */
export const getMediaDuration = async (file: File): Promise<number> => {
  const inputExt = getFileExtensionFromName(file.name);
  const inputFileName = `probe_${Date.now()}.${inputExt}`; // Unique name to prevent conflicts
  let duration = 0;

  const ffmpeg = await getFFmpeg();

  // Define regex to parse "Duration: 00:00:30.50"
  const durationRegex = /Duration:\s+(\d{2}):(\d{2}):(\d{2}\.\d{2})/;

  const logCallback = ({ message }: { message: string }) => {
    const match = message.match(durationRegex);
    if (match) {
      const [_, hours, minutes, seconds] = match;
      duration = 
        parseInt(hours) * 3600 + 
        parseInt(minutes) * 60 + 
        parseFloat(seconds);
    }
  };

  try {
    await writeFFmpegFile(inputFileName, file);

    // 1. Attach log listener
    ffmpeg.on('log', logCallback);

    // 2. Run probe command (ffmpeg -i input)
    // This will throw an error because no output is specified, which is expected
    await ffmpeg.exec(['-i', inputFileName]);

  } catch (error) {
    // We expect an error here (exit code 1) because we didn't provide an output file.
    // We strictly care about the logs captured before the error.
  } finally {
    // 3. Clean up
    ffmpeg.off('log', logCallback);
    await deleteFFmpegFile(inputFileName).catch(() => {});
  }

  return duration > 0 ? Math.ceil(duration) : 300;
};

/**
 * Build FFmpeg arguments for combined media processing (repair/compress + conversion)
 */
export const buildMediaArgs = (
  inputFileName: string,
  outputFileName: string,
  targetFormat: string,
  operation: RepairOperation,
  inputExt: string
): string[] => {
  const args: string[] = ['-i', inputFileName];
  const isVideo = isVideoFormat(targetFormat);
  const isAudio = isAudioFormat(targetFormat);

  // Get format config for target format
  const formatConfig = isVideo
    ? FORMAT_OPTIONS.video[targetFormat as keyof typeof FORMAT_OPTIONS.video]
    : FORMAT_OPTIONS.audio[targetFormat as keyof typeof FORMAT_OPTIONS.audio];

  if (!formatConfig) {
    throw new Error(`Unsupported output format: ${targetFormat}`);
  }

  // Apply repair/compress/optimize operations
  if (operation === 'repair') {
    if (isVideo) {
      args.push('-c:v', 'libx264', '-c:a', 'aac');
      args.push('-error_resilient', '1');
    } else if (isAudio) {
      args.push('-c:a', 'aac');
    }
  } else if (operation.startsWith('compress_')) {
    const quality = operation.split('_')[1];

    if (isVideo) {
      const videoConfig = formatConfig as { codec: string; container: string; quality: string };
      args.push('-c:v', videoConfig.codec);
      if (quality === 'low') {
        args.push('-crf', '32', '-preset', 'ultrafast');
      } else if (quality === 'medium') {
        args.push('-crf', '26', '-preset', 'fast');
      } else {
        args.push('-crf', '23', '-preset', 'medium');
      }
      args.push('-c:a', 'aac', '-b:a', '128k');
    } else if (isAudio) {
      const audioConfig = formatConfig as { codec: string; bitrate: string };
      args.push('-c:a', audioConfig.codec);
      if (quality === 'low') {
        args.push('-b:a', '96k');
      } else if (quality === 'medium') {
        args.push('-b:a', '128k');
      } else {
        args.push('-b:a', '192k');
      }
    }
  } else if (operation === 'optimize') {
    if (isVideo) {
      const videoConfig = formatConfig as { codec: string; container: string; quality: string };
      args.push('-c:v', videoConfig.codec, '-preset', 'medium', '-crf', '23');
      args.push('-c:a', 'aac', '-b:a', '128k');
      args.push('-movflags', '+faststart');
    } else if (isAudio) {
      const audioConfig = formatConfig as { codec: string; bitrate: string };
      args.push('-c:a', audioConfig.codec, '-b:a', '128k');
    }
  } else {
    // operation === 'original' - just convert with high quality
    if (isVideo) {
      const videoConfig = formatConfig as { codec: string; container: string; quality: string };
      args.push('-c:v', videoConfig.codec);
      args.push('-crf', '18', '-preset', 'slow');
      args.push('-c:a', 'aac', '-b:a', '192k');
    } else if (isAudio) {
      const audioConfig = formatConfig as { codec: string; bitrate: string };
      args.push('-c:a', audioConfig.codec);
      if (audioConfig.bitrate !== 'lossless') {
        args.push('-b:a', audioConfig.bitrate);
      }
    }
  }

  args.push('-y', outputFileName);
  return args;
};

/**
 * Process media file for combined repair/compress/optimize and format conversion
 */
export const processMedia = async (
  file: File,
  targetFormat: string,
  operation: RepairOperation,
  onProgress?: (progress: number) => void
): Promise<{ fileName: string; size: string; blob: Blob; details?: string; operationApplied?: boolean }> => {
  const inputExt = getFileExtensionFromName(file.name);
  const inputFileName = `input.${inputExt}`;
  const outputFileName = `output.${targetFormat}`;
  const fileName = getNewFileName(file.name, targetFormat);
  const applyOperation = operation !== 'original';

  try {
    await writeFFmpegFile(inputFileName, file);
    const args = buildMediaArgs(inputFileName, outputFileName, targetFormat, operation, inputExt);

    await executeFFmpeg(args, (progress) => {
      if (onProgress) {
        onProgress(progress.progress);
      }
    });

    const outputData = await readFFmpegFile(outputFileName);
    const blob = createBlobFromData(
      outputData,
      isVideoFormat(targetFormat) ? 'video/mp4' : 'audio/mpeg'
    );

    await deleteFFmpegFile(inputFileName).catch(() => { });
    await deleteFFmpegFile(outputFileName).catch(() => { });

    const newSize = (blob.size / 1024 / 1024).toFixed(2);
    const savings = applyOperation ? ((1 - blob.size / file.size) * 100).toFixed(1) : '0';

    const operationLabel = applyOperation ? REPAIR_OPTIONS[operation] || operation : '';
    const details = applyOperation
      ? `${operationLabel} • Savings ${savings}% • Converted to ${targetFormat.toUpperCase()}`
      : `Converted to ${targetFormat.toUpperCase()}`;

    return {
      fileName,
      size: `${newSize}MB`,
      blob,
      details,
      operationApplied: applyOperation,
    };
  } catch (error) {
    await deleteFFmpegFile(inputFileName).catch(() => { });
    await deleteFFmpegFile(outputFileName).catch(() => { });
    throw error;
  }
};

/**
 * Build FFmpeg arguments for merging files
 */
export const buildMergeArgs = (outputFileName: string, outputFormat: string): string[] => {
  const formatConfig = FORMAT_OPTIONS.video[outputFormat as keyof typeof FORMAT_OPTIONS.video] ||
    FORMAT_OPTIONS.audio[outputFormat as keyof typeof FORMAT_OPTIONS.audio];

  const args: string[] = [
    '-f', 'concat',
    '-safe', '0',
    '-i', 'concat.txt',
  ];

  if (formatConfig) {
    if ('codec' in formatConfig) {
      const videoConfig = formatConfig as { codec: string; container: string; quality: string };
      args.push('-c:v', videoConfig.codec);
      args.push('-c:a', 'copy');
    } else {
      const audioConfig = formatConfig as { codec: string; bitrate: string };
      args.push('-c:a', audioConfig.codec);
      if (audioConfig.bitrate !== 'lossless') {
        args.push('-b:a', audioConfig.bitrate);
      }
    }
  }

  args.push('-y', outputFileName);
  return args;
};

/**
 * Process media file merge
 */
export const processMerge = async (
  files: MediaFileItem[],
  outputFormat: string,
  onProgress?: (progress: number) => void
): Promise<{ fileName: string; size: string; blob: Blob }> => {
  const sortedFiles = [...files].sort((a, b) => a.order - b.order);
  const inputFileNames: string[] = [];
  const concatList: string[] = [];
  const outputFileName = `output.${outputFormat}`;
  const fileName = `merged.${outputFormat}`;

  try {
    for (let i = 0; i < sortedFiles.length; i++) {
      const inputFileName = `input_${i}.${sortedFiles[i].file.name.split('.').pop()}`;
      inputFileNames.push(inputFileName);
      await writeFFmpegFile(inputFileName, sortedFiles[i].file);
      concatList.push(`file '${inputFileName}'`);
    }

    const concatListContent = concatList.join('\n');
    await writeFFmpegFile('concat.txt', new Blob([concatListContent], { type: 'text/plain' }));

    const args = buildMergeArgs(outputFileName, outputFormat);
    await executeFFmpeg(args, (progress) => {
      if (onProgress) {
        onProgress(progress.progress);
      }
    });

    const outputData = await readFFmpegFile(outputFileName);
    const blob = createBlobFromData(
      outputData,
      outputFormat.startsWith('mp4') || outputFormat.startsWith('webm') ? 'video/mp4' : 'audio/mpeg'
    );

    for (const inputFileName of inputFileNames) {
      await deleteFFmpegFile(inputFileName).catch(() => { });
    }
    await deleteFFmpegFile('concat.txt').catch(() => { });
    await deleteFFmpegFile(outputFileName).catch(() => { });

    const size = (blob.size / 1024 / 1024).toFixed(2);
    return { fileName, size: `${size}MB`, blob };
  } catch (error) {
    for (const inputFileName of inputFileNames) {
      await deleteFFmpegFile(inputFileName).catch(() => { });
    }
    await deleteFFmpegFile('concat.txt').catch(() => { });
    await deleteFFmpegFile(outputFileName).catch(() => { });
    throw error;
  }
};

/**
 * Build FFmpeg arguments for splitting
 */
export const buildSplitArgs = (
  inputFileName: string,
  outputFileName: string,
  startSeconds: number,
  duration: number
): string[] => {
  return [
    '-ss', startSeconds.toString(),
    '-i', inputFileName,
    '-t', duration.toString(),
    '-c', 'copy',
    '-avoid_negative_ts', 'make_zero',
    '-y', outputFileName,
  ];
};

/**
 * Process media file split
 */
export const processSplit = async (
  file: File,
  segments: SplitSegment[],
  onProgress?: (progress: number) => void
): Promise<{ count: number; totalSize: string; zipBlob: Blob }> => {
  const inputExt = getFileExtensionFromName(file.name);
  const inputFileName = `input.${inputExt}`;
  const outputFileNames: string[] = [];

  // Dynamic import for JSZip
  const JSZip = (await import('jszip')).default;
  const zip = new JSZip();

  try {
    await writeFFmpegFile(inputFileName, file);

    let processedCount = 0;
    for (const segment of segments) {
      const startSeconds = timeToSeconds(segment.startTime);
      const endSeconds = timeToSeconds(segment.endTime);
      const segmentDuration = endSeconds - startSeconds;

      const outputFileName = `segment_${segment.id}.${inputExt}`;
      outputFileNames.push(outputFileName);

      const args = buildSplitArgs(inputFileName, outputFileName, startSeconds, segmentDuration);
      await executeFFmpeg(args, (progress) => {
        const segmentProgress = progress.progress / segments.length;
        const overallProgress = (processedCount / segments.length) * 100 + segmentProgress;
        if (onProgress) {
          onProgress(Math.min(100, overallProgress));
        }
      });

      const segmentData = await readFFmpegFile(outputFileName);
      const segmentBlob = createBlobFromData(segmentData, file.type || 'application/octet-stream');
      zip.file(`${segment.name || `Segment_${segment.id}`}.${inputExt}`, segmentBlob);
      await deleteFFmpegFile(outputFileName).catch(() => { });
      processedCount++;
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' }, (metadata) => {
      if (onProgress) {
        onProgress(90 + (metadata.percent / 10));
      }
    });

    await deleteFFmpegFile(inputFileName).catch(() => { });

    const totalSize = (zipBlob.size / 1024 / 1024).toFixed(2);
    return { count: segments.length, totalSize: `${totalSize}MB`, zipBlob };
  } catch (error) {
    await deleteFFmpegFile(inputFileName).catch(() => { });
    for (const outputFileName of outputFileNames) {
      await deleteFFmpegFile(outputFileName).catch(() => { });
    }
    throw error;
  }
};
