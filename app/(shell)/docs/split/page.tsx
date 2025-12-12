import DocsSplitClient from './page.client';
import { getRouteMetadata } from '@/app/lib/constants';

export const metadata = getRouteMetadata('/docs/split');

export default function Page() {
  return <DocsSplitClient />;
}
