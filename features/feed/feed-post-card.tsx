"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, MessageCircle, Send, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { RouteMap } from "@/components/shared/route-map";
import { ACTIVITY_TYPE_CONFIG } from "@/constants/activities";
import { CURRENT_USER } from "@/lib/mock-data";
import { cn, getInitials } from "@/lib/utils";
import type { FeedPost } from "@/types/social";
import { formatDistance, formatDuration, formatPace, formatRelativeTime } from "@/utils/format";

interface FeedPostCardProps {
  post: FeedPost;
  onToggleLike: (id: string) => void;
  onAddComment: (id: string) => void;
}

export function FeedPostCard({ post, onToggleLike, onAddComment }: FeedPostCardProps) {
  const config = ACTIVITY_TYPE_CONFIG[post.activityType];
  const [commenting, setCommenting] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [threadComments, setThreadComments] = useState<string[]>([]);

  function submitComment() {
    const text = commentText.trim();
    if (!text) return;
    setThreadComments((c) => [...c, text]);
    setCommentText("");
    onAddComment(post.id);
  }

  function handleShare() {
    navigator.clipboard?.writeText(`https://zyron.app/feed/${post.id}`).catch(() => {});
    toast.success("Link copiado para a área de transferência!");
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
      <Link href={`/profile/${post.author.username}`} className="flex items-center gap-3">
        <Avatar className="size-10">
          <AvatarFallback className="bg-brand-muted font-semibold text-brand">
            {getInitials(post.author.name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold hover:text-brand">{post.author.name}</p>
          <p className="text-xs text-muted-foreground">
            {formatRelativeTime(new Date(post.createdAt))} · {config.label}
          </p>
        </div>
      </Link>

      <p className="mt-3 text-sm">{post.title}</p>

      <RouteMap variant={post.routeVariant} className="mt-3 h-40 w-full sm:h-48" />

      <div className="mt-3 grid grid-cols-3 gap-2 text-center text-sm">
        <div>
          <p className="font-semibold tabular-nums">{formatDistance(post.distanceKm)}</p>
          <p className="text-[11px] text-muted-foreground">Distância</p>
        </div>
        <div>
          <p className="font-semibold tabular-nums">{formatDuration(post.durationSeconds)}</p>
          <p className="text-[11px] text-muted-foreground">Tempo</p>
        </div>
        <div>
          <p className="font-semibold tabular-nums">
            {formatPace(post.durationSeconds / post.distanceKm)}
          </p>
          <p className="text-[11px] text-muted-foreground">Ritmo</p>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-1 border-t border-border pt-3 text-sm text-muted-foreground">
        <button
          type="button"
          onClick={() => onToggleLike(post.id)}
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 transition-colors hover:bg-muted",
            post.liked && "text-destructive"
          )}
        >
          <Heart className={cn("size-4", post.liked && "fill-destructive")} />
          {post.likes}
        </button>
        <button
          type="button"
          onClick={() => setCommenting((c) => !c)}
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 transition-colors hover:bg-muted"
        >
          <MessageCircle className="size-4" />
          {post.comments + threadComments.length}
        </button>
        <button
          type="button"
          onClick={handleShare}
          className="ml-auto flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 transition-colors hover:bg-muted"
        >
          <Share2 className="size-4" />
          Compartilhar
        </button>
      </div>

      {threadComments.length > 0 && (
        <ul className="mt-3 space-y-2 border-t border-border pt-3">
          {threadComments.map((comment, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <Avatar className="size-6 shrink-0">
                <AvatarFallback className="bg-brand-muted text-[10px] font-semibold text-brand">
                  {getInitials(CURRENT_USER.name)}
                </AvatarFallback>
              </Avatar>
              <span>
                <span className="font-medium">{CURRENT_USER.name.split(" ")[0]}</span> {comment}
              </span>
            </li>
          ))}
        </ul>
      )}

      {commenting && (
        <div className="mt-3 flex items-center gap-2 border-t border-border pt-3">
          <Input
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submitComment()}
            placeholder="Escreva um comentário..."
            className="flex-1"
          />
          <button
            type="button"
            onClick={submitComment}
            aria-label="Enviar comentário"
            className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand text-brand-foreground transition-opacity hover:opacity-90"
          >
            <Send className="size-4" />
          </button>
        </div>
      )}
    </div>
  );
}
