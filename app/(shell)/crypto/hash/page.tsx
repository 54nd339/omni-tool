import HashPageClient from './page.client';
import { getRouteMetadata } from '@/app/lib/metadata';

export const metadata = getRouteMetadata('/crypto/hash');

export default function Page() {
  return <HashPageClient />;
}
