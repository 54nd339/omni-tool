import DocsMergeClient from './page.client';
import { getRouteMetadata } from '@/app/lib/constants';

export const metadata = getRouteMetadata('/docs/merge');

export default function Page() {
  return <DocsMergeClient />;
}
