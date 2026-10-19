'use client';

import { type InputHTMLAttributes, useId } from 'react';
import { Input } from '@/components/ui/input';

interface AutocompleteInputProps extends InputHTMLAttributes<HTMLInputElement> {
  options: string[];
}

export function AutocompleteInput({ options, id, ...props }: AutocompleteInputProps) {
  const generatedId = useId();
  const datalistId = `${id ?? generatedId}-options`;

  return (
    <>
      <Input {...props} id={id} list={datalistId} />
      <datalist id={datalistId}>
        {options.map((option) => (
          <option key={option} value={option} />
        ))}
      </datalist>
    </>
  );
}
