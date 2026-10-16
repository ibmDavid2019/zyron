import { RouteMap } from "@/components/shared/route-map";
import { ACTIVITY_TYPE_CONFIG } from "@/constants/activities";
import type { FeedPost } from "@/types/social";
import { formatDistance, formatDuration } from "@/utils/format";

export function ActivityPreviewCard({ post }: { post: FeedPost }) {
  const config = ACTIVITY_TYPE_CONFIG[post.activityType];

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <RouteMap variant={post.routeVariant} className="h-28 w-full rounded-none" />
      <div className="p-3.5">
        <span className="flex items-center gap-1.5 text-xs font-medium text-brand">
          <config.icon className="size-3.5" />
          {config.label}
        </span>
        <p className="mt-1 truncate text-sm font-semibold">{post.author.name}</p>
        <p className="text-xs text-muted-foreground">
          {formatDistance(post.distanceKm)} · {formatDuration(post.durationSeconds)}
        </p>
      </div>
    </div>
  );
}
