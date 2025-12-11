import MediaDashboard from './page.client';
import { getRouteMetadata } from '@/app/lib/metadata';

export const metadata = getRouteMetadata('/media');

export default function Page() {
  return <MediaDashboard />;
}
