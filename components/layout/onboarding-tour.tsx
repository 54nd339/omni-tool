'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useMediaQuery } from '@/hooks';
import { cn } from '@/lib/utils';

const STORAGE_KEY = 'onboarding-complete';

interface StepDef {
  text: string;
  desktop: React.CSSProperties;
  mobile: React.CSSProperties;
  arrow: 'top' | 'bottom' | 'left' | 'right';
  mobileArrow: 'top' | 'bottom' | 'left' | 'right';
}

const STEPS: StepDef[] = [
  {
    text: 'Press **Cmd+K** to open the command palette and search for any tool',
    desktop: { top: '5rem', left: '50%', transform: 'translateX(-50%)' },
    mobile: { top: '4rem', left: '50%', transform: 'translateX(-50%)' },
    arrow: 'top',
    mobileArrow: 'top',
  },
  {
    text: 'Browse all tools in the **sidebar** or collapse it with **Cmd+B**',
    desktop: { top: '50%', left: '11rem', transform: 'translateY(-50%)' },
    mobile: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
    arrow: 'left',
    mobileArrow: 'top',
  },
  {
    text: '**Star** any tool to add it to your favorites for quick access',
    desktop: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
    mobile: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
    arrow: 'top',
    mobileArrow: 'top',
  },
  {
    text: '**Paste** any content and OmniTool will suggest the right tool',
    desktop: { bottom: '5rem', left: '50%', transform: 'translateX(-50%)' },
    mobile: { bottom: '4rem', left: '50%', transform: 'translateX(-50%)' },
    arrow: 'bottom',
    mobileArrow: 'bottom',
  },
];

function parseStepText(text: string) {
  const parts: (string | { bold: string })[] = [];
  let remaining = text;
  while (remaining.length > 0) {
    const boldStart = remaining.indexOf('**');
    if (boldStart === -1) {
      parts.push(remaining);
      break;
    }
    if (boldStart > 0) parts.push(remaining.slice(0, boldStart));
    const boldEnd = remaining.indexOf('**', boldStart + 2);
    if (boldEnd === -1) {
      parts.push(remaining.slice(boldStart));
      break;
    }
    parts.push({ bold: remaining.slice(boldStart + 2, boldEnd) });
    remaining = remaining.slice(boldEnd + 2);
  }
  return parts;
}

function StepContent({ text }: { text: string }) {
  const parts = parseStepText(text);
  return (
    <>
      {parts.map((part, i) =>
        typeof part === 'string' ? (
          <span key={i}>{part}</span>
        ) : (
          <strong key={i}>{part.bold}</strong>
        ),
      )}
    </>
  );
}

function TooltipArrow({ direction }: { direction: 'top' | 'bottom' | 'left' | 'right' }) {
  const base = 'absolute w-3 h-3 rotate-45 border border-border bg-background';
  const styles: Record<typeof direction, string> = {
    top: '-top-1.5 left-1/2 -translate-x-1/2 border-l border-t',
    bottom: '-bottom-1.5 left-1/2 -translate-x-1/2 border-r border-b',
    left: '-left-1.5 top-1/2 -translate-y-1/2 border-l border-b',
    right: '-right-1.5 top-1/2 -translate-y-1/2 border-r border-t',
  };
  return <div className={cn(base, styles[direction])} aria-hidden />;
}

export function OnboardingTour() {
  const [mounted, setMounted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(true);
  const isMobile = useMediaQuery('(max-width: 767px)');
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const complete = localStorage.getItem(STORAGE_KEY);
    setIsComplete(!!complete);
  }, []);

  useEffect(() => {
    if (!isComplete && currentStep >= 0) {
      tooltipRef.current?.focus();
    }
  }, [currentStep, isComplete]);

  useEffect(() => {
    if (isComplete) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        localStorage.setItem(STORAGE_KEY, 'true');
        setIsComplete(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isComplete]);

  if (!mounted || isComplete || currentStep < 0) return null;

  const step = STEPS[currentStep];
  const isLast = currentStep === STEPS.length - 1;

  const complete = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setIsComplete(true);
  };

  const next = () => {
    if (isLast) complete();
    else setCurrentStep((s) => s + 1);
  };

  const skip = () => complete();

  const placement = isMobile ? step.mobile : step.desktop;
  const arrowDir = isMobile ? step.mobileArrow : step.arrow;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/40 animate-[slide-up-fade-in_0.2s_ease-out_both]"
        aria-hidden
      />

      <div
        ref={tooltipRef}
        key={currentStep}
        tabIndex={-1}
        className="fixed z-50 mx-4 max-w-sm animate-stagger rounded-lg border border-border bg-background p-4 shadow-lg outline-none"
        style={{
          ...placement,
          ['--stagger' as string]: 0,
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-step-title"
        aria-describedby="onboarding-step-desc"
      >
        <div className="relative">
          <TooltipArrow direction={arrowDir} />
          <p id="onboarding-step-title" className="text-sm font-medium text-foreground">
            <StepContent text={step.text} />
          </p>
          <p id="onboarding-step-desc" className="sr-only">
            Step {currentStep + 1} of {STEPS.length}
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            {currentStep + 1} of {STEPS.length}
          </p>
          <div className="mt-4 flex items-center justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={skip}>
              Skip
            </Button>
            <Button size="sm" onClick={next}>
              {isLast ? 'Got it!' : 'Next'}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
