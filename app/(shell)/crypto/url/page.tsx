import UrlPageClient from './page.client';
import { getRouteMetadata } from '@/app/lib/metadata';

export const metadata = getRouteMetadata('/crypto/url');

export default function Page() {
  return <UrlPageClient />;
}
