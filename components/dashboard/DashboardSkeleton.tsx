import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function DashboardSkeleton() {
  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between border-b pb-6">
        <div className="space-y-2">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-52" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-40" />
        </div>
      </div>

      {/* Search Bar */}
      <Skeleton className="h-10 w-full max-w-2xl" />

      {/* Stats Cards - 4 columns */}
      <div className="space-y-4">
        <Skeleton className="h-3 w-28" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border-l-4 border-l-muted">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                  <Skeleton className="h-10 w-10 rounded-lg" />
                </div>
                <div className="mt-3 pt-3 border-t border-dashed">
                  <Skeleton className="h-3 w-32" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="space-y-4">
        <Skeleton className="h-3 w-36" />
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-4 w-40" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[240px] w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[180px] w-full rounded-full mx-auto max-w-[180px]" />
            </CardContent>
          </Card>
          <Card className="lg:col-span-3">
            <CardHeader>
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-4 w-44" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[200px] w-full" />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Reports table */}
      <div className="space-y-4">
        <Skeleton className="h-3 w-28" />
        <Card>
          <CardContent className="p-0">
            <div className="flex items-center gap-4 border-b px-6 py-3">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-3.5 w-36" />
              <Skeleton className="h-3.5 w-16" />
              <Skeleton className="h-3.5 w-24 ml-auto" />
            </div>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 border-b px-6 py-4 last:border-0">
                <Skeleton className="h-4 w-32 shrink-0" />
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-4 w-24 ml-auto" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
