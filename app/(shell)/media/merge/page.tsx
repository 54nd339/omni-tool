import MediaMergeClient from './page.client';
import { getRouteMetadata } from '@/app/lib/constants';

export const metadata = getRouteMetadata('/media/merge');

export default function Page() {
  return <MediaMergeClient />;
}
