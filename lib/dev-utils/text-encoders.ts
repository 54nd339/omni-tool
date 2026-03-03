export type EncodeDecodeMode = 'encode' | 'decode';

const ENTITY_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '\u00a0': '&nbsp;',
  '\u00a9': '&copy;',
  '\u00ae': '&reg;',
  '\u2122': '&trade;',
  '\u2013': '&ndash;',
  '\u2014': '&mdash;',
  '\u2018': '&lsquo;',
  '\u2019': '&rsquo;',
  '\u201c': '&ldquo;',
  '\u201d': '&rdquo;',
};

export const INVALID_INPUT_MESSAGE = '(invalid input)';

export function utf8ToBase64(value: string): string {
  return btoa(
    Array.from(new TextEncoder().encode(value), (byte) => String.fromCharCode(byte)).join(''),
  );
}

export function base64ToUtf8(value: string): string {
  const binary = atob(value);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function encodeEntities(value: string, numeric: boolean): string {
  return value
    .replace(/[^\n\r\t\x20-\x7E]/g, (char) => {
      if (!numeric && ENTITY_MAP[char]) {
        return ENTITY_MAP[char];
      }

      return `&#${char.codePointAt(0) ?? 0};`;
    })
    .replace(/[&<>"']/g, (char) => {
      if (!numeric && ENTITY_MAP[char]) {
        return ENTITY_MAP[char];
      }

      return `&#${char.codePointAt(0) ?? 0};`;
    });
}

function decodeEntities(value: string): string {
  if (typeof document === 'undefined') {
    return value;
  }

  const textarea = document.createElement('textarea');
  textarea.innerHTML = value;

  return textarea.value;
}

export function convertBase64(value: string, mode: EncodeDecodeMode): string {
  if (!value) {
    return '';
  }

  try {
    return mode === 'encode' ? utf8ToBase64(value) : base64ToUtf8(value);
  } catch {
    return '';
  }
}

export function convertUrl(value: string, mode: EncodeDecodeMode): string {
  if (!value) {
    return '';
  }

  try {
    return mode === 'encode' ? encodeURIComponent(value) : decodeURIComponent(value);
  } catch {
    return INVALID_INPUT_MESSAGE;
  }
}

export function convertHtml(value: string, mode: EncodeDecodeMode, numeric: boolean): string {
  if (!value) {
    return '';
  }

  return mode === 'encode' ? encodeEntities(value, numeric) : decodeEntities(value);
}

export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = String(reader.result ?? '');
      resolve(result.split(',')[1] ?? result);
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file')); 
    };

    reader.readAsDataURL(file);
  });
}
