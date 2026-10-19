import Link from 'next/link';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateAction {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: EmptyStateAction;
  /** Secondary softer action below the primary button */
  secondaryAction?: EmptyStateAction;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="mb-4 rounded-full bg-[var(--brand-primary)]/10 p-4">
        <Icon className="h-8 w-8 text-[var(--brand-primary)]" />
      </div>

      <h3 className="text-base font-semibold text-gray-900">{title}</h3>

      {description && (
        <p className="mt-1 max-w-sm text-sm text-gray-500">{description}</p>
      )}

      {action && (
        <div className="mt-6 flex flex-col items-center gap-2">
          {action.href ? (
            <Link href={action.href}>
              <Button className="bg-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/90 text-white">{action.label}</Button>
            </Link>
          ) : (
            <Button onClick={action.onClick} className="bg-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/90 text-white">{action.label}</Button>
          )}

          {secondaryAction && (
            <>
              {secondaryAction.href ? (
                <Link
                  href={secondaryAction.href}
                  className="text-sm text-[var(--brand-primary)] hover:text-[var(--brand-primary)]/80 underline underline-offset-4"
                >
                  {secondaryAction.label}
                </Link>
              ) : (
                <button
                  onClick={secondaryAction.onClick}
                  className="text-sm text-[var(--brand-primary)] hover:text-[var(--brand-primary)]/80 underline underline-offset-4"
                >
                  {secondaryAction.label}
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
