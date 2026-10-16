"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChallengeCard } from "@/features/challenges/challenge-card";
import { CURRENT_USER } from "@/lib/mock-data";
import type { Challenge, ChallengeStatus } from "@/types/challenge";

const TABS: { value: ChallengeStatus; label: string }[] = [
  { value: "descobrir", label: "Descobrir" },
  { value: "participando", label: "Participando" },
  { value: "concluido", label: "Concluídos" },
];

export function ChallengesPage({ challenges: initial }: { challenges: Challenge[] }) {
  const [challenges, setChallenges] = useState(initial);
  const [tab, setTab] = useState<ChallengeStatus>("descobrir");

  function handleJoin(id: string) {
    setChallenges((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status: "participando" as const,
              participants: 1,
              rank: 1,
              leaderboard: [
                { rank: 1, name: CURRENT_USER.name, username: CURRENT_USER.username, progressKm: c.progressKm, isCurrentUser: true },
              ],
            }
          : c
      )
    );
    toast.success("Você entrou no desafio!");
  }

  function handleLeave(id: string) {
    setChallenges((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: "descobrir" as const, progressKm: 0, participants: 0, rank: 0, leaderboard: [] } : c))
    );
    toast.info("Você saiu do desafio.");
  }

  const filtered = challenges.filter((c) => c.status === tab);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Desafios</h1>
        <p className="text-muted-foreground">Metas em grupo ou solo para manter a motivação em alta.</p>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as ChallengeStatus)}>
        <TabsList>
          {TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
          <p className="font-semibold">Nada por aqui ainda</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {tab === "descobrir"
              ? "Novos desafios aparecerão em breve."
              : tab === "participando"
                ? "Participe de um desafio na aba Descobrir."
                : "Conclua um desafio para vê-lo aqui."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((challenge) => (
            <ChallengeCard key={challenge.id} challenge={challenge} onToggleJoin={handleJoin} onLeave={handleLeave} />
          ))}
        </div>
      )}
    </div>
  );
}
