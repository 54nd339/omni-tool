import { PDFDocument } from 'pdf-lib';

export async function createPdfFromImages(
  images: { blob: Blob; name: string }[],
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();

  for (const { blob } of images) {
    const buffer = await blob.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    let image;
    if (blob.type === 'image/png') {
      image = await doc.embedPng(bytes);
    } else {
      image = await doc.embedJpg(bytes);
    }

    const page = doc.addPage([image.width, image.height]);
    page.drawImage(image, {
      x: 0,
      y: 0,
      width: image.width,
      height: image.height,
    });
  }

  return doc.save();
}
