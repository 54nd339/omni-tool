import CryptoJS from 'crypto-js';
import * as jose from 'jose';
import { HashResults, JwtPayloadObject } from '@/app/lib/types';

export const hashValue = {
  sha1: (input: string) => CryptoJS.SHA1(input).toString(),
  sha256: (input: string) => CryptoJS.SHA256(input).toString(),
  sha512: (input: string) => CryptoJS.SHA512(input).toString(),
  md5: (input: string) => CryptoJS.MD5(input).toString(),
};

export const rot13 = (value: string) => {
  return value.replace(/[a-zA-Z]/g, (c) => {
    const code = c.charCodeAt(0);
    const base = code <= 90 ? 90 : 122;
    return String.fromCharCode(base >= code + 13 ? code + 13 : code + 13 - 26);
  });
};

export const aesEncrypt = (secret: string, plaintext: string): string => {
  return CryptoJS.AES.encrypt(plaintext, secret).toString();
};

export const aesDecrypt = (secret: string, ciphertext: string): string => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, secret);
  return bytes.toString(CryptoJS.enc.Utf8);
};

export const computeHashes = (text: string): HashResults | null => {
  if (!text) return null;
  return {
    'SHA-1': hashValue.sha1(text),
    'SHA-256': hashValue.sha256(text),
    'SHA-512': hashValue.sha512(text),
    MD5: hashValue.md5(text),
  };
};

export const encodeJwt = async (payloadText: string, secret: string): Promise<string> => {
  const payloadObj = JSON.parse(payloadText) as JwtPayloadObject;
  const secretKey = new TextEncoder().encode(secret);
  return new jose.SignJWT(payloadObj).setProtectedHeader({ alg: 'HS256' }).sign(secretKey);
};

export const decodeJwt = async (token: string, secret: string): Promise<JwtPayloadObject> => {
  const secretKey = new TextEncoder().encode(secret);
  const { payload } = await jose.jwtVerify(token, secretKey);
  return payload as JwtPayloadObject;
};
