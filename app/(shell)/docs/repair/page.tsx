import DocsRepairClient from './page.client';
import { getRouteMetadata } from '@/app/lib/metadata';

export const metadata = getRouteMetadata('/docs/repair');

export default function Page() {
  return <DocsRepairClient />;
}
