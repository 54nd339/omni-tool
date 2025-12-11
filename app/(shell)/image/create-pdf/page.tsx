import { Metadata } from 'next';
import CreatePdfClient from './page.client';

export const metadata: Metadata = {
  title: 'Create PDF - Convert Images to PDF Documents',
  description: 'Convert images to PDF documents. Upload, reorder, and generate PDFs from your images easily.',
};

export default function Page() {
  return <CreatePdfClient />;
}
