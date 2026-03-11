'use client';

import { useCountUp } from '@/hooks/useCountUp';

interface CountUpProps {
  end: number;
  duration?: number;
  start?: number;
  delay?: number;
  decimal?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  onComplete?: () => void;
}

export function CountUp({
  end,
  duration = 2000,
  start = 0,
  delay = 0,
  decimal = 0,
  prefix = '',
  suffix = '',
  className = '',
  onComplete,
}: CountUpProps) {
  const { displayValue } = useCountUp({
    end,
    duration,
    start,
    delay,
    decimal,
    prefix,
    suffix,
    onComplete,
  });

  return (
    <span className={className}>
      {displayValue}
    </span>
  );
}
