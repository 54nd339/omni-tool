import DevTimeClient from './page.client';
import { getRouteMetadata } from '@/app/lib/metadata';

export const metadata = getRouteMetadata('/dev/time');

export default function Page() {
  return <DevTimeClient />;
}
