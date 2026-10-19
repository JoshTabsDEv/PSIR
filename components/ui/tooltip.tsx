'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface TooltipProps {
  children: React.ReactNode;
  content: string;
  side?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

function Tooltip({ children, content, side = 'top', className }: TooltipProps) {
  const [visible, setVisible] = React.useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          role="tooltip"
          className={cn(
            'pointer-events-none absolute z-50 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white shadow-md',
            positionClasses[side],
            className
          )}
        >
          {content}
        </div>
      )}
    </div>
  );
}

export { Tooltip };
