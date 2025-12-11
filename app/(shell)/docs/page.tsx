import DocsDashboard from './page.client';
import { getRouteMetadata } from '@/app/lib/metadata';

export const metadata = getRouteMetadata('/docs');

export default function Page() {
  return <DocsDashboard />;
}
