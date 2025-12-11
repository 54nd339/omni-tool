import CryptoDashboard from './page.client';
import { getRouteMetadata } from '@/app/lib/metadata';

export const metadata = getRouteMetadata('/crypto');

export default function Page() {
  return <CryptoDashboard />;
}
