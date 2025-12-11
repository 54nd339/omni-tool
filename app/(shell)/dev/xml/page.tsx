import DevXmlClient from './page.client';
import { getRouteMetadata } from '@/app/lib/metadata';

export const metadata = getRouteMetadata('/dev/xml');

export default function Page() {
  return <DevXmlClient />;
}
