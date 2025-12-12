import MediaDashboard from './page.client';
import { getRouteMetadata } from '@/app/lib/constants';

export const metadata = getRouteMetadata('/media');

export default function Page() {
  return <MediaDashboard />;
}
