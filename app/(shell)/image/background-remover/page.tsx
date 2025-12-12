import ImageBackgroundRemoverClient from './page.client';
import { getRouteMetadata } from '@/app/lib/constants';

export const metadata = getRouteMetadata('/image/background-remover');

export default function Page() {
  return <ImageBackgroundRemoverClient />;
}
