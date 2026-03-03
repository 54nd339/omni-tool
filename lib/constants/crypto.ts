import type { CipherAlgorithm, HashAlgorithm } from '@/types/common';

interface HashAlgorithmOption {
  id: HashAlgorithm;
  label: string;
  needsKey: boolean;
}

export const CIPHER_ALGORITHMS = ['AES', 'TripleDES', 'Rabbit', 'RC4'] as const satisfies readonly CipherAlgorithm[];

export const HASH_ALGORITHMS = [
  { id: 'MD5', label: 'MD5', needsKey: false },
  { id: 'SHA1', label: 'SHA-1', needsKey: false },
  { id: 'SHA256', label: 'SHA-256', needsKey: false },
  { id: 'SHA384', label: 'SHA-384', needsKey: false },
  { id: 'SHA512', label: 'SHA-512', needsKey: false },
  { id: 'HMAC-SHA256', label: 'HMAC-SHA256', needsKey: true },
] as const satisfies readonly HashAlgorithmOption[];
