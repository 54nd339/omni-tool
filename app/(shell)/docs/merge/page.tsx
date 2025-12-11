import DocsMergeClient from './page.client';
import { getRouteMetadata } from '@/app/lib/metadata';

export const metadata = getRouteMetadata('/docs/merge');

export default function Page() {
  return <DocsMergeClient />;
}
