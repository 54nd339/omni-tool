export function parseTime(str: string): number {
  const parts = str.split(':').map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parts[0] || 0;
}

export function isValidTimeFormat(str: string): boolean {
  return /^\d{1,2}(:\d{2}){1,2}$/.test(str.trim());
}
