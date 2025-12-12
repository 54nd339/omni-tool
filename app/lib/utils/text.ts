/**
 * Utility functions for text encoding/decoding operations
 */

export const encodeText = {
  base64: (text: string): string => {
    return btoa(unescape(encodeURIComponent(text)));
  },
  url: (text: string): string => {
    return encodeURIComponent(text);
  },
  html: (text: string): string => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  },
  uri: (text: string): string => {
    return encodeURI(text);
  },
};

export const decodeText = {
  base64: (text: string): string => {
    return decodeURIComponent(escape(atob(text)));
  },
  url: (text: string): string => {
    return decodeURIComponent(text);
  },
  html: (text: string): string => {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
  },
  uri: (text: string): string => {
    return decodeURI(text);
  },
};

export const caesarCipher = {
  encode: (text: string, shift: number = 3): string => {
    return text
      .split('')
      .map((c) => {
        if (c.match(/[a-z]/i)) {
          const code = c.charCodeAt(0);
          const start = code >= 97 ? 97 : 65;
          return String.fromCharCode(((code - start + shift) % 26) + start);
        }
        return c;
      })
      .join('');
  },
  decode: (text: string, shift: number = 3): string => {
    return text
      .split('')
      .map((c) => {
        if (c.match(/[a-z]/i)) {
          const code = c.charCodeAt(0);
          const start = code >= 97 ? 97 : 65;
          return String.fromCharCode(((code - start - shift + 26) % 26) + start);
        }
        return c;
      })
      .join('');
  },
};
