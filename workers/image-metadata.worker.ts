import * as Comlink from 'comlink';

export interface ImageMetadataWorkerApi {
  stripMetadata: (input: File) => Promise<Blob>;
}

const api: ImageMetadataWorkerApi = {
  async stripMetadata(input) {
    const image = await createImageBitmap(input);

    try {
      const canvas = new OffscreenCanvas(image.width, image.height);
      const context = canvas.getContext('2d');
      if (!context) {
        throw new Error('Canvas context not available');
      }

      context.drawImage(image, 0, 0);
      return canvas.convertToBlob({ quality: 1, type: 'image/png' });
    } finally {
      image.close();
    }
  },
};

Comlink.expose(api);
