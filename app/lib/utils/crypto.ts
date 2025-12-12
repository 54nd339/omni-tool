import { aesEncrypt, aesDecrypt, rot13 } from '@/app/lib/tools';
import { caesarCipher } from './text';
import { UI_CONSTANTS } from '@/app/lib/constants';
import { CipherMode } from '@/app/lib/types';
import { formatErrorMessage } from './file';

export const encodeCipher = (mode: CipherMode, secret: string, input: string): string => {
  try {
    switch (mode) {
      case 'aes':
        return aesEncrypt(secret, input);
      case 'caesar':
        return caesarCipher.encode(input, UI_CONSTANTS.CRYPTO.CAESAR_SHIFT);
      case 'rot13':
        return rot13(input);
      default:
        return input;
    }
  } catch (error) {
    throw new Error(`Encode error: ${formatErrorMessage(error, 'Encoding failed')}`);
  }
};

export const decodeCipher = (mode: CipherMode, secret: string, input: string): string => {
  try {
    switch (mode) {
      case 'aes':
        return aesDecrypt(secret, input);
      case 'caesar':
        return caesarCipher.decode(input, UI_CONSTANTS.CRYPTO.CAESAR_SHIFT);
      case 'rot13':
        return rot13(input);
      default:
        return input;
    }
  } catch (error) {
    throw new Error(`Decode error: ${formatErrorMessage(error, 'Decoding failed')}`);
  }
};
