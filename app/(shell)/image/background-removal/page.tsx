import ImageBackgroundRemovalClient from './page.client';
import { getRouteMetadata } from '@/app/lib/metadata';

export const metadata = getRouteMetadata('/image/background-removal');

export default function Page() {
  return <ImageBackgroundRemovalClient />;
}
