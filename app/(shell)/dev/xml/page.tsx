import DevXmlClient from './page.client';
import { getRouteMetadata } from '@/app/lib/constants';

export const metadata = getRouteMetadata('/dev/xml');

export default function Page() {
  return <DevXmlClient />;
}
