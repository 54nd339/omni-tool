import DevTimeClient from './page.client';
import { getRouteMetadata } from '@/app/lib/constants';

export const metadata = getRouteMetadata('/dev/time');

export default function Page() {
  return <DevTimeClient />;
}
