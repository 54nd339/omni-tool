import DevDashboard from './page.client';
import { getRouteMetadata } from '@/app/lib/constants';

export const metadata = getRouteMetadata('/dev');

export default function Page() {
  return <DevDashboard />;
}
