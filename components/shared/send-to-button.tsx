'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Send } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getTargetsForType } from '@/lib/constants/send-to-chains';
import { type SendChain } from '@/lib/constants/send-to-chains';

interface SendToButtonProps {
  value: string;
  outputType: SendChain['outputType'];
  /** Hide the button when there's no value */
  className?: string;
}

export function SendToButton({ value, outputType, className }: SendToButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const allTargets = getTargetsForType(outputType);
  const targets = allTargets.filter((t) => t.path !== pathname);

  if (!value || targets.length === 0) return null;

  const handleSelect = (targetPath: string) => {
    const target = targets.find((t) => t.path === targetPath);
    if (!target) return;
    const encoded = encodeURIComponent(value);
    router.push(`${target.path}?${target.param}=${encoded}`);
  };

  return (
    <Select onValueChange={handleSelect}>
      <SelectTrigger className={className ?? 'h-8 w-[140px] text-xs'} aria-label="Send output to another tool">
        <Send className="mr-1 h-3 w-3" />
        <SelectValue placeholder="Send to..." />
      </SelectTrigger>
      <SelectContent>
        {targets.map((t) => (
          <SelectItem key={t.path} value={t.path}>
            {t.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
