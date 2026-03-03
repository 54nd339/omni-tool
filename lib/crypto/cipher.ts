import type { CipherAlgorithm } from '@/types/common';

type CryptoJsModule = typeof import('crypto-js');

function encryptText(
  cryptoJs: CryptoJsModule,
  algorithm: CipherAlgorithm,
  input: string,
  passphrase: string,
): string {
  switch (algorithm) {
    case 'AES':
      return cryptoJs.AES.encrypt(input, passphrase).toString();
    case 'TripleDES':
      return cryptoJs.TripleDES.encrypt(input, passphrase).toString();
    case 'Rabbit':
      return cryptoJs.Rabbit.encrypt(input, passphrase).toString();
    case 'RC4':
      return cryptoJs.RC4.encrypt(input, passphrase).toString();
  }
}

function decryptText(
  cryptoJs: CryptoJsModule,
  algorithm: CipherAlgorithm,
  input: string,
  passphrase: string,
): string {
  try {
    let bytes: import('crypto-js').lib.WordArray;

    switch (algorithm) {
      case 'AES':
        bytes = cryptoJs.AES.decrypt(input, passphrase);
        break;
      case 'TripleDES':
        bytes = cryptoJs.TripleDES.decrypt(input, passphrase);
        break;
      case 'Rabbit':
        bytes = cryptoJs.Rabbit.decrypt(input, passphrase);
        break;
      case 'RC4':
        bytes = cryptoJs.RC4.decrypt(input, passphrase);
        break;
    }

    const result = bytes.toString(cryptoJs.enc.Utf8);
    return result || '(decryption produced empty output — wrong key?)';
  } catch {
    return '(decryption failed — check ciphertext and key)';
  }
}

export async function processCipher(
  mode: 'encrypt' | 'decrypt',
  algorithm: CipherAlgorithm,
  input: string,
  passphrase: string,
): Promise<string> {
  const mod = await import('crypto-js');
  const cryptoJs = (mod as { default?: CryptoJsModule }).default ?? mod;

  return mode === 'encrypt'
    ? encryptText(cryptoJs, algorithm, input, passphrase)
    : decryptText(cryptoJs, algorithm, input, passphrase);
}