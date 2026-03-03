import type { HashAlgorithm } from '@/types/common';

const WEB_CRYPTO_ALGOS: Partial<Record<HashAlgorithm, string>> = {
  SHA1: 'SHA-1',
  SHA256: 'SHA-256',
  SHA384: 'SHA-384',
  SHA512: 'SHA-512',
};

function bufferToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

async function md5Hash(input: string): Promise<string> {
  const mod = await import('crypto-js');
  const cryptoJs = (mod as { default?: typeof import('crypto-js') }).default ?? mod;
  return cryptoJs.MD5(input).toString();
}

export async function computeHash(
  algorithm: HashAlgorithm,
  input: string,
  key: string,
): Promise<string> {
  const encoder = new TextEncoder();

  if (algorithm === 'MD5') {
    return md5Hash(input);
  }

  if (algorithm === 'HMAC-SHA256') {
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      encoder.encode(key),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    );
    return bufferToHex(await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(input)));
  }

  const webAlgorithm = WEB_CRYPTO_ALGOS[algorithm];
  if (webAlgorithm) {
    return bufferToHex(await crypto.subtle.digest(webAlgorithm, encoder.encode(input)));
  }

  return '';
}