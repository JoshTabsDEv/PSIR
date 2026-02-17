'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

/* ---- Context ---- */
interface RadioGroupContextValue {
  value: string;
  onChange: (value: string) => void;
  name: string;
}
const RadioGroupContext = React.createContext<RadioGroupContextValue>({
  value: '',
  onChange: () => {},
  name: '',
});

/* ---- Root ---- */
interface RadioGroupProps {
  value: string;
  onValueChange: (value: string) => void;
  name: string;
  className?: string;
  children: React.ReactNode;
}

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ value, onValueChange, name, className, children }, ref) => (
    <RadioGroupContext.Provider value={{ value, onChange: onValueChange, name }}>
      <div ref={ref} role="radiogroup" className={cn('space-y-2', className)}>
        {children}
      </div>
    </RadioGroupContext.Provider>
  )
);
RadioGroup.displayName = 'RadioGroup';

/* ---- Item ---- */
interface RadioGroupItemProps {
  value: string;
  id?: string;
  className?: string;
  disabled?: boolean;
}

const RadioGroupItem = React.forwardRef<HTMLButtonElement, RadioGroupItemProps>(
  ({ value, id, className, disabled }, ref) => {
    const ctx = React.useContext(RadioGroupContext);
    const isChecked = ctx.value === value;

    return (
      <button
        ref={ref}
        type="button"
        role="radio"
        id={id}
        aria-checked={isChecked}
        disabled={disabled}
        onClick={() => !disabled && ctx.onChange(value)}
        className={cn(
          'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-2',
          isChecked
            ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]'
            : 'border-gray-400 bg-white hover:border-[var(--brand-primary)]',
          disabled && 'pointer-events-none opacity-50',
          className
        )}
      >
        {isChecked && (
          <span className="block h-1.5 w-1.5 rounded-full bg-white" />
        )}
      </button>
    );
  }
);
RadioGroupItem.displayName = 'RadioGroupItem';

export { RadioGroup, RadioGroupItem };
