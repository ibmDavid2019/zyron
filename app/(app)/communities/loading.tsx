import { Skeleton } from "@/components/ui/skeleton";

export default function CommunitiesLoading() {
  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-8 w-44" />
          <Skeleton className="h-4 w-60" />
        </div>
        <Skeleton className="h-9 w-36 rounded-lg" />
      </div>
      {Array.from({ length: 2 }).map((_, section) => (
        <div key={section} className="space-y-4">
          <Skeleton className="h-5 w-48" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-56 rounded-2xl" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
