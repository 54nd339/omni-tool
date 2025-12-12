import ImageDashboard from './page.client';
import { getRouteMetadata } from '@/app/lib/constants';

export const metadata = getRouteMetadata('/image');

export default function Page() {
  return <ImageDashboard />;
}
