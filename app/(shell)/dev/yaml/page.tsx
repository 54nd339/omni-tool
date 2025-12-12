import DevYamlClient from './page.client';
import { getRouteMetadata } from '@/app/lib/constants';

export const metadata = getRouteMetadata('/dev/yaml');

export default function Page() {
  return <DevYamlClient />;
}
