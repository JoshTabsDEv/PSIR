import * as React from 'react';
import { cn } from '@/lib/utils';

interface PopoverProps {
    children: React.ReactNode;
    content: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    align?: 'start' | 'center' | 'end';
    side?: 'top' | 'right' | 'bottom' | 'left';
}

export function Popover({ children, content, open, onOpenChange, align = 'start', side = 'bottom' }: PopoverProps) {
    const [isOpen, setIsOpen] = React.useState(open ?? false);
    const popoverRef = React.useRef<HTMLDivElement>(null);
    const triggerRef = React.useRef<HTMLDivElement>(null);

    const actualOpen = open ?? isOpen;
    const setActualOpen = onOpenChange ?? setIsOpen;

    // Close on click outside
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                popoverRef.current &&
                triggerRef.current &&
                !popoverRef.current.contains(event.target as Node) &&
                !triggerRef.current.contains(event.target as Node)
            ) {
                setActualOpen(false);
            }
        };

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setActualOpen(false);
            }
        };

        if (actualOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [actualOpen, setActualOpen]);

    return (
        <div className="relative inline-block">
            <div
                ref={triggerRef}
                onClick={() => setActualOpen(!actualOpen)}
            >
                {children}
            </div>
            {actualOpen && (
                <div
                    ref={popoverRef}
                    className={cn(
                        'absolute z-50 mt-2 rounded-lg border border-gray-200 bg-white p-4 shadow-lg',
                        'animate-in fade-in-0 zoom-in-95',
                        side === 'bottom' && 'top-full',
                        side === 'top' && 'bottom-full mb-2 mt-0',
                        align === 'start' && 'left-0',
                        align === 'center' && 'left-1/2 -translate-x-1/2',
                        align === 'end' && 'right-0'
                    )}
                    role="dialog"
                    aria-modal="true"
                >
                    {content}
                </div>
            )}
        </div>
    );
}
