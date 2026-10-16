"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PlanCard, type PlanStatus } from "@/features/training-plans/plan-card";
import type { TrainingPlan } from "@/types/training-plan";
import { deactivateActivePlan, getActivePlanId, getPlanOverrides, savePlanOverride, setActivePlanId } from "@/utils/local-store";

const ACTIVE_PLAN_CURRENT_WEEK = 3;
/** Which plan is "active" before the user (or the AI chat) has ever touched it — kept in sync with mock-responses.ts, which needs the same default to know what plan it's working with. */
export const DEFAULT_ACTIVE_PLAN_ID = "tp3";

export function TrainingPlansPage({ plans: initialPlans }: { plans: TrainingPlan[] }) {
  const [statuses, setStatuses] = useState<Record<string, PlanStatus>>(() => ({
    [DEFAULT_ACTIVE_PLAN_ID]: "ativo",
  }));
  const [overrides, setOverrides] = useState<Record<string, Partial<TrainingPlan>>>({});

  // The active plan (and any edits) can also come from the Zyron AI chat —
  // pick up whatever's in localStorage once mounted, in case it changed
  // elsewhere, without disturbing the default while nothing's been touched.
  useEffect(() => {
    const timeout = setTimeout(() => {
      setOverrides(getPlanOverrides());

      const storedId = getActivePlanId();
      if (storedId === undefined) return;
      setStatuses((prev) => {
        const next: Record<string, PlanStatus> = {};
        for (const key of Object.keys(prev)) {
          next[key] = prev[key] === "ativo" ? "meu" : prev[key];
        }
        return storedId ? { ...next, [storedId]: "ativo" } : next;
      });
    }, 0);
    return () => clearTimeout(timeout);
  }, []);

  function statusOf(id: string): PlanStatus {
    return statuses[id] ?? "disponivel";
  }

  function withOverrides(plan: TrainingPlan): TrainingPlan {
    return { ...plan, ...overrides[plan.id] };
  }

  function handleStart(id: string) {
    setStatuses((prev) => ({ ...prev, [id]: "meu" }));
    toast.success("Plano adicionado aos seus planos!");
  }

  function handleActivate(id: string) {
    setStatuses((prev) => {
      const next: Record<string, PlanStatus> = {};
      for (const key of Object.keys(prev)) {
        next[key] = prev[key] === "ativo" ? "meu" : prev[key];
      }
      return { ...next, [id]: "ativo" };
    });
    setActivePlanId(id);
    toast.success("Plano ativado!");
  }

  function handleDeactivate(id: string) {
    setStatuses((prev) => ({ ...prev, [id]: "meu" }));
    deactivateActivePlan();
    toast.info("Plano desativado.");
  }

  function handleEdit(id: string, partial: Partial<TrainingPlan>) {
    savePlanOverride(id, partial);
    setOverrides((prev) => ({ ...prev, [id]: { ...prev[id], ...partial } }));
    toast.success("Plano atualizado!");
  }

  const activePlan = initialPlans.map(withOverrides).find((p) => statusOf(p.id) === "ativo");
  const myPlans = initialPlans.filter((p) => statusOf(p.id) !== "disponivel").map(withOverrides);
  const recommended = initialPlans.filter((p) => statusOf(p.id) === "disponivel").map(withOverrides);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Planos de treino</h1>
        <p className="text-muted-foreground">Planos estruturados para evoluir com consistência.</p>
      </div>

      {activePlan && (
        <div className="bg-gradient-brand rounded-2xl p-5 text-brand-foreground sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="flex items-center gap-1.5 text-xs font-medium text-brand-foreground/80">
                <Sparkles className="size-3.5" />
                Plano ativo
              </p>
              <p className="mt-1 text-xl font-bold">{activePlan.name}</p>
              <p className="mt-1 text-sm text-brand-foreground/80">{activePlan.description}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="shrink-0 text-brand-foreground hover:bg-white/10 hover:text-brand-foreground"
              onClick={() => handleDeactivate(activePlan.id)}
            >
              Desativar
            </Button>
          </div>
          <div className="mt-4 space-y-1.5">
            <Progress value={(ACTIVE_PLAN_CURRENT_WEEK / activePlan.durationWeeks) * 100} />
            <p className="text-xs text-brand-foreground/80">
              Semana {ACTIVE_PLAN_CURRENT_WEEK} de {activePlan.durationWeeks}
            </p>
          </div>
        </div>
      )}

      {myPlans.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-semibold">Meus planos</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {myPlans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                status={statusOf(plan.id)}
                onStart={handleStart}
                onActivate={handleActivate}
                onDeactivate={handleDeactivate}
                onEdit={handleEdit}
              />
            ))}
          </div>
        </section>
      )}

      <section className="space-y-4">
        <h2 className="font-semibold">Planos recomendados</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recommended.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              status={statusOf(plan.id)}
              onStart={handleStart}
              onActivate={handleActivate}
              onDeactivate={handleDeactivate}
              onEdit={handleEdit}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
