import { SidebarContentClient } from './content-client';

export function SidebarContent({
  open,
}: {
  open: boolean;
}) {
  return <SidebarContentClient open={open} />;
}