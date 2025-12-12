import JwtPageClient from './page.client';
import { getRouteMetadata } from '@/app/lib/constants';

export const metadata = getRouteMetadata('/crypto/jwt');

export default function Page() {
  return <JwtPageClient />;
}
