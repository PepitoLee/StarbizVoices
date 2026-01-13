'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface ContentCardSkeletonProps {
  className?: string;
}

export function ContentCardSkeleton({ className }: ContentCardSkeletonProps) {
  return (
    <div className={cn('group block', className)}>
      <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
        <Skeleton className="h-full w-full" />
      </div>
      <div className="mt-2 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

interface ContentGridSkeletonProps {
  count?: number;
  className?: string;
}

export function ContentGridSkeleton({ count = 6, className }: ContentGridSkeletonProps) {
  return (
    <div className={cn('grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <ContentCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ContentSectionSkeleton({ title }: { title?: boolean }) {
  return (
    <section className="space-y-4">
      {title && <Skeleton className="h-6 w-48" />}
      <ContentGridSkeleton count={5} />
    </section>
  );
}
