import WhiteboardPage from './page.client';
import { getRouteMetadata } from '@/app/lib/metadata';

export const metadata = getRouteMetadata('/whiteboard');

export default function Page() {
  return <WhiteboardPage />;
}
