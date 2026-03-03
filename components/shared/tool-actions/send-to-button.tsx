'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Send } from 'lucide-react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getTargetsForType, type SendChain } from '@/lib/constants/send-to-chains';

interface SendToButtonProps {
  value: string;
  outputType: SendChain['outputType'];
  className?: string;
}

export function SendToButton({ value, outputType, className }: SendToButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const allTargets = getTargetsForType(outputType);
  const targets = allTargets.filter((target) => target.path !== pathname);

  if (!value || targets.length === 0) return null;

  const handleSelect = (targetPath: string) => {
    const target = targets.find((item) => item.path === targetPath);
    if (!target) return;
    const encoded = encodeURIComponent(value);
    router.push(`${target.path}?${target.param}=${encoded}`);
  };

  return (
    <Select onValueChange={handleSelect}>
      <SelectTrigger
        className={className ?? 'h-8 w-[140px] text-xs'}
        aria-label="Send output to another tool"
      >
        <Send className="mr-1 h-3 w-3" />
        <SelectValue placeholder="Send to..." />
      </SelectTrigger>
      <SelectContent>
        {targets.map((target) => (
          <SelectItem key={target.path} value={target.path}>
            {target.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}