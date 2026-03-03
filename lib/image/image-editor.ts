export type CompressFormat = 'jpeg' | 'webp' | 'png';

export function getEditedDownloadName(fileName: string, format: string): string {
  const name = fileName.replace(/\.[^.]+$/, '');
  return `${name}-edited.${format}`;
}

export function getCompressedDownloadName(fileName: string, compressFormat: CompressFormat): string {
  const ext = compressFormat === 'jpeg' ? 'jpg' : compressFormat;
  return fileName.replace(/\.[^.]+$/, `.compressed.${ext}`);
}
