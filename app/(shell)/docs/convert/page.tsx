import DocsConvertClient from './page.client';
import { getRouteMetadata } from '@/app/lib/metadata';

export const metadata = getRouteMetadata('/docs/convert');

export default function Page() {
  return <DocsConvertClient />;
}
