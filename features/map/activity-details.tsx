import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ACTIVITY_TYPE_CONFIG } from "@/constants/activities";
import { getInitials } from "@/lib/utils";
import type { FeedPost } from "@/types/social";
import { formatDate, formatDistance, formatDuration, formatPace } from "@/utils/format";

export function ActivityDetails({ post }: { post: FeedPost }) {
  const config = ACTIVITY_TYPE_CONFIG[post.activityType];
  const pace = post.durationSeconds / post.distanceKm;

  return (
    <div className="space-y-4">
      <Link href={`/profile/${post.author.username}`} className="flex items-center gap-3">
        <Avatar className="size-10">
          <AvatarFallback className="bg-brand-muted font-semibold text-brand">
            {getInitials(post.author.name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold hover:text-brand">{post.author.name}</p>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <config.icon className="size-3.5" />
            {config.label} · {formatDate(new Date(post.createdAt))}
          </p>
        </div>
      </Link>

      <div className="grid grid-cols-3 gap-2 text-center text-sm">
        <div>
          <p className="font-semibold tabular-nums">{formatDistance(post.distanceKm)}</p>
          <p className="text-[11px] text-muted-foreground">Distância</p>
        </div>
        <div>
          <p className="font-semibold tabular-nums">{formatDuration(post.durationSeconds)}</p>
          <p className="text-[11px] text-muted-foreground">Tempo</p>
        </div>
        <div>
          <p className="font-semibold tabular-nums">{formatPace(pace)}</p>
          <p className="text-[11px] text-muted-foreground">Ritmo</p>
        </div>
      </div>

      <p className="flex items-center gap-1.5 rounded-lg bg-muted px-2.5 py-1.5 text-xs text-muted-foreground">
        <ShieldCheck className="size-3.5 shrink-0" />
        Localização aproximada — o ponto exato de início não é exibido.
      </p>

      <Button variant="outline" className="w-full" asChild>
        <Link href={`/profile/${post.author.username}`}>Ver perfil</Link>
      </Button>
    </div>
  );
}
