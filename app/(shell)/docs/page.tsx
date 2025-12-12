import DocsDashboard from './page.client';
import { getRouteMetadata } from '@/app/lib/constants';

export const metadata = getRouteMetadata('/docs');

export default function Page() {
  return <DocsDashboard />;
}
