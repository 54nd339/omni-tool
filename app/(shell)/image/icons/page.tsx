import ImageIconsClient from './page.client';
import { getRouteMetadata } from '@/app/lib/metadata';

export const metadata = getRouteMetadata('/image/icons');

export default function Page() {
  return <ImageIconsClient />;
}
