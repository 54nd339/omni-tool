import { NAV_ITEMS } from '@/app/lib/constants';

export const buildActiveRouteMap = (pathname: string): Set<string> => {
  const map = new Set<string>();

  NAV_ITEMS.forEach((item) => {
    if (item.children) {
      // For items with children, check if any child matches
      item.children.forEach((child) => {
        if (pathname === child.href || pathname.startsWith(child.href + '/')) {
          map.add(item.href);  // Mark parent as active
          map.add(child.href); // Mark this specific child as active
        }
      });
    } else {
      // For items without children, check direct match
      if (pathname === item.href || pathname.startsWith(item.href + '/')) {
        map.add(item.href);
      }
    }
  });

  return map;
};
