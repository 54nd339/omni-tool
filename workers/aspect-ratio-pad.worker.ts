import * as Comlink from 'comlink';

interface TargetDimensions {
  targetHeight: number;
  targetWidth: number;
}

interface PadImageParams {
  file: File;
  fillColor: string;
  target: TargetDimensions;
}

export interface AspectRatioPadWorkerApi {
  padImageToDimensions: (params: PadImageParams) => Promise<Blob>;
}

const api: AspectRatioPadWorkerApi = {
  async padImageToDimensions(params) {
    const image = await createImageBitmap(params.file);

    try {
      const canvas = new OffscreenCanvas(
        params.target.targetWidth,
        params.target.targetHeight,
      );
      const context = canvas.getContext('2d');
      if (!context) {
        throw new Error('Canvas 2D context not available');
      }

      if (params.fillColor !== 'transparent') {
        context.fillStyle = params.fillColor;
        context.fillRect(0, 0, canvas.width, canvas.height);
      } else {
        context.clearRect(0, 0, canvas.width, canvas.height);
      }

      const scale = Math.min(canvas.width / image.width, canvas.height / image.height);
      const width = Math.round(image.width * scale);
      const height = Math.round(image.height * scale);
      const x = Math.round((canvas.width - width) / 2);
      const y = Math.round((canvas.height - height) / 2);

      context.drawImage(image, x, y, width, height);
      return canvas.convertToBlob({ type: 'image/png' });
    } finally {
      image.close();
    }
  },
};

Comlink.expose(api);
