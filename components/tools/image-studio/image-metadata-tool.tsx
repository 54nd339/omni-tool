'use client';

import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ImageIcon } from 'lucide-react';
import { useClipboardPaste, useDownload } from '@/hooks';
import { EmptyState } from '@/components/shared/empty-state';
import { FileDropzone } from '@/components/shared/file-dropzone';
import { CopyButton } from '@/components/shared/copy-button';
import { Button } from '@/components/ui/button';

interface ExifData {
  Make?: string;
  Model?: string;
  DateTime?: string;
  ExposureTime?: string;
  FNumber?: string;
  ISO?: number;
  FocalLength?: string;
  ImageWidth?: number;
  ImageHeight?: number;
  Orientation?: number;
  Software?: string;
  GPSLatitude?: string;
  GPSLongitude?: string;
}

interface FileInfo {
  name: string;
  size: number;
  type: string;
  lastModified: number;
  width?: number;
  height?: number;
}

interface MetadataResult {
  file: FileInfo;
  exif: ExifData | null;
  hasExif: boolean;
}

const EXIF_TAGS: Record<number, keyof ExifData> = {
  0x010f: 'Make',
  0x0110: 'Model',
  0x0132: 'DateTime',
  0x829a: 'ExposureTime',
  0x829d: 'FNumber',
  0x8827: 'ISO',
  0x920a: 'FocalLength',
  0xa002: 'ImageWidth',
  0xa003: 'ImageHeight',
  0x0112: 'Orientation',
  0x0131: 'Software',
};

const TIFF_TAGS: Record<number, keyof ExifData> = {
  0x0100: 'ImageWidth',
  0x0101: 'ImageHeight',
  0x0132: 'DateTime',
  0x010f: 'Make',
  0x0110: 'Model',
  0x0112: 'Orientation',
  0x0131: 'Software',
};

function parseExifFromJpeg(buffer: ArrayBuffer): ExifData | null {
  const dv = new DataView(buffer);
  if (buffer.byteLength < 12) return null;
  if (dv.getUint8(0) !== 0xff || dv.getUint8(1) !== 0xd8) return null;

  let offset = 2;
  const length = buffer.byteLength;

  while (offset < length - 1) {
    if (dv.getUint8(offset) !== 0xff) break;
    const marker = dv.getUint8(offset + 1);
    const segLen = dv.getUint16(offset + 2, false);
    if (offset + 2 + segLen > length) break;

    if (marker === 0xe1) {
      if (offset + 10 >= length) return null;
      const ident = String.fromCharCode(
        dv.getUint8(offset + 4),
        dv.getUint8(offset + 5),
        dv.getUint8(offset + 6),
        dv.getUint8(offset + 7),
        dv.getUint8(offset + 8),
        dv.getUint8(offset + 9),
      );
      if (ident !== 'Exif\x00\x00') {
        offset += 2 + segLen;
        continue;
      }
      return readTiffExif(dv, offset + 10);
    }

    offset += 2 + segLen;
  }
  return null;
}

function readTiffExif(dv: DataView, tiffStart: number): ExifData | null {
  const result: ExifData = {};
  const byteOrder = dv.getUint16(tiffStart, false);
  const littleEndian = byteOrder === 0x4949;

  if (dv.getUint16(tiffStart + 2, littleEndian) !== 42) return null;

  const ifd0Offset = dv.getUint32(tiffStart + 4, littleEndian);
  const ifd0Start = tiffStart + ifd0Offset;
  const ifd0Count = dv.getUint16(ifd0Start, littleEndian);

  function readIfd(start: number, tagMap: Record<number, keyof ExifData>): void {
    const count = dv.getUint16(start, littleEndian);
    for (let i = 0; i < count; i++) {
      const entryOffset = start + 2 + i * 12;
      if (entryOffset + 12 > dv.byteLength) continue;

      const tag = dv.getUint16(entryOffset, littleEndian);
      const type = dv.getUint16(entryOffset + 2, littleEndian);
      const numValues = dv.getUint32(entryOffset + 4, littleEndian);
      const valueOffset = dv.getUint32(entryOffset + 8, littleEndian);

      if (!(tag in tagMap)) continue;
      const key = tagMap[tag as keyof typeof tagMap];
      const inlineOffset = entryOffset + 8;

      try {
        if (type === 2) {
          let str = '';
          const off = tiffStart + valueOffset;
          for (let j = 0; j < numValues - 1 && off + j < dv.byteLength; j++) {
            const c = dv.getUint8(off + j);
            if (c === 0) break;
            str += String.fromCharCode(c);
          }
          (result as Record<string, string | number | undefined>)[key] = str.trim() || undefined;
        } else if (type === 3) {
          if (numValues === 1) {
            (result as Record<string, string | number | undefined>)[key] = dv.getUint16(inlineOffset, littleEndian);
          }
        } else if (type === 4) {
          if (numValues === 1) {
            (result as Record<string, string | number | undefined>)[key] = dv.getUint32(inlineOffset, littleEndian);
          }
        } else if (type === 5) {
          if (numValues >= 1) {
            const num = dv.getUint32(tiffStart + valueOffset, littleEndian);
            const den = dv.getUint32(tiffStart + valueOffset + 4, littleEndian);
            if (den !== 0) {
              const val = num / den;
              (result as Record<string, string | number | undefined>)[key] =
                key === 'ExposureTime' || key === 'FNumber' || key === 'FocalLength' ? String(val) : val;
            }
          }
        }
      } catch (e) {
        if (process.env.NODE_ENV === 'development') console.warn('Skipping invalid EXIF entry', e);
      }
    }
  }

  readIfd(ifd0Start, TIFF_TAGS);

  for (let i = 0; i < ifd0Count; i++) {
    const eo = ifd0Start + 2 + i * 12;
    const t = dv.getUint16(eo, littleEndian);
    if (t === 0x8769) {
      const exifIfdOff = dv.getUint32(eo + 8, littleEndian);
      readIfd(tiffStart + exifIfdOff, EXIF_TAGS);
      break;
    }
  }

  for (let i = 0; i < ifd0Count; i++) {
    const eo = ifd0Start + 2 + i * 12;
    const t = dv.getUint16(eo, littleEndian);
    if (t === 0x8825) {
      const gpsIfdOff = dv.getUint32(eo + 8, littleEndian);
      const gpsStart = tiffStart + gpsIfdOff;
      const gpsCount = dv.getUint16(gpsStart, littleEndian);
      for (let gi = 0; gi < gpsCount; gi++) {
        const ge = gpsStart + 2 + gi * 12;
        const gtag = dv.getUint16(ge, littleEndian);
        if (gtag === 0x0002) {
          const vo = dv.getUint32(ge + 8, littleEndian);
          const d = tiffStart + vo;
          const degN = dv.getUint32(d, littleEndian) / (dv.getUint32(d + 4, littleEndian) || 1);
          const degD = dv.getUint32(d + 8, littleEndian) / (dv.getUint32(d + 12, littleEndian) || 1);
          const degS = dv.getUint32(d + 16, littleEndian) / (dv.getUint32(d + 20, littleEndian) || 1);
          result.GPSLatitude = `${degN}° ${degD}' ${degS}"`;
        } else if (gtag === 0x0004) {
          const vo = dv.getUint32(ge + 8, littleEndian);
          const d = tiffStart + vo;
          const degN = dv.getUint32(d, littleEndian) / (dv.getUint32(d + 4, littleEndian) || 1);
          const degD = dv.getUint32(d + 8, littleEndian) / (dv.getUint32(d + 12, littleEndian) || 1);
          const degS = dv.getUint32(d + 16, littleEndian) / (dv.getUint32(d + 20, littleEndian) || 1);
          result.GPSLongitude = `${degN}° ${degD}' ${degS}"`;
        }
      }
      break;
    }
  }

  return Object.keys(result).length > 0 ? result : null;
}

async function getImageDimensions(
  file: File,
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    img.src = url;
  });
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function ImageMetadataTool() {
  const [file, setFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<MetadataResult | null>(null);
  const [stripLoading, setStripLoading] = useState(false);
  const { download } = useDownload();

  const handleFiles = useCallback(async (files: File[]) => {
    const f = files[0];
    if (!f) return;

    setFile(f);

    const buffer = await f.arrayBuffer();
    let exif: ExifData | null = null;
    if (f.type === 'image/jpeg' || f.name.toLowerCase().match(/\.(jpe?g|jfif)$/)) {
      exif = parseExifFromJpeg(buffer);
    }

    let width: number | undefined;
    let height: number | undefined;
    try {
      const dims = await getImageDimensions(f);
      width = dims.width;
      height = dims.height;
    } catch {
      width = exif?.ImageWidth;
      height = exif?.ImageHeight;
    }

    setMetadata({
      file: {
        name: f.name,
        size: f.size,
        type: f.type,
        lastModified: f.lastModified,
        width,
        height,
      },
      exif,
      hasExif: exif !== null && Object.keys(exif).length > 0,
    });
  }, []);

  useClipboardPaste(handleFiles, !file);

  const handleStripAndDownload = useCallback(async () => {
    if (!file) return;
    setStripLoading(true);
    try {
      const img = new window.Image();
      const url = URL.createObjectURL(file);
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load'));
        img.src = url;
      });

      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context not available');
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      const baseName = file.name.replace(/\.[^.]+$/, '');
      canvas.toBlob(
        (blob) => {
          if (blob) {
            download(blob, `${baseName}-no-metadata.png`);
            toast.success('Image downloaded without metadata');
          } else {
            toast.error('Failed to create image');
          }
          setStripLoading(false);
        },
        'image/png',
        1,
      );
    } catch {
      toast.error('Failed to strip metadata');
      setStripLoading(false);
    }
  }, [file, download]);

  const metaEntries = useMemo(() => {
    if (!metadata) return [];
    const entries: { label: string; value: string; key: string }[] = [];

    entries.push(
      { label: 'File name', value: metadata.file.name, key: 'name' },
      { label: 'Size', value: formatFileSize(metadata.file.size), key: 'size' },
      { label: 'Type', value: metadata.file.type, key: 'type' },
      {
        label: 'Last modified',
        value: new Date(metadata.file.lastModified).toLocaleString(),
        key: 'modified',
      },
    );
    if (metadata.file.width != null && metadata.file.height != null) {
      entries.push({
        label: 'Dimensions',
        value: `${metadata.file.width} × ${metadata.file.height}`,
        key: 'dimensions',
      });
    }

    if (metadata.exif) {
      const tagLabels: Record<keyof ExifData, string> = {
        Make: 'Make',
        Model: 'Model',
        DateTime: 'Date/Time',
        ExposureTime: 'Exposure time',
        FNumber: 'F-number',
        ISO: 'ISO',
        FocalLength: 'Focal length',
        ImageWidth: 'Image width',
        ImageHeight: 'Image height',
        Orientation: 'Orientation',
        Software: 'Software',
        GPSLatitude: 'GPS latitude',
        GPSLongitude: 'GPS longitude',
      };
      for (const [k, v] of Object.entries(metadata.exif)) {
        if (v !== undefined && v !== null && v !== '') {
          entries.push({
            label: tagLabels[k as keyof ExifData] ?? k,
            value: String(v),
            key: k,
          });
        }
      }
    }
    return entries;
  }, [metadata]);

  if (!file) {
    return (
      <div className="space-y-6">
        <EmptyState
          icon={ImageIcon}
          title="Image Metadata Viewer"
          description="Upload an image to view its EXIF metadata and file information"
          hint="Tip: ⌘V to paste an image from clipboard"
        >
          <FileDropzone
            onFiles={handleFiles}
            accept={{ 'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.gif'] }}
            label="Drop an image or click to browse"
            hint="JPEG files show full EXIF; other formats show file info only"
          />
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FileDropzone
        onFiles={handleFiles}
        accept={{ 'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.gif'] }}
        label="Drop another image or click to change"
        hint="JPEG files show full EXIF; other formats show file info only"
      />

      {metadata && (
        <>
          {!metadata.hasExif && (
            <p className="rounded-lg border border-amber-500/50 bg-amber-500/10 px-4 py-2 text-sm text-amber-700 dark:text-amber-400">
              No EXIF data found. Showing basic file info only. (EXIF is typically present in JPEG files from cameras.)
            </p>
          )}

          <div className="overflow-hidden rounded-lg border border-border">
            <div className="grid gap-0 divide-y divide-border">
              {metaEntries.map(({ label, value, key }) => (
                <div
                  key={key}
                  className="flex items-center justify-between gap-4 px-4 py-3"
                >
                  <span className="text-sm font-medium text-muted-foreground">
                    {label}
                  </span>
                  <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
                    <span className="truncate text-right font-mono text-sm">
                      {value}
                    </span>
                    <CopyButton value={value} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleStripAndDownload}
              disabled={stripLoading}
            >
              {stripLoading ? 'Processing…' : 'Strip metadata & download'}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
