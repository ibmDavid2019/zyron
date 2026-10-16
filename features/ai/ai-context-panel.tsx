"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Bike, ChevronDown, Dumbbell, Footprints, ListChecks, Moon, PersonStanding, Target } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { StatTile } from "@/components/shared/stat-tile";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { parseStrengthSplitKey, STRENGTH_SPLITS } from "@/constants/strength-workouts";
import { DEFAULT_ACTIVE_PLAN_ID } from "@/features/training-plans/training-plans-page";
import { STRENGTH_PLAN_IDS } from "@/features/ai/mock-responses";
import { CURRENT_USER, MOCK_TRAINING_PLANS, NEXT_GOAL, WEEKLY_TRAINING_PLAN } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import type { Activity } from "@/types/activity";
import type { WeeklyPlanDay } from "@/types/ai";
import type { TrainingLevel, TrainingPlan } from "@/types/training-plan";
import { getWeeklySummary } from "@/utils/activity-stats";
import { formatDistance } from "@/utils/format";
import {
  getActivePlanId,
  getPlanOverrides,
  getSavedActivities,
  getWeeklyPlanOverride,
  saveWeeklyPlanOverride,
  WEEKLY_PLAN_CHANGED_EVENT,
} from "@/utils/local-store";

/** Mirrors mock-responses.ts's resolveActivePlan — kept local since that file is chat-specific and this panel isn't a chat concern. */
function resolveActivePlan(): TrainingPlan | null {
  const storedId = getActivePlanId();
  if (storedId === null) return null;
  const id = storedId ?? DEFAULT_ACTIVE_PLAN_ID;
  const plan = MOCK_TRAINING_PLANS.find((p) => p.id === id);
  if (!plan) return null;
  return { ...plan, ...getPlanOverrides()[id] };
}

/** Which level's exercise list to show for a strength day — the active plan's level when it's actually one of the musculação plans, "Iniciante" otherwise (same fallback mock-responses.ts uses when creating these days). */
function resolveStrengthLevel(activePlan: TrainingPlan | null): TrainingLevel {
  if (activePlan && STRENGTH_PLAN_IDS[activePlan.level] === activePlan.id) return activePlan.level;
  return "Iniciante";
}

const WEEKEND_DAYS = ["Sábado", "Domingo"];

const BASE_ACTIVITY_OPTIONS = [
  { activity: "Descanso", icon: Moon, isRest: true },
  { activity: "Corrida", icon: Footprints, isRest: false },
  { activity: "Caminhada", icon: PersonStanding, isRest: false },
  { activity: "Ciclismo", icon: Bike, isRest: false },
] as const;

/** Finds the closest matching option for whatever free-text activity a day currently has (e.g. "Corrida leve" or "Treino intervalado" both read as "Corrida" here) — falls back to "Corrida" only when nothing else matches and it isn't a rest/strength day. */
function optionFor(day: WeeklyPlanDay): { activity: string; icon: typeof Dumbbell; isRest: boolean } {
  if (day.isRest) return BASE_ACTIVITY_OPTIONS[0];
  const splitKey = parseStrengthSplitKey(day.activity);
  if (splitKey) return { activity: `Musculação ${splitKey}`, icon: Dumbbell, isRest: false };
  const lower = day.activity.toLowerCase();
  return (
    BASE_ACTIVITY_OPTIONS.find((o) => o.activity !== "Descanso" && lower.includes(o.activity.toLowerCase())) ?? BASE_ACTIVITY_OPTIONS[1]
  );
}

export function AiContextPanel() {
  // Starts empty — a brand-new account has no real activity yet.
  const [activities, setActivities] = useState<Activity[]>([]);
  const week = getWeeklySummary(activities);
  const weeklyDistanceKm = week.reduce((sum, d) => sum + d.distanceKm, 0);
  const weeklyCount = week.reduce((sum, d) => sum + d.count, 0);
  const totalKm = activities.reduce((sum, a) => sum + a.distanceKm, 0);
  const goalPercent = Math.min(Math.round((totalKm / NEXT_GOAL.targetKm) * 100), 100);

  // Renders the static weekly plan first so SSR and first paint match, then
  // layers in any localStorage override (e.g. from a Zyron AI chat request,
  // or from tapping a day right here) once mounted — and stays live if that
  // changes again while this is open.
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlanDay[]>(WEEKLY_TRAINING_PLAN);
  const [activePlan, setActivePlan] = useState<TrainingPlan | null>(null);
  const [detailDay, setDetailDay] = useState<WeeklyPlanDay | null>(null);

  useEffect(() => {
    function refresh() {
      setWeeklyPlan(getWeeklyPlanOverride() ?? WEEKLY_TRAINING_PLAN);
      setActivePlan(resolveActivePlan());
    }
    const timeout = setTimeout(() => {
      refresh();
      setActivities(getSavedActivities());
    }, 0);
    window.addEventListener(WEEKLY_PLAN_CHANGED_EVENT, refresh);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener(WEEKLY_PLAN_CHANGED_EVENT, refresh);
    };
  }, []);

  const strengthLevel = resolveStrengthLevel(activePlan);
  const splits = STRENGTH_SPLITS[strengthLevel];

  function applyPlan(next: WeeklyPlanDay[]) {
    setWeeklyPlan(next);
    saveWeeklyPlanOverride(next);
    toast.success("Dias de treino atualizados.");
  }

  function setDayActivity(day: string, option: { activity: string; isRest: boolean }) {
    const splitMatch = /^Musculação ([ABC])$/.exec(option.activity);
    if (splitMatch) {
      const key = splitMatch[1] as "A" | "B" | "C";
      const splitDay = splits.find((d) => d.key === key);
      if (!splitDay) return;
      applyPlan(
        weeklyPlan.map((d) =>
          d.day === day ? { ...d, activity: `Musculação ${key} (${splitDay.focus})`, isRest: false, level: strengthLevel } : d
        )
      );
      return;
    }
    applyPlan(weeklyPlan.map((d) => (d.day === day ? { ...d, activity: option.activity, isRest: option.isRest } : d)));
  }

  function applyWeekdaysPreset() {
    applyPlan(
      weeklyPlan.map((d) => {
        if (WEEKEND_DAYS.includes(d.day)) return { ...d, activity: "Descanso", isRest: true };
        return d.isRest ? { ...d, activity: "Corrida", isRest: false } : d;
      })
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-card p-5">
        <p className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
          <Target className="size-4 text-brand" />
          Objetivo atual
        </p>
        <p className="mt-1 font-semibold">{NEXT_GOAL.label}</p>
        <p className="mt-1 text-xs text-muted-foreground">{goalPercent}% concluído</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatTile icon={Target} label="Nível" value={String(CURRENT_USER.level)} className="p-3" />
        <StatTile icon={Target} label="Freq. semanal" value={`${weeklyCount}x`} className="p-3" />
        <StatTile icon={Target} label="Dist. semanal" value={formatDistance(weeklyDistanceKm)} className="p-3" />
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <p className="font-semibold">Plano de treino</p>
          <Link href="/training-plans" className="flex items-center gap-1 text-xs font-medium text-brand hover:underline">
            Ver planos
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
        {activePlan && (
          <p className="mt-1 text-xs text-muted-foreground">
            Ativo: <span className="font-medium text-foreground">{activePlan.name}</span> · {activePlan.goal}
          </p>
        )}

        <div className="mt-3 flex items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">Toque num dia para mudar a atividade.</p>
          <Button size="sm" variant="outline" className="shrink-0" onClick={applyWeekdaysPreset}>
            Segunda a sexta
          </Button>
        </div>

        <ul className="mt-2">
          {weeklyPlan.map((day) => {
            const current = optionFor(day);
            const splitKey = parseStrengthSplitKey(day.activity);
            return (
              <li key={day.day} className="flex items-center gap-1">
                {splitKey && (
                  <button
                    onClick={() => setDetailDay(day)}
                    aria-label={`Ver treino de ${day.day}`}
                    className="flex size-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-brand"
                  >
                    <ListChecks className="size-4" />
                  </button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="-mx-1.5 flex flex-1 items-center justify-between rounded-lg px-1.5 py-1.5 text-sm transition-colors hover:bg-muted">
                      <span className="text-muted-foreground">{day.day}</span>
                      <span
                        className={cn(
                          "flex items-center gap-1.5 font-medium",
                          day.isRest ? "text-muted-foreground" : "text-brand"
                        )}
                      >
                        <current.icon className="size-3.5" />
                        {current.activity}
                        <ChevronDown className="size-3.5" />
                      </span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuRadioGroup
                      value={current.activity}
                      onValueChange={(value) => {
                        const base = BASE_ACTIVITY_OPTIONS.find((o) => o.activity === value);
                        if (base) {
                          setDayActivity(day.day, base);
                          return;
                        }
                        if (/^Musculação [ABC]$/.test(value)) setDayActivity(day.day, { activity: value, isRest: false });
                      }}
                    >
                      {BASE_ACTIVITY_OPTIONS.map((option) => (
                        <DropdownMenuRadioItem key={option.activity} value={option.activity} className="gap-2">
                          <option.icon className="size-4" />
                          {option.activity}
                        </DropdownMenuRadioItem>
                      ))}
                      {splits.map((splitDay) => (
                        <DropdownMenuRadioItem key={splitDay.key} value={`Musculação ${splitDay.key}`} className="gap-2">
                          <Dumbbell className="size-4" />
                          Musculação {splitDay.key}
                          <span className="text-xs text-muted-foreground">({splitDay.focus})</span>
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </li>
            );
          })}
        </ul>
      </div>

      <Dialog open={detailDay !== null} onOpenChange={(open) => !open && setDetailDay(null)}>
        <DialogContent className="max-w-md">
          {detailDay &&
            (() => {
              const splitKey = parseStrengthSplitKey(detailDay.activity);
              const level = detailDay.level ?? strengthLevel;
              const splitDay = splitKey ? STRENGTH_SPLITS[level].find((d) => d.key === splitKey) : null;
              return (
                <>
                  <DialogHeader>
                    <DialogTitle>
                      {detailDay.day} · Musculação {splitKey}
                    </DialogTitle>
                  </DialogHeader>
                  {splitDay ? (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        {splitDay.focus} · Nível {level}
                      </p>
                      <ul className="space-y-2">
                        {splitDay.exercises.split(", ").map((exercise) => (
                          <li
                            key={exercise}
                            className="flex items-center gap-2.5 rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-sm"
                          >
                            <Dumbbell className="size-4 shrink-0 text-brand" />
                            {exercise}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Não foi possível carregar os exercícios deste treino.</p>
                  )}
                </>
              );
            })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
