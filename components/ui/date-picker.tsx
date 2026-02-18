import * as React from 'react';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { Popover } from '@/components/ui/popover';

interface DatePickerProps {
    value?: Date;
    onChange: (date: Date | undefined) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
}

export function DatePicker({
    value,
    onChange,
    placeholder = 'Pick a date',
    disabled = false,
    className,
}: DatePickerProps) {
    const [open, setOpen] = React.useState(false);

    return (
        <Popover
            open={open}
            onOpenChange={setOpen}
            content={
                <Calendar
                    mode="single"
                    selected={value}
                    onSelect={(date) => {
                        onChange(date);
                        setOpen(false);
                    }}
                    initialFocus
                />
            }
        >
            <button
                type="button"
                disabled={disabled}
                onClick={() => !disabled && setOpen(!open)}
                className={cn(
                    'flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm shadow-sm transition-colors',
                    'text-left items-center gap-2',
                    'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--ring-color)]',
                    'disabled:cursor-not-allowed disabled:opacity-50',
                    !value && 'text-gray-500',
                    className
                )}
            >
                <CalendarIcon className="h-4 w-4 shrink-0" />
                <span className="flex-1">
                    {value ? format(value, 'PPP') : placeholder}
                </span>
            </button>
        </Popover>
    );
}
