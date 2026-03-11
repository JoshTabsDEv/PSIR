'use client';

import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { format } from 'date-fns';

interface RealTimeClockProps {
  title?: string;
  className?: string;
}

export default function RealTimeClock({ title , className }: RealTimeClockProps) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={`space-y-1.5 ${className}`}>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        {title}
      </h1>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Clock className="h-3.5 w-3.5" />
        <div>
          {format(now, 'EEEE, MMMM d, yyyy')}
          <span className="mx-1.5">•</span>
          {/* Change text-primary to any color like text-blue-500 or text-[var(--brand-primary)] */}
          <span className="font-medium text-[var(--brand-primary)]">
            {format(now, 'pp')}
          </span>
        </div>
      </div>
    </div>
  );
}