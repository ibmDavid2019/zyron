"use client";

import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/lib/utils";
import type { User } from "@/types/user";

export function PersonCard({
  user,
  following,
  onToggleFollow,
}: {
  user: User;
  following: boolean;
  onToggleFollow: (id: string) => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
      <Link href={`/profile/${user.username}`} className="flex min-w-0 flex-1 items-center gap-3">
        <Avatar className="size-11 shrink-0">
          <AvatarFallback className="bg-brand-muted font-semibold text-brand">
            {getInitials(user.name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate font-semibold hover:text-brand">{user.name}</p>
          <p className="truncate text-xs text-muted-foreground">
            @{user.username} · {user.city}
          </p>
        </div>
      </Link>
      <Button
        size="sm"
        variant={following ? "secondary" : "outline"}
        className="shrink-0"
        onClick={() => onToggleFollow(user.id)}
      >
        {following ? "Seguindo" : "Seguir"}
      </Button>
    </div>
  );
}
