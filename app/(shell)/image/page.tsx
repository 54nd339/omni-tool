import ImageDashboard from './page.client';
import { getRouteMetadata } from '@/app/lib/metadata';

export const metadata = getRouteMetadata('/image');

export default function Page() {
  return <ImageDashboard />;
}
