import DevDiffClient from './page.client';
import { getRouteMetadata } from '@/app/lib/metadata';

export const metadata = getRouteMetadata('/dev/diff');

export default function Page() {
  return <DevDiffClient />;
}
