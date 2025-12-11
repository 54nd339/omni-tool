import ImageBackgroundRemoverClient from './page.client';
import { getRouteMetadata } from '@/app/lib/metadata';

export const metadata = getRouteMetadata('/image/background-remover');

export default function Page() {
  return <ImageBackgroundRemoverClient />;
}
