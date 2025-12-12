import HomeClient from './page.client';
import { getRouteMetadata } from '@/app/lib/constants';

export const metadata = getRouteMetadata('/');

export default function Home() {
  return <HomeClient />;
}
