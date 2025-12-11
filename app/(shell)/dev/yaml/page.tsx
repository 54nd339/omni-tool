import DevYamlClient from './page.client';
import { getRouteMetadata } from '@/app/lib/metadata';

export const metadata = getRouteMetadata('/dev/yaml');

export default function Page() {
  return <DevYamlClient />;
}
