'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { detectContentType } from '@/lib/smart-suggest';

export default function SharePage() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const text = params.get('text') ?? '';
    const url = params.get('url') ?? '';
    const content = text || url;

    if (content) {
      const detected = detectContentType(content);
      if (detected) {
        router.replace(detected.toolPath);
        return;
      }
      if (url) {
        router.replace(`/dev-utils/api-tester?url=${encodeURIComponent(url)}`);
        return;
      }
    }

    router.replace('/');
  }, [params, router]);

  return (
    <div className="flex h-[60vh] items-center justify-center">
      <p className="text-muted-foreground">Routing shared content...</p>
    </div>
  );
}
