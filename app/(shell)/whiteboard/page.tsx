import WhiteboardPage from './page.client';
import { getRouteMetadata } from '@/app/lib/constants';

export const metadata = getRouteMetadata('/whiteboard');

export default function Page() {
  return <WhiteboardPage />;
}
