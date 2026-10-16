"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Clock, Flame, Sparkles, Star, Target, Trophy, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { StatTile } from "@/components/shared/stat-tile";
import { ActivityCard } from "@/features/activities/activity-card";
import { WeeklySummaryChart } from "@/features/dashboard/weekly-summary-chart";
import { CURRENT_CHALLENGE, CURRENT_USER, NEXT_GOAL, RECOMMENDED_WORKOUT } from "@/lib/mock-data";
import { getSavedActivities } from "@/utils/local-store";
import { getWeeklySummary } from "@/utils/activity-stats";
import { formatDistance, formatDuration } from "@/utils/format";
import type { Activity } from "@/types/activity";

export function DashboardPage() {
  // Starts empty — a brand-new account genuinely has no activity yet; the
  // real total (if any) hydrates once localStorage is available.
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    const timeout = setTimeout(() => setActivities(getSavedActivities()), 0);
    return () => clearTimeout(timeout);
  }, []);

  const week = getWeeklySummary(activities);
  const weeklyDistanceKm = week.reduce((sum, d) => sum + d.distanceKm, 0);
  const weeklyDurationSeconds = week.reduce((sum, d) => sum + d.durationSeconds, 0);
  const totalKm = activities.reduce((sum, a) => sum + a.distanceKm, 0);
  const goalPercent = Math.min(Math.round((totalKm / NEXT_GOAL.targetKm) * 100), 100);
  const challengePercent = Math.min(Math.round((CURRENT_CHALLENGE.progressKm / CURRENT_CHALLENGE.goalKm) * 100), 100);
  const firstName = CURRENT_USER.name.split(" ")[0];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Olá, {firstName} 👋</h1>
        <p className="text-muted-foreground">Pronto para evoluir hoje?</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatTile icon={Flame} label="Sequência" value={`${CURRENT_USER.streakDays} dias`} iconClassName="bg-warning/15 text-warning" href="/achievements" />
        <StatTile icon={Zap} label="XP total" value={CURRENT_USER.xp.toLocaleString("pt-BR")} href="/achievements" />
        <StatTile icon={Star} label="Nível" value={String(CURRENT_USER.level)} href="/achievements" />
        <StatTile icon={Trophy} label="Dist. semanal" value={formatDistance(weeklyDistanceKm)} />
        <StatTile icon={Clock} label="Tempo semanal" value={formatDuration(weeklyDurationSeconds)} className="col-span-2 sm:col-span-1" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <Target className="size-4 text-brand" />
            Seu próximo objetivo
          </div>
          <p className="mt-2 text-lg font-bold">{NEXT_GOAL.label}</p>
          <div className="mt-4 space-y-2">
            <Progress value={goalPercent} />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>
                {totalKm.toLocaleString("pt-BR")} / {NEXT_GOAL.targetKm} km
              </span>
              <span className="font-medium text-brand">{goalPercent}%</span>
            </div>
          </div>
          <Button variant="outline" className="mt-4 w-full" asChild>
            <Link href="/activities">
              Ver progresso
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <Sparkles className="size-4 text-brand" />
            Zyron AI
          </div>
          <p className="mt-2 text-lg font-bold">Seu treino recomendado</p>
          <div className="mt-4 flex items-center gap-4 rounded-xl bg-brand-muted p-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-gradient-brand text-brand-foreground">
              <Sparkles className="size-5" />
            </span>
            <div>
              <p className="font-semibold text-brand">
                {RECOMMENDED_WORKOUT.title} — {RECOMMENDED_WORKOUT.distanceKm} km
              </p>
              <p className="text-xs text-muted-foreground">
                {RECOMMENDED_WORKOUT.estimatedMinutes} min · Intensidade {RECOMMENDED_WORKOUT.intensity}
              </p>
            </div>
          </div>
          <Button className="mt-4 w-full" asChild>
            <Link href="/map?mode=record&type=corrida">
              Começar treino
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <p className="font-semibold">Resumo semanal</p>
        <WeeklySummaryChart week={week} />
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <p className="font-semibold">Últimas atividades</p>
          <Link href="/activities" className="text-sm font-medium text-brand hover:underline">
            Ver todas
          </Link>
        </div>
        {activities.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
            <p className="font-semibold">Nenhuma atividade ainda</p>
            <p className="mt-1 text-sm text-muted-foreground">Grave sua primeira atividade para vê-la aqui.</p>
            <Button className="mt-4" asChild>
              <Link href="/map">Iniciar atividade</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.slice(0, 3).map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <Trophy className="size-4 text-warning" />
              Desafio em destaque
            </p>
            <p className="mt-1 text-lg font-bold">{CURRENT_CHALLENGE.name}</p>
          </div>
          <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            {CURRENT_CHALLENGE.participants.toLocaleString("pt-BR")} participantes
          </span>
        </div>

        <div className="mt-4 space-y-2">
          <Progress value={challengePercent} />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>
              {CURRENT_CHALLENGE.progressKm} / {CURRENT_CHALLENGE.goalKm} km
            </span>
            <span className="font-medium text-brand">{challengePercent}%</span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Users className="size-4" />
            {CURRENT_CHALLENGE.status === "participando"
              ? `Você está participando · #${CURRENT_CHALLENGE.rank} no ranking`
              : "Você ainda não participa deste desafio"}
          </span>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/challenges/${CURRENT_CHALLENGE.id}`}>
              {CURRENT_CHALLENGE.status === "participando" ? "Ver desafio" : "Participar"}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
