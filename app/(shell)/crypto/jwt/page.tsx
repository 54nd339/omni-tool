import JwtPageClient from './page.client';
import { getRouteMetadata } from '@/app/lib/metadata';

export const metadata = getRouteMetadata('/crypto/jwt');

export default function Page() {
  return <JwtPageClient />;
}
