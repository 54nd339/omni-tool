export interface ExifData {
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

export interface FileInfo {
  name: string;
  size: number;
  type: string;
  lastModified: number;
  width?: number;
  height?: number;
}

export interface MetadataResult {
  file: FileInfo;
  exif: ExifData | null;
  hasExif: boolean;
}

export interface MetadataEntry {
  key: string;
  label: string;
  value: string;
}
