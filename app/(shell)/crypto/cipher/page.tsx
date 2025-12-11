import CipherPageClient from './page.client';
import { getRouteMetadata } from '@/app/lib/metadata';

export const metadata = getRouteMetadata('/crypto/cipher');

export default function Page() {
  return <CipherPageClient />;
}
