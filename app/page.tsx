import HomeClient from './page.client';
import { getRouteMetadata } from '@/app/lib/metadata';

export const metadata = getRouteMetadata('/');

export default function Home() {
  return <HomeClient />;
}
