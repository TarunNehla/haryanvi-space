import { Skeleton } from "@/components/ui/skeleton";

export function SongCardSkeleton() {
  return (
    <div className="flex gap-4 p-5 rounded-xl border-2 bg-card">
      <Skeleton className="h-24 w-24 rounded-xl shrink-0" />
      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div className="space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="flex items-center gap-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-5 w-12" />
        </div>
      </div>
    </div>
  );
}
