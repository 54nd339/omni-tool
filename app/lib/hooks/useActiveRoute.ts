import { useMemo } from 'react';
import { buildActiveRouteMap } from '@/app/lib/utils';

export const useActiveRoute = (pathname: string) => {
  return useMemo(() => buildActiveRouteMap(pathname), [pathname]);
};
