export interface TextStats {
  bytesUtf16: number;
  bytesUtf8: number;
  chars: number;
  lineCount: number;
  readingTime: string;
  sentenceCount: number;
  uniqueWords: number;
  wordCount: number;
}

export function analyzeTextStats(text: string): TextStats {
  const chars = text.length;
  const bytesUtf8 = new TextEncoder().encode(text).length;
  const bytesUtf16 = chars * 2;
  const words = text.trim() ? text.trim().split(/\s+/).filter(Boolean) : [];
  const wordCount = words.length;
  const lines = text ? text.split(/\n/) : [];
  const lineCount = lines.length;
  const sentences = text.trim()
    ? text.split(/[.!?]+/).filter((sentence) => sentence.trim().length > 0)
    : [];
  const sentenceCount = sentences.length;
  const uniqueWords = new Set(words.map((word) => word.toLowerCase())).size;
  const readingTimeMinutes = wordCount / 200;
  const readingTime =
    readingTimeMinutes < 1
      ? `${Math.ceil(readingTimeMinutes * 60)} sec`
      : `${readingTimeMinutes.toFixed(1)} min`;

  return {
    bytesUtf16,
    bytesUtf8,
    chars,
    lineCount,
    readingTime,
    sentenceCount,
    uniqueWords,
    wordCount,
  };
}
