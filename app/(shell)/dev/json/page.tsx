import DevJsonClient from './page.client';
import { getRouteMetadata } from '@/app/lib/metadata';

export const metadata = getRouteMetadata('/dev/json');

export default function Page() {
  return <DevJsonClient />;
}
