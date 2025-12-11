import DevDashboard from './page.client';
import { getRouteMetadata } from '@/app/lib/metadata';

export const metadata = getRouteMetadata('/dev');

export default function Page() {
  return <DevDashboard />;
}
