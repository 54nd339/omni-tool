import {
  CHARSETS,
  QR_ERROR_CORRECTION_LEVELS,
} from '@/lib/constants/generators';
import type {
  ErrorCorrectionLevel,
  IdType,
  PasswordStrength,
  QrRenderOptions,
} from '@/types/common';

export type {
  ErrorCorrectionLevel,
  ErrorCorrectionOption,
  IdType,
  PasswordStrength,
  QrRenderOptions,
} from '@/types/common';

export function isErrorCorrectionLevel(value: string): value is ErrorCorrectionLevel {
  return QR_ERROR_CORRECTION_LEVELS.some((level) => level.id === value);
}

export async function renderQrToCanvas(
  canvas: HTMLCanvasElement,
  options: QrRenderOptions,
): Promise<void> {
  const qrCode = (await import('qrcode')).default;
  const { bgColor, ecLevel, fgColor, margin = 2, size, text } = options;

  await qrCode.toCanvas(canvas, text, {
    color: { dark: fgColor, light: bgColor },
    errorCorrectionLevel: ecLevel,
    margin,
    width: size,
  });
}

export async function generateQrPngBlob(
  options: QrRenderOptions,
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  await renderQrToCanvas(canvas, options);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Failed to generate QR PNG'));
        return;
      }
      resolve(blob);
    }, 'image/png');
  });
}

export async function generateQrSvg(options: QrRenderOptions): Promise<string> {
  const qrCode = (await import('qrcode')).default;
  const { bgColor, ecLevel, fgColor, margin = 2, size, text } = options;

  return qrCode.toString(text, {
    color: { dark: fgColor, light: bgColor },
    errorCorrectionLevel: ecLevel,
    margin,
    type: 'svg',
    width: size,
  });
}

const ULID_ENCODING = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

export function generateUlid(): string {
  const now = Date.now();
  let timePart = '';
  let timestamp = now;

  for (let index = 0; index < 10; index++) {
    timePart = ULID_ENCODING[timestamp % 32] + timePart;
    timestamp = Math.floor(timestamp / 32);
  }

  let randomPart = '';
  const randomValues = crypto.getRandomValues(new Uint8Array(10));
  for (let index = 0; index < 16; index++) {
    randomPart += ULID_ENCODING[randomValues[index % 10] % 32];
  }

  return timePart + randomPart;
}

export function generateId(idType: IdType): string {
  return idType === 'uuid' ? crypto.randomUUID() : generateUlid();
}

export function buildCharpool(options: {
  uppercase: boolean;
  lowercase: boolean;
  digits: boolean;
  symbols: boolean;
  custom: string;
}): string {
  let pool = '';
  if (options.uppercase) pool += CHARSETS.uppercase;
  if (options.lowercase) pool += CHARSETS.lowercase;
  if (options.digits) pool += CHARSETS.digits;
  if (options.symbols) pool += CHARSETS.symbols;
  if (options.custom) pool += options.custom;
  return pool || CHARSETS.lowercase;
}

export function generatePassword(length: number, charpool: string): string {
  const randomValues = crypto.getRandomValues(new Uint32Array(length));
  return Array.from(randomValues, (value) => charpool[value % charpool.length]).join('');
}

export function getPasswordStrength(password: string): PasswordStrength {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (password.length >= 20) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score <= 2) return { label: 'Weak', color: 'bg-destructive', score };
  if (score <= 4) return { label: 'Medium', color: 'bg-yellow-500', score };
  return { label: 'Strong', color: 'bg-green-500', score };
}