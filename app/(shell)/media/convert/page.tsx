import MediaConvertClient from './page.client';
import { getRouteMetadata } from '@/app/lib/metadata';

export const metadata = getRouteMetadata('/media/convert');

export default function Page() {
  return <MediaConvertClient />;
}
