import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

interface ReportsListSkeletonProps {
  /** Number of skeleton rows to show. Defaults to 6. */
  rows?: number;
}

export function ReportsListSkeleton({ rows = 6 }: ReportsListSkeletonProps) {
  return (
    <Card>
      <CardContent className="p-0">
        {/* Table header */}
        <div className="flex items-center gap-4 border-b px-6 py-3">
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="h-3.5 w-36" />
          <Skeleton className="h-3.5 w-16" />
          <Skeleton className="h-3.5 w-24 ml-auto" />
          <Skeleton className="h-3.5 w-16" />
        </div>
        {/* Rows */}
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-b px-6 py-4 last:border-0"
          >
            <Skeleton className="h-4 w-32 shrink-0" />
            <div className="min-w-0 flex-1 space-y-1.5">
              <Skeleton className="h-4 w-40" />
            </div>
            <Skeleton className="h-5 w-20 rounded-full shrink-0" />
            <Skeleton className="h-4 w-24 shrink-0" />
            <div className="flex gap-2 shrink-0">
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
