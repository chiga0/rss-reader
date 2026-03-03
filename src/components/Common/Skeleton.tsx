import { Skeleton } from '@/components/ui/skeleton';

export { Skeleton };

export function ArticleCardSkeleton() {
  return (
    <div className="flex items-start gap-3 p-4">
      <div className="mt-2 h-2 w-2 shrink-0" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-1/3" />
      </div>
      <Skeleton className="h-16 w-16 shrink-0 rounded-md" />
    </div>
  );
}

export function FeedCardSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-border bg-card p-4">
      <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-3/4" />
        <Skeleton className="h-3 w-1/4" />
      </div>
    </div>
  );
}
