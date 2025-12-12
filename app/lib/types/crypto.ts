export type HashResults = {
  'SHA-1': string;
  'SHA-256': string;
  'SHA-512': string;
  MD5: string;
};

export type CipherMode = 'aes' | 'caesar' | 'rot13';

export type JwtPayloadObject = Record<string, unknown>;

export type EncodingType = 'base64' | 'url' | 'html' | 'uri';