import CipherPageClient from './page.client';
import { getRouteMetadata } from '@/app/lib/constants';

export const metadata = getRouteMetadata('/crypto/cipher');

export default function Page() {
  return <CipherPageClient />;
}
