import MediaMergeClient from './page.client';
import { getRouteMetadata } from '@/app/lib/metadata';

export const metadata = getRouteMetadata('/media/merge');

export default function Page() {
  return <MediaMergeClient />;
}
