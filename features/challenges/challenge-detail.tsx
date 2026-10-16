"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Trophy, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Podium } from "@/components/shared/podium";
import { ActivityCard } from "@/features/activities/activity-card";
import { OUTDOOR_TYPE_CONFIG } from "@/constants/activities";
import { cn } from "@/lib/utils";
import { CURRENT_USER } from "@/lib/mock-data";
import type { Activity } from "@/types/activity";
import type { Challenge } from "@/types/challenge";

export function ChallengeDetail({
  challenge: initial,
  relatedActivities,
}: {
  challenge: Challenge;
  relatedActivities: Activity[];
}) {
  const [challenge, setChallenge] = useState(initial);
  const config = challenge.activityType !== "todas" ? OUTDOOR_TYPE_CONFIG[challenge.activityType] : null;
  const percent = Math.min(Math.round((challenge.progressKm / challenge.goalKm) * 100), 100);
  const rest = challenge.leaderboard.slice(3);

  function handleJoin() {
    setChallenge((c) => ({
      ...c,
      status: "participando",
      participants: 1,
      rank: 1,
      leaderboard: [
        { rank: 1, name: CURRENT_USER.name, username: CURRENT_USER.username, progressKm: c.progressKm, isCurrentUser: true },
      ],
    }));
    toast.success("Você entrou no desafio!");
  }

  function handleLeave() {
    setChallenge((c) => ({ ...c, status: "descobrir", progressKm: 0, participants: 0, rank: 0, leaderboard: [] }));
    toast.info("Você saiu do desafio.");
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/challenges"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Desafios
      </Link>

      <div>
        <p className="flex items-center gap-1.5 text-xs font-medium text-brand">
          {config ? <config.icon className="size-3.5" /> : <Trophy className="size-3.5" />}
          {config ? config.label : "Todas as modalidades"}
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">{challenge.name}</h1>
        <p className="mt-2 text-muted-foreground">{challenge.description}</p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="space-y-1.5">
          <Progress value={percent} />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>
              {challenge.progressKm.toLocaleString("pt-BR")} / {challenge.goalKm} km
            </span>
            <span className="font-medium text-brand">{percent}%</span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Users className="size-4" />
            {challenge.participants.toLocaleString("pt-BR")} participantes
          </span>

          {challenge.status === "descobrir" && <Button onClick={handleJoin}>Participar</Button>}
          {challenge.status === "participando" && (
            <Button variant="outline" onClick={handleLeave}>
              Sair do desafio
            </Button>
          )}
          {challenge.status === "concluido" && (
            <span className="rounded-full bg-success/15 px-3 py-1 text-xs font-medium text-success">
              Concluído
            </span>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <p className="font-semibold">Ranking do desafio</p>
        {challenge.leaderboard.length === 0 ? (
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Nenhum participante ainda. Participe para ser o primeiro!
          </p>
        ) : (
          <Podium
            entries={challenge.leaderboard.slice(0, 3).map((e) => ({ ...e, value: e.progressKm }))}
            className="mt-6"
          />
        )}
        {rest.length > 0 && (
          <ul className="mt-6 space-y-1 border-t border-border pt-4">
            {rest.map((entry) => (
              <li
                key={entry.rank}
                className={cn(
                  "flex items-center justify-between rounded-lg px-2 py-2 text-sm",
                  entry.isCurrentUser && "bg-brand-muted"
                )}
              >
                <span className="flex items-center gap-3">
                  <span className="w-6 text-center text-muted-foreground">{entry.rank}º</span>
                  <span className={cn("font-medium", entry.isCurrentUser && "text-brand")}>
                    {entry.name}
                  </span>
                </span>
                <span className="tabular-nums text-muted-foreground">
                  {entry.progressKm.toLocaleString("pt-BR")} km
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {relatedActivities.length > 0 && (
        <div>
          <p className="mb-3 font-semibold">Atividades relacionadas</p>
          <div className="space-y-3">
            {relatedActivities.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
