export async function readImageDimensions(file: File): Promise<{ height: number; width: number }> {
  const url = URL.createObjectURL(file);

  try {
    const img = new Image();
    img.src = url;

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Could not load image'));
    });

    return { width: img.width, height: img.height };
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function toPaddedFileName(fileName: string): string {
  return `${fileName.replace(/\.[^.]+$/, '')}-padded.png`;
}

export function revokeUrl(url: string | null): void {
  if (url) {
    URL.revokeObjectURL(url);
  }
}
