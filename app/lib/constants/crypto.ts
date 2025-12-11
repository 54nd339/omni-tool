import { CipherMode } from '@/app/lib/types';

export const CIPHER_MODES: Array<{ value: CipherMode; label: string }> = [
  { value: 'aes', label: 'AES Encryption' },
  { value: 'caesar', label: 'Caesar Cipher' },
  { value: 'rot13', label: 'ROT13' },
] as const;

export const CRYPTO_DEFAULTS = {
  CIPHER_MODE: 'aes' as CipherMode,
  JWT_PAYLOAD: '{"sub":"123","name":"OmniTool","iat":1234567890}',
  JWT_SECRET: 'your-secret-key',
  URL_ENCODING_TYPE: 'base64' as const,
} as const;

