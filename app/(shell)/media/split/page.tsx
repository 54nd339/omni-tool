import SplitPage from './page.client';
import { getRouteMetadata } from '@/app/lib/metadata';

export const metadata = getRouteMetadata('/media/split');

export default function Page() {
  return <SplitPage />;
}
