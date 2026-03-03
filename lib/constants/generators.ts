export const QR_ERROR_CORRECTION_LEVELS = [
  { id: 'L', label: 'L', hint: '~7% recovery' },
  { id: 'M', label: 'M', hint: '~15% recovery' },
  { id: 'Q', label: 'Q', hint: '~25% recovery' },
  { id: 'H', label: 'H', hint: '~30% recovery' },
] as const;

export const UUID_BATCH_SIZES = ['1', '5', '10', '50'] as const;

export const CHARSETS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  digits: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
} as const;

export const PASSWORD_BATCH_SIZES = ['1', '5', '10'] as const;
