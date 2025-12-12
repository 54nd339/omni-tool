import CryptoDashboard from './page.client';
import { getRouteMetadata } from '@/app/lib/constants';

export const metadata = getRouteMetadata('/crypto');

export default function Page() {
  return <CryptoDashboard />;
}
