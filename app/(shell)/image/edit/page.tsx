import { Metadata } from 'next';
import PageClient from './page.client';

export const metadata: Metadata = {
  title: 'Image Editor - Resize, Compress & Convert',
  description: 'Resize, compress, and convert images between formats. Adjust quality, dimensions, and apply grayscale effects.',
};

export default function Page() {
  return <PageClient />;
}
