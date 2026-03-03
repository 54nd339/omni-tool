export interface IconGenerationRequest {
  platforms: { platform: string; sizes: number[] }[];
  sourceImageBitmap: ImageBitmap;
}

export async function generateIcons(
  request: IconGenerationRequest,
): Promise<Blob> {
  const { default: JSZip } = await import('jszip');
  const zip = new JSZip();
  const img = request.sourceImageBitmap;

  for (const { platform, sizes } of request.platforms) {
    const folder = zip.folder(platform);
    if (!folder) throw new Error(`Failed to create folder for ${platform}`);

    for (const size of sizes) {
      const canvas = new OffscreenCanvas(size, size);
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error(`Failed to get 2D context for ${size}x${size}`);
      ctx.drawImage(img, 0, 0, size, size);
      const blob = await canvas.convertToBlob({ type: 'image/png' });
      const buffer = await blob.arrayBuffer();
      folder.file(`${platform}-${size}x${size}.png`, buffer);
    }
  }

  return zip.generateAsync({ type: 'blob' });
}
