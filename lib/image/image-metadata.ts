import {
  EXIF_TAGS,
  METADATA_TAG_LABELS,
  TIFF_TAGS,
} from '@/lib/constants/image-studio';
import { formatBytes } from '@/lib/utils';
import type {
  ExifData,
  MetadataEntry,
  MetadataResult,
} from '@/types/image-metadata';

export type { ExifData, FileInfo, MetadataEntry, MetadataResult } from '@/types/image-metadata';

function readTiffExif(dataView: DataView, tiffStart: number): ExifData | null {
  const result: ExifData = {};
  const byteOrder = dataView.getUint16(tiffStart, false);
  const littleEndian = byteOrder === 0x4949;

  if (dataView.getUint16(tiffStart + 2, littleEndian) !== 42) return null;

  const ifd0Offset = dataView.getUint32(tiffStart + 4, littleEndian);
  const ifd0Start = tiffStart + ifd0Offset;
  const ifd0Count = dataView.getUint16(ifd0Start, littleEndian);

  function readIfd(start: number, tagMap: Record<number, keyof ExifData>) {
    const count = dataView.getUint16(start, littleEndian);

    for (let index = 0; index < count; index++) {
      const entryOffset = start + 2 + index * 12;
      if (entryOffset + 12 > dataView.byteLength) continue;

      const tag = dataView.getUint16(entryOffset, littleEndian);
      const type = dataView.getUint16(entryOffset + 2, littleEndian);
      const numValues = dataView.getUint32(entryOffset + 4, littleEndian);
      const valueOffset = dataView.getUint32(entryOffset + 8, littleEndian);

      if (!(tag in tagMap)) continue;

      const key = tagMap[tag as keyof typeof tagMap];
      const inlineOffset = entryOffset + 8;

      try {
        if (type === 2) {
          const offset = tiffStart + valueOffset;
          let text = '';
          for (let charIndex = 0; charIndex < numValues - 1 && offset + charIndex < dataView.byteLength; charIndex++) {
            const charCode = dataView.getUint8(offset + charIndex);
            if (charCode === 0) break;
            text += String.fromCharCode(charCode);
          }
          (result as Record<string, string | number | undefined>)[key] = text.trim() || undefined;
        } else if (type === 3 && numValues === 1) {
          (result as Record<string, string | number | undefined>)[key] = dataView.getUint16(inlineOffset, littleEndian);
        } else if (type === 4 && numValues === 1) {
          (result as Record<string, string | number | undefined>)[key] = dataView.getUint32(inlineOffset, littleEndian);
        } else if (type === 5 && numValues >= 1) {
          const numerator = dataView.getUint32(tiffStart + valueOffset, littleEndian);
          const denominator = dataView.getUint32(tiffStart + valueOffset + 4, littleEndian);
          if (denominator !== 0) {
            const value = numerator / denominator;
            (result as Record<string, string | number | undefined>)[key] =
              key === 'ExposureTime' || key === 'FNumber' || key === 'FocalLength' ? String(value) : value;
          }
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Skipping invalid EXIF entry', error);
        }
      }
    }
  }

  readIfd(ifd0Start, TIFF_TAGS);

  for (let index = 0; index < ifd0Count; index++) {
    const entryOffset = ifd0Start + 2 + index * 12;
    const tag = dataView.getUint16(entryOffset, littleEndian);

    if (tag === 0x8769) {
      const exifIfdOffset = dataView.getUint32(entryOffset + 8, littleEndian);
      readIfd(tiffStart + exifIfdOffset, EXIF_TAGS);
      break;
    }
  }

  for (let index = 0; index < ifd0Count; index++) {
    const entryOffset = ifd0Start + 2 + index * 12;
    const tag = dataView.getUint16(entryOffset, littleEndian);

    if (tag === 0x8825) {
      const gpsIfdOffset = dataView.getUint32(entryOffset + 8, littleEndian);
      const gpsStart = tiffStart + gpsIfdOffset;
      const gpsCount = dataView.getUint16(gpsStart, littleEndian);

      for (let gpsIndex = 0; gpsIndex < gpsCount; gpsIndex++) {
        const gpsEntry = gpsStart + 2 + gpsIndex * 12;
        const gpsTag = dataView.getUint16(gpsEntry, littleEndian);

        if (gpsTag === 0x0002 || gpsTag === 0x0004) {
          const valueOffset = dataView.getUint32(gpsEntry + 8, littleEndian);
          const degreesOffset = tiffStart + valueOffset;
          const degree = dataView.getUint32(degreesOffset, littleEndian) / (dataView.getUint32(degreesOffset + 4, littleEndian) || 1);
          const minute = dataView.getUint32(degreesOffset + 8, littleEndian) / (dataView.getUint32(degreesOffset + 12, littleEndian) || 1);
          const second = dataView.getUint32(degreesOffset + 16, littleEndian) / (dataView.getUint32(degreesOffset + 20, littleEndian) || 1);

          if (gpsTag === 0x0002) {
            result.GPSLatitude = `${degree}° ${minute}' ${second}"`;
          } else {
            result.GPSLongitude = `${degree}° ${minute}' ${second}"`;
          }
        }
      }

      break;
    }
  }

  return Object.keys(result).length > 0 ? result : null;
}

function parseExifFromJpeg(buffer: ArrayBuffer): ExifData | null {
  const dataView = new DataView(buffer);
  if (buffer.byteLength < 12) return null;
  if (dataView.getUint8(0) !== 0xff || dataView.getUint8(1) !== 0xd8) return null;

  let offset = 2;
  while (offset < buffer.byteLength - 1) {
    if (dataView.getUint8(offset) !== 0xff) break;

    const marker = dataView.getUint8(offset + 1);
    const segmentLength = dataView.getUint16(offset + 2, false);
    if (offset + 2 + segmentLength > buffer.byteLength) break;

    if (marker === 0xe1) {
      if (offset + 10 >= buffer.byteLength) return null;

      const identifier = String.fromCharCode(
        dataView.getUint8(offset + 4),
        dataView.getUint8(offset + 5),
        dataView.getUint8(offset + 6),
        dataView.getUint8(offset + 7),
        dataView.getUint8(offset + 8),
        dataView.getUint8(offset + 9),
      );

      if (identifier === 'Exif\x00\x00') {
        return readTiffExif(dataView, offset + 10);
      }
    }

    offset += 2 + segmentLength;
  }

  return null;
}

async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image'));
    };

    image.src = objectUrl;
  });
}

export async function extractImageMetadata(file: File): Promise<MetadataResult> {
  const buffer = await file.arrayBuffer();

  let exif: ExifData | null = null;
  if (file.type === 'image/jpeg' || file.name.toLowerCase().match(/\.(jpe?g|jfif)$/)) {
    exif = parseExifFromJpeg(buffer);
  }

  let width: number | undefined;
  let height: number | undefined;

  try {
    const dimensions = await getImageDimensions(file);
    width = dimensions.width;
    height = dimensions.height;
  } catch {
    width = exif?.ImageWidth;
    height = exif?.ImageHeight;
  }

  return {
    file: {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
      width,
      height,
    },
    exif,
    hasExif: exif !== null && Object.keys(exif).length > 0,
  };
}

export function getMetadataEntries(metadata: MetadataResult): MetadataEntry[] {
  const entries: MetadataEntry[] = [
    { label: 'File name', value: metadata.file.name, key: 'name' },
    { label: 'Size', value: formatBytes(metadata.file.size, 2), key: 'size' },
    { label: 'Type', value: metadata.file.type, key: 'type' },
    {
      label: 'Last modified',
      value: new Date(metadata.file.lastModified).toLocaleString(),
      key: 'modified',
    },
  ];

  if (metadata.file.width != null && metadata.file.height != null) {
    entries.push({
      label: 'Dimensions',
      value: `${metadata.file.width} × ${metadata.file.height}`,
      key: 'dimensions',
    });
  }

  if (metadata.exif) {
    for (const [key, value] of Object.entries(metadata.exif)) {
      if (value !== undefined && value !== null && value !== '') {
        entries.push({
          label: METADATA_TAG_LABELS[key as keyof ExifData] ?? key,
          value: String(value),
          key,
        });
      }
    }
  }

  return entries;
}
