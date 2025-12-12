import MediaConvertClient from './page.client';
import { getRouteMetadata } from '@/app/lib/constants';

export const metadata = getRouteMetadata('/media/convert');

export default function Page() {
  return <MediaConvertClient />;
}
