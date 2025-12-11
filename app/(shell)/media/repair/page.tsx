import MediaRepairClient from './page.client';
import { getRouteMetadata } from '@/app/lib/metadata';

export const metadata = getRouteMetadata('/media/repair');

export default function Page() {
  return <MediaRepairClient />;
}
