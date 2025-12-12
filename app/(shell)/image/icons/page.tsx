import ImageIconsClient from './page.client';
import { getRouteMetadata } from '@/app/lib/constants';

export const metadata = getRouteMetadata('/image/icons');

export default function Page() {
  return <ImageIconsClient />;
}
