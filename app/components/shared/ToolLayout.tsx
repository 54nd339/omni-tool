import { type FC } from 'react';
import { usePathname } from 'next/navigation';
import { ToolLayoutProps } from '@/app/lib/types';
import { PAGE_CONFIGS } from '@/app/lib/constants';

export const ToolLayout: FC<ToolLayoutProps> = ({ icon: Icon, title, description, path, children }) => {
  // Automatically use pathname if path is not provided
  const pathname = usePathname();
  const resolvedPath = path || pathname;

  // Use centralized config if path is available, otherwise use props
  const config = resolvedPath ? PAGE_CONFIGS[resolvedPath] : null;
  const finalIcon = Icon || config?.icon;
  const finalTitle = title || config?.title || '';
  const finalDescription = description || config?.description;

  if (!finalIcon || !finalTitle) {
    console.warn('ToolLayout: Missing icon or title. Provide either path or icon/title props.');
  }

  const IconComponent = finalIcon;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          {IconComponent && <IconComponent className="w-8 h-8 text-indigo-500" />}
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{finalTitle}</h1>
        </div>
        {finalDescription && <p className="text-slate-600 dark:text-slate-400">{finalDescription}</p>}
      </div>
      <div>{children}</div>
    </div>
  );
};
