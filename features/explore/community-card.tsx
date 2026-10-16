"use client";

import Link from "next/link";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Community } from "@/types/community";

export function CommunityCard({
  community,
  joined,
  onToggleJoin,
}: {
  community: Community;
  joined: boolean;
  onToggleJoin: (id: string) => void;
}) {
  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card p-4">
      <Link href={`/communities/${community.id}`}>
        <p className="font-semibold hover:text-brand">{community.name}</p>
      </Link>
      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{community.description}</p>
      <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Users className="size-3.5" />
        {community.membersCount.toLocaleString("pt-BR")} membros · {community.city}
      </p>
      <Button
        size="sm"
        variant={joined ? "secondary" : "outline"}
        className="mt-3 w-full"
        onClick={() => onToggleJoin(community.id)}
      >
        {joined ? "Participando" : "Participar"}
      </Button>
    </div>
  );
}
