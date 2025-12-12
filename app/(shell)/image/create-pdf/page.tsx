import CreatePdfClient from './page.client';
import { getRouteMetadata } from '@/app/lib/constants';

export const metadata = getRouteMetadata('/image/create-pdf');

export default function Page() {
  return <CreatePdfClient />;
}
