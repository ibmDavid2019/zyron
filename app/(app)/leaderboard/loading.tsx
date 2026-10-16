import { Skeleton } from "@/components/ui/skeleton";

export default function LeaderboardLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
        <Skeleton className="h-9 w-72 rounded-lg" />
        <Skeleton className="h-9 w-64 rounded-lg" />
      </div>
      <div className="rounded-2xl border border-border bg-card p-8">
        <div className="flex items-end justify-center gap-6">
          <Skeleton className="h-32 w-24 rounded-t-lg" />
          <Skeleton className="h-40 w-24 rounded-t-lg" />
          <Skeleton className="h-28 w-24 rounded-t-lg" />
        </div>
        <div className="mt-8 space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
