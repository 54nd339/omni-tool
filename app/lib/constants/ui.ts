/**
 * UI Constants - Application-wide UI configuration
 */

export const UI_CONSTANTS = {
  ANIMATION: {
    COPY_FEEDBACK_DURATION: 2000,
    FADE_IN_DURATION: 500,
  },
  TEXTAREA: {
    DEFAULT_ROWS: 6,
    LARGE_ROWS: 8,
    SMALL_ROWS: 4,
  },
  IMAGE: {
    DEFAULT_QUALITY: 0.7,
    EDIT_QUALITY: 0.8,
    CONVERSION_QUALITY: 0.9,
    PDF_QUALITY: 0.92,
    DEFAULT_WIDTH: 800,
    DEFAULT_HEIGHT: 600,
    DEFAULT_SCALE: 100,
    MIN_QUALITY: 0.1,
    MAX_QUALITY: 1.0,
    MIN_SCALE: 10,
    MAX_SCALE: 200,
    PERCENTAGE_BASE: 100,
    GRAYSCALE_FILTER: 'grayscale(100%)',
  },
  HASH: {
    ALGORITHMS: ['SHA-1', 'SHA-256', 'SHA-512', 'MD5'] as const,
  },
  CRYPTO: {
    DEFAULT_SECRET: 'omnitool',
    CAESAR_SHIFT: 3,
  },
  BACKGROUND_REMOVER: {
    AUTO_START_DELAY: 100, // ms
  },
  FILE_SIZE: {
    ROUNDING_PRECISION: 2,
    KB_DIVISOR: 1024,
    MB_DIVISOR: 1024 * 1024,
  },
} as const;

// Type exports
export type HashAlgorithm = (typeof UI_CONSTANTS.HASH.ALGORITHMS)[number];

