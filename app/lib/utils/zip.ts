import JSZip from 'jszip';

interface FileEntry {
  name: string;
  blob: Blob;
}

/**
 * Create a zip file from multiple blobs
 */
export const createZipFile = async (files: FileEntry[], zipName: string) => {
  const zip = new JSZip();
  files.forEach(({ name, blob }) => {
    zip.file(name, blob);
  });

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(zipBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = zipName;
  link.click();
  URL.revokeObjectURL(url);
};

/**
 * Download multiple blobs as PDF pages in a zip
 */
export const downloadPdfsAsZip = async (blobs: Blob[], zipName: string = 'files.zip') => {
  const files = blobs.map((blob, idx) => ({
    name: `page-${idx + 1}.pdf`,
    blob,
  }));
  await createZipFile(files, zipName);
};

/**
 * Download multiple blobs as images in a zip
 */
export const downloadImagesAsZip = async (blobs: Blob[], format: string, zipName: string = 'images.zip') => {
  const files = blobs.map((blob, idx) => ({
    name: `page-${idx + 1}.${format}`,
    blob,
  }));
  await createZipFile(files, zipName);
};
