"use client";

import Link from "next/link";
import { CheckCircle2, Trophy, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { OUTDOOR_TYPE_CONFIG } from "@/constants/activities";
import type { Challenge } from "@/types/challenge";

export function ChallengeCard({
  challenge,
  onToggleJoin,
  onLeave,
}: {
  challenge: Challenge;
  onToggleJoin: (id: string) => void;
  onLeave: (id: string) => void;
}) {
  const percent = Math.min(Math.round((challenge.progressKm / challenge.goalKm) * 100), 100);
  const config = challenge.activityType !== "todas" ? OUTDOOR_TYPE_CONFIG[challenge.activityType] : null;

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <Link href={`/challenges/${challenge.id}`} className="min-w-0">
          <p className="flex items-center gap-1.5 text-xs font-medium text-brand">
            {config ? <config.icon className="size-3.5" /> : <Trophy className="size-3.5" />}
            {config ? config.label : "Todas as modalidades"}
          </p>
          <p className="mt-1 font-semibold hover:text-brand">{challenge.name}</p>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{challenge.description}</p>
        </Link>
        {challenge.status === "concluido" && (
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-success/15 px-2.5 py-1 text-xs font-medium text-success">
            <CheckCircle2 className="size-3.5" />
            Concluído
          </span>
        )}
      </div>

      <div className="mt-4 space-y-1.5">
        <Progress value={percent} />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>
            {challenge.progressKm.toLocaleString("pt-BR")} / {challenge.goalKm} km
          </span>
          <span className="font-medium text-brand">{percent}%</span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Users className="size-3.5" />
          {challenge.participants.toLocaleString("pt-BR")} participantes
        </span>

        {challenge.status === "descobrir" && (
          <Button size="sm" onClick={() => onToggleJoin(challenge.id)}>
            Participar
          </Button>
        )}
        {challenge.status === "participando" && (
          <Button size="sm" variant="outline" onClick={() => onLeave(challenge.id)}>
            Sair do desafio
          </Button>
        )}
      </div>
    </div>
  );
}
