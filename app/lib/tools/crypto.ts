/**
 * Crypto utilities using crypto-js library
 */

import CryptoJS from 'crypto-js';

// Hash functions
export const hashValue = {
  sha1: (input: string) => CryptoJS.SHA1(input).toString(),
  sha256: (input: string) => CryptoJS.SHA256(input).toString(),
  sha512: (input: string) => CryptoJS.SHA512(input).toString(),
  md5: (input: string) => CryptoJS.MD5(input).toString(),
};

// Base64
export const toBase64 = (input: string) => CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(input));
export const fromBase64 = (input: string) => CryptoJS.enc.Base64.parse(input).toString(CryptoJS.enc.Utf8);

// ROT13
export const rot13 = (value: string) => {
  return value.replace(/[a-zA-Z]/g, (c) => {
    const code = c.charCodeAt(0);
    const base = code <= 90 ? 90 : 122;
    return String.fromCharCode(base >= code + 13 ? code + 13 : code + 13 - 26);
  });
};

// AES encryption/decryption
export const aesEncrypt = (secret: string, plaintext: string): string => {
  return CryptoJS.AES.encrypt(plaintext, secret).toString();
};

export const aesDecrypt = (secret: string, ciphertext: string): string => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, secret);
  return bytes.toString(CryptoJS.enc.Utf8);
};
