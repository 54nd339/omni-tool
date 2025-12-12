import AspectRatioPadClient from './page.client';
import { getRouteMetadata } from '@/app/lib/constants';

export const metadata = getRouteMetadata('/image/aspect-ratio');

export default function Page() {
  return <AspectRatioPadClient />;
}
