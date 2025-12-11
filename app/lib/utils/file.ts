/**
 * Format file size in bytes to human-readable string
 * @param bytes - File size in bytes
 * @param unit - 'KB' or 'MB' (default: 'KB')
 */
export const formatFileSize = (bytes: number, unit: 'KB' | 'MB' = 'KB'): string => {
  if (unit === 'MB') {
    const mb = (bytes / 1024 / 1024).toFixed(2);
    return `${mb}MB`;
  }
  return `${(bytes / 1024).toFixed(2)} KB`;
};

export const getFileExtensionFromName = (filename: string): string => {
  return filename.split('.').pop()?.toLowerCase() || '';
};

export const getFileExtensionFromMime = (mime: string): string => {
  if (mime === 'image/jpeg') return 'jpg';
  return mime.replace('image/', '');
};

export const downloadDataUrl = (dataUrl: string, filename: string): void => {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  link.click();
};

/**
 * Download a Blob as a file
 * @param blob - The blob to download
 * @param filename - The filename for the download
 */
export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

/**
 * Format error message from error object
 * @param error - Error object or unknown
 * @param defaultMessage - Default message if error is not an Error instance
 */
export const formatErrorMessage = (error: unknown, defaultMessage: string = 'An error occurred'): string => {
  if (error instanceof Error) {
    return `Error: ${error.message}`;
  }
  return defaultMessage;
};

/**
 * Validate image file
 * @param file - File to validate
 * @returns Validation result with valid flag and optional error message
 */
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'Only image files are supported' };
  }
  return { valid: true };
};

/**
 * Validate PDF file
 * @param file - File to validate
 * @returns Validation result with valid flag and optional error message
 */
export const validatePdfFile = (file: File): { valid: boolean; error?: string } => {
  if (!file.type.includes('pdf')) {
    return { valid: false, error: 'Only PDF files are supported' };
  }
  return { valid: true };
};

